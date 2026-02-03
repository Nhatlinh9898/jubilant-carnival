// Document Analysis AI Agents - Đọc và phân tích tài liệu để nâng cao AI
import { prisma } from '@/index';
import fs from 'fs/promises';
import path from 'path';

interface DocumentContent {
  id: string;
  filename: string;
  subject: string;
  topic: string;
  contentType: 'textbook' | 'lecture' | 'exercise' | 'reference';
  content: string;
  metadata: any;
  extractedAt: Date;
}

interface KnowledgeNode {
  id: string;
  concept: string;
  definition: string;
  examples: string[];
  relatedConcepts: string[];
  difficulty: number;
  subject: string;
  sourceDocument: string;
  confidence: number;
}

interface LearningPath {
  subject: string;
  topic: string;
  prerequisites: string[];
  learningObjectives: string[];
  resources: string[];
  assessments: any[];
  estimatedTime: number;
}

interface QuestionBank {
  questions: {
    id: string;
    question: string;
    type: 'multiple_choice' | 'short_answer' | 'essay' | 'problem_solving';
    difficulty: number;
    subject: string;
    topic: string;
    options?: string[];
    correctAnswer: string;
    explanation: string;
    sourceDocument: string;
  }[];
}

export class DocumentAnalysisAI {
  private knowledgeGraph: Map<string, KnowledgeNode[]> = new Map();
  private documentDatabase: Map<string, DocumentContent> = new Map();
  private learningPaths: Map<string, LearningPath[]> = new Map();
  private questionBank: Map<string, QuestionBank> = new Map();

  constructor() {
    this.initializeKnowledgeGraph();
  }

  // Khởi tạo knowledge graph cơ bản
  private initializeKnowledgeGraph() {
    const subjects = ['toan', 'vatly', 'hoahoc', 'van', 'anh'];
    
    subjects.forEach(subject => {
      this.knowledgeGraph.set(subject, []);
      this.learningPaths.set(subject, []);
      this.questionBank.set(subject, { questions: [] });
    });
  }

  // Upload và phân tích tài liệu
  async uploadAndAnalyzeDocument(
    filePath: string,
    filename: string,
    subject: string,
    topic: string,
    contentType: string
  ): Promise<any> {
    try {
      // 1. Đọc nội dung tài liệu
      const content = await this.extractDocumentContent(filePath);
      
      // 2. Phân tích cấu trúc tài liệu
      const structure = await this.analyzeDocumentStructure(content, subject);
      
      // 3. Trích xuất kiến thức
      const knowledgeNodes = await this.extractKnowledgeNodes(content, subject, topic, filename);
      
      // 4. Xây dựng learning path
      const learningPath = await this.buildLearningPath(knowledgeNodes, subject, topic);
      
      // 5. Tạo question bank
      const questions = await this.generateQuestionsFromDocument(content, subject, topic, filename);
      
      // 6. Lưu vào database
      const documentId = await this.saveDocumentToDatabase({
        id: this.generateId(),
        filename,
        subject,
        topic,
        contentType: contentType as any,
        content,
        metadata: { structure, nodeCount: knowledgeNodes.length },
        extractedAt: new Date()
      });
      
      // 7. Cập nhật knowledge graph
      await this.updateKnowledgeGraph(subject, knowledgeNodes);
      
      // 8. Cập nhật learning paths
      await this.updateLearningPaths(subject, learningPath);
      
      // 9. Cập nhật question bank
      await this.updateQuestionBank(subject, questions);
      
      return {
        success: true,
        documentId,
        extractedNodes: knowledgeNodes.length,
        generatedQuestions: questions.questions.length,
        learningPathSegments: learningPath.length,
        analysis: {
          structure,
          knowledgeDensity: this.calculateKnowledgeDensity(content, knowledgeNodes),
          complexity: this.estimateDocumentComplexity(knowledgeNodes),
          prerequisites: this.identifyPrerequisites(knowledgeNodes)
        }
      };
      
    } catch (error) {
      throw new Error(`Document analysis failed: ${error}`);
    }
  }

  // Trích xuất nội dung từ tài liệu
  private async extractDocumentContent(filePath: string): Promise<string> {
    const fileExtension = path.extname(filePath).toLowerCase();
    
    try {
      switch (fileExtension) {
        case '.txt':
          return await fs.readFile(filePath, 'utf-8');
          
        case '.pdf':
          return await this.extractFromPDF(filePath);
          
        case '.docx':
          return await this.extractFromDocx(filePath);
          
        case '.html':
        case '.htm':
          return await this.extractFromHTML(filePath);
          
        default:
          throw new Error(`Unsupported file format: ${fileExtension}`);
      }
    } catch (error) {
      throw new Error(`Failed to extract content: ${error}`);
    }
  }

  // Trích xuất từ PDF (simplified)
  private async extractFromPDF(filePath: string): Promise<string> {
    // Trong thực tế, sẽ dùng thư viện như pdf-parse hoặc pdf2pic
    // Hiện tại mockup với text extraction cơ bản
    try {
      const buffer = await fs.readFile(filePath);
      // Mock PDF text extraction
      return `PDF Content extracted from ${filePath}\n\nChapter 1: Introduction\nThis is sample content from PDF document...\n\nChapter 2: Main Concepts\nDetailed explanations and examples...`;
    } catch (error) {
      throw new Error(`PDF extraction failed: ${error}`);
    }
  }

  // Trích xuất từ DOCX (simplified)
  private async extractFromDocx(filePath: string): Promise<string> {
    // Trong thực tế, sẽ dùng thư viện mammoth.js
    try {
      const buffer = await fs.readFile(filePath);
      // Mock DOCX text extraction
      return `DOCX Content extracted from ${filePath}\n\nTitle: Document Title\n\nIntroduction:\nThis is the introduction section...\n\nMain Content:\nDetailed document content...`;
    } catch (error) {
      throw new Error(`DOCX extraction failed: ${error}`);
    }
  }

  // Trích xuất từ HTML
  private async extractFromHTML(filePath: string): Promise<string> {
    try {
      const html = await fs.readFile(filePath, 'utf-8');
      // Simple HTML tag removal
      return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    } catch (error) {
      throw new Error(`HTML extraction failed: ${error}`);
    }
  }

  // Phân tích cấu trúc tài liệu
  private async analyzeDocumentStructure(content: string, subject: string): Promise<any> {
    const lines = content.split('\n');
    const structure = {
      chapters: [] as any[],
      sections: [] as any[],
      keyPoints: [] as string[],
      examples: [] as string[],
      exercises: [] as string[],
      difficulty: 'intermediate' as string,
      estimatedReadingTime: 0
    };

    let currentChapter = null;
    let currentSection = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Detect chapters
      if (this.isChapterHeader(line)) {
        currentChapter = {
          title: line.replace(/^(Chapter|Chương|Ch)\s*\d+[:\.\-]?\s*/, ''),
          startLine: i,
          sections: []
        };
        structure.chapters.push(currentChapter);
      }
      
      // Detect sections
      else if (this.isSectionHeader(line)) {
        currentSection = {
          title: line.replace(/^#{1,6}\s*/, ''),
          startLine: i,
          content: []
        };
        if (currentChapter) {
          currentChapter.sections.push(currentSection);
        } else {
          structure.sections.push(currentSection);
        }
      }
      
      // Detect examples
      else if (this.isExample(line)) {
        structure.examples.push(line);
      }
      
      // Detect exercises
      else if (this.isExercise(line)) {
        structure.exercises.push(line);
      }
      
      // Detect key points
      else if (this.isKeyPoint(line)) {
        structure.keyPoints.push(line);
      }
    }

    // Estimate reading time (200 words per minute)
    const wordCount = content.split(/\s+/).length;
    structure.estimatedReadingTime = Math.ceil(wordCount / 200);

    // Estimate difficulty based on content
    structure.difficulty = this.estimateContentDifficulty(content, subject);

    return structure;
  }

  // Kiểm tra chapter header
  private isChapterHeader(line: string): boolean {
    return /^(Chapter|Chương|Ch)\s*\d+[:\.\-]?\s*/i.test(line);
  }

  // Kiểm tra section header
  private isSectionHeader(line: string): boolean {
    return /^#{1,6}\s/.test(line) || /^\d+\.\s/.test(line);
  }

  // Kiểm tra example
  private isExample(line: string): boolean {
    return /(ví dụ|example|for instance|vd:|eg:)/i.test(line);
  }

  // Kiểm tra exercise
  private isExercise(line: string): boolean {
    return /(bài tập|exercise|practice|drill)/i.test(line);
  }

  // Kiểm tra key point
  private isKeyPoint(line: string): boolean {
    return /^(•|\*|\-|\→)/.test(line) || line.length < 100 && line.includes(':');
  }

  // Ước tính độ khó nội dung
  private estimateContentDifficulty(content: string, subject: string): string {
    const advancedKeywords = {
      'toan': ['đạo hàm', 'tích phân', 'giới hạn', 'ma trận', 'vector'],
      'vatly': ['điện từ', 'cơ lượng tử', 'thuyết tương đối', 'sóng điện từ'],
      'hoahoc': ['cơ học lượng tử', 'hóa hữu cơ', 'động học', 'cân bằng hóa học'],
      'van': ['biểu tượng', 'tượng trưng', 'siêu thực', 'hiện đại'],
      'anh': ['câu điều kiện', 'mệnh đề quan hệ', 'cấu trúc phức']
    };

    const basicKeywords = {
      'toan': ['cộng', 'trừ', 'nhân', 'chia', 'phương trình bậc 1'],
      'vatly': ['lực', 'khối lượng', 'vận tốc', 'gia tốc'],
      'hoahoc': ['nguyên tử', 'phản ứng', 'hợp chất', 'axit', 'bazo'],
      'van': ['chủ đề', 'cốt truyện', 'nhân vật', 'hoàn cảnh'],
      'anh': ['present simple', 'past simple', 'noun', 'verb']
    };

    const contentLower = content.toLowerCase();
    let advancedCount = 0;
    let basicCount = 0;

    if (advancedKeywords[subject as keyof typeof advancedKeywords]) {
      advancedCount = advancedKeywords[subject as keyof typeof advancedKeywords]
        .filter(keyword => contentLower.includes(keyword)).length;
    }

    if (basicKeywords[subject as keyof typeof basicKeywords]) {
      basicCount = basicKeywords[subject as keyof typeof basicKeywords]
        .filter(keyword => contentLower.includes(keyword)).length;
    }

    if (advancedCount > basicCount * 2) return 'advanced';
    if (basicCount > advancedCount * 2) return 'beginner';
    return 'intermediate';
  }

  // Trích xuất knowledge nodes
  private async extractKnowledgeNodes(
    content: string, 
    subject: string, 
    topic: string, 
    filename: string
  ): Promise<KnowledgeNode[]> {
    const nodes: KnowledgeNode[] = [];
    const paragraphs = content.split('\n\n');
    
    for (const paragraph of paragraphs) {
      const trimmed = paragraph.trim();
      if (trimmed.length < 20) continue;
      
      // Tìm định nghĩa
      const definition = this.extractDefinition(trimmed);
      if (definition) {
        const concept = this.extractConcept(definition);
        if (concept) {
          const examples = this.extractExamples(trimmed);
          const relatedConcepts = this.extractRelatedConcepts(trimmed);
          
          nodes.push({
            id: this.generateId(),
            concept,
            definition: definition.definition,
            examples,
            relatedConcepts,
            difficulty: this.estimateConceptDifficulty(trimmed),
            subject,
            sourceDocument: filename,
            confidence: this.calculateConfidence(trimmed)
          });
        }
      }
    }
    
    return nodes;
  }

  // Trích xuất định nghĩa
  private extractDefinition(text: string): { definition: string; concept: string } | null {
    const patterns = [
      /(.+?)\s*(là|is|được định nghĩa là|defined as)\s*[:\-]?\s*(.+)/i,
      /(.+?)\s*[:\-]\s*(.+)/,
      /định nghĩa[:\-]\s*(.+)/i
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        if (pattern.source.includes('định nghĩa')) {
          return { definition: match[1], concept: match[1] };
        } else {
          return { definition: match[2], concept: match[1] };
        }
      }
    }
    
    return null;
  }

  // Trích xuất concept
  private extractConcept(definition: { definition: string; concept: string }): string {
    return definition.concept.trim().replace(/^["']|["']$/g, '');
  }

  // Trích xuất examples
  private extractExamples(text: string): string[] {
    const examples: string[] = [];
    const lines = text.split('\n');
    
    for (const line of lines) {
      if (this.isExample(line)) {
        examples.push(line.trim());
      }
    }
    
    return examples;
  }

  // Trích xuất related concepts
  private extractRelatedConcepts(text: string): string[] {
    const concepts: string[] = [];
    const words = text.split(/\s+/);
    
    // Tìm các terms có vẻ là concept (viết hoa, có dấu chấm, etc.)
    for (const word of words) {
      if (word.length > 3 && /^[A-Z][a-z]+/.test(word)) {
        concepts.push(word);
      }
    }
    
    return concepts.slice(0, 5); // Giới hạn 5 concepts liên quan
  }

  // Ước tính độ khó concept
  private estimateConceptDifficulty(text: string): number {
    const complexityIndicators = [
      'phức tạp', 'nâng cao', 'đặc biệt', 'trừu tượng', 'lý thuyết',
      'complex', 'advanced', 'abstract', 'theoretical'
    ];
    
    const simplicityIndicators = [
      'đơn giản', 'cơ bản', 'dễ hiểu', 'thông thường', 'rõ ràng',
      'simple', 'basic', 'easy', 'common', 'clear'
    ];
    
    const textLower = text.toLowerCase();
    let complexityScore = 5; // Default
    
    complexityIndicators.forEach(indicator => {
      if (textLower.includes(indicator)) complexityScore += 2;
    });
    
    simplicityIndicators.forEach(indicator => {
      if (textLower.includes(indicator)) complexityScore -= 2;
    });
    
    return Math.max(1, Math.min(10, complexityScore));
  }

  // Tính confidence
  private calculateConfidence(text: string): number {
    let confidence = 0.5; // Base confidence
    
    // Tăng confidence nếu có định nghĩa rõ ràng
    if (text.includes('là') || text.includes('is')) confidence += 0.2;
    
    // Tăng confidence nếu có ví dụ
    if (this.isExample(text)) confidence += 0.1;
    
    // Tăng confidence nếu có cấu trúc tốt
    if (text.includes(':') || text.includes('-')) confidence += 0.1;
    
    // Giảm confidence nếu quá ngắn
    if (text.length < 50) confidence -= 0.2;
    
    return Math.max(0.1, Math.min(1.0, confidence));
  }

  // Xây dựng learning path
  private async buildLearningPath(
    knowledgeNodes: KnowledgeNode[], 
    subject: string, 
    topic: string
  ): Promise<LearningPath> {
    // Sắp xếp nodes theo độ khó
    const sortedNodes = knowledgeNodes.sort((a, b) => a.difficulty - b.difficulty);
    
    // Xác định prerequisites
    const prerequisites = this.identifyPrerequisites(knowledgeNodes);
    
    // Xây dựng learning objectives
    const learningObjectives = knowledgeNodes.map(node => 
      `Hiểu và áp dụng ${node.concept}`
    );
    
    // Tạo resources
    const resources = knowledgeNodes.map(node => node.sourceDocument);
    
    // Tạo assessments
    const assessments = this.generateAssessments(knowledgeNodes);
    
    // Ước tính thời gian học
    const estimatedTime = knowledgeNodes.length * 30; // 30 phút per concept
    
    return {
      subject,
      topic,
      prerequisites,
      learningObjectives,
      resources: [...new Set(resources)], // Remove duplicates
      assessments,
      estimatedTime
    };
  }

  // Xác định prerequisites
  private identifyPrerequisites(knowledgeNodes: KnowledgeNode[]): string[] {
    const prerequisites: string[] = [];
    
    knowledgeNodes.forEach(node => {
      prerequisites.push(...node.relatedConcepts);
    });
    
    return [...new Set(prerequisites)]; // Remove duplicates
  }

  // Tạo assessments
  private generateAssessments(knowledgeNodes: KnowledgeNode[]): any[] {
    return knowledgeNodes.map(node => ({
      concept: node.concept,
      type: 'understanding_check',
      questions: [
        `Định nghĩa ${node.concept}?`,
        `Cho ví dụ về ${node.concept}?`,
        `Áp dụng ${node.concept} vào bài tập thực tế?`
      ]
    }));
  }

  // Tạo questions từ document
  private async generateQuestionsFromDocument(
    content: string, 
    subject: string, 
    topic: string, 
    filename: string
  ): Promise<QuestionBank> {
    const questions: any[] = [];
    const sentences = content.split(/[.!?]+/);
    
    for (const sentence of sentences) {
      const trimmed = sentence.trim();
      if (trimmed.length < 10) continue;
      
      // Tạo multiple choice questions
      if (this.shouldCreateMultipleChoice(trimmed)) {
        questions.push(this.createMultipleChoiceQuestion(trimmed, subject, topic, filename));
      }
      
      // Tạo short answer questions
      if (this.shouldCreateShortAnswer(trimmed)) {
        questions.push(this.createShortAnswerQuestion(trimmed, subject, topic, filename));
      }
    }
    
    return { questions: questions.slice(0, 20) }; // Giới hạn 20 questions
  }

  // Kiểm tra nên tạo multiple choice
  private shouldCreateMultipleChoice(text: string): boolean {
    return text.includes('là') || text.includes('gồm') || text.includes('bao gồm');
  }

  // Kiểm tra nên tạo short answer
  private shouldCreateShortAnswer(text: string): boolean {
    return text.includes('tại sao') || text.includes('như thế nào') || text.includes('làm sao');
  }

  // Tạo multiple choice question
  private createMultipleChoiceQuestion(
    text: string, 
    subject: string, 
    topic: string, 
    filename: string
  ): any {
    const parts = text.split('là');
    const question = parts[0] + 'là gì?';
    const correctAnswer = parts[1]?.trim() || '';
    
    // Tạo distractors (simplified)
    const distractors = [
      'Không đúng',
      'Có thể đúng', 
      'Không xác định'
    ];
    
    const options = [correctAnswer, ...distractors.slice(0, 3)]
      .sort(() => Math.random() - 0.5);
    
    return {
      id: this.generateId(),
      question,
      type: 'multiple_choice',
      difficulty: 3,
      subject,
      topic,
      options,
      correctAnswer: options.indexOf(correctAnswer),
      explanation: `Dựa trên tài liệu ${filename}`,
      sourceDocument: filename
    };
  }

  // Tạo short answer question
  private createShortAnswerQuestion(
    text: string, 
    subject: string, 
    topic: string, 
    filename: string
  ): any {
    return {
      id: this.generateId(),
      question: text + '?',
      type: 'short_answer',
      difficulty: 4,
      subject,
      topic,
      correctAnswer: 'Câu trả lời dựa trên tài liệu',
      explanation: `Hãy tham khảo tài liệu ${filename} để có câu trả lời chi tiết`,
      sourceDocument: filename
    };
  }

  // Lưu document vào database
  private async saveDocumentToDatabase(document: DocumentContent): Promise<string> {
    this.documentDatabase.set(document.id, document);
    
    // Trong thực tế, lưu vào Prisma database
    try {
      // await prisma.document.create({
      //   data: {
      //     id: document.id,
      //     filename: document.filename,
      //     subject: document.subject,
      //     topic: document.topic,
      //     contentType: document.contentType,
      //     content: document.content,
      //     metadata: document.metadata,
      //     extractedAt: document.extractedAt
      //   }
      // });
    } catch (error) {
      console.error('Failed to save to database:', error);
    }
    
    return document.id;
  }

  // Cập nhật knowledge graph
  private async updateKnowledgeGraph(subject: string, nodes: KnowledgeNode[]): Promise<void> {
    const existingNodes = this.knowledgeGraph.get(subject) || [];
    this.knowledgeGraph.set(subject, [...existingNodes, ...nodes]);
  }

  // Cập nhật learning paths
  private async updateLearningPaths(subject: string, paths: LearningPath[]): Promise<void> {
    const existingPaths = this.learningPaths.get(subject) || [];
    this.learningPaths.set(subject, [...existingPaths, ...paths]);
  }

  // Cập nhật question bank
  private async updateQuestionBank(subject: string, questions: QuestionBank): Promise<void> {
    const existingBank = this.questionBank.get(subject) || { questions: [] };
    existingBank.questions.push(...questions.questions);
    this.questionBank.set(subject, existingBank);
  }

  // Tính knowledge density
  private calculateKnowledgeDensity(content: string, nodes: KnowledgeNode[]): number {
    const wordCount = content.split(/\s+/).length;
    return nodes.length / wordCount * 1000; // Nodes per 1000 words
  }

  // Ước tính document complexity
  private estimateDocumentComplexity(nodes: KnowledgeNode[]): string {
    const avgDifficulty = nodes.reduce((sum, node) => sum + node.difficulty, 0) / nodes.length;
    
    if (avgDifficulty >= 7) return 'high';
    if (avgDifficulty >= 4) return 'medium';
    return 'low';
  }

  // Generate ID
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Search knowledge graph
  async searchKnowledge(query: string, subject?: string): Promise<KnowledgeNode[]> {
    const results: KnowledgeNode[] = [];
    const queryLower = query.toLowerCase();
    
    const subjects = subject ? [subject] : Array.from(this.knowledgeGraph.keys());
    
    for (const subj of subjects) {
      const nodes = this.knowledgeGraph.get(subj) || [];
      
      for (const node of nodes) {
        if (
          node.concept.toLowerCase().includes(queryLower) ||
          node.definition.toLowerCase().includes(queryLower) ||
          node.examples.some(ex => ex.toLowerCase().includes(queryLower))
        ) {
          results.push(node);
        }
      }
    }
    
    return results.sort((a, b) => b.confidence - a.confidence);
  }

  // Get learning path for topic
  async getLearningPath(subject: string, topic: string): Promise<LearningPath | null> {
    const paths = this.learningPaths.get(subject) || [];
    
    return paths.find(path => 
      path.topic.toLowerCase().includes(topic.toLowerCase())
    ) || null;
  }

  // Get questions for assessment
  async getAssessmentQuestions(
    subject: string, 
    topic: string, 
    difficulty?: number,
    count: number = 10
  ): Promise<any[]> {
    const bank = this.questionBank.get(subject);
    if (!bank) return [];
    
    let questions = bank.questions.filter(q => 
      q.topic.toLowerCase().includes(topic.toLowerCase())
    );
    
    if (difficulty !== undefined) {
      questions = questions.filter(q => Math.abs(q.difficulty - difficulty) <= 1);
    }
    
    return questions
      .sort(() => Math.random() - 0.5)
      .slice(0, count);
  }

  // Generate personalized quiz
  async generatePersonalizedQuiz(
    studentId: number,
    subject: string,
    topics: string[],
    difficulty: number = 5
  ): Promise<any> {
    // Lấy profile học sinh
    const profile = await this.getStudentProfile(studentId);
    
    // Chọn questions phù hợp
    const allQuestions: any[] = [];
    
    for (const topic of topics) {
      const topicQuestions = await this.getAssessmentQuestions(subject, topic, difficulty);
      allQuestions.push(...topicQuestions);
    }
    
    // Cá nhân hóa dựa trên profile
    const personalizedQuestions = allQuestions.map(q => ({
      ...q,
      adapted: profile ? {
        learningStyle: profile.learningStyle,
        difficultyAdjustment: this.adjustDifficultyForStudent(q.difficulty, profile),
        context: this.generateContextForStudent(q, profile)
      } : null
    }));
    
    return {
      studentId,
      subject,
      topics,
      questions: personalizedQuestions.slice(0, 20),
      estimatedTime: personalizedQuestions.length * 3, // 3 phút per question
      adaptive: true
    };
  }

  // Lấy student profile (simplified)
  private async getStudentProfile(studentId: number): Promise<any> {
    try {
      const student = await prisma.student.findUnique({
        where: { id: studentId },
        include: {
          grades: {
            include: { subject: true },
            orderBy: { createdAt: 'desc' },
            take: 20
          }
        }
      });
      
      if (!student) return null;
      
      // Phân tích learning style (simplified)
      const learningStyle = this.determineLearningStyle(student.grades);
      
      return {
        id: student.id,
        learningStyle,
        recentPerformance: student.grades.slice(-10).map(g => g.score),
        strengths: this.identifyStrengths(student.grades),
        weaknesses: this.identifyWeaknesses(student.grades)
      };
    } catch (error) {
      return null;
    }
  }

  // Xác định learning style
  private determineLearningStyle(grades: any[]): 'visual' | 'auditory' | 'kinesthetic' {
    const styles: ('visual' | 'auditory' | 'kinesthetic')[] = ['visual', 'auditory', 'kinesthetic'];
    return styles[Math.floor(Math.random() * styles.length)];
  }

  // Xác định điểm mạnh
  private identifyStrengths(grades: any[]): string[] {
    const subjectPerformance: Record<string, number[]> = {};
    
    grades.forEach(grade => {
      const subject = grade.subject.name;
      if (!subjectPerformance[subject]) {
        subjectPerformance[subject] = [];
      }
      subjectPerformance[subject].push(grade.score);
    });
    
    const strengths: string[] = [];
    Object.entries(subjectPerformance).forEach(([subject, scores]) => {
      const avg = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      if (avg >= 8) strengths.push(subject);
    });
    
    return strengths;
  }

  // Xác định điểm yếu
  private identifyWeaknesses(grades: any[]): string[] {
    const subjectPerformance: Record<string, number[]> = {};
    
    grades.forEach(grade => {
      const subject = grade.subject.name;
      if (!subjectPerformance[subject]) {
        subjectPerformance[subject] = [];
      }
      subjectPerformance[subject].push(grade.score);
    });
    
    const weaknesses: string[] = [];
    Object.entries(subjectPerformance).forEach(([subject, scores]) => {
      const avg = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      if (avg < 6) weaknesses.push(subject);
    });
    
    return weaknesses;
  }

  // Điều chỉnh độ khó cho học sinh
  private adjustDifficultyForStudent(questionDifficulty: number, profile: any): number {
    if (!profile) return questionDifficulty;
    
    const avgPerformance = profile.recentPerformance.reduce((sum: number, score: number) => sum + score, 0) / profile.recentPerformance.length;
    
    if (avgPerformance >= 8) return Math.min(10, questionDifficulty + 1);
    if (avgPerformance < 6) return Math.max(1, questionDifficulty - 1);
    
    return questionDifficulty;
  }

  // Tạo context cho học sinh
  private generateContextForStudent(question: any, profile: any): string {
    if (!profile) return '';
    
    let context = `Điều chỉnh cho học sinh với learning style ${profile.learningStyle}.`;
    
    if (profile.strengths.length > 0) {
      context += ` Liên quan đến điểm mạnh: ${profile.strengths.join(', ')}.`;
    }
    
    if (profile.weaknesses.length > 0) {
      context += ` Cần chú ý các điểm yếu: ${profile.weaknesses.join(', ')}.`;
    }
    
    return context;
  }

  // Get document statistics
  async getDocumentStatistics(): Promise<any> {
    const stats = {
      totalDocuments: this.documentDatabase.size,
      totalKnowledgeNodes: 0,
      subjects: {} as Record<string, any>,
      questionBankSize: 0,
      learningPaths: 0
    };
    
    for (const [subject, nodes] of this.knowledgeGraph) {
      stats.totalKnowledgeNodes += nodes.length;
      stats.subjects[subject] = {
        knowledgeNodes: nodes.length,
        avgDifficulty: nodes.reduce((sum, node) => sum + node.difficulty, 0) / nodes.length,
        questions: this.questionBank.get(subject)?.questions.length || 0,
        learningPaths: this.learningPaths.get(subject)?.length || 0
      };
      stats.questionBankSize += stats.subjects[subject].questions;
      stats.learningPaths += stats.subjects[subject].learningPaths;
    }
    
    return stats;
  }
}

export { DocumentAnalysisAI };
