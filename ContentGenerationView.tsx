import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  FileText, 
  Edit3, 
  Brain, 
  Target, 
  Clock, 
  Users, 
  TrendingUp, 
  Plus, 
  Download, 
  Eye, 
  Save, 
  RefreshCw, 
  Settings, 
  BarChart3, 
  Award, 
  Zap, 
  CheckCircle, 
  AlertCircle, 
  ChevronRight, 
  Play, 
  Pause,
  Filter,
  Search
} from 'lucide-react';

interface GeneratedContent {
  id: string;
  type: string;
  subject: string;
  topic: string;
  title: string;
  description: string;
  difficulty: number;
  duration: number;
  createdAt: Date;
  status: 'generating' | 'completed' | 'error';
}

interface DevelopmentModel {
  userId: number;
  currentLevel: number;
  targetLevel: number;
  skills: Skill[];
  progress: Progress;
  recommendations: Recommendation[];
  nextSteps: NextStep[];
}

interface Skill {
  id: string;
  name: string;
  category: string;
  currentLevel: number;
  targetLevel: number;
  progress: number;
}

interface Progress {
  overall: number;
  bySkill: Record<string, number>;
  byDomain: Record<string, number>;
}

interface Recommendation {
  type: string;
  priority: string;
  description: string;
  action: string;
  timeline: string;
}

interface NextStep {
  skill: string;
  activity: string;
  resource: string;
  timeline: string;
}

const ContentGenerationView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'generate' | 'library' | 'development' | 'analytics'>('generate');
  const [contentType, setContentType] = useState<'lesson' | 'lecture' | 'exercise' | 'exam'>('lesson');
  const [subject, setSubject] = useState('math');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState(5);
  const [duration, setDuration] = useState(1800);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent[]>([]);
  const [developmentModel, setDevelopmentModel] = useState<DevelopmentModel | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data
  useEffect(() => {
    setGeneratedContent([
      {
        id: '1',
        type: 'lesson',
        subject: 'math',
        topic: 'Calculus Introduction',
        title: 'Calculus Basics - Lesson',
        description: 'Introduction to fundamental calculus concepts',
        difficulty: 3,
        duration: 1800,
        createdAt: new Date('2024-01-25'),
        status: 'completed'
      },
      {
        id: '2',
        type: 'lecture',
        subject: 'physics',
        topic: 'Quantum Mechanics',
        title: 'Quantum Mechanics - Advanced Lecture',
        description: 'Advanced lecture on quantum mechanics principles',
        difficulty: 8,
        duration: 2700,
        createdAt: new Date('2024-01-24'),
        status: 'completed'
      },
      {
        id: '3',
        type: 'exercise',
        subject: 'chemistry',
        topic: 'Chemical Reactions',
        title: 'Chemical Reactions - Practice Exercises',
        description: 'Practice exercises on chemical reactions',
        difficulty: 5,
        duration: 900,
        createdAt: new Date('2024-01-23'),
        status: 'generating'
      }
    ]);

    setDevelopmentModel({
      userId: 1,
      currentLevel: 6,
      targetLevel: 8,
      skills: [
        {
          id: 'math-skill',
          name: 'Mathematics',
          category: 'cognitive',
          currentLevel: 7,
          targetLevel: 9,
          progress: 78
        },
        {
          id: 'physics-skill',
          name: 'Physics',
          category: 'cognitive',
          currentLevel: 5,
          targetLevel: 7,
          progress: 71
        },
        {
          id: 'chemistry-skill',
          name: 'Chemistry',
          category: 'cognitive',
          currentLevel: 6,
          targetLevel: 8,
          progress: 75
        }
      ],
      progress: {
        overall: 75,
        bySkill: {
          'Mathematics': 78,
          'Physics': 71,
          'Chemistry': 75
        },
        byDomain: {
          'cognitive': 75
        }
      },
      recommendations: [
        {
          type: 'content',
          priority: 'high',
          description: 'Focus on improving Physics - currently at 5/10',
          action: 'Complete additional practice exercises',
          timeline: '2 weeks'
        }
      ],
      nextSteps: [
        {
          skill: 'Physics',
          activity: 'Practice exercises',
          resource: 'Physics practice materials',
          timeline: '1 week'
        }
      ]
    });
  }, []);

  const handleGenerate = async () => {
    if (!topic.trim()) return;

    setIsGenerating(true);
    
    // Simulate API call
    setTimeout(() => {
      const newContent: GeneratedContent = {
        id: Date.now().toString(),
        type: contentType,
        subject,
        topic,
        title: `${topic} - ${contentType}`,
        description: `Generated ${contentType} on ${topic}`,
        difficulty,
        duration,
        createdAt: new Date(),
        status: 'completed'
      };

      setGeneratedContent(prev => [newContent, ...prev]);
      setIsGenerating(false);
      setTopic('');
    }, 3000);
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'lesson': return <BookOpen className="w-5 h-5" />;
      case 'lecture': return <FileText className="w-5 h-5" />;
      case 'exercise': return <Edit3 className="w-5 h-5" />;
      case 'exam': return <Target className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 3) return 'text-green-600 bg-green-100';
    if (difficulty <= 7) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'generating': return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Brain className="mr-3 text-green-600" />
                Content Generation AI
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Generate lessons, lectures, exercises, and exams with AI-powered content creation
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                <span className="font-semibold text-green-600">247</span> Generated
              </div>
              <div className="text-sm text-gray-500">
                <span className="font-semibold text-green-600">12</span> Templates
              </div>
              <div className="text-sm text-gray-500">
                <span className="font-semibold text-green-600">89%</span> Success Rate
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'generate', label: 'Generate Content', icon: Plus },
              { id: 'library', label: 'Content Library', icon: BookOpen },
              { id: 'development', label: 'Development Model', icon: TrendingUp },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="mr-2 w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Generate Tab */}
        {activeTab === 'generate' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Generation Form */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">Generate Content</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Content Type</label>
                    <select
                      value={contentType}
                      onChange={(e) => setContentType(e.target.value as any)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="lesson">Lesson</option>
                      <option value="lecture">Lecture</option>
                      <option value="exercise">Exercise</option>
                      <option value="exam">Exam</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="math">Mathematics</option>
                      <option value="physics">Physics</option>
                      <option value="chemistry">Chemistry</option>
                      <option value="biology">Biology</option>
                      <option value="literature">Literature</option>
                      <option value="history">History</option>
                      <option value="computer-science">Computer Science</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
                    <input
                      type="text"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="Enter topic..."
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={difficulty}
                      onChange={(e) => setDifficulty(parseInt(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Beginner</span>
                      <span>{difficulty}/10</span>
                      <span>Advanced</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
                    <input
                      type="number"
                      value={Math.floor(duration / 60)}
                      onChange={(e) => setDuration(parseInt(e.target.value) * 60)}
                      min="10"
                      max="180"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating || !topic.trim()}
                    className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Generate Content
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Content */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">Recently Generated</h2>
                
                <div className="space-y-4">
                  {generatedContent.map((content) => (
                    <div key={content.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center">
                          {getContentTypeIcon(content.type)}
                          <div className="ml-3">
                            <h3 className="font-medium text-gray-900">{content.title}</h3>
                            <p className="text-sm text-gray-600">{content.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(content.status)}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(content.difficulty)}`}>
                            {content.difficulty}/10
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-4">
                          <span>{content.subject}</span>
                          <span>{formatDuration(content.duration)}</span>
                          <span>{content.createdAt.toLocaleDateString()}</span>
                        </div>
                        <div className="flex space-x-2">
                          <button className="text-green-600 hover:text-green-800">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="text-blue-600 hover:text-blue-800">
                            <Download className="w-4 h-4" />
                          </button>
                          <button className="text-purple-600 hover:text-purple-800">
                            <Save className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Library Tab */}
        {activeTab === 'library' && (
          <div>
            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search generated content..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <select className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="all">All Types</option>
                  <option value="lesson">Lessons</option>
                  <option value="lecture">Lectures</option>
                  <option value="exercise">Exercises</option>
                  <option value="exam">Exams</option>
                </select>
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </button>
              </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {generatedContent.map((content) => (
                <div key={content.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        {getContentTypeIcon(content.type)}
                        <div className="ml-3">
                          <h3 className="font-medium text-gray-900">{content.title}</h3>
                          <p className="text-sm text-gray-600">{content.subject}</p>
                        </div>
                      </div>
                      {getStatusIcon(content.status)}
                    </div>

                    <p className="text-sm text-gray-600 mb-4">{content.description}</p>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Type:</span>
                        <span className="font-medium capitalize">{content.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Difficulty:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(content.difficulty)}`}>
                          {content.difficulty}/10
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-medium">{formatDuration(content.duration)}</span>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs text-gray-500">{content.createdAt.toLocaleDateString()}</span>
                      <div className="flex space-x-2">
                        <button className="text-green-600 hover:text-green-800">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-blue-600 hover:text-blue-800">
                          <Download className="w-4 h-4" />
                        </button>
                        <button className="text-purple-600 hover:text-purple-800">
                          <Save className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Development Tab */}
        {activeTab === 'development' && developmentModel && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Progress Overview */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">Development Progress</h3>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Overall Progress</span>
                      <span className="font-semibold">{developmentModel.progress.overall}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${developmentModel.progress.overall}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Current Level</span>
                      <span className="font-semibold">{developmentModel.currentLevel}/10</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${developmentModel.currentLevel * 10}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Target Level</span>
                      <span className="font-semibold">{developmentModel.targetLevel}/10</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${developmentModel.targetLevel * 10}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Skills Breakdown */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Skills Breakdown</h3>
                
                <div className="space-y-3">
                  {developmentModel.skills.map((skill) => (
                    <div key={skill.id}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{skill.name}</span>
                        <span className="text-gray-600">{skill.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${skill.progress}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Current: {skill.currentLevel}/10</span>
                        <span>Target: {skill.targetLevel}/10</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recommendations and Next Steps */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Recommendations */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold mb-4">Recommendations</h3>
                  
                  <div className="space-y-4">
                    {developmentModel.recommendations.map((rec, index) => (
                      <div key={index} className="border-l-4 border-blue-500 pl-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            rec.priority === 'high' ? 'bg-red-100 text-red-600' :
                            rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {rec.priority}
                          </span>
                          <span className="text-xs text-gray-500">{rec.timeline}</span>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{rec.description}</p>
                        <p className="text-sm text-blue-600 font-medium">{rec.action}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Next Steps */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold mb-4">Next Steps</h3>
                  
                  <div className="space-y-3">
                    {developmentModel.nextSteps.map((step, index) => (
                      <div key={index} className="flex items-start">
                        <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-semibold text-green-600">{index + 1}</span>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{step.skill}</p>
                          <p className="text-sm text-gray-600">{step.activity}</p>
                          <p className="text-xs text-gray-500 mt-1">{step.resource} • {step.timeline}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Achievement Badges */}
              <div className="bg-white rounded-lg shadow p-6 mt-6">
                <h3 className="text-lg font-semibold mb-4">Achievements</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Award className="w-8 h-8 text-yellow-600" />
                    </div>
                    <p className="text-sm font-medium">Content Creator</p>
                    <p className="text-xs text-gray-500">10+ items generated</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Target className="w-8 h-8 text-blue-600" />
                    </div>
                    <p className="text-sm font-medium">Goal Achiever</p>
                    <p className="text-xs text-gray-500">5+ objectives met</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <TrendingUp className="w-8 h-8 text-green-600" />
                    </div>
                    <p className="text-sm font-medium">Fast Learner</p>
                    <p className="text-xs text-gray-500">Level up in 2 weeks</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Zap className="w-8 h-8 text-purple-600" />
                    </div>
                    <p className="text-sm font-medium">Power User</p>
                    <p className="text-xs text-gray-500">100+ interactions</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Content Generation Analytics</h2>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <BookOpen className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Total Generated</p>
                    <p className="text-2xl font-semibold text-gray-900">247</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Brain className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Success Rate</p>
                    <p className="text-2xl font-semibold text-gray-900">89%</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Active Users</p>
                    <p className="text-2xl font-semibold text-gray-900">156</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Avg. Generation Time</p>
                    <p className="text-2xl font-semibold text-gray-900">2.3s</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Content by Type</h3>
                <div className="space-y-3">
                  {[
                    { type: 'Lessons', count: 89, color: 'bg-green-500' },
                    { type: 'Lectures', count: 67, color: 'bg-blue-500' },
                    { type: 'Exercises', count: 54, color: 'bg-purple-500' },
                    { type: 'Exams', count: 37, color: 'bg-red-500' }
                  ].map((item) => (
                    <div key={item.type} className="flex items-center">
                      <div className="w-32 text-sm text-gray-600">{item.type}</div>
                      <div className="flex-1 mx-4 bg-gray-200 rounded-full h-2">
                        <div
                          className={`${item.color} h-2 rounded-full`}
                          style={{ width: `${(item.count / 89) * 100}%` }}
                        />
                      </div>
                      <div className="w-12 text-sm font-medium text-gray-900">{item.count}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Subject Distribution</h3>
                <div className="space-y-3">
                  {[
                    { subject: 'Mathematics', count: 78, color: 'bg-green-500' },
                    { subject: 'Physics', count: 65, color: 'bg-blue-500' },
                    { subject: 'Chemistry', count: 54, color: 'bg-purple-500' },
                    { subject: 'Biology', count: 32, color: 'bg-red-500' },
                    { subject: 'Literature', count: 18, color: 'bg-yellow-500' }
                  ].map((item) => (
                    <div key={item.subject} className="flex items-center">
                      <div className="w-32 text-sm text-gray-600">{item.subject}</div>
                      <div className="flex-1 mx-4 bg-gray-200 rounded-full h-2">
                        <div
                          className={`${item.color} h-2 rounded-full`}
                          style={{ width: `${(item.count / 78) * 100}%` }}
                        />
                      </div>
                      <div className="w-12 text-sm font-medium text-gray-900">{item.count}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentGenerationView;
