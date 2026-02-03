import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  FileText, 
  Search, 
  Brain, 
  BookOpen, 
  Target, 
  BarChart3, 
  Clock, 
  Users, 
  Filter,
  Download,
  Eye,
  Trash2,
  Plus,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  TrendingUp
} from 'lucide-react';

interface Document {
  id: string;
  filename: string;
  subject: string;
  topic: string;
  contentType: string;
  uploadedAt: Date;
  size: number;
  knowledgeNodes: number;
  questions: number;
  status: 'processing' | 'completed' | 'error';
}

interface KnowledgeNode {
  id: string;
  concept: string;
  definition: string;
  difficulty: number;
  confidence: number;
  subject: string;
}

interface AnalysisResult {
  documentId: string;
  extractedNodes: number;
  generatedQuestions: number;
  learningPathSegments: number;
  analysis: {
    structure: any;
    knowledgeDensity: number;
    complexity: string;
    prerequisites: string[];
  };
}

const DocumentAnalysisView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'upload' | 'library' | 'knowledge' | 'analytics'>('upload');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [knowledgeNodes, setKnowledgeNodes] = useState<KnowledgeNode[]>([]);

  // Mock data for demonstration
  useEffect(() => {
    setDocuments([
      {
        id: 'doc1',
        filename: 'Giai_Tich_1.pdf',
        subject: 'toan',
        topic: 'Giai tích cơ bản',
        contentType: 'textbook',
        uploadedAt: new Date('2024-01-15'),
        size: 2048576,
        knowledgeNodes: 45,
        questions: 20,
        status: 'completed'
      },
      {
        id: 'doc2',
        filename: 'Vat_Ly_Co_Hoc.docx',
        subject: 'vatly',
        topic: 'Cơ học Newton',
        contentType: 'lecture',
        uploadedAt: new Date('2024-01-20'),
        size: 1536000,
        knowledgeNodes: 32,
        questions: 15,
        status: 'completed'
      },
      {
        id: 'doc3',
        filename: 'Hoa_Hoc_Hop_Chat.pdf',
        subject: 'hoahoc',
        topic: 'Hợp chất',
        contentType: 'reference',
        uploadedAt: new Date('2024-01-25'),
        size: 3072000,
        knowledgeNodes: 38,
        questions: 18,
        status: 'processing'
      }
    ]);
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock analysis result
      const mockResult: AnalysisResult = {
        documentId: 'new-doc-' + Date.now(),
        extractedNodes: 42,
        generatedQuestions: 18,
        learningPathSegments: 6,
        analysis: {
          structure: {
            chapters: 5,
            sections: 23,
            keyPoints: 87,
            examples: 34,
            exercises: 18
          },
          knowledgeDensity: 14.2,
          complexity: 'medium',
          prerequisites: ['Đại số cơ bản', 'Hàm số']
        }
      };

      setAnalysisResult(mockResult);
      setUploadProgress(100);
      
      // Add to documents list
      const newDoc: Document = {
        id: mockResult.documentId,
        filename: file.name,
        subject: 'toan', // Mock
        topic: 'Uploaded Topic',
        contentType: 'textbook',
        uploadedAt: new Date(),
        size: file.size,
        knowledgeNodes: mockResult.extractedNodes,
        questions: mockResult.generatedQuestions,
        status: 'completed'
      };
      
      setDocuments(prev => [newDoc, ...prev]);
      
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const handleDocumentSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      // Mock API call for knowledge search
      const mockNodes: KnowledgeNode[] = [
        {
          id: '1',
          concept: 'Phương trình bậc 2',
          definition: 'Phương trình có dạng ax² + bx + c = 0',
          difficulty: 4,
          confidence: 0.95,
          subject: 'toan'
        },
        {
          id: '2',
          concept: 'Định luật Newton 2',
          definition: 'F = ma (Lực bằng khối lượng nhân gia tốc)',
          difficulty: 3,
          confidence: 0.92,
          subject: 'vatly'
        }
      ];

      setKnowledgeNodes(mockNodes);
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'processing':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getDifficultyColor = (difficulty: number): string => {
    if (difficulty <= 3) return 'text-green-600 bg-green-100';
    if (difficulty <= 7) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Brain className="mr-3 text-purple-600" />
                Document Analysis AI
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Upload, analyze, and extract knowledge from educational documents
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                <span className="font-semibold text-purple-600">3</span> Documents
              </div>
              <div className="text-sm text-gray-500">
                <span className="font-semibold text-purple-600">115</span> Knowledge Nodes
              </div>
              <div className="text-sm text-gray-500">
                <span className="font-semibold text-purple-600">53</span> Questions
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
              { id: 'upload', label: 'Upload & Analyze', icon: Upload },
              { id: 'library', label: 'Document Library', icon: FileText },
              { id: 'knowledge', label: 'Knowledge Graph', icon: BookOpen },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600'
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
        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Upload Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Upload Document</h2>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors">
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <label className="cursor-pointer">
                  <span className="text-purple-600 font-medium">Click to upload</span>
                  <input
                    type="file"
                    className="hidden"
                    accept=".txt,.pdf,.docx,.html,.htm"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                  />
                  <span className="text-gray-500"> or drag and drop</span>
                </label>
                <p className="text-xs text-gray-500 mt-2">
                  TXT, PDF, DOCX, HTML (MAX. 10MB)
                </p>
              </div>

              {isUploading && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Processing document...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {analysisResult && (
                <div className="mt-6 p-4 bg-green-50 rounded-lg">
                  <h3 className="font-medium text-green-800 mb-2">Analysis Complete!</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Knowledge Nodes:</span>
                      <span className="ml-2 font-semibold">{analysisResult.extractedNodes}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Questions:</span>
                      <span className="ml-2 font-semibold">{analysisResult.generatedQuestions}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Learning Paths:</span>
                      <span className="ml-2 font-semibold">{analysisResult.learningPathSegments}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Complexity:</span>
                      <span className="ml-2 font-semibold">{analysisResult.analysis.complexity}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Analysis Details */}
            {analysisResult && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">Analysis Details</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-700 mb-2">Document Structure</h3>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="bg-gray-50 p-3 rounded">
                        <div className="font-semibold">{analysisResult.analysis.structure.chapters}</div>
                        <div className="text-gray-600">Chapters</div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <div className="font-semibold">{analysisResult.analysis.structure.sections}</div>
                        <div className="text-gray-600">Sections</div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <div className="font-semibold">{analysisResult.analysis.structure.keyPoints}</div>
                        <div className="text-gray-600">Key Points</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-700 mb-2">Knowledge Metrics</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Knowledge Density:</span>
                        <span className="font-semibold">{analysisResult.analysis.knowledgeDensity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Prerequisites:</span>
                        <span className="font-semibold">{analysisResult.analysis.prerequisites.join(', ')}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-700 mb-2">Generated Content</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 bg-purple-50 rounded">
                        <span className="text-sm">Learning Path</span>
                        <ChevronRight className="w-4 h-4 text-purple-600" />
                      </div>
                      <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                        <span className="text-sm">Question Bank</span>
                        <ChevronRight className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                        <span className="text-sm">Knowledge Graph</span>
                        <ChevronRight className="w-4 h-4 text-green-600" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
                    placeholder="Search documents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Subjects</option>
                  <option value="toan">Toán</option>
                  <option value="vatly">Vật Lý</option>
                  <option value="hoahoc">Hóa Học</option>
                  <option value="van">Ngữ Văn</option>
                  <option value="anh">Tiếng Anh</option>
                </select>
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </button>
              </div>
            </div>

            {/* Documents Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {documents.map((doc) => (
                <div key={doc.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <FileText className="w-8 h-8 text-purple-600 mr-3" />
                        <div>
                          <h3 className="font-medium text-gray-900">{doc.filename}</h3>
                          <p className="text-sm text-gray-500">{doc.subject} • {doc.topic}</p>
                        </div>
                      </div>
                      {getStatusIcon(doc.status)}
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Type:</span>
                        <span className="font-medium capitalize">{doc.contentType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Size:</span>
                        <span className="font-medium">{formatFileSize(doc.size)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Knowledge Nodes:</span>
                        <span className="font-medium">{doc.knowledgeNodes}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Questions:</span>
                        <span className="font-medium">{doc.questions}</span>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                      <span>{doc.uploadedAt.toLocaleDateString()}</span>
                      <div className="flex space-x-2">
                        <button className="text-purple-600 hover:text-purple-800">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-blue-600 hover:text-blue-800">
                          <Download className="w-4 h-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-800">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Knowledge Graph Tab */}
        {activeTab === 'knowledge' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Search Section */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">Search Knowledge</h2>
                
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search concepts..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  
                  <button
                    onClick={handleDocumentSearch}
                    className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </button>

                  <div className="border-t pt-4">
                    <h3 className="font-medium text-gray-700 mb-2">Filter by Subject</h3>
                    <select
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="all">All Subjects</option>
                      <option value="toan">Toán</option>
                      <option value="vatly">Vật Lý</option>
                      <option value="hoahoc">Hóa Học</option>
                      <option value="van">Ngữ Văn</option>
                      <option value="anh">Tiếng Anh</option>
                    </select>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="font-medium text-gray-700 mb-2">Statistics</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Nodes:</span>
                        <span className="font-semibold">115</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Connections:</span>
                        <span className="font-semibold">342</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Avg Confidence:</span>
                        <span className="font-semibold">87%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Knowledge Nodes */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">Knowledge Nodes</h2>
                
                {knowledgeNodes.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500">Search for concepts to see knowledge nodes</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {knowledgeNodes.map((node) => (
                      <div key={node.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-medium text-gray-900">{node.concept}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(node.difficulty)}`}>
                            {node.difficulty}/10
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">{node.definition}</p>
                        
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span className="flex items-center">
                            <BookOpen className="w-3 h-3 mr-1" />
                            {node.subject}
                          </span>
                          <span className="flex items-center">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            {Math.round(node.confidence * 100)}% confidence
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Stats Cards */}
            <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <FileText className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Total Documents</p>
                    <p className="text-2xl font-semibold text-gray-900">3</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Brain className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Knowledge Nodes</p>
                    <p className="text-2xl font-semibold text-gray-900">115</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Target className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Questions</p>
                    <p className="text-2xl font-semibold text-gray-900">53</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Avg Process Time</p>
                    <p className="text-2xl font-semibold text-gray-900">2.3s</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="lg:col-span-3 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Subject Distribution</h3>
                <div className="space-y-3">
                  {[
                    { subject: 'Toán', count: 45, color: 'bg-purple-500' },
                    { subject: 'Vật Lý', count: 32, color: 'bg-blue-500' },
                    { subject: 'Hóa Học', count: 38, color: 'bg-green-500' },
                    { subject: 'Ngữ Văn', count: 28, color: 'bg-yellow-500' },
                    { subject: 'Tiếng Anh', count: 35, color: 'bg-red-500' }
                  ].map((item) => (
                    <div key={item.subject} className="flex items-center">
                      <div className="w-24 text-sm text-gray-600">{item.subject}</div>
                      <div className="flex-1 mx-4 bg-gray-200 rounded-full h-2">
                        <div
                          className={`${item.color} h-2 rounded-full`}
                          style={{ width: `${(item.count / 45) * 100}%` }}
                        />
                      </div>
                      <div className="w-8 text-sm font-medium text-gray-900">{item.count}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Processing Trends</h3>
                <div className="space-y-2">
                  {[
                    { date: '2024-01-25', docs: 1, nodes: 38 },
                    { date: '2024-01-20', docs: 1, nodes: 32 },
                    { date: '2024-01-15', docs: 1, nodes: 45 }
                  ].map((item) => (
                    <div key={item.date} className="flex justify-between text-sm">
                      <span className="text-gray-600">{item.date}</span>
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center">
                          <FileText className="w-3 h-3 mr-1 text-gray-400" />
                          {item.docs} docs
                        </span>
                        <span className="flex items-center">
                          <Brain className="w-3 h-3 mr-1 text-gray-400" />
                          {item.nodes} nodes
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="lg:col-span-3 bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {[
                  { action: 'Document uploaded', file: 'Hoa_Hoc_Hop_Chat.pdf', time: '2 hours ago', icon: Upload },
                  { action: 'Knowledge extracted', file: 'Vat_Ly_Co_Hoc.docx', time: '5 hours ago', icon: Brain },
                  { action: 'Questions generated', file: 'Giai_Tich_1.pdf', time: '1 day ago', icon: Target }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                    <div className="flex items-center">
                      <activity.icon className="w-4 h-4 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                        <p className="text-xs text-gray-500">{activity.file}</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">{activity.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentAnalysisView;
