import { PipelineTask, PipelineAgent } from './hierarchicalPipelineSystem';

export interface FileReadingCapability {
  fileType: string;
  extensions: string[];
  maxSize: number; // in bytes
  readingMethods: string[];
  qualityMetrics: string[];
}

export interface ContentExtractionResult {
  fileId: string;
  originalPath: string;
  extractedContent: string;
  metadata: {
    fileSize: number;
    fileType: string;
    encoding: string;
    extractionMethod: string;
    extractionTime: number;
    quality: {
      completeness: number;
      accuracy: number;
      readability: number;
    };
    structure: {
      hasHeaders: boolean;
      hasTables: boolean;
      hasImages: boolean;
      hasEmbeddedContent: boolean;
    };
  };
  chunks: ContentChunk[];
  errors: string[];
}

export interface ContentChunk {
  id: string;
  sequence: number;
  content: string;
  size: number;
  type: 'text' | 'binary' | 'image' | 'structured' | 'mixed';
  metadata: {
    startPosition: number;
    endPosition: number;
    encoding: string;
    language?: string;
    confidence: number;
  };
}

export class ContentReadingAgents {
  private agents: Map<string, PipelineAgent> = new Map();
  private capabilities: Map<string, FileReadingCapability> = new Map();
  private readingStrategies: Map<string, ReadingStrategy> = new Map();
  private chunkSize: number = 1024 * 1024; // 1MB chunks
  private maxConcurrency: number = 100;

  constructor() {
    this.initializeCapabilities();
    this.initializeReadingStrategies();
    this.initializeAgents();
  }

  private initializeCapabilities(): void {
    const capabilities: FileReadingCapability[] = [
      {
        fileType: 'text',
        extensions: ['.txt', '.md', '.csv', '.json', '.xml', '.yaml', '.log'],
        maxSize: 100 * 1024 * 1024, // 100MB
        readingMethods: ['direct', 'streaming', 'chunked'],
        qualityMetrics: ['completeness', 'encoding_accuracy', 'readability']
      },
      {
        fileType: 'document',
        extensions: ['.pdf', '.docx', '.doc', '.rtf', '.odt'],
        maxSize: 50 * 1024 * 1024, // 50MB
        readingMethods: ['pdf_parser', 'office_parser', 'ocr_fallback'],
        qualityMetrics: ['text_extraction', 'format_preservation', 'structure_detection']
      },
      {
        fileType: 'image',
        extensions: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.svg'],
        maxSize: 20 * 1024 * 1024, // 20MB
        readingMethods: ['ocr', 'metadata_extraction', 'image_analysis'],
        qualityMetrics: ['ocr_accuracy', 'text_detection', 'image_quality']
      },
      {
        fileType: 'audio',
        extensions: ['.mp3', '.wav', '.flac', '.aac', '.ogg', '.m4a'],
        maxSize: 100 * 1024 * 1024, // 100MB
        readingMethods: ['speech_to_text', 'metadata_extraction', 'audio_analysis'],
        qualityMetrics: ['transcription_accuracy', 'audio_quality', 'speech_detection']
      },
      {
        fileType: 'video',
        extensions: ['.mp4', '.avi', '.mov', '.mkv', '.wmv', '.flv', '.webm'],
        maxSize: 1024 * 1024 * 1024, // 1GB
        readingMethods: ['frame_extraction', 'subtitle_extraction', 'speech_transcription'],
        qualityMetrics: ['video_quality', 'subtitle_accuracy', 'frame_analysis']
      },
      {
        fileType: 'archive',
        extensions: ['.zip', '.rar', '.7z', '.tar', '.gz', '.bz2'],
        maxSize: 1024 * 1024 * 1024, // 1GB
        readingMethods: ['archive_extraction', 'content_indexing', 'recursive_reading'],
        qualityMetrics: ['extraction_completeness', 'file_integrity', 'structure_preservation']
      },
      {
        fileType: 'database',
        extensions: ['.db', '.sqlite', '.mdb', '.accdb'],
        maxSize: 1024 * 1024 * 1024, // 1GB
        readingMethods: ['database_query', 'table_extraction', 'schema_analysis'],
        qualityMetrics: ['data_integrity', 'query_accuracy', 'schema_completeness']
      },
      {
        fileType: 'code',
        extensions: ['.js', '.ts', '.py', '.java', '.cpp', '.c', '.cs', '.php', '.rb', '.go', '.rs'],
        maxSize: 10 * 1024 * 1024, // 10MB
        readingMethods: ['syntax_parsing', 'comment_extraction', 'structure_analysis'],
        qualityMetrics: ['syntax_accuracy', 'comment_extraction', 'code_structure']
      }
    ];

    capabilities.forEach(cap => {
      cap.extensions.forEach(ext => {
        this.capabilities.set(ext, cap);
      });
    });
  }

  private initializeReadingStrategies(): void {
    this.readingStrategies.set('direct', new DirectReadingStrategy());
    this.readingStrategies.set('streaming', new StreamingReadingStrategy());
    this.readingStrategies.set('chunked', new ChunkedReadingStrategy());
    this.readingStrategies.set('pdf_parser', new PDFReadingStrategy());
    this.readingStrategies.set('office_parser', new OfficeReadingStrategy());
    this.readingStrategies.set('ocr_fallback', new OCRReadingStrategy());
    this.readingStrategies.set('ocr', new OCRReadingStrategy());
    this.readingStrategies.set('metadata_extraction', new MetadataExtractionStrategy());
    this.readingStrategies.set('speech_to_text', new SpeechToTextStrategy());
    this.readingStrategies.set('frame_extraction', new FrameExtractionStrategy());
    this.readingStrategies.set('archive_extraction', new ArchiveExtractionStrategy());
    this.readingStrategies.set('database_query', new DatabaseReadingStrategy());
    this.readingStrategies.set('syntax_parsing', new CodeReadingStrategy());
  }

  private initializeAgents(): void {
    const agentTypes = [
      { type: 'text_reader', specializations: ['text_files', 'encoding_detection', 'streaming'] },
      { type: 'document_reader', specializations: ['pdf_parsing', 'office_documents', 'ocr_processing'] },
      { type: 'media_reader', specializations: ['image_processing', 'audio_transcription', 'video_analysis'] },
      { type: 'archive_reader', specializations: ['archive_extraction', 'recursive_parsing', 'compression_handling'] },
      { type: 'database_reader', specializations: ['database_querying', 'schema_analysis', 'data_extraction'] },
      { type: 'code_reader', specializations: ['syntax_parsing', 'comment_extraction', 'structure_analysis'] },
      { type: 'binary_reader', specializations: ['binary_analysis', 'hex_parsing', 'structure_detection'] }
    ];

    agentTypes.forEach((agentType, index) => {
      const agent: PipelineAgent = {
        id: `content_reading_${agentType.type}_${index}`,
        name: `${agentType.type.replace('_', ' ').toUpperCase()} Agent ${index}`,
        tier: 'content_reading',
        specializations: agentType.specializations,
        vectorRepresentation: this.generateAgentVector(agentType.type),
        performance: {
          successRate: 0.95,
          averageProcessingTime: 2000,
          qualityScore: 0.9
        },
        status: 'idle',
        processedTasks: 0
      };

      this.agents.set(agent.id, agent);
    });
  }

  private generateAgentVector(agentType: string): number[] {
    const dimensions = 1024;
    const vector = new Array(dimensions).fill(0);
    const hash = this.hashString(agentType);
    
    for (let i = 0; i < dimensions; i++) {
      vector[i] = Math.sin((hash + i) * 0.01) * 0.5 + 0.5;
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

  // Main content reading method
  public async readContent(task: PipelineTask): Promise<ContentExtractionResult[]> {
    const files = task.data.files || [];
    const results: ContentExtractionResult[] = [];
    
    // Process files in parallel batches
    const batches = this.createFileBatches(files);
    
    for (const batch of batches) {
      const batchResults = await Promise.all(
        batch.map(file => this.processFile(file))
      );
      results.push(...batchResults);
    }
    
    return results;
  }

  private createFileBatches(files: any[]): any[][] {
    const batches: any[][] = [];
    const batchSize = Math.min(this.maxConcurrency, files.length);
    
    for (let i = 0; i < files.length; i += batchSize) {
      batches.push(files.slice(i, i + batchSize));
    }
    
    return batches;
  }

  private async processFile(file: any): Promise<ContentExtractionResult> {
    const startTime = Date.now();
    
    try {
      // Determine file type and capability
      const extension = this.getFileExtension(file.path);
      const capability = this.capabilities.get(extension);
      
      if (!capability) {
        throw new Error(`Unsupported file type: ${extension}`);
      }
      
      // Check file size
      if (file.size > capability.maxSize) {
        throw new Error(`File too large: ${file.size} bytes (max: ${capability.maxSize} bytes)`);
      }
      
      // Select best reading strategy
      const strategy = this.selectReadingStrategy(capability, file);
      
      // Execute reading strategy
      const extractedContent = await strategy.read(file);
      
      // Create chunks if content is large
      const chunks = this.createContentChunks(extractedContent.content, file.id);
      
      // Calculate quality metrics
      const quality = this.calculateQualityMetrics(extractedContent.content, capability);
      
      // Detect structure
      const structure = this.detectContentStructure(extractedContent.content);
      
      const extractionTime = Date.now() - startTime;
      
      return {
        fileId: file.id,
        originalPath: file.path,
        extractedContent: extractedContent.content,
        metadata: {
          fileSize: file.size,
          fileType: capability.fileType,
          encoding: extractedContent.encoding || 'utf-8',
          extractionMethod: strategy.name,
          extractionTime,
          quality,
          structure
        },
        chunks,
        errors: extractedContent.errors || []
      };
      
    } catch (error) {
      return {
        fileId: file.id,
        originalPath: file.path,
        extractedContent: '',
        metadata: {
          fileSize: file.size,
          fileType: 'unknown',
          encoding: 'unknown',
          extractionMethod: 'failed',
          extractionTime: Date.now() - startTime,
          quality: { completeness: 0, accuracy: 0, readability: 0 },
          structure: {
            hasHeaders: false,
            hasTables: false,
            hasImages: false,
            hasEmbeddedContent: false
          }
        },
        chunks: [],
        errors: [error.message]
      };
    }
  }

  private getFileExtension(path: string): string {
    const lastDot = path.lastIndexOf('.');
    return lastDot !== -1 ? path.substring(lastDot).toLowerCase() : '';
  }

  private selectReadingStrategy(capability: FileReadingCapability, file: any): ReadingStrategy {
    // Try strategies in order of preference
    for (const method of capability.readingMethods) {
      const strategy = this.readingStrategies.get(method);
      if (strategy && strategy.canHandle(file)) {
        return strategy;
      }
    }
    
    // Fallback to basic strategy
    return this.readingStrategies.get('direct')!;
  }

  private createContentChunks(content: string, fileId: string): ContentChunk[] {
    const chunks: ContentChunk[] = [];
    
    if (content.length <= this.chunkSize) {
      // Single chunk for small files
      chunks.push({
        id: `${fileId}_chunk_0`,
        sequence: 0,
        content,
        size: content.length,
        type: this.detectContentType(content),
        metadata: {
          startPosition: 0,
          endPosition: content.length,
          encoding: 'utf-8',
          confidence: 1.0
        }
      });
    } else {
      // Multiple chunks for large files
      const chunkCount = Math.ceil(content.length / this.chunkSize);
      
      for (let i = 0; i < chunkCount; i++) {
        const start = i * this.chunkSize;
        const end = Math.min(start + this.chunkSize, content.length);
        const chunkContent = content.substring(start, end);
        
        chunks.push({
          id: `${fileId}_chunk_${i}`,
          sequence: i,
          content: chunkContent,
          size: chunkContent.length,
          type: this.detectContentType(chunkContent),
          metadata: {
            startPosition: start,
            endPosition: end,
            encoding: 'utf-8',
            confidence: 0.9
          }
        });
      }
    }
    
    return chunks;
  }

  private detectContentType(content: string): 'text' | 'binary' | 'image' | 'structured' | 'mixed' {
    // Check for binary content
    if (this.isBinaryContent(content)) {
      return 'binary';
    }
    
    // Check for structured data
    if (this.isStructuredContent(content)) {
      return 'structured';
    }
    
    // Check for image data
    if (this.isImageData(content)) {
      return 'image';
    }
    
    // Check for mixed content
    if (this.isMixedContent(content)) {
      return 'mixed';
    }
    
    return 'text';
  }

  private isBinaryContent(content: string): boolean {
    // Simple heuristic for binary content detection
    const nullBytes = (content.match(/\0/g) || []).length;
    const totalBytes = content.length;
    return nullBytes / totalBytes > 0.1;
  }

  private isStructuredContent(content: string): boolean {
    const structuredPatterns = [
      /^\s*\{[\s\S]*\}\s*$/, // JSON
      /^\s*<[\s\S]*>\s*$/, // XML/HTML
      /^\s*[\w-]+:\s*[\s\S]*$/m, // YAML
      /^\s*[\w-]+,[\s\S]*$/m, // CSV
      /^\s*\|[\s\S]*\|\s*$/m // Markdown table
    ];
    
    return structuredPatterns.some(pattern => pattern.test(content));
  }

  private isImageData(content: string): boolean {
    const imageSignatures = [
      /^\x89PNG\r\n\x1a\n/, // PNG
      /^\xff\xd8\xff/, // JPEG
      /^GIF87a/, // GIF
      /^BM/, // BMP
      /^II*\x00/, // TIFF
      /^RIFF....WAVE/ // WAV (audio but similar binary structure)
    ];
    
    return imageSignatures.some(signature => signature.test(content));
  }

  private isMixedContent(content: string): boolean {
    const hasText = /[a-zA-Z]{3,}/.test(content);
    const hasBinary = this.isBinaryContent(content);
    const hasStructured = this.isStructuredContent(content);
    
    return (hasText && hasBinary) || (hasText && hasStructured);
  }

  private calculateQualityMetrics(content: string, capability: FileReadingCapability): {
    completeness: number;
    accuracy: number;
    readability: number;
  } {
    let completeness = 1.0;
    let accuracy = 1.0;
    let readability = 1.0;
    
    // Completeness based on content length and expected patterns
    if (content.length === 0) {
      completeness = 0;
    } else if (content.length < 100) {
      completeness = 0.5;
    }
    
    // Accuracy based on encoding and character patterns
    const nonPrintableChars = (content.match(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g) || []).length;
    accuracy = Math.max(0, 1 - (nonPrintableChars / content.length));
    
    // Readability based on text structure
    if (capability.fileType === 'text') {
      const words = content.split(/\s+/).length;
      const sentences = content.split(/[.!?]+/).length;
      const avgWordsPerSentence = words / sentences;
      
      readability = Math.max(0, Math.min(1, 1 - Math.abs(avgWordsPerSentence - 15) / 15));
    }
    
    return { completeness, accuracy, readability };
  }

  private detectContentStructure(content: string): {
    hasHeaders: boolean;
    hasTables: boolean;
    hasImages: boolean;
    hasEmbeddedContent: boolean;
  } {
    return {
      hasHeaders: /^#+\s/.test(content) || /^={1,6}\s/.test(content),
      hasTables: /^\|[\s\S]*\|$/m.test(content) || /^\s*\|.*\|\s*$/m.test(content),
      hasImages: /!\[.*\]\(.*\)/.test(content) || /<img[^>]*>/i.test(content),
      hasEmbeddedContent: /<iframe|<embed|<object/i.test(content) || /\[\[.*\]\]/.test(content)
    };
  }

  // Public methods for agent management
  public getAgents(): PipelineAgent[] {
    return Array.from(this.agents.values());
  }

  public getAgentById(agentId: string): PipelineAgent | undefined {
    return this.agents.get(agentId);
  }

  public getCapabilities(): Map<string, FileReadingCapability> {
    return this.capabilities;
  }

  public updateAgentPerformance(agentId: string, success: boolean, processingTime: number): void {
    const agent = this.agents.get(agentId);
    if (!agent) return;
    
    const weight = 0.1;
    
    agent.performance.successRate = agent.performance.successRate * (1 - weight) + (success ? 1 : 0) * weight;
    agent.performance.averageProcessingTime = agent.performance.averageProcessingTime * (1 - weight) + processingTime * weight;
    agent.performance.qualityScore = agent.performance.qualityScore * (1 - weight) + (success ? 0.9 : 0.3) * weight;
    agent.processedTasks++;
  }
}

// Reading strategy interfaces and implementations
abstract class ReadingStrategy {
  abstract name: string;
  abstract canHandle(file: any): boolean;
  abstract read(file: any): Promise<{ content: string; encoding?: string; errors?: string[] }>;
}

class DirectReadingStrategy extends ReadingStrategy {
  name = 'direct';
  
  canHandle(file: any): boolean {
    return file.size < 10 * 1024 * 1024; // 10MB
  }
  
  async read(file: any): Promise<{ content: string; encoding?: string; errors?: string[] }> {
    // Simulate direct file reading
    return {
      content: `Direct reading simulation for ${file.path}`,
      encoding: 'utf-8',
      errors: []
    };
  }
}

class StreamingReadingStrategy extends ReadingStrategy {
  name = 'streaming';
  
  canHandle(file: any): boolean {
    return file.size >= 10 * 1024 * 1024; // 10MB or larger
  }
  
  async read(file: any): Promise<{ content: string; encoding?: string; errors?: string[] }> {
    // Simulate streaming file reading
    return {
      content: `Streaming reading simulation for ${file.path} (${file.size} bytes)`,
      encoding: 'utf-8',
      errors: []
    };
  }
}

class ChunkedReadingStrategy extends ReadingStrategy {
  name = 'chunked';
  
  canHandle(file: any): boolean {
    return file.size >= 50 * 1024 * 1024; // 50MB or larger
  }
  
  async read(file: any): Promise<{ content: string; encoding?: string; errors?: string[] }> {
    // Simulate chunked file reading
    return {
      content: `Chunked reading simulation for ${file.path} (${file.size} bytes)`,
      encoding: 'utf-8',
      errors: []
    };
  }
}

class PDFReadingStrategy extends ReadingStrategy {
  name = 'pdf_parser';
  
  canHandle(file: any): boolean {
    return file.path.toLowerCase().endsWith('.pdf');
  }
  
  async read(file: any): Promise<{ content: string; encoding?: string; errors?: string[] }> {
    // Simulate PDF parsing
    return {
      content: `PDF parsing simulation for ${file.path}`,
      encoding: 'utf-8',
      errors: []
    };
  }
}

class OfficeReadingStrategy extends ReadingStrategy {
  name = 'office_parser';
  
  canHandle(file: any): boolean {
    const officeExtensions = ['.docx', '.doc', '.xlsx', '.xls', '.pptx', '.ppt'];
    return officeExtensions.some(ext => file.path.toLowerCase().endsWith(ext));
  }
  
  async read(file: any): Promise<{ content: string; encoding?: string; errors?: string[] }> {
    // Simulate Office document parsing
    return {
      content: `Office document parsing simulation for ${file.path}`,
      encoding: 'utf-8',
      errors: []
    };
  }
}

class OCRReadingStrategy extends ReadingStrategy {
  name = 'ocr';
  
  canHandle(file: any): boolean {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.tiff', '.bmp'];
    return imageExtensions.some(ext => file.path.toLowerCase().endsWith(ext));
  }
  
  async read(file: any): Promise<{ content: string; encoding?: string; errors?: string[] }> {
    // Simulate OCR processing
    return {
      content: `OCR processing simulation for ${file.path}`,
      encoding: 'utf-8',
      errors: []
    };
  }
}

class MetadataExtractionStrategy extends ReadingStrategy {
  name = 'metadata_extraction';
  
  canHandle(file: any): boolean {
    return true; // Can handle any file for metadata
  }
  
  async read(file: any): Promise<{ content: string; encoding?: string; errors?: string[] }> {
    // Simulate metadata extraction
    return {
      content: `Metadata extraction simulation for ${file.path}`,
      encoding: 'utf-8',
      errors: []
    };
  }
}

class SpeechToTextStrategy extends ReadingStrategy {
  name = 'speech_to_text';
  
  canHandle(file: any): boolean {
    const audioExtensions = ['.mp3', '.wav', '.flac', '.aac', '.m4a'];
    return audioExtensions.some(ext => file.path.toLowerCase().endsWith(ext));
  }
  
  async read(file: any): Promise<{ content: string; encoding?: string; errors?: string[] }> {
    // Simulate speech-to-text processing
    return {
      content: `Speech-to-text processing simulation for ${file.path}`,
      encoding: 'utf-8',
      errors: []
    };
  }
}

class FrameExtractionStrategy extends ReadingStrategy {
  name = 'frame_extraction';
  
  canHandle(file: any): boolean {
    const videoExtensions = ['.mp4', '.avi', '.mov', '.mkv', '.wmv'];
    return videoExtensions.some(ext => file.path.toLowerCase().endsWith(ext));
  }
  
  async read(file: any): Promise<{ content: string; encoding?: string; errors?: string[] }> {
    // Simulate frame extraction
    return {
      content: `Frame extraction simulation for ${file.path}`,
      encoding: 'utf-8',
      errors: []
    };
  }
}

class ArchiveExtractionStrategy extends ReadingStrategy {
  name = 'archive_extraction';
  
  canHandle(file: any): boolean {
    const archiveExtensions = ['.zip', '.rar', '.7z', '.tar', '.gz'];
    return archiveExtensions.some(ext => file.path.toLowerCase().endsWith(ext));
  }
  
  async read(file: any): Promise<{ content: string; encoding?: string; errors?: string[] }> {
    // Simulate archive extraction
    return {
      content: `Archive extraction simulation for ${file.path}`,
      encoding: 'utf-8',
      errors: []
    };
  }
}

class DatabaseReadingStrategy extends ReadingStrategy {
  name = 'database_query';
  
  canHandle(file: any): boolean {
    const dbExtensions = ['.db', '.sqlite', '.mdb'];
    return dbExtensions.some(ext => file.path.toLowerCase().endsWith(ext));
  }
  
  async read(file: any): Promise<{ content: string; encoding?: string; errors?: string[] }> {
    // Simulate database reading
    return {
      content: `Database reading simulation for ${file.path}`,
      encoding: 'utf-8',
      errors: []
    };
  }
}

class CodeReadingStrategy extends ReadingStrategy {
  name = 'syntax_parsing';
  
  canHandle(file: any): boolean {
    const codeExtensions = ['.js', '.ts', '.py', '.java', '.cpp', '.c', '.cs', '.php', '.rb'];
    return codeExtensions.some(ext => file.path.toLowerCase().endsWith(ext));
  }
  
  async read(file: any): Promise<{ content: string; encoding?: string; errors?: string[] }> {
    // Simulate code parsing
    return {
      content: `Code parsing simulation for ${file.path}`,
      encoding: 'utf-8',
      errors: []
    };
  }
}
