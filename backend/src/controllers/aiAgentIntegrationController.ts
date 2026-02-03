import { Request, Response } from 'express';
import { AILocalAgentIntegration, AILocalConfig } from '../services/aiLocalAgentIntegration';

export class AIAgentIntegrationController {
  private aiIntegration: AILocalAgentIntegration;

  constructor() {
    const config: AILocalConfig = {
      endpoint: 'http://localhost:8080/api/ai',
      model: 'local-llm-v2',
      maxTokens: 2048,
      temperature: 0.7,
      timeout: 30000,
      retryAttempts: 3
    };
    
    this.aiIntegration = new AILocalAgentIntegration(config);
  }

  async enhanceAgent(req: Request, res: Response): Promise<void> {
    try {
      const { agentId, enhancementType } = req.body;
      
      if (!agentId || !enhancementType) {
        res.status(400).json({
          error: 'Missing required parameters: agentId and enhancementType'
        });
        return;
      }

      const result = await this.aiIntegration.enhanceAgent(agentId, enhancementType);
      
      res.json({
        success: true,
        data: result,
        message: `Agent ${agentId} enhanced with ${enhancementType}`
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to enhance agent',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async enhanceAllAgents(req: Request, res: Response): Promise<void> {
    try {
      const results = await this.aiIntegration.enhanceAllAgents();
      
      res.json({
        success: true,
        data: results,
        message: `Enhanced ${results.length} agents`
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to enhance all agents',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async processWithAI(req: Request, res: Response): Promise<void> {
    try {
      const { agentId, input, enhancementType } = req.body;
      
      if (!agentId || !input) {
        res.status(400).json({
          error: 'Missing required parameters: agentId and input'
        });
        return;
      }

      const result = await this.aiIntegration.processWithAIEnhancement(agentId, input, enhancementType);
      
      res.json({
        success: true,
        data: result,
        message: `Processed with AI enhancement for agent ${agentId}`
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to process with AI',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getAgentCapabilities(req: Request, res: Response): Promise<void> {
    try {
      const capabilities = this.aiIntegration.getAgentCapabilities();
      
      res.json({
        success: true,
        data: capabilities,
        message: 'Retrieved agent capabilities'
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to get agent capabilities',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getAIModels(req: Request, res: Response): Promise<void> {
    try {
      const models = this.aiIntegration.getAIModels();
      
      res.json({
        success: true,
        data: models,
        message: 'Retrieved AI models'
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to get AI models',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getIntegrationHistory(req: Request, res: Response): Promise<void> {
    try {
      const history = this.aiIntegration.getIntegrationHistory();
      
      res.json({
        success: true,
        data: history,
        message: 'Retrieved integration history'
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to get integration history',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getPerformanceMetrics(req: Request, res: Response): Promise<void> {
    try {
      const metrics = this.aiIntegration.getPerformanceMetrics();
      
      res.json({
        success: true,
        data: Object.fromEntries(metrics),
        message: 'Retrieved performance metrics'
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to get performance metrics',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async benchmarkPerformance(req: Request, res: Response): Promise<void> {
    try {
      const results = await this.aiIntegration.benchmarkPerformance();
      
      res.json({
        success: true,
        data: results,
        message: 'Performance benchmark completed'
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to benchmark performance',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async optimizeConfiguration(req: Request, res: Response): Promise<void> {
    try {
      const optimizedConfig = await this.aiIntegration.optimizeAIConfig();
      
      res.json({
        success: true,
        data: optimizedConfig,
        message: 'AI configuration optimized'
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to optimize configuration',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async createCustomEnhancement(req: Request, res: Response): Promise<void> {
    try {
      const { agentId, type, description, promptTemplate } = req.body;
      
      if (!agentId || !type || !description || !promptTemplate) {
        res.status(400).json({
          error: 'Missing required parameters: agentId, type, description, promptTemplate'
        });
        return;
      }

      const enhancement = await this.aiIntegration.createCustomEnhancement(
        agentId,
        type,
        description,
        promptTemplate
      );
      
      res.json({
        success: true,
        data: enhancement,
        message: `Custom enhancement created for agent ${agentId}`
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to create custom enhancement',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async trainModel(req: Request, res: Response): Promise<void> {
    try {
      const { modelId, trainingData } = req.body;
      
      if (!modelId || !trainingData) {
        res.status(400).json({
          error: 'Missing required parameters: modelId and trainingData'
        });
        return;
      }

      await this.aiIntegration.trainLocalModel(modelId, trainingData);
      
      res.json({
        success: true,
        message: `Model ${modelId} training completed`
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to train model',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async exportConfiguration(req: Request, res: Response): Promise<void> {
    try {
      const config = this.aiIntegration.exportConfiguration();
      
      res.json({
        success: true,
        data: config,
        message: 'Configuration exported successfully'
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to export configuration',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async importConfiguration(req: Request, res: Response): Promise<void> {
    try {
      const config = req.body;
      
      if (!config) {
        res.status(400).json({
          error: 'Missing configuration data'
        });
        return;
      }

      this.aiIntegration.importConfiguration(config);
      
      res.json({
        success: true,
        message: 'Configuration imported successfully'
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to import configuration',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getSystemStatus(req: Request, res: Response): Promise<void> {
    try {
      const capabilities = this.aiIntegration.getAgentCapabilities();
      const models = this.aiIntegration.getAIModels();
      const metrics = this.aiIntegration.getPerformanceMetrics();
      
      const status = {
        agents: {
          total: capabilities.length,
          enhanced: capabilities.filter(c => c.aiEnhanced).length,
          types: [...new Set(capabilities.map(c => c.agentType))]
        },
        models: {
          total: models.length,
          active: models.filter(m => m.status === 'active').length,
          types: [...new Set(models.map(m => m.type))]
        },
        performance: {
          averageAccuracy: Array.from(metrics.values()).reduce((sum, m) => sum + m.averageAccuracy, 0) / metrics.size || 0,
          totalEnhancements: Array.from(metrics.values()).reduce((sum, m) => sum + m.totalEnhancements, 0),
          averageProcessingTime: Array.from(metrics.values()).reduce((sum, m) => sum + m.averageProcessingTime, 0) / metrics.size || 0
        }
      };
      
      res.json({
        success: true,
        data: status,
        message: 'System status retrieved'
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to get system status',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
