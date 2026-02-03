import multer from 'multer';
import sharp from 'sharp';
import AWS from 'aws-sdk';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// File type configurations
export const FILE_TYPES = {
  IMAGE: {
    mimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    maxSize: 5 * 1024 * 1024, // 5MB
    extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp']
  },
  DOCUMENT: {
    mimeTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    maxSize: 10 * 1024 * 1024, // 10MB
    extensions: ['.pdf', '.doc', '.docx']
  },
  VIDEO: {
    mimeTypes: ['video/mp4', 'video/avi', 'video/mov', 'video/wmv'],
    maxSize: 100 * 1024 * 1024, // 100MB
    extensions: ['.mp4', '.avi', '.mov', '.wmv']
  },
  AUDIO: {
    mimeTypes: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
    maxSize: 20 * 1024 * 1024, // 20MB
    extensions: ['.mp3', '.wav', '.ogg']
  }
};

// Multer configuration for local storage (fallback)
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', file.fieldname);
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error as Error, '');
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File filter
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const fileType = Object.values(FILE_TYPES).find(type => 
    type.mimeTypes.includes(file.mimetype) && 
    type.extensions.includes(path.extname(file.originalname).toLowerCase())
  );

  if (fileType) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'));
  }
};

// Multer instance
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max
    files: 10 // Max 10 files
  }
});

// File processing service
export class FileUploadService {
  private bucketName: string;

  constructor() {
    this.bucketName = process.env.AWS_S3_BUCKET || 'edumanager-uploads';
  }

  // Upload file to S3
  async uploadToS3(file: Express.Multer.File, folder: string = 'general'): Promise<string> {
    const fileKey = `${folder}/${uuidv4()}-${file.originalname}`;
    
    const params = {
      Bucket: this.bucketName,
      Key: fileKey,
      Body: await fs.readFile(file.path),
      ContentType: file.mimetype,
      ACL: 'public-read'
    };

    try {
      const result = await s3.upload(params).promise();
      
      // Clean up local file
      await fs.unlink(file.path);
      
      return result.Location;
    } catch (error) {
      throw new Error(`Failed to upload to S3: ${error}`);
    }
  }

  // Process image with Sharp
  async processImage(file: Express.Multer.File, options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'jpeg' | 'png' | 'webp';
  } = {}): Promise<Buffer> {
    let image = sharp(file.buffer || await fs.readFile(file.path));

    if (options.width || options.height) {
      image = image.resize(options.width, options.height, {
        fit: 'inside',
        withoutEnlargement: true
      });
    }

    if (options.format) {
      image = image.toFormat(options.format, {
        quality: options.quality || 80
      });
    }

    return image.toBuffer();
  }

  // Generate thumbnails for images
  async generateThumbnail(file: Express.Multer.File): Promise<string> {
    const thumbnailBuffer = await this.processImage(file, {
      width: 300,
      height: 300,
      quality: 70,
      format: 'jpeg'
    });

    const thumbnailKey = `thumbnails/${uuidv4()}-thumb.jpg`;
    
    const params = {
      Bucket: this.bucketName,
      Key: thumbnailKey,
      Body: thumbnailBuffer,
      ContentType: 'image/jpeg',
      ACL: 'public-read'
    };

    try {
      const result = await s3.upload(params).promise();
      return result.Location;
    } catch (error) {
      throw new Error(`Failed to generate thumbnail: ${error}`);
    }
  }

  // Delete file from S3
  async deleteFromS3(fileUrl: string): Promise<void> {
    try {
      const fileKey = fileUrl.split('/').pop();
      if (!fileKey) return;

      await s3.deleteObject({
        Bucket: this.bucketName,
        Key: fileKey
      }).promise();
    } catch (error) {
      throw new Error(`Failed to delete from S3: ${error}`);
    }
  }

  // Get file info
  async getFileInfo(fileUrl: string): Promise<any> {
    try {
      const fileKey = fileUrl.split('/').pop();
      if (!fileKey) throw new Error('Invalid file URL');

      const headObject = await s3.headObject({
        Bucket: this.bucketName,
        Key: fileKey
      }).promise();

      return {
        url: fileUrl,
        size: headObject.ContentLength,
        lastModified: headObject.LastModified,
        contentType: headObject.ContentType,
        etag: headObject.ETag
      };
    } catch (error) {
      throw new Error(`Failed to get file info: ${error}`);
    }
  }

  // Upload multiple files
  async uploadMultipleFiles(files: Express.Multer.File[], folder: string = 'general'): Promise<string[]> {
    const uploadPromises = files.map(file => this.uploadToS3(file, folder));
    return Promise.all(uploadPromises);
  }

  // Validate file type and size
  validateFile(file: Express.Multer.File, type: keyof typeof FILE_TYPES): boolean {
    const fileType = FILE_TYPES[type];
    
    if (!fileType.mimeTypes.includes(file.mimetype)) {
      return false;
    }
    
    if (file.size > fileType.maxSize) {
      return false;
    }
    
    return true;
  }

  // Get file extension
  getFileExtension(filename: string): string {
    return path.extname(filename).toLowerCase();
  }

  // Generate unique filename
  generateUniqueFilename(originalName: string): string {
    const ext = this.getFileExtension(originalName);
    const name = path.basename(originalName, ext);
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1E9);
    
    return `${name}-${timestamp}-${random}${ext}`;
  }

  // Create upload directory if not exists
  async ensureUploadDir(dir: string): Promise<void> {
    try {
      await fs.access(dir);
    } catch {
      await fs.mkdir(dir, { recursive: true });
    }
  }
}

// PDF generation service
export class PDFService {
  private fileService: FileUploadService;

  constructor() {
    this.fileService = new FileUploadService();
  }

  // Generate PDF from data
  async generatePDF(data: any, template: string = 'default'): Promise<string> {
    // This would use pdf-lib to generate PDFs
    // For now, return a placeholder
    const { PDFDocument, rgb } = require('pdf-lib');
    
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([612, 792]);
    
    // Add content based on template
    page.drawText('EduManager Report', {
      x: 50,
      y: 700,
      size: 24,
      color: rgb(0, 0, 0),
    });

    const pdfBytes = await pdfDoc.save();
    
    // Save to temporary file and upload
    const tempPath = path.join(process.cwd(), 'temp', `report-${Date.now()}.pdf`);
    await this.fileService.ensureUploadDir(path.dirname(tempPath));
    await fs.writeFile(tempPath, pdfBytes);
    
    // Upload to S3
    const fileUrl = await this.fileService.uploadToS3({
      path: tempPath,
      originalname: `report-${Date.now()}.pdf`,
      mimetype: 'application/pdf',
      size: pdfBytes.length
    } as Express.Multer.File, 'reports');
    
    // Clean up temp file
    await fs.unlink(tempPath);
    
    return fileUrl;
  }

  // Generate student report card
  async generateReportCard(studentId: number, semester: string): Promise<string> {
    // Fetch student data and grades
    // Generate PDF report card
    return this.generatePDF({
      studentId,
      semester,
      type: 'report-card'
    }, 'report-card');
  }

  // Generate attendance report
  async generateAttendanceReport(classId: number, startDate: Date, endDate: Date): Promise<string> {
    return this.generatePDF({
      classId,
      startDate,
      endDate,
      type: 'attendance'
    }, 'attendance');
  }
}

// Excel export service
export class ExcelService {
  private fileService: FileUploadService;

  constructor() {
    this.fileService = new FileUploadService();
  }

  // Export data to Excel
  async exportToExcel(data: any[], filename: string, sheetName: string = 'Sheet1'): Promise<string> {
    const ExcelJS = require('exceljs');
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(sheetName);

    // Add headers
    if (data.length > 0) {
      const headers = Object.keys(data[0]);
      worksheet.addRow(headers);

      // Add data
      data.forEach(row => {
        worksheet.addRow(Object.values(row));
      });

      // Style headers
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };
    }

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    
    // Save to temporary file and upload
    const tempPath = path.join(process.cwd(), 'temp', `${filename}-${Date.now()}.xlsx`);
    await this.fileService.ensureUploadDir(path.dirname(tempPath));
    await fs.writeFile(tempPath, buffer);
    
    // Upload to S3
    const fileUrl = await this.fileService.uploadToS3({
      path: tempPath,
      originalname: `${filename}.xlsx`,
      mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      size: buffer.length
    } as Express.Multer.File, 'exports');
    
    // Clean up temp file
    await fs.unlink(tempPath);
    
    return fileUrl;
  }

  // Export student grades
  async exportStudentGrades(classId: number, subjectId?: number): Promise<string> {
    // Fetch grades data
    // Generate Excel file
    return this.exportToExcel([], `grades-class-${classId}`, 'Grades');
  }

  // Export attendance data
  async exportAttendanceData(classId: number, month: string): Promise<string> {
    return this.exportToExcel([], `attendance-${classId}-${month}`, 'Attendance');
  }
}

export { FileUploadService, PDFService, ExcelService };
