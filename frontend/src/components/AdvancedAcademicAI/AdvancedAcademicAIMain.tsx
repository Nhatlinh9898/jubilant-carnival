// Advanced Academic AI Main Component
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ContentGenerationTab } from './ContentGenerationTab';
import { DocumentAnalysisTab } from './DocumentAnalysisTab';
import { ExpertProfileTab } from './ExpertProfileTab';
import { ResearchDatabaseTab } from './ResearchDatabaseTab';
import { SystemStatusTab } from './SystemStatusTab';

interface SystemStatus {
  status: 'healthy' | 'error' | 'loading';
  uptime: string;
  totalContent: number;
  totalAnalyses: number;
  cacheSize: number;
  lastUpdate: string;
}

export const AdvancedAcademicAIMain: React.FC = () => {
  const [activeTab, setActiveTab] = useState('content-generation');
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    status: 'loading',
    uptime: '0s',
    totalContent: 0,
    totalAnalyses: 0,
    cacheSize: 0,
    lastUpdate: new Date().toISOString()
  });
  const [error, setError] = useState<string | null>(null);

  // Fetch system status on component mount
  useEffect(() => {
    fetchSystemStatus();
    const interval = setInterval(fetchSystemStatus, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchSystemStatus = async () => {
    try {
      const response = await fetch('/api/advanced-academic-ai/health');
      if (response.ok) {
        const data = await response.json();
        setSystemStatus({
          status: 'healthy',
          uptime: data.uptime || '0s',
          totalContent: data.totalContent || 0,
          totalAnalyses: data.totalAnalyses || 0,
          cacheSize: data.cacheSize || 0,
          lastUpdate: new Date().toISOString()
        });
        setError(null);
      } else {
        throw new Error('Failed to fetch system status');
      }
    } catch (err) {
      setSystemStatus(prev => ({ ...prev, status: 'error' }));
      setError('Unable to connect to Advanced Academic AI service');
    }
  };

  const getStatusBadge = () => {
    switch (systemStatus.status) {
      case 'healthy':
        return <Badge variant="default" className="bg-green-500">Healthy</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'loading':
        return <Badge variant="secondary">Loading...</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Advanced Academic AI</h1>
          <p className="text-gray-600 mt-2">
            Generate and analyze academic content with AI-powered tools
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {getStatusBadge()}
          <Button onClick={fetchSystemStatus} variant="outline" size="sm">
            Refresh Status
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* System Status Card */}
      <Card>
        <CardHeader>
          <CardTitle>System Overview</CardTitle>
          <CardDescription>
            Current status and performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {systemStatus.totalContent}
              </div>
              <div className="text-sm text-gray-600">Total Content</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {systemStatus.totalAnalyses}
              </div>
              <div className="text-sm text-gray-600">Total Analyses</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {systemStatus.cacheSize}
              </div>
              <div className="text-sm text-gray-600">Cache Size</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {systemStatus.uptime}
              </div>
              <div className="text-sm text-gray-600">Uptime</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="content-generation">Content Generation</TabsTrigger>
          <TabsTrigger value="document-analysis">Document Analysis</TabsTrigger>
          <TabsTrigger value="expert-profile">Expert Profile</TabsTrigger>
          <TabsTrigger value="research-database">Research Database</TabsTrigger>
          <TabsTrigger value="system-status">System Status</TabsTrigger>
        </TabsList>

        <TabsContent value="content-generation">
          <ContentGenerationTab />
        </TabsContent>

        <TabsContent value="document-analysis">
          <DocumentAnalysisTab />
        </TabsContent>

        <TabsContent value="expert-profile">
          <ExpertProfileTab />
        </TabsContent>

        <TabsContent value="research-database">
          <ResearchDatabaseTab />
        </TabsContent>

        <TabsContent value="system-status">
          <SystemStatusTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedAcademicAIMain;
