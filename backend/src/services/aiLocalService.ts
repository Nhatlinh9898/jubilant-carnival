import { prisma } from '@/index';

// Local AI Service for EduManager
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

export class AILocalService {
  private chatHistory: Map<number, ChatMessage[]> = new Map();

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

      // Build context-aware response
      const response = this.generateContextualResponse(student, message);

      // Save to chat history
      const history = this.chatHistory.get(studentId) || [];
      const newHistory = [
        ...history,
        { role: 'user' as const, content: message, timestamp: new Date() },
        { role: 'assistant' as const, content: response.content, timestamp: new Date() }
      ];
      this.chatHistory.set(studentId, newHistory.slice(-10));

      return response;

    } catch (error: any) {
      throw new Error(`AI Chat failed: ${error.message}`);
    }
  }

  // Generate Smart Learning Content
  async generateSmartContent(
    subject: string, 
    topic: string, 
    difficulty: 'beginner' | 'intermediate' | 'advanced',
    contentType: 'explanation' | 'example' | 'exercise' | 'quiz'
  ): Promise<any> {
    try {
      const content = this.generateContentForSubject(subject, topic, difficulty, contentType);
      
      return {
        type: contentType,
        subject,
        topic,
        difficulty,
        content,
        interactiveElements: this.generateInteractiveElements(contentType, topic)
      };

    } catch (error: any) {
      throw new Error(`Content generation failed: ${error.message}`);
    }
  }

  // AI-Powered Assignment Grading
  async gradeAssignment(
    assignmentText: string, 
    rubric: any, 
    studentAnswer: string
  ): Promise<any> {
    try {
      // Simulate AI grading with basic analysis
      const score = this.calculateBasicScore(assignmentText, studentAnswer);
      const feedback = this.generateFeedback(score, studentAnswer);

      return {
        score,
        maxScore: rubric.maxScore || 10,
        feedback,
        strengths: this.identifyStrengths(studentAnswer),
        weaknesses: this.identifyWeaknesses(studentAnswer),
        suggestions: this.generateSuggestions(score),
        detailedRubricScores: this.generateRubricScores(rubric, studentAnswer)
      };

    } catch (error: any) {
      throw new Error(`AI grading failed: ${error.message}`);
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
      
      // Generate recommendations
      const recommendations = this.generateRecommendations(performanceTrend, knowledgeGaps, masteryLevel);

      return {
        studentId,
        performanceTrend,
        knowledgeGaps,
        masteryLevel,
        recommendations,
        nextSteps: this.generateNextSteps(performanceTrend, knowledgeGaps)
      };

    } catch (error: any) {
      throw new Error(`Analytics generation failed: ${error.message}`);
    }
  }

  // Smart Question Answering
  async answerQuestion(
    question: string, 
    context: string = '',
    subject: string = ''
  ): Promise<AIResponse> {
    try {
      const answer = this.generateAnswerForQuestion(question, context, subject);

      return {
        content: answer,
        confidence: 0.8,
        sources: context ? [context] : []
      };

    } catch (error: any) {
      throw new Error(`Q&A failed: ${error.message}`);
    }
  }

  // Personalized Study Plan Generator
  async generateStudyPlan(studentId: number, goals: string[], timeframe: number): Promise<any> {
    try {
      const analytics = await this.generateLearningAnalytics(studentId);
      
      return this.createStudyPlan(analytics, goals, timeframe);

    } catch (error: any) {
      throw new Error(`Study plan generation failed: ${error.message}`);
    }
  }

  // Helper methods
  private generateContextualResponse(student: any, message: string): AIResponse {
    const recentGrades = student.grades.slice(-3).map((g: any) => `${g.subject.name}: ${g.score}`).join(', ');
    
    // Simple rule-based responses
    if (message.toLowerCase().includes('điểm') || message.toLowerCase().includes('kết quả')) {
      return {
        content: `Chào ${student.user.fullName}, điểm số gần đây của bạn là: ${recentGrades || 'Chưa có điểm số'}. ${this.generatePerformanceAdvice(student.grades)}`,
        confidence: 0.85,
        metadata: { type: 'performance_query' }
      };
    }

    if (message.toLowerCase().includes('học') || message.toLowerCase().includes('ôn bài')) {
      return {
        content: `Dựa trên kết quả học tập của bạn, tôi khuyên nên: ${this.generateStudyAdvice(student.grades)}`,
        confidence: 0.8,
        metadata: { type: 'study_advice' }
      };
    }

    return {
      content: `Chào ${student.user.fullName}, tôi là trợ lý AI của EduManager. Tôi có thể giúp bạn về điểm số, kế hoạch học tập, và các câu hỏi liên quan đến học tập. Bạn cần hỗ trợ gì ạ?`,
      confidence: 0.9,
      metadata: { type: 'general_greeting' }
    };
  }

  private generateContentForSubject(
    subject: string, 
    topic: string, 
    difficulty: string, 
    contentType: string
  ): string {
    const templates = {
      explanation: `Giải thích ${topic} trong môn ${subject} ở cấp độ ${difficulty}: [Nội dung giải thích chi tiết]`,
      example: `Ví dụ về ${topic} trong môn ${subject}: [Ví dụ thực tế]`,
      exercise: `Bài tập về ${topic} trong môn ${subject}: [Bài tập tương tác]`,
      quiz: `Câu hỏi trắc nghiệm về ${topic}: [Câu hỏi và đáp án]`
    };

    return templates[contentType as keyof typeof templates] || 'Nội dung đang được cập nhật';
  }

  private generateInteractiveElements(contentType: string, topic: string): any[] {
    if (contentType === 'quiz') {
      return [
        {
          type: 'multiple_choice',
          question: `Câu hỏi về ${topic}`,
          options: ['A', 'B', 'C', 'D'],
          correct: 0
        }
      ];
    }
    return [];
  }

  private calculateBasicScore(assignmentText: string, studentAnswer: string): number {
    // Simple scoring based on answer length and keywords
    const answerLength = studentAnswer.length;
    const keywordMatches = this.countKeywordMatches(assignmentText, studentAnswer);
    
    let score = Math.min(10, (answerLength / 100) * 2 + keywordMatches * 2);
    return Math.max(0, score);
  }

  private countKeywordMatches(assignmentText: string, studentAnswer: string): number {
    const keywords = this.extractKeywords(assignmentText);
    return keywords.filter(keyword => 
      studentAnswer.toLowerCase().includes(keyword.toLowerCase())
    ).length;
  }

  private extractKeywords(text: string): string[] {
    // Simple keyword extraction
    return text.split(' ').filter(word => word.length > 5).slice(0, 10);
  }

  private generateFeedback(score: number, answer: string): string {
    if (score >= 8) return 'Tuyệt vời! Bạn đã trả lời rất tốt.';
    if (score >= 6) return 'Khá tốt! Cần cải thiện thêm một vài điểm.';
    if (score >= 4) return 'Tạm được. Cần ôn tập kỹ hơn.';
    return 'Cần cố gắng nhiều hơn. Hãy xem lại tài liệu.';
  }

  private identifyStrengths(answer: string): string[] {
    const strengths = [];
    if (answer.length > 200) strengths.push('Trả lời chi tiết');
    if (answer.includes('ví dụ')) strengths.push('Có ví dụ minh họa');
    if (answer.includes('kết luận')) strengths.push('Có kết luận rõ ràng');
    return strengths;
  }

  private identifyWeaknesses(answer: string): string[] {
    const weaknesses = [];
    if (answer.length < 100) weaknesses.push('Trả lời quá ngắn');
    if (!answer.includes('ví dụ')) weaknesses.push('Thiếu ví dụ minh họa');
    if (!answer.includes('kết luận')) weaknesses.push('Thiếu kết luận');
    return weaknesses;
  }

  private generateSuggestions(score: number): string[] {
    if (score >= 8) return ['Tiếp tục phát huy!', 'Cố gắng giúp đỡ bạn bè'];
    if (score >= 6) return ['Cần thêm chi tiết', 'Thêm ví dụ thực tế'];
    if (score >= 4) return['Ôn tập lại kiến thức cơ bản', 'Luyện tập thêm'];
    return ['Cần xem lại bài giảng', 'Tìm kiếm sự giúp đỡ'];
  }

  private generateRubricScores(rubric: any, answer: string): any {
    const scores = {};
    if (rubric.criteria) {
      Object.keys(rubric.criteria).forEach(criteria => {
        scores[criteria] = Math.random() * 10; // Simulated score
      });
    }
    return scores;
  }

  private analyzePerformanceTrend(grades: any[]): 'improving' | 'declining' | 'stable' {
    if (grades.length < 3) return 'stable';
    
    const recent = grades.slice(-3).map((g: any) => g.score);
    const older = grades.slice(-6, -3).map((g: any) => g.score);
    
    const recentAvg = recent.reduce((sum: number, score: number) => sum + score, 0) / recent.length;
    const olderAvg = older.reduce((sum: number, score: number) => sum + score, 0) / older.length;
    
    if (recentAvg > olderAvg + 0.5) return 'improving';
    if (recentAvg < olderAvg - 0.5) return 'declining';
    return 'stable';
  }

  private identifyKnowledgeGaps(grades: any[]): string[] {
    const subjectAverages: Record<string, number[]> = {};
    
    grades.forEach((grade: any) => {
      if (!subjectAverages[grade.subject.name]) {
        subjectAverages[grade.subject.name] = [];
      }
      subjectAverages[grade.subject.name].push(grade.score);
    });
    
    const gaps: string[] = [];
    Object.entries(subjectAverages).forEach(([subject, scores]) => {
      const avg = scores.reduce((sum: number, score: number) => sum + score, 0) / scores.length;
      if (avg < 6) {
        gaps.push(subject);
      }
    });
    
    return gaps;
  }

  private calculateMasteryLevels(grades: any[]): Record<string, number> {
    const mastery: Record<string, number[]> = {};
    
    grades.forEach((grade: any) => {
      if (!mastery[grade.subject.name]) {
        mastery[grade.subject.name] = [];
      }
      mastery[grade.subject.name].push(grade.score);
    });
    
    const result: Record<string, number> = {};
    Object.keys(mastery).forEach(subject => {
      const scores = mastery[subject];
      result[subject] = scores.reduce((sum: number, score: number) => sum + score, 0) / scores.length / 10;
    });
    
    return result;
  }

  private generateRecommendations(
    trend: string, 
    gaps: string[], 
    mastery: Record<string, number>
  ): string[] {
    const recommendations = [];
    
    if (trend === 'declining') {
      recommendations.push('Gặp giáo viên để tìm hiểu nguyên nhân giảm điểm');
      recommendations.push('Tăng thời gian ôn tập các môn yếu');
    }
    
    if (gaps.length > 0) {
      recommendations.push(`Tập trung cải thiện các môn: ${gaps.join(', ')}`);
    }
    
    const weakSubjects = Object.entries(mastery)
      .filter(([_, level]) => level < 0.6)
      .map(([subject]) => subject);
    
    if (weakSubjects.length > 0) {
      recommendations.push(`Cần cải thiện: ${weakSubjects.join(', ')}`);
    }
    
    recommendations.push('Thiết lập mục tiêu học tập hàng tuần');
    recommendations.push('Tìm bạn học để cùng nhau tiến bộ');
    
    return recommendations;
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

  private generateAnswerForQuestion(question: string, context: string, subject: string): string {
    // Simple rule-based Q&A
    if (question.toLowerCase().includes('học') && question.toLowerCase().includes('như thế nào')) {
      return 'Để học hiệu quả, bạn nên: 1) Lên kế hoạch học tập rõ ràng, 2) Ôn tập đều đặn, 3) Thực hành nhiều, 4) Tìm kiếm sự giúp đỡ khi cần.';
    }
    
    if (question.toLowerCase().includes('điểm') && question.toLowerCase().includes('cao')) {
      return 'Để đạt điểm cao, bạn cần: 1) Chú ý nghe giảng trên lớp, 2) Hoàn thành bài tập đầy đủ, 3) Ôn tập thường xuyên, 4) Tìm hiểu sâu về các chủ đề.';
    }
    
    return 'Đây là câu hỏi thú vị! Tôi khuyên bạn nên tìm hiểu thêm từ giáo viên và tài liệu liên quan để có câu trả lời chi tiết nhất.';
  }

  private generatePerformanceAdvice(grades: any[]): string {
    if (grades.length === 0) return 'Hãy cố gắng hoàn thành bài tập để có kết quả đánh giá.';
    
    const avgScore = grades.reduce((sum: number, g: any) => sum + g.score, 0) / grades.length;
    
    if (avgScore >= 8) return 'Bạn đang học rất tốt! Hãy duy trì phong độ này.';
    if (avgScore >= 6) return 'Kết quả khá tốt. Cần cố gắng thêm để đạt điểm cao hơn.';
    if (avgScore >= 4) return 'Cần nỗ lực hơn. Hãy tìm cách cải thiện phương pháp học.';
    return 'Cần tập trung nhiều hơn vào học tập. Đừng ngần ngại tìm kiếm sự giúp đỡ.';
  }

  private generateStudyAdvice(grades: any[]): string {
    return 'Nên: 1) Lên thời gian biểu học tập, 2) Chia nhỏ kiến thức để học dễ hơn, 3) Tập trung vào các môn yếu, 4) Nghỉ ngơi hợp lý để giữ sức khỏe.';
  }

  private createStudyPlan(analytics: LearningAnalytics, goals: string[], timeframe: number): any {
    const dailyPlan = [];
    const weeklyGoals = [];
    const milestones = [];
    const studyTips = [];

    // Generate daily plan
    for (let day = 1; day <= Math.min(timeframe, 7); day++) {
      dailyPlan.push({
        day,
        subjects: [
          {
            subject: analytics.knowledgeGaps[0] || 'Toán',
            topics: ['Ôn tập cơ bản'],
            activities: ['Đọc tài liệu', 'Làm bài tập'],
            estimatedTime: 120,
            resources: ['Sách giáo khoa', 'Online']
          }
        ]
      });
    }

    // Generate weekly goals
    weeklyGoals.push('Hoàn thành bài tập hàng tuần');
    weeklyGoals.push('Ôn tập kiến thức đã học');
    weeklyGoals.push('Chuẩn bị cho bài kiểm tra');

    // Generate milestones
    milestones.push({
      week: 1,
      goal: 'Nắm vững kiến thức cơ bản',
      successCriteria: ['Hoàn thành 80% bài tập', 'Điểm trên trung bình']
    });

    // Generate study tips
    studyTips.push('Học tập đều đặn mỗi ngày');
    studyTips.push('Nghỉ ngơi đủ 8 tiếng mỗi ngày');
    studyTips.push('Tập thể dục thường xuyên');

    return {
      dailyPlan,
      weeklyGoals,
      milestones,
      studyTips
    };
  }
}

export { AILocalService };
