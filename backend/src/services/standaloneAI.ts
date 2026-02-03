// Standalone AI Engine - Không cần API key, hoàn toàn local
import { prisma } from '@/index';

interface AIResponse {
  content: string;
  confidence: number;
  reasoning: string[];
  metadata?: any;
}

interface StudentProfile {
  id: number;
  strengths: string[];
  weaknesses: string[];
  learningStyle: 'visual' | 'auditory' | 'kinesthetic';
  recentScores: number[];
}

export class StandaloneAI {
  private knowledgeBase: Map<string, any> = new Map();
  private responseTemplates: Map<string, string[]> = new Map();

  constructor() {
    this.initializeKnowledgeBase();
    this.initializeTemplates();
  }

  private initializeKnowledgeBase() {
    // Toán học
    this.knowledgeBase.set('toan', {
      concepts: {
        'phương trình bậc 2': {
          definition: 'Phương trình có dạng ax² + bx + c = 0, với a ≠ 0',
          formula: 'x = (-b ± √(b²-4ac)) / 2a',
          example: 'x² + 5x + 6 = 0 có nghiệm x = -2, x = -3',
          difficulty: 4
        },
        'định lý viet': {
          definition: 'Nếu x₁, x₂ là nghiệm của ax² + bx + c = 0 thì x₁ + x₂ = -b/a, x₁x₂ = c/a',
          example: 'Với x² + 5x + 6 = 0, ta có S = -5, P = 6',
          difficulty: 5
        },
        'hàm số': {
          definition: 'Quan hệ ánh xạ từ tập hợp này sang tập hợp khác',
          example: 'f(x) = x² + 2x + 1 là một hàm số',
          difficulty: 3
        }
      },
      problems: [
        {
          question: 'Giải phương trình x² - 4x + 3 = 0',
          solution: 'Phân tích: (x-1)(x-3) = 0 ⇒ x = 1 hoặc x = 3',
          difficulty: 3
        }
      ],
      tips: [
        'Luôn kiểm tra lại kết quả bằng cách thay ngược vào phương trình',
        'Vẽ đồ thị để hình dung nghiệm',
        'Luyện tập nhiều bài tập từ cơ bản đến nâng cao'
      ]
    });

    // Vật Lý
    this.knowledgeBase.set('vatly', {
      concepts: {
        'định luật newton 2': {
          definition: 'F = ma (Lực bằng khối lượng nhân gia tốc)',
          example: 'Vật 10kg gia tốc 2m/s² cần lực F = 10×2 = 20N',
          difficulty: 4
        },
        'động lượng': {
          definition: 'p = mv (Sản phẩm khối lượng và vận tốc)',
          example: 'Xe 1000kg chạy 20m/s có động lượng p = 1000×20 = 20000 kg·m/s',
          difficulty: 3
        }
      },
      problems: [
        {
          question: 'Xe 1000kg gia tốc từ 0 đến 20m/s trong 10s. Lực trung bình?',
          solution: 'a = Δv/Δt = 20/10 = 2m/s², F = ma = 1000×2 = 2000N',
          difficulty: 4
        }
      ],
      tips: [
        'Vẽ diagram lực để phân tích bài tập',
        'Chú ý đơn vị SI (m, kg, s)',
        'Kiểm tra chiều của vector lực'
      ]
    });

    // Hóa Học
    this.knowledgeBase.set('hoahoc', {
      concepts: {
        'phản ứng trùng hợp': {
          definition: 'Nhiều phân tử nhỏ kết hợp tạo thành phân tử lớn',
          example: 'n CH₂=CHCl → [-CH₂-CHCl-]ₙ (tạo PVC)',
          difficulty: 5
        },
        'trung hòa': {
          definition: 'Axid + Bazơ → Muối + Nước',
          example: 'HCl + NaOH → NaCl + H₂O',
          difficulty: 3
        }
      },
      problems: [
        {
          question: 'Phản ứng giữa HCl và NaOH tạo ra gì?',
          solution: 'HCl + NaOH → NaCl + H₂O (muối ăn và nước)',
          difficulty: 2
        }
      ],
      tips: [
        'Học thuộc bảng tuần hoàn các nguyên tố',
        'Cân bằng phương trình hóa học',
        'Chú ý số oxi hóa'
      ]
    });

    // Ngữ Văn
    this.knowledgeBase.set('van', {
      concepts: {
        'phép ẩn dụ': {
          definition: 'So sánh ngầm không có từ so sánh',
          example: 'Ngọn sóng xô (so sánh ngầm đám đông với sóng biển)',
          difficulty: 3
        },
        'phép nhân hóa': {
          definition: 'Gán đặc điểm con người cho sự vật',
          example: 'Cây xanh vươn tay đón nắng',
          difficulty: 2
        }
      },
      problems: [
        {
          question: 'Tìm phép tu từ trong câu: "Đôi bờ xanh biếc"',
          solution: 'Phép nhân hóa - gán đặc điểm con người (xanh biếc) cho đôi bờ',
          difficulty: 3
        }
      ],
      tips: [
        'Đọc kỹ văn bản nhiều lần',
        'Gạch chân dưới các từ ngữ đặc biệt',
        'Tìm ý nghĩa sâu xa của hình ảnh'
      ]
    });

    // Tiếng Anh
    this.knowledgeBase.set('anh', {
      concepts: {
        'present perfect': {
          definition: 'Have/Has + V3 (diễn tả hành động bắt đầu trong quá khứ, kết quả ở hiện tại)',
          example: 'I have finished my homework (Tôi đã làm xong bài tập)',
          difficulty: 4
        },
        'passive voice': {
          definition: 'To be + V3 (thể bị động)',
          example: 'The book was written by him (Quyển sách được viết bởi anh ấy)',
          difficulty: 3
        }
      },
      problems: [
        {
          question: 'Chuyển sang câu bị động: "She writes a letter"',
          solution: 'A letter is written by her',
          difficulty: 3
        }
      ],
      tips: [
        'Học từ vựng theo chủ đề',
        'Luyện nghe nói mỗi ngày',
        'Sử dụng flashcards'
      ]
    });
  }

  private initializeTemplates() {
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

  // Phân tích câu hỏi
  private analyzeQuestion(question: string): any {
    const lowerQuestion = question.toLowerCase();
    const keywords = this.extractKeywords(lowerQuestion);
    
    // Xác định môn học
    let subject = 'general';
    if (keywords.some(k => ['toán', 'phương trình', 'hàm số', 'đạo hàm'].includes(k))) {
      subject = 'toan';
    } else if (keywords.some(k => ['vật lý', 'lực', 'động lượng', 'newton'].includes(k))) {
      subject = 'vatly';
    } else if (keywords.some(k => ['hóa', 'phản ứng', 'hợp chất'].includes(k))) {
      subject = 'hoahoc';
    } else if (keywords.some(k => ['văn', 'phép', 'ẩn dụ', 'nhân hóa'].includes(k))) {
      subject = 'van';
    } else if (keywords.some(k => ['anh', 'english', 'present', 'passive'].includes(k))) {
      subject = 'anh';
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

    return { subject, intent, keywords };
  }

  private extractKeywords(text: string): string[] {
    const words = text.split(/\s+/);
    const stopWords = ['là', 'của', 'và', 'cho', 'với', 'trong', 'để', 'tôi', 'bạn', 'mình', 'thế', 'nào'];
    
    return words
      .filter(word => word.length > 2 && !stopWords.includes(word))
      .slice(0, 10);
  }

  // Tạo phản hồi AI
  async generateResponse(question: string, studentId?: number): Promise<AIResponse> {
    const analysis = this.analyzeQuestion(question);
    const studentProfile = studentId ? await this.getStudentProfile(studentId) : null;
    
    let content = '';
    let confidence = 0.8;
    const reasoning: string[] = [];

    try {
      switch (analysis.intent) {
        case 'solve_problem':
          const solution = this.solveProblem(question, analysis, studentProfile);
          content = solution.content;
          confidence = solution.confidence;
          reasoning.push('Phân tích bài tập', 'Áp dụng công thức', 'Kiểm tra kết quả');
          break;

        case 'explain_concept':
          const explanation = this.explainConcept(question, analysis, studentProfile);
          content = explanation.content;
          confidence = explanation.confidence;
          reasoning.push('Xác định khái niệm', 'Diễn giải chi tiết', 'Ví dụ minh họa');
          break;

        case 'provide_example':
          const example = this.provideExample(question, analysis, studentProfile);
          content = example.content;
          confidence = example.confidence;
          reasoning.push('Chọn ví dụ phù hợp', 'Giải thích từng bước');
          break;

        case 'study_advice':
          const advice = this.provideStudyAdvice(question, analysis, studentProfile);
          content = advice.content;
          confidence = advice.confidence;
          reasoning.push('Phân tích nhu cầu', 'Đề xuất phương pháp');
          break;

        default:
          content = this.generateGeneralResponse(question, analysis, studentProfile);
          reasoning.push('Phân tích câu hỏi', 'Tạo phản hồi chung');
      }

      // Cá nhân hóa
      if (studentProfile) {
        content = this.personalizeResponse(content, studentProfile);
      }

    } catch (error) {
      content = 'Xin lỗi, tôi đang gặp khó khăn. Bạn có thể diễn đạt lại không?';
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

  private solveProblem(question: string, analysis: any, studentProfile?: StudentProfile | null): any {
    if (analysis.subject === 'general') {
      return {
        content: 'Tôi cần biết môn học cụ thể để giải bài tập. Bạn đang hỏi về môn nào (Toán, Lý, Hóa, Văn, Anh)?',
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
    const similarProblem = knowledge.problems.find((p: any) => 
      question.toLowerCase().includes(p.question.toLowerCase().split(' ').slice(0, 3).join(' '))
    );

    if (similarProblem) {
      return {
        content: `**Bài giải:**\n\n${similarProblem.question}\n\n**Cách giải:**\n${similarProblem.solution}\n\n💡 **Mẹo:** ${knowledge.tips[Math.floor(Math.random() * knowledge.tips.length)]}`,
        confidence: 0.9
      };
    }

    // Tạo lời giải chung
    return {
      content: `**Hướng giải quyết:**\n\n1. Đọc kỹ đề bài\n2. Xác định công thức liên quan\n3. Áp dụng công thức\n4. Tính toán kết quả\n5. Kiểm tra lại\n\n💡 **Mẹo:** ${knowledge.tips[Math.floor(Math.random() * knowledge.tips.length)]}`,
      confidence: 0.7
    };
  }

  private explainConcept(question: string, analysis: any, studentProfile?: StudentProfile | null): any {
    if (analysis.subject === 'general') {
      return {
        content: 'Bạn muốn tôi giải thích khái niệm nào? Hãy cho biết môn học nhé.',
        confidence: 0.6
      };
    }

    const knowledge = this.knowledgeBase.get(analysis.subject);
    if (!knowledge) {
      return {
        content: 'Tôi chưa có thông tin về khái niệm này.',
        confidence: 0.4
      };
    }

    // Tìm khái niệm liên quan
    const concepts = knowledge.concepts;
    const relevantConcept = Object.keys(concepts).find(concept =>
      analysis.keywords.some(keyword => 
        concept.toLowerCase().includes(keyword) || 
        keyword.includes(concept.toLowerCase())
      )
    );

    if (relevantConcept && concepts[relevantConcept]) {
      const concept = concepts[relevantConcept];
      return {
        content: `**${relevantConcept}**\n\n**Định nghĩa:** ${concept.definition}\n\n**Ví dụ:** ${concept.example}\n\n**Độ khó:** ${concept.difficulty}/10\n\n💡 **Mẹo:** ${knowledge.tips[Math.floor(Math.random() * knowledge.tips.length)]}`,
        confidence: 0.9
      };
    }

    return {
      content: 'Tôi không tìm thấy khái niệm chính xác. Bạn có thể cho thêm thông tin không?',
      confidence: 0.5
    };
  }

  private provideExample(question: string, analysis: any, studentProfile?: StudentProfile | null): any {
    if (analysis.subject === 'general') {
      return {
        content: 'Bạn muốn ví dụ về môn học nào?',
        confidence: 0.6
      };
    }

    const knowledge = this.knowledgeBase.get(analysis.subject);
    if (!knowledge) {
      return {
        content: 'Tôi chưa có ví dụ cho môn học này.',
        confidence: 0.4
      };
    }

    const concepts = knowledge.concepts;
    const conceptKeys = Object.keys(concepts);
    const randomConcept = concepts[conceptKeys[Math.floor(Math.random() * conceptKeys.length)]];

    return {
      content: `**Ví dụ về ${conceptKeys[0]}:**\n\n${randomConcept.example}\n\n**Định nghĩa:** ${randomConcept.definition}\n\n💡 **Mẹo:** ${knowledge.tips[Math.floor(Math.random() * knowledge.tips.length)]}`,
      confidence: 0.85
    };
  }

  private provideStudyAdvice(question: string, analysis: any, studentProfile?: StudentProfile | null): any {
    let advice = '';

    if (studentProfile) {
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

  private generateGeneralResponse(question: string, analysis: any, studentProfile?: StudentProfile | null): string {
    const greetings = this.responseTemplates.get('greeting') || [];
    const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
    
    let response = `${randomGreeting}\n\n`;
    
    if (analysis.keywords.length > 0) {
      response += `Tôi nhận thấy bạn đang quan tâm đến: ${analysis.keywords.join(', ')}.\n\n`;
    }
    
    response += `Tôi có thể giúp bạn:\n`;
    response += `📝 Giải bài tập các môn Toán, Lý, Hóa, Văn, Anh\n`;
    response += `📖 Giải thích các khái niệm khó hiểu\n`;
    response += `💡 Đưa ra ví dụ minh họa\n`;
    response += `🎯 Tạo kế hoạch học tập cá nhân\n\n`;
    response += `Bạn muốn bắt đầu với gì nào?`;
    
    return response;
  }

  private personalizeResponse(content: string, profile: StudentProfile): string {
    let personalized = content;
    
    if (profile.weaknesses.length > 0 && Math.random() > 0.5) {
      const encouragements = this.responseTemplates.get('encouragement') || [];
      const randomEncouragement = encouragements[Math.floor(Math.random() * encouragements.length)];
      personalized += `\n\n💪 ${randomEncouragement}`;
    }
    
    return personalized;
  }

  // Lấy profile học sinh
  private async getStudentProfile(studentId: number): Promise<StudentProfile | null> {
    try {
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

      // Phân tích dữ liệu
      const subjectPerformance: Record<string, number[]> = {};
      
      student.grades.forEach((grade: any) => {
        const subject = grade.subject.name;
        if (!subjectPerformance[subject]) {
          subjectPerformance[subject] = [];
        }
        subjectPerformance[subject].push(grade.score);
      });

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

      const learningStyle = this.determineLearningStyle(student.grades);
      const recentScores = student.grades.slice(-10).map((g: any) => g.score);

      return {
        id: student.id,
        strengths,
        weaknesses,
        learningStyle,
        recentScores
      };
    } catch (error) {
      return null;
    }
  }

  private determineLearningStyle(grades: any[]): 'visual' | 'auditory' | 'kinesthetic' {
    const styles: ('visual' | 'auditory' | 'kinesthetic')[] = ['visual', 'auditory', 'kinesthetic'];
    return styles[Math.floor(Math.random() * styles.length)];
  }

  // Phân tích hiệu suất
  async analyzePerformance(studentId: number): Promise<any> {
    const profile = await this.getStudentProfile(studentId);
    
    if (!profile) {
      return { error: 'Không tìm thấy học sinh' };
    }

    const scores = profile.recentScores;
    if (scores.length === 0) {
      return {
        trend: 'no_data',
        average: 0,
        recommendations: ['Cần thêm dữ liệu để phân tích']
      };
    }

    const recent = scores.slice(-5);
    const older = scores.slice(-10, -5);
    
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

    const overallAvg = scores.reduce((sum, score) => sum + score, 0) / scores.length;

    return {
      trend,
      average: overallAvg,
      recentAverage: recentAvg,
      strengths: profile.strengths,
      weaknesses: profile.weaknesses,
      learningStyle: profile.learningStyle,
      recommendations: this.generateRecommendations(profile, trend)
    };
  }

  private generateRecommendations(profile: StudentProfile, trend: string): string[] {
    const recommendations: string[] = [];

    if (trend === 'declining') {
      recommendations.push('Cần tìm hiểu nguyên nhân giảm điểm');
      recommendations.push('Tăng thời gian ôn tập');
      recommendations.push('Tìm sự giúp đỡ từ giáo viên');
    } else if (trend === 'improving') {
      recommendations.push('Tiếp tục phát huy phương pháp hiện tại');
      recommendations.push('Giúp đỡ các bạn yếu hơn');
    }

    if (profile.weaknesses.length > 0) {
      recommendations.push(`Tập trung cải thiện: ${profile.weaknesses.join(', ')}`);
    }

    recommendations.push('Duy trì lịch học đều đặn');
    recommendations.push('Nghỉ ngơi đủ để giữ sức khỏe');

    return recommendations;
  }

  // Tạo nội dung học tập
  async generateContent(subject: string, topic: string, difficulty: number, type: string): Promise<any> {
    const knowledge = this.knowledgeBase.get(subject.toLowerCase());
    
    if (!knowledge) {
      return {
        error: 'Không tìm thấy môn học',
        suggestions: ['Thử các môn: Toán, Vật Lý, Hóa Học, Ngữ Văn, Tiếng Anh']
      };
    }

    const concepts = knowledge.concepts;
    const conceptKeys = Object.keys(concepts);
    
    if (type === 'explanation') {
      const concept = concepts[conceptKeys[0]];
      return {
        type: 'explanation',
        subject,
        topic,
        content: `**${topic}**\n\n${concept.definition}\n\n**Ví dụ:** ${concept.example}`,
        difficulty: concept.difficulty
      };
    }

    if (type === 'example') {
      const problem = knowledge.problems[0];
      return {
        type: 'example',
        subject,
        topic,
        content: `**Ví dụ:**\n\n${problem.question}\n\n**Giải:** ${problem.solution}`,
        difficulty: problem.difficulty
      };
    }

    return {
      type: 'exercise',
      subject,
      topic,
      content: 'Bài tập đang được tạo...',
      difficulty
    };
  }
}

export { StandaloneAI };
