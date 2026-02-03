import { Request, Response } from 'express';
import { DocumentAnalysisAI } from '@/services/documentAnalysisAI';
import multer from 'multer';
import path from 'path';

export class DocumentAnalysisController {
  private documentAI: DocumentAnalysisAI;
  private upload: multer.Multer;

  constructor() {
    this.documentAI = new DocumentAnalysisAI();
    
    // Configure multer for file uploads
    this.upload = multer({
      storage: multer.diskStorage({
        destination: (req, file, cb) => {
          cb(null, 'uploads/documents/');
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
          cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
        }
      }),
      limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
      },
      fileFilter: (req, file, cb) => {
        const allowedTypes = ['.txt', '.pdf', '.docx', '.html', '.htm'];
        const fileExtension = path.extname(file.originalname).toLowerCase();
        
        if (allowedTypes.includes(fileExtension)) {
          cb(null, true);
        } else {
          cb(new Error('Invalid file type. Only TXT, PDF, DOCX, HTML files are allowed.'));
        }
      }
    });
  }

  // Upload and analyze document
  async uploadDocument(req: Request, res: Response) {
    try {
      const uploadHandler = this.upload.single('document');
      
      uploadHandler(req, res, async (err) => {
        if (err) {
          return res.status(400).json({
            success: false,
            error: err.message
          });
        }

        if (!req.file) {
          return res.status(400).json({
            success: false,
            error: 'No file uploaded'
          });
        }

        try {
          const { subject, topic, contentType } = req.body;
          
          if (!subject || !topic || !contentType) {
            return res.status(400).json({
              success: false,
              error: 'Subject, topic, and contentType are required'
            });
          }

          const result = await this.documentAI.uploadAndAnalyzeDocument(
            req.file.path,
            req.file.originalname,
            subject,
            topic,
            contentType
          );

          res.json({
            success: true,
            data: {
              fileId: req.file.filename,
              originalName: req.file.originalname,
              size: req.file.size,
              ...result
            }
          });
        } catch (error: any) {
          res.status(500).json({
            success: false,
            error: error.message
          });
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Search knowledge graph
  async searchKnowledge(req: Request, res: Response) {
    try {
      const { query, subject } = req.query;

      if (!query) {
        return res.status(400).json({
          success: false,
          error: 'Query parameter is required'
        });
      }

      const results = await this.documentAI.searchKnowledge(
        query as string,
        subject as string
      );

      res.json({
        success: true,
        data: {
          query,
          subject: subject || 'all',
          results,
          count: results.length
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get learning path
  async getLearningPath(req: Request, res: Response) {
    try {
      const { subject, topic } = req.params;

      if (!subject || !topic) {
        return res.status(400).json({
          success: false,
          error: 'Subject and topic are required'
        });
      }

      const learningPath = await this.documentAI.getLearningPath(
        subject,
        topic
      );

      if (!learningPath) {
        return res.status(404).json({
          success: false,
          error: 'Learning path not found'
        });
      }

      res.json({
        success: true,
        data: learningPath
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get assessment questions
  async getAssessmentQuestions(req: Request, res: Response) {
    try {
      const { subject, topic } = req.params;
      const { difficulty, count = 10 } = req.query;

      if (!subject || !topic) {
        return res.status(400).json({
          success: false,
          error: 'Subject and topic are required'
        });
      }

      const questions = await this.documentAI.getAssessmentQuestions(
        subject,
        topic,
        difficulty ? parseInt(difficulty as string) : undefined,
        parseInt(count as string)
      );

      res.json({
        success: true,
        data: {
          subject,
          topic,
          difficulty: difficulty || 'mixed',
          count: questions.length,
          questions
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Generate personalized quiz
  async generatePersonalizedQuiz(req: Request, res: Response) {
    try {
      const { studentId, subject, topics, difficulty } = req.body;

      if (!studentId || !subject || !topics) {
        return res.status(400).json({
          success: false,
          error: 'Student ID, subject, and topics are required'
        });

        if (!Array.isArray(topics)) {
          return res.status(400).json({
            success: false,
            error: 'Topics must be an array'
          });
        }
      }

      const quiz = await this.documentAI.generatePersonalizedQuiz(
        parseInt(studentId),
        subject,
        topics,
        difficulty ? parseInt(difficulty) : 5
      );

      res.json({
        success: true,
        data: quiz
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get document statistics
  async getDocumentStatistics(req: Request, res: Response) {
    try {
      const stats = await this.documentAI.getDocumentStatistics();

      res.json({
        success: true,
        data: stats
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get document list (mock implementation)
  async getDocumentList(req: Request, res: Response) {
    try {
      const { subject, page = 1, limit = 20 } = req.query;

      // Mock data - in real implementation, query database
      const documents = [
        {
          id: 'doc1',
          filename: 'Giai_Tich_1.pdf',
          subject: 'toan',
          topic: 'Giai tích cơ bản',
          contentType: 'textbook',
          uploadedAt: new Date('2024-01-15'),
          size: 2048576,
          knowledgeNodes: 45,
          questions: 20
        },
        {
          id: 'doc2',
          filename: 'Vat_Ly_Co_Hoc.docx',
          subject: 'vatly',
          topic: 'Cơ học Newton',
          contentType: 'lecture',
          uploadedAt: new Date('2024-01-20'),
          size: 1536000,
          knowledgeNodes: 32,
          questions: 15
        }
      ];

      let filteredDocuments = documents;
      
      if (subject) {
        filteredDocuments = documents.filter(doc => doc.subject === subject);
      }

      const startIndex = (parseInt(page as string) - 1) * parseInt(limit as string);
      const paginatedDocuments = filteredDocuments.slice(startIndex, startIndex + parseInt(limit as string));

      res.json({
        success: true,
        data: {
          documents: paginatedDocuments,
          pagination: {
            page: parseInt(page as string),
            limit: parseInt(limit as string),
            total: filteredDocuments.length,
            totalPages: Math.ceil(filteredDocuments.length / parseInt(limit as string))
          }
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Delete document
  async deleteDocument(req: Request, res: Response) {
    try {
      const { documentId } = req.params;

      if (!documentId) {
        return res.status(400).json({
          success: false,
          error: 'Document ID is required'
        });
      }

      // In real implementation, delete from database and file system
      // await this.documentAI.deleteDocument(documentId);

      res.json({
        success: true,
        message: 'Document deleted successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get document details
  async getDocumentDetails(req: Request, res: Response) {
    try {
      const { documentId } = req.params;

      if (!documentId) {
        return res.status(400).json({
          success: false,
          error: 'Document ID is required'
        });
      }

      // Mock data - in real implementation, query database
      const document = {
        id: documentId,
        filename: 'Giai_Tich_1.pdf',
        subject: 'toan',
        topic: 'Giai tích cơ bản',
        contentType: 'textbook',
        uploadedAt: new Date('2024-01-15'),
        size: 2048576,
        knowledgeNodes: 45,
        questions: 20,
        structure: {
          chapters: 8,
          sections: 32,
          keyPoints: 120,
          examples: 45,
          exercises: 25
        },
        analysis: {
          knowledgeDensity: 15.2,
          complexity: 'medium',
          prerequisites: ['Đại số', 'Hàm số']
        }
      };

      res.json({
        success: true,
        data: document
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

export { DocumentAnalysisController };
