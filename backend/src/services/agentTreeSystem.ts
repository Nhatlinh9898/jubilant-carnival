export interface AgentNode {
  id: string;
  type: 'root' | 'branch' | 'leaf' | 'specialized';
  name: string;
  capabilities: string[];
  children: AgentNode[];
  parent?: AgentNode;
  vectorRepresentation: number[];
  performanceMetrics: {
    successRate: number;
    efficiency: number;
    adaptability: number;
  };
  learningData: {
    experiences: Array<{
      input: any;
      output: any;
      success: boolean;
      timestamp: Date;
    }>;
    patterns: Map<string, number>;
  };
}

export interface TreeStructure {
  rootNode: AgentNode;
  depth: number;
  totalNodes: number;
  branchingFactor: number;
  growthPattern: 'linear' | 'exponential' | 'adaptive';
}

export class AgentTreeSystem {
  private tree: TreeStructure;
  private vectorDimensions: number = 512;
  private learningThreshold: number = 0.7;

  constructor() {
    this.tree = this.initializeTree();
  }

  private initializeTree(): TreeStructure {
    const rootNode: AgentNode = {
      id: 'root-agent',
      type: 'root',
      name: 'Master Coordinator',
      capabilities: ['coordination', 'synthesis', 'decision-making', 'learning'],
      children: [],
      vectorRepresentation: this.generateInitialVector(),
      performanceMetrics: {
        successRate: 1.0,
        efficiency: 1.0,
        adaptability: 1.0
      },
      learningData: {
        experiences: [],
        patterns: new Map()
      }
    };

    return {
      rootNode,
      depth: 0,
      totalNodes: 1,
      branchingFactor: 3,
      growthPattern: 'adaptive'
    };
  }

  private generateInitialVector(): number[] {
    return Array(this.vectorDimensions).fill(0).map(() => Math.random() * 0.1);
  }

  // Create new specialized agent based on requirements
  public createSpecializedAgent(
    parentNode: AgentNode,
    specialization: string,
    capabilities: string[]
  ): AgentNode {
    const newAgent: AgentNode = {
      id: `agent-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'specialized',
      name: `${specialization} Agent`,
      capabilities,
      children: [],
      parent: parentNode,
      vectorRepresentation: this.inheritAndMutateVector(parentNode.vectorRepresentation),
      performanceMetrics: {
        successRate: 0.5,
        efficiency: 0.5,
        adaptability: 0.8
      },
      learningData: {
        experiences: [],
        patterns: new Map()
      }
    };

    parentNode.children.push(newAgent);
    this.updateTreeMetrics();
    return newAgent;
  }

  // Vector inheritance and mutation for agent evolution
  private inheritAndMutateVector(parentVector: number[]): number[] {
    const mutation = 0.1;
    return parentVector.map((value, index) => {
      const randomMutation = (Math.random() - 0.5) * mutation;
      return Math.max(-1, Math.min(1, value + randomMutation));
    });
  }

  // Find best agent for specific task
  public findBestAgent(task: string, context: any): AgentNode | null {
    const taskVector = this.vectorizeTask(task, context);
    let bestAgent: AgentNode | null = null;
    let bestSimilarity = 0;

    this.traverseTree(this.tree.rootNode, (agent) => {
      const similarity = this.calculateCosineSimilarity(taskVector, agent.vectorRepresentation);
      if (similarity > bestSimilarity && agent.capabilities.some(cap => 
        task.toLowerCase().includes(cap.toLowerCase()))) {
        bestSimilarity = similarity;
        bestAgent = agent;
      }
    });

    return bestAgent;
  }

  // Vectorize task for matching with agents
  private vectorizeTask(task: string, context: any): number[] {
    const keywords = this.extractKeywords(task);
    const vector = new Array(this.vectorDimensions).fill(0);
    
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
      .slice(0, 10);
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

  private calculateCosineSimilarity(vec1: number[], vec2: number[]): number {
    const dotProduct = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);
    const mag1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
    const mag2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0));
    
    return mag1 && mag2 ? dotProduct / (mag1 * mag2) : 0;
  }

  // Tree traversal for operations
  private traverseTree(node: AgentNode, callback: (agent: AgentNode) => void): void {
    callback(node);
    node.children.forEach(child => this.traverseTree(child, callback));
  }

  // Agent learning and adaptation
  public async agentLearn(agentId: string, experience: any): Promise<void> {
    const agent = this.findAgentById(agentId);
    if (!agent) return;

    const learningRecord = {
      input: experience.input,
      output: experience.output,
      success: experience.success,
      timestamp: new Date()
    };

    agent.learningData.experiences.push(learningRecord);
    
    if (experience.success) {
      this.updateAgentVector(agent, experience);
      this.updatePerformanceMetrics(agent, experience);
    }

    // Trigger self-development if learning threshold is met
    if (this.shouldSelfDevelop(agent)) {
      await this.triggerSelfDevelopment(agent);
    }
  }

  private findAgentById(agentId: string): AgentNode | null {
    let foundAgent: AgentNode | null = null;
    this.traverseTree(this.tree.rootNode, (agent) => {
      if (agent.id === agentId) {
        foundAgent = agent;
      }
    });
    return foundAgent;
  }

  private updateAgentVector(agent: AgentNode, experience: any): void {
    const learningRate = 0.01;
    const experienceVector = this.vectorizeTask(JSON.stringify(experience.input), experience.context);
    
    agent.vectorRepresentation = agent.vectorRepresentation.map((value, index) => {
      const targetValue = experienceVector[index] || 0;
      return value + learningRate * (targetValue - value);
    });
  }

  private updatePerformanceMetrics(agent: AgentNode, experience: any): void {
    const weight = 0.1;
    agent.performanceMetrics.successRate = 
      agent.performanceMetrics.successRate * (1 - weight) + (experience.success ? 1 : 0) * weight;
    
    agent.performanceMetrics.efficiency = 
      agent.performanceMetrics.efficiency * (1 - weight) + (experience.efficiency || 0.5) * weight;
  }

  private shouldSelfDevelop(agent: AgentNode): boolean {
    return agent.performanceMetrics.adaptability > this.learningThreshold &&
           agent.learningData.experiences.length > 10;
  }

  private async triggerSelfDevelopment(agent: AgentNode): Promise<void> {
    // Create new specialized sub-agent
    const newCapability = this.identifyNewCapability(agent);
    if (newCapability) {
      this.createSpecializedAgent(agent, newCapability, [newCapability]);
    }
  }

  private identifyNewCapability(agent: AgentNode): string | null {
    // Analyze patterns in learning data to identify new capabilities
    const patterns = agent.learningData.patterns;
    let maxPattern = '';
    let maxCount = 0;

    patterns.forEach((count, pattern) => {
      if (count > maxCount && !agent.capabilities.includes(pattern)) {
        maxCount = count;
        maxPattern = pattern;
      }
    });

    return maxPattern;
  }

  private updateTreeMetrics(): void {
    this.tree.totalNodes = 0;
    this.tree.depth = 0;
    
    const calculateDepth = (node: AgentNode, currentDepth: number): number => {
      this.tree.totalNodes++;
      if (node.children.length === 0) return currentDepth;
      
      return Math.max(...node.children.map(child => calculateDepth(child, currentDepth + 1)));
    };
    
    this.tree.depth = calculateDepth(this.tree.rootNode, 0);
  }

  // Get tree statistics
  public getTreeStatistics(): any {
    return {
      totalNodes: this.tree.totalNodes,
      depth: this.tree.depth,
      branchingFactor: this.tree.branchingFactor,
      growthPattern: this.tree.growthPattern,
      averagePerformance: this.calculateAveragePerformance()
    };
  }

  private calculateAveragePerformance(): number {
    let totalPerformance = 0;
    let nodeCount = 0;

    this.traverseTree(this.tree.rootNode, (agent) => {
      totalPerformance += (agent.performanceMetrics.successRate + 
                          agent.performanceMetrics.efficiency + 
                          agent.performanceMetrics.adaptability) / 3;
      nodeCount++;
    });

    return nodeCount > 0 ? totalPerformance / nodeCount : 0;
  }
}
