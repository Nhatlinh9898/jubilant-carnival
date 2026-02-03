import { ContentChunk } from './contentManagementSystem';

export interface ProcessingStrategy {
  name: string;
  canProcess: (chunk: ContentChunk) => boolean;
  process: (chunk: ContentChunk, context: any) => Promise<any>;
  priority: number;
}

export interface ProcessingContext {
  agentId: string;
  documentId: string;
  previousResults: any[];
  relatedChunks: ContentChunk[];
  processingGoals: string[];
}

export interface ProcessingResult {
  success: boolean;
  data: any;
  metadata: {
    processingTime: number;
    strategy: string;
    confidence: number;
    extractedEntities: string[];
    summary: string;
    keyPoints: string[];
  };
  nextActions: string[];
}

export class ContentChunkProcessor {
  private strategies: Map<string, ProcessingStrategy> = new Map();
  private processors: Map<string, any> = new Map();

  constructor() {
    this.initializeStrategies();
  }

  private initializeStrategies(): void {
    // Text analysis strategy
    this.registerStrategy({
      name: 'text_analysis',
      canProcess: (chunk) => chunk.metadata.contentType === 'text',
      process: this.processTextChunk.bind(this),
      priority: 1
    });

    // Code analysis strategy
    this.registerStrategy({
      name: 'code_analysis',
      canProcess: (chunk) => chunk.metadata.contentType === 'code',
      process: this.processCodeChunk.bind(this),
      priority: 2
    });

    // Data analysis strategy
    this.registerStrategy({
      name: 'data_analysis',
      canProcess: (chunk) => chunk.metadata.contentType === 'data',
      process: this.processDataChunk.bind(this),
      priority: 3
    });

    // Mixed content strategy
    this.registerStrategy({
      name: 'mixed_content',
      canProcess: (chunk) => chunk.metadata.contentType === 'mixed',
      process: this.processMixedChunk.bind(this),
      priority: 4
    });
  }

  public registerStrategy(strategy: ProcessingStrategy): void {
    this.strategies.set(strategy.name, strategy);
  }

  public async processChunk(
    chunk: ContentChunk, 
    context: ProcessingContext
  ): Promise<ProcessingResult> {
    const startTime = Date.now();
    
    try {
      // Find best processing strategy
      const strategy = this.findBestStrategy(chunk);
      if (!strategy) {
        throw new Error('No suitable processing strategy found');
      }

      // Process the chunk
      const result = await strategy.process(chunk, context);
      
      const processingTime = Date.now() - startTime;
      
      return {
        success: true,
        data: result,
        metadata: {
          processingTime,
          strategy: strategy.name,
          confidence: this.calculateConfidence(result, chunk),
          extractedEntities: this.extractEntities(result),
          summary: this.generateResultSummary(result),
          keyPoints: this.extractKeyPoints(result)
        },
        nextActions: this.determineNextActions(result, chunk)
      };
    } catch (error) {
      return {
        success: false,
        data: { error: error.message },
        metadata: {
          processingTime: Date.now() - startTime,
          strategy: 'error',
          confidence: 0,
          extractedEntities: [],
          summary: 'Processing failed',
          keyPoints: []
        },
        nextActions: ['retry', 'escalate']
      };
    }
  }

  private findBestStrategy(chunk: ContentChunk): ProcessingStrategy | null {
    const suitableStrategies = Array.from(this.strategies.values())
      .filter(strategy => strategy.canProcess(chunk))
      .sort((a, b) => a.priority - b.priority);
    
    return suitableStrategies[0] || null;
  }

  private async processTextChunk(
    chunk: ContentChunk, 
    context: ProcessingContext
  ): Promise<any> {
    const content = chunk.content;
    
    return {
      type: 'text_analysis',
      analysis: {
        sentiment: this.analyzeSentiment(content),
        topics: this.extractTopics(content),
        entities: this.extractNamedEntities(content),
        language: this.detectLanguage(content),
        readability: this.calculateReadability(content),
        structure: this.analyzeStructure(content)
      },
      relationships: {
        concepts: this.extractConcepts(content),
        dependencies: this.findDependencies(content, context.relatedChunks),
        hierarchy: this.buildHierarchy(content)
      },
      insights: {
        mainPoints: this.extractMainPoints(content),
        implications: this.analyzeImplications(content),
        recommendations: this.generateRecommendations(content)
      }
    };
  }

  private async processCodeChunk(
    chunk: ContentChunk, 
    context: ProcessingContext
  ): Promise<any> {
    const content = chunk.content;
    
    return {
      type: 'code_analysis',
      analysis: {
        language: this.detectCodeLanguage(content),
        complexity: this.calculateCodeComplexity(content),
        patterns: this.identifyCodePatterns(content),
        dependencies: this.findCodeDependencies(content),
        quality: this.assessCodeQuality(content)
      },
      structure: {
        functions: this.extractFunctions(content),
        classes: this.extractClasses(content),
        imports: this.extractImports(content),
        exports: this.extractExports(content)
      },
      metrics: {
        linesOfCode: this.countLinesOfCode(content),
        cyclomaticComplexity: this.calculateCyclomaticComplexity(content),
        maintainability: this.assessMaintainability(content),
        testCoverage: this.estimateTestCoverage(content)
      }
    };
  }

  private async processDataChunk(
    chunk: ContentChunk, 
    context: ProcessingContext
  ): Promise<any> {
    const content = chunk.content;
    
    return {
      type: 'data_analysis',
      analysis: {
        format: this.detectDataFormat(content),
        schema: this.inferSchema(content),
        quality: this.assessDataQuality(content),
        patterns: this.identifyDataPatterns(content)
      },
      statistics: {
        recordCount: this.countRecords(content),
        fieldCount: this.countFields(content),
        completeness: this.calculateCompleteness(content),
        uniqueness: this.calculateUniqueness(content)
      },
      relationships: {
        connections: this.findDataConnections(content, context.relatedChunks),
        hierarchies: this.identifyHierarchies(content),
        dependencies: this.findDataDependencies(content)
      }
    };
  }

  private async processMixedChunk(
    chunk: ContentChunk, 
    context: ProcessingContext
  ): Promise<any> {
    // Split mixed content and process each part
    const parts = this.splitMixedContent(chunk.content);
    const results = [];
    
    for (const part of parts) {
      const syntheticChunk: ContentChunk = {
        ...chunk,
        content: part.content,
        metadata: {
          ...chunk.metadata,
          contentType: part.type
        }
      };
      
      const strategy = this.findBestStrategy(syntheticChunk);
      if (strategy) {
        const partResult = await strategy.process(syntheticChunk, context);
        results.push({
          type: part.type,
          result: partResult
        });
      }
    }
    
    return {
      type: 'mixed_content_analysis',
      parts: results,
      synthesis: this.synthesizeMixedResults(results)
    };
  }

  // Text processing methods
  private analyzeSentiment(text: string): { polarity: number; subjectivity: number } {
    // Simple sentiment analysis
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic'];
    const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'disappointing', 'poor'];
    
    const words = text.toLowerCase().split(/\W+/);
    const positiveCount = words.filter(word => positiveWords.includes(word)).length;
    const negativeCount = words.filter(word => negativeWords.includes(word)).length;
    
    const totalSentimentWords = positiveCount + negativeCount;
    const polarity = totalSentimentWords > 0 ? (positiveCount - negativeCount) / totalSentimentWords : 0;
    const subjectivity = Math.min(totalSentimentWords / words.length, 1);
    
    return { polarity, subjectivity };
  }

  private extractTopics(text: string): string[] {
    const words = text.toLowerCase().split(/\W+/);
    const wordFreq = new Map<string, number>();
    
    words.forEach(word => {
      if (word.length > 4 && !this.isStopWord(word)) {
        wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
      }
    });
    
    return Array.from(wordFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);
  }

  private extractNamedEntities(text: string): string[] {
    // Simple entity extraction (can be enhanced with NLP libraries)
    const entities: string[] = [];
    
    // Extract capitalized words (potential proper nouns)
    const capitalizedWords = text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || [];
    entities.push(...capitalizedWords);
    
    // Extract email addresses
    const emails = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g) || [];
    entities.push(...emails);
    
    // Extract URLs
    const urls = text.match(/https?:\/\/[^\s]+/g) || [];
    entities.push(...urls);
    
    return [...new Set(entities)]; // Remove duplicates
  }

  private detectLanguage(text: string): string {
    // Simple language detection based on character patterns
    const chinesePattern = /[\u4e00-\u9fff]/;
    const arabicPattern = /[\u0600-\u06ff]/;
    const cyrillicPattern = /[\u0400-\u04ff]/;
    
    if (chinesePattern.test(text)) return 'zh';
    if (arabicPattern.test(text)) return 'ar';
    if (cyrillicPattern.test(text)) return 'ru';
    
    return 'en'; // Default to English
  }

  private calculateReadability(text: string): number {
    const sentences = text.split(/[.!?]+/).length;
    const words = text.split(/\s+/).length;
    const syllables = this.countSyllables(text);
    
    // Flesch Reading Ease Score
    const score = 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words);
    return Math.max(0, Math.min(100, score));
  }

  private countSyllables(text: string): number {
    const words = text.toLowerCase().split(/\s+/);
    let syllableCount = 0;
    
    words.forEach(word => {
      const syllables = word.match(/[aeiouy]+/g);
      syllableCount += syllables ? syllables.length : 1;
    });
    
    return syllableCount;
  }

  private analyzeStructure(text: string): any {
    const paragraphs = text.split(/\n\n+/).length;
    const sentences = text.split(/[.!?]+/).length;
    const words = text.split(/\s+/).length;
    
    return {
      paragraphs,
      sentences,
      words,
      avgWordsPerSentence: words / sentences,
      avgSentencesPerParagraph: sentences / paragraphs
    };
  }

  private extractConcepts(text: string): string[] {
    // Extract key concepts using keyword extraction
    const keywords = this.extractKeywords(text);
    const concepts = keywords.filter(keyword => 
      keyword.length > 5 && !this.isStopWord(keyword)
    );
    
    return concepts.slice(0, 10);
  }

  private extractKeywords(text: string): string[] {
    const words = text.toLowerCase()
      .split(/\W+/)
      .filter(word => word.length > 3)
      .filter(word => !this.isStopWord(word));
    
    const wordFreq = new Map<string, number>();
    words.forEach(word => {
      wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
    });
    
    return Array.from(wordFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([word]) => word);
  }

  private isStopWord(word: string): boolean {
    const stopWords = new Set([
      'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
      'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after',
      'above', 'below', 'between', 'among', 'this', 'that', 'these', 'those',
      'i', 'you', 'he', 'she', 'it', 'we', 'they', 'what', 'which', 'who',
      'when', 'where', 'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more'
    ]);
    
    return stopWords.has(word);
  }

  private findDependencies(text: string, relatedChunks: ContentChunk[]): string[] {
    const dependencies: string[] = [];
    const currentKeywords = new Set(this.extractKeywords(text));
    
    relatedChunks.forEach(chunk => {
      const chunkKeywords = this.extractKeywords(chunk.content);
      const overlap = chunkKeywords.filter(keyword => currentKeywords.has(keyword));
      
      if (overlap.length > 2) {
        dependencies.push(chunk.id);
      }
    });
    
    return dependencies;
  }

  private buildHierarchy(text: string): any {
    const lines = text.split('\n');
    const hierarchy: any[] = [];
    
    lines.forEach(line => {
      const indent = line.search(/\S/);
      const content = line.trim();
      
      if (content.length > 0) {
        hierarchy.push({
          level: Math.floor(indent / 2),
          content,
          type: this.identifyLineType(content)
        });
      }
    });
    
    return hierarchy;
  }

  private identifyLineType(content: string): string {
    if (/^\d+\./.test(content)) return 'numbered_list';
    if (/^[•\-\*]\s/.test(content)) return 'bullet_list';
    if (/^[A-Z][^.]*:$/.test(content)) return 'heading';
    if (content.length < 50) return 'short_text';
    return 'paragraph';
  }

  private extractMainPoints(text: string): string[] {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    // Score sentences based on various factors
    const scoredSentences = sentences.map(sentence => {
      const words = sentence.split(/\s+/);
      const keywords = this.extractKeywords(sentence);
      const position = sentences.indexOf(sentence);
      
      let score = 0;
      score += keywords.length * 0.3; // Keyword density
      score += words.length > 10 ? 0.2 : 0; // Length preference
      score += position < sentences.length * 0.3 ? 0.3 : 0; // Position preference
      score += /[A-Z]/.test(sentence) ? 0.2 : 0; // Capitalization
      
      return { sentence: sentence.trim(), score };
    });
    
    return scoredSentences
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(item => item.sentence);
  }

  private analyzeImplications(text: string): string[] {
    const implications: string[] = [];
    
    // Look for implication indicators
    const implicationPatterns = [
      /therefore[^.]*\./gi,
      /as a result[^.]*\./gi,
      /consequently[^.]*\./gi,
      /this means[^.]*\./gi
    ];
    
    implicationPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        implications.push(...matches.map(m => m.trim()));
      }
    });
    
    return implications.slice(0, 5);
  }

  private generateRecommendations(text: string): string[] {
    const recommendations: string[] = [];
    
    // Look for recommendation indicators
    const recommendationPatterns = [
      /should[^.]*\./gi,
      /must[^.]*\./gi,
      /recommend[^.]*\./gi,
      /suggest[^.]*\./gi
    ];
    
    recommendationPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        recommendations.push(...matches.map(m => m.trim()));
      }
    });
    
    return recommendations.slice(0, 5);
  }

  // Code processing methods
  private detectCodeLanguage(code: string): string {
    const patterns = {
      javascript: /function|const|let|var|=>|import|export/,
      python: /def |import |from |print\(|#/,
      java: /public class|private|protected|import java/,
      cpp: /#include|namespace|std::|cout|cin/,
      html: /<[^>]+>/,
      css: /\{[^}]*\}|#[a-f0-9]{3,6}/,
      sql: /SELECT|FROM|WHERE|INSERT|UPDATE|DELETE/
    };
    
    for (const [language, pattern] of Object.entries(patterns)) {
      if (pattern.test(code)) return language;
    }
    
    return 'unknown';
  }

  private calculateCodeComplexity(code: string): number {
    const complexityIndicators = [
      /if\s*\(/g, /for\s*\(/g, /while\s*\(/g, /switch\s*\(/g,
      /catch\s*\(/g, /function\s+\w+\s*\(/g, /class\s+\w+/g
    ];
    
    let complexity = 1;
    complexityIndicators.forEach(pattern => {
      const matches = code.match(pattern);
      if (matches) complexity += matches.length * 0.5;
    });
    
    return Math.min(complexity, 10);
  }

  private identifyCodePatterns(code: string): string[] {
    const patterns: string[] = [];
    
    if (/function\s+\w+.*return/.test(code)) patterns.push('function_with_return');
    if (/class\s+\w+/.test(code)) patterns.push('class_definition');
    if (/try\s*{.*catch\s*\(/.test(code)) patterns.push('error_handling');
    if (/import.*from/.test(code)) patterns.push('module_import');
    if (/async|await/.test(code)) patterns.push('async_programming');
    
    return patterns;
  }

  private findCodeDependencies(code: string): string[] {
    const dependencies: string[] = [];
    
    // Extract import statements
    const importMatches = code.match(/import\s+.*from\s+['"]([^'"]+)['"]/g);
    if (importMatches) {
      dependencies.push(...importMatches.map(m => m.trim()));
    }
    
    // Extract require statements
    const requireMatches = code.match(/require\s*\(\s*['"]([^'"]+)['"]\s*\)/g);
    if (requireMatches) {
      dependencies.push(...requireMatches.map(m => m.trim()));
    }
    
    return dependencies;
  }

  private assessCodeQuality(code: string): number {
    let quality = 100;
    
    // Deductions for code smells
    if (code.length > 1000) quality -= 10; // Too long
    if ((code.match(/if\s*\(/g) || []).length > 5) quality -= 15; // Too many conditions
    if (!/\/\*[\s\S]*?\*\/|\/\/.*$/gm.test(code)) quality -= 20; // No comments
    if (/console\.log/.test(code)) quality -= 5; // Debug code
    
    return Math.max(0, quality);
  }

  private extractFunctions(code: string): string[] {
    const functions: string[] = [];
    const functionMatches = code.match(/function\s+(\w+)\s*\([^)]*\)/g);
    
    if (functionMatches) {
      functions.push(...functionMatches.map(m => m.replace(/function\s+/, '').split('(')[0].trim()));
    }
    
    return functions;
  }

  private extractClasses(code: string): string[] {
    const classes: string[] = [];
    const classMatches = code.match(/class\s+(\w+)/g);
    
    if (classMatches) {
      classes.push(...classMatches.map(m => m.replace(/class\s+/, '').trim()));
    }
    
    return classes;
  }

  private extractImports(code: string): string[] {
    const imports: string[] = [];
    const importMatches = code.match(/import\s+.*from\s+['"]([^'"]+)['"]/g);
    
    if (importMatches) {
      imports.push(...importMatches.map(m => m.match(/from\s+['"]([^'"]+)['"]/)?.[1] || ''));
    }
    
    return imports.filter(Boolean);
  }

  private extractExports(code: string): string[] {
    const exports: string[] = [];
    const exportMatches = code.match(/export\s+(?:default\s+)?(?:class|function|const|let|var)\s+(\w+)/g);
    
    if (exportMatches) {
      exports.push(...exportMatches.map(m => {
        const match = m.match(/(class|function|const|let|var)\s+(\w+)/);
        return match ? match[2] : '';
      }));
    }
    
    return exports.filter(Boolean);
  }

  private countLinesOfCode(code: string): number {
    const lines = code.split('\n');
    return lines.filter(line => line.trim().length > 0 && !line.trim().startsWith('//')).length;
  }

  private calculateCyclomaticComplexity(code: string): number {
    const decisionPoints = code.match(/\b(if|while|for|switch|catch|case)\b/g) || [];
    return 1 + decisionPoints.length;
  }

  private assessMaintainability(code: string): number {
    let maintainability = 100;
    
    const lines = this.countLinesOfCode(code);
    const complexity = this.calculateCyclomaticComplexity(code);
    
    if (lines > 100) maintainability -= 20;
    if (complexity > 10) maintainability -= 30;
    if (!/\/\*[\s\S]*?\*\/|\/\/.*$/gm.test(code)) maintainability -= 25;
    
    return Math.max(0, maintainability);
  }

  private estimateTestCoverage(code: string): number {
    // Simple estimation based on test-related keywords
    const testKeywords = ['test', 'spec', 'describe', 'it', 'expect', 'assert'];
    const hasTestKeywords = testKeywords.some(keyword => code.toLowerCase().includes(keyword));
    
    return hasTestKeywords ? 70 : 30; // Rough estimate
  }

  // Data processing methods
  private detectDataFormat(data: string): string {
    if (/^\s*\{[\s\S]*\}\s*$/.test(data)) return 'json';
    if (/^[^,\s]+,[^,\s]+/.test(data)) return 'csv';
    if (/^<[^>]+>/.test(data)) return 'xml';
    if (/^\s*\|/.test(data)) return 'markdown_table';
    
    return 'unknown';
  }

  private inferSchema(data: string): any {
    try {
      if (this.detectDataFormat(data) === 'json') {
        const parsed = JSON.parse(data);
        return this.inferJsonSchema(parsed);
      }
    } catch (error) {
      // Not valid JSON
    }
    
    return { type: 'unknown', fields: [] };
  }

  private inferJsonSchema(obj: any): any {
    if (Array.isArray(obj)) {
      return {
        type: 'array',
        items: obj.length > 0 ? this.inferJsonSchema(obj[0]) : { type: 'unknown' }
      };
    }
    
    if (typeof obj === 'object' && obj !== null) {
      const properties: any = {};
      
      for (const [key, value] of Object.entries(obj)) {
        properties[key] = this.inferJsonSchema(value);
      }
      
      return {
        type: 'object',
        properties
      };
    }
    
    return {
      type: typeof obj
    };
  }

  private assessDataQuality(data: string): number {
    let quality = 100;
    
    // Check for common data quality issues
    if (data.includes('null') || data.includes('undefined')) quality -= 10;
    if (data.includes('N/A') || data.includes('missing')) quality -= 15;
    if (data.trim().length === 0) quality -= 50;
    
    return Math.max(0, quality);
  }

  private identifyDataPatterns(data: string): string[] {
    const patterns: string[] = [];
    
    if (/\d{4}-\d{2}-\d{2}/.test(data)) patterns.push('dates');
    if (/\b\d+\.?\d*\b/.test(data)) patterns.push('numbers');
    if (/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/.test(data)) patterns.push('emails');
    if (/https?:\/\/[^\s]+/.test(data)) patterns.push('urls');
    
    return patterns;
  }

  private countRecords(data: string): number {
    const format = this.detectDataFormat(data);
    
    switch (format) {
      case 'json':
        try {
          const parsed = JSON.parse(data);
          return Array.isArray(parsed) ? parsed.length : 1;
        } catch {
          return 0;
        }
      case 'csv':
        return data.split('\n').length - 1; // Subtract header
      default:
        return 1;
    }
  }

  private countFields(data: string): number {
    const format = this.detectDataFormat(data);
    
    switch (format) {
      case 'json':
        try {
          const parsed = JSON.parse(data);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return Object.keys(parsed[0]).length;
          }
          return Object.keys(parsed).length;
        } catch {
          return 0;
        }
      case 'csv':
        const firstLine = data.split('\n')[0];
        return firstLine.split(',').length;
      default:
        return 0;
    }
  }

  private calculateCompleteness(data: string): number {
    const totalFields = this.countFields(data);
    const records = this.countRecords(data);
    
    if (totalFields === 0 || records === 0) return 0;
    
    // Count non-null values (simplified)
    const nonNullValues = (data.match(/[^,\s]+/g) || []).length;
    const totalValues = totalFields * records;
    
    return totalValues > 0 ? (nonNullValues / totalValues) * 100 : 0;
  }

  private calculateUniqueness(data: string): number {
    // Simple uniqueness calculation for first column
    const lines = data.split('\n');
    if (lines.length < 2) return 100;
    
    const firstColumnValues = lines.map(line => line.split(',')[0]).slice(1);
    const uniqueValues = new Set(firstColumnValues);
    
    return (uniqueValues.size / firstColumnValues.length) * 100;
  }

  private findDataConnections(data: string, relatedChunks: ContentChunk[]): string[] {
    const connections: string[] = [];
    const currentData = this.extractDataIdentifiers(data);
    
    relatedChunks.forEach(chunk => {
      const chunkData = this.extractDataIdentifiers(chunk.content);
      const overlap = currentData.filter(id => chunkData.includes(id));
      
      if (overlap.length > 0) {
        connections.push(chunk.id);
      }
    });
    
    return connections;
  }

  private extractDataIdentifiers(data: string): string[] {
    const identifiers: string[] = [];
    
    // Extract field names from JSON
    const jsonFields = data.match(/"(\w+)"\s*:/g);
    if (jsonFields) {
      identifiers.push(...jsonFields.map(f => f.replace(/"(\w+)"\s*:/, '$1')));
    }
    
    // Extract column names from CSV
    const csvHeader = data.split('\n')[0];
    if (csvHeader && csvHeader.includes(',')) {
      identifiers.push(...csvHeader.split(',').map(col => col.trim()));
    }
    
    return identifiers;
  }

  private identifyHierarchies(data: string): string[] {
    const hierarchies: string[] = [];
    
    // Look for hierarchical patterns
    if (data.includes('parent_id') || data.includes('parentId')) hierarchies.push('parent_child');
    if (data.includes('level') || data.includes('depth')) hierarchies.push('nested_hierarchy');
    if (data.includes('tree') || data.includes('node')) hierarchies.push('tree_structure');
    
    return hierarchies;
  }

  private findDataDependencies(data: string): string[] {
    const dependencies: string[] = [];
    
    // Look for foreign key patterns
    const foreignKeyPatterns = [
      /(\w+)_id/gi,
      /(\w+)Id/g,
      /foreign_key/gi
    ];
    
    foreignKeyPatterns.forEach(pattern => {
      const matches = data.match(pattern);
      if (matches) {
        dependencies.push(...matches);
      }
    });
    
    return [...new Set(dependencies)];
  }

  // Mixed content processing
  private splitMixedContent(content: string): Array<{ type: 'text' | 'code' | 'data'; content: string }> {
    const parts: Array<{ type: 'text' | 'code' | 'data'; content: string }> = [];
    
    // Split by code blocks
    const codeBlocks = content.match(/```[\s\S]*?```/g) || [];
    const remainingContent = content.replace(/```[\s\S]*?```/g, '<<CODE_BLOCK>>');
    
    // Add code blocks
    codeBlocks.forEach(block => {
      parts.push({
        type: 'code',
        content: block.replace(/```\w*\n?/, '').replace(/```$/, '')
      });
    });
    
    // Process remaining content
    const segments = remainingContent.split('<<CODE_BLOCK>>');
    segments.forEach(segment => {
      if (segment.trim().length > 0) {
        const type = this.detectContentType(segment);
        parts.push({ type, content: segment });
      }
    });
    
    return parts;
  }

  private detectContentType(content: string): 'text' | 'code' | 'data' {
    if (/```[\s\S]*```|`[^`]+`/.test(content)) return 'code';
    if (/\{[\s\S]*\}|\[[\s\S]*\]/.test(content)) return 'data';
    return 'text';
  }

  private synthesizeMixedResults(results: any[]): any {
    return {
      synthesis: {
        overallType: 'mixed_content',
        components: results.map(r => r.type),
        integration: this.integrateResults(results)
      },
      insights: {
        relationships: this.findCrossTypeRelationships(results),
        patterns: this.identifyCrossTypePatterns(results),
        summary: this.generateMixedSummary(results)
      }
    };
  }

  private integrateResults(results: any[]): any {
    // Combine insights from different content types
    const integration: any = {
      entities: [],
      topics: [],
      relationships: []
    };
    
    results.forEach(result => {
      if (result.result.analysis?.entities) {
        integration.entities.push(...result.result.analysis.entities);
      }
      if (result.result.analysis?.topics) {
        integration.topics.push(...result.result.analysis.topics);
      }
      if (result.result.relationships) {
        integration.relationships.push(...result.result.relationships);
      }
    });
    
    // Remove duplicates
    integration.entities = [...new Set(integration.entities)];
    integration.topics = [...new Set(integration.topics)];
    
    return integration;
  }

  private findCrossTypeRelationships(results: any[]): string[] {
    const relationships: string[] = [];
    
    // Look for relationships between different content types
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

  private analyzeRelationship(result1: any, result2: any): string | null {
    // Simple relationship analysis
    if (result1.type === 'code' && result2.type === 'text') {
      return 'code_explanation';
    }
    if (result1.type === 'data' && result2.type === 'code') {
      return 'data_processing';
    }
    if (result1.type === 'text' && result2.type === 'data') {
      return 'text_data_context';
    }
    
    return null;
  }

  private identifyCrossTypePatterns(results: any[]): string[] {
    const patterns: string[] = [];
    
    // Look for patterns across different content types
    const hasCode = results.some(r => r.type === 'code');
    const hasData = results.some(r => r.type === 'data');
    const hasText = results.some(r => r.type === 'text');
    
    if (hasCode && hasData) patterns.push('code_data_integration');
    if (hasCode && hasText) patterns.push('code_documentation');
    if (hasData && hasText) patterns.push('data_explanation');
    if (hasCode && hasData && hasText) patterns.push('comprehensive_example');
    
    return patterns;
  }

  private generateMixedSummary(results: any[]): string {
    const types = results.map(r => r.type).join(', ');
    const insights = results.length;
    
    return `Mixed content containing ${types} with ${insights} processed components.`;
  }

  // Utility methods
  private calculateConfidence(result: any, chunk: ContentChunk): number {
    let confidence = 0.8; // Base confidence
    
    // Adjust based on chunk complexity
    if (chunk.metadata.complexity > 0.7) confidence -= 0.2;
    
    // Adjust based on result completeness
    if (result && Object.keys(result).length > 3) confidence += 0.1;
    
    return Math.max(0, Math.min(1, confidence));
  }

  private extractEntities(result: any): string[] {
    const entities: string[] = [];
    
    if (result.analysis?.entities) {
      entities.push(...result.analysis.entities);
    }
    
    if (result.structure?.functions) {
      entities.push(...result.structure.functions);
    }
    
    if (result.structure?.classes) {
      entities.push(...result.structure.classes);
    }
    
    return [...new Set(entities)];
  }

  private generateResultSummary(result: any): string {
    if (result.type === 'text_analysis') {
      return `Text analysis with ${result.analysis.topics?.length || 0} topics and ${result.analysis.entities?.length || 0} entities.`;
    }
    
    if (result.type === 'code_analysis') {
      return `Code analysis in ${result.analysis.language} with complexity ${result.analysis.complexity?.toFixed(2) || 'unknown'}.`;
    }
    
    if (result.type === 'data_analysis') {
      return `Data analysis with ${result.statistics?.recordCount || 0} records and ${result.statistics?.fieldCount || 0} fields.`;
    }
    
    if (result.type === 'mixed_content_analysis') {
      return `Mixed content analysis with ${result.parts?.length || 0} components.`;
    }
    
    return 'Analysis completed.';
  }

  private extractKeyPoints(result: any): string[] {
    const keyPoints: string[] = [];
    
    if (result.insights?.mainPoints) {
      keyPoints.push(...result.insights.mainPoints);
    }
    
    if (result.analysis?.topics) {
      keyPoints.push(...result.analysis.topics.slice(0, 3));
    }
    
    if (result.structure?.functions) {
      keyPoints.push(`Functions: ${result.structure.functions.slice(0, 3).join(', ')}`);
    }
    
    return keyPoints.slice(0, 5);
  }

  private determineNextActions(result: any, chunk: ContentChunk): string[] {
    const actions: string[] = [];
    
    // Based on content type and analysis results
    if (chunk.metadata.complexity > 0.8) {
      actions.push('deep_analysis');
    }
    
    if (chunk.relationships.relatedChunks.length > 2) {
      actions.push('context_analysis');
    }
    
    if (result.type === 'code_analysis' && result.analysis.complexity > 5) {
      actions.push('refactoring_suggestion');
    }
    
    if (result.type === 'data_analysis' && result.statistics.completeness < 80) {
      actions.push('data_enrichment');
    }
    
    return actions;
  }
}
