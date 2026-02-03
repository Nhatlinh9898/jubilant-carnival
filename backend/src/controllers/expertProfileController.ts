// Expert Profile Controller
import { Request, Response } from 'express';
import { AdvancedAcademicAI } from '../services/advancedAcademicAI';

export class ExpertProfileController {
  private advancedAI: AdvancedAcademicAI;

  constructor(advancedAI: AdvancedAcademicAI) {
    this.advancedAI = advancedAI;
  }

  // Get expert profile
  async getExpertProfile(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      if (!userId) {
        res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
        return;
      }

      const profile = await this.advancedAI.getExpertProfile(parseInt(userId));

      if (!profile) {
        res.status(404).json({
          success: false,
          message: 'Expert profile not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Expert profile retrieved successfully',
        data: profile
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get expert profile',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Update expert profile
  async updateExpertProfile(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const updates = req.body;

      if (!userId) {
        res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
        return;
      }

      const updatedProfile = await this.advancedAI.updateExpertProfile(parseInt(userId), updates);

      res.status(200).json({
        success: true,
        message: 'Expert profile updated successfully',
        data: updatedProfile
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to update expert profile',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Calculate expertise score
  async calculateExpertiseScore(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      if (!userId) {
        res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
        return;
      }

      const profile = await this.advancedAI.getExpertProfile(parseInt(userId));
      
      if (!profile) {
        res.status(404).json({
          success: false,
          message: 'Expert profile not found'
        });
        return;
      }

      const score = this.advancedAI.calculateExpertiseScore(profile);

      res.status(200).json({
        success: true,
        message: 'Expertise score calculated successfully',
        data: score
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to calculate expertise score',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get career progression recommendations
  async getCareerProgression(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      if (!userId) {
        res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
        return;
      }

      const profile = await this.advancedAI.getExpertProfile(parseInt(userId));
      
      if (!profile) {
        res.status(404).json({
          success: false,
          message: 'Expert profile not found'
        });
        return;
      }

      const recommendations = this.advancedAI.getCareerProgressionRecommendations(profile);

      res.status(200).json({
        success: true,
        message: 'Career progression recommendations retrieved successfully',
        data: recommendations
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get career progression recommendations',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get expertise domains
  async getExpertiseDomains(req: Request, res: Response): Promise<void> {
    try {
      const { field, specialization } = req.query;

      const domains = this.advancedAI.getExpertiseDomains(
        field as string,
        specialization as string
      );

      res.status(200).json({
        success: true,
        message: 'Expertise domains retrieved successfully',
        data: domains
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get expertise domains',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get skills
  async getSkills(req: Request, res: Response): Promise<void> {
    try {
      const { category } = req.query;

      const skills = this.advancedAI.getSkills(category as string);

      res.status(200).json({
        success: true,
        message: 'Skills retrieved successfully',
        data: skills
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get skills',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get competencies
  async getCompetencies(req: Request, res: Response): Promise<void> {
    try {
      const { category } = req.query;

      const competencies = this.advancedAI.getCompetencies(category as string);

      res.status(200).json({
        success: true,
        message: 'Competencies retrieved successfully',
        data: competencies
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get competencies',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Create expert profile
  async createExpertProfile(req: Request, res: Response): Promise<void> {
    try {
      const { userId, academicLevel, primaryField, secondaryFields, specializations } = req.body;

      if (!userId || !academicLevel || !primaryField) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields: userId, academicLevel, primaryField'
        });
        return;
      }

      // Mock implementation - in real system, this would create and save profile
      const profile = {
        userId: parseInt(userId),
        academicLevel,
        primaryField,
        secondaryFields: secondaryFields || [],
        specializations: specializations || [],
        researchInterests: [],
        publications: [],
        citations: 0,
        hIndex: 0,
        impact: 0,
        collaborations: [],
        grants: [],
        teachingExperience: [],
        skills: [],
        competencies: [],
        experience: [],
        expertiseDomains: [],
        careerGoals: [],
        achievements: [],
        network: {
          contacts: [],
          collaborations: [],
          memberships: [],
          events: []
        }
      };

      res.status(201).json({
        success: true,
        message: 'Expert profile created successfully',
        data: profile
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to create expert profile',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

export { ExpertProfileController };
