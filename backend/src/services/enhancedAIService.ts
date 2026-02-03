import { prisma } from '@/index';
import axios from 'axios';

// Enhanced AI Service with Local LLM Integration
interface AIResponse {
  content: string;
  confidence: number;
  sources?: string[];
  metadata?: any;
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface LearningAnalytics {
  studentId: number;
  performanceTrend: 'improving' | 'declining' | 'stable';
  knowledgeGaps: string[];
  masteryLevel: Record<string, number>;
  recommendations: string[];
  nextSteps: string[];
}

interface SmartContent {
  type: 'explanation' | 'example' | 'exercise' | 'quiz';
  subject: string;
  topic: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  content: string;
  interactiveElements?: any[];
}

export class EnhancedAIService {
  private ollamaUrl: string;
  private model: string;
  private chatHistory: Map<number, ChatMessage[]> = new Map();

  constructor() {
    this.ollamaUrl = process.env?.OLLAMA_URL || 'http://localhost:11434';
    this.model = process.env?.OLLAMA_MODEL || 'llama2';
  }

  // Initialize Ollama connection
  async initializeOllama(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.ollamaUrl}/api/tags`);
      if (typeof window !== 'undefined') {
        window.console?.log('✅ Ollama connected successfully');
      } else {
        console.log('✅ Ollama connected successfully');
      }
      return true;
    } catch (error: any) {
      if (typeof window !== 'undefined') {
        window.console?.error('❌ Failed to connect to Ollama:', error);
      } else {
        console.error('❌ Failed to connect to Ollama:', error);
      }
      if (typeof window !== 'undefined') {
        window.console?.log('📋 Make sure Ollama is running: https://ollama.ai/');
      } else {
        console.log('📋 Make sure Ollama is running: https://ollama.ai/');
      }
      return false;
    }
  }

  // AI Chat Assistant for Students
  async chatWithAI(studentId: number, message: string): Promise<AIResponse> {
    try {
      // Get student context
      const student = await prisma.student.findUnique({
        where: { id: studentId },
        include: {
          user: true,
          class: true,
          grades: {
            include: { subject: true },
            orderBy: { createdAt: 'desc' },
            take: 10
          }
        }
      });

      if (!student) {
        throw new Error('Student not found');
      }

      // Build context-aware prompt
      const contextPrompt = this.buildContextPrompt(student, message);
      
      // Get chat history
      const history = this.chatHistory.get(studentId) || [];
      
      // Prepare messages for Ollama
      const messages = [
        {
          role: 'system' as const,
          content: `Bạn là một trợ lý AI thông minh cho hệ thống quản lý giáo dục EduManager. 
          Hãy hỗ trợ học sinh một cách thân thiện, chuyên nghiệp và cá nhân hóa dựa trên thông tin học tập của họ.
          Ngôn ngữ: Tiếng Việt.
          Phong cách: Thân thiện, khuyến khích, và mang tính giáo dục.`
        },
        ...history.slice(-5), // Keep last 5 messages for context
        {
          role: 'user' as const,
          content: contextPrompt
        }
      ];

      // Call Ollama API
      const response = await axios.post(`${this.ollamaUrl}/api/chat`, {
        model: this.model,
        messages,
        stream: false
      });

      const aiResponse = response.data.message.content;

      // Save to chat history
      const newHistory = [
        ...history,
        { role: 'user' as const, content: message, timestamp: new Date() },
        { role: 'assistant' as const, content: aiResponse, timestamp: new Date() }
      ];
      this.chatHistory.set(studentId, newHistory.slice(-10)); // Keep last 10 messages

      return {
        content: aiResponse,
        confidence: 0.85,
        metadata: {
          model: this.model,
          contextUsed: true
        }
      };

    } catch (error) {
      console.error('Error in AI chat:', error);
      throw new Error(`AI Chat failed: ${error}`);
    }
  }

  // Generate Smart Learning Content
  async generateSmartContent(
    subject: string, 
    topic: string, 
    difficulty: 'beginner' | 'intermediate' | 'advanced',
    contentType: 'explanation' | 'example' | 'exercise' | 'quiz'
  ): Promise<SmartContent> {
    try {
      const prompt = `Tạo nội dung ${contentType} cho môn ${subject}, chủ đề ${topic}, cấp độ ${difficulty}.
      
      Yêu cầu:
      - Ngôn ngữ: Tiếng Việt
      - Nội dung phải chính xác, dễ hiểu
      - Có ví dụ thực tế (nếu applicable)
      - Có câu hỏi tương tác (nếu là exercise/quiz)
      
      Trả lời theo format JSON với các trường: type, subject, topic, difficulty, content, interactiveElements`;

      const response = await axios.post(`${this.ollamaUrl}/api/generate`, {
        model: this.model,
        prompt,
        stream: false
      });

      const generatedContent = JSON.parse(response.data.response);

      return {
        type: contentType,
        subject,
        topic,
        difficulty,
        content: generatedContent.content,
        interactiveElements: generatedContent.interactiveElements || []
      };

    } catch (error) {
      console.error('Error generating smart content:', error);
      throw new Error(`Content generation failed: ${error}`);
    }
  }

  // AI-Powered Assignment Grading
  async gradeAssignment(
    assignmentText: string, 
    rubric: any, 
    studentAnswer: string
  ): Promise<any> {
    try {
      const prompt = `Hãy chấm bài tập sau dựa trên rubric đã cho.
      
      Đề bài: ${assignmentText}
      Rubric: ${JSON.stringify(rubric)}
      Bài làm của học sinh: ${studentAnswer}
      
      Hãy đánh giá và trả về format JSON:
      {
        "score": number,
        "maxScore": number,
        "feedback": string,
        "strengths": string[],
        "weaknesses": string[],
        "suggestions": string[],
        "detailedRubricScores": object
      }`;

      const response = await axios.post(`${this.ollamaUrl}/api/generate`, {
        model: this.model,
        prompt,
        stream: false
      });

      return JSON.parse(response.data.response);

    } catch (error) {
      console.error('Error grading assignment:', error);
      throw new Error(`AI grading failed: ${error}`);
    }
  }

  // Advanced Learning Analytics
  async generateLearningAnalytics(studentId: number): Promise<LearningAnalytics> {
    try {
      const student = await prisma.student.findUnique({
        where: { id: studentId },
        include: {
          grades: {
            include: { subject: true },
            orderBy: { createdAt: 'asc' }
          },
          attendance: {
            orderBy: { date: 'asc' }
          }
        }
      });

      if (!student) {
        throw new Error('Student not found');
      }

      // Analyze performance trend
      const performanceTrend = this.analyzePerformanceTrend(student.grades);
      
      // Identify knowledge gaps
      const knowledgeGaps = this.identifyKnowledgeGaps(student.grades);
      
      // Calculate mastery levels
      const masteryLevel = this.calculateMasteryLevels(student.grades);
      
      // Generate AI-powered recommendations
      const aiPrompt = `Dựa trên dữ liệu học tập sau, hãy đưa ra 5 khuyến nghị cá nhân hóa:
      
      Học sinh: ${student.user.fullName}
      Lớp: ${student.class.name}
      Điểm số gần đây: ${student.grades.slice(-5).map(g => `${g.subject.name}: ${g.score}`).join(', ')}
      Xu hướng hiệu suất: ${performanceTrend}
      
      Hãy đưa ra khuyến nghị cụ thể, có thể hành động được.`;

      const aiResponse = await axios.post(`${this.ollamaUrl}/api/generate`, {
        model: this.model,
        prompt: aiPrompt,
        stream: false
      });

      const recommendations = aiResponse.data.response.split('\n').filter((r: string) => r.trim());

      return {
        studentId,
        performanceTrend,
        knowledgeGaps,
        masteryLevel,
        recommendations,
        nextSteps: this.generateNextSteps(performanceTrend, knowledgeGaps)
      };

    } catch (error) {
      console.error('Error generating learning analytics:', error);
      throw new Error(`Analytics generation failed: ${error}`);
    }
  }

  // Smart Question Answering
  async answerQuestion(
    question: string, 
    context: string = '',
    subject: string = ''
  ): Promise<AIResponse> {
    try {
      const prompt = `Hãy trả lời câu hỏi sau một cách chính xác và dễ hiểu.
      
      Câu hỏi: ${question}
      Môn học: ${subject}
      Ngữ cảnh: ${context}
      
      Yêu cầu:
      - Trả lời bằng tiếng Việt
      - Chính xác và có tính giáo dục
      - Có ví dụ minh họa (nếu cần)
      - Nếu không chắc chắn, hãy nói rõ`;

      const response = await axios.post(`${this.ollamaUrl}/api/generate`, {
        model: this.model,
        prompt,
        stream: false
      });

      return {
        content: response.data.response,
        confidence: 0.8,
        sources: context ? [context] : []
      };

    } catch (error) {
      console.error('Error answering question:', error);
      throw new Error(`Q&A failed: ${error}`);
    }
  }

  // Personalized Study Plan Generator
  async generateStudyPlan(studentId: number, goals: string[], timeframe: number): Promise<any> {
    try {
      const analytics = await this.generateLearningAnalytics(studentId);
      
      const prompt = `Tạo kế hoạch học tập cá nhân hóa trong ${timeframe} ngày với mục tiêu: ${goals.join(', ')}.
      
      Phân tích học tập hiện tại:
      - Xu hướng: ${analytics.performanceTrend}
      - Lỗ hổng kiến thức: ${analytics.knowledgeGaps.join(', ')}
      - Mức độ thành thạo: ${JSON.stringify(analytics.masteryLevel)}
      
      Tạo kế hoạch chi tiết theo format JSON:
      {
        "dailyPlan": [
          {
            "day": number,
            "subjects": [
              {
                "subject": string,
                "topics": string[],
                "activities": string[],
                "estimatedTime": number,
                "resources": string[]
              }
            ]
          }
        ],
        "weeklyGoals": string[],
        "milestones": [
          {
            "week": number,
            "goal": string,
            "successCriteria": string[]
          }
        ],
        "studyTips": string[]
      }`;

      const response = await axios.post(`${this.ollamaUrl}/api/generate`, {
        model: this.model,
        prompt,
        stream: false
      });

      return JSON.parse(response.data.response);

    } catch (error) {
      console.error('Error generating study plan:', error);
      throw new Error(`Study plan generation failed: ${error}`);
    }
  }

  // Helper methods
  private buildContextPrompt(student: any, message: string): string {
    const recentGrades = student.grades.slice(-3).map(g => `${g.subject.name}: ${g.score}`).join(', ');
    
    return `Tôi là học sinh ${student.user.fullName}, lớp ${student.class.name}.
    Điểm số gần đây: ${recentGrades || 'Chưa có điểm số'}.
    
    Câu hỏi của tôi: ${message}`;
  }

  private analyzePerformanceTrend(grades: any[]): 'improving' | 'declining' | 'stable' {
    if (grades.length < 3) return 'stable';
    
    const recent = grades.slice(-3).map(g => g.score);
    const older = grades.slice(-6, -3).map(g => g.score);
    
    const recentAvg = recent.reduce((sum, score) => sum + score, 0) / recent.length;
    const olderAvg = older.reduce((sum, score) => sum + score, 0) / older.length;
    
    if (recentAvg > olderAvg + 0.5) return 'improving';
    if (recentAvg < olderAvg - 0.5) return 'declining';
    return 'stable';
  }

  private identifyKnowledgeGaps(grades: any[]): string[] {
    const subjectAverages: Record<string, number> = {};
    
    grades.forEach(grade => {
      if (!subjectAverages[grade.subject.name]) {
        subjectAverages[grade.subject.name] = [];
      }
      subjectAverages[grade.subject.name].push(grade.score);
    });
    
    const gaps: string[] = [];
    Object.entries(subjectAverages).forEach(([subject, scores]) => {
      const avg = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      if (avg < 6) {
        gaps.push(subject);
      }
    });
    
    return gaps;
  }

  private calculateMasteryLevels(grades: any[]): Record<string, number> {
    const mastery: Record<string, number> = {};
    
    grades.forEach(grade => {
      if (!mastery[grade.subject.name]) {
        mastery[grade.subject.name] = [];
      }
      mastery[grade.subject.name].push(grade.score);
    });
    
    Object.keys(mastery).forEach(subject => {
      const scores = mastery[subject];
      mastery[subject] = scores.reduce((sum, score) => sum + score, 0) / scores.length / 10;
    });
    
    return mastery;
  }

  private generateNextSteps(trend: string, gaps: string[]): string[] {
    const steps: string[] = [];
    
    if (trend === 'declining') {
      steps.push('Gặp giáo viên để tìm hiểu nguyên nhân giảm điểm');
      steps.push('Tăng thời gian ôn tập các môn yếu');
    }
    
    if (gaps.length > 0) {
      steps.push(`Tập trung cải thiện các môn: ${gaps.join(', ')}`);
    }
    
    steps.push('Thiết lập mục tiêu học tập hàng tuần');
    steps.push('Tìm bạn học để cùng nhau tiến bộ');
    
    return steps;
  }
}

export { EnhancedAIService };
