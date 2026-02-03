// Advanced Academic AI Controller - Main Controller
import { Request, Response } from 'express';
import { AdvancedAcademicAI } from '../services/advancedAcademicAI';
import { ContentGenerationController } from './contentGenerationController';
import { AcademicAnalysisController } from './academicAnalysisController';
import { ExpertProfileController } from './expertProfileController';
import { ResearchDatabaseController } from './researchDatabaseController';

export class AdvancedAcademicAIController {
  private advancedAI: AdvancedAcademicAI;
  private contentController: ContentGenerationController;
  private analysisController: AcademicAnalysisController;
  private profileController: ExpertProfileController;
  private researchController: ResearchDatabaseController;

  constructor() {
    this.advancedAI = new AdvancedAcademicAI();
    this.contentController = new ContentGenerationController(this.advancedAI);
    this.analysisController = new AcademicAnalysisController(this.advancedAI);
    this.profileController = new ExpertProfileController(this.advancedAI);
    this.researchController = new ResearchDatabaseController(this.advancedAI);
  }

  // Main content generation endpoint
  async generateContent(req: Request, res: Response): Promise<void> {
    try {
      const { contentType, academicLevel, field, specialization, topic, difficulty, duration, requirements } = req.body;

      if (!contentType || !academicLevel || !field || !specialization || !topic) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields: contentType, academicLevel, field, specialization, topic'
        });
        return;
      }

      const request = {
        contentType,
        academicLevel,
        field,
        specialization,
        topic,
        difficulty,
        duration,
        requirements
      };

      const content = await this.advancedAI.generateAdvancedContent(request);

      res.status(200).json({
        success: true,
        message: 'Content generated successfully',
        data: content
      });
    } catch (error) {
      console.error('Content generation error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate content',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Main analysis endpoint
  async analyzeDocument(req: Request, res: Response): Promise<void> {
    try {
      const { documentPath, field, specialization, analysisType } = req.body;

      if (!documentPath || !field || !specialization || !analysisType) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields: documentPath, field, specialization, analysisType'
        });
        return;
      }

      const analysis = await this.advancedAI.analyzeAcademicDocument(documentPath, field, specialization, analysisType);

      res.status(200).json({
        success: true,
        message: 'Document analyzed successfully',
        data: analysis
      });
    } catch (error) {
      console.error('Document analysis error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to analyze document',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get content recommendations
  async getRecommendations(req: Request, res: Response): Promise<void> {
    try {
      const { contentId, count = 5 } = req.params;

      if (!contentId) {
        res.status(400).json({
          success: false,
          message: 'Content ID is required'
        });
        return;
      }

      const recommendations = await this.advancedAI.getContentRecommendations(contentId, parseInt(count));

      res.status(200).json({
        success: true,
        message: 'Recommendations retrieved successfully',
        data: recommendations
      });
    } catch (error) {
      console.error('Get recommendations error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get recommendations',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Search content
  async searchContent(req: Request, res: Response): Promise<void> {
    try {
      const { query, type, field, level, specialization } = req.query;

      if (!query) {
        res.status(400).json({
          success: false,
          message: 'Search query is required'
        });
        return;
      }

      const filters = {
        type: type as string,
        field: field as string,
        level: level as string,
        specialization: specialization as string
      };

      const results = await this.advancedAI.searchContent(query as string, filters);

      res.status(200).json({
        success: true,
        message: 'Content searched successfully',
        data: results,
        count: results.length
      });
    } catch (error) {
      console.error('Search content error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to search content',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get statistics
  async getStatistics(req: Request, res: Response): Promise<void> {
    try {
      const statistics = this.advancedAI.getStatistics();

      res.status(200).json({
        success: true,
        message: 'Statistics retrieved successfully',
        data: statistics
      });
    } catch (error) {
      console.error('Get statistics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get statistics',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Export content
  async exportContent(req: Request, res: Response): Promise<void> {
    try {
      const { contentId } = req.params;
      const { format = 'json' } = req.query;

      if (!contentId) {
        res.status(400).json({
          success: false,
          message: 'Content ID is required'
        });
        return;
      }

      const exported = await this.advancedAI.exportContent(contentId, format as 'json' | 'markdown' | 'pdf');

      // Set appropriate headers for file download
      if (format === 'json') {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="content_${contentId}.json"`);
      } else if (format === 'markdown') {
        res.setHeader('Content-Type', 'text/markdown');
        res.setHeader('Content-Disposition', `attachment; filename="content_${contentId}.md"`);
      }

      res.status(200).send(exported);
    } catch (error) {
      console.error('Export content error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to export content',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Enhance content
  async enhanceContent(req: Request, res: Response): Promise<void> {
    try {
      const { contentId } = req.params;
      const { enhancements } = req.body;

      if (!contentId || !enhancements) {
        res.status(400).json({
          success: false,
          message: 'Content ID and enhancements are required'
        });
        return;
      }

      const enhanced = await this.advancedAI.enhanceContent(contentId, enhancements);

      res.status(200).json({
        success: true,
        message: 'Content enhanced successfully',
        data: enhanced
      });
    } catch (error) {
      console.error('Enhance content error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to enhance content',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Clear cache
  async clearCache(req: Request, res: Response): Promise<void> {
    try {
      this.advancedAI.clearCache();

      res.status(200).json({
        success: true,
        message: 'Cache cleared successfully'
      });
    } catch (error) {
      console.error('Clear cache error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to clear cache',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get sub-controllers
  getContentController(): ContentGenerationController {
    return this.contentController;
  }

  getAnalysisController(): AcademicAnalysisController {
    return this.analysisController;
  }

  getProfileController(): ExpertProfileController {
    return this.profileController;
  }

  getResearchController(): ResearchDatabaseController {
    return this.researchController;
  }
}

export { AdvancedAcademicAIController };
