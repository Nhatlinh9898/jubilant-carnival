import { Request, Response } from 'express';
import { ContentGenerationAI } from '@/services/contentGenerationAI';

export class ContentGenerationController {
  private contentAI: ContentGenerationAI;

  constructor() {
    this.contentAI = new ContentGenerationAI();
  }

  // Generate lesson
  async generateLesson(req: Request, res: Response) {
    try {
      const { subject, topic, difficulty, duration, objectives } = req.body;

      if (!subject || !topic) {
        return res.status(400).json({
          success: false,
          error: 'Subject and topic are required'
        });
      }

      const lesson = await this.contentAI.generateLesson(
        subject,
        topic,
        difficulty || 5,
        duration || 1800,
        objectives || []
      );

      res.json({
        success: true,
        data: lesson
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Generate lecture
  async generateLecture(req: Request, res: Response) {
    try {
      const { subject, topic, difficulty, duration, audience, objectives } = req.body;

      if (!subject || !topic) {
        return res.status(400).json({
          success: false,
          error: 'Subject and topic are required'
        });
      }

      const lecture = await this.contentAI.generateLecture(
        subject,
        topic,
        difficulty || 7,
        duration || 2700,
        audience || 'students',
        objectives || []
      );

      res.json({
        success: true,
        data: lecture
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Generate exercise
  async generateExercise(req: Request, res: Response) {
    try {
      const { subject, topic, difficulty, exerciseType, questionCount } = req.body;

      if (!subject || !topic || !exerciseType) {
        return res.status(400).json({
          success: false,
          error: 'Subject, topic, and exercise type are required'
        });
      }

      const exercise = await this.contentAI.generateExercise(
        subject,
        topic,
        difficulty || 5,
        exerciseType,
        questionCount || 10
      );

      res.json({
        success: true,
        data: exercise
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Generate exam
  async generateExam(req: Request, res: Response) {
    try {
      const { subject, topic, difficulty, examType, duration, questionTypes, totalPoints } = req.body;

      if (!subject || !topic || !examType) {
        return res.status(400).json({
          success: false,
          error: 'Subject, topic, and exam type are required'
        });
      }

      const exam = await this.contentAI.generateExam(
        subject,
        topic,
        difficulty || 5,
        examType,
        duration || 4200,
        questionTypes || ['multiple_choice', 'short_answer', 'essay'],
        totalPoints || 100
      );

      res.json({
        success: true,
        data: exam
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Generate content based on template
  async generateFromTemplate(req: Request, res: Response) {
    try {
      const { templateId, topic, duration, objectives } = req.body;

      if (!templateId || !topic) {
        return res.status(400).json({
          success: false,
          error: 'Template ID and topic are required'
        });
      }

      // This would use a predefined template
      const content = await this.contentAI.generateContentFromTemplate(
        templateId,
        topic,
        duration || 1800,
        objectives || []
      );

      res.json({
        success: true,
        data: content
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get development model for user
  async getDevelopmentModel(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'User ID is required'
        });
      }

      const model = await this.contentAI.createDevelopmentModel(parseInt(userId));

      res.json({
        success: true,
        data: model
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Update development model
  async updateDevelopmentModel(req: Request, res: Response) {
    try {
      const { userId, targetLevel, skills } = req.body;

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'User ID is required'
        });
      }

      // Get existing model
      const existingModel = await this.contentAI.getDevelopmentModel(parseInt(userId));
      
      // Update with new data
      const updatedModel = {
        ...existingModel,
        targetLevel: targetLevel || existingModel.targetLevel,
        skills: skills || existingModel.skills
      };

      res.json({
        success: true,
        data: updatedModel
      });
    } (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get content statistics
  async getContentStatistics(req: Request, res: Response) {
    try {
      const stats = {
        totalGenerated: 0,
        byType: {
          lessons: 0,
          lectures: 0,
          exercises: 0,
          exams: 0
        },
        bySubject: {
          math: 0,
          physics: 0,
          chemistry: 0,
          biology: 0,
          literature: 0,
          history: 0,
          'computer-science': 0
        },
        byDifficulty: {
          beginner: 0,
          intermediate: 0,
          advanced: 0
        }
      };

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

  // Get available templates
  async getTemplates(req: Request, res: Response) {
    try {
      const { subject, contentType } = req.query;

      const templates = this.contentAI.getAvailableTemplates(
        subject as string,
        contentType as string
      );

      res.json({
        success: true,
        data: {
          templates,
          count: templates.length
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Save generated content
  async saveContent(req: Request, res: Response) {
    try {
      const { content } = req.body;

      if (!content) {
        return res.status(400).json({
          success: false,
          error: 'Content is required'
        });
      }

      await this.contentAI.saveContent(content);

      res.json({
        success: true,
        message: 'Content saved successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get user's generated content
  async getUserContent(req: Request, res: Response) {
    try {
      const { userId, subject, contentType } = req.query;

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'User ID is required'
        });
      }

      const content = await this.contentAI.getUserContent(
        parseInt(userId),
        subject as string,
        contentType as string
      );

      res.json({
        success: true,
        data: content
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

export { ContentGenerationController };
