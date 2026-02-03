import { prisma } from '@/index';
import { FileUploadService } from './fileUploadService';
import { cacheService } from './cacheService';
import { auditService } from './auditService';
import * as XLSX from 'xlsx';
import * as csv from 'csv-parser';
import * as fs from 'fs';
import * as path from 'path';

export interface ExportConfig {
  entity: 'students' | 'teachers' | 'classes' | 'grades' | 'attendance' | 'subjects' | 'users';
  format: 'excel' | 'csv' | 'json';
  filters?: Record<string, any>;
  fields?: string[];
  includeRelations?: boolean;
  dateRange?: {
    from: Date;
    to: Date;
  };
}

export interface ImportConfig {
  entity: 'students' | 'teachers' | 'classes' | 'grades' | 'attendance' | 'subjects' | 'users';
  format: 'excel' | 'csv' | 'json';
  mapping: Record<string, string>;
  validation: {
    required: string[];
    unique: string[];
    format: Record<string, RegExp>;
  };
  skipDuplicates?: boolean;
  updateExisting?: boolean;
}

export interface ImportResult {
  totalRows: number;
  successRows: number;
  failedRows: number;
  errors: Array<{
    row: number;
    field: string;
    message: string;
    value: any;
  }>;
  warnings: Array<{
    row: number;
    message: string;
  }>;
}

export interface ExportResult {
  fileName: string;
  fileSize: number;
  downloadUrl: string;
  recordCount: number;
  exportedAt: Date;
}

export class DataImportExportService {
  private fileUploadService: FileUploadService;

  constructor() {
    this.fileUploadService = new FileUploadService();
  }

  // Export data
  async exportData(config: ExportConfig): Promise<ExportResult> {
    try {
      const data = await this.fetchData(config);
      const processedData = this.processExportData(data, config);
      const buffer = await this.generateExportFile(processedData, config);
      
      const fileName = `${config.entity}_export_${Date.now()}.${config.format}`;
      const fileUrl = await this.fileUploadService.uploadFile(buffer, 'export', {
        fileName,
        entityType: config.entity
      });

      const result: ExportResult = {
        fileName,
        fileSize: buffer.length,
        downloadUrl: fileUrl,
        recordCount: Array.isArray(processedData) ? processedData.length : 1,
        exportedAt: new Date()
      };

      // Log audit
      await auditService.logUserAction(
        1, // This would be the user ID
        'USER',
        'EXPORT',
        config.entity.toUpperCase(),
        undefined,
        { config, recordCount: result.recordCount }
      );

      return result;
    } catch (error) {
      console.error('Export error:', error);
      throw error;
    }
  }

  // Import data
  async importData(config: ImportConfig, filePath: string): Promise<ImportResult> {
    try {
      const rawData = await this.readImportFile(filePath, config.format);
      const validatedData = await this.validateImportData(rawData, config);
      const result = await this.processImportData(validatedData, config);

      // Log audit
      await auditService.logUserAction(
        1, // This would be the user ID
        'USER',
        'IMPORT',
        config.entity.toUpperCase(),
        undefined,
        { 
          config, 
          totalRows: result.totalRows,
          successRows: result.successRows,
          failedRows: result.failedRows
        }
      );

      return result;
    } catch (error) {
      console.error('Import error:', error);
      throw error;
    }
  }

  // Get export templates
  getExportTemplates(): Array<{
    entity: string;
    name: string;
    description: string;
    defaultFields: string[];
    availableFilters: string[];
  }> {
    return [
      {
        entity: 'students',
        name: 'Danh sách học sinh',
        description: 'Xuất danh sách học sinh với thông tin chi tiết',
        defaultFields: ['code', 'fullName', 'email', 'phone', 'className', 'status'],
        availableFilters: ['classId', 'status', 'gradeLevel', 'dateRange']
      },
      {
        entity: 'teachers',
        name: 'Danh sách giáo viên',
        description: 'Xuất danh sách giáo viên với thông tin chi tiết',
        defaultFields: ['fullName', 'email', 'phone', 'major', 'subjects', 'status'],
        availableFilters: ['subjectId', 'status', 'major']
      },
      {
        entity: 'classes',
        name: 'Danh sách lớp học',
        description: 'Xuất danh sách lớp học với thông tin chi tiết',
        defaultFields: ['code', 'name', 'gradeLevel', 'academicYear', 'studentCount', 'homeroomTeacher'],
        availableFilters: ['gradeLevel', 'academicYear', 'status']
      },
      {
        entity: 'grades',
        name: 'Bảng điểm',
        description: 'Xuất bảng điểm của học sinh',
        defaultFields: ['studentCode', 'studentName', 'subjectName', 'score', 'maxScore', 'examType', 'date'],
        availableFilters: ['classId', 'subjectId', 'studentId', 'dateRange', 'examType']
      },
      {
        entity: 'attendance',
        name: 'Bảng điểm danh',
        description: 'Xuất bảng điểm danh của học sinh',
        defaultFields: ['studentCode', 'studentName', 'date', 'status', 'notes'],
        availableFilters: ['classId', 'studentId', 'dateRange', 'status']
      },
      {
        entity: 'subjects',
        name: 'Danh sách môn học',
        description: 'Xuất danh sách môn học',
        defaultFields: ['code', 'name', 'credits', 'description', 'teacherName'],
        availableFilters: ['gradeLevel', 'teacherId']
      }
    ];
  }

  // Get import templates
  getImportTemplates(): Array<{
    entity: string;
    name: string;
    description: string;
    requiredFields: string[];
    sampleData: Record<string, any>;
  }> {
    return [
      {
        entity: 'students',
        name: 'Nhập học sinh',
        description: 'Nhập danh sách học sinh từ file Excel/CSV',
        requiredFields: ['code', 'fullName', 'email', 'classId'],
        sampleData: {
          code: 'HS001',
          fullName: 'Nguyễn Văn A',
          email: 'nguyenvana@email.com',
          phone: '0123456789',
          classId: '1',
          dob: '2010-01-01',
          gender: 'MALE'
        }
      },
      {
        entity: 'teachers',
        name: 'Nhập giáo viên',
        description: 'Nhập danh sách giáo viên từ file Excel/CSV',
        requiredFields: ['fullName', 'email', 'major'],
        sampleData: {
          fullName: 'Trần Thị B',
          email: 'tranthib@email.com',
          phone: '0123456789',
          major: 'Toán',
          salary: '15000000'
        }
      },
      {
        entity: 'classes',
        name: 'Nhập lớp học',
        description: 'Nhập danh sách lớp học từ file Excel/CSV',
        requiredFields: ['code', 'name', 'gradeLevel'],
        sampleData: {
          code: 'L1A',
          name: 'Lớp 1A',
          gradeLevel: '1',
          academicYear: '2023-2024',
          homeroomTeacherId: '1'
        }
      },
      {
        entity: 'grades',
        name: 'Nhập điểm',
        description: 'Nhập điểm số từ file Excel/CSV',
        requiredFields: ['studentId', 'subjectId', 'score', 'examType'],
        sampleData: {
          studentId: '1',
          subjectId: '1',
          score: '8.5',
          maxScore: '10',
          examType: 'MIDTERM',
          semester: '1'
        }
      },
      {
        entity: 'attendance',
        name: 'Nhập điểm danh',
        description: 'Nhập điểm danh từ file Excel/CSV',
        requiredFields: ['studentId', 'date', 'status'],
        sampleData: {
          studentId: '1',
          date: '2023-01-01',
          status: 'PRESENT',
          notes: 'Đi học đúng giờ'
        }
      }
    ];
  }

  // Private methods
  private async fetchData(config: ExportConfig): Promise<any[]> {
    const { entity, filters, fields, includeRelations, dateRange } = config;

    let query: any = {};

    // Apply filters
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query[key] = value;
        }
      });
    }

    // Apply date range
    if (dateRange) {
      query.createdAt = {
        gte: dateRange.from,
        lte: dateRange.to
      };
    }

    // Build include relations
    let include: any = {};
    if (includeRelations) {
      switch (entity) {
        case 'students':
          include = {
            user: { select: { email: true, fullName: true } },
            class: { select: { name: true, gradeLevel: true } },
            grades: { include: { subject: { select: { name: true } } } },
            attendance: true
          };
          break;
        case 'teachers':
          include = {
            user: { select: { email: true, fullName: true } },
            subjects: { select: { name: true } },
            classes: { select: { name: true } }
          };
          break;
        case 'classes':
          include = {
            homeroomTeacher: { include: { user: { select: { fullName: true } } } },
            students: { include: { user: { select: { fullName: true } } } }
          };
          break;
        case 'grades':
          include = {
            student: { include: { user: { select: { fullName: true } }, class: { select: { name: true } } } },
            subject: { select: { name: true } }
          };
          break;
        case 'attendance':
          include = {
            student: { include: { user: { select: { fullName: true } }, class: { select: { name: true } } } }
          };
          break;
        case 'subjects':
          include = {
            teachers: { include: { user: { select: { fullName: true } } } }
          };
          break;
      }
    }

    // Select fields
    let select: any = undefined;
    if (fields && fields.length > 0) {
      select = {};
      fields.forEach(field => {
        select[field] = true;
      });
    }

    // Execute query
    const data = await (prisma as any)[entity].findMany({
      where: query,
      include,
      select,
      orderBy: { createdAt: 'desc' }
    });

    return data;
  }

  private processExportData(data: any[], config: ExportConfig): any[] {
    return data.map(item => {
      const processed: any = {};

      // Flatten nested objects
      this.flattenObject(item, processed);

      // Apply field selection
      if (config.fields && config.fields.length > 0) {
        const filtered: any = {};
        config.fields.forEach(field => {
          if (processed[field] !== undefined) {
            filtered[field] = processed[field];
          }
        });
        return filtered;
      }

      return processed;
    });
  }

  private flattenObject(obj: any, result: any = {}, prefix = ''): void {
    Object.keys(obj).forEach(key => {
      const value = obj[key];
      const newKey = prefix ? `${prefix}.${key}` : key;

      if (value && typeof value === 'object' && !Array.isArray(value)) {
        this.flattenObject(value, result, newKey);
      } else {
        result[newKey] = value;
      }
    });
  }

  private async generateExportFile(data: any[], config: ExportConfig): Promise<Buffer> {
    switch (config.format) {
      case 'excel':
        return this.generateExcelFile(data, config.entity);
      case 'csv':
        return this.generateCSVFile(data);
      case 'json':
        return this.generateJSONFile(data);
      default:
        throw new Error(`Unsupported export format: ${config.format}`);
    }
  }

  private generateExcelFile(data: any[], entity: string): Buffer {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    
    // Set column widths
    const colWidths = Object.keys(data[0] || {}).map(() => ({ wch: 15 }));
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, entity);
    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  }

  private generateCSVFile(data: any[]): Buffer {
    if (data.length === 0) {
      return Buffer.from('');
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          return typeof value === 'string' && value.includes(',') 
            ? `"${value}"` 
            : value;
        }).join(',')
      )
    ].join('\n');

    return Buffer.from(csvContent, 'utf-8');
  }

  private generateJSONFile(data: any[]): Buffer {
    return Buffer.from(JSON.stringify(data, null, 2), 'utf-8');
  }

  private async readImportFile(filePath: string, format: string): Promise<any[]> {
    switch (format) {
      case 'excel':
        return this.readExcelFile(filePath);
      case 'csv':
        return this.readCSVFile(filePath);
      case 'json':
        return this.readJSONFile(filePath);
      default:
        throw new Error(`Unsupported import format: ${format}`);
    }
  }

  private async readExcelFile(filePath: string): Promise<any[]> {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_json(worksheet);
  }

  private async readCSVFile(filePath: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const results: any[] = [];
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', reject);
    });
  }

  private async readJSONFile(filePath: string): Promise<any[]> {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  }

  private async validateImportData(data: any[], config: ImportConfig): Promise<{
    valid: any[];
    errors: Array<{ row: number; field: string; message: string; value: any }>;
    warnings: Array<{ row: number; message: string }>;
  }> {
    const valid: any[] = [];
    const errors: Array<{ row: number; field: string; message: string; value: any }> = [];
    const warnings: Array<{ row: number; message: string }> = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowErrors: Array<{ field: string; message: string; value: any }> = [];

      // Check required fields
      config.validation.required.forEach(field => {
        if (!row[field] || row[field] === '') {
          rowErrors.push({
            field,
            message: `${field} is required`,
            value: row[field]
          });
        }
      });

      // Check format validation
      Object.entries(config.validation.format).forEach(([field, regex]) => {
        if (row[field] && !regex.test(row[field])) {
          rowErrors.push({
            field,
            message: `${field} format is invalid`,
            value: row[field]
          });
        }
      });

      // Check unique fields
      if (config.validation.unique.length > 0) {
        for (const field of config.validation.unique) {
          if (row[field]) {
            const existing = await this.checkUniqueField(config.entity, field, row[field]);
            if (existing && !config.updateExisting) {
              rowErrors.push({
                field,
                message: `${field} must be unique`,
                value: row[field]
              });
            }
          }
        }
      }

      // Add row errors
      rowErrors.forEach(error => {
        errors.push({
          row: i + 1,
          ...error
        });
      });

      // Add to valid data if no errors
      if (rowErrors.length === 0) {
        valid.push(row);
      }
    }

    return { valid, errors, warnings };
  }

  private async checkUniqueField(entity: string, field: string, value: any): Promise<boolean> {
    try {
      const existing = await (prisma as any)[entity].findFirst({
        where: { [field]: value }
      });
      return !!existing;
    } catch (error) {
      return false;
    }
  }

  private async processImportData(data: any[], config: ImportConfig): Promise<ImportResult> {
    const result: ImportResult = {
      totalRows: data.length,
      successRows: 0,
      failedRows: 0,
      errors: [],
      warnings: []
    };

    for (let i = 0; i < data.length; i++) {
      try {
        const row = data[i];
        const mappedRow = this.mapFields(row, config.mapping);

        // Check if record exists
        const existing = await this.findExistingRecord(config.entity, mappedRow);

        if (existing && config.updateExisting) {
          // Update existing record
          await (prisma as any)[config.entity].update({
            where: { id: existing.id },
            data: mappedRow
          });
          result.successRows++;
        } else if (!existing) {
          // Create new record
          await (prisma as any)[config.entity].create({
            data: mappedRow
          });
          result.successRows++;
        } else {
          result.failedRows++;
          result.warnings.push({
            row: i + 1,
            message: 'Record already exists and updateExisting is false'
          });
        }
      } catch (error) {
        result.failedRows++;
        result.errors.push({
          row: i + 1,
          field: 'general',
          message: error.message,
          value: data[i]
        });
      }
    }

    return result;
  }

  private mapFields(row: any, mapping: Record<string, string>): any {
    const mapped: any = {};
    
    Object.entries(mapping).forEach(([sourceField, targetField]) => {
      if (row[sourceField] !== undefined) {
        mapped[targetField] = row[sourceField];
      }
    });

    return mapped;
  }

  private async findExistingRecord(entity: string, data: any): Promise<any> {
    try {
      // Try to find by unique fields
      const uniqueFields = ['id', 'code', 'email'];
      
      for (const field of uniqueFields) {
        if (data[field]) {
          const existing = await (prisma as any)[entity].findFirst({
            where: { [field]: data[field] }
          });
          if (existing) {
            return existing;
          }
        }
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  // Get import/export history
  async getHistory(userId: number, options: {
    page?: number;
    limit?: number;
    type?: 'import' | 'export';
    entity?: string;
  } = {}): Promise<{
    records: Array<{
      id: string;
      type: 'import' | 'export';
      entity: string;
      fileName: string;
      status: 'pending' | 'processing' | 'completed' | 'failed';
      recordCount: number;
      createdAt: Date;
      completedAt?: Date;
    }>;
    total: number;
  }> {
    try {
      const { page = 1, limit = 20, type, entity } = options;
      const skip = (page - 1) * limit;

      // In production, this would query a database table
      // For now, we'll return empty results
      return {
        records: [],
        total: 0
      };
    } catch (error) {
      console.error('Error getting history:', error);
      return { records: [], total: 0 };
    }
  }

  // Download sample template
  async downloadSampleTemplate(entity: string, format: 'excel' | 'csv'): Promise<ExportResult> {
    try {
      const template = this.getImportTemplates().find(t => t.entity === entity);
      if (!template) {
        throw new Error(`Template not found for entity: ${entity}`);
      }

      const data = [template.sampleData];
      const buffer = format === 'excel' 
        ? this.generateExcelFile(data, entity)
        : this.generateCSVFile(data);

      const fileName = `${entity}_template.${format}`;
      const fileUrl = await this.fileUploadService.uploadFile(buffer, 'template', {
        fileName,
        entityType: entity
      });

      return {
        fileName,
        fileSize: buffer.length,
        downloadUrl: fileUrl,
        recordCount: 1,
        exportedAt: new Date()
      };
    } catch (error) {
      console.error('Error downloading template:', error);
      throw error;
    }
  }
}

export { DataImportExportService };
