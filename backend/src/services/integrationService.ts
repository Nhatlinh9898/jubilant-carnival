import { prisma } from '@/index';
import { cacheService } from './cacheService';
import { auditService } from './auditService';
import { NotificationService } from './socketService';
import { EmailService } from './emailService';
import { AnalyticsService } from './analyticsService';
import { AIService } from './aiService';
import { SearchService } from './searchService';
import { FileUploadService } from './fileUploadService';
import { SchedulerService } from './schedulerService';

export class IntegrationService {
  private static instance: IntegrationService;
  private notificationService: NotificationService;
  private emailService: EmailService;
  private analyticsService: AnalyticsService;
  private aiService: AIService;
  private searchService: SearchService;
  private fileUploadService: FileUploadService;
  private schedulerService: SchedulerService;

  private constructor() {
    this.notificationService = new NotificationService();
    this.emailService = new EmailService();
    this.analyticsService = new AnalyticsService();
    this.aiService = new AIService();
    this.searchService = new SearchService();
    this.fileUploadService = new FileUploadService();
    this.schedulerService = new SchedulerService(this.notificationService);
  }

  static getInstance(): IntegrationService {
    if (!IntegrationService.instance) {
      IntegrationService.instance = new IntegrationService();
    }
    return IntegrationService.instance;
  }

  // Grade Management Integration
  async createGradeWithNotifications(gradeData: any, userId: number, userRole: string) {
    try {
      // Create grade
      const grade = await prisma.grade.create({
        data: gradeData,
        include: {
          student: {
            include: {
              user: {
                select: { email: true, fullName: true }
              }
            }
          },
          subject: {
            select: { name: true }
          }
        }
      });

      // Send notification to student
      await this.notificationService.sendNotification(
        grade.studentId,
        'new_grade',
        `Bạn có điểm mới: ${grade.score}/${grade.maxScore} môn ${grade.subject.name}`
      );

      // Send email notification
      await this.emailService.sendGradeNotification(
        grade.student.user.email,
        {
          studentName: grade.student.user.fullName,
          subjectName: grade.subject.name,
          score: grade.score,
          maxScore: grade.maxScore,
          examType: grade.examType
        }
      );

      // Invalidate cache
      await cacheService.invalidateUserCache(grade.studentId);
      await cacheService.invalidateSubjectCache(grade.subjectId);

      // Log audit
      await auditService.logUserAction(
        userId,
        userRole,
        'CREATE',
        'GRADE',
        grade.id,
        { score: grade.score, subjectId: grade.subjectId }
      );

      // Update analytics
      await this.analyticsService.updateGradeStatistics(grade.subjectId, grade.studentId);

      return grade;
    } catch (error) {
      console.error('Error in createGradeWithNotifications:', error);
      throw error;
    }
  }

  // Attendance Management Integration
  async markAttendanceWithNotifications(attendanceData: any[], classId: number, userId: number, userRole: string) {
    try {
      // Create attendance records
      const attendanceRecords = await prisma.$transaction(async (tx) => {
        return Promise.all(
          attendanceData.map(data =>
            tx.attendance.upsert({
              where: {
                studentId_date: {
                  studentId: data.studentId,
                  date: new Date(data.date)
                }
              },
              update: {
                status: data.status,
                notes: data.notes
              },
              create: {
                studentId: data.studentId,
                date: new Date(data.date),
                status: data.status,
                notes: data.notes
              }
            })
          )
        );
      });

      // Get absent students for notifications
      const absentStudents = attendanceRecords.filter(record => record.status === 'ABSENT');
      
      for (const record of absentStudents) {
        const student = await prisma.student.findUnique({
          where: { id: record.studentId },
          include: {
            user: {
              select: { email: true, fullName: true }
            }
          }
        });

        if (student) {
          // Send notification
          await this.notificationService.sendNotification(
            record.studentId,
            'absence_alert',
            `Bạn đã vắng mặt ngày ${record.date}`
          );

          // Send email to parents
          await this.emailService.sendEmail({
            to: student.user.email,
            subject: 'Thông báo vắng mặt',
            html: `
              <h2>Thông báo vắng mặt</h2>
              <p>Học sinh ${student.user.fullName} đã vắng mặt vào ngày ${record.date}.</p>
              <p>Lý do: ${record.notes || 'Không có ghi chú'}</p>
            `
          });
        }
      }

      // Invalidate cache
      for (const record of attendanceRecords) {
        await cacheService.invalidateUserCache(record.studentId);
      }
      await cacheService.invalidateClassCache(classId);

      // Log audit
      await auditService.logUserAction(
        userId,
        userRole,
        'CREATE',
        'ATTENDANCE',
        undefined,
        { classId, count: attendanceRecords.length }
      );

      // Update analytics
      await this.analyticsService.updateAttendanceStatistics(classId);

      return attendanceRecords;
    } catch (error) {
      console.error('Error in markAttendanceWithNotifications:', error);
      throw error;
    }
  }

  // Student Performance Analysis
  async analyzeStudentPerformance(studentId: number) {
    try {
      // Get student data
      const student = await prisma.student.findUnique({
        where: { id: studentId },
        include: {
          user: {
            select: { fullName: true, email: true }
          },
          class: {
            select: { name: true, gradeLevel: true }
          },
          grades: {
            include: {
              subject: {
                select: { name: true }
              }
            }
          },
          attendance: {
            where: {
              date: {
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
              }
            }
          }
        }
      });

      if (!student) {
        throw new Error('Student not found');
      }

      // AI Analysis
      const aiAnalysis = await this.aiService.analyzeLearningPatterns(studentId);
      
      // Analytics data
      const analyticsData = await this.analyticsService.getStudentPerformance(studentId);
      
      // Performance prediction
      const prediction = await this.aiService.predictPerformance(studentId);

      // Generate recommendations
      const recommendations = await this.aiService.getPersonalizedRecommendations(studentId);

      // Cache results
      await cacheService.set(`student:performance:${studentId}`, {
        aiAnalysis,
        analyticsData,
        prediction,
        recommendations,
        lastUpdated: new Date()
      }, { ttl: 3600 }); // 1 hour

      return {
        student: {
          id: student.id,
          fullName: student.user.fullName,
          class: student.class.name,
          gradeLevel: student.class.gradeLevel
        },
        aiAnalysis,
        analyticsData,
        prediction,
        recommendations
      };
    } catch (error) {
      console.error('Error in analyzeStudentPerformance:', error);
      throw error;
    }
  }

  // Class Performance Dashboard
  async getClassPerformanceDashboard(classId: number) {
    try {
      const cacheKey = `class:dashboard:${classId}`;
      
      // Try cache first
      const cached = await cacheService.get(cacheKey);
      if (cached) {
        return cached;
      }

      // Get class data
      const classData = await prisma.class.findUnique({
        where: { id: classId },
        include: {
          students: {
            include: {
              user: {
                select: { fullName: true }
              },
              grades: {
                include: {
                  subject: {
                    select: { name: true }
                  }
                }
              }
            }
          },
          homeroomTeacher: {
            include: {
              user: {
                select: { fullName: true }
              }
            }
          }
        }
      });

      if (!classData) {
        throw new Error('Class not found');
      }

      // Analytics data
      const analyticsData = await this.analyticsService.getClassAnalytics(classId);
      
      // AI insights
      const aiInsights = await this.aiService.analyzeClassPerformance(classId);

      // Performance trends
      const trends = await this.analyticsService.getClassTrends(classId);

      const dashboard = {
        class: {
          id: classData.id,
          name: classData.name,
          gradeLevel: classData.gradeLevel,
          studentCount: classData.students.length,
          homeroomTeacher: classData.homeroomTeacher?.user.fullName
        },
        analytics: analyticsData,
        aiInsights,
        trends,
        lastUpdated: new Date()
      };

      // Cache for 30 minutes
      await cacheService.set(cacheKey, dashboard, { ttl: 1800 });

      return dashboard;
    } catch (error) {
      console.error('Error in getClassPerformanceDashboard:', error);
      throw error;
    }
  }

  // File Upload with Processing
  async uploadAndProcessFile(file: any, type: string, metadata: any = {}) {
    try {
      // Upload file
      const uploadResult = await this.fileUploadService.uploadFile(file, type, metadata);

      // Process file based on type
      let processedData = null;

      switch (type) {
        case 'student_import':
          processedData = await this.processStudentImport(uploadResult);
          break;
        case 'grade_import':
          processedData = await this.processGradeImport(uploadResult);
          break;
        case 'attendance_import':
          processedData = await this.processAttendanceImport(uploadResult);
          break;
        case 'profile_image':
          processedData = await this.processProfileImage(uploadResult, metadata);
          break;
      }

      return {
        upload: uploadResult,
        processed: processedData
      };
    } catch (error) {
      console.error('Error in uploadAndProcessFile:', error);
      throw error;
    }
  }

  // Advanced Search with Filters
  async advancedSearch(query: string, filters: any = {}) {
    try {
      const searchResults = await this.searchService.globalSearch(query, {
        entities: filters.entities,
        limit: filters.limit || 20
      });

      // Enhance results with additional data
      const enhancedResults = await this.enhanceSearchResults(searchResults, filters);

      return enhancedResults;
    } catch (error) {
      console.error('Error in advancedSearch:', error);
      throw error;
    }
  }

  // Automated Report Generation
  async generateReport(reportType: string, parameters: any = {}) {
    try {
      let reportData = null;

      switch (reportType) {
        case 'monthly_performance':
          reportData = await this.generateMonthlyPerformanceReport(parameters);
          break;
        case 'attendance_summary':
          reportData = await this.generateAttendanceSummaryReport(parameters);
          break;
        case 'financial_summary':
          reportData = await this.generateFinancialSummaryReport(parameters);
          break;
        case 'class_comparison':
          reportData = await this.generateClassComparisonReport(parameters);
          break;
      }

      // Generate PDF
      const pdfBuffer = await this.fileUploadService.generatePDF(reportData, reportType);

      return {
        data: reportData,
        pdf: pdfBuffer
      };
    } catch (error) {
      console.error('Error in generateReport:', error);
      throw error;
    }
  }

  // Real-time Notifications for Events
  async handleSystemEvent(eventType: string, eventData: any) {
    try {
      switch (eventType) {
        case 'grade_created':
          await this.handleGradeCreatedEvent(eventData);
          break;
        case 'attendance_marked':
          await this.handleAttendanceMarkedEvent(eventData);
          break;
        case 'student_enrolled':
          await this.handleStudentEnrolledEvent(eventData);
          break;
        case 'class_created':
          await this.handleClassCreatedEvent(eventData);
          break;
        case 'exam_scheduled':
          await this.handleExamScheduledEvent(eventData);
          break;
      }
    } catch (error) {
      console.error('Error in handleSystemEvent:', error);
    }
  }

  // Private helper methods
  private async processStudentImport(uploadResult: any) {
    // Process CSV/Excel file for student import
    // Implementation would depend on file format
    return { imported: 0, errors: [] };
  }

  private async processGradeImport(uploadResult: any) {
    // Process grade import file
    return { imported: 0, errors: [] };
  }

  private async processAttendanceImport(uploadResult: any) {
    // Process attendance import file
    return { imported: 0, errors: [] };
  }

  private async processProfileImage(uploadResult: any, metadata: any) {
    // Process profile image, generate thumbnails
    const thumbnail = await this.fileUploadService.generateThumbnail(uploadResult.path);
    
    // Update user avatar
    if (metadata.userId) {
      await prisma.user.update({
        where: { id: metadata.userId },
        data: { avatar: thumbnail.url }
      });
    }

    return { thumbnail };
  }

  private async enhanceSearchResults(results: any, filters: any) {
    // Add additional data to search results
    return results;
  }

  private async generateMonthlyPerformanceReport(parameters: any) {
    return { data: [], summary: {} };
  }

  private async generateAttendanceSummaryReport(parameters: any) {
    return { data: [], summary: {} };
  }

  private async generateFinancialSummaryReport(parameters: any) {
    return { data: [], summary: {} };
  }

  private async generateClassComparisonReport(parameters: any) {
    return { data: [], summary: {} };
  }

  private async handleGradeCreatedEvent(eventData: any) {
    // Handle grade creation event
    await this.notificationService.sendNotification(
      eventData.studentId,
      'new_grade',
      `Bạn có điểm mới: ${eventData.score}/${eventData.maxScore}`
    );
  }

  private async handleAttendanceMarkedEvent(eventData: any) {
    // Handle attendance marking event
    if (eventData.status === 'ABSENT') {
      await this.notificationService.sendNotification(
        eventData.studentId,
        'absence_alert',
        `Bạn đã vắng mặt ngày ${eventData.date}`
      );
    }
  }

  private async handleStudentEnrolledEvent(eventData: any) {
    // Handle student enrollment event
    await this.notificationService.sendNotification(
      eventData.studentId,
      'welcome',
      `Chào mừng bạn đến với lớp ${eventData.className}`
    );
  }

  private async handleClassCreatedEvent(eventData: any) {
    // Handle class creation event
    // Notify relevant teachers
  }

  private async handleExamScheduledEvent(eventData: any) {
    // Handle exam scheduling event
    // Notify students in the class
  }

  // Health check for all services
  async healthCheck() {
    const services = {
      database: 'unknown',
      cache: 'unknown',
      email: 'unknown',
      notifications: 'unknown',
      fileUpload: 'unknown',
      analytics: 'unknown',
      ai: 'unknown',
      search: 'unknown',
      scheduler: 'unknown'
    };

    try {
      // Check database
      await prisma.$queryRaw`SELECT 1`;
      services.database = 'healthy';
    } catch (error) {
      services.database = 'unhealthy';
    }

    // Check cache
    try {
      await cacheService.healthCheck();
      services.cache = 'healthy';
    } catch (error) {
      services.cache = 'unhealthy';
    }

    // Check email service
    try {
      await this.emailService.verifyConnection();
      services.email = 'healthy';
    } catch (error) {
      services.email = 'unhealthy';
    }

    return {
      status: Object.values(services).every(status => status === 'healthy') ? 'healthy' : 'degraded',
      services,
      timestamp: new Date()
    };
  }
}

export { IntegrationService };
