// Content Generation Tab Component
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, FileText, Brain, Award, BookOpen, GraduationCap } from 'lucide-react';

interface ContentRequest {
  contentType: string;
  academicLevel: string;
  field: string;
  specialization: string;
  topic: string;
  difficulty: number;
  requirements: any;
}

interface GeneratedContent {
  id: string;
  type: string;
  title: string;
  abstract: string;
  content: string;
  createdAt: string;
  quality: {
    overall: number;
    clarity: number;
    rigor: number;
    originality: number;
    significance: number;
  };
}

export const ContentGenerationTab: React.FC = () => {
  const [request, setRequest] = useState<ContentRequest>({
    contentType: '',
    academicLevel: '',
    field: '',
    specialization: '',
    topic: '',
    difficulty: 7,
    requirements: {}
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recentContent, setRecentContent] = useState<GeneratedContent[]>([]);

  const contentTypes = [
    { id: 'research_paper', name: 'Research Paper', icon: FileText },
    { id: 'thesis', name: 'Thesis', icon: GraduationCap },
    { id: 'dissertation', name: 'Dissertation', icon: Award },
    { id: 'journal_article', name: 'Journal Article', icon: BookOpen },
    { id: 'grant_proposal', name: 'Grant Proposal', icon: Brain },
    { id: 'cv', name: 'Curriculum Vitae', icon: FileText },
    { id: 'lecture_notes', name: 'Lecture Notes', icon: BookOpen }
  ];

  const academicLevels = [
    { id: 'undergraduate', name: 'Undergraduate' },
    { id: 'graduate', name: 'Graduate' },
    { id: 'postgraduate', name: 'Postgraduate' },
    { id: 'doctoral', name: 'Doctoral' },
    { id: 'postdoctoral', name: 'Postdoctoral' },
    { id: 'professor', name: 'Professor' }
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

  const handleGenerate = async () => {
    if (!request.contentType || !request.academicLevel || !request.field || !request.specialization || !request.topic) {
      setError('Please fill in all required fields');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/advanced-academic-ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedContent(data.data);
        setRecentContent(prev => [data.data, ...prev.slice(0, 4)]);
      } else {
        throw new Error('Failed to generate content');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const getQualityColor = (score: number) => {
    if (score >= 8) return 'bg-green-500';
    if (score >= 6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getContentTypeIcon = (typeId: string) => {
    const type = contentTypes.find(t => t.id === typeId);
    return type ? type.icon : FileText;
  };

  return (
    <div className="space-y-6">
      {/* Generation Form */}
      <Card>
        <CardHeader>
          <CardTitle>Generate Academic Content</CardTitle>
          <CardDescription>
            Create high-quality academic content using AI
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Content Type */}
            <div className="space-y-2">
              <Label htmlFor="contentType">Content Type *</Label>
              <Select value={request.contentType} onValueChange={(value) => setRequest(prev => ({ ...prev, contentType: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select content type" />
                </SelectTrigger>
                <SelectContent>
                  {contentTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      <div className="flex items-center space-x-2">
                        <type.icon className="w-4 h-4" />
                        <span>{type.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Academic Level */}
            <div className="space-y-2">
              <Label htmlFor="academicLevel">Academic Level *</Label>
              <Select value={request.academicLevel} onValueChange={(value) => setRequest(prev => ({ ...prev, academicLevel: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select academic level" />
                </SelectTrigger>
                <SelectContent>
                  {academicLevels.map((level) => (
                    <SelectItem key={level.id} value={level.id}>
                      {level.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
          </div>

          {/* Topic */}
          <div className="space-y-2">
            <Label htmlFor="topic">Topic *</Label>
            <Textarea
              id="topic"
              value={request.topic}
              onChange={(e) => setRequest(prev => ({ ...prev, topic: e.target.value }))}
              placeholder="Describe the topic you want to generate content for..."
              rows={3}
            />
          </div>

          {/* Difficulty */}
          <div className="space-y-2">
            <Label htmlFor="difficulty">Difficulty Level: {request.difficulty}</Label>
            <input
              type="range"
              id="difficulty"
              min="1"
              max="10"
              value={request.difficulty}
              onChange={(e) => setRequest(prev => ({ ...prev, difficulty: parseInt(e.target.value) }))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Basic</span>
              <span>Advanced</span>
              <span>Expert</span>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Generate Button */}
          <Button 
            onClick={handleGenerate} 
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Content...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4 mr-2" />
                Generate Content
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Content */}
      {generatedContent && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <getContentTypeIcon type={generatedContent.type} className="w-5 h-5" />
              <span>{generatedContent.title}</span>
            </CardTitle>
            <CardDescription>
              Generated on {new Date(generatedContent.createdAt).toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Quality Scores */}
            <div className="flex space-x-2">
              <Badge className={getQualityColor(generatedContent.quality.overall)}>
                Overall: {generatedContent.quality.overall.toFixed(1)}
              </Badge>
              <Badge className={getQualityColor(generatedContent.quality.clarity)}>
                Clarity: {generatedContent.quality.clarity.toFixed(1)}
              </Badge>
              <Badge className={getQualityColor(generatedContent.quality.rigor)}>
                Rigor: {generatedContent.quality.rigor.toFixed(1)}
              </Badge>
              <Badge className={getQualityColor(generatedContent.quality.originality)}>
                Originality: {generatedContent.quality.originality.toFixed(1)}
              </Badge>
              <Badge className={getQualityColor(generatedContent.quality.significance)}>
                Significance: {generatedContent.quality.significance.toFixed(1)}
              </Badge>
            </div>

            {/* Abstract */}
            <div>
              <h4 className="font-semibold mb-2">Abstract</h4>
              <p className="text-gray-700">{generatedContent.abstract}</p>
            </div>

            {/* Content Preview */}
            <div>
              <h4 className="font-semibold mb-2">Content Preview</h4>
              <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm">{generatedContent.content.substring(0, 1000)}...</pre>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <Button variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                View Full Content
              </Button>
              <Button variant="outline">
                Export
              </Button>
              <Button variant="outline">
                Enhance
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Content */}
      {recentContent.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Generated Content</CardTitle>
            <CardDescription>
              Your recently generated academic content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentContent.map((content) => (
                <div key={content.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <getContentTypeIcon type={content.type} className="w-5 h-5" />
                    <div>
                      <h4 className="font-medium">{content.title}</h4>
                      <p className="text-sm text-gray-500">
                        {new Date(content.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getQualityColor(content.quality.overall)}>
                      {content.quality.overall.toFixed(1)}
                    </Badge>
                    <Button variant="outline" size="sm">
                      View
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

export default ContentGenerationTab;
