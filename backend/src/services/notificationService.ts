import { prisma } from '@/index';
import { cacheService } from './cacheService';
import { auditService } from './auditService';
import { EmailService } from './emailService';

export interface NotificationTemplate {
  id: string;
  name: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  channels: ('in_app' | 'email' | 'sms' | 'push')[];
  variables: string[];
}

export interface NotificationPayload {
  userId?: number;
  role?: string;
  classId?: number;
  subjectId?: number;
  templateId: string;
  variables: Record<string, any>;
  channels?: ('in_app' | 'email' | 'sms' | 'push')[];
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  scheduledAt?: Date;
  expiresAt?: Date;
}

export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isRead: boolean;
  channels: ('in_app' | 'email' | 'sms' | 'push')[];
  data?: any;
  createdAt: Date;
  readAt?: Date;
  expiresAt?: Date;
}

export class NotificationService {
  private emailService: EmailService;
  private templates: Map<string, NotificationTemplate> = new Map();

  constructor() {
    this.emailService = new EmailService();
    this.initializeTemplates();
  }

  private initializeTemplates() {
    // Grade notifications
    this.templates.set('new_grade', {
      id: 'new_grade',
      name: 'New Grade',
      title: 'Điểm mới',
      message: 'Bạn có điểm mới: {{score}}/{{maxScore}} môn {{subjectName}}',
      type: 'info',
      priority: 'medium',
      channels: ['in_app', 'email'],
      variables: ['score', 'maxScore', 'subjectName', 'examType']
    });

    // Attendance notifications
    this.templates.set('absence_alert', {
      id: 'absence_alert',
      name: 'Absence Alert',
      title: 'Thông báo vắng mặt',
      message: 'Bạn đã vắng mặt ngày {{date}}. Lý do: {{reason}}',
      type: 'warning',
      priority: 'high',
      channels: ['in_app', 'email', 'sms'],
      variables: ['date', 'reason']
    });

    // Exam notifications
    this.templates.set('exam_reminder', {
      id: 'exam_reminder',
      name: 'Exam Reminder',
      title: 'Nhắc nhở thi',
      message: 'Bạn có bài thi {{examName}} vào {{date}} lúc {{time}} tại {{room}}',
      type: 'info',
      priority: 'high',
      channels: ['in_app', 'email'],
      variables: ['examName', 'date', 'time', 'room']
    });

    // Assignment notifications
    this.templates.set('new_assignment', {
      id: 'new_assignment',
      name: 'New Assignment',
      title: 'Bài tập mới',
      message: 'Có bài tập mới cho môn {{subjectName}}: {{assignmentTitle}}',
      type: 'info',
      priority: 'medium',
      channels: ['in_app', 'email'],
      variables: ['subjectName', 'assignmentTitle', 'dueDate']
    });

    // System notifications
    this.templates.set('system_maintenance', {
      id: 'system_maintenance',
      name: 'System Maintenance',
      title: 'Bảo trì hệ thống',
      message: 'Hệ thống sẽ bảo trì từ {{startTime}} đến {{endTime}}',
      type: 'warning',
      priority: 'high',
      channels: ['in_app', 'email'],
      variables: ['startTime', 'endTime']
    });

    // Welcome notifications
    this.templates.set('welcome', {
      id: 'welcome',
      name: 'Welcome',
      title: 'Chào mừng',
      message: 'Chào mừng {{userName}} đến với EduManager!',
      type: 'success',
      priority: 'low',
      channels: ['in_app', 'email'],
      variables: ['userName']
    });

    // Invoice notifications
    this.templates.set('invoice_due', {
      id: 'invoice_due',
      name: 'Invoice Due',
      title: 'Học phí đến hạn',
      message: 'Học phí {{invoiceTitle}} {{amount}} VNĐ đến hạn vào {{dueDate}}',
      type: 'warning',
      priority: 'high',
      channels: ['in_app', 'email', 'sms'],
      variables: ['invoiceTitle', 'amount', 'dueDate']
    });

    // Event notifications
    this.templates.set('event_reminder', {
      id: 'event_reminder',
      name: 'Event Reminder',
      title: 'Nhắc nhở sự kiện',
      message: 'Sự kiện {{eventName}} sẽ diễn ra vào {{date}} lúc {{time}}',
      type: 'info',
      priority: 'medium',
      channels: ['in_app', 'email'],
      variables: ['eventName', 'date', 'time']
    });
  }

  // Send notification using template
  async sendNotification(payload: NotificationPayload): Promise<Notification> {
    try {
      const template = this.templates.get(payload.templateId);
      if (!template) {
        throw new Error(`Template ${payload.templateId} not found`);
      }

      // Process variables in template
      const title = this.processTemplate(template.title, payload.variables);
      const message = this.processTemplate(template.message, payload.variables);

      // Determine channels
      const channels = payload.channels || template.channels;

      // Create notification record
      const notification = await prisma.notification.create({
        data: {
          userId: payload.userId,
          title,
          message,
          type: template.type,
          priority: payload.priority || template.priority,
          channels,
          data: payload.variables,
          scheduledAt: payload.scheduledAt,
          expiresAt: payload.expiresAt
        }
      });

      // Send through channels
      await this.sendThroughChannels(notification, channels, payload);

      // Cache notification
      await cacheService.set(`notification:${notification.id}`, notification, { ttl: 3600 });

      // Log audit
      await auditService.logUserAction(
        payload.userId,
        payload.role,
        'CREATE',
        'NOTIFICATION',
        notification.id,
        { templateId: payload.templateId, channels }
      );

      return notification;
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }

  // Send bulk notifications
  async sendBulkNotifications(payloads: NotificationPayload[]): Promise<Notification[]> {
    try {
      const notifications = await Promise.all(
        payloads.map(payload => this.sendNotification(payload))
      );

      return notifications;
    } catch (error) {
      console.error('Error sending bulk notifications:', error);
      throw error;
    }
  }

  // Send notification to role-based users
  async sendNotificationToRole(
    role: string,
    templateId: string,
    variables: Record<string, any>,
    options: {
      excludeUsers?: number[];
      includeInactive?: boolean;
    } = {}
  ): Promise<Notification[]> {
    try {
      const whereClause: any = { role };
      
      if (!options.includeInactive) {
        whereClause.isActive = true;
      }

      if (options.excludeUsers && options.excludeUsers.length > 0) {
        whereClause.id = { notIn: options.excludeUsers };
      }

      const users = await prisma.user.findMany({
        where: whereClause,
        select: { id: true }
      });

      const payloads: NotificationPayload[] = users.map(user => ({
        userId: user.id,
        role,
        templateId,
        variables
      }));

      return await this.sendBulkNotifications(payloads);
    } catch (error) {
      console.error('Error sending notification to role:', error);
      throw error;
    }
  }

  // Send notification to class
  async sendNotificationToClass(
    classId: number,
    templateId: string,
    variables: Record<string, any>,
    options: {
      excludeStudents?: number[];
      includeInactive?: boolean;
    } = {}
  ): Promise<Notification[]> {
    try {
      const whereClause: any = { classId };
      
      if (!options.includeInactive) {
        whereClause.status = 'ACTIVE';
      }

      if (options.excludeStudents && options.excludeStudents.length > 0) {
        whereClause.id = { notIn: options.excludeStudents };
      }

      const students = await prisma.student.findMany({
        where: whereClause,
        select: { userId: true }
      });

      const payloads: NotificationPayload[] = students.map(student => ({
        userId: student.userId,
        templateId,
        variables
      }));

      return await this.sendBulkNotifications(payloads);
    } catch (error) {
      console.error('Error sending notification to class:', error);
      throw error;
    }
  }

  // Send scheduled notification
  async scheduleNotification(payload: NotificationPayload): Promise<Notification> {
    try {
      const scheduledAt = payload.scheduledAt || new Date();
      
      const notification = await this.sendNotification({
        ...payload,
        scheduledAt
      });

      // Add to scheduled notifications queue
      await this.addToScheduledQueue(notification);

      return notification;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      throw error;
    }
  }

  // Get user notifications
  async getUserNotifications(
    userId: number,
    options: {
      page?: number;
      limit?: number;
      unreadOnly?: boolean;
      type?: string;
      priority?: string;
    } = {}
  ): Promise<{
    notifications: Notification[];
    total: number;
    unreadCount: number;
  }> {
    try {
      const {
        page = 1,
        limit = 20,
        unreadOnly = false,
        type,
        priority
      } = options;

      const whereClause: any = { userId };

      if (unreadOnly) {
        whereClause.isRead = false;
      }

      if (type) {
        whereClause.type = type;
      }

      if (priority) {
        whereClause.priority = priority;
      }

      const skip = (page - 1) * limit;

      const [notifications, total, unreadCount] = await Promise.all([
        prisma.notification.findMany({
          where: whereClause,
          orderBy: [
            { priority: 'desc' },
            { createdAt: 'desc' }
          ],
          skip,
          take: limit
        }),
        prisma.notification.count({ where: whereClause }),
        prisma.notification.count({ where: { userId, isRead: false } })
      ]);

      return {
        notifications,
        total,
        unreadCount
      };
    } catch (error) {
      console.error('Error getting user notifications:', error);
      throw error;
    }
  }

  // Mark notification as read
  async markAsRead(notificationId: number, userId: number): Promise<void> {
    try {
      await prisma.notification.updateMany({
        where: {
          id: notificationId,
          userId
        },
        data: {
          isRead: true,
          readAt: new Date()
        }
      });

      // Invalidate cache
      await cacheService.del(`notification:${notificationId}`);

      // Log audit
      await auditService.logUserAction(
        userId,
        'USER',
        'UPDATE',
        'NOTIFICATION',
        notificationId,
        { action: 'mark_as_read' }
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Mark all notifications as read
  async markAllAsRead(userId: number): Promise<number> {
    try {
      const result = await prisma.notification.updateMany({
        where: {
          userId,
          isRead: false
        },
        data: {
          isRead: true,
          readAt: new Date()
        }
      });

      // Invalidate user notification cache
      await cacheService.clear(`notifications:user:${userId}`);

      // Log audit
      await auditService.logUserAction(
        userId,
        'USER',
        'UPDATE',
        'NOTIFICATION',
        undefined,
        { action: 'mark_all_as_read', count: result.count }
      );

      return result.count;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  // Delete notification
  async deleteNotification(notificationId: number, userId: number): Promise<void> {
    try {
      await prisma.notification.delete({
        where: {
          id: notificationId,
          userId
        }
      });

      // Invalidate cache
      await cacheService.del(`notification:${notificationId}`);

      // Log audit
      await auditService.logUserAction(
        userId,
        'USER',
        'DELETE',
        'NOTIFICATION',
        notificationId
      );
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  // Get notification statistics
  async getNotificationStatistics(userId?: number): Promise<{
    total: number;
    unread: number;
    byType: Record<string, number>;
    byPriority: Record<string, number>;
    byChannel: Record<string, number>;
  }> {
    try {
      const whereClause = userId ? { userId } : {};

      const [total, unread, typeStats, priorityStats, channelStats] = await Promise.all([
        prisma.notification.count({ where: whereClause }),
        prisma.notification.count({ where: { ...whereClause, isRead: false } }),
        prisma.notification.groupBy({
          by: ['type'],
          where: whereClause,
          _count: true
        }),
        prisma.notification.groupBy({
          by: ['priority'],
          where: whereClause,
          _count: true
        }),
        prisma.$queryRaw`
          SELECT 
            json_extract(channels, '$') as channel,
            COUNT(*) as count
          FROM notifications 
          ${userId ? `WHERE userId = ${userId}` : ''}
          GROUP BY channels
        `
      ]);

      const byType = typeStats.reduce((acc, stat) => {
        acc[stat.type] = stat._count;
        return acc;
      }, {} as Record<string, number>);

      const byPriority = priorityStats.reduce((acc, stat) => {
        acc[stat.priority] = stat._count;
        return acc;
      }, {} as Record<string, number>);

      const byChannel = channelStats.reduce((acc, stat: any) => {
        const channel = JSON.parse(stat.channel);
        if (Array.isArray(channel)) {
          channel.forEach(ch => {
            acc[ch] = (acc[ch] || 0) + stat.count;
          });
        }
        return acc;
      }, {} as Record<string, number>);

      return {
        total,
        unread,
        byType,
        byPriority,
        byChannel
      };
    } catch (error) {
      console.error('Error getting notification statistics:', error);
      throw error;
    }
  }

  // Get notification templates
  getTemplates(): NotificationTemplate[] {
    return Array.from(this.templates.values());
  }

  // Create custom notification template
  createTemplate(template: Omit<NotificationTemplate, 'id'>): NotificationTemplate {
    const id = template.name.toLowerCase().replace(/\s+/g, '_');
    const newTemplate: NotificationTemplate = {
      ...template,
      id
    };

    this.templates.set(id, newTemplate);
    return newTemplate;
  }

  // Update notification template
  updateTemplate(id: string, updates: Partial<NotificationTemplate>): NotificationTemplate | null {
    const existingTemplate = this.templates.get(id);
    if (!existingTemplate) {
      return null;
    }

    const updatedTemplate = { ...existingTemplate, ...updates };
    this.templates.set(id, updatedTemplate);
    return updatedTemplate;
  }

  // Delete notification template
  deleteTemplate(id: string): boolean {
    return this.templates.delete(id);
  }

  // Process template variables
  private processTemplate(template: string, variables: Record<string, any>): string {
    let processed = template;

    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      processed = processed.replace(regex, String(value));
    }

    return processed;
  }

  // Send notification through channels
  private async sendThroughChannels(
    notification: Notification,
    channels: ('in_app' | 'email' | 'sms' | 'push')[],
    payload: NotificationPayload
  ): Promise<void> {
    const promises: Promise<void>[] = [];

    for (const channel of channels) {
      switch (channel) {
        case 'in_app':
          // In-app notification is already stored in database
          // Real-time delivery will be handled by WebSocket service
          break;
          
        case 'email':
          if (payload.userId) {
            const user = await prisma.user.findUnique({
              where: { id: payload.userId },
              select: { email: true, fullName: true }
            });

            if (user) {
              promises.push(
                this.emailService.sendEmail({
                  to: user.email,
                  subject: notification.title,
                  html: `
                    <h2>${notification.title}</h2>
                    <p>${notification.message}</p>
                    <p><small>Gửi từ EduManager lúc ${notification.createdAt.toLocaleString('vi-VN')}</small></p>
                  `
                })
              );
            }
          }
          break;
          
        case 'sms':
          // SMS implementation would go here
          // This would integrate with an SMS service provider
          break;
          
        case 'push':
          // Push notification implementation would go here
          // This would integrate with Firebase Cloud Messaging or similar
          break;
      }
    }

    await Promise.all(promises);
  }

  // Add to scheduled notifications queue
  private async addToScheduledQueue(notification: Notification): Promise<void> {
    // This would integrate with a job queue system like Bull
    // For now, we'll just log it
    console.log(`Scheduled notification: ${notification.id} for ${notification.scheduledAt}`);
  }

  // Process scheduled notifications
  async processScheduledNotifications(): Promise<number> {
    try {
      const now = new Date();
      
      const notifications = await prisma.notification.findMany({
        where: {
          scheduledAt: {
            lte: now
          },
          isRead: false
        }
      });

      for (const notification of notifications) {
        // Check if notification has expired
        if (notification.expiresAt && notification.expiresAt < now) {
          await prisma.notification.delete({
            where: { id: notification.id }
          });
          continue;
        }

        // Send notification now
        await this.sendThroughChannels(
          notification,
          notification.channels,
          { templateId: 'custom', variables: notification.data || {} }
        );

        // Update scheduledAt to null
        await prisma.notification.update({
          where: { id: notification.id },
          data: { scheduledAt: null }
        });
      }

      return notifications.length;
    } catch (error) {
      console.error('Error processing scheduled notifications:', error);
      throw error;
    }
  }

  // Cleanup expired notifications
  async cleanupExpiredNotifications(): Promise<number> {
    try {
      const now = new Date();
      
      const result = await prisma.notification.deleteMany({
        where: {
          expiresAt: {
            lt: now
          }
        }
      });

      return result.count;
    } catch (error) {
      console.error('Error cleaning up expired notifications:', error);
      throw error;
    }
  }

  // Get notification trends
  async getNotificationTrends(days: number = 30): Promise<{
    daily: Array<{ date: string; count: number }>;
    byType: Array<{ type: string; count: number }>;
    byPriority: Array<{ priority: string; count: number }>;
  }> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const [dailyStats, typeStats, priorityStats] = await Promise.all([
        prisma.$queryRaw`
          SELECT 
            DATE(createdAt) as date,
            COUNT(*) as count
          FROM notifications
          WHERE createdAt >= ${startDate.toISOString()}
          GROUP BY DATE(createdAt)
          ORDER BY date DESC
        `,
        prisma.notification.groupBy({
          by: ['type'],
          where: {
            createdAt: {
              gte: startDate
            }
          },
          _count: true
        }),
        prisma.notification.groupBy({
          by: ['priority'],
          where: {
            createdAt: {
              gte: startDate
            }
          },
          _count: true
        })
      ]);

      return {
        daily: dailyStats,
        byType: typeStats.map(stat => ({
          type: stat.type,
          count: stat._count
        })),
        byPriority: priorityStats.map(stat => ({
          priority: stat.priority,
          count: stat._count
        }))
      };
    } catch (error) {
      console.error('Error getting notification trends:', error);
      throw error;
    }
  }
}

export { NotificationService };
