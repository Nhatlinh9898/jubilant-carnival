// Research Database Routes
import { Router } from 'express';
import { ResearchDatabaseController } from '../controllers/researchDatabaseController';

export class ResearchDatabaseRoutes {
  private controller: ResearchDatabaseController;
  private router: Router;

  constructor(controller: ResearchDatabaseController) {
    this.controller = controller;
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // Get research papers
    this.router.get('/papers', this.controller.getResearchPapers.bind(this.controller));
    
    // Search research papers
    this.router.post('/papers/search', this.controller.searchResearchPapers.bind(this.controller));
    
    // Get methodologies
    this.router.get('/methodologies', this.controller.getMethodologies.bind(this.controller));
    
    // Get frameworks
    this.router.get('/frameworks', this.controller.getFrameworks.bind(this.controller));
    
    // Get high impact papers
    this.router.get('/papers/high-impact', this.controller.getHighImpactPapers.bind(this.controller));
    
    // Get recent papers
    this.router.get('/papers/recent', this.controller.getRecentPapers.bind(this.controller));
    
    // Get research statistics
    this.router.get('/statistics', this.controller.getResearchStatistics.bind(this.controller));
  }

  getRouter(): Router {
    return this.router;
  }
}

export { ResearchDatabaseRoutes };
