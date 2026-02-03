// Local AI Engine - Hoàn toàn độc lập, không cần API key
import { prisma } from '@/index';

interface AIResponse {
  content: string;
  confidence: number;
  reasoning: string[];
  metadata: any;
}

interface KnowledgeBase {
  subject: string;
  topic: string;
  concepts: Concept[];
  examples: Example[];
  exercises: Exercise[];
}

interface Concept {
  name: string;
  definition: string;
  difficulty: number; // 1-10
  prerequisites: string[];
  relatedConcepts: string[];
}

interface Example {
  title: string;
  description: string;
  solution: string;
  difficulty: number;
}

interface Exercise {
  question: string;
  type: 'multiple_choice' | 'short_answer' | 'essay';
  options?: string[];
  correctAnswer: string;
  explanation: string;
}

interface StudentProfile {
  id: number;
  strengths: string[];
  weaknesses: string[];
  learningStyle: 'visual' | 'auditory' | 'kinesthetic';
  preferredDifficulty: number;
  recentPerformance: number[];
  goals: string[];
}

export class LocalAIEngine {
  private knowledgeBase: Map<string, KnowledgeBase> = new Map();
  private studentProfiles: Map<number, StudentProfile> = new Map();
  private responseTemplates: Map<string, string[]> = new Map();

  constructor() {
    this.initializeKnowledgeBase();
    this.initializeResponseTemplates();
  }

  // Khởi tạo cơ sở kiến thức
  private initializeKnowledgeBase() {
    // Toán học
    this.knowledgeBase.set('toan', {
      subject: 'Toán',
      topic: 'Đại số',
      concepts: [
        {
          name: 'Phương trình bậc 2',
          definition: 'Phương trình có dạng ax² + bx + c = 0, với a ≠ 0',
          difficulty: 4,
          prerequisites: ['Phương trình bậc 1', 'Số học cơ bản'],
          relatedConcepts: ['Định lý Viet', 'Bất phương trình bậc 2']
        },
        {
          name: 'Định lý Viet',
          definition: 'Nếu x₁, x₂ là nghiệm của ax² + bx + c = 0 thì: x₁ + x₂ = -b/a, x₁x₂ = c/a',
          difficulty: 5,
          prerequisites: ['Phương trình bậc 2'],
          relatedConcepts: ['Tích và tổng nghiệm', 'Vi phân']
        },
        {
          name: 'Hàm số',
          definition: 'Quan hệ ánh xạ từ tập hợp này sang tập hợp khác',
          difficulty: 3,
          prerequisites: ['Tập hợp', 'Đồ thị'],
          relatedConcepts: ['Đạo hàm', 'Tích phân']
        }
      ],
      examples: [
        {
          title: 'Giải phương trình x² + 5x + 6 = 0',
          description: 'Sử dụng công thức nghiệm hoặc phân tích',
          solution: 'x² + 5x + 6 = (x+2)(x+3) = 0 => x = -2 hoặc x = -3',
          difficulty: 3
        },
        {
          title: 'Ứng dụng định lý Viet',
          description: 'Tìm tổng và tích nghiệm',
          solution: 'Với x² + 5x + 6 = 0, ta có: S = -5, P = 6',
          difficulty: 4
        }
      ],
      exercises: [
        {
          question: 'Giải phương trình: x² - 4x + 3 = 0',
          type: 'short_answer',
          correctAnswer: 'x = 1 hoặc x = 3',
          explanation: 'Phân tích: (x-1)(x-3) = 0'
        },
        {
          question: 'Định lý Viet nói gì?',
          type: 'multiple_choice',
          options: [
            'Tổng và tích nghiệm',
            'Đạo hàm',
            'Tích phân',
            'Giới hạn'
          ],
          correctAnswer: 'Tổng và tích nghiệm',
          explanation: 'Định lý Viet liên quan đến tổng và tích nghiệm phương trình bậc 2'
        }
      ]
    });

    // Vật Lý
    this.knowledgeBase.set('vatly', {
      subject: 'Vật Lý',
      topic: 'Cơ học',
      concepts: [
        {
          name: 'Định luật Newton 2',
          definition: 'F = ma (Lực bằng khối lượng nhân gia tốc)',
          difficulty: 4,
          prerequisites: ['Độ lớn lực', 'Gia tốc'],
          relatedConcepts: ['Động lượng', 'Công']
        },
        {
          name: 'Động lượng',
          definition: 'p = mv (Sản phẩm khối lượng và vận tốc)',
          difficulty: 3,
          prerequisites: ['Vận tốc', 'Khối lượng'],
          relatedConcepts ['Định luật bảo toàn động lượng']
        }
      ],
      examples: [
        {
          title: 'Tính lực cần thiết',
          description: 'Vật thể 10kg gia tốc 2m/s²',
          solution: 'F = ma = 10 × 2 = 20N',
          difficulty: 3
        }
      ],
      exercises: [
        {
          question: 'Xe 1000kg gia tốc từ 0 đến 20m/s trong 10s. Lực trung bình?',
          type: 'short_answer',
          correctAnswer: '2000N',
          explanation: 'a = Δv/Δt = 20/10 = 2m/s², F = ma = 1000 × 2 = 2000N'
        }
      ]
    });

    // Hóa Học
    this.knowledgeBase.set('hoahoc', {
      subject: 'Hóa Học',
      topic: 'Hợp chất',
      concepts: [
        {
          name: 'Phản ứng trùng hợp',
          definition: 'Nhiều phân tử nhỏ kết hợp tạo thành phân tử lớn',
          difficulty: 5,
          prerequisites: ['Liên kết hóa học', 'Phân tử'],
          relatedConcepts: ['Polyme', 'Nhựa']
        }
      ],
      examples: [
        {
          title: 'Tạo nhựa PVC',
          description: 'Trùng hợp vinyl clorua',
          solution: 'n CH₂=CHCl → [-CH₂-CHCl-]ₙ',
          difficulty: 5
        }
      ],
      exercises: [
        {
          question: 'Phản ứng trùng hợp là gì?',
          type: 'multiple_choice',
          options: [
            'Nhiều phân tử nhỏ → phân tử lớn',
            'Phân tử lớn → phân tử nhỏ',
            'Trao đổi ion',
            'Oxi hóa khử'
          ],
          correctAnswer: 'Nhiều phân tử nhỏ → phân tử lớn',
          explanation: 'Định nghĩa cơ bản của phản ứng trùng hợp'
        }
      ]
    });
  }

  // Khởi tạo template câu trả lời
  private initializeResponseTemplates() {
    this.responseTemplates.set('greeting', [
      'Xin chào! Tôi là trợ lý AI của EduManager. Tôi có thể giúp gì cho bạn?',
      'Chào bạn! Hôm nay bạn muốn học gì nào?',
      'Rất vui được hỗ trợ bạn! Đặt câu hỏi đi nhé!'
    ]);

    this.responseTemplates.set('encouragement', [
      'Tuyệt vời! Cố gắng lên nhé!',
      'Bạn làm tốt lắm! Tiếp tục phát huy!',
      'Rất ấn tượng! Giữ vững tinh thần này!'
    ]);

    this.responseTemplates.set('study_tips', [
      'Hãy chia nhỏ kiến thức để học dễ hơn.',
      'Luyện tập thường xuyên sẽ giúp bạn ghi nhớ tốt hơn.',
      'Đừng ngại hỏi khi không hiểu - đó là cách học tốt nhất!'
    ]);
  }

  // Phân tích câu hỏi của người dùng
  private analyzeQuestion(question: string): {
    intent: string;
    subject?: string;
    topic?: string;
    difficulty: number;
    keywords: string[];
  } {
    const lowerQuestion = question.toLowerCase();
    const keywords = this.extractKeywords(lowerQuestion);
    
    // Xác định môn học
    let subject: string | undefined;
    if (keywords.some(k => ['toán', 'phương trình', 'hàm số', 'đạo hàm'].includes(k))) {
      subject = 'toan';
    } else if (keywords.some(k => ['vật lý', 'lực', 'động lượng', 'newton'].includes(k))) {
      subject = 'vatly';
    } else if (keywords.some(k => ['hóa', 'phản ứng', 'hợp chất', 'trùng hợp'].includes(k))) {
      subject = 'hoahoc';
    }

    // Xác định intent
    let intent = 'general';
    if (keywords.some(k => ['giải', 'tính', 'bài tập'].includes(k))) {
      intent = 'solve_problem';
    } else if (keywords.some(k => ['giải thích', 'là gì', 'định nghĩa'].includes(k))) {
      intent = 'explain_concept';
    } else if (keywords.some(k => ['ví dụ', 'minh họa'].includes(k))) {
      intent = 'provide_example';
    } else if (keywords.some(k => ['làm thế nào', 'học', 'phương pháp'].includes(k))) {
      intent = 'study_advice';
    }

    // Ước tính độ khó
    const difficulty = this.estimateDifficulty(keywords);

    return { intent, subject, difficulty, keywords };
  }

  // Trích xuất keywords
  private extractKeywords(text: string): string[] {
    const vietnameseWords = text.split(/\s+/);
    const stopWords = ['là', 'của', 'và', 'cho', 'với', 'trong', 'để', 'tôi', 'bạn', 'mình'];
    
    return vietnameseWords
      .filter(word => word.length > 2 && !stopWords.includes(word))
      .slice(0, 10);
  }

  // Ước tính độ khó
  private estimateDifficulty(keywords: string[]): number {
    const advancedKeywords = ['đạo hàm', 'tích phân', 'vi phân', 'trùng hợp', 'phức tạp'];
    const basicKeywords = ['cơ bản', 'đơn giản', 'bắt đầu', 'nhập môn'];
    
    let difficulty = 5; // Mặc định
    
    if (keywords.some(k => advancedKeywords.some(ak => k.includes(ak)))) {
      difficulty = 8;
    } else if (keywords.some(k => basicKeywords.some(bk => k.includes(bk)))) {
      difficulty = 3;
    }
    
    return difficulty;
  }

  // Tạo câu trả lời thông minh
  async generateResponse(question: string, studentId?: number): Promise<AIResponse> {
    const analysis = this.analyzeQuestion(question);
    let content = '';
    let confidence = 0.8;
    const reasoning: string[] = [];

    // Lấy profile học sinh (nếu có)
    const studentProfile = studentId ? await this.getStudentProfile(studentId) : null;

    try {
      switch (analysis.intent) {
        case 'solve_problem':
          const solution = await this.solveProblem(question, analysis, studentProfile);
          content = solution.content;
          confidence = solution.confidence;
          reasoning.push('Phân tích bài tập', 'Áp dụng công thức', 'Kiểm tra kết quả');
          break;

        case 'explain_concept':
          const explanation = await this.explainConcept(question, analysis, studentProfile);
          content = explanation.content;
          confidence = explanation.confidence;
          reasoning.push('Xác định khái niệm', 'Diễn giải chi tiết', 'Ví dụ minh họa');
          break;

        case 'provide_example':
          const example = await this.provideExample(question, analysis, studentProfile);
          content = example.content;
          confidence = example.confidence;
          reasoning.push('Chọn ví dụ phù hợp', 'Giải thích từng bước', 'Kết quả');
          break;

        case 'study_advice':
          const advice = await this.provideStudyAdvice(question, analysis, studentProfile);
          content = advice.content;
          confidence = advice.confidence;
          reasoning.push('Phân tích nhu cầu', 'Đề xuất phương pháp', 'Lộ trình học tập');
          break;

        default:
          content = this.generateGeneralResponse(question, analysis, studentProfile);
          reasoning.push('Phân tích câu hỏi', 'Tìm thông tin liên quan', 'Tạo phản hồi');
      }

      // Cá nhân hóa câu trả lời
      if (studentProfile) {
        content = this.personalizeResponse(content, studentProfile);
      }

    } catch (error) {
      content = 'Xin lỗi, tôi đang gặp khó khăn trong việc xử lý câu hỏi này. Bạn có thể diễn đạt lại không?';
      confidence = 0.3;
      reasoning.push('Lỗi xử lý', 'Sử dụng câu trả lời mặc định');
    }

    return {
      content,
      confidence,
      reasoning,
      metadata: {
        analysis,
        studentProfile: studentProfile ? {
          strengths: studentProfile.strengths,
          weaknesses: studentProfile.weaknesses,
          learningStyle: studentProfile.learningStyle
        } : null
      }
    };
  }

  // Giải bài tập
  private async solveProblem(
    question: string, 
    analysis: any, 
    studentProfile?: StudentProfile | null
  ): Promise<{content: string, confidence: number}> {
    if (!analysis.subject) {
      return {
        content: 'Tôi cần biết môn học cụ thể để giải bài tập này. Bạn đang hỏi về môn nào?',
        confidence: 0.6
      };
    }

    const knowledge = this.knowledgeBase.get(analysis.subject);
    if (!knowledge) {
      return {
        content: 'Tôi chưa có đủ thông tin về môn học này. Hãy thử môn khác nhé!',
        confidence: 0.4
      };
    }

    // Tìm bài tập tương tự
    const similarExercise = knowledge.exercises.find(ex => 
      question.toLowerCase().includes(ex.question.toLowerCase().split(' ').slice(0, 3).join(' '))
    );

    if (similarExercise) {
      return {
        content: `**Bài giải:**\n\n${similarExercise.question}\n\n**Cách giải:**\n${similarExercise.explanation}\n\n**Đáp án:** ${similarExercise.correctAnswer}\n\n💡 **Mẹo:** ${this.generateStudyTip(analysis.subject)}`,
        confidence: 0.9
      };
    }

    // Tạo lời giải dựa trên kiến thức
    const solution = this.generateSolution(question, knowledge, analysis.difficulty);
    return {
      content: solution,
      confidence: 0.7
    };
  }

  // Giải thích khái niệm
  private async explainConcept(
    question: string, 
    analysis: any, 
    studentProfile?: StudentProfile | null
  ): Promise<{content: string, confidence: number}> {
    if (!analysis.subject) {
      return {
        content: 'Bạn muốn tôi giải thích khái niệm nào? Hãy cho biết môn học nhé.',
        confidence: 0.6
      };
    }

    const knowledge = this.knowledgeBase.get(analysis.subject);
    if (!knowledge) {
      return {
        content: 'Tôi chưa có thông tin về khái niệm này. Hãy thử tìm kiếm trong tài liệu khác.',
        confidence: 0.4
      };
    }

    // Tìm khái niệm liên quan
    const relevantConcept = knowledge.concepts.find(concept =>
      analysis.keywords.some(keyword => 
        concept.name.toLowerCase().includes(keyword) || 
        keyword.includes(concept.name.toLowerCase())
      )
    );

    if (relevantConcept) {
      const explanation = `**${relevantConcept.name}**\n\n**Định nghĩa:** ${relevantConcept.definition}\n\n**Độ khó:** ${relevantConcept.difficulty}/10\n\n**Kiến thức cần có:** ${relevantConcept.prerequisites.join(', ')}\n\n**Liên quan đến:** ${relevantConcept.relatedConcepts.join(', ')}\n\n${this.generateExampleForConcept(relevantConcept, knowledge)}`;
      
      return {
        content: explanation,
        confidence: 0.9
      };
    }

    return {
      content: 'Tôi không tìm thấy khái niệm chính xác. Bạn có thể cho thêm thông tin không?',
      confidence: 0.5
    };
  }

  // Cung cấp ví dụ
  private async provideExample(
    question: string, 
    analysis: any, 
    studentProfile?: StudentProfile | null
  ): Promise<{content: string, confidence: number}> {
    if (!analysis.subject) {
      return {
        content: 'Bạn muốn ví dụ về môn học nào?',
        confidence: 0.6
      };
    }

    const knowledge = this.knowledgeBase.get(analysis.subject);
    if (!knowledge || knowledge.examples.length === 0) {
      return {
        content: 'Tôi chưa có ví dụ cho chủ đề này. Hãy thử chủ đề khác nhé!',
        confidence: 0.4
      };
    }

    // Chọn ví dụ phù hợp với độ khó
    const suitableExample = knowledge.examples.find(ex => 
      Math.abs(ex.difficulty - analysis.difficulty) <= 2
    ) || knowledge.examples[0];

    const exampleContent = `**Ví dụ: ${suitableExample.title}**\n\n**Mô tả:** ${suitableExample.description}\n\n**Giải pháp:**\n\`\`\`\n${suitableExample.solution}\n\`\`\`\n\n**Độ khó:** ${suitableExample.difficulty}/10\n\n**💡 Mẹo:** ${this.generateStudyTip(analysis.subject)}`;

    return {
      content: exampleContent,
      confidence: 0.85
    };
  }

  // Đưa ra lời khuyên học tập
  private async provideStudyAdvice(
    question: string, 
    analysis: any, 
    studentProfile?: StudentProfile | null
  ): Promise<{content: string, confidence: number}> {
    let advice = '';

    if (studentProfile) {
      // Lời khuyên cá nhân hóa
      advice = `**Kế hoạch học tập cá nhân cho bạn:**\n\n`;
      
      if (studentProfile.weaknesses.length > 0) {
        advice += `🎯 **Cần cải thiện:** ${studentProfile.weaknesses.join(', ')}\n`;
        advice += `   • Dành 30 phút mỗi ngày cho các môn này\n`;
        advice += `   • Tìm bạn học hoặc gia sư nếu cần\n\n`;
      }

      if (studentProfile.strengths.length > 0) {
        advice += `⭐ **Điểm mạnh:** ${studentProfile.strengths.join(', ')}\n`;
        advice += `   • Tiếp tục phát huy phương pháp hiện tại\n`;
        advice += `   • Giúp đỡ bạn bè trong các môn này\n\n`;
      }

      // Lời khuyên theo learning style
      switch (studentProfile.learningStyle) {
        case 'visual':
          advice += `👁️ **Học bằng hình ảnh:**\n`;
          advice += `   • Vẽ sơ đồ tư duy\n`;
          advice += `   • Xem video bài giảng\n`;
          advice += `   • Sử dụng flashcards với hình ảnh\n\n`;
          break;
        case 'auditory':
          advice += `👂 **Học bằng âm thanh:**\n`;
          advice += `   • Nghe audio bài giảng\n`;
          advice += `   • Thảo luận nhóm\n`;
          advice += `   • Đọc to thành tiếng\n\n`;
          break;
        case 'kinesthetic':
          advice += `🤚 **Học bằng hành động:**\n`;
          advice += `   • Làm bài tập thực hành\n`;
          advice += `   • Sử dụng mô hình\n`;
          advice += `   • Học qua dự án\n\n`;
          break;
      }
    } else {
      // Lời khuyên chung
      advice = `**Phương pháp học tập hiệu quả:**\n\n`;
      advice += `📚 **Kế hoạch học tập:**\n`;
      advice += `   • Chia nhỏ kiến thức thành các phần dễ quản lý\n`;
      advice += `   • Lên thời gian biểu hàng tuần\n`;
      advice += `   • Đặt mục tiêu cụ thể, có thể đo lường\n\n`;
      
      advice += `🧠 **Kỹ thuật học tập:**\n`;
      advice += `   • Sử dụng kỹ thuật Pomodoro (25 phút học, 5 phút nghỉ)\n`;
      advice += `   • Ôn tập đều đặn thay vì học nhồi nhét\n`;
      advice += `   • Luyện tập với các bài tập đa dạng\n\n`;
      
      advice += `💪 **Duy trì động lực:**\n`;
      advice += `   • Tự thưởng khi đạt mục tiêu\n`;
      advice += `   • Học cùng bạn bè\n`;
      advice += `   • Giữ gìn sức khỏe và ngủ đủ giấc\n`;
    }

    return {
      content: advice,
      confidence: 0.8
    };
  }

  // Tạo phản hồi chung
  private generateGeneralResponse(
    question: string, 
    analysis: any, 
    studentProfile?: StudentProfile | null
  ): string {
    const greetings = this.responseTemplates.get('greeting') || [];
    const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
    
    let response = `${randomGreeting}\n\n`;
    
    if (analysis.keywords.length > 0) {
      response += `Tôi nhận thấy bạn đang quan tâm đến: ${analysis.keywords.join(', ')}.\n\n`;
    }
    
    response += `Tôi có thể giúp bạn:\n`;
    response += `📝 Giải bài tập các môn Toán, Lý, Hóa\n`;
    response += `📖 Giải thích các khái niệm khó hiểu\n`;
    response += `💡 Đưa ra ví dụ minh họa\n`;
    response += `🎯 Tạo kế hoạch học tập cá nhân\n\n`;
    response += `Bạn muốn bắt đầu với gì nào?`;
    
    return response;
  }

  // Cá nhân hóa phản hồi
  private personalizeResponse(content: string, profile: StudentProfile): string {
    let personalized = content;
    
    // Thêm lời khuyến khích dựa trên điểm yếu
    if (profile.weaknesses.length > 0 && Math.random() > 0.5) {
      const encouragements = this.responseTemplates.get('encouragement') || [];
      const randomEncouragement = encouragements[Math.floor(Math.random() * encouragements.length)];
      personalized += `\n\n💪 ${randomEncouragement}`;
    }
    
    return personalized;
  }

  // Tạo lời giải
  private generateSolution(question: string, knowledge: KnowledgeBase, difficulty: number): string {
    // Logic tạo lời giải đơn giản
    return `**Giải bài tập:**\n\n${question}\n\n**Các bước giải:**\n1. Đọc kỹ đề bài\n2. Xác định công thức liên quan\n3. Áp dụng công thức\n4. Tính toán kết quả\n5. Kiểm tra lại\n\n**Gợi ý:** ${this.generateStudyTip(knowledge.subject)}`;
  }

  // Tạo ví dụ cho khái niệm
  private generateExampleForConcept(concept: Concept, knowledge: KnowledgeBase): string {
    const relevantExample = knowledge.examples.find(ex => 
      ex.difficulty <= concept.difficulty + 1
    );
    
    if (relevantExample) {
      return `**Ví dụ liên quan:**\n${relevantExample.title}\n${relevantExample.solution}`;
    }
    
    return 'Hãy luyện tập với các bài tập từ dễ đến khó để nắm vững khái niệm này.';
  }

  // Tạo study tip
  private generateStudyTip(subject: string): string {
    const tips: Record<string, string[]> = {
      'toan': [
        'Luyện tập toán mỗi ngày để giữ tư duy nhạy bén',
        'Vẽ sơ đồ để hiểu rõ bài toán',
        'Kiểm tra lại kết quả bằng cách ngược'
      ],
      'vatly': [
        'Hiểu bản chất vật lý thay vì học thuộc lòng',
        'Vẽ diagram để phân tích bài tập',
        'Áp dụng công thức vào thực tế'
      ],
      'hoahoc': [
        'Học thuộc bảng tuần hoàn',
        'Làm các thí nghiệm đơn giản tại nhà',
        'Liên kết các phản ứng với nhau'
      ]
    };
    
    const subjectTips = tips[subject] || ['Học đều đặn mỗi ngày', 'Tìm hiểu sâu thay vì học rộng'];
    return subjectTips[Math.floor(Math.random() * subjectTips.length)];
  }

  // Lấy profile học sinh
  private async getStudentProfile(studentId: number): Promise<StudentProfile | null> {
    // Kiểm tra cache
    if (this.studentProfiles.has(studentId)) {
      return this.studentProfiles.get(studentId)!;
    }

    try {
      // Lấy dữ liệu từ database
      const student = await prisma.student.findUnique({
        where: { id: studentId },
        include: {
          grades: {
            include: { subject: true },
            orderBy: { createdAt: 'desc' },
            take: 20
          },
          user: true
        }
      });

      if (!student) {
        return null;
      }

      // Phân tích dữ liệu để tạo profile
      const profile = this.analyzeStudentData(student);
      
      // Cache profile
      this.studentProfiles.set(studentId, profile);
      
      return profile;
    } catch (error) {
      console.error('Error getting student profile:', error);
      return null;
    }
  }

  // Phân tích dữ liệu học sinh
  private analyzeStudentData(student: any): StudentProfile {
    const subjectPerformance: Record<string, number[]> = {};
    
    // Phân tích điểm số theo môn
    student.grades.forEach((grade: any) => {
      const subject = grade.subject.name;
      if (!subjectPerformance[subject]) {
        subjectPerformance[subject] = [];
      }
      subjectPerformance[subject].push(grade.score);
    });

    // Xác định điểm mạnh/yếu
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    
    Object.entries(subjectPerformance).forEach(([subject, scores]) => {
      const avg = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      if (avg >= 8) {
        strengths.push(subject);
      } else if (avg < 6) {
        weaknesses.push(subject);
      }
    });

    // Xác định learning style (đơn giản)
    const learningStyle = this.determineLearningStyle(student.grades);
    
    // Tính hiệu suất gần đây
    const recentPerformance = student.grades.slice(-10).map((g: any) => g.score);

    return {
      id: student.id,
      strengths,
      weaknesses,
      learningStyle,
      preferredDifficulty: 5,
      recentPerformance,
      goals: [] // Có thể lấy từ database hoặc để trống
    };
  }

  // Xác định learning style
  private determineLearningStyle(grades: any[]): 'visual' | 'auditory' | 'kinesthetic' {
    // Logic đơn giản - trong thực tế cần phức tạp hơn
    const random = Math.random();
    if (random < 0.33) return 'visual';
    if (random < 0.67) return 'auditory';
    return 'kinesthetic';
  }

  // Tạo nội dung học tập thông minh
  async generateSmartContent(
    subject: string,
    topic: string,
    difficulty: number,
    contentType: 'explanation' | 'example' | 'exercise'
  ): Promise<any> {
    const knowledge = this.knowledgeBase.get(subject.toLowerCase());
    
    if (!knowledge) {
      return {
        error: 'Không tìm thấy môn học',
        suggestions: ['Thử các môn: Toán, Vật Lý, Hóa Học']
      };
    }

    switch (contentType) {
      case 'explanation':
        return this.generateExplanation(knowledge, topic, difficulty);
      case 'example':
        return this.generateExample(knowledge, topic, difficulty);
      case 'exercise':
        return this.generateExercise(knowledge, topic, difficulty);
      default:
        return { error: 'Loại nội dung không hợp lệ' };
    }
  }

  private generateExplanation(knowledge: KnowledgeBase, topic: string, difficulty: number): any {
    const concept = knowledge.concepts.find(c => 
      c.name.toLowerCase().includes(topic.toLowerCase()) ||
      topic.toLowerCase().includes(c.name.toLowerCase())
    );

    if (concept) {
      return {
        type: 'explanation',
        subject: knowledge.subject,
        topic: concept.name,
        difficulty: concept.difficulty,
        content: `**${concept.name}**\n\n${concept.definition}\n\n**Độ khó:** ${concept.difficulty}/10\n\n**Kiến thức cần có:** ${concept.prerequisites.join(', ')}\n\n**Liên quan đến:** ${concept.relatedConcepts.join(', ')}`,
        interactiveElements: [
          {
            type: 'check_understanding',
            question: `Bạn đã hiểu ${concept.name} chưa?`,
            options: ['Rõ ràng', 'Cần giải thích thêm', 'Chưa hiểu']
          }
        ]
      };
    }

    return {
      type: 'explanation',
      subject: knowledge.subject,
      topic,
      difficulty,
      content: `Đang tìm kiếm nội dung về "${topic}" trong môn ${knowledge.subject}...`,
      interactiveElements: []
    };
  }

  private generateExample(knowledge: KnowledgeBase, topic: string, difficulty: number): any {
    const suitableExample = knowledge.examples.find(ex => 
      ex.difficulty <= difficulty + 1 &&
      (ex.title.toLowerCase().includes(topic.toLowerCase()) || 
       ex.description.toLowerCase().includes(topic.toLowerCase()))
    ) || knowledge.examples[0];

    return {
      type: 'example',
      subject: knowledge.subject,
      topic: suitableExample.title,
      difficulty: suitableExample.difficulty,
      content: `**Ví dụ: ${suitableExample.title}**\n\n${suitableExample.description}\n\n**Giải pháp:**\n\`\`\`\n${suitableExample.solution}\n\`\`\``,
      interactiveElements: [
        {
          type: 'practice',
          instruction: 'Thử làm một bài tập tương tự!'
        }
      ]
    };
  }

  private generateExercise(knowledge: KnowledgeBase, topic: string, difficulty: number): any {
    const suitableExercise = knowledge.exercises.find(ex => 
      Math.abs(ex.difficulty - difficulty) <= 1
    ) || knowledge.exercises[0];

    return {
      type: 'exercise',
      subject: knowledge.subject,
      topic,
      difficulty: suitableExercise.difficulty,
      content: suitableExercise.question,
      exerciseType: suitableExercise.type,
      options: suitableExercise.options,
      correctAnswer: suitableExercise.correctAnswer,
      explanation: suitableExercise.explanation,
      interactiveElements: [
        {
          type: 'answer_check',
          correctAnswer: suitableExercise.correctAnswer
        }
      ]
    };
  }

  // Phân tích hiệu suất học tập
  async analyzePerformance(studentId: number): Promise<any> {
    const profile = await this.getStudentProfile(studentId);
    
    if (!profile) {
      return { error: 'Không tìm thấy học sinh' };
    }

    const performance = profile.recentPerformance;
    if (performance.length === 0) {
      return {
        trend: 'no_data',
        average: 0,
        recommendations: ['Cần thêm dữ liệu để phân tích']
      };
    }

    // Tính xu hướng
    const recent = performance.slice(-5);
    const older = performance.slice(-10, -5);
    
    const recentAvg = recent.reduce((sum, score) => sum + score, 0) / recent.length;
    const olderAvg = older.length > 0 ? older.reduce((sum, score) => sum + score, 0) / older.length : recentAvg;
    
    let trend: 'improving' | 'declining' | 'stable';
    if (recentAvg > olderAvg + 0.5) {
      trend = 'improving';
    } else if (recentAvg < olderAvg - 0.5) {
      trend = 'declining';
    } else {
      trend = 'stable';
    }

    const overallAvg = performance.reduce((sum, score) => sum + score, 0) / performance.length;

    return {
      trend,
      average: overallAvg,
      recentAverage: recentAvg,
      strengths: profile.strengths,
      weaknesses: profile.weaknesses,
      learningStyle: profile.learningStyle,
      recommendations: this.generatePerformanceRecommendations(profile, trend)
    };
  }

  private generatePerformanceRecommendations(profile: StudentProfile, trend: string): string[] {
    const recommendations: string[] = [];

    if (trend === 'declining') {
      recommendations.push('Cần tìm hiểu nguyên nhân giảm điểm');
      recommendations.push('Tăng thời gian ôn tập');
      recommendations.push('Tìm sự giúp đỡ từ giáo viên hoặc bạn bè');
    } else if (trend === 'improving') {
      recommendations.push('Tiếp tục phát huy phương pháp hiện tại');
      recommendations.push('Giúp đỡ các bạn yếu hơn');
      recommendations.push('Thử thử thách khó hơn');
    }

    if (profile.weaknesses.length > 0) {
      recommendations.push(`Tập trung cải thiện: ${profile.weaknesses.join(', ')}`);
    }

    recommendations.push('Duy trì lịch học đều đặn');
    recommendations.push('Nghỉ ngơi đủ để giữ sức khỏe');

    return recommendations;
  }
}

export { LocalAIEngine };
