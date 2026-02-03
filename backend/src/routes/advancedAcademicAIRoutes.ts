// Advanced Academic AI Routes - Main Routes
import { Router } from 'express';
import { AdvancedAcademicAIController } from '../controllers/advancedAcademicAIController';
import { ContentGenerationRoutes } from './contentGenerationRoutes';
import { AcademicAnalysisRoutes } from './academicAnalysisRoutes';
import { ExpertProfileRoutes } from './expertProfileRoutes';
import { ResearchDatabaseRoutes } from './researchDatabaseRoutes';

const router = Router();
const controller = new AdvancedAcademicAIController();

// Main Advanced Academic AI routes
router.post('/generate', controller.generateContent.bind(controller));
router.post('/analyze', controller.analyzeDocument.bind(controller));
router.get('/recommendations/:contentId', controller.getRecommendations.bind(controller));
router.get('/search', controller.searchContent.bind(controller));
router.get('/statistics', controller.getStatistics.bind(controller));
router.get('/export/:contentId', controller.exportContent.bind(controller));
router.post('/enhance/:contentId', controller.enhanceContent.bind(controller));
router.delete('/cache', controller.clearCache.bind(controller));

// Sub-routes
router.use('/content', new ContentGenerationRoutes(controller.getContentController()).getRouter());
router.use('/analysis', new AcademicAnalysisRoutes(controller.getAnalysisController()).getRouter());
router.use('/profile', new ExpertProfileRoutes(controller.getProfileController()).getRouter());
router.use('/research', new ResearchDatabaseRoutes(controller.getResearchController()).getRouter());

export default router;
