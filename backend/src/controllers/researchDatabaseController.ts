// Research Database Controller
import { Request, Response } from 'express';
import { AdvancedAcademicAI } from '../services/advancedAcademicAI';

export class ResearchDatabaseController {
  private advancedAI: AdvancedAcademicAI;

  constructor(advancedAI: AdvancedAcademicAI) {
    this.advancedAI = advancedAI;
  }

  // Get research papers
  async getResearchPapers(req: Request, res: Response): Promise<void> {
    try {
      const { field, specialization } = req.query;

      const papers = this.advancedAI.getResearchPapers(field as string, specialization as string);

      res.status(200).json({
        success: true,
        message: 'Research papers retrieved successfully',
        data: papers,
        count: papers.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get research papers',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Search research papers
  async searchResearchPapers(req: Request, res: Response): Promise<void> {
    try {
      const { query, field, specialization } = req.query;

      if (!query) {
        res.status(400).json({
          success: false,
          message: 'Search query is required'
        });
        return;
      }

      const papers = this.advancedAI.searchResearchPapers(
        query as string,
        field as string,
        specialization as string
      );

      res.status(200).json({
        success: true,
        message: 'Research papers searched successfully',
        data: papers,
        count: papers.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to search research papers',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get methodologies
  async getMethodologies(req: Request, res: Response): Promise<void> {
    try {
      const { complexity } = req.query;

      const methodologies = this.advancedAI.getMethodologies(complexity as string);

      res.status(200).json({
        success: true,
        message: 'Methodologies retrieved successfully',
        data: methodologies,
        count: methodologies.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get methodologies',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get frameworks
  async getFrameworks(req: Request, res: Response): Promise<void> {
    try {
      const { application } = req.query;

      const frameworks = this.advancedAI.getFrameworks(application as string);

      res.status(200).json({
        success: true,
        message: 'Frameworks retrieved successfully',
        data: frameworks,
        count: frameworks.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get frameworks',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get high impact papers
  async getHighImpactPapers(req: Request, res: Response): Promise<void> {
    try {
      const { minCitations = 100 } = req.query;

      const allPapers = this.advancedAI.getResearchPapers();
      const highImpact = allPapers.filter((paper: any) => 
        paper.citations >= parseInt(minCitations as string)
      );

      res.status(200).json({
        success: true,
        message: 'High impact papers retrieved successfully',
        data: highImpact,
        count: highImpact.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get high impact papers',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get recent papers
  async getRecentPapers(req: Request, res: Response): Promise<void> {
    try {
      const { year = new Date().getFullYear(), count = 10 } = req.query;

      const allPapers = this.advancedAI.getResearchPapers();
      const recent = allPapers
        .filter((paper: any) => paper.year >= parseInt(year as string))
        .sort((a: any, b: any) => b.year - a.year)
        .slice(0, parseInt(count as string));

      res.status(200).json({
        success: true,
        message: 'Recent papers retrieved successfully',
        data: recent,
        count: recent.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get recent papers',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get research statistics
  async getResearchStatistics(req: Request, res: Response): Promise<void> {
    try {
      const allPapers = this.advancedAI.getResearchPapers();
      
      const statistics = {
        totalPapers: allPapers.length,
        totalCitations: allPapers.reduce((sum: number, paper: any) => sum + paper.citations, 0),
        averageImpact: allPapers.reduce((sum: number, paper: any) => sum + paper.impact, 0) / allPapers.length,
        fields: {} as Record<string, number>,
        years: {} as Record<string, number>
      };

      allPapers.forEach((paper: any) => {
        statistics.fields[paper.field] = (statistics.fields[paper.field] || 0) + 1;
        statistics.years[paper.year] = (statistics.years[paper.year] || 0) + 1;
      });

      res.status(200).json({
        success: true,
        message: 'Research statistics retrieved successfully',
        data: statistics
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get research statistics',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

export { ResearchDatabaseController };
