export interface ContentChunk {
  id: string;
  content: string;
  metadata: {
    position: number;
    totalChunks: number;
    wordCount: number;
    contentType: 'text' | 'code' | 'data' | 'mixed';
    complexity: number;
    keywords: string[];
    summary: string;
  };
  relationships: {
    previousChunk?: string;
    nextChunk?: string;
    relatedChunks: string[];
    parentDocument: string;
  };
  processing: {
    status: 'pending' | 'processing' | 'completed' | 'error';
    assignedAgent?: string;
    processingHistory: Array<{
      agentId: string;
      timestamp: Date;
      action: string;
      result: any;
    }>;
  };
}

export interface DocumentMetadata {
  id: string;
  title: string;
  type: string;
  size: number;
  wordCount: number;
  estimatedProcessingTime: number;
  complexity: number;
  domain: string;
  language: string;
  createdAt: Date;
  chunks: string[];
  processingStatus: 'pending' | 'chunking' | 'processing' | 'completed' | 'error';
}

export interface ProcessingQueue {
  pending: ContentChunk[];
  processing: ContentChunk[];
  completed: ContentChunk[];
  failed: ContentChunk[];
  priority: Map<string, number>;
}

export class ContentManagementSystem {
  private documents: Map<string, DocumentMetadata> = new Map();
  private chunks: Map<string, ContentChunk> = new Map();
  private processingQueue: ProcessingQueue;
  private maxChunkSize: number = 2000; // words
  private minChunkSize: number = 200; // words
  private overlapSize: number = 100; // words for context

  constructor() {
    this.processingQueue = {
      pending: [],
      processing: [],
      completed: [],
      failed: [],
      priority: new Map()
    };
  }

  // Add new document for processing
  public async addDocument(
    content: string, 
    metadata: Partial<DocumentMetadata>
  ): Promise<string> {
    const documentId = this.generateDocumentId();
    
    const docMetadata: DocumentMetadata = {
      id: documentId,
      title: metadata.title || 'Untitled Document',
      type: metadata.type || 'text',
      size: content.length,
      wordCount: this.countWords(content),
      estimatedProcessingTime: this.estimateProcessingTime(content),
      complexity: this.calculateComplexity(content),
      domain: metadata.domain || 'general',
      language: metadata.language || 'en',
      createdAt: new Date(),
      chunks: [],
      processingStatus: 'pending'
    };

    this.documents.set(documentId, docMetadata);
    
    // Start chunking process
    await this.chunkDocument(documentId, content);
    
    return documentId;
  }

  private generateDocumentId(): string {
    return `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private countWords(text: string): number {
    return text.trim().split(/\s+/).length;
  }

  private estimateProcessingTime(content: string): number {
    const wordCount = this.countWords(content);
    const complexity = this.calculateComplexity(content);
    return Math.ceil(wordCount * complexity * 0.1); // seconds
  }

  private calculateComplexity(content: string): number {
    const sentences = content.split(/[.!?]+/).length;
    const words = this.countWords(content);
    const avgWordsPerSentence = words / sentences;
    const uniqueWords = new Set(content.toLowerCase().split(/\s+/)).size;
    const vocabularyRichness = uniqueWords / words;
    
    // Complexity factors
    const sentenceComplexity = Math.min(avgWordsPerSentence / 20, 1);
    const vocabularyComplexity = vocabularyRichness;
    const structuralComplexity = this.analyzeStructuralComplexity(content);
    
    return (sentenceComplexity + vocabularyComplexity + structuralComplexity) / 3;
  }

  private analyzeStructuralComplexity(content: string): number {
    // Check for complex structures
    const hasNestedStructures = /[\[\{\(][^\]\}\)]*[\[\{\(]/.test(content);
    const hasSpecializedTerms = /\b[A-Z]{2,}\b/.test(content);
    const hasLongSentences = content.split(/[.!?]+/).some(s => s.split(/\s+/).length > 30);
    
    let complexity = 0;
    if (hasNestedStructures) complexity += 0.3;
    if (hasSpecializedTerms) complexity += 0.2;
    if (hasLongSentences) complexity += 0.2;
    
    return Math.min(complexity, 1);
  }

  // Chunk document into manageable pieces
  private async chunkDocument(documentId: string, content: string): Promise<void> {
    const document = this.documents.get(documentId);
    if (!document) return;

    document.processingStatus = 'chunking';
    
    const chunks = await this.createChunks(content, documentId);
    document.chunks = chunks.map(chunk => chunk.id);
    
    // Add chunks to processing queue
    chunks.forEach(chunk => {
      this.chunks.set(chunk.id, chunk);
      this.processingQueue.pending.push(chunk);
      this.processingQueue.priority.set(chunk.id, this.calculateChunkPriority(chunk));
    });
    
    document.processingStatus = 'processing';
  }

  private async createChunks(content: string, documentId: string): Promise<ContentChunk[]> {
    const words = content.split(/\s+/);
    const chunks: ContentChunk[] = [];
    let position = 0;

    while (position < words.length) {
      const chunkStart = Math.max(0, position - this.overlapSize);
      const chunkEnd = Math.min(words.length, position + this.maxChunkSize + this.overlapSize);
      const chunkWords = words.slice(chunkStart, chunkEnd);
      
      const chunkContent = chunkWords.join(' ');
      const chunk: ContentChunk = {
        id: this.generateChunkId(),
        content: chunkContent,
        metadata: {
          position,
          totalChunks: Math.ceil(words.length / this.maxChunkSize),
          wordCount: chunkWords.length,
          contentType: this.detectContentType(chunkContent),
          complexity: this.calculateComplexity(chunkContent),
          keywords: this.extractKeywords(chunkContent),
          summary: this.generateSummary(chunkContent)
        },
        relationships: {
          parentDocument: documentId,
          relatedChunks: []
        },
        processing: {
          status: 'pending',
          processingHistory: []
        }
      };

      chunks.push(chunk);
      position += this.maxChunkSize;
    }

    // Establish relationships between chunks
    this.establishChunkRelationships(chunks);
    
    return chunks;
  }

  private generateChunkId(): string {
    return `chunk-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private detectContentType(content: string): 'text' | 'code' | 'data' | 'mixed' {
    const hasCodeBlocks = /```[\s\S]*```|`[^`]+`/.test(content);
    const hasDataStructures = /\{[\s\S]*\}|\[[\s\S]*\]/.test(content);
    const hasCodeKeywords = /\b(function|class|const|let|var|if|else|for|while)\b/.test(content);
    
    if (hasCodeBlocks || hasCodeKeywords) return 'code';
    if (hasDataStructures) return 'data';
    if (hasCodeBlocks && hasDataStructures) return 'mixed';
    return 'text';
  }

  private extractKeywords(content: string): string[] {
    const words = content.toLowerCase()
      .split(/\W+/)
      .filter(word => word.length > 3)
      .filter(word => !this.isStopWord(word));
    
    const wordFreq = new Map<string, number>();
    words.forEach(word => {
      wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
    });
    
    return Array.from(wordFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
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

  private generateSummary(content: string): string {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length <= 2) return content.substring(0, 100);
    
    // Simple extractive summarization
    const keywords = this.extractKeywords(content);
    const scoredSentences = sentences.map(sentence => {
      const sentenceKeywords = keywords.filter(keyword => 
        sentence.toLowerCase().includes(keyword)
      ).length;
      return { sentence, score: sentenceKeywords };
    });
    
    const topSentences = scoredSentences
      .sort((a, b) => b.score - a.score)
      .slice(0, 2)
      .map(item => item.sentence);
    
    return topSentences.join('. ').substring(0, 200);
  }

  private establishChunkRelationships(chunks: ContentChunk[]): void {
    chunks.forEach((chunk, index) => {
      if (index > 0) {
        chunk.relationships.previousChunk = chunks[index - 1].id;
        chunks[index - 1].relationships.nextChunk = chunk.id;
        
        // Add bidirectional relationship
        chunk.relationships.relatedChunks.push(chunks[index - 1].id);
        chunks[index - 1].relationships.relatedChunks.push(chunk.id);
      }
      
      // Add related chunks based on content similarity
      const relatedChunks = this.findRelatedChunks(chunk, chunks);
      chunk.relationships.relatedChunks.push(...relatedChunks);
    });
  }

  private findRelatedChunks(targetChunk: ContentChunk, allChunks: ContentChunk[]): string[] {
    const similarities = allChunks
      .filter(chunk => chunk.id !== targetChunk.id)
      .map(chunk => ({
        id: chunk.id,
        similarity: this.calculateContentSimilarity(targetChunk.content, chunk.content)
      }))
      .filter(item => item.similarity > 0.3)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 3);
    
    return similarities.map(item => item.id);
  }

  private calculateContentSimilarity(content1: string, content2: string): number {
    const keywords1 = new Set(this.extractKeywords(content1));
    const keywords2 = new Set(this.extractKeywords(content2));
    
    const intersection = new Set([...keywords1].filter(k => keywords2.has(k)));
    const union = new Set([...keywords1, ...keywords2]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  }

  private calculateChunkPriority(chunk: ContentChunk): number {
    let priority = 0.5; // base priority
    
    // Higher priority for complex content
    priority += chunk.metadata.complexity * 0.3;
    
    // Higher priority for content with more keywords
    priority += Math.min(chunk.metadata.keywords.length / 10, 0.2);
    
    // Higher priority for earlier chunks (context setting)
    priority += Math.max(0, (1 - chunk.metadata.position / 10) * 0.1);
    
    return Math.min(priority, 1.0);
  }

  // Get next chunk for processing
  public getNextChunk(agentId?: string): ContentChunk | null {
    if (this.processingQueue.pending.length === 0) return null;
    
    // Sort by priority
    this.processingQueue.pending.sort((a, b) => {
      const priorityA = this.processingQueue.priority.get(a.id) || 0;
      const priorityB = this.processingQueue.priority.get(b.id) || 0;
      return priorityB - priorityA;
    });
    
    const chunk = this.processingQueue.pending.shift();
    if (chunk) {
      chunk.processing.status = 'processing';
      chunk.processing.assignedAgent = agentId;
      this.processingQueue.processing.push(chunk);
    }
    
    return chunk || null;
  }

  // Mark chunk as completed
  public completeChunk(chunkId: string, result: any, agentId: string): void {
    const chunk = this.chunks.get(chunkId);
    if (!chunk) return;
    
    chunk.processing.status = 'completed';
    chunk.processing.processingHistory.push({
      agentId,
      timestamp: new Date(),
      action: 'processing',
      result
    });
    
    // Move from processing to completed
    const processingIndex = this.processingQueue.processing.findIndex(c => c.id === chunkId);
    if (processingIndex !== -1) {
      this.processingQueue.processing.splice(processingIndex, 1);
      this.processingQueue.completed.push(chunk);
    }
    
    // Check if document is fully processed
    this.checkDocumentCompletion(chunk.relationships.parentDocument);
  }

  // Mark chunk as failed
  public failChunk(chunkId: string, error: string, agentId: string): void {
    const chunk = this.chunks.get(chunkId);
    if (!chunk) return;
    
    chunk.processing.status = 'error';
    chunk.processing.processingHistory.push({
      agentId,
      timestamp: new Date(),
      action: 'error',
      result: { error }
    });
    
    // Move from processing to failed
    const processingIndex = this.processingQueue.processing.findIndex(c => c.id === chunkId);
    if (processingIndex !== -1) {
      this.processingQueue.processing.splice(processingIndex, 1);
      this.processingQueue.failed.push(chunk);
    }
  }

  private checkDocumentCompletion(documentId: string): void {
    const document = this.documents.get(documentId);
    if (!document) return;
    
    const totalChunks = document.chunks.length;
    const completedChunks = document.chunks.filter(chunkId => {
      const chunk = this.chunks.get(chunkId);
      return chunk?.processing.status === 'completed';
    }).length;
    
    if (completedChunks === totalChunks) {
      document.processingStatus = 'completed';
    } else if (completedChunks > 0) {
      document.processingStatus = 'processing';
    }
  }

  // Get document status
  public getDocumentStatus(documentId: string): any {
    const document = this.documents.get(documentId);
    if (!document) return null;
    
    const chunks = document.chunks.map(chunkId => this.chunks.get(chunkId));
    const completed = chunks.filter(chunk => chunk?.processing.status === 'completed').length;
    const processing = chunks.filter(chunk => chunk?.processing.status === 'processing').length;
    const failed = chunks.filter(chunk => chunk?.processing.status === 'error').length;
    
    return {
      document,
      progress: {
        total: document.chunks.length,
        completed,
        processing,
        failed,
        percentage: document.chunks.length > 0 ? (completed / document.chunks.length) * 100 : 0
      },
      queueStatus: {
        pending: this.processingQueue.pending.length,
        processing: this.processingQueue.processing.length,
        completed: this.processingQueue.completed.length,
        failed: this.processingQueue.failed.length
      }
    };
  }

  // Get related chunks for context
  public getRelatedChunks(chunkId: string, maxChunks: number = 3): ContentChunk[] {
    const chunk = this.chunks.get(chunkId);
    if (!chunk) return [];
    
    const relatedIds = chunk.relationships.relatedChunks.slice(0, maxChunks);
    return relatedIds.map(id => this.chunks.get(id)).filter(Boolean) as ContentChunk[];
  }

  // Reconstruct document from processed chunks
  public reconstructDocument(documentId: string): string {
    const document = this.documents.get(documentId);
    if (!document) return '';
    
    const chunks = document.chunks
      .map(chunkId => this.chunks.get(chunkId))
      .filter(Boolean) as ContentChunk[];
    
    // Sort by position and remove overlaps
    chunks.sort((a, b) => a.metadata.position - b.metadata.position);
    
    let reconstructed = '';
    chunks.forEach((chunk, index) => {
      if (index === 0) {
        reconstructed += chunk.content;
      } else {
        // Remove overlap with previous chunk
        const previousChunk = chunks[index - 1];
        const overlapWords = this.findOverlap(previousChunk.content, chunk.content);
        const contentWithoutOverlap = this.removeOverlap(chunk.content, overlapWords);
        reconstructed += ' ' + contentWithoutOverlap;
      }
    });
    
    return reconstructed.trim();
  }

  private findOverlap(content1: string, content2: string): string[] {
    const words1 = content1.split(/\s+/);
    const words2 = content2.split(/\s+/);
    
    let maxOverlap = 0;
    let overlapWords: string[] = [];
    
    // Check for overlapping sequences
    for (let i = Math.max(0, words1.length - this.overlapSize); i < words1.length; i++) {
      for (let j = 0; j < Math.min(this.overlapSize, words2.length); j++) {
        let matchLength = 0;
        while (i + matchLength < words1.length && 
               j + matchLength < words2.length && 
               words1[i + matchLength] === words2[j + matchLength]) {
          matchLength++;
        }
        
        if (matchLength > maxOverlap) {
          maxOverlap = matchLength;
          overlapWords = words2.slice(j, j + matchLength);
        }
      }
    }
    
    return overlapWords;
  }

  private removeOverlap(content: string, overlapWords: string[]): string {
    const words = content.split(/\s+/);
    const overlapIndex = this.findSequenceIndex(words, overlapWords);
    
    if (overlapIndex !== -1) {
      return words.slice(overlapIndex + overlapWords.length).join(' ');
    }
    
    return content;
  }

  private findSequenceIndex(words: string[], sequence: string[]): number {
    if (sequence.length === 0) return -1;
    
    for (let i = 0; i <= words.length - sequence.length; i++) {
      let match = true;
      for (let j = 0; j < sequence.length; j++) {
        if (words[i + j] !== sequence[j]) {
          match = false;
          break;
        }
      }
      if (match) return i;
    }
    
    return -1;
  }

  // Get processing statistics
  public getProcessingStatistics(): any {
    return {
      totalDocuments: this.documents.size,
      totalChunks: this.chunks.size,
      queueStatus: {
        pending: this.processingQueue.pending.length,
        processing: this.processingQueue.processing.length,
        completed: this.processingQueue.completed.length,
        failed: this.processingQueue.failed.length
      },
      averageProcessingTime: this.calculateAverageProcessingTime(),
      successRate: this.calculateSuccessRate()
    };
  }

  private calculateAverageProcessingTime(): number {
    const completedChunks = this.processingQueue.completed;
    if (completedChunks.length === 0) return 0;
    
    const totalTime = completedChunks.reduce((sum, chunk) => {
      if (chunk.processing.processingHistory.length > 0) {
        const firstAction = chunk.processing.processingHistory[0];
        const lastAction = chunk.processing.processingHistory[chunk.processing.processingHistory.length - 1];
        return sum + (lastAction.timestamp.getTime() - firstAction.timestamp.getTime());
      }
      return sum;
    }, 0);
    
    return totalTime / completedChunks.length / 1000; // seconds
  }

  private calculateSuccessRate(): number {
    const totalProcessed = this.processingQueue.completed.length + this.processingQueue.failed.length;
    if (totalProcessed === 0) return 1.0;
    
    return this.processingQueue.completed.length / totalProcessed;
  }
}
