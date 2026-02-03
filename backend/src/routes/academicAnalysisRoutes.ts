// Academic Analysis Routes
import { Router } from 'express';
import { AcademicAnalysisController } from '../controllers/academicAnalysisController';

export class AcademicAnalysisRoutes {
  private controller: AcademicAnalysisController;
  private router: Router;

  constructor(controller: AcademicAnalysisController) {
    this.controller = controller;
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // Analyze document
    this.router.post('/analyze', this.controller.analyzeDocument.bind(this.controller));
    
    // Get analysis types
    this.router.get('/types', this.controller.getAnalysisTypes.bind(this.controller));
    
    // Batch analysis
    this.router.post('/batch-analyze', this.controller.batchAnalyze.bind(this.controller));
    
    // Get analysis history
    this.router.get('/history', this.controller.getAnalysisHistory.bind(this.controller));
  }

  getRouter(): Router {
    return this.router;
  }
}

export { AcademicAnalysisRoutes };
