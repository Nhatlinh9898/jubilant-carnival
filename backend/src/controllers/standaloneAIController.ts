import { Request, Response } from 'express';
import { StandaloneAI } from '@/services/standaloneAI';

export class StandaloneAIController {
  private aiService: StandaloneAI;

  constructor() {
    this.aiService = new StandaloneAI();
  }

  // AI Chat Endpoint
  async chatWithAI(req: Request, res: Response) {
    try {
      const { studentId, message } = req.body;

      if (!message) {
        return res.status(400).json({
          success: false,
          error: 'Message is required'
        });
      }

      const response = await this.aiService.generateResponse(message, studentId);

      res.json({
        success: true,
        data: response
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Generate Content
  async generateContent(req: Request, res: Response) {
    try {
      const { subject, topic, difficulty, contentType } = req.body;

      if (!subject || !topic || !difficulty || !contentType) {
        return res.status(400).json({
          success: false,
          error: 'All fields are required: subject, topic, difficulty, contentType'
        });
      }

      const content = await this.aiService.generateContent(
        subject,
        topic,
        difficulty,
        contentType
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

  // Performance Analysis
  async getPerformanceAnalysis(req: Request, res: Response) {
    try {
      const { studentId } = req.params;

      if (!studentId) {
        return res.status(400).json({
          success: false,
          error: 'Student ID is required'
        });
      }

      const analysis = await this.aiService.analyzePerformance(parseInt(studentId));

      res.json({
        success: true,
        data: analysis
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Simple Q&A
  async answerQuestion(req: Request, res: Response) {
    try {
      const { question, studentId } = req.body;

      if (!question) {
        return res.status(400).json({
          success: false,
          error: 'Question is required'
        });
      }

      const response = await this.aiService.generateResponse(question, studentId);

      res.json({
        success: true,
        data: response
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Study Advice
  async getStudyAdvice(req: Request, res: Response) {
    try {
      const { studentId, goals } = req.body;

      if (!studentId) {
        return res.status(400).json({
          success: false,
          error: 'Student ID is required'
        });
      }

      const advice = await this.aiService.generateResponse(
        `Tôi cần lời khuyên học tập. Mục tiêu của tôi: ${goals || 'cải thiện kết quả học tập'}`,
        studentId
      );

      res.json({
        success: true,
        data: advice
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

export { StandaloneAIController };
