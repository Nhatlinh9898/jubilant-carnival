import { ProcessingTask, TaskType, TaskPriority } from './taskCreationAgents';

export enum TaskStatus {
  PENDING = 'pending',
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

// Task Processing Interfaces
export interface TaskResult {
  id: string;
  taskId: string;
  status: TaskStatus;
  output: any;
  metadata: TaskResultMetadata;
  performance: TaskPerformance;
  timestamp: Date;
}

export interface TaskResultMetadata {
  processingTime: number;
  agentId: string;
  algorithm: string;
  parameters: Record<string, any>;
  quality: number;
  confidence: number;
  errors?: string[];
  warnings?: string[];
}

export interface TaskPerformance {
  inputSize: number;
  outputSize: number;
  memoryUsage: number;
  cpuUsage: number;
  networkRequests: number;
  cacheHits: number;
  cacheMisses: number;
}

// Task Processing Strategies
export abstract class TaskProcessingStrategy {
  abstract name: string;
  abstract supportedTaskTypes: TaskType[];
  abstract capabilities: string[];
  
  abstract processTask(task: ProcessingTask): Promise<TaskResult>;
  
  protected generateResultId(taskId: string): string {
    return `result_${taskId}_${Date.now()}`;
  }
  
  protected calculateQuality(output: any, expectedOutput?: any): number {
    if (!expectedOutput) return 0.8; // Default quality when no expected output
    
    // Simple quality calculation based on output completeness
    const outputKeys = Object.keys(output || {});
    const expectedKeys = Object.keys(expectedOutput || {});
    const matchCount = expectedKeys.filter(key => outputKeys.includes(key)).length;
    
    return expectedKeys.length > 0 ? matchCount / expectedKeys.length : 0.8;
  }
  
  protected calculateConfidence(quality: number, processingTime: number): number {
    const timeFactor = Math.max(0.5, Math.min(1, 10000 / Math.max(processingTime, 1)));
    return (quality + timeFactor) / 2;
  }
}

// Extraction Task Processing
export class ExtractionProcessingStrategy extends TaskProcessingStrategy {
  name = 'extraction_processing';
  supportedTaskTypes = [TaskType.EXTRACTION];
  capabilities = ['entity_extraction', 'relationship_extraction', 'data_extraction'];

  async processTask(task: ProcessingTask): Promise<TaskResult> {
    const startTime = Date.now();
    
    try {
      const input = task.parameters.input;
      let output: any = {};
      
      // Process based on extraction type
      if (input.entityType) {
        output = await this.extractEntities(input, task.parameters.processingOptions);
      } else if (input.analysisId) {
        output = await this.extractRelationships(input, task.parameters.processingOptions);
      } else {
        output = await this.extractData(input, task.parameters.processingOptions);
      }
      
      const processingTime = Date.now() - startTime;
      const quality = this.calculateQuality(output, task.parameters.expectedOutput);
      const confidence = this.calculateConfidence(quality, processingTime);
      
      return {
        id: this.generateResultId(task.id),
        taskId: task.id,
        status: quality >= task.parameters.qualityThreshold ? TaskStatus.COMPLETED : TaskStatus.FAILED,
        output,
        metadata: {
          processingTime,
          agentId: 'extraction_agent',
          algorithm: 'hybrid_extraction',
          parameters: task.parameters.processingOptions,
          quality,
          confidence
        },
        performance: {
          inputSize: JSON.stringify(input).length,
          outputSize: JSON.stringify(output).length,
          memoryUsage: Math.random() * 100, // Simulated
          cpuUsage: Math.random() * 100, // Simulated
          networkRequests: 0,
          cacheHits: Math.floor(Math.random() * 10),
          cacheMisses: Math.floor(Math.random() * 5)
        },
        timestamp: new Date()
      };
      
    } catch (error) {
      return {
        id: this.generateResultId(task.id),
        taskId: task.id,
        status: TaskStatus.FAILED,
        output: null,
        metadata: {
          processingTime: Date.now() - startTime,
          agentId: 'extraction_agent',
          algorithm: 'hybrid_extraction',
          parameters: task.parameters.processingOptions,
          quality: 0,
          confidence: 0,
          errors: [error instanceof Error ? error.message : 'Unknown error']
        },
        performance: {
          inputSize: JSON.stringify(task.parameters.input).length,
          outputSize: 0,
          memoryUsage: 0,
          cpuUsage: 0,
          networkRequests: 0,
          cacheHits: 0,
          cacheMisses: 0
        },
        timestamp: new Date()
      };
    }
  }
  
  private async extractEntities(input: any, options: any): Promise<any> {
    // Simulated entity extraction
    const entities = [
      { id: 'ent1', type: input.entityType || 'person', value: 'John Doe', confidence: 0.9 },
      { id: 'ent2', type: input.entityType || 'organization', value: 'Acme Corp', confidence: 0.85 }
    ];
    
    return {
      entities,
      attributes: entities.map(e => ({ ...e, attributes: { relevance: e.confidence } })),
      extractionMode: options.extractionMode || 'standard'
    };
  }
  
  private async extractRelationships(input: any, options: any): Promise<any> {
    // Simulated relationship extraction
    const relationships = [
      { id: 'rel1', type: 'employment', source: 'John Doe', target: 'Acme Corp', confidence: 0.8 },
      { id: 'rel2', type: 'location', source: 'Acme Corp', target: 'New York', confidence: 0.75 }
    ];
    
    return {
      relationships,
      confidence: 0.78,
      relationshipTypes: options.relationshipTypes || ['all']
    };
  }
  
  private async extractData(input: any, options: any): Promise<any> {
    // Simulated data extraction
    return {
      extractedData: {
        fields: ['name', 'email', 'phone'],
        values: ['Sample Data', 'sample@example.com', '555-1234']
      },
      extractionMode: options.extractionMode || 'comprehensive'
    };
  }
}

// Transformation Task Processing
export class TransformationProcessingStrategy extends TaskProcessingStrategy {
  name = 'transformation_processing';
  supportedTaskTypes = [TaskType.TRANSFORMATION];
  capabilities = ['data_transformation', 'format_conversion', 'structure_reorganization'];

  async processTask(task: ProcessingTask): Promise<TaskResult> {
    const startTime = Date.now();
    
    try {
      const input = task.parameters.input;
      const output = await this.transformData(input, task.parameters.processingOptions);
      
      const processingTime = Date.now() - startTime;
      const quality = this.calculateQuality(output, task.parameters.expectedOutput);
      const confidence = this.calculateConfidence(quality, processingTime);
      
      return {
        id: this.generateResultId(task.id),
        taskId: task.id,
        status: quality >= task.parameters.qualityThreshold ? TaskStatus.COMPLETED : TaskStatus.FAILED,
        output,
        metadata: {
          processingTime,
          agentId: 'transformation_agent',
          algorithm: 'adaptive_transformation',
          parameters: task.parameters.processingOptions,
          quality,
          confidence
        },
        performance: {
          inputSize: JSON.stringify(input).length,
          outputSize: JSON.stringify(output).length,
          memoryUsage: Math.random() * 150,
          cpuUsage: Math.random() * 100,
          networkRequests: 0,
          cacheHits: Math.floor(Math.random() * 8),
          cacheMisses: Math.floor(Math.random() * 4)
        },
        timestamp: new Date()
      };
      
    } catch (error) {
      return {
        id: this.generateResultId(task.id),
        taskId: task.id,
        status: TaskStatus.FAILED,
        output: null,
        metadata: {
          processingTime: Date.now() - startTime,
          agentId: 'transformation_agent',
          algorithm: 'adaptive_transformation',
          parameters: task.parameters.processingOptions,
          quality: 0,
          confidence: 0,
          errors: [error instanceof Error ? error.message : 'Unknown error']
        },
        performance: {
          inputSize: JSON.stringify(task.parameters.input).length,
          outputSize: 0,
          memoryUsage: 0,
          cpuUsage: 0,
          networkRequests: 0,
          cacheHits: 0,
          cacheMisses: 0
        },
        timestamp: new Date()
      };
    }
  }
  
  private async transformData(input: any, options: any): Promise<any> {
    // Simulated data transformation
    const transformationType = options.transformationType || 'normalize';
    
    switch (transformationType) {
      case 'normalize':
        return {
          normalizedData: this.normalizeData(input),
          transformation: 'normalization'
        };
      case 'aggregate':
        return {
          aggregatedData: this.aggregateData(input),
          transformation: 'aggregation'
        };
      default:
        return {
          transformedData: input,
          transformation: 'identity'
        };
    }
  }
  
  private normalizeData(data: any): any {
    // Simple normalization simulation
    if (Array.isArray(data)) {
      return data.map(item => ({ ...item, normalized: true }));
    }
    return { ...data, normalized: true };
  }
  
  private aggregateData(data: any): any {
    // Simple aggregation simulation
    if (Array.isArray(data)) {
      return {
        count: data.length,
        summary: 'Aggregated data',
        items: data.slice(0, 5) // First 5 items as sample
      };
    }
    return { aggregated: true, original: data };
  }
}

// Validation Task Processing
export class ValidationProcessingStrategy extends TaskProcessingStrategy {
  name = 'validation_processing';
  supportedTaskTypes = [TaskType.VALIDATION];
  capabilities = ['data_validation', 'quality_check', 'compliance_verification'];

  async processTask(task: ProcessingTask): Promise<TaskResult> {
    const startTime = Date.now();
    
    try {
      const input = task.parameters.input;
      const output = await this.validateData(input, task.parameters.processingOptions);
      
      const processingTime = Date.now() - startTime;
      const quality = this.calculateQuality(output, task.parameters.expectedOutput);
      const confidence = this.calculateConfidence(quality, processingTime);
      
      return {
        id: this.generateResultId(task.id),
        taskId: task.id,
        status: quality >= task.parameters.qualityThreshold ? TaskStatus.COMPLETED : TaskStatus.FAILED,
        output,
        metadata: {
          processingTime,
          agentId: 'validation_agent',
          algorithm: 'comprehensive_validation',
          parameters: task.parameters.processingOptions,
          quality,
          confidence
        },
        performance: {
          inputSize: JSON.stringify(input).length,
          outputSize: JSON.stringify(output).length,
          memoryUsage: Math.random() * 80,
          cpuUsage: Math.random() * 100,
          networkRequests: 0,
          cacheHits: Math.floor(Math.random() * 12),
          cacheMisses: Math.floor(Math.random() * 3)
        },
        timestamp: new Date()
      };
      
    } catch (error) {
      return {
        id: this.generateResultId(task.id),
        taskId: task.id,
        status: TaskStatus.FAILED,
        output: null,
        metadata: {
          processingTime: Date.now() - startTime,
          agentId: 'validation_agent',
          algorithm: 'comprehensive_validation',
          parameters: task.parameters.processingOptions,
          quality: 0,
          confidence: 0,
          errors: [error instanceof Error ? error.message : 'Unknown error']
        },
        performance: {
          inputSize: JSON.stringify(task.parameters.input).length,
          outputSize: 0,
          memoryUsage: 0,
          cpuUsage: 0,
          networkRequests: 0,
          cacheHits: 0,
          cacheMisses: 0
        },
        timestamp: new Date()
      };
    }
  }
  
  private async validateData(input: any, options: any): Promise<any> {
    const validationRules = options.validationRules || ['completeness', 'accuracy'];
    const results: any = { validationResults: [], overallScore: 0 };
    
    validationRules.forEach((rule: string) => {
      const score = Math.random(); // Simulated validation score
      results.validationResults.push({
        rule,
        score,
        passed: score > 0.7,
        issues: score > 0.7 ? [] : [`Issue with ${rule}`]
      });
    });
    
    results.overallScore = results.validationResults.reduce((sum: number, r: any) => sum + r.score, 0) / results.validationResults.length;
    results.suggestions = this.generateSuggestions(results.validationResults);
    
    return results;
  }
  
  private generateSuggestions(results: any[]): string[] {
    return results
      .filter(r => !r.passed)
      .map(r => `Improve ${r.rule} quality`);
  }
}

// Synthesis Task Processing
export class SynthesisProcessingStrategy extends TaskProcessingStrategy {
  name = 'synthesis_processing';
  supportedTaskTypes = [TaskType.SYNTHESIS];
  capabilities = ['information_synthesis', 'data_fusion', 'knowledge_integration'];

  async processTask(task: ProcessingTask): Promise<TaskResult> {
    const startTime = Date.now();
    
    try {
      const input = task.parameters.input;
      const output = await this.synthesizeData(input, task.parameters.processingOptions);
      
      const processingTime = Date.now() - startTime;
      const quality = this.calculateQuality(output, task.parameters.expectedOutput);
      const confidence = this.calculateConfidence(quality, processingTime);
      
      return {
        id: this.generateResultId(task.id),
        taskId: task.id,
        status: quality >= task.parameters.qualityThreshold ? TaskStatus.COMPLETED : TaskStatus.FAILED,
        output,
        metadata: {
          processingTime,
          agentId: 'synthesis_agent',
          algorithm: 'multi_source_synthesis',
          parameters: task.parameters.processingOptions,
          quality,
          confidence
        },
        performance: {
          inputSize: JSON.stringify(input).length,
          outputSize: JSON.stringify(output).length,
          memoryUsage: Math.random() * 200,
          cpuUsage: Math.random() * 100,
          networkRequests: Math.floor(Math.random() * 3),
          cacheHits: Math.floor(Math.random() * 15),
          cacheMisses: Math.floor(Math.random() * 5)
        },
        timestamp: new Date()
      };
      
    } catch (error) {
      return {
        id: this.generateResultId(task.id),
        taskId: task.id,
        status: TaskStatus.FAILED,
        output: null,
        metadata: {
          processingTime: Date.now() - startTime,
          agentId: 'synthesis_agent',
          algorithm: 'multi_source_synthesis',
          parameters: task.parameters.processingOptions,
          quality: 0,
          confidence: 0,
          errors: [error instanceof Error ? error.message : 'Unknown error']
        },
        performance: {
          inputSize: JSON.stringify(task.parameters.input).length,
          outputSize: 0,
          memoryUsage: 0,
          cpuUsage: 0,
          networkRequests: 0,
          cacheHits: 0,
          cacheMisses: 0
        },
        timestamp: new Date()
      };
    }
  }
  
  private async synthesizeData(input: any, options: any): Promise<any> {
    const synthesisType = options.synthesisType || 'fusion';
    
    switch (synthesisType) {
      case 'fusion':
        return {
          synthesizedData: this.fuseData(input),
          synthesisMethod: 'data_fusion',
          confidence: 0.85
        };
      case 'integration':
        return {
          integratedKnowledge: this.integrateKnowledge(input),
          synthesisMethod: 'knowledge_integration',
          confidence: 0.8
        };
      default:
        return {
          synthesizedContent: input,
          synthesisMethod: 'simple_synthesis',
          confidence: 0.7
        };
    }
  }
  
  private fuseData(data: any): any {
    // Simulated data fusion
    return {
      fusedEntities: ['Entity1', 'Entity2', 'Entity3'],
      relationships: ['Rel1', 'Rel2'],
      metadata: { fusionTime: new Date(), sources: 3 }
    };
  }
  
  private integrateKnowledge(data: any): any {
    // Simulated knowledge integration
    return {
      integratedConcepts: ['Concept1', 'Concept2'],
      knowledgeGraph: { nodes: 5, edges: 8 },
      insights: ['Insight1', 'Insight2']
    };
  }
}

// Summarization Task Processing
export class SummarizationProcessingStrategy extends TaskProcessingStrategy {
  name = 'summarization_processing';
  supportedTaskTypes = [TaskType.SUMMARIZATION];
  capabilities = ['text_summarization', 'content_abstraction', 'key_point_extraction'];

  async processTask(task: ProcessingTask): Promise<TaskResult> {
    const startTime = Date.now();
    
    try {
      const input = task.parameters.input;
      const output = await this.summarizeContent(input, task.parameters.processingOptions);
      
      const processingTime = Date.now() - startTime;
      const quality = this.calculateQuality(output, task.parameters.expectedOutput);
      const confidence = this.calculateConfidence(quality, processingTime);
      
      return {
        id: this.generateResultId(task.id),
        taskId: task.id,
        status: quality >= task.parameters.qualityThreshold ? TaskStatus.COMPLETED : TaskStatus.FAILED,
        output,
        metadata: {
          processingTime,
          agentId: 'summarization_agent',
          algorithm: 'neural_summarization',
          parameters: task.parameters.processingOptions,
          quality,
          confidence
        },
        performance: {
          inputSize: JSON.stringify(input).length,
          outputSize: JSON.stringify(output).length,
          memoryUsage: Math.random() * 120,
          cpuUsage: Math.random() * 100,
          networkRequests: Math.floor(Math.random() * 2),
          cacheHits: Math.floor(Math.random() * 10),
          cacheMisses: Math.floor(Math.random() * 4)
        },
        timestamp: new Date()
      };
      
    } catch (error) {
      return {
        id: this.generateResultId(task.id),
        taskId: task.id,
        status: TaskStatus.FAILED,
        output: null,
        metadata: {
          processingTime: Date.now() - startTime,
          agentId: 'summarization_agent',
          algorithm: 'neural_summarization',
          parameters: task.parameters.processingOptions,
          quality: 0,
          confidence: 0,
          errors: [error instanceof Error ? error.message : 'Unknown error']
        },
        performance: {
          inputSize: JSON.stringify(task.parameters.input).length,
          outputSize: 0,
          memoryUsage: 0,
          cpuUsage: 0,
          networkRequests: 0,
          cacheHits: 0,
          cacheMisses: 0
        },
        timestamp: new Date()
      };
    }
  }
  
  private async summarizeContent(input: any, options: any): Promise<any> {
    const summarizationType = options.summarizationType || 'extractive';
    const maxLength = options.maxLength || 200;
    
    switch (summarizationType) {
      case 'extractive':
        return {
          summary: `This is an extractive summary of the content with maximum length ${maxLength}. Key points are extracted directly from the source.`,
          keyPoints: ['Key point 1', 'Key point 2', 'Key point 3'],
          method: 'extractive',
          compressionRatio: 0.3
        };
      case 'abstractive':
        return {
          summary: `This is an abstractive summary that rephrases the content in new words while preserving meaning. Length limit: ${maxLength}.`,
          keyPoints: ['Main concept', 'Supporting detail', 'Conclusion'],
          method: 'abstractive',
          compressionRatio: 0.25
        };
      default:
        return {
          summary: 'Generic summary of the content.',
          keyPoints: ['Point 1', 'Point 2'],
          method: 'generic',
          compressionRatio: 0.4
        };
    }
  }
}

// Task Processing Agent
export interface TaskProcessingAgent {
  id: string;
  name: string;
  strategies: TaskProcessingStrategy[];
  performance: AgentPerformance;
  specialization: number[]; // 1024-dimensional vector
  status: 'active' | 'inactive' | 'busy';
  currentLoad: number;
  maxCapacity: number;
}

export interface AgentPerformance {
  totalTasksProcessed: number;
  successfulTasks: number;
  failedTasks: number;
  averageProcessingTime: number;
  averageQuality: number;
  averageConfidence: number;
  lastUpdated: Date;
}

// Task Processing Agents Manager
export class TaskProcessingAgents {
  private strategies: Map<string, TaskProcessingStrategy> = new Map();
  private agents: Map<string, TaskProcessingAgent> = new Map();
  private taskQueue: ProcessingTask[] = [];
  private results: Map<string, TaskResult> = new Map();
  private isProcessing = false;

  constructor() {
    this.initializeStrategies();
    this.initializeAgents();
  }

  private initializeStrategies(): void {
    const strategies = [
      new ExtractionProcessingStrategy(),
      new TransformationProcessingStrategy(),
      new ValidationProcessingStrategy(),
      new SynthesisProcessingStrategy(),
      new SummarizationProcessingStrategy()
    ];

    strategies.forEach(strategy => {
      this.strategies.set(strategy.name, strategy);
    });
  }

  private initializeAgents(): void {
    const agentConfigs = [
      { 
        name: 'ExtractionAgent', 
        strategies: ['extraction_processing'],
        capabilities: ['entity_extraction', 'relationship_extraction', 'data_extraction']
      },
      { 
        name: 'TransformationAgent', 
        strategies: ['transformation_processing'],
        capabilities: ['data_transformation', 'format_conversion', 'structure_reorganization']
      },
      { 
        name: 'ValidationAgent', 
        strategies: ['validation_processing'],
        capabilities: ['data_validation', 'quality_check', 'compliance_verification']
      },
      { 
        name: 'SynthesisAgent', 
        strategies: ['synthesis_processing'],
        capabilities: ['information_synthesis', 'data_fusion', 'knowledge_integration']
      },
      { 
        name: 'SummarizationAgent', 
        strategies: ['summarization_processing'],
        capabilities: ['text_summarization', 'content_abstraction', 'key_point_extraction']
      }
    ];

    agentConfigs.forEach(config => {
      const agentStrategies = config.strategies
        .map(name => this.strategies.get(name))
        .filter(Boolean) as TaskProcessingStrategy[];
      
      if (agentStrategies.length > 0) {
        const agent: TaskProcessingAgent = {
          id: `task_processing_${config.name.toLowerCase()}`,
          name: config.name,
          strategies: agentStrategies,
          performance: {
            totalTasksProcessed: 0,
            successfulTasks: 0,
            failedTasks: 0,
            averageProcessingTime: 0,
            averageQuality: 0,
            averageConfidence: 0,
            lastUpdated: new Date()
          },
          specialization: this.generateSpecializationVector(config.capabilities),
          status: 'active',
          currentLoad: 0,
          maxCapacity: 10
        };
        this.agents.set(agent.id, agent);
      }
    });
  }

  private generateSpecializationVector(capabilities: string[]): number[] {
    const vector = new Array(1024).fill(0);
    const capabilityHash = capabilities.join('').length;
    
    for (let i = 0; i < 1024; i++) {
      vector[i] = Math.sin(capabilityHash * (i + 1) * 0.1) * 0.5 + 0.5;
    }
    
    return this.normalizeVector(vector);
  }

  private normalizeVector(vector: number[]): number[] {
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    return magnitude > 0 ? vector.map(val => val / magnitude) : vector;
  }

  public async processTasks(tasks: ProcessingTask[]): Promise<TaskResult[]> {
    const results: TaskResult[] = [];
    
    for (const task of tasks) {
      const agent = this.selectBestAgent(task);
      if (agent && agent.status === 'active' && agent.currentLoad < agent.maxCapacity) {
        try {
          agent.status = 'busy';
          agent.currentLoad++;
          
          const strategy = agent.strategies.find(s => s.supportedTaskTypes.includes(task.type));
          if (strategy) {
            const result = await strategy.processTask(task);
            results.push(result);
            this.results.set(result.id, result);
            this.updateAgentPerformance(agent, result);
          }
          
        } catch (error) {
          // Error handling
        } finally {
          agent.status = 'active';
          agent.currentLoad--;
        }
      }
    }
    
    return results;
  }

  private selectBestAgent(task: ProcessingTask): TaskProcessingAgent | undefined {
    const availableAgents = Array.from(this.agents.values())
      .filter(agent => 
        agent.strategies.some(strategy => 
          strategy.supportedTaskTypes.includes(task.type)
        ) && agent.status === 'active' && agent.currentLoad < agent.maxCapacity
      );
    
    if (availableAgents.length === 0) return undefined;
    
    // Select agent with lowest load and best performance
    return availableAgents.reduce((best, current) => {
      const loadScore = (current.maxCapacity - current.currentLoad) / current.maxCapacity;
      const performanceScore = current.performance.averageQuality;
      const currentScore = (loadScore * 0.6) + (performanceScore * 0.4);
      
      const bestLoadScore = (best.maxCapacity - best.currentLoad) / best.maxCapacity;
      const bestPerformanceScore = best.performance.averageQuality;
      const bestScore = (bestLoadScore * 0.6) + (bestPerformanceScore * 0.4);
      
      return currentScore > bestScore ? current : best;
    });
  }

  private updateAgentPerformance(agent: TaskProcessingAgent, result: TaskResult): void {
    agent.performance.totalTasksProcessed++;
    
    if (result.status === TaskStatus.COMPLETED) {
      agent.performance.successfulTasks++;
    } else {
      agent.performance.failedTasks++;
    }
    
    const totalTasks = agent.performance.totalTasksProcessed;
    const processingTime = result.metadata.processingTime;
    const quality = result.metadata.quality;
    const confidence = result.metadata.confidence;
    
    agent.performance.averageProcessingTime = 
      (agent.performance.averageProcessingTime * (totalTasks - 1) + processingTime) / totalTasks;
    agent.performance.averageQuality = 
      (agent.performance.averageQuality * (totalTasks - 1) + quality) / totalTasks;
    agent.performance.averageConfidence = 
      (agent.performance.averageConfidence * (totalTasks - 1) + confidence) / totalTasks;
    agent.performance.lastUpdated = new Date();
  }

  public getAgents(): TaskProcessingAgent[] {
    return Array.from(this.agents.values());
  }

  public getAgentById(id: string): TaskProcessingAgent | undefined {
    return this.agents.get(id);
  }

  public getResults(): TaskResult[] {
    return Array.from(this.results.values());
  }

  public getResultById(id: string): TaskResult | undefined {
    return this.results.get(id);
  }

  public getStrategies(): TaskProcessingStrategy[] {
    return Array.from(this.strategies.values());
  }
}
