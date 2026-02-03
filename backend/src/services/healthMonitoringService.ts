import { prisma } from '@/index';
import { cacheService } from './cacheService';
import { auditService } from './auditService';
import { EmailService } from './emailService';
import { NotificationService } from './notificationService';

export interface HealthCheck {
  name: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  message?: string;
  responseTime?: number;
  lastChecked: Date;
  details?: any;
}

export interface SystemMetrics {
  timestamp: Date;
  cpu: {
    usage: number;
    loadAverage: number[];
  };
  memory: {
    total: number;
    used: number;
    free: number;
    usage: number;
  };
  disk: {
    total: number;
    used: number;
    free: number;
    usage: number;
  };
  network: {
    bytesIn: number;
    bytesOut: number;
    packetsIn: number;
    packetsOut: number;
  };
  database: {
    connections: number;
    queriesPerSecond: number;
    responseTime: number;
  };
  cache: {
    hitRate: number;
    memoryUsage: number;
    keys: number;
  };
}

export interface Alert {
  id: string;
  type: 'error' | 'warning' | 'info';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  source: string;
  timestamp: Date;
  resolved?: boolean;
  resolvedAt?: Date;
  metadata?: any;
}

export interface HealthThresholds {
  cpu: { warning: number; critical: number };
  memory: { warning: number; critical: number };
  disk: { warning: number; critical: number };
  database: { responseTime: number; connections: number };
  cache: { hitRate: number; memoryUsage: number };
}

export class HealthMonitoringService {
  private emailService: EmailService;
  private notificationService: NotificationService;
  private healthChecks: Map<string, HealthCheck> = new Map();
  private alerts: Alert[] = [];
  private metrics: SystemMetrics[] = [];
  private thresholds: HealthThresholds;
  private monitoringInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.emailService = new EmailService();
    this.notificationService = new NotificationService();
    this.thresholds = {
      cpu: { warning: 70, critical: 90 },
      memory: { warning: 80, critical: 95 },
      disk: { warning: 85, critical: 95 },
      database: { responseTime: 1000, connections: 100 },
      cache: { hitRate: 80, memoryUsage: 90 }
    };
  }

  // Start monitoring
  startMonitoring(intervalMs: number = 30000): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    this.monitoringInterval = setInterval(async () => {
      await this.performHealthChecks();
      await this.collectMetrics();
      await this.checkThresholds();
    }, intervalMs);

    console.log('Health monitoring started');
  }

  // Stop monitoring
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    console.log('Health monitoring stopped');
  }

  // Perform health checks
  async performHealthChecks(): Promise<void> {
    const checks = [
      this.checkDatabase(),
      this.checkCache(),
      this.checkEmailService(),
      this.checkFileStorage(),
      this.checkExternalAPIs()
    ];

    const results = await Promise.allSettled(checks);
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        this.healthChecks.set(result.value.name, result.value);
      } else {
        console.error(`Health check ${index} failed:`, result.reason);
      }
    });
  }

  // Check database health
  private async checkDatabase(): Promise<HealthCheck> {
    const startTime = Date.now();
    
    try {
      await prisma.$queryRaw`SELECT 1`;
      const responseTime = Date.now() - startTime;

      // Get connection info
      const connectionInfo = await prisma.$queryRaw`
        SELECT 
          count(*) as connections,
          sum(CASE WHEN state = 'active' THEN 1 ELSE 0 END) as active_connections
        FROM pg_stat_activity 
        WHERE datname = current_database()
      ` as any[];

      return {
        name: 'database',
        status: 'healthy',
        responseTime,
        lastChecked: new Date(),
        details: {
          connections: connectionInfo[0]?.connections || 0,
          activeConnections: connectionInfo[0]?.active_connections || 0
        }
      };
    } catch (error) {
      return {
        name: 'database',
        status: 'unhealthy',
        message: error.message,
        responseTime: Date.now() - startTime,
        lastChecked: new Date()
      };
    }
  }

  // Check cache health
  private async checkCache(): Promise<HealthCheck> {
    const startTime = Date.now();
    
    try {
      await cacheService.healthCheck();
      const responseTime = Date.now() - startTime;

      // Get cache stats
      const stats = await this.getCacheStats();

      return {
        name: 'cache',
        status: stats.hitRate >= this.thresholds.cache.hitRate ? 'healthy' : 'degraded',
        responseTime,
        lastChecked: new Date(),
        details: stats
      };
    } catch (error) {
      return {
        name: 'cache',
        status: 'unhealthy',
        message: error.message,
        responseTime: Date.now() - startTime,
        lastChecked: new Date()
      };
    }
  }

  // Check email service health
  private async checkEmailService(): Promise<HealthCheck> {
    const startTime = Date.now();
    
    try {
      await this.emailService.verifyConnection();
      const responseTime = Date.now() - startTime;

      return {
        name: 'email',
        status: 'healthy',
        responseTime,
        lastChecked: new Date()
      };
    } catch (error) {
      return {
        name: 'email',
        status: 'unhealthy',
        message: error.message,
        responseTime: Date.now() - startTime,
        lastChecked: new Date()
      };
    }
  }

  // Check file storage health
  private async checkFileStorage(): Promise<HealthCheck> {
    const startTime = Date.now();
    
    try {
      // This would check AWS S3 or other file storage
      const responseTime = Date.now() - startTime;

      return {
        name: 'file_storage',
        status: 'healthy',
        responseTime,
        lastChecked: new Date(),
        details: {
          storage: 'AWS S3',
          region: process.env.AWS_REGION || 'us-east-1'
        }
      };
    } catch (error) {
      return {
        name: 'file_storage',
        status: 'unhealthy',
        message: error.message,
        responseTime: Date.now() - startTime,
        lastChecked: new Date()
      };
    }
  }

  // Check external APIs
  private async checkExternalAPIs(): Promise<HealthCheck> {
    const startTime = Date.now();
    
    try {
      // This would check external dependencies
      const responseTime = Date.now() - startTime;

      return {
        name: 'external_apis',
        status: 'healthy',
        responseTime,
        lastChecked: new Date(),
        details: {
          apis: ['payment_gateway', 'sms_service', 'push_notifications']
        }
      };
    } catch (error) {
      return {
        name: 'external_apis',
        status: 'unhealthy',
        message: error.message,
        responseTime: Date.now() - startTime,
        lastChecked: new Date()
      };
    }
  }

  // Collect system metrics
  async collectMetrics(): Promise<void> {
    try {
      const metrics: SystemMetrics = {
        timestamp: new Date(),
        cpu: await this.getCPUMetrics(),
        memory: await this.getMemoryMetrics(),
        disk: await this.getDiskMetrics(),
        network: await this.getNetworkMetrics(),
        database: await this.getDatabaseMetrics(),
        cache: await this.getCacheStats()
      };

      this.metrics.push(metrics);

      // Keep only last 1000 metrics
      if (this.metrics.length > 1000) {
        this.metrics = this.metrics.slice(-1000);
      }
    } catch (error) {
      console.error('Error collecting metrics:', error);
    }
  }

  // Get CPU metrics
  private async getCPUMetrics(): Promise<{ usage: number; loadAverage: number[] }> {
    try {
      // In production, this would use system monitoring libraries
      return {
        usage: Math.random() * 100, // Simulated
        loadAverage: [0.5, 0.7, 0.9] // Simulated
      };
    } catch (error) {
      return { usage: 0, loadAverage: [0, 0, 0] };
    }
  }

  // Get memory metrics
  private async getMemoryMetrics(): Promise<{ total: number; used: number; free: number; usage: number }> {
    try {
      // In production, this would use system monitoring libraries
      const total = 8 * 1024 * 1024 * 1024; // 8GB
      const used = total * 0.6; // 60% used
      const free = total - used;

      return {
        total,
        used,
        free,
        usage: (used / total) * 100
      };
    } catch (error) {
      return { total: 0, used: 0, free: 0, usage: 0 };
    }
  }

  // Get disk metrics
  private async getDiskMetrics(): Promise<{ total: number; used: number; free: number; usage: number }> {
    try {
      // In production, this would use system monitoring libraries
      const total = 100 * 1024 * 1024 * 1024; // 100GB
      const used = total * 0.4; // 40% used
      const free = total - used;

      return {
        total,
        used,
        free,
        usage: (used / total) * 100
      };
    } catch (error) {
      return { total: 0, used: 0, free: 0, usage: 0 };
    }
  }

  // Get network metrics
  private async getNetworkMetrics(): Promise<{ bytesIn: number; bytesOut: number; packetsIn: number; packetsOut: number }> {
    try {
      // In production, this would use system monitoring libraries
      return {
        bytesIn: Math.random() * 1000000,
        bytesOut: Math.random() * 1000000,
        packetsIn: Math.random() * 10000,
        packetsOut: Math.random() * 10000
      };
    } catch (error) {
      return { bytesIn: 0, bytesOut: 0, packetsIn: 0, packetsOut: 0 };
    }
  }

  // Get database metrics
  private async getDatabaseMetrics(): Promise<{ connections: number; queriesPerSecond: number; responseTime: number }> {
    try {
      const dbCheck = this.healthChecks.get('database');
      return {
        connections: dbCheck?.details?.connections || 0,
        queriesPerSecond: Math.random() * 100, // Simulated
        responseTime: dbCheck?.responseTime || 0
      };
    } catch (error) {
      return { connections: 0, queriesPerSecond: 0, responseTime: 0 };
    }
  }

  // Get cache statistics
  private async getCacheStats(): Promise<{ hitRate: number; memoryUsage: number; keys: number }> {
    try {
      // In production, this would get actual Redis stats
      return {
        hitRate: 85 + Math.random() * 10, // 85-95%
        memoryUsage: 60 + Math.random() * 20, // 60-80%
        keys: Math.floor(Math.random() * 10000)
      };
    } catch (error) {
      return { hitRate: 0, memoryUsage: 0, keys: 0 };
    }
  }

  // Check thresholds and create alerts
  private async checkThresholds(): Promise<void> {
    if (this.metrics.length === 0) return;

    const latestMetrics = this.metrics[this.metrics.length - 1];

    // Check CPU
    if (latestMetrics.cpu.usage > this.thresholds.cpu.critical) {
      await this.createAlert({
        type: 'error',
        severity: 'critical',
        title: 'CPU Usage Critical',
        message: `CPU usage is ${latestMetrics.cpu.usage.toFixed(2)}%`,
        source: 'system',
        metadata: { usage: latestMetrics.cpu.usage }
      });
    } else if (latestMetrics.cpu.usage > this.thresholds.cpu.warning) {
      await this.createAlert({
        type: 'warning',
        severity: 'medium',
        title: 'CPU Usage High',
        message: `CPU usage is ${latestMetrics.cpu.usage.toFixed(2)}%`,
        source: 'system',
        metadata: { usage: latestMetrics.cpu.usage }
      });
    }

    // Check Memory
    if (latestMetrics.memory.usage > this.thresholds.memory.critical) {
      await this.createAlert({
        type: 'error',
        severity: 'critical',
        title: 'Memory Usage Critical',
        message: `Memory usage is ${latestMetrics.memory.usage.toFixed(2)}%`,
        source: 'system',
        metadata: { usage: latestMetrics.memory.usage }
      });
    } else if (latestMetrics.memory.usage > this.thresholds.memory.warning) {
      await this.createAlert({
        type: 'warning',
        severity: 'medium',
        title: 'Memory Usage High',
        message: `Memory usage is ${latestMetrics.memory.usage.toFixed(2)}%`,
        source: 'system',
        metadata: { usage: latestMetrics.memory.usage }
      });
    }

    // Check Disk
    if (latestMetrics.disk.usage > this.thresholds.disk.critical) {
      await this.createAlert({
        type: 'error',
        severity: 'critical',
        title: 'Disk Usage Critical',
        message: `Disk usage is ${latestMetrics.disk.usage.toFixed(2)}%`,
        source: 'system',
        metadata: { usage: latestMetrics.disk.usage }
      });
    } else if (latestMetrics.disk.usage > this.thresholds.disk.warning) {
      await this.createAlert({
        type: 'warning',
        severity: 'medium',
        title: 'Disk Usage High',
        message: `Disk usage is ${latestMetrics.disk.usage.toFixed(2)}%`,
        source: 'system',
        metadata: { usage: latestMetrics.disk.usage }
      });
    }

    // Check Database
    if (latestMetrics.database.responseTime > this.thresholds.database.responseTime) {
      await this.createAlert({
        type: 'warning',
        severity: 'medium',
        title: 'Database Response Time High',
        message: `Database response time is ${latestMetrics.database.responseTime}ms`,
        source: 'database',
        metadata: { responseTime: latestMetrics.database.responseTime }
      });
    }

    if (latestMetrics.database.connections > this.thresholds.database.connections) {
      await this.createAlert({
        type: 'warning',
        severity: 'medium',
        title: 'Database Connections High',
        message: `Database connections: ${latestMetrics.database.connections}`,
        source: 'database',
        metadata: { connections: latestMetrics.database.connections }
      });
    }

    // Check Cache
    if (latestMetrics.cache.hitRate < this.thresholds.cache.hitRate) {
      await this.createAlert({
        type: 'warning',
        severity: 'low',
        title: 'Cache Hit Rate Low',
        message: `Cache hit rate is ${latestMetrics.cache.hitRate.toFixed(2)}%`,
        source: 'cache',
        metadata: { hitRate: latestMetrics.cache.hitRate }
      });
    }
  }

  // Create alert
  private async createAlert(alertData: Omit<Alert, 'id' | 'timestamp'>): Promise<void> {
    const alert: Alert = {
      id: this.generateAlertId(),
      timestamp: new Date(),
      ...alertData
    };

    this.alerts.push(alert);

    // Keep only last 1000 alerts
    if (this.alerts.length > 1000) {
      this.alerts = this.alerts.slice(-1000);
    }

    // Send notifications for critical alerts
    if (alert.severity === 'critical') {
      await this.sendCriticalAlert(alert);
    }

    // Log audit
    await auditService.logUserAction(
      0, // System action
      'SYSTEM',
      'ALERT',
      'HEALTH',
      alert.id,
      alert
    );
  }

  // Send critical alert
  private async sendCriticalAlert(alert: Alert): Promise<void> {
    try {
      // Send email to admins
      await this.emailService.sendEmail({
        to: ['admin@edumanager.vn'],
        subject: `🚨 Critical Alert: ${alert.title}`,
        html: `
          <h2>Critical System Alert</h2>
          <p><strong>Title:</strong> ${alert.title}</p>
          <p><strong>Message:</strong> ${alert.message}</p>
          <p><strong>Source:</strong> ${alert.source}</p>
          <p><strong>Time:</strong> ${alert.timestamp.toLocaleString()}</p>
          <p><strong>Severity:</strong> ${alert.severity.toUpperCase()}</p>
          
          <p>Please check the system immediately.</p>
        `
      });

      // Send notification
      await this.notificationService.sendNotificationToRole(
        'admin',
        'system_alert',
        {
          title: alert.title,
          message: alert.message,
          severity: alert.severity
        }
      );
    } catch (error) {
      console.error('Error sending critical alert:', error);
    }
  }

  // Get current health status
  getHealthStatus(): {
    overall: 'healthy' | 'unhealthy' | 'degraded';
    checks: HealthCheck[];
    alerts: Alert[];
    metrics?: SystemMetrics;
  } {
    const checks = Array.from(this.healthChecks.values());
    const activeAlerts = this.alerts.filter(a => !a.resolved);
    const latestMetrics = this.metrics.length > 0 ? this.metrics[this.metrics.length - 1] : undefined;

    // Determine overall status
    let overall: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';
    
    const unhealthyChecks = checks.filter(c => c.status === 'unhealthy');
    const degradedChecks = checks.filter(c => c.status === 'degraded');
    const criticalAlerts = activeAlerts.filter(a => a.severity === 'critical');

    if (unhealthyChecks.length > 0 || criticalAlerts.length > 0) {
      overall = 'unhealthy';
    } else if (degradedChecks.length > 0 || activeAlerts.length > 0) {
      overall = 'degraded';
    }

    return {
      overall,
      checks,
      alerts: activeAlerts,
      metrics: latestMetrics
    };
  }

  // Get metrics history
  getMetricsHistory(hours: number = 24): SystemMetrics[] {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.metrics.filter(m => m.timestamp >= cutoff);
  }

  // Get alerts
  getAlerts(options: {
    type?: 'error' | 'warning' | 'info';
    severity?: 'low' | 'medium' | 'high' | 'critical';
    resolved?: boolean;
    limit?: number;
  } = {}): Alert[] {
    let filtered = this.alerts;

    if (options.type) {
      filtered = filtered.filter(a => a.type === options.type);
    }

    if (options.severity) {
      filtered = filtered.filter(a => a.severity === options.severity);
    }

    if (options.resolved !== undefined) {
      filtered = filtered.filter(a => a.resolved === options.resolved);
    }

    return filtered
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, options.limit || 100);
  }

  // Resolve alert
  async resolveAlert(alertId: string): Promise<boolean> {
    const alert = this.alerts.find(a => a.id === alertId);
    if (!alert) {
      return false;
    }

    alert.resolved = true;
    alert.resolvedAt = new Date();

    // Log audit
    await auditService.logUserAction(
      1, // This would be the user ID
      'USER',
      'RESOLVE',
      'ALERT',
      alertId
    );

    return true;
  }

  // Update thresholds
  updateThresholds(newThresholds: Partial<HealthThresholds>): void {
    this.thresholds = { ...this.thresholds, ...newThresholds };
  }

  // Get thresholds
  getThresholds(): HealthThresholds {
    return { ...this.thresholds };
  }

  // Generate health report
  async generateHealthReport(): Promise<{
    summary: any;
    checks: HealthCheck[];
    alerts: Alert[];
    metrics: SystemMetrics[];
    recommendations: string[];
  }> {
    const healthStatus = this.getHealthStatus();
    const metricsHistory = this.getMetricsHistory(24);
    const alerts = this.getAlerts({ resolved: false });

    const recommendations = this.generateRecommendations(healthStatus, metricsHistory, alerts);

    return {
      summary: {
        overall: healthStatus.overall,
        totalChecks: healthStatus.checks.length,
        healthyChecks: healthStatus.checks.filter(c => c.status === 'healthy').length,
        activeAlerts: alerts.length,
        criticalAlerts: alerts.filter(a => a.severity === 'critical').length
      },
      checks: healthStatus.checks,
      alerts,
      metrics: metricsHistory,
      recommendations
    };
  }

  // Generate recommendations
  private generateRecommendations(
    healthStatus: any,
    metricsHistory: SystemMetrics[],
    alerts: Alert[]
  ): string[] {
    const recommendations: string[] = [];

    // CPU recommendations
    const avgCPU = metricsHistory.reduce((sum, m) => sum + m.cpu.usage, 0) / metricsHistory.length;
    if (avgCPU > 70) {
      recommendations.push('Consider scaling up CPU resources or optimizing CPU-intensive tasks');
    }

    // Memory recommendations
    const avgMemory = metricsHistory.reduce((sum, m) => sum + m.memory.usage, 0) / metricsHistory.length;
    if (avgMemory > 80) {
      recommendations.push('Memory usage is consistently high. Consider adding more RAM or optimizing memory usage');
    }

    // Database recommendations
    const avgDBResponseTime = metricsHistory.reduce((sum, m) => sum + m.database.responseTime, 0) / metricsHistory.length;
    if (avgDBResponseTime > 500) {
      recommendations.push('Database response time is slow. Consider optimizing queries or adding database indexes');
    }

    // Cache recommendations
    const avgCacheHitRate = metricsHistory.reduce((sum, m) => sum + m.cache.hitRate, 0) / metricsHistory.length;
    if (avgCacheHitRate < 80) {
      recommendations.push('Cache hit rate is low. Review caching strategy and consider increasing cache size');
    }

    // Alert-based recommendations
    const criticalAlerts = alerts.filter(a => a.severity === 'critical');
    if (criticalAlerts.length > 0) {
      recommendations.push('There are critical alerts that need immediate attention');
    }

    return recommendations;
  }

  // Private helper methods
  private generateAlertId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  // Cleanup old data
  cleanupOldData(): void {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    // Clean old metrics
    this.metrics = this.metrics.filter(m => m.timestamp >= oneWeekAgo);
    
    // Clean old resolved alerts
    this.alerts = this.alerts.filter(a => 
      !a.resolved || a.resolvedAt >= oneWeekAgo
    );
  }

  // Get system uptime
  getSystemUptime(): {
    startTime: Date;
    uptime: number;
    formattedUptime: string;
  } {
    const startTime = new Date(); // In production, this would be the actual start time
    const uptime = Date.now() - startTime.getTime();
    
    const days = Math.floor(uptime / (1000 * 60 * 60 * 24));
    const hours = Math.floor((uptime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
    
    const formattedUptime = `${days}d ${hours}h ${minutes}m`;
    
    return {
      startTime,
      uptime,
      formattedUptime
    };
  }
}

export { HealthMonitoringService };
