import { Router } from 'express';
import { AIController } from '@/controllers/aiController';

const router = Router();
const aiController = new AIController();

// AI Chat endpoints
router.post('/chat', aiController.chatWithAI.bind(aiController));

// Content generation endpoints
router.post('/content/generate', aiController.generateContent.bind(aiController));
router.post('/content/suggestions', aiController.getContentSuggestions.bind(aiController));

// Grading endpoints
router.post('/grade', aiController.gradeAssignment.bind(aiController));

// Analytics endpoints
router.get('/analytics/student/:studentId', aiController.getLearningAnalytics.bind(aiController));
router.get('/analytics/class/:classId', aiController.getClassAnalytics.bind(aiController));

// Q&A endpoints
router.post('/qa', aiController.answerQuestion.bind(aiController));

// Study plan endpoints
router.post('/study-plan', aiController.generateStudyPlan.bind(aiController));

// Teacher recommendations
router.get('/recommendations/teacher', aiController.getTeacherRecommendations.bind(aiController));

export default router;
