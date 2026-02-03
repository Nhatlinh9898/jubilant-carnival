export interface PipelineTier {
  id: string;
  name: string;
  level: number;
  agents: PipelineAgent[];
  capacity: number;
  currentLoad: number;
  inputQueue: PipelineTask[];
  outputQueue: PipelineTask[];
  status: 'active' | 'inactive' | 'overloaded';
}

export interface PipelineAgent {
  id: string;
  name: string;
  tier: string;
  specializations: string[];
  vectorRepresentation: number[];
  performance: {
    successRate: number;
    averageProcessingTime: number;
    qualityScore: number;
  };
  status: 'idle' | 'processing' | 'error';
  currentTask?: PipelineTask;
  processedTasks: number;
}

export interface PipelineTask {
  id: string;
  type: string;
  priority: number;
  data: any;
  metadata: {
    sourceTier: string;
    targetTier: string;
    createdAt: Date;
    deadline?: Date;
    retryCount: number;
    maxRetries: number;
  };
  processing: {
    assignedAgent?: string;
    startTime?: Date;
    endTime?: Date;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    result?: any;
    error?: string;
  };
  dependencies: string[];
  chunkInfo?: {
    chunkId: string;
    documentId: string;
    position: number;
    totalChunks: number;
  };
}

export interface FileBatch {
  id: string;
  files: Array<{
    id: string;
    path: string;
    size: number;
    type: string;
    metadata: any;
  }>;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  estimatedProcessingTime: number;
  assignedTier?: string;
}

export class HierarchicalPipelineSystem {
  private tiers: Map<string, PipelineTier> = new Map();
  private agents: Map<string, PipelineAgent> = new Map();
  private tasks: Map<string, PipelineTask> = new Map();
  private fileBatches: Map<string, FileBatch> = new Map();
  private vectorDimensions: number = 1024;
  private maxConcurrentTasks: number = 10000;
  private batchSize: number = 1000;

  constructor() {
    this.initializeTiers();
    this.setupVectorSpace();
  }

  private initializeTiers(): void {
    // Tier 1: Content Reading Agents
    this.tiers.set('content_reading', {
      id: 'content_reading',
      name: 'Content Reading Layer',
      level: 1,
      agents: [],
      capacity: 1000,
      currentLoad: 0,
      inputQueue: [],
      outputQueue: [],
      status: 'active'
    });

    // Tier 2: Content Classification Agents
    this.tiers.set('content_classification', {
      id: 'content_classification',
      name: 'Content Classification Layer',
      level: 2,
      agents: [],
      capacity: 800,
      currentLoad: 0,
      inputQueue: [],
      outputQueue: [],
      status: 'active'
    });

    // Tier 3: Content Analysis Agents
    this.tiers.set('content_analysis', {
      id: 'content_analysis',
      name: 'Content Analysis Layer',
      level: 3,
      agents: [],
      capacity: 600,
      currentLoad: 0,
      inputQueue: [],
      outputQueue: [],
      status: 'active'
    });

    // Tier 4: Task Creation Agents
    this.tiers.set('task_creation', {
      id: 'task_creation',
      name: 'Task Creation Layer',
      level: 4,
      agents: [],
      capacity: 500,
      currentLoad: 0,
      inputQueue: [],
      outputQueue: [],
      status: 'active'
    });

    // Tier 5: Task Processing Agents
    this.tiers.set('task_processing', {
      id: 'task_processing',
      name: 'Task Processing Layer',
      level: 5,
      agents: [],
      capacity: 400,
      currentLoad: 0,
      inputQueue: [],
      outputQueue: [],
      status: 'active'
    });

    // Tier 6: Result Collection & Deduplication Agents
    this.tiers.set('result_collection', {
      id: 'result_collection',
      name: 'Result Collection & Deduplication Layer',
      level: 6,
      agents: [],
      capacity: 300,
      currentLoad: 0,
      inputQueue: [],
      outputQueue: [],
      status: 'active'
    });

    // Tier 7: Information Synthesis Agents
    this.tiers.set('information_synthesis', {
      id: 'information_synthesis',
      name: 'Information Synthesis Layer',
      level: 7,
      agents: [],
      capacity: 200,
      currentLoad: 0,
      inputQueue: [],
      outputQueue: [],
      status: 'active'
    });

    // Tier 8: Validation & Evaluation Agents
    this.tiers.set('validation_evaluation', {
      id: 'validation_evaluation',
      name: 'Validation & Evaluation Layer',
      level: 8,
      agents: [],
      capacity: 150,
      currentLoad: 0,
      inputQueue: [],
      outputQueue: [],
      status: 'active'
    });

    // Tier 9: Final Result Delivery Agents
    this.tiers.set('result_delivery', {
      id: 'result_delivery',
      name: 'Final Result Delivery Layer',
      level: 9,
      agents: [],
      capacity: 100,
      currentLoad: 0,
      inputQueue: [],
      outputQueue: [],
      status: 'active'
    });

    // Tier 10: System Coordination Agents
    this.tiers.set('system_coordination', {
      id: 'system_coordination',
      name: 'System Coordination Layer',
      level: 10,
      agents: [],
      capacity: 50,
      currentLoad: 0,
      inputQueue: [],
      outputQueue: [],
      status: 'active'
    });
  }

  private setupVectorSpace(): void {
    // Initialize vector representations for each tier
    this.tiers.forEach((tier, tierId) => {
      const baseVector = this.generateTierVector(tierId);
      
      // Create agents for each tier
      const agentCount = this.getAgentCountForTier(tierId);
      for (let i = 0; i < agentCount; i++) {
        const agent = this.createTierAgent(tier, i, baseVector);
        tier.agents.push(agent);
        this.agents.set(agent.id, agent);
      }
    });
  }

  private generateTierVector(tierId: string): number[] {
    const vector = new Array(this.vectorDimensions).fill(0);
    const tierHash = this.hashString(tierId);
    
    // Create unique vector representation for each tier
    for (let i = 0; i < this.vectorDimensions; i++) {
      vector[i] = Math.sin((tierHash + i) * 0.01) * 0.5 + 0.5;
    }
    
    return this.normalizeVector(vector);
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  private normalizeVector(vector: number[]): number[] {
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    return magnitude > 0 ? vector.map(val => val / magnitude) : vector;
  }

  private getAgentCountForTier(tierId: string): number {
    const tier = this.tiers.get(tierId);
    return tier ? Math.floor(tier.capacity / 10) : 10;
  }

  private createTierAgent(tier: PipelineTier, index: number, baseVector: number[]): PipelineAgent {
    const specializations = this.getTierSpecializations(tier.id);
    const mutatedVector = this.mutateVector(baseVector, 0.1);
    
    return {
      id: `${tier.id}_agent_${index}`,
      name: `${tier.name} Agent ${index}`,
      tier: tier.id,
      specializations,
      vectorRepresentation: mutatedVector,
      performance: {
        successRate: 0.9,
        averageProcessingTime: 1000,
        qualityScore: 0.8
      },
      status: 'idle',
      processedTasks: 0
    };
  }

  private getTierSpecializations(tierId: string): string[] {
    const specializations: { [key: string]: string[] } = {
      'content_reading': [
        'file_reading', 'text_extraction', 'binary_parsing', 'ocr_processing',
        'pdf_extraction', 'image_text_extraction', 'audio_transcription', 'video_analysis'
      ],
      'content_classification': [
        'content_type_detection', 'language_identification', 'topic_classification',
        'sentiment_analysis', 'category_assignment', 'priority_scoring', 'complexity_assessment'
      ],
      'content_analysis': [
        'semantic_analysis', 'entity_extraction', 'relationship_mapping',
        'pattern_recognition', 'anomaly_detection', 'trend_analysis', 'quality_assessment'
      ],
      'task_creation': [
        'task_generation', 'dependency_mapping', 'resource_allocation',
        'priority_assignment', 'deadline_setting', 'workflow_design', 'requirement_analysis'
      ],
      'task_processing': [
        'data_processing', 'computation_execution', 'algorithm_application',
        'transformation_execution', 'calculation_performing', 'logic_execution', 'analysis_performing'
      ],
      'result_collection': [
        'result_gathering', 'duplicate_detection', 'data_aggregation',
        'result_validation', 'error_correction', 'completion_tracking', 'status_monitoring'
      ],
      'information_synthesis': [
        'data_synthesis', 'information_integration', 'knowledge_consolidation',
        'pattern_synthesis', 'trend_identification', 'insight_generation', 'summary_creation'
      ],
      'validation_evaluation': [
        'quality_validation', 'accuracy_assessment', 'completeness_checking',
        'consistency_verification', 'performance_evaluation', 'error_detection', 'improvement_suggestion'
      ],
      'result_delivery': [
        'result_formatting', 'output_generation', 'delivery_coordination',
        'notification_sending', 'report_generation', 'data_export', 'integration_updating'
      ],
      'system_coordination': [
        'system_monitoring', 'load_balancing', 'performance_optimization',
        'error_handling', 'resource_management', 'workflow_coordination', 'system_tuning'
      ]
    };
    
    return specializations[tierId] || ['general_processing'];
  }

  private mutateVector(vector: number[], mutationRate: number): number[] {
    return vector.map((value, index) => {
      const mutation = (Math.random() - 0.5) * mutationRate;
      return Math.max(-1, Math.min(1, value + mutation));
    });
  }

  // Main pipeline processing method
  public async processBillionScaleFiles(files: Array<{ id: string; path: string; size: number; type: string }>): Promise<string> {
    const batchId = this.generateBatchId();
    
    // Create file batch
    const batch: FileBatch = {
      id: batchId,
      files,
      status: 'pending',
      createdAt: new Date(),
      estimatedProcessingTime: this.estimateBatchProcessingTime(files),
      assignedTier: 'content_reading'
    };
    
    this.fileBatches.set(batchId, batch);
    
    // Start pipeline processing
    this.startPipelineProcessing(batchId);
    
    return batchId;
  }

  private generateBatchId(): string {
    return `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private estimateBatchProcessingTime(files: Array<{ id: string; path: string; size: number; type: string }>): number {
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    const avgProcessingRate = 1024 * 1024; // 1MB per second per agent
    const totalCapacity = this.getTotalSystemCapacity();
    
    return (totalSize / avgProcessingRate) / totalCapacity * 1000; // in seconds
  }

  private getTotalSystemCapacity(): number {
    let totalCapacity = 0;
    this.tiers.forEach(tier => {
      totalCapacity += tier.capacity;
    });
    return totalCapacity;
  }

  private async startPipelineProcessing(batchId: string): Promise<void> {
    const batch = this.fileBatches.get(batchId);
    if (!batch) return;
    
    batch.status = 'processing';
    
    // Stage 1: Send to content reading tier
    await this.sendToTier('content_reading', {
      id: this.generateTaskId(),
      type: 'batch_processing',
      priority: 1.0,
      data: { batchId, files: batch.files },
      metadata: {
        sourceTier: 'system',
        targetTier: 'content_reading',
        createdAt: new Date(),
        retryCount: 0,
        maxRetries: 3
      },
      processing: {
        status: 'pending'
      },
      dependencies: []
    });
    
    // Start processing loop
    this.startProcessingLoop();
  }

  private generateTaskId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async sendToTier(tierId: string, task: PipelineTask): Promise<void> {
    const tier = this.tiers.get(tierId);
    if (!tier) return;
    
    task.metadata.targetTier = tierId;
    tier.inputQueue.push(task);
    this.tasks.set(task.id, task);
  }

  private startProcessingLoop(): void {
    setInterval(() => {
      this.processAllTiers();
    }, 100); // Process every 100ms
  }

  private processAllTiers(): void {
    this.tiers.forEach((tier, tierId) => {
      if (tier.status === 'active' && tier.inputQueue.length > 0) {
        this.processTier(tier);
      }
    });
  }

  private processTier(tier: PipelineTier): void {
    // Get available agents
    const availableAgents = tier.agents.filter(agent => agent.status === 'idle');
    
    if (availableAgents.length === 0) {
      tier.status = 'overloaded';
      return;
    }
    
    tier.status = 'active';
    
    // Assign tasks to available agents
    const tasksToProcess = Math.min(availableAgents.length, tier.inputQueue.length);
    
    for (let i = 0; i < tasksToProcess; i++) {
      const task = tier.inputQueue.shift();
      if (!task) continue;
      
      const agent = this.findBestAgentForTask(availableAgents, task);
      if (agent) {
        this.assignTaskToAgent(agent, task, tier);
      }
    }
  }

  private findBestAgentForTask(agents: PipelineAgent[], task: PipelineTask): PipelineAgent | null {
    let bestAgent: PipelineAgent | null = null;
    let bestScore = 0;
    
    agents.forEach(agent => {
      const score = this.calculateAgentTaskMatch(agent, task);
      if (score > bestScore) {
        bestScore = score;
        bestAgent = agent;
      }
    });
    
    return bestAgent;
  }

  private calculateAgentTaskMatch(agent: PipelineAgent, task: PipelineTask): number {
    let score = 0;
    
    // Performance score
    score += agent.performance.successRate * 0.3;
    score += (1 - agent.performance.averageProcessingTime / 10000) * 0.2;
    score += agent.performance.qualityScore * 0.2;
    
    // Specialization match
    const taskVector = this.vectorizeTask(task);
    const similarity = this.calculateCosineSimilarity(agent.vectorRepresentation, taskVector);
    score += similarity * 0.3;
    
    return score;
  }

  private vectorizeTask(task: PipelineTask): number[] {
    const vector = new Array(this.vectorDimensions).fill(0);
    const taskText = JSON.stringify(task.data).toLowerCase();
    const keywords = this.extractKeywords(taskText);
    
    keywords.forEach((keyword, index) => {
      const hash = this.hashString(keyword);
      vector[hash % this.vectorDimensions] += 1 / keywords.length;
    });
    
    return this.normalizeVector(vector);
  }

  private extractKeywords(text: string): string[] {
    return text.toLowerCase()
      .split(/\W+/)
      .filter(word => word.length > 3)
      .slice(0, 20);
  }

  private calculateCosineSimilarity(vec1: number[], vec2: number[]): number {
    const dotProduct = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);
    const mag1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
    const mag2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0));
    
    return mag1 && mag2 ? dotProduct / (mag1 * mag2) : 0;
  }

  private assignTaskToAgent(agent: PipelineAgent, task: PipelineTask, tier: PipelineTier): void {
    agent.status = 'processing';
    agent.currentTask = task;
    agent.processedTasks++;
    
    task.processing.assignedAgent = agent.id;
    task.processing.startTime = new Date();
    task.processing.status = 'processing';
    
    tier.currentLoad++;
    
    // Simulate task processing
    this.processTask(agent, task, tier);
  }

  private async processTask(agent: PipelineAgent, task: PipelineTask, tier: PipelineTier): Promise<void> {
    try {
      const processingTime = this.calculateProcessingTime(agent, task);
      
      setTimeout(() => {
        const result = this.executeTaskLogic(agent, task);
        
        task.processing.endTime = new Date();
        task.processing.status = 'completed';
        task.processing.result = result;
        
        // Update agent performance
        this.updateAgentPerformance(agent, task, true, processingTime);
        
        // Move task to output queue
        tier.outputQueue.push(task);
        tier.currentLoad--;
        
        // Reset agent status
        agent.status = 'idle';
        agent.currentTask = undefined;
        
        // Route to next tier
        this.routeTaskToNextTier(task, tier);
        
      }, processingTime);
      
    } catch (error) {
      task.processing.endTime = new Date();
      task.processing.status = 'failed';
      task.processing.error = error.message;
      
      this.updateAgentPerformance(agent, task, false, 0);
      
      tier.currentLoad--;
      agent.status = 'idle';
      agent.currentTask = undefined;
      
      // Retry logic
      if (task.metadata.retryCount < task.metadata.maxRetries) {
        task.metadata.retryCount++;
        task.processing.status = 'pending';
        tier.inputQueue.push(task);
      }
    }
  }

  private calculateProcessingTime(agent: PipelineAgent, task: PipelineTask): number {
    const baseTime = agent.performance.averageProcessingTime;
    const complexity = this.estimateTaskComplexity(task);
    const agentEfficiency = agent.performance.successRate;
    
    return baseTime * complexity / agentEfficiency;
  }

  private estimateTaskComplexity(task: PipelineTask): number {
    let complexity = 1.0;
    
    if (task.type === 'batch_processing') {
      const fileCount = task.data.files?.length || 1;
      complexity += Math.log(fileCount) * 0.1;
    }
    
    if (task.data.size) {
      const sizeMB = task.data.size / (1024 * 1024);
      complexity += Math.log(sizeMB + 1) * 0.2;
    }
    
    return Math.min(complexity, 5.0);
  }

  private executeTaskLogic(agent: PipelineAgent, task: PipelineTask): any {
    const tierId = agent.tier;
    
    switch (tierId) {
      case 'content_reading':
        return this.executeContentReading(task);
      case 'content_classification':
        return this.executeContentClassification(task);
      case 'content_analysis':
        return this.executeContentAnalysis(task);
      case 'task_creation':
        return this.executeTaskCreation(task);
      case 'task_processing':
        return this.executeTaskProcessing(task);
      case 'result_collection':
        return this.executeResultCollection(task);
      case 'information_synthesis':
        return this.executeInformationSynthesis(task);
      case 'validation_evaluation':
        return this.executeValidationEvaluation(task);
      case 'result_delivery':
        return this.executeResultDelivery(task);
      case 'system_coordination':
        return this.executeSystemCoordination(task);
      default:
        return { status: 'completed', data: 'processed' };
    }
  }

  private executeContentReading(task: PipelineTask): any {
    const files = task.data.files || [];
    const results = files.map(file => ({
      fileId: file.id,
      content: `Extracted content from ${file.path}`,
      metadata: {
        size: file.size,
        type: file.type,
        extractedAt: new Date()
      }
    }));
    
    return {
      status: 'completed',
      data: results,
      processedFiles: files.length
    };
  }

  private executeContentClassification(task: PipelineTask): any {
    const contentData = task.data.data || [];
    const classifications = contentData.map((content: any) => ({
      fileId: content.fileId,
      classification: {
        type: 'document',
        category: 'text',
        language: 'en',
        priority: 'medium',
        complexity: 0.5
      }
    }));
    
    return {
      status: 'completed',
      data: classifications,
      classifiedItems: contentData.length
    };
  }

  private executeContentAnalysis(task: PipelineTask): any {
    const classifications = task.data.data || [];
    const analyses = classifications.map((classification: any) => ({
      fileId: classification.fileId,
      analysis: {
        entities: ['entity1', 'entity2'],
        topics: ['topic1', 'topic2'],
        sentiment: 'neutral',
        quality: 0.8
      }
    }));
    
    return {
      status: 'completed',
      data: analyses,
      analyzedItems: classifications.length
    };
  }

  private executeTaskCreation(task: PipelineTask): any {
    const analyses = task.data.data || [];
    const tasks = analyses.map((analysis: any) => ({
      taskId: this.generateTaskId(),
      fileId: analysis.fileId,
      taskType: 'data_processing',
      requirements: ['processing', 'analysis'],
      priority: 0.7,
      estimatedDuration: 5000
    }));
    
    return {
      status: 'completed',
      data: tasks,
      createdTasks: tasks.length
    };
  }

  private executeTaskProcessing(task: PipelineTask): any {
    const tasks = task.data.data || [];
    const results = tasks.map((taskItem: any) => ({
      taskId: taskItem.taskId,
      result: {
        processed: true,
        output: `Processed result for ${taskItem.fileId}`,
        metrics: {
          accuracy: 0.9,
          completeness: 0.95,
          efficiency: 0.85
        }
      }
    }));
    
    return {
      status: 'completed',
      data: results,
      processedTasks: tasks.length
    };
  }

  private executeResultCollection(task: PipelineTask): any {
    const results = task.data.data || [];
    const collected = results.map((result: any) => ({
      taskId: result.taskId,
      result: result.result,
      collectedAt: new Date(),
      validated: true
    }));
    
    // Deduplicate results
    const deduplicated = this.deduplicateResults(collected);
    
    return {
      status: 'completed',
      data: deduplicated,
      collectedResults: results.length,
      deduplicatedResults: deduplicated.length
    };
  }

  private deduplicateResults(results: any[]): any[] {
    const seen = new Set();
    return results.filter(result => {
      const key = JSON.stringify(result.result);
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  private executeInformationSynthesis(task: PipelineTask): any {
    const results = task.data.data || [];
    const synthesized = {
      summary: `Synthesized ${results.length} results`,
      insights: ['insight1', 'insight2', 'insight3'],
      patterns: ['pattern1', 'pattern2'],
      recommendations: ['recommendation1', 'recommendation2'],
      metadata: {
        synthesizedAt: new Date(),
        sourceCount: results.length,
        confidence: 0.9
      }
    };
    
    return {
      status: 'completed',
      data: synthesized,
      synthesizedFrom: results.length
    };
  }

  private executeValidationEvaluation(task: PipelineTask): any {
    const synthesis = task.data.data;
    const validation = {
      isValid: true,
      quality: 0.9,
      accuracy: 0.95,
      completeness: 0.98,
      consistency: 0.92,
      issues: [],
      recommendations: ['continue_processing'],
      validatedAt: new Date()
    };
    
    return {
      status: 'completed',
      data: validation,
      validated: synthesis ? 'synthesis' : 'unknown'
    };
  }

  private executeResultDelivery(task: PipelineTask): any {
    const validation = task.data.data;
    const delivery = {
      delivered: true,
      format: 'json',
      destination: 'output_system',
      deliveredAt: new Date(),
      metadata: {
        size: JSON.stringify(validation).length,
        format: 'application/json',
        compression: 'gzip'
      }
    };
    
    return {
      status: 'completed',
      data: delivery,
      deliveryStatus: 'success'
    };
  }

  private executeSystemCoordination(task: PipelineTask): any {
    const delivery = task.data.data;
    const coordination = {
      systemStatus: 'healthy',
      performance: {
        throughput: 1000,
        latency: 100,
        errorRate: 0.01
      },
      resources: {
        cpu: 0.7,
        memory: 0.6,
        storage: 0.4
      },
      recommendations: ['scale_up', 'optimize'],
      coordinatedAt: new Date()
    };
    
    return {
      status: 'completed',
      data: coordination,
      coordinationStatus: 'optimal'
    };
  }

  private updateAgentPerformance(agent: PipelineAgent, task: PipelineTask, success: boolean, processingTime: number): void {
    const weight = 0.1;
    
    // Update success rate
    agent.performance.successRate = agent.performance.successRate * (1 - weight) + (success ? 1 : 0) * weight;
    
    // Update average processing time
    agent.performance.averageProcessingTime = agent.performance.averageProcessingTime * (1 - weight) + processingTime * weight;
    
    // Update quality score
    const qualityScore = success ? 0.9 : 0.3;
    agent.performance.qualityScore = agent.performance.qualityScore * (1 - weight) + qualityScore * weight;
  }

  private routeTaskToNextTier(task: PipelineTask, currentTier: PipelineTier): void {
    const nextTierId = this.getNextTierId(currentTier.id);
    
    if (nextTierId) {
      // Create new task for next tier
      const nextTask: PipelineTask = {
        id: this.generateTaskId(),
        type: this.getTaskTypeForTier(nextTierId),
        priority: task.priority,
        data: task.processing.result,
        metadata: {
          sourceTier: currentTier.id,
          targetTier: nextTierId,
          createdAt: new Date(),
          retryCount: 0,
          maxRetries: 3
        },
        processing: {
          status: 'pending'
        },
        dependencies: [task.id]
      };
      
      this.sendToTier(nextTierId, nextTask);
    } else {
      // Pipeline completed
      this.handlePipelineCompletion(task);
    }
  }

  private getNextTierId(currentTierId: string): string | null {
    const tierOrder = [
      'content_reading',
      'content_classification',
      'content_analysis',
      'task_creation',
      'task_processing',
      'result_collection',
      'information_synthesis',
      'validation_evaluation',
      'result_delivery',
      'system_coordination'
    ];
    
    const currentIndex = tierOrder.indexOf(currentTierId);
    return currentIndex < tierOrder.length - 1 ? tierOrder[currentIndex + 1] : null;
  }

  private getTaskTypeForTier(tierId: string): string {
    const taskTypes: { [key: string]: string } = {
      'content_reading': 'content_reading',
      'content_classification': 'content_classification',
      'content_analysis': 'content_analysis',
      'task_creation': 'task_creation',
      'task_processing': 'task_processing',
      'result_collection': 'result_collection',
      'information_synthesis': 'information_synthesis',
      'validation_evaluation': 'validation_evaluation',
      'result_delivery': 'result_delivery',
      'system_coordination': 'system_coordination'
    };
    
    return taskTypes[tierId] || 'general_processing';
  }

  private handlePipelineCompletion(task: PipelineTask): void {
    // Find the original batch
    const batchId = this.extractBatchIdFromTask(task);
    const batch = this.fileBatches.get(batchId);
    
    if (batch) {
      batch.status = 'completed';
      console.log(`Pipeline completed for batch ${batchId}`);
    }
  }

  private extractBatchIdFromTask(task: PipelineTask): string {
    // Extract batch ID from task data or dependencies
    if (task.data.batchId) return task.data.batchId;
    
    // Search through task chain to find original batch
    let currentTask = task;
    while (currentTask.dependencies.length > 0) {
      const dependencyId = currentTask.dependencies[0];
      const dependencyTask = this.tasks.get(dependencyId);
      if (dependencyTask && dependencyTask.data.batchId) {
        return dependencyTask.data.batchId;
      }
      currentTask = dependencyTask || currentTask;
    }
    
    return 'unknown';
  }

  // Public methods for monitoring and management
  public getPipelineStatus(): any {
    const tierStatuses = Array.from(this.tiers.values()).map(tier => ({
      id: tier.id,
      name: tier.name,
      level: tier.level,
      status: tier.status,
      capacity: tier.capacity,
      currentLoad: tier.currentLoad,
      queueSizes: {
        input: tier.inputQueue.length,
        output: tier.outputQueue.length
      },
      agents: {
        total: tier.agents.length,
        active: tier.agents.filter(a => a.status === 'processing').length,
        idle: tier.agents.filter(a => a.status === 'idle').length
      }
    }));
    
    return {
      tiers: tierStatuses,
      totalAgents: this.agents.size,
      totalTasks: this.tasks.size,
      activeBatches: Array.from(this.fileBatches.values()).filter(b => b.status === 'processing').length,
      completedBatches: Array.from(this.fileBatches.values()).filter(b => b.status === 'completed').length,
      systemHealth: this.calculateSystemHealth()
    };
  }

  private calculateSystemHealth(): number {
    let health = 100;
    
    this.tiers.forEach(tier => {
      const loadRatio = tier.currentLoad / tier.capacity;
      if (loadRatio > 0.9) health -= 10;
      if (tier.status === 'overloaded') health -= 20;
    });
    
    return Math.max(0, health);
  }

  public getBatchStatus(batchId: string): any {
    const batch = this.fileBatches.get(batchId);
    if (!batch) return null;
    
    return {
      batch,
      progress: this.calculateBatchProgress(batchId),
      estimatedCompletion: this.estimateBatchCompletion(batchId)
    };
  }

  private calculateBatchProgress(batchId: string): number {
    const batch = this.fileBatches.get(batchId);
    if (!batch) return 0;
    
    // Calculate progress based on task completion in pipeline
    let totalTasks = 0;
    let completedTasks = 0;
    
    this.tasks.forEach(task => {
      if (this.isTaskRelatedToBatch(task, batchId)) {
        totalTasks++;
        if (task.processing.status === 'completed') {
          completedTasks++;
        }
      }
    });
    
    return totalTasks > 0 ? completedTasks / totalTasks : 0;
  }

  private isTaskRelatedToBatch(task: PipelineTask, batchId: string): boolean {
    if (task.data.batchId === batchId) return true;
    
    // Check if task is in the dependency chain of the batch
    let currentTask = task;
    while (currentTask.dependencies.length > 0) {
      const dependencyId = currentTask.dependencies[0];
      const dependencyTask = this.tasks.get(dependencyId);
      if (dependencyTask && dependencyTask.data.batchId === batchId) {
        return true;
      }
      currentTask = dependencyTask || currentTask;
    }
    
    return false;
  }

  private estimateBatchCompletion(batchId: string): Date {
    const batch = this.fileBatches.get(batchId);
    if (!batch) return new Date();
    
    const progress = this.calculateBatchProgress(batchId);
    const elapsedTime = Date.now() - batch.createdAt.getTime();
    
    if (progress === 0) return new Date(Date.now() + batch.estimatedProcessingTime * 1000);
    
    const estimatedTotalTime = elapsedTime / progress;
    return new Date(batch.createdAt.getTime() + estimatedTotalTime);
  }
}
