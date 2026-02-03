// Document Analysis Tab Component
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Loader2, FileText, Search, Brain, TrendingUp, CheckCircle } from 'lucide-react';

interface AnalysisRequest {
  documentPath: string;
  field: string;
  specialization: string;
  analysisType: string;
}

interface AnalysisResult {
  documentPath: string;
  field: string;
  specialization: string;
  analysisType: string;
  findings: {
    keyConcepts: string[];
    methodologies: string[];
    researchGaps: string[];
    contributions: string[];
    limitations: string[];
  };
  recommendations: {
    improvements: string[];
    furtherResearch: string[];
    applications: string[];
  };
  quality: {
    clarity: number;
    rigor: number;
    originality: number;
    significance: number;
  };
}

export const DocumentAnalysisTab: React.FC = () => {
  const [request, setRequest] = useState<AnalysisRequest>({
    documentPath: '',
    field: '',
    specialization: '',
    analysisType: ''
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recentAnalyses, setRecentAnalyses] = useState<AnalysisResult[]>([]);

  const analysisTypes = [
    { id: 'content_quality', name: 'Content Quality Analysis', description: 'Analyze content quality metrics' },
    { id: 'research_gap', name: 'Research Gap Analysis', description: 'Identify research gaps' },
    { id: 'methodology_review', name: 'Methodology Review', description: 'Review research methodology' },
    { id: 'citation_analysis', name: 'Citation Analysis', description: 'Analyze citations and references' },
    { id: 'peer_review', name: 'Peer Review Simulation', description: 'Simulate peer review process' },
    { id: 'impact_assessment', name: 'Impact Assessment', description: 'Assess potential impact' }
  ];

  const fields = [
    { id: 'computer-science', name: 'Computer Science' },
    { id: 'physics', name: 'Physics' },
    { id: 'mathematics', name: 'Mathematics' },
    { id: 'biology', name: 'Biology' },
    { id: 'chemistry', name: 'Chemistry' },
    { id: 'engineering', name: 'Engineering' },
    { id: 'medicine', name: 'Medicine' },
    { id: 'social-sciences', name: 'Social Sciences' }
  ];

  const handleAnalyze = async () => {
    if (!request.documentPath || !request.field || !request.specialization || !request.analysisType) {
      setError('Please fill in all required fields');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch('/api/advanced-academic-ai/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (response.ok) {
        const data = await response.json();
        setAnalysisResult(data.data);
        setRecentAnalyses(prev => [data.data, ...prev.slice(0, 4)]);
      } else {
        throw new Error('Failed to analyze document');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getQualityColor = (score: number) => {
    if (score >= 8) return 'bg-green-500';
    if (score >= 6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getQualityProgress = (score: number) => {
    return (score / 10) * 100;
  };

  return (
    <div className="space-y-6">
      {/* Analysis Form */}
      <Card>
        <CardHeader>
          <CardTitle>Analyze Academic Document</CardTitle>
          <CardDescription>
            Upload and analyze academic documents with AI-powered insights
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Document Path */}
            <div className="space-y-2">
              <Label htmlFor="documentPath">Document Path *</Label>
              <Input
                id="documentPath"
                value={request.documentPath}
                onChange={(e) => setRequest(prev => ({ ...prev, documentPath: e.target.value }))}
                placeholder="/path/to/document.pdf"
              />
            </div>

            {/* Field */}
            <div className="space-y-2">
              <Label htmlFor="field">Field *</Label>
              <Select value={request.field} onValueChange={(value) => setRequest(prev => ({ ...prev, field: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select field" />
                </SelectTrigger>
                <SelectContent>
                  {fields.map((field) => (
                    <SelectItem key={field.id} value={field.id}>
                      {field.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Specialization */}
            <div className="space-y-2">
              <Label htmlFor="specialization">Specialization *</Label>
              <Input
                id="specialization"
                value={request.specialization}
                onChange={(e) => setRequest(prev => ({ ...prev, specialization: e.target.value }))}
                placeholder="e.g., Artificial Intelligence, Quantum Mechanics"
              />
            </div>

            {/* Analysis Type */}
            <div className="space-y-2">
              <Label htmlFor="analysisType">Analysis Type *</Label>
              <Select value={request.analysisType} onValueChange={(value) => setRequest(prev => ({ ...prev, analysisType: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select analysis type" />
                </SelectTrigger>
                <SelectContent>
                  {analysisTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      <div>
                        <div className="font-medium">{type.name}</div>
                        <div className="text-sm text-gray-500">{type.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Analyze Button */}
          <Button 
            onClick={handleAnalyze} 
            disabled={isAnalyzing}
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing Document...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4 mr-2" />
                Analyze Document
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysisResult && (
        <div className="space-y-6">
          {/* Quality Scores */}
          <Card>
            <CardHeader>
              <CardTitle>Quality Assessment</CardTitle>
              <CardDescription>
                Overall quality metrics for the analyzed document
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Clarity</Label>
                    <Badge className={getQualityColor(analysisResult.quality.clarity)}>
                      {analysisResult.quality.clarity.toFixed(1)}
                    </Badge>
                  </div>
                  <Progress value={getQualityProgress(analysisResult.quality.clarity)} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Rigor</Label>
                    <Badge className={getQualityColor(analysisResult.quality.rigor)}>
                      {analysisResult.quality.rigor.toFixed(1)}
                    </Badge>
                  </div>
                  <Progress value={getQualityProgress(analysisResult.quality.rigor)} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Originality</Label>
                    <Badge className={getQualityColor(analysisResult.quality.originality)}>
                      {analysisResult.quality.originality.toFixed(1)}
                    </Badge>
                  </div>
                  <Progress value={getQualityProgress(analysisResult.quality.originality)} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Significance</Label>
                    <Badge className={getQualityColor(analysisResult.quality.significance)}>
                      {analysisResult.quality.significance.toFixed(1)}
                    </Badge>
                  </div>
                  <Progress value={getQualityProgress(analysisResult.quality.significance)} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Key Findings */}
          <Card>
            <CardHeader>
              <CardTitle>Key Findings</CardTitle>
              <CardDescription>
                Important insights discovered during analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2 flex items-center">
                  <Search className="w-4 h-4 mr-2" />
                  Key Concepts
                </h4>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.findings.keyConcepts.map((concept, index) => (
                    <Badge key={index} variant="outline">{concept}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2 flex items-center">
                  <Brain className="w-4 h-4 mr-2" />
                  Methodologies
                </h4>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.findings.methodologies.map((method, index) => (
                    <Badge key={index} variant="outline">{method}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Research Gaps
                </h4>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.findings.researchGaps.map((gap, index) => (
                    <Badge key={index} variant="destructive">{gap}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Contributions
                </h4>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.findings.contributions.map((contribution, index) => (
                    <Badge key={index} className="bg-green-100 text-green-800">{contribution}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Limitations</h4>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.findings.limitations.map((limitation, index) => (
                    <Badge key={index} variant="secondary">{limitation}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
              <CardDescription>
                Suggestions for improvement and future work
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Improvements</h4>
                <ul className="list-disc list-inside space-y-1">
                  {analysisResult.recommendations.improvements.map((improvement, index) => (
                    <li key={index} className="text-sm">{improvement}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Further Research</h4>
                <ul className="list-disc list-inside space-y-1">
                  {analysisResult.recommendations.furtherResearch.map((research, index) => (
                    <li key={index} className="text-sm">{research}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Applications</h4>
                <ul className="list-disc list-inside space-y-1">
                  {analysisResult.recommendations.applications.map((application, index) => (
                    <li key={index} className="text-sm">{application}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Analyses */}
      {recentAnalyses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Analyses</CardTitle>
            <CardDescription>
              Your recent document analyses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentAnalyses.map((analysis, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{analysis.documentPath}</h4>
                    <p className="text-sm text-gray-500">
                      {analysis.field} • {analysis.specialization} • {analysis.analysisType}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getQualityColor(analysis.quality.overall)}>
                      {analysis.quality.overall.toFixed(1)}
                    </Badge>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DocumentAnalysisTab;
