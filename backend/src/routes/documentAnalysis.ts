import { Router } from 'express';
import { DocumentAnalysisController } from '@/controllers/documentAnalysisController';

const router = Router();
const docController = new DocumentAnalysisController();

// Document upload and analysis
router.post('/upload', docController.uploadDocument.bind(docController));

// Knowledge graph search
router.get('/knowledge/search', docController.searchKnowledge.bind(docController));

// Learning paths
router.get('/learning-path/:subject/:topic', docController.getLearningPath.bind(docController));

// Assessment questions
router.get('/assessment/:subject/:topic', docController.getAssessmentQuestions.bind(docController));

// Personalized quiz generation
router.post('/quiz/personalized', docController.generatePersonalizedQuiz.bind(docController));

// Document management
router.get('/documents', docController.getDocumentList.bind(docController));
router.get('/documents/:documentId', docController.getDocumentDetails.bind(docController));
router.delete('/documents/:documentId', docController.deleteDocument.bind(docController));

// Statistics
router.get('/statistics', docController.getDocumentStatistics.bind(docController));

export default router;
