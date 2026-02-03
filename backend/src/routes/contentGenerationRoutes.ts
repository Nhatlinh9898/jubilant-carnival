// Content Generation Routes
import { Router } from 'express';
import { ContentGenerationController } from '../controllers/advancedContentController';

export class ContentGenerationRoutes {
  private controller: ContentGenerationController;
  private router: Router;

  constructor(controller: ContentGenerationController) {
    this.controller = controller;
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // Research paper generation
    this.router.post('/research-paper', this.controller.generateResearchPaper.bind(this.controller));
    
    // Thesis generation
    this.router.post('/thesis', this.controller.generateThesis.bind(this.controller));
    
    // Dissertation generation
    this.router.post('/dissertation', this.controller.generateDissertation.bind(this.controller));
    
    // Journal article generation
    this.router.post('/journal-article', this.controller.generateJournalArticle.bind(this.controller));
    
    // Grant proposal generation
    this.router.post('/grant-proposal', this.controller.generateGrantProposal.bind(this.controller));
    
    // CV generation
    this.router.post('/cv', this.controller.generateCV.bind(this.controller));
    
    // Lecture notes generation
    this.router.post('/lecture-notes', this.controller.generateLectureNotes.bind(this.controller));
    
    // Get content types
    this.router.get('/types', this.controller.getContentTypes.bind(this.controller));
  }

  getRouter(): Router {
    return this.router;
  }
}

export { ContentGenerationRoutes };
