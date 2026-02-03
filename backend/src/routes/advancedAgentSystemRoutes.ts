import { Router } from 'express';
import { AdvancedAgentSystemController } from '../controllers/advancedAgentSystemController';

const router = Router();
const controller = new AdvancedAgentSystemController();

// Main processing endpoints
router.post('/process', controller.processComplexContent.bind(controller));

// Agent tree management
router.get('/agents/tree', controller.getAgentTree.bind(controller));
router.post('/agents/specialized', controller.createSpecializedAgent.bind(controller));

// Agent capability analysis
router.get('/agents/:agentId/capabilities', controller.getAgentCapabilityAnalysis.bind(controller));

// Content management
router.get('/documents/:documentId/status', controller.getDocumentStatus.bind(controller));

// System statistics and monitoring
router.get('/statistics', controller.getProcessingStatistics.bind(controller));

// Collaboration management
router.post('/collaboration/initiate', controller.initiateCollaboration.bind(controller));

// Self-development
router.post('/agents/:agentId/self-develop', controller.triggerSelfDevelopment.bind(controller));

// Load balancing
router.post('/system/balance-load', controller.balanceSystemLoad.bind(controller));

export default router;
