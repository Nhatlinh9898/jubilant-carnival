import { prisma } from '@/index';

export enum AuditAction {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  EXPORT = 'EXPORT',
  IMPORT = 'IMPORT',
  PRINT = 'PRINT',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  SEND_EMAIL = 'SEND_EMAIL',
  FILE_UPLOAD = 'FILE_UPLOAD',
  FILE_DOWNLOAD = 'FILE_DOWNLOAD',
  SYSTEM_CONFIG = 'SYSTEM_CONFIG',
  SECURITY_ALERT = 'SECURITY_ALERT',
  ERROR = 'ERROR'
}

export enum AuditResource {
  USER = 'USER',
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
  CLASS = 'CLASS',
  SUBJECT = 'SUBJECT',
  GRADE = 'GRADE',
  ATTENDANCE = 'ATTENDANCE',
  SCHEDULE = 'SCHEDULE',
  INVOICE = 'INVOICE',
  LIBRARY_BOOK = 'LIBRARY_BOOK',
  EVENT = 'EVENT',
  EXAM = 'EXAM',
  NOTIFICATION = 'NOTIFICATION',
  REPORT = 'REPORT',
  SYSTEM = 'SYSTEM'
}

export enum AuditLevel {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL'
}

interface AuditLog {
  id: number;
  userId?: number;
  userRole?: string;
  action: AuditAction;
  resource: AuditResource;
  resourceId?: number;
  resourceType?: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
  level: AuditLevel;
  timestamp: Date;
  sessionId?: string;
  success?: boolean;
  errorMessage?: string;
}

export class AuditService {
  private static instance: AuditService;

  private constructor() {}

  static getInstance(): AuditService {
    if (!AuditService.instance) {
      AuditService.instance = new AuditService();
    }
    return AuditService.instance;
  }

  // Log audit event
  async log(data: {
    userId?: number;
    userRole?: string;
    action: AuditAction;
    resource: AuditResource;
    resourceId?: number;
    resourceType?: string;
    details?: any;
    ipAddress?: string;
    userAgent?: string;
    level?: AuditLevel;
    sessionId?: string;
    success?: boolean;
    errorMessage?: string;
  }): Promise<void> {
    try {
      // Store in database
      await prisma.auditLog.create({
        data: {
          userId: data.userId,
          userRole: data.userRole,
          action: data.action,
          resource: data.resource,
          resourceId: data.resourceId,
          resourceType: data.resourceType,
          details: data.details ? JSON.stringify(data.details) : null,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          level: data.level || AuditLevel.INFO,
          sessionId: data.sessionId,
          success: data.success !== undefined ? data.success : true,
          errorMessage: data.errorMessage
        }
      });

      // Log to console for critical events
      if (data.level === AuditLevel.CRITICAL || data.level === AuditLevel.ERROR) {
        console.error(`[AUDIT] ${data.level}: ${data.action} on ${data.resource}`, {
          userId: data.userId,
          resourceId: data.resourceId,
          errorMessage: data.errorMessage,
          timestamp: new Date()
        });
      }

      // Send alerts for security events
      if (data.action === AuditAction.SECURITY_ALERT) {
        await this.sendSecurityAlert(data);
      }

    } catch (error) {
      console.error('Failed to log audit event:', error);
      // Don't throw error to avoid breaking the main flow
    }
  }

  // Log user action
  async logUserAction(
    userId: number,
    userRole: string,
    action: AuditAction,
    resource: AuditResource,
    resourceId?: number,
    details?: any,
    req?: any
  ): Promise<void> {
    await this.log({
      userId,
      userRole,
      action,
      resource,
      resourceId,
      resourceType: this.getResourceType(resource),
      details,
      ipAddress: req?.ip,
      userAgent: req?.get('user-agent'),
      sessionId: req?.session?.id,
      success: true
    });
  }

  // Log system event
  async logSystemEvent(
    action: AuditAction,
    resource: AuditResource,
    details?: any,
    level: AuditLevel = AuditLevel.INFO
  ): Promise<void> {
    await this.log({
      action,
      resource,
      details,
      level,
      success: true
    });
  }

  // Log error event
  async logError(
    action: AuditAction,
    resource: AuditResource,
    errorMessage: string,
    details?: any,
    userId?: number,
    userRole?: string
  ): Promise<void> {
    await this.log({
      userId,
      userRole,
      action,
      resource,
      details,
      errorMessage,
      level: AuditLevel.ERROR,
      success: false
    });
  }

  // Log security event
  async logSecurityEvent(
    action: AuditAction,
    resource: AuditResource,
    details: any,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      action,
      resource,
      details,
      ipAddress,
      userAgent,
      level: AuditLevel.CRITICAL,
      success: false
    });
  }

  // Get audit logs with filtering
  async getAuditLogs(filters: {
    userId?: number;
    action?: AuditAction;
    resource?: AuditResource;
    resourceId?: number;
    level?: AuditLevel;
    dateFrom?: Date;
    dateTo?: Date;
    page?: number;
    limit?: number;
  } = {}): Promise<{ logs: AuditLog[]; total: number; page: number; totalPages: number }> {
    const {
      userId,
      action,
      resource,
      resourceId,
      level,
      dateFrom,
      dateTo,
      page = 1,
      limit = 50
    } = filters;

    const where: any = {};

    if (userId) where.userId = userId;
    if (action) where.action = action;
    if (resource) where.resource = resource;
    if (resourceId) where.resourceId = resourceId;
    if (level) where.level = level;

    if (dateFrom || dateTo) {
      where.timestamp = {};
      if (dateFrom) where.timestamp.gte = dateFrom;
      if (dateTo) where.timestamp.lte = dateTo;
    }

    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        skip,
        take: limit
      }),
      prisma.auditLog.count({ where })
    ]);

    return {
      logs: logs.map(log => ({
        ...log,
        details: log.details ? JSON.parse(log.details) : null
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  // Get audit statistics
  async getAuditStats(filters: {
    dateFrom?: Date;
    dateTo?: Date;
  } = {}): Promise<any> {
    const { dateFrom, dateTo } = filters;

    const where: any = {};
    if (dateFrom || dateTo) {
      where.timestamp = {};
      if (dateFrom) where.timestamp.gte = dateFrom;
      if (dateTo) where.timestamp.lte = dateTo;
    }

    const [
      totalLogs,
      actionStats,
      resourceStats,
      levelStats,
      userStats,
      errorRate
    ] = await Promise.all([
      prisma.auditLog.count({ where }),
      
      prisma.auditLog.groupBy({
        by: ['action'],
        where,
        _count: true
      }),
      
      prisma.auditLog.groupBy({
        by: ['resource'],
        where,
        _count: true
      }),
      
      prisma.auditLog.groupBy({
        by: ['level'],
        where,
        _count: true
      }),
      
      prisma.auditLog.groupBy({
        by: ['userId'],
        where,
        _count: true,
        orderBy: {
          _count: 'desc'
        },
        take: 10
      }),
      
      prisma.auditLog.groupBy({
        by: ['success'],
        where,
        _count: true
      })
    ]);

    return {
      totalLogs,
      actions: actionStats.map(item => ({
        action: item.action,
        count: item._count
      })),
      resources: resourceStats.map(item => ({
        resource: item.resource,
        count: item._count
      })),
      levels: levelStats.map(item => ({
        level: item.level,
        count: item._count
      })),
      topUsers: userStats.map(item => ({
        userId: item.userId,
        count: item._count
      })),
      errorRate: errorRate.length > 0 
        ? (errorRate.find(item => !item.success)?._count || 0) / totalLogs * 100 
        : 0
    };
  }

  // Export audit logs
  async exportAuditLogs(filters: {
    dateFrom?: Date;
    dateTo?: Date;
    format?: 'csv' | 'json';
  } = {}): Promise<string> {
    const { dateFrom, dateTo, format = 'csv' } = filters;

    const logs = await this.getAuditLogs({
      dateFrom,
      dateTo,
      limit: 10000 // Limit for export
    });

    if (format === 'json') {
      return JSON.stringify(logs, null, 2);
    }

    // CSV export
    const headers = [
      'Timestamp',
      'User ID',
      'User Role',
      'Action',
      'Resource',
      'Resource ID',
      'IP Address',
      'User Agent',
      'Level',
      'Success',
      'Error Message',
      'Details'
    ];

    const csvRows = logs.logs.map(log => [
      log.timestamp.toISOString(),
      log.userId || '',
      log.userRole || '',
      log.action,
      log.resource,
      log.resourceId || '',
      log.ipAddress || '',
      log.userAgent || '',
      log.level,
      log.success,
      log.errorMessage || '',
      JSON.stringify(log.details || {})
    ]);

    return [headers.join(','), ...csvRows.map(row => row.join(','))].join('\n');
  }

  // Clean up old audit logs
  async cleanupOldLogs(daysToKeep: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await prisma.auditLog.deleteMany({
      where: {
        timestamp: {
          lt: cutoffDate
        }
      }
    });

    console.log(`Cleaned up ${result.count} old audit logs`);
    return result.count;
  }

  // Generate audit report
  async generateAuditReport(filters: {
    dateFrom?: Date;
    dateTo?: Date;
    userId?: number;
  } = {}): Promise<any> {
    const stats = await this.getAuditStats(filters);
    const logs = await this.getAuditLogs({
      ...filters,
      limit: 100
    });

    return {
      period: {
        from: filters.dateFrom,
        to: filters.dateTo
      },
      summary: stats,
      recentActivity: logs.logs.slice(0, 20),
      recommendations: this.generateRecommendations(stats)
    };
  }

  // Get resource type string
  private getResourceType(resource: AuditResource): string {
    const resourceTypes = {
      [AuditResource.USER]: 'User',
      [AuditResource.STUDENT]: 'Student',
      [AuditResource.TEACHER]: 'Teacher',
      [AuditResource.CLASS]: 'Class',
      [AuditResource.SUBJECT]: 'Subject',
      [AuditResource.GRADE]: 'Grade',
      [AuditResource.ATTENDANCE]: 'Attendance',
      [AuditResource.SCHEDULE]: 'Schedule',
      [AuditResource.INVOICE]: 'Invoice',
      [AuditResource.LIBRARY_BOOK]: 'Library Book',
      [AuditResource.EVENT]: 'Event',
      [AuditResource.EXAM]: 'Exam',
      [AuditResource.NOTIFICATION]: 'Notification',
      [AuditResource.REPORT]: 'Report',
      [AuditResource.SYSTEM]: 'System'
    };

    return resourceTypes[resource] || resource;
  }

  // Send security alert
  private async sendSecurityAlert(data: any): Promise<void> {
    try {
      // Get admin users
      const admins = await prisma.user.findMany({
        where: { role: 'ADMIN', isActive: true },
        select: { id: true, email: true, fullName: true }
      });

      // Send notifications to admins
      for (const admin of admins) {
        await prisma.notification.create({
          data: {
            userId: admin.id,
            title: '🚨 Security Alert',
            message: `Security event detected: ${data.action} on ${data.resource}`,
            isRead: false
          }
        });

        // Here you could also send email alerts
        console.log(`Security alert sent to admin ${admin.fullName}:`, data);
      }
    } catch (error) {
      console.error('Failed to send security alert:', error);
    }
  }

  // Generate recommendations based on audit stats
  private generateRecommendations(stats: any): string[] {
    const recommendations: string[] = [];

    // Check error rate
    if (stats.errorRate > 5) {
      recommendations.push('High error rate detected. Consider reviewing system logs and fixing recurring issues.');
    }

    // Check for unusual activity patterns
    const criticalEvents = stats.levels.find((level: any) => level.level === 'CRITICAL');
    if (criticalEvents && criticalEvents.count > 0) {
      recommendations.push('Critical security events detected. Immediate investigation required.');
    }

    // Check for failed login attempts
    const failedLogins = stats.actions.find((action: any) => action.action === 'LOGIN');
    if (failedLogins) {
      recommendations.push('Monitor failed login attempts for potential security threats.');
    }

    // Check for data export activities
    const exports = stats.actions.find((action: any) => action.action === 'EXPORT');
    if (exports && exports.count > 100) {
      recommendations.push('High volume of data exports detected. Review data access policies.');
    }

    return recommendations;
  }
}

// Create singleton instance
export const auditService = AuditService.getInstance();

// Middleware for automatic audit logging
export const auditMiddleware = (action: AuditAction, resource: AuditResource) => {
  return async (req: any, res: any, next: any) => {
    const startTime = Date.now();
    
    // Store original res.json to intercept response
    const originalJson = res.json;
    
    res.json = function(data: any) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Log the request
      auditService.logUserAction(
        req.user?.id,
        req.user?.role,
        action,
        resource,
        req.params.id || req.body?.id,
        {
          method: req.method,
          url: req.originalUrl,
          statusCode: res.statusCode,
          duration,
          requestBody: req.method !== 'GET' ? req.body : undefined,
          responseData: res.statusCode < 400 ? data : undefined
        },
        req
      );
      
      return originalJson.call(this, data);
    };
    
    next();
  };
};

export { AuditService, auditService, AuditAction, AuditResource, AuditLevel };
