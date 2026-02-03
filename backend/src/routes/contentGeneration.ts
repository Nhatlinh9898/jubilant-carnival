import { Router } from 'express';
import { ContentGenerationController } from '@/controllers/contentGenerationController';

const router = Router();
const contentController = new ContentGenerationController();

// Content generation endpoints
router.post('/lessons/generate', contentController.generateLesson.bind(contentController));
router.post('/lectures/generate', contentController.generateLecture.bind(contentController));
router.post('/exercises/generate', contentController.generateExercise.bind(contentController));
router.post('/exams/generate', contentController.generateExam.bind(contentController));

// Template-based generation
router.post('/templates/generate', contentController.generateFromTemplate.bind(contentController));

// Development model endpoints
router.get('/development-model/:userId', contentController.getDevelopmentModel.bind(contentController));
router.put('/development-model/:userId', contentController.updateDevelopmentModel.bind(contentController));

// Content management
router.get('/content/statistics', contentController.getContentStatistics.bind(contentController));
router.get('/templates', contentController.getTemplates.bind(contentController));
router.post('/content/save', contentController.saveContent.bind(contentController));
router.get('/content/user/:userId', contentController.getUserContent.bind(contentController));

export default router;
