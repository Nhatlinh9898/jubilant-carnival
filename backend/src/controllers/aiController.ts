import { Request, Response } from 'express';
import { AILocalService } from '@/services/aiLocalService';
import { prisma } from '@/index';

export class AIController {
  private aiService: AILocalService;

  constructor() {
    this.aiService = new AILocalService();
  }

  // AI Chat Endpoint
  async chatWithAI(req: Request, res: Response) {
    try {
      const { studentId, message } = req.body;

      if (!studentId || !message) {
        return res.status(400).json({
          success: false,
          error: 'Student ID and message are required'
        });
      }

      const response = await this.aiService.chatWithAI(parseInt(studentId), message);

      res.json({
        success: true,
        data: response
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Generate Smart Content
  async generateContent(req: Request, res: Response) {
    try {
      const { subject, topic, difficulty, contentType } = req.body;

      if (!subject || !topic || !difficulty || !contentType) {
        return res.status(400).json({
          success: false,
          error: 'All fields are required: subject, topic, difficulty, contentType'
        });
      }

      const content = await this.aiService.generateSmartContent(
        subject,
        topic,
        difficulty,
        contentType
      );

      res.json({
        success: true,
        data: content
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // AI Grading
  async gradeAssignment(req: Request, res: Response) {
    try {
      const { assignmentText, rubric, studentAnswer } = req.body;

      if (!assignmentText || !studentAnswer) {
        return res.status(400).json({
          success: false,
          error: 'Assignment text and student answer are required'
        });
      }

      const grading = await this.aiService.gradeAssignment(
        assignmentText,
        rubric || {},
        studentAnswer
      );

      res.json({
        success: true,
        data: grading
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Learning Analytics
  async getLearningAnalytics(req: Request, res: Response) {
    try {
      const { studentId } = req.params;

      if (!studentId) {
        return res.status(400).json({
          success: false,
          error: 'Student ID is required'
        });
      }

      const analytics = await this.aiService.generateLearningAnalytics(parseInt(studentId));

      res.json({
        success: true,
        data: analytics
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Q&A System
  async answerQuestion(req: Request, res: Response) {
    try {
      const { question, context, subject } = req.body;

      if (!question) {
        return res.status(400).json({
          success: false,
          error: 'Question is required'
        });
      }

      const answer = await this.aiService.answerQuestion(question, context, subject);

      res.json({
        success: true,
        data: answer
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Study Plan Generator
  async generateStudyPlan(req: Request, res: Response) {
    try {
      const { studentId, goals, timeframe } = req.body;

      if (!studentId || !goals || !timeframe) {
        return res.status(400).json({
          success: false,
          error: 'Student ID, goals, and timeframe are required'
        });
      }

      const studyPlan = await this.aiService.generateStudyPlan(
        parseInt(studentId),
        goals,
        parseInt(timeframe)
      );

      res.json({
        success: true,
        data: studyPlan
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Class Analytics (for teachers)
  async getClassAnalytics(req: Request, res: Response) {
    try {
      const { classId } = req.params;

      if (!classId) {
        return res.status(400).json({
          success: false,
          error: 'Class ID is required'
        });
      }

      // Get all students in the class
      const students = await prisma.student.findMany({
        where: { classId: parseInt(classId) },
        include: {
          grades: {
            include: { subject: true }
          },
          user: true
        }
      });

      // Generate analytics for each student
      const classAnalytics = await Promise.all(
        students.map(async (student) => {
          const analytics = await this.aiService.generateLearningAnalytics(student.id);
          return {
            studentId: student.id,
            studentName: student.user.fullName,
            analytics
          };
        })
      );

      // Calculate class-wide statistics
      const classStats = this.calculateClassStatistics(classAnalytics);

      res.json({
        success: true,
        data: {
          classId: parseInt(classId),
          totalStudents: students.length,
          studentAnalytics: classAnalytics,
          classStatistics: classStats
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // AI Recommendations for Teachers
  async getTeacherRecommendations(req: Request, res: Response) {
    try {
      const { classId, subjectId } = req.query;

      if (!classId) {
        return res.status(400).json({
          success: false,
          error: 'Class ID is required'
        });
      }

      // Get class performance data
      const students = await prisma.student.findMany({
        where: { classId: parseInt(classId as string) },
        include: {
          grades: subjectId ? {
            where: { subjectId: parseInt(subjectId as string) },
            include: { subject: true }
          } : {
            include: { subject: true }
          }
        }
      });

      // Generate AI recommendations
      const recommendations = this.generateTeacherRecommendations(students);

      res.json({
        success: true,
        data: {
          classId: parseInt(classId as string),
          subjectId: subjectId ? parseInt(subjectId as string) : null,
          recommendations,
          generatedAt: new Date()
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // AI-powered Content Suggestions
  async getContentSuggestions(req: Request, res: Response) {
    try {
      const { subject, topic, difficulty, studentLevel } = req.body;

      if (!subject || !topic) {
        return res.status(400).json({
          success: false,
          error: 'Subject and topic are required'
        });
      }

      const suggestions = this.generateContentSuggestions(
        subject,
        topic,
        difficulty || 'intermediate',
        studentLevel || 'average'
      );

      res.json({
        success: true,
        data: suggestions
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Helper methods
  private calculateClassStatistics(classAnalytics: any[]): any {
    const performanceTrends = classAnalytics.map(ca => ca.analytics.performanceTrend);
    const knowledgeGaps = classAnalytics.flatMap(ca => ca.analytics.knowledgeGaps);
    
    const trendCounts = {
      improving: performanceTrends.filter(t => t === 'improving').length,
      declining: performanceTrends.filter(t => t === 'declining').length,
      stable: performanceTrends.filter(t => t === 'stable').length
    };

    const gapFrequency = knowledgeGaps.reduce((acc, gap) => {
      acc[gap] = (acc[gap] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      performanceDistribution: trendCounts,
      commonKnowledgeGaps: Object.entries(gapFrequency)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([gap, count]) => ({ subject: gap, studentCount: count })),
      overallClassHealth: this.calculateClassHealth(trendCounts)
    };
  }

  private calculateClassHealth(trendCounts: Record<string, number>): 'excellent' | 'good' | 'concerning' | 'critical' {
    const total = Object.values(trendCounts).reduce((sum, count) => sum + count, 0);
    const improvingPercentage = (trendCounts.improving / total) * 100;
    const decliningPercentage = (trendCounts.declining / total) * 100;

    if (improvingPercentage >= 60) return 'excellent';
    if (improvingPercentage >= 40 && decliningPercentage <= 20) return 'good';
    if (decliningPercentage >= 40) return 'critical';
    return 'concerning';
  }

  private generateTeacherRecommendations(students: any[]): any[] {
    const recommendations = [];

    // Analyze overall class performance
    const avgPerformance = students.reduce((sum, student) => {
      const avgScore = student.grades.reduce((gradeSum: number, grade: any) => gradeSum + grade.score, 0) / student.grades.length;
      return sum + avgScore;
    }, 0) / students.length;

    if (avgPerformance < 6) {
      recommendations.push({
        type: 'academic',
        priority: 'high',
        title: 'Cải thiện kết quả học tập chung',
        description: 'Điểm trung bình lớp thấp, cần xem lại phương pháp giảng dạy',
        actions: ['Tổ chức thêm buổi phụ đạo', 'Giảm tốc độ giảng dạy', 'Tăng cường bài tập thực hành']
      });
    }

    // Check for struggling students
    const strugglingStudents = students.filter(student => {
      const avgScore = student.grades.reduce((sum: number, grade: any) => sum + grade.score, 0) / student.grades.length;
      return avgScore < 5;
    });

    if (strugglingStudents.length > students.length * 0.3) {
      recommendations.push({
        type: 'intervention',
        priority: 'high',
        title: 'Hỗ trợ học sinh yếu kém',
        description: `${strugglingStudents.length} học sinh cần sự hỗ trợ đặc biệt`,
        actions: ['Lên kế hoạch cá nhân hóa', 'Phối hợp với phụ huynh', 'Tổ chức nhóm học tập']
      });
    }

    // Subject-specific recommendations
    const subjectPerformance = this.analyzeSubjectPerformance(students);
    const weakSubjects = Object.entries(subjectPerformance)
      .filter(([, avg]) => avg < 6)
      .map(([subject]) => subject);

    if (weakSubjects.length > 0) {
      recommendations.push({
        type: 'subject',
        priority: 'medium',
        title: 'Cải thiện các môn yếu',
        description: `Các môn cần chú ý: ${weakSubjects.join(', ')}`,
        actions: ['Thay đổi phương pháp giảng dạy', 'Thêm tài liệu tham khảo', 'Tăng cường thực hành']
      });
    }

    return recommendations;
  }

  private analyzeSubjectPerformance(students: any[]): Record<string, number> {
    const subjectData: Record<string, number[]> = {};

    students.forEach(student => {
      student.grades.forEach((grade: any) => {
        if (!subjectData[grade.subject.name]) {
          subjectData[grade.subject.name] = [];
        }
        subjectData[grade.subject.name].push(grade.score);
      });
    });

    const averages: Record<string, number> = {};
    Object.entries(subjectData).forEach(([subject, scores]) => {
      averages[subject] = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    });

    return averages;
  }

  private generateContentSuggestions(
    subject: string,
    topic: string,
    difficulty: string,
    studentLevel: string
  ): any[] {
    const suggestions = [];

    // Content type suggestions
    suggestions.push({
      type: 'content_type',
      title: 'Loại nội dung đề xuất',
      suggestions: [
        { type: 'video', reason: 'Học sinh dễ tiếp thu qua hình ảnh' },
        { type: 'interactive', reason: 'Tăng cường tương tác và ghi nhớ' },
        { type: 'practice', reason: 'Củng cố kiến thức qua bài tập' }
      ]
    });

    // Difficulty adjustments
    if (studentLevel === 'below_average') {
      suggestions.push({
        type: 'difficulty_adjustment',
        title: 'Điều chỉnh độ khó',
        suggestions: [
          'Bắt đầu với khái niệm cơ bản',
          'Sử dụng nhiều ví dụ thực tế',
          'Chia nhỏ kiến thức thành các phần dễ hiểu'
        ]
      });
    } else if (studentLevel === 'above_average') {
      suggestions.push({
        type: 'difficulty_adjustment',
        title: 'Nâng cao thử thách',
        suggestions: [
          'Thêm bài tập nâng cao',
          'Giới thiệu các ứng dụng thực tế',
          'Khuyến khích tự nghiên cứu'
        ]
      });
    }

    // Teaching methods
    suggestions.push({
      type: 'teaching_method',
      title: 'Phương pháp giảng dạy',
      suggestions: [
        { method: 'group_work', reason: 'Phát triển kỹ năng hợp tác' },
        { method: 'discussion', reason: 'Kích thích tư duy phản biện' },
        { method: 'demonstration', reason: 'Hiểu rõ qua ví dụ thực tế' }
      ]
    });

    return suggestions;
  }
}

export { AIController };
