import { prisma } from '@/index';

interface PredictionResult {
  prediction: number;
  confidence: number;
  factors: Array<{
    factor: string;
    impact: number;
    description: string;
  }>;
  recommendations: string[];
}

interface LearningPattern {
  studentId: number;
  strengths: string[];
  weaknesses: string[];
  learningStyle: string;
  optimalStudyTime: string;
  preferredSubjects: string[];
  riskFactors: string[];
}

interface SmartSchedulingResult {
  optimalSchedule: Array<{
    subjectId: number;
    day: number;
    period: number;
    reason: string;
    efficiency: number;
  }>;
  conflicts: Array<{
    type: string;
    description: string;
    suggestion: string;
  }>;
}

export class AIService {
  // Predict student performance based on historical data
  async predictStudentPerformance(studentId: number, subjectId?: number): Promise<PredictionResult> {
    try {
      // Get student's historical data
      const student = await prisma.student.findUnique({
        where: { id: studentId },
        include: {
          grades: subjectId ? {
            where: { subjectId }
          } : true,
          attendance: {
            where: {
              date: {
                gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // Last 90 days
              }
            }
          }
        }
      });

      if (!student) {
        throw new Error('Student not found');
      }

      // Calculate factors
      const averageGrade = student.grades.reduce((sum, grade) => sum + grade.score, 0) / student.grades.length || 0;
      const attendanceRate = student.attendance.filter(a => a.status === 'PRESENT').length / student.attendance.length || 0;
      const gradeConsistency = this.calculateConsistency(student.grades.map(g => g.score));

      // Machine learning simulation (simplified)
      const attendanceWeight = 0.3;
      const gradeWeight = 0.4;
      const consistencyWeight = 0.3;

      const prediction = (averageGrade * gradeWeight) + 
                        (attendanceRate * 10 * attendanceWeight) + 
                        (gradeConsistency * consistencyWeight);

      const confidence = Math.min(0.95, 0.5 + (student.grades.length * 0.05));

      const factors = [
        {
          factor: 'Điểm trung bình hiện tại',
          impact: averageGrade / 10,
          description: `Điểm trung bình: ${averageGrade.toFixed(2)}/10`
        },
        {
          factor: 'Tỷ lệ chuyên cần',
          impact: attendanceRate,
          description: `Tỷ lệ đi học: ${(attendanceRate * 100).toFixed(1)}%`
        },
        {
          factor: 'Độ ổn định kết quả',
          impact: gradeConsistency,
          description: `Độ ổn định: ${(gradeConsistency * 100).toFixed(1)}%`
        }
      ];

      const recommendations = [];
      if (attendanceRate < 0.8) {
        recommendations.push('Cần cải thiện tỷ lệ chuyên cần');
      }
      if (averageGrade < 6) {
        recommendations.push('Nên học thêm và tìm kiếm sự hỗ trợ');
      }
      if (gradeConsistency < 0.6) {
        recommendations.push('Cần duy trì sự ổn định trong học tập');
      }

      return {
        prediction: Math.max(0, Math.min(10, prediction)),
        confidence,
        factors,
        recommendations
      };
    } catch (error) {
      console.error('Error predicting student performance:', error);
      throw new Error(`Failed to predict performance: ${error}`);
    }
  }

  // Analyze learning patterns
  async analyzeLearningPatterns(studentId: number): Promise<LearningPattern> {
    try {
      const student = await prisma.student.findUnique({
        where: { id: studentId },
        include: {
          grades: {
            include: {
              subject: true
            }
          },
          attendance: true
        }
      });

      if (!student) {
        throw new Error('Student not found');
      }

      // Analyze subject performance
      const subjectPerformance = student.grades.reduce((acc, grade) => {
        const subjectName = grade.subject.name;
        if (!acc[subjectName]) {
          acc[subjectName] = [];
        }
        acc[subjectName].push(grade.score);
        return acc;
      }, {} as Record<string, number[]>);

      const strengths: string[] = [];
      const weaknesses: string[] = [];
      const preferredSubjects: string[] = [];

      Object.entries(subjectPerformance).forEach(([subject, scores]) => {
        const avg = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        if (avg >= 8) {
          strengths.push(subject);
          preferredSubjects.push(subject);
        } else if (avg < 6) {
          weaknesses.push(subject);
        }
      });

      // Determine learning style based on performance patterns
      const learningStyle = this.determineLearningStyle(subjectPerformance, student.attendance);

      // Calculate optimal study time based on attendance patterns
      const optimalStudyTime = this.calculateOptimalStudyTime(student.attendance);

      // Identify risk factors
      const riskFactors: string[] = [];
      const attendanceRate = student.attendance.filter(a => a.status === 'PRESENT').length / student.attendance.length;
      if (attendanceRate < 0.8) riskFactors.push('Tỷ lệ chuyên cần thấp');
      if (weaknesses.length > strengths.length) riskFactors.push('Yếu thế học tập nhiều hơn điểm mạnh');
      if (student.grades.length < 10) riskFactors.push('Thiếu dữ liệu đánh giá');

      return {
        studentId,
        strengths,
        weaknesses,
        learningStyle,
        optimalStudyTime,
        preferredSubjects,
        riskFactors
      };
    } catch (error) {
      console.error('Error analyzing learning patterns:', error);
      throw new Error(`Failed to analyze learning patterns: ${error}`);
    }
  }

  // Generate smart scheduling
  async generateSmartSchedule(classId: number): Promise<SmartSchedulingResult> {
    try {
      // Get class information
      const classInfo = await prisma.class.findUnique({
        where: { id: classId },
        include: {
          students: {
            include: {
              grades: {
                include: {
                  subject: true
                }
              }
            }
          }
        }
      });

      if (!classInfo) {
        throw new Error('Class not found');
      }

      // Get current schedule
      const currentSchedule = await prisma.schedule.findMany({
        where: { classId },
        include: {
          subject: true,
          teacher: true
        }
      });

      // Analyze subject performance for the class
      const subjectPerformance = this.analyzeClassSubjectPerformance(classInfo.students);

      // Generate optimal schedule
      const optimalSchedule = this.optimizeSchedule(subjectPerformance, currentSchedule);

      // Identify conflicts
      const conflicts = this.identifyScheduleConflicts(optimalSchedule, currentSchedule);

      return {
        optimalSchedule,
        conflicts
      };
    } catch (error) {
      console.error('Error generating smart schedule:', error);
      throw new Error(`Failed to generate smart schedule: ${error}`);
    }
  }

  // Automated grading assistance
  async assistGrading(assignmentId: number): Promise<any> {
    try {
      // This would integrate with AI grading APIs
      // For now, return a mock response
      return {
        suggestions: [
          'Consider partial credit for partially correct answers',
          'Provide detailed feedback for incorrect responses',
          'Use rubric-based grading for consistency'
        ],
        autoGradingAvailable: false,
        estimatedTime: '15-30 minutes'
      };
    } catch (error) {
      console.error('Error assisting grading:', error);
      throw new Error(`Failed to assist grading: ${error}`);
    }
  }

  // Generate personalized recommendations
  async generatePersonalizedRecommendations(studentId: number): Promise<any> {
    try {
      const learningPattern = await this.analyzeLearningPatterns(studentId);
      const performance = await this.predictStudentPerformance(studentId);

      const recommendations = {
        academic: [
          ...learningPattern.recommendations,
          ...performance.recommendations
        ],
        studyMethods: this.generateStudyMethodRecommendations(learningPattern),
        resources: this.generateResourceRecommendations(learningPattern),
        career: this.generateCareerRecommendations(learningPattern, performance)
      };

      return recommendations;
    } catch (error) {
      console.error('Error generating recommendations:', error);
      throw new Error(`Failed to generate recommendations: ${error}`);
    }
  }

  // Helper methods
  private calculateConsistency(scores: number[]): number {
    if (scores.length < 2) return 0;
    
    const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
    const standardDeviation = Math.sqrt(variance);
    
    // Return consistency score (inverse of coefficient of variation)
    return mean > 0 ? 1 - (standardDeviation / mean) : 0;
  }

  private determineLearningStyle(subjectPerformance: Record<string, number[]>, attendance: any[]): string {
    // Simplified learning style determination
    const avgScores = Object.values(subjectPerformance).map(scores => 
      scores.reduce((sum, score) => sum + score, 0) / scores.length
    );
    
    if (avgScores.length > 0) {
      const avg = avgScores.reduce((sum, score) => sum + score, 0) / avgScores.length;
      if (avg >= 8) return 'Visual learner';
      if (avg >= 6) return 'Auditory learner';
      return 'Kinesthetic learner';
    }
    
    return 'Mixed learning style';
  }

  private calculateOptimalStudyTime(attendance: any[]): string {
    // Analyze attendance patterns to suggest optimal study times
    const morningAttendance = attendance.filter(a => {
      const hour = new Date(a.date).getHours();
      return hour >= 6 && hour <= 12;
    }).length;
    
    const afternoonAttendance = attendance.filter(a => {
      const hour = new Date(a.date).getHours();
      return hour > 12 && hour <= 18;
    }).length;
    
    const eveningAttendance = attendance.filter(a => {
      const hour = new Date(a.date).getHours();
      return hour > 18;
    }).length;
    
    const maxAttendance = Math.max(morningAttendance, afternoonAttendance, eveningAttendance);
    
    if (maxAttendance === morningAttendance) return 'Sáng (6:00 - 12:00)';
    if (maxAttendance === afternoonAttendance) return 'Chiều (12:00 - 18:00)';
    return 'Tối (18:00 - 22:00)';
  }

  private analyzeClassSubjectPerformance(students: any[]): Record<string, any> {
    const subjectData: Record<string, any> = {};
    
    students.forEach(student => {
      student.grades.forEach((grade: any) => {
        const subjectName = grade.subject.name;
        if (!subjectData[subjectName]) {
          subjectData[subjectName] = {
            scores: [],
            totalStudents: 0
          };
        }
        subjectData[subjectName].scores.push(grade.score);
        subjectData[subjectName].totalStudents++;
      });
    });
    
    // Calculate averages for each subject
    Object.keys(subjectData).forEach(subject => {
      const scores = subjectData[subject].scores;
      subjectData[subject].average = scores.reduce((sum: number, score: number) => sum + score, 0) / scores.length;
      subjectData[subject].performance = subjectData[subject].average / 10;
    });
    
    return subjectData;
  }

  private optimizeSchedule(subjectPerformance: Record<string, any>, currentSchedule: any[]): any[] {
    // Simplified schedule optimization
    const schedule = [];
    const days = [2, 3, 4, 5, 6]; // Monday to Friday
    const periods = [1, 2, 3, 4, 5];
    
    // Sort subjects by performance (lower performance gets priority slots)
    const sortedSubjects = Object.entries(subjectPerformance)
      .sort(([, a], [, b]) => a.average - b.average);
    
    let dayIndex = 0;
    let periodIndex = 0;
    
    sortedSubjects.forEach(([subject, data], index) => {
      if (dayIndex >= days.length) {
        dayIndex = 0;
        periodIndex++;
      }
      
      if (periodIndex < periods.length) {
        schedule.push({
          subjectId: this.getSubjectIdByName(subject),
          day: days[dayIndex],
          period: periods[periodIndex],
          reason: `Subject needs attention (average: ${data.average.toFixed(2)})`,
          efficiency: 1 - data.performance
        });
        
        dayIndex++;
      }
    });
    
    return schedule;
  }

  private identifyScheduleConflicts(optimalSchedule: any[], currentSchedule: any[]): any[] {
    const conflicts = [];
    
    optimalSchedule.forEach(optimal => {
      const existing = currentSchedule.find(current => 
        current.day === optimal.day && current.period === optimal.period
      );
      
      if (existing) {
        conflicts.push({
          type: 'Time conflict',
          description: `Period ${optimal.period} on day ${optimal.day} is already occupied`,
          suggestion: 'Consider rescheduling to a different time slot'
        });
      }
    });
    
    return conflicts;
  }

  private getSubjectIdByName(subjectName: string): number {
    // This would typically query the database
    // For now, return a mock ID
    return Math.floor(Math.random() * 10) + 1;
  }

  private generateStudyMethodRecommendations(pattern: LearningPattern): string[] {
    const recommendations = [];
    
    if (pattern.learningStyle === 'Visual learner') {
      recommendations.push('Sử dụng sơ đồ và biểu đồ');
      recommendations.push('Xem video bài giảng');
      recommendations.push('Sử dụng flashcards với hình ảnh');
    } else if (pattern.learningStyle === 'Auditory learner') {
      recommendations.push('Nghe audio bài giảng');
      recommendations.push('Thảo luận nhóm');
      recommendations.push('Đọc to thành tiếng');
    } else {
      recommendations.push('Thực hành qua các bài tập');
      recommendations.push('Học qua dự án thực tế');
      recommendations.push('Sử dụng các mô hình vật lý');
    }
    
    return recommendations;
  }

  private generateResourceRecommendations(pattern: LearningPattern): any[] {
    return [
      {
        type: 'Online Courses',
        title: 'Khan Academy',
        description: 'Miễn phí, phù hợp cho các môn học tập',
        url: 'https://www.khanacademy.org'
      },
      {
        type: 'Study Apps',
        title: 'Quizlet',
        description: 'Học từ vựng và ôn tập',
        url: 'https://quizlet.com'
      }
    ];
  }

  private generateCareerRecommendations(pattern: LearningPattern, performance: PredictionResult): any[] {
    const recommendations = [];
    
    if (pattern.strengths.includes('Toán Học') && performance.prediction >= 7) {
      recommendations.push({
        field: 'Kỹ thuật',
        careers: ['Lập trình viên', 'Kỹ sư phần mềm', 'Nhà phân tích dữ liệu'],
        description: 'Kết hợp tốt giữa toán học và công nghệ'
      });
    }
    
    if (pattern.strengths.includes('Ngữ Văn') && performance.prediction >= 7) {
      recommendations.push({
        field: 'Truyền thông',
        careers: ['Nhà báo', 'Biên tập viên', 'Chuyên viên marketing'],
        description: 'Kỹ năng viết và giao tiếp tốt'
      });
    }
    
    return recommendations;
  }
}

export { AIService };
