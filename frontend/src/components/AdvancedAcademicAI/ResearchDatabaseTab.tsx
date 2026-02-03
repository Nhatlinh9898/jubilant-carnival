// Research Database Tab Component
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Search, Database, FileText, TrendingUp, Award, Filter } from 'lucide-react';

interface ResearchPaper {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  year: number;
  citations: number;
  impact: number;
  journal: string;
  keywords: string[];
  field: string;
  specializations: string[];
}

interface Methodology {
  id: string;
  name: string;
  description: string;
  complexity: string;
  applications: string[];
}

interface Framework {
  id: string;
  name: string;
  description: string;
  applications: string[];
  origin: string;
  year: number;
}

export const ResearchDatabaseTab: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState('papers');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedField, setSelectedField] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [methodologies, setMethodologies] = useState<Methodology[]>([]);
  const [frameworks, setFrameworks] = useState<Framework[]>([]);
  const [statistics, setStatistics] = useState<any>(null);

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

  const complexities = [
    { id: 'basic', name: 'Basic' },
    { id: 'intermediate', name: 'Intermediate' },
    { id: 'advanced', name: 'Advanced' }
  ];

  useEffect(() => {
    fetchData();
  }, [activeSubTab]);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      switch (activeSubTab) {
        case 'papers':
          await fetchPapers();
          break;
        case 'methodologies':
          await fetchMethodologies();
          break;
        case 'frameworks':
          await fetchFrameworks();
          break;
        case 'statistics':
          await fetchStatistics();
          break;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPapers = async () => {
    const params = new URLSearchParams();
    if (selectedField) params.append('field', selectedField);
    if (selectedSpecialization) params.append('specialization', selectedSpecialization);

    const response = await fetch(`/api/advanced-academic-ai/research/papers?${params}`);
    if (response.ok) {
      const data = await response.json();
      setPapers(data.data);
    } else {
      throw new Error('Failed to fetch papers');
    }
  };

  const searchPapers = async () => {
    if (!searchQuery) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/advanced-academic-ai/research/papers/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery,
          field: selectedField,
          specialization: selectedSpecialization
        })
      });

      if (response.ok) {
        const data = await response.json();
        setPapers(data.data);
      } else {
        throw new Error('Failed to search papers');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMethodologies = async () => {
    const params = new URLSearchParams();
    if (selectedField) params.append('complexity', selectedField);

    const response = await fetch(`/api/advanced-academic-ai/research/methodologies?${params}`);
    if (response.ok) {
      const data = await response.json();
      setMethodologies(data.data);
    } else {
      throw new Error('Failed to fetch methodologies');
    }
  };

  const fetchFrameworks = async () => {
    const response = await fetch('/api/advanced-academic-ai/research/frameworks');
    if (response.ok) {
      const data = await response.json();
      setFrameworks(data.data);
    } else {
      throw new Error('Failed to fetch frameworks');
    }
  };

  const fetchStatistics = async () => {
    const response = await fetch('/api/advanced-academic-ai/research/statistics');
    if (response.ok) {
      const data = await response.json();
      setStatistics(data.data);
    } else {
      throw new Error('Failed to fetch statistics');
    }
  };

  const getImpactColor = (impact: number) => {
    if (impact >= 8) return 'bg-green-500';
    if (impact >= 6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'basic': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="w-5 h-5" />
            <span>Research Database</span>
          </CardTitle>
          <CardDescription>
            Search and explore academic research papers, methodologies, and frameworks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="search">Search</Label>
              <div className="flex space-x-2">
                <Input
                  id="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search papers, authors, keywords..."
                />
                <Button onClick={searchPapers} disabled={isLoading}>
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="field">Field</Label>
              <Select value={selectedField} onValueChange={setSelectedField}>
                <SelectTrigger>
                  <SelectValue placeholder="All fields" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All fields</SelectItem>
                  {fields.map((field) => (
                    <SelectItem key={field.id} value={field.id}>
                      {field.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="specialization">Specialization</Label>
              <Input
                id="specialization"
                value={selectedSpecialization}
                onChange={(e) => setSelectedSpecialization(e.target.value)}
                placeholder="Filter by specialization"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Main Tabs */}
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="papers">Research Papers</TabsTrigger>
          <TabsTrigger value="methodologies">Methodologies</TabsTrigger>
          <TabsTrigger value="frameworks">Frameworks</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
        </TabsList>

        {/* Research Papers Tab */}
        <TabsContent value="papers">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Research Papers</span>
                <Badge variant="outline">{papers.length} papers</Badge>
              </CardTitle>
              <CardDescription>
                Academic research papers with citation metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="ml-2">Loading papers...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {papers.map((paper) => (
                    <div key={paper.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg">{paper.title}</h4>
                          <p className="text-sm text-gray-600 mb-2">
                            {paper.authors.join(', ')} • {paper.year} • {paper.journal}
                          </p>
                          <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                            {paper.abstract}
                          </p>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {paper.keywords.map((keyword, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex items-center space-x-4 text-sm">
                            <span className="flex items-center">
                              <FileText className="w-4 h-4 mr-1" />
                              {paper.citations} citations
                            </span>
                            <span className="flex items-center">
                              <TrendingUp className="w-4 h-4 mr-1" />
                              Impact: <Badge className={`ml-1 ${getImpactColor(paper.impact)}`}>
                                {paper.impact.toFixed(1)}
                              </Badge>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Methodologies Tab */}
        <TabsContent value="methodologies">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Research Methodologies</span>
                <Badge variant="outline">{methodologies.length} methods</Badge>
              </CardTitle>
              <CardDescription>
                Research methodologies and their applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="ml-2">Loading methodologies...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {methodologies.map((method) => (
                    <div key={method.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold">{method.name}</h4>
                        <Badge className={getComplexityColor(method.complexity)}>
                          {method.complexity}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700 mb-3">{method.description}</p>
                      <div>
                        <h5 className="font-medium text-sm mb-1">Applications:</h5>
                        <div className="flex flex-wrap gap-2">
                          {method.applications.map((app, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {app}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Frameworks Tab */}
        <TabsContent value="frameworks">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Theoretical Frameworks</span>
                <Badge variant="outline">{frameworks.length} frameworks</Badge>
              </CardTitle>
              <CardDescription>
                Academic frameworks and theoretical foundations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="ml-2">Loading frameworks...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {frameworks.map((framework) => (
                    <div key={framework.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold">{framework.name}</h4>
                        <Badge variant="outline">{framework.year}</Badge>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{framework.description}</p>
                      <div className="text-sm text-gray-600 mb-3">
                        Origin: {framework.origin}
                      </div>
                      <div>
                        <h5 className="font-medium text-sm mb-1">Applications:</h5>
                        <div className="flex flex-wrap gap-2">
                          {framework.applications.map((app, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {app}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="statistics">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="w-5 h-5" />
                <span>Research Statistics</span>
              </CardTitle>
              <CardDescription>
                Overview of research database metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="ml-2">Loading statistics...</span>
                </div>
              ) : statistics ? (
                <div className="space-y-6">
                  {/* Overview Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {statistics.totalPapers}
                          </div>
                          <div className="text-sm text-gray-600">Total Papers</div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {statistics.totalCitations}
                          </div>
                          <div className="text-sm text-gray-600">Total Citations</div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">
                            {statistics.averageImpact?.toFixed(1) || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-600">Average Impact</div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Field Distribution */}
                  <div>
                    <h4 className="font-semibold mb-3">Distribution by Field</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.entries(statistics.fields || {}).map(([field, count]) => (
                        <div key={field} className="text-center p-3 border rounded">
                          <div className="text-lg font-bold">{count}</div>
                          <div className="text-sm text-gray-600">{field}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Year Distribution */}
                  <div>
                    <h4 className="font-semibold mb-3">Distribution by Year</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.entries(statistics.years || {}).map(([year, count]) => (
                        <div key={year} className="text-center p-3 border rounded">
                          <div className="text-lg font-bold">{count}</div>
                          <div className="text-sm text-gray-600">{year}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center p-8 text-gray-500">
                  No statistics available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ResearchDatabaseTab;
