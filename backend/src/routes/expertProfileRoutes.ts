// Expert Profile Routes
import { Router } from 'express';
import { ExpertProfileController } from '../controllers/expertProfileController';

export class ExpertProfileRoutes {
  private controller: ExpertProfileController;
  private router: Router;

  constructor(controller: ExpertProfileController) {
    this.controller = controller;
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // Create expert profile
    this.router.post('/', this.controller.createExpertProfile.bind(this.controller));
    
    // Get expert profile
    this.router.get('/:userId', this.controller.getExpertProfile.bind(this.controller));
    
    // Update expert profile
    this.router.put('/:userId', this.controller.updateExpertProfile.bind(this.controller));
    
    // Calculate expertise score
    this.router.get('/:userId/expertise-score', this.controller.calculateExpertiseScore.bind(this.controller));
    
    // Get career progression recommendations
    this.router.get('/:userId/career-progression', this.controller.getCareerProgression.bind(this.controller));
    
    // Get expertise domains
    this.router.get('/domains', this.controller.getExpertiseDomains.bind(this.controller));
    
    // Get skills
    this.router.get('/skills', this.controller.getSkills.bind(this.controller));
    
    // Get competencies
    this.router.get('/competencies', this.controller.getCompetencies.bind(this.controller));
  }

  getRouter(): Router {
    return this.router;
  }
}

export { ExpertProfileRoutes };
