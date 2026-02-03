import { ContentAnalysis, AnalysisType } from './contentAnalysisAgents';
import { ContentClassification } from './contentClassificationAgents';

// Task Creation Interfaces
export interface ProcessingTask {
  id: string;
  type: TaskType;
  priority: TaskPriority;
  status: TaskStatus;
  contentId: string;
  parameters: TaskParameters;
  dependencies: string[];
  assignedAgent?: string;
  metadata: TaskMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskParameters {
  input: any;
  expectedOutput?: any;
  processingOptions: Record<string, any>;
  qualityThreshold: number;
  timeout: number;
}

export interface TaskMetadata {
  source: 'analysis' | 'classification' | 'manual' | 'system';
  confidence: number;
  complexity: number;
  estimatedDuration: number;
  requiredCapabilities: string[];
  tags: string[];
}

export enum TaskType {
  EXTRACTION = 'extraction',
  TRANSFORMATION = 'transformation',
  VALIDATION = 'validation',
  SYNTHESIS = 'synthesis',
  SUMMARIZATION = 'summarization',
  CLASSIFICATION = 'classification',
  ANALYSIS = 'analysis',
  ENRICHMENT = 'enrichment'
}

export enum TaskPriority {
  LOW = 1,
  MEDIUM = 2,
  HIGH = 3,
  CRITICAL = 4,
  URGENT = 5
}

export enum TaskStatus {
  PENDING = 'pending',
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

// Task Creation Strategies
export abstract class TaskCreationStrategy {
  abstract name: string;
  abstract supportedAnalysisTypes: AnalysisType[];
  
  abstract createTasks(
    analysis: ContentAnalysis,
    classification: ContentClassification,
    contentId: string
  ): ProcessingTask[];
  
  protected generateTaskId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  protected calculatePriority(analysis: ContentAnalysis, classification: ContentClassification): TaskPriority {
    const basePriority = classification.classifications.quality.completeness * 5;
    const confidenceBonus = analysis.confidence * 2;
    const complexityPenalty = classification.classifications.complexity.overall * 2;
    
    const priorityScore = Math.max(1, Math.min(5, basePriority + confidenceBonus - complexityPenalty));
    return Math.floor(priorityScore) as TaskPriority;
  }
  
  protected estimateComplexity(analysis: ContentAnalysis, classification: ContentClassification): number {
    return (analysis.results.length * 0.1) + 
           (classification.classifications.complexity.overall * 0.7) + 
           (analysis.confidence * 0.2);
  }
}

// Sentiment-based Task Creation
export class SentimentTaskCreationStrategy extends TaskCreationStrategy {
  name = 'sentiment_task_creation';
  supportedAnalysisTypes = [AnalysisType.SENTIMENT];

  createTasks(analysis: ContentAnalysis, classification: ContentClassification, contentId: string): ProcessingTask[] {
    const tasks: ProcessingTask[] = [];
    
    const sentimentResult = analysis.results.find(r => r.type === 'sentiment');
    if (!sentimentResult) return tasks;
    
    const sentiment = sentimentResult.value.sentiment;
    
    // Create sentiment analysis tasks
    if (sentiment === 'negative' || sentimentResult.value.score < -0.3) {
      tasks.push(this.createSentimentAnalysisTask(analysis, classification, contentId, 'deep_sentiment_analysis'));
    }
    
    // Create emotion detection task
    tasks.push(this.createEmotionDetectionTask(analysis, classification, contentId));
    
    // Create sentiment trend analysis if content is large
    if (analysis.metadata.processingTime > 1000) {
      tasks.push(this.createSentimentTrendTask(analysis, classification, contentId));
    }
    
    return tasks;
  }
  
  private createSentimentAnalysisTask(
    analysis: ContentAnalysis,
    classification: ContentClassification,
    contentId: string,
    taskType: string
  ): ProcessingTask {
    return {
      id: this.generateTaskId(),
      type: TaskType.ANALYSIS,
      priority: this.calculatePriority(analysis, classification),
      status: TaskStatus.PENDING,
      contentId,
      parameters: {
        input: { analysisId: analysis.id, sentimentData: analysis.results.find(r => r.type === 'sentiment') },
        expectedOutput: { detailedSentiment: true, emotionalIndicators: true },
        processingOptions: { deepAnalysis: true, granularity: 'sentence' },
        qualityThreshold: 0.7,
        timeout: 30000
      },
      dependencies: [],
      metadata: {
        source: 'analysis',
        confidence: analysis.confidence,
        complexity: this.estimateComplexity(analysis, classification),
        estimatedDuration: 5000,
        requiredCapabilities: ['sentiment_analysis', 'emotion_detection'],
        tags: ['sentiment', 'emotion', 'analysis']
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
  
  private createEmotionDetectionTask(
    analysis: ContentAnalysis,
    classification: ContentClassification,
    contentId: string
  ): ProcessingTask {
    return {
      id: this.generateTaskId(),
      type: TaskType.ANALYSIS,
      priority: TaskPriority.MEDIUM,
      status: TaskStatus.PENDING,
      contentId,
      parameters: {
        input: { analysisId: analysis.id },
        expectedOutput: { emotions: ['joy', 'sadness', 'anger', 'fear', 'surprise'] },
        processingOptions: { emotionGranularity: 'fine' },
        qualityThreshold: 0.6,
        timeout: 15000
      },
      dependencies: [],
      metadata: {
        source: 'analysis',
        confidence: analysis.confidence * 0.8,
        complexity: this.estimateComplexity(analysis, classification) * 0.8,
        estimatedDuration: 3000,
        requiredCapabilities: ['emotion_detection'],
        tags: ['emotion', 'detection']
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
  
  private createSentimentTrendTask(
    analysis: ContentAnalysis,
    classification: ContentClassification,
    contentId: string
  ): ProcessingTask {
    return {
      id: this.generateTaskId(),
      type: TaskType.ANALYSIS,
      priority: TaskPriority.LOW,
      status: TaskStatus.PENDING,
      contentId,
      parameters: {
        input: { analysisId: analysis.id },
        expectedOutput: { trendAnalysis: true, segments: 10 },
        processingOptions: { windowSize: 100, overlap: 20 },
        qualityThreshold: 0.5,
        timeout: 20000
      },
      dependencies: [],
      metadata: {
        source: 'analysis',
        confidence: analysis.confidence * 0.7,
        complexity: this.estimateComplexity(analysis, classification) * 1.2,
        estimatedDuration: 8000,
        requiredCapabilities: ['trend_analysis', 'sentiment_analysis'],
        tags: ['sentiment', 'trend', 'analysis']
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
}

// Entity-based Task Creation
export class EntityTaskCreationStrategy extends TaskCreationStrategy {
  name = 'entity_task_creation';
  supportedAnalysisTypes = [AnalysisType.ENTITY];

  createTasks(analysis: ContentAnalysis, classification: ContentClassification, contentId: string): ProcessingTask[] {
    const tasks: ProcessingTask[] = [];
    
    const entityResult = analysis.results.find(r => r.type === 'entity');
    if (!entityResult) return tasks;
    
    // Create entity extraction tasks for each entity type
    const entityTypes = entityResult.value.entities as any[];
    const uniqueTypes = [...new Set(entityTypes.map((e: any) => e.type))];
    
    uniqueTypes.forEach(entityType => {
      tasks.push(this.createEntityExtractionTask(analysis, classification, contentId, entityType));
    });
    
    // Create relationship extraction task if multiple entities found
    if (entityTypes.length > 1) {
      tasks.push(this.createRelationshipExtractionTask(analysis, classification, contentId));
    }
    
    return tasks;
  }
  
  private createEntityExtractionTask(
    analysis: ContentAnalysis,
    classification: ContentClassification,
    contentId: string,
    entityType: string
  ): ProcessingTask {
    return {
      id: this.generateTaskId(),
      type: TaskType.EXTRACTION,
      priority: TaskPriority.MEDIUM,
      status: TaskStatus.PENDING,
      contentId,
      parameters: {
        input: { analysisId: analysis.id, entityType },
        expectedOutput: { entities: [], attributes: [] },
        processingOptions: { extractionMode: 'comprehensive' },
        qualityThreshold: 0.8,
        timeout: 25000
      },
      dependencies: [],
      metadata: {
        source: 'analysis',
        confidence: analysis.confidence,
        complexity: this.estimateComplexity(analysis, classification),
        estimatedDuration: 4000,
        requiredCapabilities: ['entity_extraction', entityType],
        tags: ['entity', 'extraction', entityType]
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
  
  private createRelationshipExtractionTask(
    analysis: ContentAnalysis,
    classification: ContentClassification,
    contentId: string
  ): ProcessingTask {
    return {
      id: this.generateTaskId(),
      type: TaskType.EXTRACTION,
      priority: TaskPriority.HIGH,
      status: TaskStatus.PENDING,
      contentId,
      parameters: {
        input: { analysisId: analysis.id },
        expectedOutput: { relationships: [], confidence: 0.7 },
        processingOptions: { relationshipTypes: ['spatial', 'temporal', 'causal'] },
        qualityThreshold: 0.6,
        timeout: 30000
      },
      dependencies: [],
      metadata: {
        source: 'analysis',
        confidence: analysis.confidence * 0.9,
        complexity: this.estimateComplexity(analysis, classification) * 1.5,
        estimatedDuration: 6000,
        requiredCapabilities: ['relationship_extraction', 'entity_linking'],
        tags: ['entity', 'relationship', 'extraction']
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
}

// Topic-based Task Creation
export class TopicTaskCreationStrategy extends TaskCreationStrategy {
  name = 'topic_task_creation';
  supportedAnalysisTypes = [AnalysisType.TOPIC];

  createTasks(analysis: ContentAnalysis, classification: ContentClassification, contentId: string): ProcessingTask[] {
    const tasks: ProcessingTask[] = [];
    
    const topicResult = analysis.results.find(r => r.type === 'topic');
    if (!topicResult) return tasks;
    
    // Create topic modeling task
    tasks.push(this.createTopicModelingTask(analysis, classification, contentId));
    
    // Create topic summarization for high-relevance topics
    const highRelevanceTopics = topicResult.value.topics?.filter((t: any) => t.relevance > 0.5) || [];
    highRelevanceTopics.forEach((topic: any) => {
      tasks.push(this.createTopicSummarizationTask(analysis, classification, contentId, topic.topic));
    });
    
    return tasks;
  }
  
  private createTopicModelingTask(
    analysis: ContentAnalysis,
    classification: ContentClassification,
    contentId: string
  ): ProcessingTask {
    return {
      id: this.generateTaskId(),
      type: TaskType.ANALYSIS,
      priority: TaskPriority.HIGH,
      status: TaskStatus.PENDING,
      contentId,
      parameters: {
        input: { analysisId: analysis.id },
        expectedOutput: { topics: [], distributions: [] },
        processingOptions: { numTopics: 10, algorithm: 'lda' },
        qualityThreshold: 0.7,
        timeout: 45000
      },
      dependencies: [],
      metadata: {
        source: 'analysis',
        confidence: analysis.confidence,
        complexity: this.estimateComplexity(analysis, classification) * 1.3,
        estimatedDuration: 12000,
        requiredCapabilities: ['topic_modeling', 'text_analysis'],
        tags: ['topic', 'modeling', 'analysis']
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
  
  private createTopicSummarizationTask(
    analysis: ContentAnalysis,
    classification: ContentClassification,
    contentId: string,
    topic: string
  ): ProcessingTask {
    return {
      id: this.generateTaskId(),
      type: TaskType.SUMMARIZATION,
      priority: TaskPriority.MEDIUM,
      status: TaskStatus.PENDING,
      contentId,
      parameters: {
        input: { analysisId: analysis.id, topic },
        expectedOutput: { summary: '', keyPoints: [] },
        processingOptions: { maxLength: 200, focus: topic },
        qualityThreshold: 0.6,
        timeout: 20000
      },
      dependencies: [],
      metadata: {
        source: 'analysis',
        confidence: analysis.confidence * 0.8,
        complexity: this.estimateComplexity(analysis, classification),
        estimatedDuration: 5000,
        requiredCapabilities: ['summarization', 'topic_analysis'],
        tags: ['topic', 'summarization', topic]
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
}

// Keyword-based Task Creation
export class KeywordTaskCreationStrategy extends TaskCreationStrategy {
  name = 'keyword_task_creation';
  supportedAnalysisTypes = [AnalysisType.KEYWORD];

  createTasks(analysis: ContentAnalysis, classification: ContentClassification, contentId: string): ProcessingTask[] {
    const tasks: ProcessingTask[] = [];
    
    const keywordResult = analysis.results.find(r => r.type === 'keyword');
    if (!keywordResult) return tasks;
    
    // Create keyword expansion task
    tasks.push(this.createKeywordExpansionTask(analysis, classification, contentId));
    
    // Create semantic analysis for top keywords
    const topKeywords = keywordResult.value.keywords?.slice(0, 5) || [];
    topKeywords.forEach((keyword: any) => {
      tasks.push(this.createSemanticAnalysisTask(analysis, classification, contentId, keyword.word));
    });
    
    return tasks;
  }
  
  private createKeywordExpansionTask(
    analysis: ContentAnalysis,
    classification: ContentClassification,
    contentId: string
  ): ProcessingTask {
    return {
      id: this.generateTaskId(),
      type: TaskType.ENRICHMENT,
      priority: TaskPriority.MEDIUM,
      status: TaskStatus.PENDING,
      contentId,
      parameters: {
        input: { analysisId: analysis.id },
        expectedOutput: { expandedKeywords: [], semanticClusters: [] },
        processingOptions: { expansionFactor: 3, clustering: true },
        qualityThreshold: 0.6,
        timeout: 25000
      },
      dependencies: [],
      metadata: {
        source: 'analysis',
        confidence: analysis.confidence,
        complexity: this.estimateComplexity(analysis, classification) * 0.8,
        estimatedDuration: 6000,
        requiredCapabilities: ['keyword_expansion', 'semantic_analysis'],
        tags: ['keyword', 'expansion', 'enrichment']
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
  
  private createSemanticAnalysisTask(
    analysis: ContentAnalysis,
    classification: ContentClassification,
    contentId: string,
    keyword: string
  ): ProcessingTask {
    return {
      id: this.generateTaskId(),
      type: TaskType.ANALYSIS,
      priority: TaskPriority.LOW,
      status: TaskStatus.PENDING,
      contentId,
      parameters: {
        input: { analysisId: analysis.id, keyword },
        expectedOutput: { semanticContext: [], relatedConcepts: [] },
        processingOptions: { contextWindow: 50, depth: 3 },
        qualityThreshold: 0.5,
        timeout: 15000
      },
      dependencies: [],
      metadata: {
        source: 'analysis',
        confidence: analysis.confidence * 0.7,
        complexity: this.estimateComplexity(analysis, classification) * 0.6,
        estimatedDuration: 3000,
        requiredCapabilities: ['semantic_analysis', 'context_analysis'],
        tags: ['keyword', 'semantic', keyword]
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
}

// Structure-based Task Creation
export class StructureTaskCreationStrategy extends TaskCreationStrategy {
  name = 'structure_task_creation';
  supportedAnalysisTypes = [AnalysisType.STRUCTURE];

  createTasks(analysis: ContentAnalysis, classification: ContentClassification, contentId: string): ProcessingTask[] {
    const tasks: ProcessingTask[] = [];
    
    const structureResult = analysis.results.find(r => r.type === 'structure');
    if (!structureResult) return tasks;
    
    // Create structure validation task
    tasks.push(this.createStructureValidationTask(analysis, classification, contentId));
    
    // Create summarization task based on structure
    if (structureResult.value.paragraphCount > 3) {
      tasks.push(this.createStructureSummarizationTask(analysis, classification, contentId));
    }
    
    return tasks;
  }
  
  private createStructureValidationTask(
    analysis: ContentAnalysis,
    classification: ContentClassification,
    contentId: string
  ): ProcessingTask {
    return {
      id: this.generateTaskId(),
      type: TaskType.VALIDATION,
      priority: TaskPriority.MEDIUM,
      status: TaskStatus.PENDING,
      contentId,
      parameters: {
        input: { analysisId: analysis.id },
        expectedOutput: { validationResults: [], suggestions: [] },
        processingOptions: { validationRules: ['grammar', 'coherence', 'flow'] },
        qualityThreshold: 0.7,
        timeout: 20000
      },
      dependencies: [],
      metadata: {
        source: 'analysis',
        confidence: analysis.confidence,
        complexity: this.estimateComplexity(analysis, classification) * 0.9,
        estimatedDuration: 4000,
        requiredCapabilities: ['structure_validation', 'grammar_check'],
        tags: ['structure', 'validation', 'quality']
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
  
  private createStructureSummarizationTask(
    analysis: ContentAnalysis,
    classification: ContentClassification,
    contentId: string
  ): ProcessingTask {
    return {
      id: this.generateTaskId(),
      type: TaskType.SUMMARIZATION,
      priority: TaskPriority.HIGH,
      status: TaskStatus.PENDING,
      contentId,
      parameters: {
        input: { analysisId: analysis.id },
        expectedOutput: { summary: '', outline: [] },
        processingOptions: { summarizationType: 'extractive', maxLength: 300 },
        qualityThreshold: 0.6,
        timeout: 25000
      },
      dependencies: [],
      metadata: {
        source: 'analysis',
        confidence: analysis.confidence * 0.9,
        complexity: this.estimateComplexity(analysis, classification),
        estimatedDuration: 8000,
        requiredCapabilities: ['summarization', 'structure_analysis'],
        tags: ['structure', 'summarization']
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
}

// Task Creation Agent
export interface TaskCreationAgent {
  id: string;
  name: string;
  strategies: TaskCreationStrategy[];
  performance: AgentPerformance;
  specialization: number[]; // 1024-dimensional vector
  status: 'active' | 'inactive' | 'busy';
}

export interface AgentPerformance {
  totalTasksCreated: number;
  successfulTasks: number;
  averageTaskQuality: number;
  averageCreationTime: number;
  lastUpdated: Date;
}

// Task Creation Agents Manager
export class TaskCreationAgents {
  private strategies: Map<string, TaskCreationStrategy> = new Map();
  private agents: Map<string, TaskCreationAgent> = new Map();
  private taskQueue: ProcessingTask[] = [];
  private isProcessing = false;

  constructor() {
    this.initializeStrategies();
    this.initializeAgents();
  }

  private initializeStrategies(): void {
    const strategies = [
      new SentimentTaskCreationStrategy(),
      new EntityTaskCreationStrategy(),
      new TopicTaskCreationStrategy(),
      new KeywordTaskCreationStrategy(),
      new StructureTaskCreationStrategy()
    ];

    strategies.forEach(strategy => {
      this.strategies.set(strategy.name, strategy);
    });
  }

  private initializeAgents(): void {
    const agentConfigs = [
      { 
        name: 'SentimentTaskAgent', 
        strategies: ['sentiment_task_creation'],
        capabilities: ['sentiment_analysis', 'emotion_detection']
      },
      { 
        name: 'EntityTaskAgent', 
        strategies: ['entity_task_creation'],
        capabilities: ['entity_extraction', 'relationship_extraction']
      },
      { 
        name: 'TopicTaskAgent', 
        strategies: ['topic_task_creation'],
        capabilities: ['topic_modeling', 'summarization']
      },
      { 
        name: 'KeywordTaskAgent', 
        strategies: ['keyword_task_creation'],
        capabilities: ['keyword_expansion', 'semantic_analysis']
      },
      { 
        name: 'StructureTaskAgent', 
        strategies: ['structure_task_creation'],
        capabilities: ['structure_validation', 'summarization']
      }
    ];

    agentConfigs.forEach(config => {
      const agentStrategies = config.strategies
        .map(name => this.strategies.get(name))
        .filter(Boolean) as TaskCreationStrategy[];
      
      if (agentStrategies.length > 0) {
        const agent: TaskCreationAgent = {
          id: `task_creation_${config.name.toLowerCase()}`,
          name: config.name,
          strategies: agentStrategies,
          performance: {
            totalTasksCreated: 0,
            successfulTasks: 0,
            averageTaskQuality: 0,
            averageCreationTime: 0,
            lastUpdated: new Date()
          },
          specialization: this.generateSpecializationVector(config.capabilities),
          status: 'active'
        };
        this.agents.set(agent.id, agent);
      }
    });
  }

  private generateSpecializationVector(capabilities: string[]): number[] {
    const vector = new Array(1024).fill(0);
    const capabilityHash = capabilities.join('').length;
    
    for (let i = 0; i < 1024; i++) {
      vector[i] = Math.cos(capabilityHash * (i + 1)) * 0.5 + 0.5;
    }
    
    return this.normalizeVector(vector);
  }

  private normalizeVector(vector: number[]): number[] {
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    return magnitude > 0 ? vector.map(val => val / magnitude) : vector;
  }

  public async createTasks(
    analyses: ContentAnalysis[],
    classification: ContentClassification,
    contentId: string
  ): Promise<ProcessingTask[]> {
    const allTasks: ProcessingTask[] = [];
    
    for (const analysis of analyses) {
      const agent = this.selectBestAgent(analysis.analysisType);
      if (agent && agent.status === 'active') {
        try {
          agent.status = 'busy';
          const startTime = Date.now();
          
          for (const strategy of agent.strategies) {
            if (strategy.supportedAnalysisTypes.includes(analysis.analysisType)) {
              const tasks = strategy.createTasks(analysis, classification, contentId);
              allTasks.push(...tasks);
              
              // Update agent performance
              this.updateAgentPerformance(agent, tasks.length, Date.now() - startTime);
            }
          }
          
        } catch (error) {
          // Error handling for task creation
        } finally {
          agent.status = 'active';
        }
      }
    }
    
    return this.prioritizeTasks(allTasks);
  }

  private selectBestAgent(analysisType: AnalysisType): TaskCreationAgent | undefined {
    const availableAgents = Array.from(this.agents.values())
      .filter(agent => 
        agent.strategies.some(strategy => 
          strategy.supportedAnalysisTypes.includes(analysisType)
        ) && agent.status === 'active'
      );
    
    if (availableAgents.length === 0) return undefined;
    
    return availableAgents.reduce((best, current) => 
      current.performance.averageTaskQuality > best.performance.averageTaskQuality ? current : best
    );
  }

  private updateAgentPerformance(
    agent: TaskCreationAgent, 
    tasksCreated: number, 
    creationTime: number
  ): void {
    agent.performance.totalTasksCreated += tasksCreated;
    agent.performance.successfulTasks += tasksCreated;
    
    const totalTasks = agent.performance.totalTasksCreated;
    agent.performance.averageCreationTime = 
      (agent.performance.averageCreationTime * (totalTasks - tasksCreated) + creationTime) / totalTasks;
    agent.performance.lastUpdated = new Date();
  }

  private prioritizeTasks(tasks: ProcessingTask[]): ProcessingTask[] {
    return tasks.sort((a, b) => {
      // Sort by priority first
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      
      // Then by confidence
      if (a.metadata.confidence !== b.metadata.confidence) {
        return b.metadata.confidence - a.metadata.confidence;
      }
      
      // Finally by creation time
      return a.createdAt.getTime() - b.createdAt.getTime();
    });
  }

  public getAgents(): TaskCreationAgent[] {
    return Array.from(this.agents.values());
  }

  public getAgentById(id: string): TaskCreationAgent | undefined {
    return this.agents.get(id);
  }

  public getStrategies(): TaskCreationStrategy[] {
    return Array.from(this.strategies.values());
  }
}
