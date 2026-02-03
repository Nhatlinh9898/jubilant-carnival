import { Router } from 'express';
import { StandaloneAIController } from '@/controllers/standaloneAIController';

const router = Router();
const aiController = new StandaloneAIController();

// AI Chat endpoints
router.post('/chat', aiController.chatWithAI.bind(aiController));

// Content generation endpoints
router.post('/content/generate', aiController.generateContent.bind(aiController));

// Q&A endpoints
router.post('/qa', aiController.answerQuestion.bind(aiController));

// Performance analysis endpoints
router.get('/performance/:studentId', aiController.getPerformanceAnalysis.bind(aiController));

// Study advice endpoints
router.post('/study-advice', aiController.getStudyAdvice.bind(aiController));

export default router;
