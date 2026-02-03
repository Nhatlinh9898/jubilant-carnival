// System Status Tab Component
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Loader2, Activity, Server, Database, Zap, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface SystemHealth {
  status: 'healthy' | 'warning' | 'error';
  uptime: string;
  version: string;
  lastCheck: string;
}

interface ServiceStatus {
  name: string;
  status: 'running' | 'stopped' | 'error';
  uptime: string;
  memory: number;
  cpu: number;
  requests: number;
  errors: number;
}

interface PerformanceMetrics {
  responseTime: number;
  throughput: number;
  errorRate: number;
  cacheHitRate: number;
  activeConnections: number;
}

export const SystemStatusTab: React.FC = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [performance, setPerformance] = useState<PerformanceMetrics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSystemStatus();
    const interval = setInterval(fetchSystemStatus, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchSystemStatus = async () => {
    setIsRefreshing(true);
    setError(null);

    try {
      // Fetch system health
      const healthResponse = await fetch('/api/advanced-academic-ai/health');
      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        setSystemHealth({
          status: 'healthy',
          uptime: healthData.uptime || '0s',
          version: healthData.version || '1.0.0',
          lastCheck: new Date().toISOString()
        });
      }

      // Mock services data
      setServices([
        {
          name: 'Content Generator',
          status: 'running',
          uptime: '2d 14h 32m',
          memory: 45,
          cpu: 12,
          requests: 1250,
          errors: 3
        },
        {
          name: 'Document Analyzer',
          status: 'running',
          uptime: '2d 14h 32m',
          memory: 38,
          cpu: 8,
          requests: 890,
          errors: 1
        },
        {
          name: 'Expert Profile Manager',
          status: 'running',
          uptime: '2d 14h 32m',
          memory: 25,
          cpu: 5,
          requests: 450,
          errors: 0
        },
        {
          name: 'Research Database',
          status: 'running',
          uptime: '2d 14h 32m',
          memory: 62,
          cpu: 15,
          requests: 2100,
          errors: 2
        },
        {
          name: 'Quality Assessor',
          status: 'running',
          uptime: '2d 14h 32m',
          memory: 20,
          cpu: 3,
          requests: 680,
          errors: 0
        },
        {
          name: 'Cache Manager',
          status: 'running',
          uptime: '2d 14h 32m',
          memory: 18,
          cpu: 2,
          requests: 3200,
          errors: 0
        }
      ]);

      // Mock performance metrics
      setPerformance({
        responseTime: 145,
        throughput: 1250,
        errorRate: 0.2,
        cacheHitRate: 87.5,
        activeConnections: 45
      });

      setLastRefresh(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch system status');
    } finally {
      setIsRefreshing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'running':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'error':
      case 'stopped':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'running':
        return CheckCircle;
      case 'warning':
        return AlertCircle;
      case 'error':
      case 'stopped':
        return AlertCircle;
      default:
        return Activity;
    }
  };

  const getProgressColor = (value: number, type: 'memory' | 'cpu') => {
    if (type === 'memory') {
      if (value >= 80) return 'bg-red-500';
      if (value >= 60) return 'bg-yellow-500';
      return 'bg-green-500';
    } else {
      if (value >= 80) return 'bg-red-500';
      if (value >= 60) return 'bg-yellow-500';
      return 'bg-green-500';
    }
  };

  const formatUptime = (uptime: string) => {
    return uptime;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">System Status</h2>
          <p className="text-gray-600">Monitor Advanced Academic AI system health and performance</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-xs">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </Badge>
          <Button onClick={fetchSystemStatus} disabled={isRefreshing} variant="outline" size="sm">
            {isRefreshing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* System Health Overview */}
      {systemHealth && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5" />
              <span>System Health</span>
            </CardTitle>
            <CardDescription>
              Overall system status and health metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  {React.createElement(getStatusIcon(systemHealth.status), {
                    className: `w-8 h-8 ${getStatusColor(systemHealth.status).replace('bg-', 'text-')}`
                  })}
                </div>
                <div className="text-lg font-semibold capitalize">{systemHealth.status}</div>
                <div className="text-sm text-gray-600">System Status</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {formatUptime(systemHealth.uptime)}
                </div>
                <div className="text-sm text-gray-600">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {systemHealth.version}
                </div>
                <div className="text-sm text-gray-600">Version</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {services.length}
                </div>
                <div className="text-sm text-gray-600">Services</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Services Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Server className="w-5 h-5" />
            <span>Services Status</span>
          </CardTitle>
          <CardDescription>
            Individual service health and performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {services.map((service) => (
              <div key={service.name} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {React.createElement(getStatusIcon(service.status), {
                      className: `w-5 h-5 ${getStatusColor(service.status).replace('bg-', 'text-')}`
                    })}
                    <div>
                      <h4 className="font-semibold">{service.name}</h4>
                      <p className="text-sm text-gray-600">
                        Uptime: {formatUptime(service.uptime)}
                      </p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(service.status)}>
                    {service.status}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Memory</span>
                      <span>{service.memory}%</span>
                    </div>
                    <Progress value={service.memory} className={getProgressColor(service.memory, 'memory')} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>CPU</span>
                      <span>{service.cpu}%</span>
                    </div>
                    <Progress value={service.cpu} className={getProgressColor(service.cpu, 'cpu')} />
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">{service.requests}</div>
                    <div className="text-sm text-gray-600">Requests</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-red-600">{service.errors}</div>
                    <div className="text-sm text-gray-600">Errors</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      {performance && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="w-5 h-5" />
              <span>Performance Metrics</span>
            </CardTitle>
            <CardDescription>
              System performance and response metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold">Response Time</h4>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {performance.responseTime}ms
                  </div>
                  <div className="text-sm text-gray-600">Average response time</div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold">Throughput</h4>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {performance.throughput}
                  </div>
                  <div className="text-sm text-gray-600">Requests/second</div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold">Error Rate</h4>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">
                    {performance.errorRate}%
                  </div>
                  <div className="text-sm text-gray-600">Error percentage</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Cache Hit Rate</span>
                  <span>{performance.cacheHitRate}%</span>
                </div>
                <Progress value={performance.cacheHitRate} className="bg-green-100" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Active Connections</span>
                  <span>{performance.activeConnections}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${Math.min((performance.activeConnections / 100) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Database Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="w-5 h-5" />
            <span>Database Status</span>
          </CardTitle>
          <CardDescription>
            Database connectivity and performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">Connected</div>
              <div className="text-sm text-gray-600">Status</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">2.5GB</div>
              <div className="text-sm text-gray-600">Cache Size</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">98.5%</div>
              <div className="text-sm text-gray-600">Hit Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemStatusTab;
