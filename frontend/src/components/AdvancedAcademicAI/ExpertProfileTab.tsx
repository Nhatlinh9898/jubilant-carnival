// Expert Profile Tab Component
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, User, Award, TrendingUp, Brain, Target, BookOpen, Users } from 'lucide-react';

interface ExpertProfile {
  userId: number;
  academicLevel: string;
  primaryField: string;
  secondaryFields: string[];
  specializations: string[];
  researchInterests: string[];
  publications: Publication[];
  citations: number;
  hIndex: number;
  impact: number;
  skills: Skill[];
  competencies: Competency[];
  expertiseScore: {
    overall: number;
    byCategory: Record<string, number>;
    recommendations: string[];
  };
  careerProgression: {
    nextLevel: string;
    requirements: string[];
    timeline: string;
    actionPlan: string[];
  };
}

interface Publication {
  id: string;
  title: string;
  type: string;
  year: number;
  citations: number;
  impact: number;
}

interface Skill {
  id: string;
  name: string;
  category: string;
  level: number;
}

interface Competency {
  id: string;
  name: string;
  category: string;
  level: number;
}

export const ExpertProfileTab: React.FC = () => {
  const [userId, setUserId] = useState<string>('1');
  const [profile, setProfile] = useState<ExpertProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState('overview');

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
    { id: 'engineering', name: 'Engineering' }
  ];

  useEffect(() => {
    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  const fetchProfile = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/advanced-academic-ai/profile/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setProfile(data.data);
      } else {
        throw new Error('Failed to fetch profile');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchExpertiseScore = async () => {
    if (!profile) return;

    try {
      const response = await fetch(`/api/advanced-academic-ai/profile/${userId}/expertise-score`);
      if (response.ok) {
        const data = await response.json();
        setProfile(prev => prev ? { ...prev, expertiseScore: data.data } : null);
      }
    } catch (err) {
      console.error('Failed to fetch expertise score:', err);
    }
  };

  const fetchCareerProgression = async () => {
    if (!profile) return;

    try {
      const response = await fetch(`/api/advanced-academic-ai/profile/${userId}/career-progression`);
      if (response.ok) {
        const data = await response.json();
        setProfile(prev => prev ? { ...prev, careerProgression: data.data } : null);
      }
    } catch (err) {
      console.error('Failed to fetch career progression:', err);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'bg-green-500';
    if (score >= 6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getScoreProgress = (score: number) => {
    return (score / 10) * 100;
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'professor': return Award;
      case 'doctoral': return Brain;
      case 'postdoctoral': return TrendingUp;
      default: return User;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading profile...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!profile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Expert Profile</CardTitle>
          <CardDescription>Manage your academic expert profile</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="userId">User ID</Label>
              <Input
                id="userId"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter user ID"
              />
            </div>
            <Button onClick={fetchProfile}>
              Load Profile
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const LevelIcon = getLevelIcon(profile.academicLevel);

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <LevelIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <span>Expert Profile</span>
                  <Badge className={getScoreColor(profile.expertiseScore.overall)}>
                    Level: {academicLevels.find(l => l.id === profile.academicLevel)?.name}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  User ID: {profile.userId} • Field: {fields.find(f => f.id === profile.primaryField)?.name}
                </CardDescription>
              </div>
            </div>
            <Button onClick={() => { fetchExpertiseScore(); fetchCareerProgression(); }}>
              Refresh Data
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="expertise">Expertise</TabsTrigger>
          <TabsTrigger value="career">Career</TabsTrigger>
          <TabsTrigger value="publications">Publications</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="space-y-6">
            {/* Expertise Score */}
            <Card>
              <CardHeader>
                <CardTitle>Expertise Score</CardTitle>
                <CardDescription>Overall assessment of your academic expertise</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600">
                    {profile.expertiseScore.overall.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-600">Overall Score</div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(profile.expertiseScore.byCategory).map(([category, score]) => (
                    <div key={category} className="space-y-2">
                      <div className="flex justify-between">
                        <Label className="capitalize">{category}</Label>
                        <Badge className={getScoreColor(score as number)}>
                          {(score as number).toFixed(1)}
                        </Badge>
                      </div>
                      <Progress value={getScoreProgress(score as number)} />
                    </div>
                  ))}
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Recommendations</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {profile.expertiseScore.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm">{rec}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{profile.citations}</div>
                    <div className="text-sm text-gray-600">Citations</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{profile.hIndex}</div>
                    <div className="text-sm text-gray-600">H-Index</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{profile.impact}</div>
                    <div className="text-sm text-gray-600">Impact</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{profile.publications.length}</div>
                    <div className="text-sm text-gray-600">Publications</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Expertise Tab */}
        <TabsContent value="expertise">
          <div className="space-y-6">
            {/* Skills */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="w-5 h-5" />
                  <span>Skills</span>
                </CardTitle>
                <CardDescription>Your academic and research skills</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['technical', 'research', 'teaching', 'leadership', 'communication'].map(category => {
                    const categorySkills = profile.skills.filter(skill => skill.category === category);
                    if (categorySkills.length === 0) return null;
                    
                    return (
                      <div key={category}>
                        <h4 className="font-semibold mb-2 capitalize">{category}</h4>
                        <div className="space-y-2">
                          {categorySkills.map(skill => (
                            <div key={skill.id} className="flex items-center justify-between">
                              <span className="text-sm">{skill.name}</span>
                              <div className="flex items-center space-x-2">
                                <div className="w-24">
                                  <Progress value={getScoreProgress(skill.level)} />
                                </div>
                                <Badge className={getScoreColor(skill.level)}>
                                  {skill.level.toFixed(1)}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Competencies */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5" />
                  <span>Competencies</span>
                </CardTitle>
                <CardDescription>Your core competencies and abilities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['knowledge', 'skill', 'ability', 'behavior'].map(category => {
                    const categoryCompetencies = profile.competencies.filter(comp => comp.category === category);
                    if (categoryCompetencies.length === 0) return null;
                    
                    return (
                      <div key={category}>
                        <h4 className="font-semibold mb-2 capitalize">{category}</h4>
                        <div className="space-y-2">
                          {categoryCompetencies.map(competency => (
                            <div key={competency.id} className="flex items-center justify-between">
                              <span className="text-sm">{competency.name}</span>
                              <div className="flex items-center space-x-2">
                                <div className="w-24">
                                  <Progress value={getScoreProgress(competency.level)} />
                                </div>
                                <Badge className={getScoreColor(competency.level)}>
                                  {competency.level.toFixed(1)}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Research Interests */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="w-5 h-5" />
                  <span>Research Interests</span>
                </CardTitle>
                <CardDescription>Your areas of research focus</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profile.researchInterests.map((interest, index) => (
                    <Badge key={index} variant="outline">{interest}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Career Tab */}
        <TabsContent value="career">
          <div className="space-y-6">
            {/* Career Progression */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>Career Progression</span>
                </CardTitle>
                <CardDescription>Your career development path</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold">Next Level: {profile.careerProgression.nextLevel}</h4>
                  <p className="text-sm text-gray-600">Timeline: {profile.careerProgression.timeline}</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Requirements</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {profile.careerProgression.requirements.map((req, index) => (
                      <li key={index} className="text-sm">{req}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Action Plan</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {profile.careerProgression.actionPlan.map((action, index) => (
                      <li key={index} className="text-sm">{action}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Specializations */}
            <Card>
              <CardHeader>
                <CardTitle>Specializations</CardTitle>
                <CardDescription>Your areas of expertise</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profile.specializations.map((spec, index) => (
                    <Badge key={index} className="bg-blue-100 text-blue-800">{spec}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Publications Tab */}
        <TabsContent value="publications">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Publications</span>
                </CardTitle>
                <CardDescription>Your academic publications and their impact</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {profile.publications.map((pub) => (
                    <div key={pub.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{pub.title}</h4>
                        <p className="text-sm text-gray-500">
                          {pub.type} • {pub.year} • {pub.citations} citations
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge className={getScoreColor(pub.impact)}>
                          Impact: {pub.impact.toFixed(1)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExpertProfileTab;
