export interface AgentMessage {
  id: string;
  from: string;
  to: string | string[];
  type: 'request' | 'response' | 'notification' | 'broadcast' | 'coordination';
  priority: 'low' | 'medium' | 'high' | 'critical';
  content: {
    action: string;
    data: any;
    context?: any;
    requirements?: string[];
    deadline?: Date;
  };
  metadata: {
    timestamp: Date;
    correlationId?: string;
    retryCount: number;
    maxRetries: number;
    status: 'pending' | 'delivered' | 'processed' | 'failed';
  };
}

export interface AgentCapability {
  id: string;
  name: string;
  description: string;
  inputTypes: string[];
  outputTypes: string[];
  processingCapacity: number;
  currentLoad: number;
  availability: boolean;
  specializations: string[];
}

export interface CoordinationProtocol {
  name: string;
  version: string;
  agents: string[];
  rules: {
    precedence: Array<{ agent: string; priority: number }>;
    collaboration: Array<{ from: string; to: string; conditions: string[] }>;
    conflictResolution: string[];
  };
  communication: {
    channels: string[];
    formats: string[];
    encryption: boolean;
    authentication: boolean;
  };
}

export interface TaskAllocation {
  taskId: string;
  assignedAgent: string;
  taskType: string;
  requirements: string[];
  priority: number;
  estimatedDuration: number;
  dependencies: string[];
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'failed';
  assignedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

export class AgentCoordinationService {
  private agents: Map<string, AgentCapability> = new Map();
  private messageQueue: AgentMessage[] = [];
  private protocols: Map<string, CoordinationProtocol> = new Map();
  private taskAllocations: Map<string, TaskAllocation> = new Map();
  private activeCollaborations: Map<string, string[]> = new Map();
  private communicationChannels: Map<string, Set<string>> = new Map();

  constructor() {
    this.initializeDefaultProtocol();
    this.setupCommunicationChannels();
  }

  private initializeDefaultProtocol(): void {
    const defaultProtocol: CoordinationProtocol = {
      name: 'default_coordination',
      version: '1.0.0',
      agents: [],
      rules: {
        precedence: [],
        collaboration: [],
        conflictResolution: ['priority_based', 'load_balancing', 'capability_matching']
      },
      communication: {
        channels: ['broadcast', 'direct', 'group'],
        formats: ['json', 'binary', 'stream'],
        encryption: true,
        authentication: true
      }
    };

    this.protocols.set('default', defaultProtocol);
  }

  private setupCommunicationChannels(): void {
    this.communicationChannels.set('broadcast', new Set());
    this.communicationChannels.set('direct', new Set());
    this.communicationChannels.set('group', new Set());
    this.communicationChannels.set('coordination', new Set());
  }

  // Register agent capabilities
  public registerAgent(agent: AgentCapability): void {
    this.agents.set(agent.id, agent);
    
    // Add to default protocol
    const defaultProtocol = this.protocols.get('default');
    if (defaultProtocol && !defaultProtocol.agents.includes(agent.id)) {
      defaultProtocol.agents.push(agent.id);
    }
    
    // Add to communication channels
    this.communicationChannels.get('broadcast')?.add(agent.id);
    this.communicationChannels.get('direct')?.add(agent.id);
  }

  // Unregister agent
  public unregisterAgent(agentId: string): void {
    this.agents.delete(agentId);
    
    // Remove from protocols
    this.protocols.forEach(protocol => {
      protocol.agents = protocol.agents.filter(id => id !== agentId);
    });
    
    // Remove from communication channels
    this.communicationChannels.forEach(channel => {
      channel.delete(agentId);
    });
    
    // Clean up task allocations
    this.taskAllocations.forEach((allocation, taskId) => {
      if (allocation.assignedAgent === agentId) {
        allocation.status = 'failed';
      }
    });
  }

  // Send message between agents
  public async sendMessage(message: AgentMessage): Promise<boolean> {
    try {
      // Validate message
      if (!this.validateMessage(message)) {
        throw new Error('Invalid message format');
      }

      // Add to queue
      this.messageQueue.push(message);
      
      // Process message
      const delivered = await this.processMessage(message);
      
      if (delivered) {
        message.metadata.status = 'delivered';
      } else {
        message.metadata.status = 'failed';
        if (message.metadata.retryCount < message.metadata.maxRetries) {
          message.metadata.retryCount++;
          return this.sendMessage(message);
        }
      }
      
      return delivered;
    } catch (error) {
      console.error('Failed to send message:', error);
      return false;
    }
  }

  private validateMessage(message: AgentMessage): boolean {
    return !!(message.id && message.from && message.to && message.type && message.content);
  }

  private async processMessage(message: AgentMessage): Promise<boolean> {
    const targets = Array.isArray(message.to) ? message.to : [message.to];
    
    for (const targetId of targets) {
      const targetAgent = this.agents.get(targetId);
      if (!targetAgent || !targetAgent.availability) {
        continue;
      }
      
      // Check if agent can handle the message
      if (this.canAgentHandleMessage(targetAgent, message)) {
        await this.deliverMessage(targetId, message);
        return true;
      }
    }
    
    return false;
  }

  private canAgentHandleMessage(agent: AgentCapability, message: AgentMessage): boolean {
    // Check if agent has the required capabilities
    if (message.content.requirements) {
      const hasRequiredCapabilities = message.content.requirements.every(req =>
        agent.specializations.includes(req) || agent.inputTypes.includes(req)
      );
      
      if (!hasRequiredCapabilities) return false;
    }
    
    // Check agent load
    if (agent.currentLoad >= agent.processingCapacity) return false;
    
    return true;
  }

  private async deliverMessage(agentId: string, message: AgentMessage): Promise<void> {
    // In a real implementation, this would deliver the message to the agent
    // For now, we'll simulate the delivery
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.currentLoad += 1;
      
      // Simulate processing time
      setTimeout(() => {
        agent.currentLoad -= 1;
        message.metadata.status = 'processed';
      }, 1000);
    }
  }

  // Task allocation and coordination
  public allocateTask(task: {
    type: string;
    requirements: string[];
    priority: number;
    estimatedDuration: number;
    dependencies?: string[];
  }): string {
    const taskId = this.generateTaskId();
    
    // Find best agent for the task
    const bestAgent = this.findBestAgent(task);
    if (!bestAgent) {
      throw new Error('No suitable agent available for task');
    }
    
    const allocation: TaskAllocation = {
      taskId,
      assignedAgent: bestAgent.id,
      taskType: task.type,
      requirements: task.requirements,
      priority: task.priority,
      estimatedDuration: task.estimatedDuration,
      dependencies: task.dependencies || [],
      status: 'assigned',
      assignedAt: new Date()
    };
    
    this.taskAllocations.set(taskId, allocation);
    
    // Notify the assigned agent
    const message: AgentMessage = {
      id: this.generateMessageId(),
      from: 'coordinator',
      to: bestAgent.id,
      type: 'request',
      priority: this.mapPriority(task.priority),
      content: {
        action: 'assign_task',
        data: allocation,
        requirements: task.requirements
      },
      metadata: {
        timestamp: new Date(),
        retryCount: 0,
        maxRetries: 3,
        status: 'pending'
      }
    };
    
    this.sendMessage(message);
    
    return taskId;
  }

  private generateTaskId(): string {
    return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateMessageId(): string {
    return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private findBestAgent(task: any): AgentCapability | null {
    const suitableAgents = Array.from(this.agents.values()).filter(agent => {
      if (!agent.availability) return false;
      if (agent.currentLoad >= agent.processingCapacity) return false;
      
      // Check requirements
      if (task.requirements) {
        const hasRequirements = task.requirements.some(req =>
          agent.specializations.includes(req) || agent.inputTypes.includes(req)
        );
        if (!hasRequirements) return false;
      }
      
      return true;
    });
    
    // Sort by load and capability match
    suitableAgents.sort((a, b) => {
      const aLoad = a.currentLoad / a.processingCapacity;
      const bLoad = b.currentLoad / b.processingCapacity;
      
      if (aLoad !== bLoad) return aLoad - bLoad;
      
      // Prefer agents with more relevant specializations
      const aMatches = task.requirements?.filter(req => a.specializations.includes(req)).length || 0;
      const bMatches = task.requirements?.filter(req => b.specializations.includes(req)).length || 0;
      
      return bMatches - aMatches;
    });
    
    return suitableAgents[0] || null;
  }

  private mapPriority(priority: number): 'low' | 'medium' | 'high' | 'critical' {
    if (priority >= 0.8) return 'critical';
    if (priority >= 0.6) return 'high';
    if (priority >= 0.4) return 'medium';
    return 'low';
  }

  // Collaboration management
  public initiateCollaboration(
    initiatorId: string,
    taskType: string,
    requiredAgents: string[]
  ): string {
    const collaborationId = this.generateCollaborationId();
    
    // Validate agents
    const availableAgents = requiredAgents.filter(agentId => {
      const agent = this.agents.get(agentId);
      return agent && agent.availability;
    });
    
    if (availableAgents.length < 2) {
      throw new Error('Insufficient available agents for collaboration');
    }
    
    this.activeCollaborations.set(collaborationId, availableAgents);
    
    // Send coordination messages
    const coordinationMessage: AgentMessage = {
      id: this.generateMessageId(),
      from: initiatorId,
      to: availableAgents,
      type: 'coordination',
      priority: 'medium',
      content: {
        action: 'start_collaboration',
        data: {
          collaborationId,
          taskType,
          participants: availableAgents,
          initiator: initiatorId
        }
      },
      metadata: {
        timestamp: new Date(),
        correlationId: collaborationId,
        retryCount: 0,
        maxRetries: 3,
        status: 'pending'
      }
    };
    
    this.sendMessage(coordinationMessage);
    
    return collaborationId;
  }

  private generateCollaborationId(): string {
    return `collab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Conflict resolution
  public resolveConflict(conflict: {
    type: string;
    agents: string[];
    resource: string;
    priority: number;
  }): string {
    const protocol = this.protocols.get('default');
    if (!protocol) {
      throw new Error('No coordination protocol available');
    }
    
    // Apply conflict resolution strategies
    for (const strategy of protocol.rules.conflictResolution) {
      const resolution = this.applyConflictResolutionStrategy(strategy, conflict);
      if (resolution) {
        return resolution;
      }
    }
    
    throw new Error('Unable to resolve conflict');
  }

  private applyConflictResolutionStrategy(
    strategy: string,
    conflict: any
  ): string | null {
    switch (strategy) {
      case 'priority_based':
        return this.resolveByPriority(conflict);
      
      case 'load_balancing':
        return this.resolveByLoadBalancing(conflict);
      
      case 'capability_matching':
        return this.resolveByCapabilityMatching(conflict);
      
      default:
        return null;
    }
  }

  private resolveByPriority(conflict: any): string {
    const agents = conflict.agents.map(id => this.agents.get(id)).filter(Boolean);
    
    // Sort by current task priority
    agents.sort((a, b) => {
      const aPriority = this.getAgentCurrentPriority(a!.id);
      const bPriority = this.getAgentCurrentPriority(b!.id);
      return bPriority - aPriority;
    });
    
    return agents[0]?.id || conflict.agents[0];
  }

  private resolveByLoadBalancing(conflict: any): string {
    const agents = conflict.agents.map(id => this.agents.get(id)).filter(Boolean);
    
    // Sort by current load (least loaded first)
    agents.sort((a, b) => {
      const aLoad = a!.currentLoad / a!.processingCapacity;
      const bLoad = b!.currentLoad / b!.processingCapacity;
      return aLoad - bLoad;
    });
    
    return agents[0]?.id || conflict.agents[0];
  }

  private resolveByCapabilityMatching(conflict: any): string {
    const agents = conflict.agents.map(id => this.agents.get(id)).filter(Boolean);
    
    // Sort by capability match
    agents.sort((a, b) => {
      const aMatch = this.calculateCapabilityMatch(a!, conflict.resource);
      const bMatch = this.calculateCapabilityMatch(b!, conflict.resource);
      return bMatch - aMatch;
    });
    
    return agents[0]?.id || conflict.agents[0];
  }

  private getAgentCurrentPriority(agentId: string): number {
    const agentTasks = Array.from(this.taskAllocations.values())
      .filter(allocation => allocation.assignedAgent === agentId);
    
    if (agentTasks.length === 0) return 0;
    
    const totalPriority = agentTasks.reduce((sum, task) => sum + task.priority, 0);
    return totalPriority / agentTasks.length;
  }

  private calculateCapabilityMatch(agent: AgentCapability, resource: string): number {
    let match = 0;
    
    // Check direct specializations
    if (agent.specializations.includes(resource)) match += 10;
    
    // Check related capabilities
    const relatedCapabilities = agent.specializations.filter(spec =>
      spec.toLowerCase().includes(resource.toLowerCase()) ||
      resource.toLowerCase().includes(spec.toLowerCase())
    );
    match += relatedCapabilities.length * 5;
    
    // Check input/output types
    if (agent.inputTypes.includes(resource)) match += 3;
    if (agent.outputTypes.includes(resource)) match += 3;
    
    return match;
  }

  // Load balancing
  public balanceLoad(): void {
    const overloadedAgents = Array.from(this.agents.values())
      .filter(agent => agent.currentLoad > agent.processingCapacity * 0.8);
    
    const underloadedAgents = Array.from(this.agents.values())
      .filter(agent => agent.currentLoad < agent.processingCapacity * 0.3);
    
    if (overloadedAgents.length === 0 || underloadedAgents.length === 0) {
      return; // No rebalancing needed
    }
    
    // Redistribute tasks
    overloadedAgents.forEach(overloaded => {
      const tasksToReassign = this.getReassignableTasks(overloaded.id);
      
      tasksToReassign.forEach(task => {
        const suitableAgent = this.findBestAgentForReassignment(task, underloadedAgents);
        if (suitableAgent) {
          this.reassignTask(task.taskId, suitableAgent.id);
        }
      });
    });
  }

  private getReassignableTasks(agentId: string): TaskAllocation[] {
    return Array.from(this.taskAllocations.values())
      .filter(allocation => 
        allocation.assignedAgent === agentId &&
        allocation.status === 'assigned' &&
        !allocation.startedAt
      );
  }

  private findBestAgentForReassignment(
    task: TaskAllocation,
    candidates: AgentCapability[]
  ): AgentCapability | null {
    const suitable = candidates.filter(agent =>
      agent.availability &&
      agent.currentLoad < agent.processingCapacity &&
      this.canAgentHandleTask(agent, task)
    );
    
    // Prefer least loaded agent
    suitable.sort((a, b) => a.currentLoad - b.currentLoad);
    
    return suitable[0] || null;
  }

  private canAgentHandleTask(agent: AgentCapability, task: TaskAllocation): boolean {
    return task.requirements.some(req =>
      agent.specializations.includes(req) ||
      agent.inputTypes.includes(req)
    );
  }

  private reassignTask(taskId: string, newAgentId: string): void {
    const allocation = this.taskAllocations.get(taskId);
    if (!allocation) return;
    
    const oldAgentId = allocation.assignedAgent;
    allocation.assignedAgent = newAgentId;
    allocation.assignedAt = new Date();
    
    // Notify old agent
    const oldAgentMessage: AgentMessage = {
      id: this.generateMessageId(),
      from: 'coordinator',
      to: oldAgentId,
      type: 'notification',
      priority: 'medium',
      content: {
        action: 'task_reassigned',
        data: { taskId, newAgentId }
      },
      metadata: {
        timestamp: new Date(),
        retryCount: 0,
        maxRetries: 1,
        status: 'pending'
      }
    };
    
    // Notify new agent
    const newAgentMessage: AgentMessage = {
      id: this.generateMessageId(),
      from: 'coordinator',
      to: newAgentId,
      type: 'request',
      priority: 'medium',
      content: {
        action: 'assign_task',
        data: allocation
      },
      metadata: {
        timestamp: new Date(),
        retryCount: 0,
        maxRetries: 3,
        status: 'pending'
      }
    };
    
    this.sendMessage(oldAgentMessage);
    this.sendMessage(newAgentMessage);
  }

  // Monitoring and statistics
  public getCoordinationStatistics(): any {
    const agents = Array.from(this.agents.values());
    const tasks = Array.from(this.taskAllocations.values());
    const messages = this.messageQueue;
    
    return {
      agents: {
        total: agents.length,
        available: agents.filter(a => a.availability).length,
        averageLoad: agents.reduce((sum, a) => sum + a.currentLoad, 0) / agents.length,
        overloaded: agents.filter(a => a.currentLoad > a.processingCapacity * 0.8).length
      },
      tasks: {
        total: tasks.length,
        pending: tasks.filter(t => t.status === 'pending').length,
        assigned: tasks.filter(t => t.status === 'assigned').length,
        inProgress: tasks.filter(t => t.status === 'in_progress').length,
        completed: tasks.filter(t => t.status === 'completed').length,
        failed: tasks.filter(t => t.status === 'failed').length
      },
      messages: {
        total: messages.length,
        pending: messages.filter(m => m.metadata.status === 'pending').length,
        delivered: messages.filter(m => m.metadata.status === 'delivered').length,
        processed: messages.filter(m => m.metadata.status === 'processed').length,
        failed: messages.filter(m => m.metadata.status === 'failed').length
      },
      collaborations: {
        active: this.activeCollaborations.size,
        totalParticipants: Array.from(this.activeCollaborations.values())
          .reduce((sum, participants) => sum + participants.length, 0)
      }
    };
  }

  public getAgentStatus(agentId: string): any {
    const agent = this.agents.get(agentId);
    if (!agent) return null;
    
    const agentTasks = Array.from(this.taskAllocations.values())
      .filter(allocation => allocation.assignedAgent === agentId);
    
    return {
      agent: {
        id: agent.id,
        name: agent.name,
        availability: agent.availability,
        currentLoad: agent.currentLoad,
        processingCapacity: agent.processingCapacity,
        specializations: agent.specializations
      },
      tasks: {
        total: agentTasks.length,
        pending: agentTasks.filter(t => t.status === 'pending').length,
        assigned: agentTasks.filter(t => t.status === 'assigned').length,
        inProgress: agentTasks.filter(t => t.status === 'in_progress').length,
        completed: agentTasks.filter(t => t.status === 'completed').length
      },
      collaborations: Array.from(this.activeCollaborations.entries())
        .filter(([_, participants]) => participants.includes(agentId))
        .map(([id, participants]) => ({ id, participants }))
    };
  }

  // Protocol management
  public createProtocol(protocol: CoordinationProtocol): void {
    this.protocols.set(protocol.name, protocol);
  }

  public updateProtocol(name: string, updates: Partial<CoordinationProtocol>): void {
    const protocol = this.protocols.get(name);
    if (protocol) {
      Object.assign(protocol, updates);
    }
  }

  public getProtocol(name: string): CoordinationProtocol | null {
    return this.protocols.get(name) || null;
  }

  // Cleanup and maintenance
  public cleanup(): void {
    // Clean up completed tasks older than 1 hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    this.taskAllocations.forEach((allocation, taskId) => {
      if (allocation.status === 'completed' && 
          allocation.completedAt && 
          allocation.completedAt < oneHourAgo) {
        this.taskAllocations.delete(taskId);
      }
    });
    
    // Clean up old messages
    this.messageQueue = this.messageQueue.filter(message => 
      message.metadata.status !== 'processed' ||
      (Date.now() - message.metadata.timestamp.getTime()) < 30 * 60 * 1000 // 30 minutes
    );
    
    // Clean up inactive collaborations
    this.activeCollaborations.forEach((participants, collaborationId) => {
      const activeParticipants = participants.filter(id => {
        const agent = this.agents.get(id);
        return agent && agent.availability;
      });
      
      if (activeParticipants.length < 2) {
        this.activeCollaborations.delete(collaborationId);
      }
    });
  }
}
