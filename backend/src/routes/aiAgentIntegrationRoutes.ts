import { Router } from 'express';
import { AIAgentIntegrationController } from '../controllers/aiAgentIntegrationController';

const router = Router();
const controller = new AIAgentIntegrationController();

// Agent enhancement endpoints
router.post('/enhance/:agentId', controller.enhanceAgent.bind(controller));
router.post('/enhance-all', controller.enhanceAllAgents.bind(controller));

// Processing with AI endpoints
router.post('/process/:agentId', controller.processWithAI.bind(controller));

// Information endpoints
router.get('/capabilities', controller.getAgentCapabilities.bind(controller));
router.get('/models', controller.getAIModels.bind(controller));
router.get('/history', controller.getIntegrationHistory.bind(controller));
router.get('/metrics', controller.getPerformanceMetrics.bind(controller));
router.get('/status', controller.getSystemStatus.bind(controller));

// Performance endpoints
router.post('/benchmark', controller.benchmarkPerformance.bind(controller));
router.post('/optimize', controller.optimizeConfiguration.bind(controller));

// Custom enhancement endpoints
router.post('/enhancements/custom', controller.createCustomEnhancement.bind(controller));

// Model training endpoints
router.post('/models/:modelId/train', controller.trainModel.bind(controller));

// Configuration endpoints
router.get('/config/export', controller.exportConfiguration.bind(controller));
router.post('/config/import', controller.importConfiguration.bind(controller));

export default router;
