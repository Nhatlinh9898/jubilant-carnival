import { CollectedResult, ResultType } from './resultCollectionAgents';
import { ContentAnalysis } from './contentAnalysisAgents';
import { ContentClassification } from './contentClassificationAgents';

// Information Synthesis Interfaces
export interface SynthesizedInformation {
  id: string;
  sourceResults: string[];
  contentId: string;
  synthesisType: SynthesisType;
  synthesizedData: any;
  metadata: SynthesisMetadata;
  quality: SynthesisQuality;
  insights: Insight[];
  relationships: Relationship[];
  timestamp: Date;
}

export interface SynthesisMetadata {
  synthesisTime: number;
  agentId: string;
  algorithm: string;
  parameters: Record<string, any>;
  confidence: number;
  completeness: number;
  coherence: number;
  novelty: number;
  errors?: string[];
  warnings?: string[];
}

export interface SynthesisQuality {
  overallScore: number;
  accuracy: number;
  relevance: number;
  completeness: number;
  coherence: number;
  novelty: number;
  reliability: number;
}

export interface Insight {
  id: string;
  type: InsightType;
  content: string;
  confidence: number;
  evidence: string[];
  importance: number;
  category: string;
}

export interface Relationship {
  id: string;
  type: RelationshipType;
  source: string;
  target: string;
  strength: number;
  confidence: number;
  description: string;
}

export enum SynthesisType {
  KNOWLEDGE_FUSION = 'knowledge_fusion',
  PATTERN_INTEGRATION = 'pattern_integration',
  SEMANTIC_SYNTHESIS = 'semantic_synthesis',
  CROSS_DOMAIN_SYNTHESIS = 'cross_domain_synthesis',
  TEMPORAL_SYNTHESIS = 'temporal_synthesis',
  HIERARCHICAL_SYNTHESIS = 'hierarchical_synthesis'
}

export enum InsightType {
  CORRELATION = 'correlation',
  CAUSATION = 'causation',
  PATTERN = 'pattern',
  ANOMALY = 'anomaly',
  TREND = 'trend',
  CONTRADICTION = 'contradiction',
  OPPORTUNITY = 'opportunity',
  RISK = 'risk'
}

export enum RelationshipType {
  CAUSAL = 'causal',
  CORRELATIONAL = 'correlational',
  TEMPORAL = 'temporal',
  SPATIAL = 'spatial',
  SEMANTIC = 'semantic',
  HIERARCHICAL = 'hierarchical',
  DEPENDENCY = 'dependency',
  CONTRADICTION = 'contradiction'
}

// Synthesis Strategies
export abstract class SynthesisStrategy {
  abstract name: string;
  abstract supportedResultTypes: ResultType[];
  abstract synthesisType: SynthesisType;
  
  abstract synthesize(results: CollectedResult[], context?: any): Promise<SynthesizedInformation>;
  
  protected generateSynthesisId(): string {
    return `synthesis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  protected calculateConfidence(results: CollectedResult[]): number {
    if (results.length === 0) return 0;
    
    const totalConfidence = results.reduce((sum, result) => sum + result.metadata.confidence, 0);
    return totalConfidence / results.length;
  }
  
  protected calculateCompleteness(results: CollectedResult[]): number {
    if (results.length === 0) return 0;
    
    const totalCompleteness = results.reduce((sum, result) => sum + result.metadata.completeness, 0);
    return totalCompleteness / results.length;
  }
  
  protected extractInsights(results: CollectedResult[]): Insight[] {
    const insights: Insight[] = [];
    
    // Analyze results for patterns and anomalies
    const patterns = this.identifyPatterns(results);
    const anomalies = this.identifyAnomalies(results);
    const correlations = this.identifyCorrelations(results);
    
    insights.push(...patterns, ...anomalies, ...correlations);
    
    return insights;
  }
  
  protected extractRelationships(results: CollectedResult[]): Relationship[] {
    const relationships: Relationship[] = [];
    
    // Identify relationships between results
    for (let i = 0; i < results.length; i++) {
      for (let j = i + 1; j < results.length; j++) {
        const relationship = this.analyzeRelationship(results[i], results[j]);
        if (relationship) {
          relationships.push(relationship);
        }
      }
    }
    
    return relationships;
  }
  
  private identifyPatterns(results: CollectedResult[]): Insight[] {
    // Simple pattern identification
    const insights: Insight[] = [];
    
    // Check for common result types
    const typeCounts = new Map<ResultType, number>();
    results.forEach(result => {
      typeCounts.set(result.resultType, (typeCounts.get(result.resultType) || 0) + 1);
    });
    
    typeCounts.forEach((count, type) => {
      if (count > 1) {
        insights.push({
          id: `pattern_${type}_${Date.now()}`,
          type: InsightType.PATTERN,
          content: `Multiple ${type} results detected, indicating consistent processing patterns`,
          confidence: 0.8,
          evidence: results.filter(r => r.resultType === type).map(r => r.id),
          importance: count / results.length,
          category: 'pattern_analysis'
        });
      }
    });
    
    return insights;
  }
  
  private identifyAnomalies(results: CollectedResult[]): Insight[] {
    const insights: Insight[] = [];
    
    // Check for quality outliers
    const qualities = results.map(r => r.quality.overallScore);
    const avgQuality = qualities.reduce((sum, q) => sum + q, 0) / qualities.length;
    const threshold = 0.3;
    
    results.forEach(result => {
      if (Math.abs(result.quality.overallScore - avgQuality) > threshold) {
        insights.push({
          id: `anomaly_${result.id}_${Date.now()}`,
          type: InsightType.ANOMALY,
          content: `Quality anomaly detected in result ${result.id}: ${result.quality.overallScore.toFixed(2)} vs average ${avgQuality.toFixed(2)}`,
          confidence: 0.7,
          evidence: [result.id],
          importance: Math.abs(result.quality.overallScore - avgQuality),
          category: 'quality_analysis'
        });
      }
    });
    
    return insights;
  }
  
  private identifyCorrelations(results: CollectedResult[]): Insight[] {
    const insights: Insight[] = [];
    
    // Simple correlation analysis between quality and confidence
    const qualityConfidencePairs = results.map(r => ({ quality: r.quality.overallScore, confidence: r.metadata.confidence }));
    const correlation = this.calculateCorrelation(qualityConfidencePairs.map(p => p.quality), qualityConfidencePairs.map(p => p.confidence));
    
    if (Math.abs(correlation) > 0.5) {
      insights.push({
        id: `correlation_quality_confidence_${Date.now()}`,
        type: InsightType.CORRELATION,
        content: `Strong correlation (${correlation.toFixed(2)}) detected between quality and confidence scores`,
        confidence: 0.8,
        evidence: results.map(r => r.id),
        importance: Math.abs(correlation),
        category: 'correlation_analysis'
      });
    }
    
    return insights;
  }
  
  private calculateCorrelation(x: number[], y: number[]): number {
    const n = x.length;
    if (n === 0) return 0;
    
    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
    const sumX2 = x.reduce((sum, val) => sum + val * val, 0);
    const sumY2 = y.reduce((sum, val) => sum + val * val, 0);
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    
    return denominator === 0 ? 0 : numerator / denominator;
  }
  
  private analyzeRelationship(result1: CollectedResult, result2: CollectedResult): Relationship | null {
    // Simple relationship analysis based on similarity
    const similarity = this.calculateResultSimilarity(result1, result2);
    
    if (similarity > 0.7) {
      return {
        id: `rel_${result1.id}_${result2.id}_${Date.now()}`,
        type: RelationshipType.SEMANTIC,
        source: result1.id,
        target: result2.id,
        strength: similarity,
        confidence: 0.8,
        description: `High semantic similarity (${similarity.toFixed(2)}) between results`
      };
    }
    
    return null;
  }
  
  private calculateResultSimilarity(result1: CollectedResult, result2: CollectedResult): number {
    // Simple similarity calculation
    let similarity = 0;
    
    // Result type similarity
    if (result1.resultType === result2.resultType) similarity += 0.3;
    
    // Quality similarity
    const qualityDiff = Math.abs(result1.quality.overallScore - result2.quality.overallScore);
    similarity += (1 - qualityDiff) * 0.3;
    
    // Content similarity (simplified)
    const contentSimilarity = this.calculateContentSimilarity(result1.data, result2.data);
    similarity += contentSimilarity * 0.4;
    
    return similarity;
  }
  
  private calculateContentSimilarity(data1: any, data2: any): number {
    const str1 = JSON.stringify(data1 || {});
    const str2 = JSON.stringify(data2 || {});
    
    if (str1 === str2) return 1.0;
    
    // Simple Jaccard similarity for keys
    const keys1 = new Set(Object.keys(data1 || {}));
    const keys2 = new Set(Object.keys(data2 || {}));
    const intersection = new Set([...keys1].filter(x => keys2.has(x)));
    const union = new Set([...keys1, ...keys2]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  }
}

// Knowledge Fusion Strategy
export class KnowledgeFusionStrategy extends SynthesisStrategy {
  name = 'knowledge_fusion';
  supportedResultTypes = [ResultType.ANALYSIS, ResultType.EXTRACTION, ResultType.CLASSIFICATION];
  synthesisType = SynthesisType.KNOWLEDGE_FUSION;

  async synthesize(results: CollectedResult[], context?: any): Promise<SynthesizedInformation> {
    const startTime = Date.now();
    
    try {
      const fusedData = this.fuseKnowledge(results);
      const insights = this.extractInsights(results);
      const relationships = this.extractRelationships(results);
      
      const synthesisTime = Date.now() - startTime;
      const confidence = this.calculateConfidence(results);
      const completeness = this.calculateCompleteness(results);
      const coherence = this.calculateCoherence(fusedData);
      const novelty = this.calculateNovelty(fusedData, results);
      
      return {
        id: this.generateSynthesisId(),
        sourceResults: results.map(r => r.id),
        contentId: results[0]?.contentId || '',
        synthesisType: this.synthesisType,
        synthesizedData: fusedData,
        metadata: {
          synthesisTime,
          agentId: 'knowledge_fusion_agent',
          algorithm: 'knowledge_graph_fusion',
          parameters: context || {},
          confidence,
          completeness,
          coherence,
          novelty
        },
        quality: {
          overallScore: (confidence + completeness + coherence + novelty) / 4,
          accuracy: confidence,
          relevance: completeness,
          completeness,
          coherence,
          novelty,
          reliability: confidence
        },
        insights,
        relationships,
        timestamp: new Date()
      };
      
    } catch (error) {
      return {
        id: this.generateSynthesisId(),
        sourceResults: results.map(r => r.id),
        contentId: results[0]?.contentId || '',
        synthesisType: this.synthesisType,
        synthesizedData: null,
        metadata: {
          synthesisTime: Date.now() - startTime,
          agentId: 'knowledge_fusion_agent',
          algorithm: 'knowledge_graph_fusion',
          parameters: context || {},
          confidence: 0,
          completeness: 0,
          coherence: 0,
          novelty: 0,
          errors: [error instanceof Error ? error.message : 'Unknown error']
        },
        quality: {
          overallScore: 0,
          accuracy: 0,
          relevance: 0,
          completeness: 0,
          coherence: 0,
          novelty: 0,
          reliability: 0
        },
        insights: [],
        relationships: [],
        timestamp: new Date()
      };
    }
  }
  
  private fuseKnowledge(results: CollectedResult[]): any {
    const knowledgeGraph = {
      entities: new Map<string, any>(),
      relationships: new Map<string, any>(),
      concepts: new Map<string, any>(),
      patterns: new Map<string, any>()
    };
    
    results.forEach(result => {
      this.integrateResultIntoGraph(result, knowledgeGraph);
    });
    
    return {
      knowledgeGraph: {
        entities: Array.from(knowledgeGraph.entities.entries()),
        relationships: Array.from(knowledgeGraph.relationships.entries()),
        concepts: Array.from(knowledgeGraph.concepts.entries()),
        patterns: Array.from(knowledgeGraph.patterns.entries())
      },
      fusionSummary: {
        totalResults: results.length,
        uniqueEntities: knowledgeGraph.entities.size,
        uniqueRelationships: knowledgeGraph.relationships.size,
        uniqueConcepts: knowledgeGraph.concepts.size
      }
    };
  }
  
  private integrateResultIntoGraph(result: CollectedResult, graph: any): void {
    // Extract entities from result data
    if (result.data.entities) {
      result.data.entities.forEach((entity: any) => {
        const id = entity.id || entity.name || `entity_${graph.entities.size}`;
        graph.entities.set(id, { ...entity, source: result.id });
      });
    }
    
    // Extract relationships
    if (result.data.relationships) {
      result.data.relationships.forEach((rel: any) => {
        const id = `${rel.source}_${rel.target}_${rel.type}`;
        graph.relationships.set(id, { ...rel, source: result.id });
      });
    }
    
    // Extract concepts
    if (result.data.concepts) {
      result.data.concepts.forEach((concept: any) => {
        const id = concept.id || concept.name || `concept_${graph.concepts.size}`;
        graph.concepts.set(id, { ...concept, source: result.id });
      });
    }
  }
  
  private calculateCoherence(fusedData: any): number {
    if (!fusedData.knowledgeGraph) return 0;
    
    const { entities, relationships, concepts } = fusedData.knowledgeGraph;
    const totalElements = entities.length + relationships.length + concepts.length;
    
    if (totalElements === 0) return 0;
    
    // Coherence based on interconnectedness
    const relationshipDensity = relationships.length / Math.max(entities.length, 1);
    const conceptCoverage = concepts.length / Math.max(entities.length, 1);
    
    return Math.min(1, (relationshipDensity * 0.6) + (conceptCoverage * 0.4));
  }
  
  private calculateNovelty(fusedData: any, results: CollectedResult[]): number {
    // Novelty based on new connections and patterns
    if (!fusedData.knowledgeGraph) return 0;
    
    const { relationships, patterns } = fusedData.knowledgeGraph;
    const originalRelationships = results.reduce((sum, result) => {
      return sum + (result.data.relationships?.length || 0);
    }, 0);
    
    const noveltyFactor = relationships.length > originalRelationships ? 
      (relationships.length - originalRelationships) / relationships.length : 0;
    
    return Math.min(1, noveltyFactor + (patterns.length * 0.1));
  }
}

// Pattern Integration Strategy
export class PatternIntegrationStrategy extends SynthesisStrategy {
  name = 'pattern_integration';
  supportedResultTypes = [ResultType.ANALYSIS, ResultType.VALIDATION, ResultType.ENRICHMENT];
  synthesisType = SynthesisType.PATTERN_INTEGRATION;

  async synthesize(results: CollectedResult[], context?: any): Promise<SynthesizedInformation> {
    const startTime = Date.now();
    
    try {
      const integratedPatterns = this.integratePatterns(results);
      const insights = this.extractInsights(results);
      const relationships = this.extractRelationships(results);
      
      const synthesisTime = Date.now() - startTime;
      const confidence = this.calculateConfidence(results);
      const completeness = this.calculateCompleteness(results);
      const coherence = this.calculatePatternCoherence(integratedPatterns);
      const novelty = this.calculatePatternNovelty(integratedPatterns);
      
      return {
        id: this.generateSynthesisId(),
        sourceResults: results.map(r => r.id),
        contentId: results[0]?.contentId || '',
        synthesisType: this.synthesisType,
        synthesizedData: integratedPatterns,
        metadata: {
          synthesisTime,
          agentId: 'pattern_integration_agent',
          algorithm: 'pattern_merging',
          parameters: context || {},
          confidence,
          completeness,
          coherence,
          novelty
        },
        quality: {
          overallScore: (confidence + completeness + coherence + novelty) / 4,
          accuracy: confidence,
          relevance: completeness,
          completeness,
          coherence,
          novelty,
          reliability: confidence
        },
        insights,
        relationships,
        timestamp: new Date()
      };
      
    } catch (error) {
      return {
        id: this.generateSynthesisId(),
        sourceResults: results.map(r => r.id),
        contentId: results[0]?.contentId || '',
        synthesisType: this.synthesisType,
        synthesizedData: null,
        metadata: {
          synthesisTime: Date.now() - startTime,
          agentId: 'pattern_integration_agent',
          algorithm: 'pattern_merging',
          parameters: context || {},
          confidence: 0,
          completeness: 0,
          coherence: 0,
          novelty: 0,
          errors: [error instanceof Error ? error.message : 'Unknown error']
        },
        quality: {
          overallScore: 0,
          accuracy: 0,
          relevance: 0,
          completeness: 0,
          coherence: 0,
          novelty: 0,
          reliability: 0
        },
        insights: [],
        relationships: [],
        timestamp: new Date()
      };
    }
  }
  
  private integratePatterns(results: CollectedResult[]): any {
    const patterns = {
      temporal: new Map<string, any>(),
      structural: new Map<string, any>(),
      semantic: new Map<string, any>(),
      behavioral: new Map<string, any>()
    };
    
    results.forEach(result => {
      this.extractPatternsFromResult(result, patterns);
    });
    
    return {
      integratedPatterns: {
        temporal: Array.from(patterns.temporal.entries()),
        structural: Array.from(patterns.structural.entries()),
        semantic: Array.from(patterns.semantic.entries()),
        behavioral: Array.from(patterns.behavioral.entries())
      },
      patternSummary: {
        totalPatterns: Object.values(patterns).reduce((sum: number, map: Map<string, any>) => sum + map.size, 0),
        crossPatternConnections: this.identifyCrossPatternConnections(patterns)
      }
    };
  }
  
  private extractPatternsFromResult(result: CollectedResult, patterns: any): void {
    const data = result.data;
    
    // Extract temporal patterns
    if (data.timestamps || data.timeSeries) {
      const temporalPattern = this.analyzeTemporalPattern(data);
      if (temporalPattern) {
        patterns.temporal.set(`temporal_${result.id}`, temporalPattern);
      }
    }
    
    // Extract structural patterns
    if (data.structure || data.schema) {
      const structuralPattern = this.analyzeStructuralPattern(data);
      if (structuralPattern) {
        patterns.structural.set(`structural_${result.id}`, structuralPattern);
      }
    }
    
    // Extract semantic patterns
    if (data.concepts || data.topics) {
      const semanticPattern = this.analyzeSemanticPattern(data);
      if (semanticPattern) {
        patterns.semantic.set(`semantic_${result.id}`, semanticPattern);
      }
    }
  }
  
  private analyzeTemporalPattern(data: any): any {
    // Simple temporal pattern analysis
    return {
      type: 'temporal',
      frequency: data.frequency || 'unknown',
      periodicity: data.periodicity || 'unknown',
      trend: data.trend || 'stable',
      confidence: 0.7
    };
  }
  
  private analyzeStructuralPattern(data: any): any {
    // Simple structural pattern analysis
    return {
      type: 'structural',
      complexity: data.complexity || 'medium',
      regularity: data.regularity || 'unknown',
      hierarchy: data.hierarchy || 'flat',
      confidence: 0.6
    };
  }
  
  private analyzeSemanticPattern(data: any): any {
    // Simple semantic pattern analysis
    return {
      type: 'semantic',
      domain: data.domain || 'unknown',
      coherence: data.coherence || 0.5,
      richness: data.richness || 'medium',
      confidence: 0.8
    };
  }
  
  private identifyCrossPatternConnections(patterns: any): number {
    // Simple cross-pattern connection analysis
    const types = Object.keys(patterns);
    let connections = 0;
    
    for (let i = 0; i < types.length; i++) {
      for (let j = i + 1; j < types.length; j++) {
        if (patterns[types[i]].size > 0 && patterns[types[j]].size > 0) {
          connections++;
        }
      }
    }
    
    return connections;
  }
  
  private calculatePatternCoherence(integratedPatterns: any): number {
    if (!integratedPatterns.integratedPatterns) return 0;
    
    const patterns = integratedPatterns.integratedPatterns;
    const totalPatterns = Object.values(patterns).reduce((sum: number, arr: any[]) => sum + arr.length, 0);
    
    if (totalPatterns === 0) return 0;
    
    // Coherence based on pattern diversity and connections
    const diversity = Object.values(patterns).filter((arr: any[]) => arr.length > 0).length / Object.keys(patterns).length;
    const connections = integratedPatterns.patternSummary.crossPatternConnections;
    const connectionDensity = connections / Math.max(totalPatterns, 1);
    
    return Math.min(1, (diversity * 0.5) + (connectionDensity * 0.5));
  }
  
  private calculatePatternNovelty(integratedPatterns: any): number {
    // Novelty based on unique pattern combinations
    if (!integratedPatterns.patternSummary) return 0;
    
    const { totalPatterns, crossPatternConnections } = integratedPatterns.patternSummary;
    
    if (totalPatterns === 0) return 0;
    
    // Novelty increases with cross-pattern connections
    return Math.min(1, crossPatternConnections / Math.max(totalPatterns, 1));
  }
}

// Information Synthesis Agent
export interface InformationSynthesisAgent {
  id: string;
  name: string;
  strategies: SynthesisStrategy[];
  performance: AgentPerformance;
  specialization: number[]; // 1024-dimensional vector
  status: 'active' | 'inactive' | 'busy';
}

export interface AgentPerformance {
  totalSyntheses: number;
  successfulSyntheses: number;
  averageSynthesisTime: number;
  averageQualityScore: number;
  averageInsightCount: number;
  lastUpdated: Date;
}

// Information Synthesis Agents Manager
export class InformationSynthesisAgents {
  private strategies: Map<string, SynthesisStrategy> = new Map();
  private agents: Map<string, InformationSynthesisAgent> = new Map();
  private syntheses: Map<string, SynthesizedInformation> = new Map();

  constructor() {
    this.initializeStrategies();
    this.initializeAgents();
  }

  private initializeStrategies(): void {
    const strategies = [
      new KnowledgeFusionStrategy(),
      new PatternIntegrationStrategy()
    ];

    strategies.forEach(strategy => {
      this.strategies.set(strategy.name, strategy);
    });
  }

  private initializeAgents(): void {
    const agentConfigs = [
      { 
        name: 'KnowledgeFusionAgent', 
        strategies: ['knowledge_fusion'],
        capabilities: ['knowledge_graph', 'entity_linking', 'concept_integration']
      },
      { 
        name: 'PatternIntegrationAgent', 
        strategies: ['pattern_integration'],
        capabilities: ['pattern_recognition', 'temporal_analysis', 'structural_analysis']
      }
    ];

    agentConfigs.forEach(config => {
      const agentStrategies = config.strategies
        .map(name => this.strategies.get(name))
        .filter(Boolean) as SynthesisStrategy[];
      
      if (agentStrategies.length > 0) {
        const agent: InformationSynthesisAgent = {
          id: `synthesis_${config.name.toLowerCase()}`,
          name: config.name,
          strategies: agentStrategies,
          performance: {
            totalSyntheses: 0,
            successfulSyntheses: 0,
            averageSynthesisTime: 0,
            averageQualityScore: 0,
            averageInsightCount: 0,
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
      vector[i] = Math.cos(capabilityHash * (i + 1) * 0.05) * 0.5 + 0.5;
    }
    
    return this.normalizeVector(vector);
  }

  private normalizeVector(vector: number[]): number[] {
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    return magnitude > 0 ? vector.map(val => val / magnitude) : vector;
  }

  public async synthesizeInformation(
    results: CollectedResult[],
    synthesisTypes: SynthesisType[],
    context?: any
  ): Promise<SynthesizedInformation[]> {
    const syntheses: SynthesizedInformation[] = [];
    
    for (const synthesisType of synthesisTypes) {
      const agent = this.selectBestAgent(synthesisType);
      if (agent && agent.status === 'active') {
        try {
          agent.status = 'busy';
          const startTime = Date.now();
          
          const strategy = agent.strategies.find(s => s.synthesisType === synthesisType);
          if (strategy) {
            const synthesis = await strategy.synthesize(results, context);
            syntheses.push(synthesis);
            this.syntheses.set(synthesis.id, synthesis);
            this.updateAgentPerformance(agent, synthesis, Date.now() - startTime);
          }
          
        } catch (error) {
          // Error handling
        } finally {
          agent.status = 'active';
        }
      }
    }
    
    return syntheses;
  }

  private selectBestAgent(synthesisType: SynthesisType): InformationSynthesisAgent | undefined {
    const availableAgents = Array.from(this.agents.values())
      .filter(agent => 
        agent.strategies.some(strategy => 
          strategy.synthesisType === synthesisType
        ) && agent.status === 'active'
      );
    
    if (availableAgents.length === 0) return undefined;
    
    return availableAgents.reduce((best, current) => 
      current.performance.averageQualityScore > best.performance.averageQualityScore ? current : best
    );
  }

  private updateAgentPerformance(
    agent: InformationSynthesisAgent, 
    synthesis: SynthesizedInformation, 
    synthesisTime: number
  ): void {
    agent.performance.totalSyntheses++;
    agent.performance.successfulSyntheses++;
    
    const totalSyntheses = agent.performance.totalSyntheses;
    agent.performance.averageSynthesisTime = 
      (agent.performance.averageSynthesisTime * (totalSyntheses - 1) + synthesisTime) / totalSyntheses;
    agent.performance.averageQualityScore = 
      (agent.performance.averageQualityScore * (totalSyntheses - 1) + synthesis.quality.overallScore) / totalSyntheses;
    agent.performance.averageInsightCount = 
      (agent.performance.averageInsightCount * (totalSyntheses - 1) + synthesis.insights.length) / totalSyntheses;
    agent.performance.lastUpdated = new Date();
  }

  public getAgents(): InformationSynthesisAgent[] {
    return Array.from(this.agents.values());
  }

  public getAgentById(id: string): InformationSynthesisAgent | undefined {
    return this.agents.get(id);
  }

  public getSyntheses(): SynthesizedInformation[] {
    return Array.from(this.syntheses.values());
  }

  public getSynthesisById(id: string): SynthesizedInformation | undefined {
    return this.syntheses.get(id);
  }

  public getStrategies(): SynthesisStrategy[] {
    return Array.from(this.strategies.values());
  }
}
