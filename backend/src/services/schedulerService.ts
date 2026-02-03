import cron from 'node-cron';
import { prisma } from '@/index';
import { EmailService } from './emailService';
import { NotificationService } from './socketService';
import moment from 'moment';

interface ScheduledTask {
  id: string;
  name: string;
  schedule: string; // cron expression
  enabled: boolean;
  lastRun?: Date;
  nextRun?: Date;
  handler: () => Promise<void>;
}

export class SchedulerService {
  private tasks: Map<string, ScheduledTask> = new Map();
  private emailService: EmailService;
  private notificationService: NotificationService;

  constructor(notificationService: NotificationService) {
    this.emailService = new EmailService();
    this.notificationService = notificationService;
    this.initializeTasks();
  }

  private initializeTasks() {
    // Daily attendance reminder
    this.addTask({
      id: 'daily-attendance-reminder',
      name: 'Daily Attendance Reminder',
      schedule: '0 7 * * 1-5', // 7 AM, Monday to Friday
      enabled: true,
      handler: this.sendDailyAttendanceReminder.bind(this)
    });

    // Weekly performance report
    this.addTask({
      id: 'weekly-performance-report',
      name: 'Weekly Performance Report',
      schedule: '0 18 * * 5', // 6 PM every Friday
      enabled: true,
      handler: this.sendWeeklyPerformanceReport.bind(this)
    });

    // Monthly invoice generation
    this.addTask({
      id: 'monthly-invoice-generation',
      name: 'Monthly Invoice Generation',
      schedule: '0 9 1 * *', // 9 AM on 1st of every month
      enabled: true,
      handler: this.generateMonthlyInvoices.bind(this)
    });

    // Library overdue notifications
    this.addTask({
      id: 'library-overdue-notifications',
      name: 'Library Overdue Notifications',
      schedule: '0 10 * * *', // 10 AM daily
      enabled: true,
      handler: this.sendLibraryOverdueNotifications.bind(this)
    });

    // Exam reminders
    this.addTask({
      id: 'exam-reminders',
      name: 'Exam Reminders',
      schedule: '0 8 * * *', // 8 AM daily
      enabled: true,
      handler: this.sendExamReminders.bind(this)
    });

    // Data cleanup and archiving
    this.addTask({
      id: 'data-cleanup',
      name: 'Data Cleanup and Archiving',
      schedule: '0 2 * * 0', // 2 AM every Sunday
      enabled: true,
      handler: this.performDataCleanup.bind(this)
    });

    // System health check
    this.addTask({
      id: 'system-health-check',
      name: 'System Health Check',
      schedule: '*/30 * * * *', // Every 30 minutes
      enabled: true,
      handler: this.performHealthCheck.bind(this)
    });
  }

  // Add a new scheduled task
  addTask(task: ScheduledTask) {
    this.tasks.set(task.id, task);
    
    if (task.enabled) {
      this.scheduleTask(task);
    }
  }

  // Schedule a single task
  private scheduleTask(task: ScheduledTask) {
    if (!cron.validate(task.schedule)) {
      console.error(`Invalid cron expression for task ${task.id}: ${task.schedule}`);
      return;
    }

    cron.schedule(task.schedule, async () => {
      try {
        console.log(`Running scheduled task: ${task.name}`);
        task.lastRun = new Date();
        
        await task.handler();
        
        console.log(`Completed task: ${task.name}`);
      } catch (error) {
        console.error(`Error in task ${task.name}:`, error);
      }
    });

    // Calculate next run time
    task.nextRun = this.getNextRunTime(task.schedule);
  }

  // Get next run time for a cron expression
  private getNextRunTime(cronExpression: string): Date {
    // This is a simplified implementation
    // In production, you might want to use a more sophisticated cron parser
    const now = moment();
    const [minute, hour, day, month, dayOfWeek] = cronExpression.split(' ');
    
    let nextRun = now.clone();
    
    // Simple logic - in production, use a proper cron parser library
    if (dayOfWeek !== '*') {
      const targetDay = parseInt(dayOfWeek);
      const currentDay = now.day() === 0 ? 7 : now.day(); // Convert Sunday to 7
      let daysToAdd = targetDay - currentDay;
      if (daysToAdd <= 0) daysToAdd += 7;
      nextRun.add(daysToAdd, 'days');
    }
    
    if (hour !== '*') {
      nextRun.hour(parseInt(hour));
      nextRun.minute(0);
      nextRun.second(0);
    }
    
    if (minute !== '*') {
      nextRun.minute(parseInt(minute));
      nextRun.second(0);
    }
    
    return nextRun.toDate();
  }

  // Task handlers

  // Send daily attendance reminder
  private async sendDailyAttendanceReminder() {
    try {
      const teachers = await prisma.teacher.findMany({
        where: { isActive: true },
        include: {
          classes: true
        }
      });

      for (const teacher of teachers) {
        for (const classInfo of teacher.classes) {
          // Send reminder to teacher
          await this.emailService.sendEmail({
            to: teacher.user.email,
            subject: `Nhắc nhở điểm danh - Lớp ${classInfo.name}`,
            html: `
              <h2>Nhắc nhở điểm danh</h2>
              <p>Vui lòng thực hiện điểm danh cho lớp <strong>${classInfo.name}</strong> hôm nay.</p>
              <p>Thời gian: ${moment().format('HH:mm')}</p>
              <a href="${process.env.FRONTEND_URL}/attendance" style="background: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
                Điểm danh ngay
              </a>
            `
          });
        }
      }

      console.log(`Sent attendance reminders to ${teachers.length} teachers`);
    } catch (error) {
      console.error('Error sending attendance reminders:', error);
    }
  }

  // Send weekly performance report
  private async sendWeeklyPerformanceReport() {
    try {
      const students = await prisma.student.findMany({
        where: { status: 'ACTIVE' },
        include: {
          user: true,
          class: true,
          grades: {
            where: {
              createdAt: {
                gte: moment().subtract(7, 'days').toDate()
              }
            },
            include: {
              subject: true
            }
          }
        }
      });

      for (const student of students) {
        const averageGrade = student.grades.length > 0 
          ? student.grades.reduce((sum, grade) => sum + grade.score, 0) / student.grades.length 
          : 0;

        const attendanceCount = await prisma.attendance.count({
          where: {
            studentId: student.id,
            date: {
              gte: moment().subtract(7, 'days').toDate()
            },
            status: 'PRESENT'
          }
        });

        const totalDays = await prisma.attendance.count({
          where: {
            studentId: student.id,
            date: {
              gte: moment().subtract(7, 'days').toDate()
            }
          }
        });

        const attendanceRate = totalDays > 0 ? (attendanceCount / totalDays) * 100 : 0;

        await this.emailService.sendEmail({
          to: student.user.email,
          subject: `Báo cáo tuần ${moment().format('DD/MM')} - ${student.class.name}`,
          html: `
            <h2>Báo cáo học tập tuần</h2>
            <p><strong>Học sinh:</strong> ${student.user.fullName}</p>
            <p><strong>Lớp:</strong> ${student.class.name}</p>
            <p><strong>Điểm trung bình:</strong> ${averageGrade.toFixed(2)}/10</p>
            <p><strong>Tỷ lệ chuyên cần:</strong> ${attendanceRate.toFixed(1)}%</p>
            <p><strong>Số môn học:</strong> ${student.grades.length}</p>
            <hr>
            <p>Chi tiết điểm số:</p>
            <ul>
              ${student.grades.map(grade => 
                `<li>${grade.subject.name}: ${grade.score}/10</li>`
              ).join('')}
            </ul>
          `
        });
      }

      console.log(`Sent weekly reports to ${students.length} students`);
    } catch (error) {
      console.error('Error sending weekly reports:', error);
    }
  }

  // Generate monthly invoices
  private async generateMonthlyInvoices() {
    try {
      const students = await prisma.student.findMany({
        where: { status: 'ACTIVE' },
        include: {
          user: true,
          class: true
        }
      });

      const currentMonth = moment().format('YYYY-MM');
      const dueDate = moment().add(15, 'days').toDate();

      for (const student of students) {
        // Check if invoice already exists for this month
        const existingInvoice = await prisma.invoice.findFirst({
          where: {
            studentId: student.id,
            title: {
              contains: currentMonth
            }
          }
        });

        if (existingInvoice) continue;

        // Generate invoice amount based on class grade level
        const baseAmount = this.getTuitionFee(student.class.gradeLevel);

        await prisma.invoice.create({
          data: {
            studentId: student.id,
            title: `Học phí ${currentMonth}`,
            amount: baseAmount,
            dueDate,
            status: 'UNPAID'
          }
        });

        // Send notification
        await this.emailService.sendInvoiceNotification(student.user.email, {
          userName: student.user.fullName,
          title: `Học phí ${currentMonth}`,
          amount: baseAmount,
          dueDate: dueDate.toISOString(),
          id: student.id
        });
      }

      console.log(`Generated invoices for ${students.length} students`);
    } catch (error) {
      console.error('Error generating monthly invoices:', error);
    }
  }

  // Send library overdue notifications
  private async sendLibraryOverdueNotifications() {
    try {
      const overdueBooks = await prisma.libraryBook.findMany({
        where: {
          status: 'BORROWED',
          dueDate: {
            lt: new Date()
          }
        },
        include: {
          borrowedStudent: {
            include: {
              user: true
            }
          }
        }
      });

      for (const book of overdueBooks) {
        const daysOverdue = moment().diff(moment(book.dueDate), 'days');
        
        await this.emailService.sendEmail({
          to: book.borrowedStudent.user.email,
          subject: `Sách quá hạn - ${book.title}`,
          html: `
            <h2>Sách quá hạn</h2>
            <p>Sách <strong>${book.title}</strong> đã quá hạn <strong>${daysOverdue}</strong> ngày.</p>
            <p>Ngày mượn: ${moment(book.borrowedDate).format('DD/MM/YYYY')}</p>
            <p>Ngày trả dự kiến: ${moment(book.dueDate).format('DD/MM/YYYY')}</p>
            <p>Vui lòng trả sách sớm nhất có thể.</p>
          `
        });
      }

      console.log(`Sent overdue notifications for ${overdueBooks.length} books`);
    } catch (error) {
      console.error('Error sending overdue notifications:', error);
    }
  }

  // Send exam reminders
  private async sendExamReminders() {
    try {
      const upcomingExams = await prisma.exam.findMany({
        where: {
          date: {
            gte: new Date(),
            lte: moment().add(7, 'days').toDate()
          },
          status: 'UPCOMING'
        },
        include: {
          subject: true
        }
      });

      for (const exam of upcomingExams) {
        // Get students for this exam's subject
        const students = await prisma.student.findMany({
          where: { status: 'ACTIVE' },
          include: {
            user: true,
            grades: {
              where: { subjectId: exam.subjectId }
            }
          }
        });

        for (const student of students) {
          await this.emailService.sendExamReminder(student.user.email, {
            studentName: student.user.fullName,
            title: exam.title,
            subjectName: exam.subject.name,
            date: exam.date.toISOString(),
            time: '08:00',
            room: 'Phòng thi',
            duration: exam.duration
          });
        }
      }

      console.log(`Sent exam reminders for ${upcomingExams.length} exams`);
    } catch (error) {
      console.error('Error sending exam reminders:', error);
    }
  }

  // Perform data cleanup
  private async performDataCleanup() {
    try {
      // Archive old notifications
      const thirtyDaysAgo = moment().subtract(30, 'days').toDate();
      
      await prisma.notification.deleteMany({
        where: {
          createdAt: {
            lt: thirtyDaysAgo
          },
          isRead: true
        }
      });

      // Archive old chat messages
      await prisma.chatMessage.deleteMany({
        where: {
          timestamp: {
            lt: thirtyDaysAgo
          }
        }
      });

      console.log('Completed data cleanup');
    } catch (error) {
      console.error('Error during data cleanup:', error);
    }
  }

  // Perform system health check
  private async performHealthCheck() {
    try {
      const health = {
        database: 'unknown',
        memory: process.memoryUsage(),
        uptime: process.uptime(),
        timestamp: new Date()
      };

      // Test database connection
      try {
        await prisma.$queryRaw`SELECT 1`;
        health.database = 'healthy';
      } catch (error) {
        health.database = 'unhealthy';
        console.error('Database health check failed:', error);
      }

      // Log health status
      if (health.database === 'unhealthy') {
        console.error('System health check failed - Database unhealthy');
        // Send alert to administrators
        await this.sendHealthAlert('Database connection failed');
      }

      // Check memory usage
      const memoryUsage = process.memoryUsage();
      const memoryUsageMB = memoryUsage.heapUsed / 1024 / 1024;
      
      if (memoryUsageMB > 500) { // Alert if using more than 500MB
        await this.sendHealthAlert(`High memory usage: ${memoryUsageMB.toFixed(2)}MB`);
      }

    } catch (error) {
      console.error('Error during health check:', error);
    }
  }

  // Send health alert to administrators
  private async sendHealthAlert(message: string) {
    try {
      const admins = await prisma.user.findMany({
        where: { role: 'ADMIN', isActive: true }
      });

      for (const admin of admins) {
        await this.emailService.sendEmail({
          to: admin.email,
          subject: '🚨 System Health Alert',
          html: `
            <h2>System Health Alert</h2>
            <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Issue:</strong> ${message}</p>
            <p>Please check the system immediately.</p>
          `
        });
      }
    } catch (error) {
      console.error('Error sending health alert:', error);
    }
  }

  // Helper method to get tuition fee based on grade level
  private getTuitionFee(gradeLevel: number): number {
    const fees = {
      1: 500000,  // Grade 1
      2: 500000,
      3: 500000,
      4: 600000,  // Grade 4
      5: 600000,
      6: 600000,
      7: 700000,  // Grade 7
      8: 700000,
      9: 700000,
      10: 800000, // Grade 10
      11: 800000,
      12: 800000
    };
    
    return fees[gradeLevel as keyof typeof fees] || 500000;
  }

  // Get all scheduled tasks
  getTasks(): ScheduledTask[] {
    return Array.from(this.tasks.values());
  }

  // Enable/disable a task
  toggleTask(taskId: string, enabled: boolean) {
    const task = this.tasks.get(taskId);
    if (task) {
      task.enabled = enabled;
      if (enabled) {
        this.scheduleTask(task);
      }
    }
  }

  // Remove a task
  removeTask(taskId: string) {
    this.tasks.delete(taskId);
  }

  // Get task status
  getTaskStatus(taskId: string): ScheduledTask | null {
    return this.tasks.get(taskId) || null;
  }
}

export { SchedulerService };
