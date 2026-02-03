export interface VectorMatrix {
  dimensions: number;
  data: number[][];
  metadata: {
    createdAt: Date;
    lastUpdated: Date;
    version: number;
  };
}

export interface AgentCapabilityMatrix {
  agentId: string;
  capabilityVectors: Map<string, number[]>;
  interactionMatrix: number[][];
  evolutionHistory: Array<{
    timestamp: Date;
    matrixState: VectorMatrix;
    performance: number;
  }>;
}

export interface SelfDevelopmentModel {
  baseMatrix: VectorMatrix;
  adaptationRate: number;
  learningCoefficients: number[];
  developmentThresholds: {
    capabilityGrowth: number;
    efficiencyImprovement: number;
    noveltyDetection: number;
  };
}

export class VectorMatrixModels {
  private matrices: Map<string, AgentCapabilityMatrix> = new Map();
  private developmentModels: Map<string, SelfDevelopmentModel> = new Map();
  private dimensions: number = 512;

  constructor() {
    this.initializeBaseModels();
  }

  private initializeBaseModels(): void {
    // Initialize base capability vectors
    const baseCapabilities = [
      'analysis', 'synthesis', 'coordination', 'learning', 
      'adaptation', 'communication', 'optimization', 'creativity'
    ];

    baseCapabilities.forEach(capability => {
      const vector = this.generateCapabilityVector(capability);
      // Store in a global capability registry
    });
  }

  private generateCapabilityVector(capability: string): number[] {
    const vector = new Array(this.dimensions).fill(0);
    const hash = this.hashString(capability);
    
    // Create a distributed representation
    for (let i = 0; i < this.dimensions; i++) {
      vector[i] = Math.sin((hash + i) * 0.1) * 0.5 + 0.5;
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

  // Create agent capability matrix
  public createAgentCapabilityMatrix(agentId: string, capabilities: string[]): AgentCapabilityMatrix {
    const capabilityVectors = new Map<string, number[]>();
    const interactionMatrix = this.createInteractionMatrix(capabilities.length);

    capabilities.forEach(capability => {
      capabilityVectors.set(capability, this.generateCapabilityVector(capability));
    });

    const matrix: AgentCapabilityMatrix = {
      agentId,
      capabilityVectors,
      interactionMatrix,
      evolutionHistory: []
    };

    this.matrices.set(agentId, matrix);
    return matrix;
  }

  private createInteractionMatrix(size: number): number[][] {
    const matrix = Array(size).fill(0).map(() => Array(size).fill(0));
    
    // Initialize with random interaction weights
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (i !== j) {
          matrix[i][j] = Math.random() * 0.3; // Initial interaction strength
        }
      }
    }
    
    return matrix;
  }

  // Update agent capabilities based on experience
  public updateAgentCapabilities(
    agentId: string, 
    experience: any, 
    performance: number
  ): void {
    const matrix = this.matrices.get(agentId);
    if (!matrix) return;

    // Update capability vectors based on experience
    this.updateCapabilityVectors(matrix, experience);
    
    // Update interaction matrix
    this.updateInteractionMatrix(matrix, experience);
    
    // Record evolution
    this.recordEvolution(matrix, performance);
    
    // Check for self-development opportunities
    this.checkSelfDevelopmentOpportunities(agentId, matrix);
  }

  private updateCapabilityVectors(matrix: AgentCapabilityMatrix, experience: any): void {
    const learningRate = 0.01;
    const experienceVector = this.vectorizeExperience(experience);

    matrix.capabilityVectors.forEach((vector, capability) => {
      if (this.isCapabilityRelevant(capability, experience)) {
        // Update vector towards experience representation
        for (let i = 0; i < vector.length; i++) {
          vector[i] += learningRate * (experienceVector[i] - vector[i]);
        }
        
        // Normalize to maintain vector properties
        matrix.capabilityVectors.set(capability, this.normalizeVector(vector));
      }
    });
  }

  private vectorizeExperience(experience: any): number[] {
    const vector = new Array(this.dimensions).fill(0);
    const experienceText = JSON.stringify(experience).toLowerCase();
    const keywords = this.extractKeywords(experienceText);

    keywords.forEach((keyword, index) => {
      const hash = this.hashString(keyword);
      const position = hash % this.dimensions;
      vector[position] += 1 / keywords.length;
    });

    return this.normalizeVector(vector);
  }

  private extractKeywords(text: string): string[] {
    return text.toLowerCase()
      .split(/\W+/)
      .filter(word => word.length > 3)
      .slice(0, 15);
  }

  private isCapabilityRelevant(capability: string, experience: any): boolean {
    const experienceText = JSON.stringify(experience).toLowerCase();
    return experienceText.includes(capability.toLowerCase()) ||
           this.calculateSemanticSimilarity(capability, experienceText) > 0.3;
  }

  private calculateSemanticSimilarity(term1: string, term2: string): number {
    const words1 = term1.toLowerCase().split(/\W+/);
    const words2 = term2.toLowerCase().split(/\W+/);
    
    const intersection = words1.filter(word => words2.includes(word));
    const union = [...new Set([...words1, ...words2])];
    
    return intersection.length / union.length;
  }

  private updateInteractionMatrix(matrix: AgentCapabilityMatrix, experience: any): void {
    const capabilities = Array.from(matrix.capabilityVectors.keys());
    const activeCapabilities = capabilities.filter(cap => 
      this.isCapabilityRelevant(cap, experience)
    );

    // Strengthen connections between active capabilities
    activeCapabilities.forEach((cap1, i) => {
      activeCapabilities.forEach((cap2, j) => {
        if (i !== j) {
          const idx1 = capabilities.indexOf(cap1);
          const idx2 = capabilities.indexOf(cap2);
          matrix.interactionMatrix[idx1][idx2] = Math.min(1.0, 
            matrix.interactionMatrix[idx1][idx2] + 0.05
          );
        }
      });
    });
  }

  private recordEvolution(matrix: AgentCapabilityMatrix, performance: number): void {
    const matrixState: VectorMatrix = {
      dimensions: this.dimensions,
      data: Array.from(matrix.capabilityVectors.values()),
      metadata: {
        createdAt: new Date(),
        lastUpdated: new Date(),
        version: matrix.evolutionHistory.length + 1
      }
    };

    matrix.evolutionHistory.push({
      timestamp: new Date(),
      matrixState,
      performance
    });

    // Keep only recent history (last 50 entries)
    if (matrix.evolutionHistory.length > 50) {
      matrix.evolutionHistory.shift();
    }
  }

  private checkSelfDevelopmentOpportunities(agentId: string, matrix: AgentCapabilityMatrix): void {
    const developmentModel = this.developmentModels.get(agentId);
    if (!developmentModel) return;

    // Analyze evolution patterns
    const recentPerformance = this.calculateRecentPerformance(matrix);
    const capabilityGrowth = this.calculateCapabilityGrowth(matrix);
    const noveltyScore = this.calculateNoveltyScore(matrix);

    if (capabilityGrowth > developmentModel.developmentThresholds.capabilityGrowth ||
        noveltyScore > developmentModel.developmentThresholds.noveltyDetection) {
      this.triggerCapabilityExpansion(agentId, matrix);
    }
  }

  private calculateRecentPerformance(matrix: AgentCapabilityMatrix): number {
    const recentEntries = matrix.evolutionHistory.slice(-10);
    if (recentEntries.length === 0) return 0;

    return recentEntries.reduce((sum, entry) => sum + entry.performance, 0) / recentEntries.length;
  }

  private calculateCapabilityGrowth(matrix: AgentCapabilityMatrix): number {
    if (matrix.evolutionHistory.length < 2) return 0;

    const current = matrix.evolutionHistory[matrix.evolutionHistory.length - 1];
    const previous = matrix.evolutionHistory[matrix.evolutionHistory.length - 2];

    // Compare vector changes to calculate growth
    let totalChange = 0;
    current.matrixState.data.forEach((vector, index) => {
      const prevVector = previous.matrixState.data[index];
      if (prevVector) {
        totalChange += this.calculateVectorDistance(vector, prevVector);
      }
    });

    return totalChange / current.matrixState.data.length;
  }

  private calculateVectorDistance(vec1: number[], vec2: number[]): number {
    return Math.sqrt(vec1.reduce((sum, val, i) => sum + Math.pow(val - vec2[i], 2), 0));
  }

  private calculateNoveltyScore(matrix: AgentCapabilityMatrix): number {
    // Calculate how different current capabilities are from initial state
    if (matrix.evolutionHistory.length === 0) return 0;

    const initial = matrix.evolutionHistory[0];
    const current = matrix.evolutionHistory[matrix.evolutionHistory.length - 1];

    let novelty = 0;
    current.matrixState.data.forEach((vector, index) => {
      const initialVector = initial.matrixState.data[index];
      if (initialVector) {
        novelty += this.calculateVectorDistance(vector, initialVector);
      }
    });

    return novelty / current.matrixState.data.length;
  }

  private triggerCapabilityExpansion(agentId: string, matrix: AgentCapabilityMatrix): void {
    // Identify potential new capabilities based on current patterns
    const newCapabilities = this.identifyPotentialCapabilities(matrix);
    
    newCapabilities.forEach(capability => {
      if (!matrix.capabilityVectors.has(capability)) {
        const newVector = this.generateCapabilityVector(capability);
        matrix.capabilityVectors.set(capability, newVector);
        
        // Expand interaction matrix
        this.expandInteractionMatrix(matrix);
      }
    });
  }

  private identifyPotentialCapabilities(matrix: AgentCapabilityMatrix): string[] {
    // Analyze experience patterns to suggest new capabilities
    const allExperiences = matrix.evolutionHistory.map(entry => entry.matrixState.metadata);
    const commonPatterns = this.extractCommonPatterns(allExperiences);
    
    return this.suggestCapabilitiesFromPatterns(commonPatterns);
  }

  private extractCommonPatterns(experiences: any[]): string[] {
    // Simple pattern extraction - can be enhanced with more sophisticated NLP
    const patterns: string[] = [];
    
    experiences.forEach(exp => {
      // Extract patterns from experience metadata
      if (exp.version) {
        patterns.push(`version_${exp.version}`);
      }
    });
    
    return patterns;
  }

  private suggestCapabilitiesFromPatterns(patterns: string[]): string[] {
    // Map patterns to potential capabilities
    const capabilityMap: { [key: string]: string } = {
      'version_1': 'basic_processing',
      'version_2': 'intermediate_analysis',
      'version_3': 'advanced_synthesis',
      'version_4': 'expert_reasoning'
    };

    return patterns
      .map(pattern => capabilityMap[pattern])
      .filter(capability => capability !== undefined);
  }

  private expandInteractionMatrix(matrix: AgentCapabilityMatrix): void {
    const currentSize = matrix.interactionMatrix.length;
    const newSize = currentSize + 1;
    
    // Create new expanded matrix
    const newMatrix = Array(newSize).fill(0).map(() => Array(newSize).fill(0));
    
    // Copy existing values
    for (let i = 0; i < currentSize; i++) {
      for (let j = 0; j < currentSize; j++) {
        newMatrix[i][j] = matrix.interactionMatrix[i][j];
      }
    }
    
    // Initialize new row and column with random values
    for (let i = 0; i < newSize; i++) {
      if (i !== newSize - 1) {
        newMatrix[i][newSize - 1] = Math.random() * 0.3;
        newMatrix[newSize - 1][i] = Math.random() * 0.3;
      }
    }
    
    matrix.interactionMatrix = newMatrix;
  }

  // Get agent capability analysis
  public getAgentCapabilityAnalysis(agentId: string): any {
    const matrix = this.matrices.get(agentId);
    if (!matrix) return null;

    return {
      agentId,
      capabilities: Array.from(matrix.capabilityVectors.keys()),
      capabilityStrengths: this.calculateCapabilityStrengths(matrix),
      interactionPatterns: this.analyzeInteractionPatterns(matrix),
      evolutionTrend: this.calculateEvolutionTrend(matrix),
      developmentPotential: this.calculateDevelopmentPotential(matrix)
    };
  }

  private calculateCapabilityStrengths(matrix: AgentCapabilityMatrix): { [capability: string]: number } {
    const strengths: { [capability: string]: number } = {};
    
    matrix.capabilityVectors.forEach((vector, capability) => {
      // Calculate vector magnitude as strength indicator
      const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
      strengths[capability] = magnitude;
    });
    
    return strengths;
  }

  private analyzeInteractionPatterns(matrix: AgentCapabilityMatrix): any {
    const capabilities = Array.from(matrix.capabilityVectors.keys());
    const strongInteractions: Array<{ from: string; to: string; strength: number }> = [];
    
    capabilities.forEach((cap1, i) => {
      capabilities.forEach((cap2, j) => {
        if (i !== j) {
          const strength = matrix.interactionMatrix[i][j];
          if (strength > 0.7) {
            strongInteractions.push({ from: cap1, to: cap2, strength });
          }
        }
      });
    });
    
    return strongInteractions;
  }

  private calculateEvolutionTrend(matrix: AgentCapabilityMatrix): string {
    if (matrix.evolutionHistory.length < 3) return 'insufficient_data';
    
    const recent = matrix.evolutionHistory.slice(-5);
    const trend = recent.map(entry => entry.performance);
    
    const isImproving = trend.every((val, i) => i === 0 || val >= trend[i - 1] * 0.95);
    const isDeclining = trend.every((val, i) => i === 0 || val <= trend[i - 1] * 1.05);
    
    if (isImproving) return 'improving';
    if (isDeclining) return 'declining';
    return 'stable';
  }

  private calculateDevelopmentPotential(matrix: AgentCapabilityMatrix): number {
    // Calculate potential based on various factors
    const performance = this.calculateRecentPerformance(matrix);
    const growth = this.calculateCapabilityGrowth(matrix);
    const novelty = this.calculateNoveltyScore(matrix);
    
    return (performance * 0.4 + growth * 0.3 + novelty * 0.3);
  }
}
