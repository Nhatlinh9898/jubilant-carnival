// Advanced Content Generation Controller
import { Request, Response } from 'express';
import { AdvancedAcademicAI } from '../services/advancedAcademicAI';

export class ContentGenerationController {
  private advancedAI: AdvancedAcademicAI;

  constructor(advancedAI: AdvancedAcademicAI) {
    this.advancedAI = advancedAI;
  }

  // Generate research paper
  async generateResearchPaper(req: Request, res: Response): Promise<void> {
    try {
      const { academicLevel, field, specialization, topic, requirements } = req.body;

      const request = {
        contentType: 'research_paper',
        academicLevel,
        field,
        specialization,
        topic,
        requirements
      };

      const content = await this.advancedAI.generateAdvancedContent(request);

      res.status(200).json({
        success: true,
        message: 'Research paper generated successfully',
        data: content
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to generate research paper',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Generate thesis
  async generateThesis(req: Request, res: Response): Promise<void> {
    try {
      const { academicLevel, field, specialization, topic, requirements } = req.body;

      const request = {
        contentType: 'thesis',
        academicLevel,
        field,
        specialization,
        topic,
        requirements
      };

      const content = await this.advancedAI.generateAdvancedContent(request);

      res.status(200).json({
        success: true,
        message: 'Thesis generated successfully',
        data: content
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to generate thesis',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Generate dissertation
  async generateDissertation(req: Request, res: Response): Promise<void> {
    try {
      const { academicLevel, field, specialization, topic, requirements } = req.body;

      const request = {
        contentType: 'dissertation',
        academicLevel,
        field,
        specialization,
        topic,
        requirements
      };

      const content = await this.advancedAI.generateAdvancedContent(request);

      res.status(200).json({
        success: true,
        message: 'Dissertation generated successfully',
        data: content
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to generate dissertation',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Generate journal article
  async generateJournalArticle(req: Request, res: Response): Promise<void> {
    try {
      const { academicLevel, field, specialization, topic, requirements } = req.body;

      const request = {
        contentType: 'journal_article',
        academicLevel,
        field,
        specialization,
        topic,
        requirements
      };

      const content = await this.advancedAI.generateAdvancedContent(request);

      res.status(200).json({
        success: true,
        message: 'Journal article generated successfully',
        data: content
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to generate journal article',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Generate grant proposal
  async generateGrantProposal(req: Request, res: Response): Promise<void> {
    try {
      const { academicLevel, field, specialization, topic, requirements } = req.body;

      const request = {
        contentType: 'grant_proposal',
        academicLevel,
        field,
        specialization,
        topic,
        requirements
      };

      const content = await this.advancedAI.generateAdvancedContent(request);

      res.status(200).json({
        success: true,
        message: 'Grant proposal generated successfully',
        data: content
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to generate grant proposal',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Generate curriculum vitae
  async generateCV(req: Request, res: Response): Promise<void> {
    try {
      const { academicLevel, field, specialization, topic, requirements } = req.body;

      const request = {
        contentType: 'curriculum_vitae',
        academicLevel,
        field,
        specialization,
        topic,
        requirements
      };

      const content = await this.advancedAI.generateAdvancedContent(request);

      res.status(200).json({
        success: true,
        message: 'CV generated successfully',
        data: content
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to generate CV',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Generate lecture notes
  async generateLectureNotes(req: Request, res: Response): Promise<void> {
    try {
      const { academicLevel, field, specialization, topic, requirements } = req.body;

      const request = {
        contentType: 'lecture_notes',
        academicLevel,
        field,
        specialization,
        topic,
        requirements
      };

      const content = await this.advancedAI.generateAdvancedContent(request);

      res.status(200).json({
        success: true,
        message: 'Lecture notes generated successfully',
        data: content
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to generate lecture notes',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get content types
  async getContentTypes(req: Request, res: Response): Promise<void> {
    try {
      const contentTypes = [
        {
          id: 'research_paper',
          name: 'Research Paper',
          description: 'Comprehensive academic research paper with full methodology and analysis'
        },
        {
          id: 'thesis',
          name: 'Thesis',
          description: 'Academic thesis for graduate degree programs'
        },
        {
          id: 'dissertation',
          name: 'Dissertation',
          description: 'Doctoral dissertation with extensive research and original contribution'
        },
        {
          id: 'journal_article',
          name: 'Journal Article',
          description: 'Concise article for academic journal publication'
        },
        {
          id: 'conference_paper',
          name: 'Conference Paper',
          description: 'Paper for academic conference presentation'
        },
        {
          id: 'book_chapter',
          name: 'Book Chapter',
          description: 'Chapter contribution to academic book'
        },
        {
          id: 'technical_report',
          name: 'Technical Report',
          description: 'Detailed technical analysis and findings'
        },
        {
          id: 'grant_proposal',
          name: 'Grant Proposal',
          description: 'Research funding proposal with methodology and budget'
        },
        {
          id: 'curriculum_vitae',
          name: 'Curriculum Vitae',
          description: 'Academic CV with research and teaching experience'
        },
        {
          id: 'lecture_notes',
          name: 'Lecture Notes',
          description: 'Educational lecture notes and course materials'
        }
      ];

      res.status(200).json({
        success: true,
        message: 'Content types retrieved successfully',
        data: contentTypes
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get content types',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

export { ContentGenerationController };
