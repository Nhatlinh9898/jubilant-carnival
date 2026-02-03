import { TaskResult, TaskStatus } from './taskProcessingAgents';
import { ContentAnalysis } from './contentAnalysisAgents';
import { ContentClassification } from './contentClassificationAgents';

// Result Collection Interfaces
export interface CollectedResult {
  id: string;
  sourceResults: string[]; // IDs of source results
  contentId: string;
  resultType: ResultType;
  data: any;
  metadata: ResultMetadata;
  quality: ResultQuality;
  deduplicationInfo: DeduplicationInfo;
  timestamp: Date;
}

export interface ResultMetadata {
  collectionTime: number;
  agentId: string;
  algorithm: string;
  processingStages: string[];
  confidence: number;
  completeness: number;
  consistency: number;
  errors?: string[];
  warnings?: string[];
}

export interface ResultQuality {
  overallScore: number;
  accuracy: number;
  reliability: number;
  relevance: number;
  freshness: number;
  completeness: number;
}

export interface DeduplicationInfo {
  isDuplicate: boolean;
  duplicateGroupId?: string;
  similarityScore: number;
  duplicateSource?: string;
  deduplicationMethod: string;
  confidence: number;
}

export enum ResultType {
  ANALYSIS = 'analysis',
  EXTRACTION = 'extraction',
  TRANSFORMATION = 'transformation',
  VALIDATION = 'validation',
  SYNTHESIS = 'synthesis',
  SUMMARIZATION = 'summarization',
  CLASSIFICATION = 'classification',
  ENRICHMENT = 'enrichment'
}

// Deduplication Strategies
export abstract class DeduplicationStrategy {
  abstract name: string;
  abstract supportedResultTypes: ResultType[];
  
  abstract detectDuplicates(results: CollectedResult[]): Promise<DuplicateGroup[]>;
  
  protected calculateSimilarity(result1: CollectedResult, result2: CollectedResult): number {
    // Basic similarity calculation
    let similarity = 0;
    
    // Content similarity
    const contentSim = this.calculateContentSimilarity(result1.data, result2.data);
    similarity += contentSim * 0.4;
    
    // Metadata similarity
    const metadataSim = this.calculateMetadataSimilarity(result1.metadata, result2.metadata);
    similarity += metadataSim * 0.3;
    
    // Quality similarity
    const qualitySim = this.calculateQualitySimilarity(result1.quality, result2.quality);
    similarity += qualitySim * 0.3;
    
    return similarity;
  }
  
  protected calculateContentSimilarity(data1: any, data2: any): number {
    // Simple content similarity based on structure and values
    const str1 = JSON.stringify(data1 || {});
    const str2 = JSON.stringify(data2 || {});
    
    if (str1 === str2) return 1.0;
    
    // Calculate Jaccard similarity for keys
    const keys1 = new Set(Object.keys(data1 || {}));
    const keys2 = new Set(Object.keys(data2 || {}));
    const intersection = new Set([...keys1].filter(x => keys2.has(x)));
    const union = new Set([...keys1, ...keys2]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  }
  
  protected calculateMetadataSimilarity(meta1: ResultMetadata, meta2: ResultMetadata): number {
    let similarity = 0;
    let factors = 0;
    
    // Processing stages similarity
    const stages1 = new Set(meta1.processingStages);
    const stages2 = new Set(meta2.processingStages);
    const stageIntersection = new Set([...stages1].filter(x => stages2.has(x)));
    const stageUnion = new Set([...stages1, ...stages2]);
    
    if (stageUnion.size > 0) {
      similarity += stageIntersection.size / stageUnion.size;
      factors++;
    }
    
    // Algorithm similarity
    if (meta1.algorithm === meta2.algorithm) {
      similarity += 1;
      factors++;
    }
    
    // Confidence similarity
    const confDiff = Math.abs(meta1.confidence - meta2.confidence);
    similarity += (1 - confDiff);
    factors++;
    
    return factors > 0 ? similarity / factors : 0;
  }
  
  protected calculateQualitySimilarity(qual1: ResultQuality, qual2: ResultQuality): number {
    let similarity = 0;
    let factors = 0;
    
    const fields = ['overallScore', 'accuracy', 'reliability', 'relevance', 'freshness', 'completeness'];
    
    fields.forEach(field => {
      const val1 = qual1[field as keyof ResultQuality] as number;
      const val2 = qual2[field as keyof ResultQuality] as number;
      const diff = Math.abs(val1 - val2);
      similarity += (1 - diff);
      factors++;
    });
    
    return factors > 0 ? similarity / factors : 0;
  }
}

export interface DuplicateGroup {
  id: string;
  resultIds: string[];
  representativeId: string;
  similarityThreshold: number;
  method: string;
  confidence: number;
}

// Content-based Deduplication
export class ContentDeduplicationStrategy extends DeduplicationStrategy {
  name = 'content_deduplication';
  supportedResultTypes = [ResultType.ANALYSIS, ResultType.EXTRACTION, ResultType.CLASSIFICATION];

  async detectDuplicates(results: CollectedResult[]): Promise<DuplicateGroup[]> {
    const groups: DuplicateGroup[] = [];
    const processed = new Set<string>();
    
    for (let i = 0; i < results.length; i++) {
      if (processed.has(results[i].id)) continue;
      
      const currentGroup: string[] = [results[i].id];
      let maxSimilarity = 0;
      
      for (let j = i + 1; j < results.length; j++) {
        if (processed.has(results[j].id)) continue;
        
        const similarity = this.calculateContentSimilarity(results[i].data, results[j].data);
        
        if (similarity > 0.8) { // High similarity threshold for content
          currentGroup.push(results[j].id);
          processed.add(results[j].id);
          maxSimilarity = Math.max(maxSimilarity, similarity);
        }
      }
      
      if (currentGroup.length > 1) {
        groups.push({
          id: `content_group_${groups.length + 1}`,
          resultIds: currentGroup,
          representativeId: this.selectRepresentative(currentGroup, results),
          similarityThreshold: 0.8,
          method: 'content_based',
          confidence: maxSimilarity
        });
      }
      
      processed.add(results[i].id);
    }
    
    return groups;
  }
  
  private selectRepresentative(resultIds: string[], results: CollectedResult[]): string {
    // Select the result with highest quality as representative
    let bestResult = resultIds[0];
    let bestQuality = 0;
    
    resultIds.forEach(id => {
      const result = results.find(r => r.id === id);
      if (result && result.quality.overallScore > bestQuality) {
        bestResult = id;
        bestQuality = result.quality.overallScore;
      }
    });
    
    return bestResult;
  }
}

// Semantic Deduplication
export class SemanticDeduplicationStrategy extends DeduplicationStrategy {
  name = 'semantic_deduplication';
  supportedResultTypes = [ResultType.ANALYSIS, ResultType.SYNTHESIS, ResultType.SUMMARIZATION];

  async detectDuplicates(results: CollectedResult[]): Promise<DuplicateGroup[]> {
    const groups: DuplicateGroup[] = [];
    const processed = new Set<string>();
    
    for (let i = 0; i < results.length; i++) {
      if (processed.has(results[i].id)) continue;
      
      const currentGroup: string[] = [results[i].id];
      let maxSimilarity = 0;
      
      for (let j = i + 1; j < results.length; j++) {
        if (processed.has(results[j].id)) continue;
        
        const similarity = this.calculateSemanticSimilarity(results[i], results[j]);
        
        if (similarity > 0.7) { // Medium threshold for semantic similarity
          currentGroup.push(results[j].id);
          processed.add(results[j].id);
          maxSimilarity = Math.max(maxSimilarity, similarity);
        }
      }
      
      if (currentGroup.length > 1) {
        groups.push({
          id: `semantic_group_${groups.length + 1}`,
          resultIds: currentGroup,
          representativeId: this.selectRepresentative(currentGroup, results),
          similarityThreshold: 0.7,
          method: 'semantic_based',
          confidence: maxSimilarity
        });
      }
      
      processed.add(results[i].id);
    }
    
    return groups;
  }
  
  private calculateSemanticSimilarity(result1: CollectedResult, result2: CollectedResult): number {
    // Simulated semantic similarity calculation
    const semanticScore = this.calculateContentSimilarity(result1.data, result2.data);
    const contextualScore = this.calculateMetadataSimilarity(result1.metadata, result2.metadata);
    
    return (semanticScore * 0.6) + (contextualScore * 0.4);
  }
  
  private selectRepresentative(resultIds: string[], results: CollectedResult[]): string {
    // Select based on combined quality and confidence
    let bestResult = resultIds[0];
    let bestScore = 0;
    
    resultIds.forEach(id => {
      const result = results.find(r => r.id === id);
      if (result) {
        const score = (result.quality.overallScore * 0.7) + (result.metadata.confidence * 0.3);
        if (score > bestScore) {
          bestResult = id;
          bestScore = score;
        }
      }
    });
    
    return bestResult;
  }
}

// Structural Deduplication
export class StructuralDeduplicationStrategy extends DeduplicationStrategy {
  name = 'structural_deduplication';
  supportedResultTypes = [ResultType.TRANSFORMATION, ResultType.VALIDATION, ResultType.ENRICHMENT];

  async detectDuplicates(results: CollectedResult[]): Promise<DuplicateGroup[]> {
    const groups: DuplicateGroup[] = [];
    const processed = new Set<string>();
    
    for (let i = 0; i < results.length; i++) {
      if (processed.has(results[i].id)) continue;
      
      const currentGroup: string[] = [results[i].id];
      let maxSimilarity = 0;
      
      for (let j = i + 1; j < results.length; j++) {
        if (processed.has(results[j].id)) continue;
        
        const similarity = this.calculateStructuralSimilarity(results[i], results[j]);
        
        if (similarity > 0.9) { // High threshold for structural similarity
          currentGroup.push(results[j].id);
          processed.add(results[j].id);
          maxSimilarity = Math.max(maxSimilarity, similarity);
        }
      }
      
      if (currentGroup.length > 1) {
        groups.push({
          id: `structural_group_${groups.length + 1}`,
          resultIds: currentGroup,
          representativeId: this.selectRepresentative(currentGroup, results),
          similarityThreshold: 0.9,
          method: 'structural_based',
          confidence: maxSimilarity
        });
      }
      
      processed.add(results[i].id);
    }
    
    return groups;
  }
  
  private calculateStructuralSimilarity(result1: CollectedResult, result2: CollectedResult): number {
    // Focus on structural similarity
    const structure1 = this.extractStructure(result1.data);
    const structure2 = this.extractStructure(result2.data);
    
    return this.calculateContentSimilarity(structure1, structure2);
  }
  
  private extractStructure(data: any): any {
    // Extract only the structure (keys and types) without values
    if (Array.isArray(data)) {
      return data.length > 0 ? [this.extractStructure(data[0])] : [];
    }
    
    if (typeof data === 'object' && data !== null) {
      const structure: any = {};
      Object.keys(data).forEach(key => {
        const value = data[key];
        if (Array.isArray(value)) {
          structure[key] = 'array';
        } else if (typeof value === 'object' && value !== null) {
          structure[key] = this.extractStructure(value);
        } else {
          structure[key] = typeof value;
        }
      });
      return structure;
    }
    
    return typeof data;
  }
  
  private selectRepresentative(resultIds: string[], results: CollectedResult[]): string {
    // Select based on processing time and quality
    let bestResult = resultIds[0];
    let bestScore = 0;
    
    resultIds.forEach(id => {
      const result = results.find(r => r.id === id);
      if (result) {
        const score = (result.quality.reliability * 0.5) + 
                     (result.metadata.completeness * 0.3) + 
                     (1 / (result.metadata.collectionTime + 1) * 0.2);
        if (score > bestScore) {
          bestResult = id;
          bestScore = score;
        }
      }
    });
    
    return bestResult;
  }
}

// Result Collection Agent
export interface ResultCollectionAgent {
  id: string;
  name: string;
  deduplicationStrategies: DeduplicationStrategy[];
  performance: AgentPerformance;
  specialization: number[]; // 1024-dimensional vector
  status: 'active' | 'inactive' | 'busy';
}

export interface AgentPerformance {
  totalResultsCollected: number;
  duplicatesRemoved: number;
  averageCollectionTime: number;
  averageQualityScore: number;
  lastUpdated: Date;
}

// Result Collection Agents Manager
export class ResultCollectionAgents {
  private strategies: Map<string, DeduplicationStrategy> = new Map();
  private agents: Map<string, ResultCollectionAgent> = new Map();
  private collectedResults: Map<string, CollectedResult> = new Map();
  private duplicateGroups: Map<string, DuplicateGroup> = new Map();

  constructor() {
    this.initializeStrategies();
    this.initializeAgents();
  }

  private initializeStrategies(): void {
    const strategies = [
      new ContentDeduplicationStrategy(),
      new SemanticDeduplicationStrategy(),
      new StructuralDeduplicationStrategy()
    ];

    strategies.forEach(strategy => {
      this.strategies.set(strategy.name, strategy);
    });
  }

  private initializeAgents(): void {
    const agentConfigs = [
      { 
        name: 'ContentCollectionAgent', 
        strategies: ['content_deduplication'],
        capabilities: ['content_analysis', 'entity_extraction', 'classification']
      },
      { 
        name: 'SemanticCollectionAgent', 
        strategies: ['semantic_deduplication'],
        capabilities: ['semantic_analysis', 'synthesis', 'summarization']
      },
      { 
        name: 'StructuralCollectionAgent', 
        strategies: ['structural_deduplication'],
        capabilities: ['structure_analysis', 'transformation', 'validation']
      }
    ];

    agentConfigs.forEach(config => {
      const agentStrategies = config.strategies
        .map(name => this.strategies.get(name))
        .filter(Boolean) as DeduplicationStrategy[];
      
      if (agentStrategies.length > 0) {
        const agent: ResultCollectionAgent = {
          id: `result_collection_${config.name.toLowerCase()}`,
          name: config.name,
          deduplicationStrategies: agentStrategies,
          performance: {
            totalResultsCollected: 0,
            duplicatesRemoved: 0,
            averageCollectionTime: 0,
            averageQualityScore: 0,
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
      vector[i] = Math.tan(capabilityHash * (i + 1) * 0.01) * 0.5 + 0.5;
    }
    
    return this.normalizeVector(vector);
  }

  private normalizeVector(vector: number[]): number[] {
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    return magnitude > 0 ? vector.map(val => val / magnitude) : vector;
  }

  public async collectAndDeduplicateResults(
    taskResults: TaskResult[],
    analyses: ContentAnalysis[],
    classifications: ContentClassification[]
  ): Promise<CollectedResult[]> {
    const allResults: CollectedResult[] = [];
    
    // Convert task results to collected results
    for (const taskResult of taskResults) {
      const collected = this.convertTaskResult(taskResult);
      allResults.push(collected);
      this.collectedResults.set(collected.id, collected);
    }
    
    // Convert analyses to collected results
    for (const analysis of analyses) {
      const collected = this.convertAnalysis(analysis);
      allResults.push(collected);
      this.collectedResults.set(collected.id, collected);
    }
    
    // Perform deduplication
    const deduplicatedResults = await this.performDeduplication(allResults);
    
    return deduplicatedResults;
  }

  private convertTaskResult(taskResult: TaskResult): CollectedResult {
    return {
      id: `collected_${taskResult.id}`,
      sourceResults: [taskResult.id],
      contentId: taskResult.taskId,
      resultType: this.mapTaskTypeToResultType(taskResult.taskId),
      data: taskResult.output,
      metadata: {
        collectionTime: taskResult.metadata.processingTime,
        agentId: taskResult.metadata.agentId,
        algorithm: taskResult.metadata.algorithm,
        processingStages: ['task_processing'],
        confidence: taskResult.metadata.confidence,
        completeness: this.estimateCompleteness(taskResult.output),
        consistency: this.estimateConsistency(taskResult.output)
      },
      quality: {
        overallScore: taskResult.metadata.quality,
        accuracy: taskResult.metadata.quality,
        reliability: taskResult.metadata.confidence,
        relevance: 0.8, // Default
        freshness: 1.0, // Fresh since just processed
        completeness: this.estimateCompleteness(taskResult.output)
      },
      deduplicationInfo: {
        isDuplicate: false,
        similarityScore: 0,
        deduplicationMethod: 'none',
        confidence: 1.0
      },
      timestamp: taskResult.timestamp
    };
  }

  private convertAnalysis(analysis: ContentAnalysis): CollectedResult {
    return {
      id: `collected_${analysis.id}`,
      sourceResults: [analysis.id],
      contentId: analysis.contentId,
      resultType: ResultType.ANALYSIS,
      data: analysis.results,
      metadata: {
        collectionTime: analysis.metadata.processingTime,
        agentId: analysis.metadata.agentId,
        algorithm: analysis.metadata.modelVersion,
        processingStages: ['content_analysis'],
        confidence: analysis.confidence,
        completeness: this.estimateCompleteness(analysis.results),
        consistency: this.estimateConsistency(analysis.results)
      },
      quality: {
        overallScore: analysis.confidence,
        accuracy: analysis.confidence,
        reliability: analysis.confidence,
        relevance: 0.9,
        freshness: 1.0,
        completeness: this.estimateCompleteness(analysis.results)
      },
      deduplicationInfo: {
        isDuplicate: false,
        similarityScore: 0,
        deduplicationMethod: 'none',
        confidence: 1.0
      },
      timestamp: analysis.timestamp
    };
  }

  private mapTaskTypeToResultType(taskId: string): ResultType {
    if (taskId.includes('extraction')) return ResultType.EXTRACTION;
    if (taskId.includes('transformation')) return ResultType.TRANSFORMATION;
    if (taskId.includes('validation')) return ResultType.VALIDATION;
    if (taskId.includes('synthesis')) return ResultType.SYNTHESIS;
    if (taskId.includes('summarization')) return ResultType.SUMMARIZATION;
    if (taskId.includes('classification')) return ResultType.CLASSIFICATION;
    if (taskId.includes('enrichment')) return ResultType.ENRICHMENT;
    return ResultType.ANALYSIS;
  }

  private estimateCompleteness(data: any): number {
    if (!data) return 0;
    
    const dataStr = JSON.stringify(data);
    const expectedFields = ['results', 'entities', 'summary', 'data'];
    const presentFields = expectedFields.filter(field => dataStr.includes(field));
    
    return presentFields.length / expectedFields.length;
  }

  private estimateConsistency(data: any): number {
    // Simple consistency check based on data structure
    if (!data) return 0;
    
    try {
      JSON.stringify(data);
      return 0.9; // If JSON serializable, assume high consistency
    } catch {
      return 0.3; // Low consistency if not serializable
    }
  }

  private async performDeduplication(results: CollectedResult[]): Promise<CollectedResult[]> {
    const startTime = Date.now();
    
    // Group results by type for appropriate deduplication
    const resultsByType = new Map<ResultType, CollectedResult[]>();
    
    results.forEach(result => {
      if (!resultsByType.has(result.resultType)) {
        resultsByType.set(result.resultType, []);
      }
      resultsByType.get(result.resultType)!.push(result);
    });
    
    // Apply deduplication strategies
    const allDuplicateGroups: DuplicateGroup[] = [];
    const duplicatesToRemove = new Set<string>();
    
    for (const [resultType, typeResults] of resultsByType) {
      const agent = this.selectBestAgent(resultType);
      if (agent) {
        for (const strategy of agent.deduplicationStrategies) {
          if (strategy.supportedResultTypes.includes(resultType)) {
            const groups = await strategy.detectDuplicates(typeResults);
            allDuplicateGroups.push(...groups);
            
            // Mark non-representative results for removal
            groups.forEach(group => {
              group.resultIds.forEach(id => {
                if (id !== group.representativeId) {
                  duplicatesToRemove.add(id);
                }
              });
            });
          }
        }
      }
    }
    
    // Store duplicate groups
    allDuplicateGroups.forEach(group => {
      this.duplicateGroups.set(group.id, group);
    });
    
    // Filter out duplicates
    const deduplicatedResults = results.filter(result => !duplicatesToRemove.has(result.id));
    
    // Update deduplication info for remaining results
    deduplicatedResults.forEach(result => {
      const duplicateGroup = allDuplicateGroups.find(group => 
        group.resultIds.includes(result.id) && group.representativeId === result.id
      );
      
      if (duplicateGroup) {
        result.deduplicationInfo = {
          isDuplicate: false,
          duplicateGroupId: duplicateGroup.id,
          similarityScore: duplicateGroup.similarityThreshold,
          duplicateSource: duplicateGroup.resultIds.join(','),
          deduplicationMethod: duplicateGroup.method,
          confidence: duplicateGroup.confidence
        };
      }
    });
    
    // Update agent performance
    const processingTime = Date.now() - startTime;
    this.updateAgentPerformance(results.length, duplicatesToRemove.size, processingTime, deduplicatedResults);
    
    return deduplicatedResults;
  }

  private selectBestAgent(resultType: ResultType): ResultCollectionAgent | undefined {
    const availableAgents = Array.from(this.agents.values())
      .filter(agent => 
        agent.deduplicationStrategies.some(strategy => 
          strategy.supportedResultTypes.includes(resultType)
        ) && agent.status === 'active'
      );
    
    if (availableAgents.length === 0) return undefined;
    
    return availableAgents.reduce((best, current) => 
      current.performance.averageQualityScore > best.performance.averageQualityScore ? current : best
    );
  }

  private updateAgentPerformance(
    totalResults: number, 
    duplicatesRemoved: number, 
    processingTime: number,
    finalResults: CollectedResult[]
  ): void {
    this.agents.forEach(agent => {
      agent.performance.totalResultsCollected += totalResults;
      agent.performance.duplicatesRemoved += duplicatesRemoved;
      
      const avgQuality = finalResults.reduce((sum, result) => sum + result.quality.overallScore, 0) / finalResults.length;
      agent.performance.averageQualityScore = 
        (agent.performance.averageQualityScore + avgQuality) / 2;
      
      agent.performance.averageCollectionTime = 
        (agent.performance.averageCollectionTime + processingTime) / 2;
      agent.performance.lastUpdated = new Date();
    });
  }

  public getAgents(): ResultCollectionAgent[] {
    return Array.from(this.agents.values());
  }

  public getAgentById(id: string): ResultCollectionAgent | undefined {
    return this.agents.get(id);
  }

  public getCollectedResults(): CollectedResult[] {
    return Array.from(this.collectedResults.values());
  }

  public getDuplicateGroups(): DuplicateGroup[] {
    return Array.from(this.duplicateGroups.values());
  }

  public getStrategies(): DeduplicationStrategy[] {
    return Array.from(this.strategies.values());
  }
}
