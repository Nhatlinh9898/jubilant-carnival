import { ValidationEvaluationAgents, ValidationResult, EvaluationResult } from './validationEvaluationAgents';
import { InformationSynthesisAgents, SynthesizedInformation } from './informationSynthesisAgents';
import { ResultCollectionAgents, CollectedResult } from './resultCollectionAgents';

export interface DeliveryFormat {
  type: 'json' | 'xml' | 'csv' | 'pdf' | 'html' | 'markdown' | 'text';
  version: string;
  encoding: string;
}

export interface DeliveryChannel {
  type: 'api' | 'webhook' | 'email' | 'file' | 'database' | 'queue' | 'stream';
  endpoint?: string;
  credentials?: any;
  retryPolicy?: RetryPolicy;
}

export interface RetryPolicy {
  maxAttempts: number;
  backoffMs: number;
  maxBackoffMs: number;
  retryableErrors: string[];
}

export interface DeliveryResult {
  id: string;
  contentId: string;
  format: DeliveryFormat;
  channel: DeliveryChannel;
  status: 'pending' | 'processing' | 'delivered' | 'failed';
  timestamp: Date;
  attempts: number;
  error?: string;
  metadata: {
    size: number;
    processingTime: number;
    deliveryTime: number;
  };
}

export interface FinalResult {
  id: string;
  contentId: string;
  validationResults: ValidationResult[];
  evaluationResults: EvaluationResult[];
  synthesizedInformation: SynthesizedInformation;
  collectedResults: CollectedResult[];
  summary: ResultSummary;
  recommendations: Recommendation[];
  metadata: ResultMetadata;
  timestamp: Date;
}

export interface ResultSummary {
  overallScore: number;
  confidence: number;
  keyFindings: string[];
  insights: string[];
  trends: string[];
  anomalies: string[];
}

export interface Recommendation {
  id: string;
  type: 'action' | 'improvement' | 'investigation' | 'optimization';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
  effort: 'low' | 'medium' | 'high';
  dependencies: string[];
}

export interface ResultMetadata {
  processingStages: string[];
  totalProcessingTime: number;
  agentPerformance: Record<string, any>;
  qualityMetrics: {
    accuracy: number;
    completeness: number;
    consistency: number;
    relevance: number;
  };
  version: string;
}

export enum DeliveryType {
  IMMEDIATE = 'immediate',
  SCHEDULED = 'scheduled',
  BATCH = 'batch',
  STREAMING = 'streaming'
}

export abstract class DeliveryStrategy {
  abstract deliver(result: FinalResult, format: DeliveryFormat, channel: DeliveryChannel): Promise<DeliveryResult>;
  abstract getType(): DeliveryType;
}

export class ImmediateDeliveryStrategy extends DeliveryStrategy {
  async deliver(result: FinalResult, format: DeliveryFormat, channel: DeliveryChannel): Promise<DeliveryResult> {
    const deliveryResult: DeliveryResult = {
      id: `delivery_${Date.now()}`,
      contentId: result.contentId,
      format,
      channel,
      status: 'processing',
      timestamp: new Date(),
      attempts: 1,
      metadata: {
        size: 0,
        processingTime: 0,
        deliveryTime: 0
      }
    };

    try {
      const startTime = Date.now();
      
      // Format the result
      const formattedResult = await this.formatResult(result, format);
      deliveryResult.metadata.size = formattedResult.length;
      deliveryResult.metadata.processingTime = Date.now() - startTime;

      // Deliver to channel
      const deliveryStartTime = Date.now();
      await this.sendToChannel(formattedResult, channel);
      deliveryResult.metadata.deliveryTime = Date.now() - deliveryStartTime;

      deliveryResult.status = 'delivered';
    } catch (error) {
      deliveryResult.status = 'failed';
      deliveryResult.error = error instanceof Error ? error.message : 'Unknown error';
    }

    return deliveryResult;
  }

  getType(): DeliveryType {
    return DeliveryType.IMMEDIATE;
  }

  private async formatResult(result: FinalResult, format: DeliveryFormat): Promise<string> {
    switch (format.type) {
      case 'json':
        return JSON.stringify(result, null, 2);
      case 'xml':
        return this.convertToXML(result);
      case 'csv':
        return this.convertToCSV(result);
      case 'html':
        return this.convertToHTML(result);
      case 'markdown':
        return this.convertToMarkdown(result);
      case 'text':
        return this.convertToText(result);
      default:
        throw new Error(`Unsupported format: ${format.type}`);
    }
  }

  private async sendToChannel(formattedResult: string, channel: DeliveryChannel): Promise<void> {
    switch (channel.type) {
      case 'api':
        await this.sendViaAPI(formattedResult, channel);
        break;
      case 'webhook':
        await this.sendViaWebhook(formattedResult, channel);
        break;
      case 'email':
        await this.sendViaEmail(formattedResult, channel);
        break;
      case 'file':
        await this.saveToFile(formattedResult, channel);
        break;
      case 'database':
        await this.saveToDatabase(formattedResult, channel);
        break;
      case 'queue':
        await this.sendToQueue(formattedResult, channel);
        break;
      case 'stream':
        await this.sendToStream(formattedResult, channel);
        break;
      default:
        throw new Error(`Unsupported channel type: ${channel.type}`);
    }
  }

  private convertToXML(result: FinalResult): string {
    // Simplified XML conversion
    return `<?xml version="1.0" encoding="UTF-8"?>
<finalResult>
  <id>${result.id}</id>
  <contentId>${result.contentId}</contentId>
  <overallScore>${result.summary.overallScore}</overallScore>
  <confidence>${result.summary.confidence}</confidence>
  <keyFindings>
    ${result.summary.keyFindings.map(finding => `<finding>${finding}</finding>`).join('\n    ')}
  </keyFindings>
  <recommendations>
    ${result.recommendations.map(rec => `
    <recommendation>
      <type>${rec.type}</type>
      <priority>${rec.priority}</priority>
      <title>${rec.title}</title>
      <description>${rec.description}</description>
    </recommendation>`).join('\n    ')}
  </recommendations>
</finalResult>`;
  }

  private convertToCSV(result: FinalResult): string {
    const headers = ['ID', 'ContentID', 'OverallScore', 'Confidence', 'KeyFindings', 'Recommendations'];
    const row = [
      result.id,
      result.contentId,
      result.summary.overallScore,
      result.summary.confidence,
      `"${result.summary.keyFindings.join('; ')}"`,
      `"${result.recommendations.map(r => r.title).join('; ')}"`
    ];
    
    return [headers.join(','), row.join(',')].join('\n');
  }

  private convertToHTML(result: FinalResult): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Final Result - ${result.contentId}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f0f0f0; padding: 10px; border-radius: 5px; }
        .section { margin: 20px 0; }
        .score { font-size: 24px; font-weight: bold; color: #2196F3; }
        .recommendation { border: 1px solid #ddd; padding: 10px; margin: 10px 0; border-radius: 5px; }
        .high-priority { border-left: 4px solid #f44336; }
        .medium-priority { border-left: 4px solid #ff9800; }
        .low-priority { border-left: 4px solid #4caf50; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Final Result Analysis</h1>
        <p>Content ID: ${result.contentId}</p>
        <p>Generated: ${result.timestamp.toISOString()}</p>
    </div>
    
    <div class="section">
        <h2>Overall Assessment</h2>
        <div class="score">Score: ${result.summary.overallScore.toFixed(2)}</div>
        <div class="score">Confidence: ${result.summary.confidence.toFixed(2)}</div>
    </div>
    
    <div class="section">
        <h2>Key Findings</h2>
        <ul>
            ${result.summary.keyFindings.map(finding => `<li>${finding}</li>`).join('')}
        </ul>
    </div>
    
    <div class="section">
        <h2>Recommendations</h2>
        ${result.recommendations.map(rec => `
        <div class="recommendation ${rec.priority}-priority">
            <h3>${rec.title}</h3>
            <p><strong>Type:</strong> ${rec.type} | <strong>Priority:</strong> ${rec.priority}</p>
            <p>${rec.description}</p>
            <p><strong>Impact:</strong> ${rec.impact} | <strong>Effort:</strong> ${rec.effort}</p>
        </div>`).join('')}
    </div>
</body>
</html>`;
  }

  private convertToMarkdown(result: FinalResult): string {
    return `
# Final Result Analysis

**Content ID:** ${result.contentId}  
**Generated:** ${result.timestamp.toISOString()}  
**Version:** ${result.metadata.version}

## Overall Assessment

- **Score:** ${result.summary.overallScore.toFixed(2)}
- **Confidence:** ${result.summary.confidence.toFixed(2)}

## Key Findings

${result.summary.keyFindings.map(finding => `- ${finding}`).join('\n')}

## Insights

${result.summary.insights.map(insight => `- ${insight}`).join('\n')}

## Recommendations

${result.recommendations.map(rec => `
### ${rec.title}
- **Type:** ${rec.type}
- **Priority:** ${rec.priority}
- **Description:** ${rec.description}
- **Impact:** ${rec.impact}
- **Effort:** ${rec.effort}
`).join('\n')}

## Quality Metrics

- **Accuracy:** ${result.metadata.qualityMetrics.accuracy.toFixed(2)}
- **Completeness:** ${result.metadata.qualityMetrics.completeness.toFixed(2)}
- **Consistency:** ${result.metadata.qualityMetrics.consistency.toFixed(2)}
- **Relevance:** ${result.metadata.qualityMetrics.relevance.toFixed(2)}

## Processing Information

- **Total Processing Time:** ${result.metadata.totalProcessingTime}ms
- **Processing Stages:** ${result.metadata.processingStages.join(', ')}
`;
  }

  private convertToText(result: FinalResult): string {
    return `
FINAL RESULT ANALYSIS
====================

Content ID: ${result.contentId}
Generated: ${result.timestamp.toISOString()}
Version: ${result.metadata.version}

OVERALL ASSESSMENT
------------------
Score: ${result.summary.overallScore.toFixed(2)}
Confidence: ${result.summary.confidence.toFixed(2)}

KEY FINDINGS
------------
${result.summary.keyFindings.map(finding => `• ${finding}`).join('\n')}

INSIGHTS
--------
${result.summary.insights.map(insight => `• ${insight}`).join('\n')}

RECOMMENDATIONS
---------------
${result.recommendations.map(rec => `
${rec.title} (${rec.priority} priority)
Type: ${rec.type}
Description: ${rec.description}
Impact: ${rec.impact}
Effort: ${rec.effort}
`).join('\n')}

QUALITY METRICS
---------------
Accuracy: ${result.metadata.qualityMetrics.accuracy.toFixed(2)}
Completeness: ${result.metadata.qualityMetrics.completeness.toFixed(2)}
Consistency: ${result.metadata.qualityMetrics.consistency.toFixed(2)}
Relevance: ${result.metadata.qualityMetrics.relevance.toFixed(2)}

PROCESSING INFORMATION
---------------------
Total Processing Time: ${result.metadata.totalProcessingTime}ms
Processing Stages: ${result.metadata.processingStages.join(', ')}
`;
  }

  private async sendViaAPI(formattedResult: string, channel: DeliveryChannel): Promise<void> {
    // API delivery implementation
    if (!channel.endpoint) throw new Error('API endpoint required');
    
    // This would use fetch or axios in real implementation
    // API delivery implementation
  }

  private async sendViaWebhook(formattedResult: string, channel: DeliveryChannel): Promise<void> {
    // Webhook delivery implementation
    if (!channel.endpoint) throw new Error('Webhook endpoint required');
    
    // Webhook delivery implementation
  }

  private async sendViaEmail(formattedResult: string, channel: DeliveryChannel): Promise<void> {
    // Email delivery implementation
    // Email delivery implementation
  }

  private async saveToFile(formattedResult: string, channel: DeliveryChannel): Promise<void> {
    // File saving implementation
    const filename = channel.endpoint || `result_${Date.now()}.json`;
    // File saving implementation
  }

  private async saveToDatabase(formattedResult: string, channel: DeliveryChannel): Promise<void> {
    // Database saving implementation
    // Database saving implementation
  }

  private async sendToQueue(formattedResult: string, channel: DeliveryChannel): Promise<void> {
    // Queue delivery implementation
    // Queue delivery implementation
  }

  private async sendToStream(formattedResult: string, channel: DeliveryChannel): Promise<void> {
    // Stream delivery implementation
    // Stream delivery implementation
  }
}

export class ScheduledDeliveryStrategy extends DeliveryStrategy {
  private scheduledDeliveries: Map<string, { result: FinalResult; format: DeliveryFormat; channel: DeliveryChannel; scheduleTime: Date }> = new Map();

  async deliver(result: FinalResult, format: DeliveryFormat, channel: DeliveryChannel): Promise<DeliveryResult> {
    const scheduleTime = this.calculateScheduleTime(result, channel);
    const deliveryId = `scheduled_${Date.now()}`;
    
    this.scheduledDeliveries.set(deliveryId, {
      result,
      format,
      channel,
      scheduleTime
    });

    // Schedule the delivery
    // Use a scheduling service in real implementation
    // Schedule the delivery

    return {
      id: deliveryId,
      contentId: result.contentId,
      format,
      channel,
      status: 'pending',
      timestamp: new Date(),
      attempts: 0,
      metadata: {
        size: 0,
        processingTime: 0,
        deliveryTime: 0
      }
    };
  }

  getType(): DeliveryType {
    return DeliveryType.SCHEDULED;
  }

  private calculateScheduleTime(result: FinalResult, channel: DeliveryChannel): Date {
    // Simple scheduling logic - could be enhanced with complex rules
    const now = new Date();
    const delay = Math.random() * 3600000; // Random delay up to 1 hour
    return new Date(now.getTime() + delay);
  }

  private async executeScheduledDelivery(deliveryId: string): Promise<void> {
    const scheduled = this.scheduledDeliveries.get(deliveryId);
    if (!scheduled) return;

    const immediateStrategy = new ImmediateDeliveryStrategy();
    await immediateStrategy.deliver(scheduled.result, scheduled.format, scheduled.channel);
    
    this.scheduledDeliveries.delete(deliveryId);
  }
}

export class BatchDeliveryStrategy extends DeliveryStrategy {
  private batchQueue: FinalResult[] = [];
  private batchSize = 10;
  private batchTimeout = 60000; // 1 minute

  async deliver(result: FinalResult, format: DeliveryFormat, channel: DeliveryChannel): Promise<DeliveryResult> {
    this.batchQueue.push(result);

    if (this.batchQueue.length >= this.batchSize) {
      await this.processBatch(format, channel);
    } else {
      // Set timeout to process batch if it doesn't fill up
      // Use a timer service in real implementation
      // Set timeout to process batch
    }

    return {
      id: `batch_${Date.now()}`,
      contentId: result.contentId,
      format,
      channel,
      status: 'pending',
      timestamp: new Date(),
      attempts: 1,
      metadata: {
        size: 0,
        processingTime: 0,
        deliveryTime: 0
      }
    };
  }

  getType(): DeliveryType {
    return DeliveryType.BATCH;
  }

  private async processBatch(format: DeliveryFormat, channel: DeliveryChannel): Promise<void> {
    if (this.batchQueue.length === 0) return;

    const batch = this.batchQueue.splice(0, this.batchSize);
    
    // Combine results for batch delivery
    const combinedResult = this.combineResults(batch);
    
    const immediateStrategy = new ImmediateDeliveryStrategy();
    await immediateStrategy.deliver(combinedResult, format, channel);
  }

  private combineResults(results: FinalResult[]): FinalResult {
    if (results.length === 0) {
      throw new Error('No results to combine');
    }
    
    const baseResult = results[0];
    if (!baseResult) {
      throw new Error('Base result is undefined');
    }
    
    return {
      ...baseResult,
      contentId: baseResult.contentId,
      id: `batch_${Date.now()}`,
      validationResults: results.flatMap(r => r.validationResults),
      evaluationResults: results.flatMap(r => r.evaluationResults),
      synthesizedInformation: baseResult.synthesizedInformation,
      collectedResults: results.flatMap(r => r.collectedResults),
      summary: {
        overallScore: results.reduce((sum, r) => sum + r.summary.overallScore, 0) / results.length,
        confidence: results.reduce((sum, r) => sum + r.summary.confidence, 0) / results.length,
        keyFindings: results.flatMap(r => r.summary.keyFindings),
        insights: results.flatMap(r => r.summary.insights),
        trends: results.flatMap(r => r.summary.trends),
        anomalies: results.flatMap(r => r.summary.anomalies)
      },
      recommendations: results.flatMap(r => r.recommendations),
      metadata: {
        ...baseResult.metadata,
        totalProcessingTime: results.reduce((sum, r) => sum + r.metadata.totalProcessingTime, 0),
        processingStages: [...new Set(results.flatMap(r => r.metadata.processingStages))]
      },
      timestamp: new Date()
    };
  }
}

export interface DeliveryAgent {
  id: string;
  name: string;
  capabilities: DeliveryType[];
  strategy: DeliveryStrategy;
  performance: {
    totalDeliveries: number;
    successRate: number;
    averageTime: number;
  };
  status: 'active' | 'inactive' | 'busy';
}

export class FinalResultDeliveryAgents {
  private deliveryAgents: Map<string, DeliveryAgent> = new Map();
  private deliveryQueue: DeliveryResult[] = [];
  private processingResults: Map<string, FinalResult> = new Map();

  constructor() {
    this.initializeDeliveryAgents();
  }

  private initializeDeliveryAgents(): void {
    const strategies = [
      new ImmediateDeliveryStrategy(),
      new ScheduledDeliveryStrategy(),
      new BatchDeliveryStrategy()
    ];

    strategies.forEach((strategy, index) => {
      const agent: DeliveryAgent = {
        id: `delivery_agent_${index}`,
        name: `${strategy.getType()} Delivery Agent`,
        capabilities: [strategy.getType()],
        strategy,
        performance: {
          totalDeliveries: 0,
          successRate: 0,
          averageTime: 0
        },
        status: 'active'
      };

      this.deliveryAgents.set(agent.id, agent);
    });
  }

  async createFinalResult(
    contentId: string,
    validationResults: ValidationResult[],
    evaluationResults: EvaluationResult[],
    synthesizedInformation: SynthesizedInformation,
    collectedResults: CollectedResult[]
  ): Promise<FinalResult> {
    const summary = this.generateSummary(validationResults, evaluationResults, synthesizedInformation);
    const recommendations = this.generateRecommendations(validationResults, evaluationResults, synthesizedInformation);
    const metadata = this.generateMetadata(validationResults, evaluationResults, collectedResults);

    const finalResult: FinalResult = {
      id: `final_${contentId}_${Date.now()}`,
      contentId,
      validationResults,
      evaluationResults,
      synthesizedInformation,
      collectedResults,
      summary,
      recommendations,
      metadata,
      timestamp: new Date()
    };

    this.processingResults.set(finalResult.id, finalResult);
    return finalResult;
  }

  async deliverResult(
    result: FinalResult,
    format: DeliveryFormat,
    channel: DeliveryChannel,
    deliveryType: DeliveryType = DeliveryType.IMMEDIATE
  ): Promise<DeliveryResult> {
    const agent = this.selectBestAgent(deliveryType);
    if (!agent) {
      throw new Error(`No agent available for delivery type: ${deliveryType}`);
    }

    const startTime = Date.now();
    agent.status = 'busy';

    try {
      const deliveryResult = await agent.strategy.deliver(result, format, channel);
      
      // Update agent performance
      agent.performance.totalDeliveries++;
      const success = deliveryResult.status === 'delivered';
      agent.performance.successRate = 
        (agent.performance.successRate * (agent.performance.totalDeliveries - 1) + (success ? 1 : 0)) / 
        agent.performance.totalDeliveries;
      
      agent.performance.averageTime = 
        (agent.performance.averageTime * (agent.performance.totalDeliveries - 1) + (Date.now() - startTime)) / 
        agent.performance.totalDeliveries;

      this.deliveryQueue.push(deliveryResult);
      return deliveryResult;
    } finally {
      agent.status = 'active';
    }
  }

  private generateSummary(
    validationResults: ValidationResult[],
    evaluationResults: EvaluationResult[],
    synthesizedInformation: SynthesizedInformation
  ): ResultSummary {
    const overallScore = evaluationResults.length > 0 
      ? evaluationResults.reduce((sum, r) => sum + r.score, 0) / evaluationResults.length 
      : 0.5;

    const confidence = validationResults.length > 0
      ? validationResults.filter(r => r.passed).length / validationResults.length
      : 0.5;

    const keyFindings = [
      ...validationResults.filter(r => !r.passed).map(r => `Validation issue: ${r.issues.join(', ')}`),
      ...evaluationResults.filter(r => r.score > 0.8).map(r => `High-quality evaluation: ${r.strengths.join(', ')}`),
      ...synthesizedInformation.insights.map(i => i.content)
    ].slice(0, 10);

    const insights = synthesizedInformation.insights.map(i => i.content);
    const trends = synthesizedInformation.relationships.map(r => `Relationship: ${r.description}`);
    const anomalies = validationResults.filter(r => r.issues.length > 0).map(r => r.issues.join(', '));

    return {
      overallScore,
      confidence,
      keyFindings,
      insights,
      trends,
      anomalies
    };
  }

  private generateRecommendations(
    validationResults: ValidationResult[],
    evaluationResults: EvaluationResult[],
    synthesizedInformation: SynthesizedInformation
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // Validation-based recommendations
    validationResults.forEach((validation, index) => {
      validation.recommendations.forEach(rec => {
        recommendations.push({
          id: `val_rec_${index}_${Date.now()}`,
          type: 'improvement',
          priority: validation.passed ? 'low' : 'high',
          title: `Validation Recommendation`,
          description: rec,
          impact: 'Improve content quality and compliance',
          effort: 'medium',
          dependencies: []
        });
      });
    });

    // Evaluation-based recommendations
    evaluationResults.forEach((evaluation, index) => {
      evaluation.weaknesses.forEach(weakness => {
        recommendations.push({
          id: `eval_rec_${index}_${Date.now()}`,
          type: 'optimization',
          priority: evaluation.score < 0.6 ? 'high' : 'medium',
          title: `Evaluation Recommendation`,
          description: weakness,
          impact: 'Enhance overall content effectiveness',
          effort: 'medium',
          dependencies: []
        });
      });
    });

    // Synthesis-based recommendations
    synthesizedInformation.insights.forEach((insight, index) => {
      if (insight.importance > 0.8) {
        recommendations.push({
          id: `synth_rec_${index}_${Date.now()}`,
          type: 'action',
          priority: 'high',
          title: `Action Required: ${insight.type}`,
          description: insight.content,
          impact: 'Critical insight requiring immediate attention',
          effort: 'high',
          dependencies: []
        });
      }
    });

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  private generateMetadata(
    validationResults: ValidationResult[],
    evaluationResults: EvaluationResult[],
    collectedResults: CollectedResult[]
  ): ResultMetadata {
    const processingStages = [
      'validation',
      'evaluation',
      'synthesis',
      'collection'
    ];

    const totalProcessingTime = [
      ...validationResults.map(r => r.timestamp.getTime()),
      ...evaluationResults.map(r => r.timestamp.getTime()),
      ...collectedResults.map(r => r.timestamp.getTime())
    ].reduce((max, time) => Math.max(max, time), 0) - Math.min(
      ...validationResults.map(r => r.timestamp.getTime()),
      ...evaluationResults.map(r => r.timestamp.getTime()),
      ...collectedResults.map(r => r.timestamp.getTime())
    );

    const agentPerformance: Record<string, any> = {};
    
    validationResults.forEach(r => {
      agentPerformance[r.validatorId] = (agentPerformance[r.validatorId] || 0) + 1;
    });
    
    evaluationResults.forEach(r => {
      agentPerformance[r.evaluatorId] = (agentPerformance[r.evaluatorId] || 0) + 1;
    });

    const qualityMetrics = {
      accuracy: validationResults.filter(r => r.criteria.accuracy > 0.8).length / Math.max(1, validationResults.length),
      completeness: validationResults.filter(r => r.criteria.completeness > 0.8).length / Math.max(1, validationResults.length),
      consistency: validationResults.filter(r => r.criteria.consistency > 0.8).length / Math.max(1, validationResults.length),
      relevance: validationResults.filter(r => r.criteria.relevance > 0.8).length / Math.max(1, validationResults.length)
    };

    return {
      processingStages,
      totalProcessingTime,
      agentPerformance,
      qualityMetrics,
      version: '1.0.0'
    };
  }

  private selectBestAgent(deliveryType: DeliveryType): DeliveryAgent | undefined {
    const availableAgents = Array.from(this.deliveryAgents.values())
      .filter(agent => agent.capabilities.includes(deliveryType) && agent.status === 'active');

    if (availableAgents.length === 0) return undefined;

    return availableAgents.reduce((best, current) => 
      current.performance.successRate > best.performance.successRate ? current : best
    );
  }

  getDeliveryAgents(): DeliveryAgent[] {
    return Array.from(this.deliveryAgents.values());
  }

  getDeliveryQueue(): DeliveryResult[] {
    return [...this.deliveryQueue];
  }

  getProcessingResult(resultId: string): FinalResult | undefined {
    return this.processingResults.get(resultId);
  }

  clearProcessingResult(resultId?: string): void {
    if (resultId) {
      this.processingResults.delete(resultId);
    } else {
      this.processingResults.clear();
    }
  }

  async retryFailedDeliveries(): Promise<void> {
    const failedDeliveries = this.deliveryQueue.filter(d => d.status === 'failed');
    
    for (const delivery of failedDeliveries) {
      if (delivery.attempts < 3) { // Max 3 attempts
        const result = this.processingResults.get(delivery.contentId);
        if (result) {
          delivery.attempts++;
          delivery.status = 'pending';
          
          const agent = this.selectBestAgent(DeliveryType.IMMEDIATE);
          if (agent) {
            await agent.strategy.deliver(result, delivery.format, delivery.channel);
          }
        }
      }
    }
  }
}
