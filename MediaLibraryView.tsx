import React, { useState, useEffect } from 'react';
import { 
  Search, 
  BookOpen, 
  Video, 
  Globe, 
  Headphones, 
  FileText, 
  Users, 
  TrendingUp, 
  Star, 
  Clock, 
  Filter, 
  Plus, 
  Download, 
  Eye, 
  Heart, 
  Share2, 
  BarChart3, 
  Library, 
  PlayCircle, 
  Bookmark,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

interface MediaItem {
  id: string;
  title: string;
  description: string;
  mediaType: 'video' | 'article' | 'book' | 'podcast' | 'website' | 'repository';
  subject: string;
  source: string;
  duration?: number;
  author?: string;
  publishDate?: Date;
  tags: string[];
  difficulty: number;
  confidence: number;
  quality: 'high' | 'medium' | 'low';
  language: string;
  url?: string;
  thumbnail?: string;
  views?: number;
  rating?: number;
  isBookmarked?: boolean;
  isFavorite?: boolean;
}

interface Collection {
  id: string;
  name: string;
  description: string;
  subject: string;
  items: MediaItem[];
  totalItems: number;
  quality: 'curated' | 'auto' | 'mixed';
  lastUpdated: Date;
  isPublic: boolean;
}

interface Recommendation {
  userId: number;
  content: MediaItem[];
  reasoning: string;
  personalizedScore: number;
  basedOn: string[];
}

const MediaLibraryView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'search' | 'collections' | 'recommendations' | 'statistics'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedMediaType, setSelectedMediaType] = useState('all');
  const [searchResults, setSearchResults] = useState<MediaItem[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);

  // Mock data for demonstration
  useEffect(() => {
    // Mock search results
    setSearchResults([
      {
        id: '1',
        title: 'Introduction to Calculus - Complete Course',
        description: 'Comprehensive calculus course covering limits, derivatives, and integrals with real-world applications.',
        mediaType: 'video',
        subject: 'math',
        source: 'Khan Academy',
        duration: 3600,
        author: 'Sal Khan',
        publishDate: new Date('2024-01-15'),
        tags: ['calculus', 'mathematics', 'derivatives', 'integrals'],
        difficulty: 5,
        confidence: 0.95,
        quality: 'high',
        language: 'en',
        url: 'https://www.youtube.com/watch?v=example',
        thumbnail: '/api/placeholder/video1.jpg',
        views: 125000,
        rating: 4.8,
        isBookmarked: false,
        isFavorite: true
      },
      {
        id: '2',
        title: 'Physics Fundamentals - Newton\'s Laws',
        description: 'Detailed explanation of Newton\'s three laws of motion with practical examples and experiments.',
        mediaType: 'article',
        subject: 'physics',
        source: 'MIT OpenCourseWare',
        author: 'Prof. Walter Lewin',
        publishDate: new Date('2024-01-20'),
        tags: ['physics', 'mechanics', 'newton', 'laws'],
        difficulty: 4,
        confidence: 0.92,
        quality: 'high',
        language: 'en',
        url: 'https://ocw.mit.edu/courses/physics',
        thumbnail: '/api/placeholder/article1.jpg',
        views: 45000,
        rating: 4.6,
        isBookmarked: true,
        isFavorite: false
      },
      {
        id: '3',
        title: 'The Great Gatsby - Full Audiobook',
        description: 'Complete audiobook version of F. Scott Fitzgerald\'s classic American novel.',
        mediaType: 'podcast',
        subject: 'literature',
        source: 'LibriVox',
        author: 'F. Scott Fitzgerald',
        publishDate: new Date('2024-01-10'),
        tags: ['literature', 'classic', 'american', 'audiobook'],
        difficulty: 3,
        confidence: 0.88,
        quality: 'medium',
        language: 'en',
        duration: 2700,
        thumbnail: '/api/placeholder/podcast1.jpg',
        views: 23000,
        rating: 4.4,
        isBookmarked: false,
        isFavorite: false
      }
    ]);

    // Mock collections
    setCollections([
      {
        id: 'math-collection',
        name: 'Mathematics Collection',
        description: 'Comprehensive mathematics resources from basic to advanced',
        subject: 'math',
        items: [],
        totalItems: 156,
        quality: 'curated',
        lastUpdated: new Date(),
        isPublic: true
      },
      {
        id: 'science-collection',
        name: 'Science Resources',
        description: 'Science education materials covering physics, chemistry, and biology',
        subject: 'science',
        items: [],
        totalItems: 234,
        quality: 'curated',
        lastUpdated: new Date(),
        isPublic: true
      }
    ]);
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // Filter mock results based on search
      const filtered = searchResults.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      
      setSearchResults(filtered);
      setIsLoading(false);
    }, 1000);
  };

  const getMediaTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-5 h-5" />;
      case 'article': return <FileText className="w-5 h-5" />;
      case 'book': return <BookOpen className="w-5 h-5" />;
      case 'podcast': return <Headphones className="w-5 h-5" />;
      case 'website': return <Globe className="w-5 h-5" />;
      case 'repository': return <Library className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'high': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 3) return 'text-green-600 bg-green-100';
    if (difficulty <= 7) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const formatDuration = (seconds?: number): string => {
    if (!seconds) return 'N/A';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatViews = (views?: number): string => {
    if (!views) return 'N/A';
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  const toggleBookmark = (itemId: string) => {
    setSearchResults(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, isBookmarked: !item.isBookmarked }
          : item
      )
    );
  };

  const toggleFavorite = (itemId: string) => {
    setSearchResults(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, isFavorite: !item.isFavorite }
          : item
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Library className="mr-3 text-blue-600" />
                Media & Library AI
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Discover educational content from free media sources and libraries
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                <span className="font-semibold text-blue-600">2,847</span> Resources
              </div>
              <div className="text-sm text-gray-500">
                <span className="font-semibold text-blue-600">156</span> Collections
              </div>
              <div className="text-sm text-gray-500">
                <span className="font-semibold text-blue-600">12</span> Sources
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
              { id: 'search', label: 'Search & Discover', icon: Search },
              { id: 'collections', label: 'Collections', icon: Library },
              { id: 'recommendations', label: 'Recommendations', icon: Users },
              { id: 'statistics', label: 'Statistics', icon: BarChart3 }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
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
        {/* Search Tab */}
        {activeTab === 'search' && (
          <div>
            {/* Search Section */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search for educational content..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Subjects</option>
                  <option value="math">Mathematics</option>
                  <option value="physics">Physics</option>
                  <option value="chemistry">Chemistry</option>
                  <option value="biology">Biology</option>
                  <option value="literature">Literature</option>
                  <option value="computer-science">Computer Science</option>
                </select>
                
                <select
                  value={selectedMediaType}
                  onChange={(e) => setSelectedMediaType(e.target.value)}
                  className="px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="video">Videos</option>
                  <option value="article">Articles</option>
                  <option value="book">Books</option>
                  <option value="podcast">Podcasts</option>
                  <option value="website">Websites</option>
                  <option value="repository">Repositories</option>
                </select>
                
                <button
                  onClick={handleSearch}
                  disabled={isLoading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4 mr-2" />
                  )}
                  Search
                </button>
              </div>
            </div>

            {/* Search Results */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {searchResults.map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                  <div className="relative">
                    {item.thumbnail && (
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                    )}
                    <div className="absolute top-2 right-2 flex space-x-2">
                      <button
                        onClick={() => toggleBookmark(item.id)}
                        className={`p-2 rounded-full ${item.isBookmarked ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'} shadow-md hover:shadow-lg transition-all`}
                      >
                        <Bookmark className="w-4 h-4" fill={item.isBookmarked ? 'currentColor' : 'none'} />
                      </button>
                      <button
                        onClick={() => toggleFavorite(item.id)}
                        className={`p-2 rounded-full ${item.isFavorite ? 'bg-red-600 text-white' : 'bg-white text-gray-600'} shadow-md hover:shadow-lg transition-all`}
                      >
                        <Heart className="w-4 h-4" fill={item.isFavorite ? 'currentColor' : 'none'} />
                      </button>
                    </div>
                    <div className="absolute bottom-2 left-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getQualityColor(item.quality)}`}>
                        {item.quality}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center">
                        {getMediaTypeIcon(item.mediaType)}
                        <span className="ml-2 text-sm text-gray-600 capitalize">{item.mediaType}</span>
                      </div>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="ml-1 text-sm text-gray-600">{item.rating}</span>
                      </div>
                    </div>

                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{item.title}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>

                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <span>{item.source}</span>
                      <span>{formatDuration(item.duration)}</span>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {item.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                          {tag}
                        </span>
                      ))}
                      {item.tags.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                          +{item.tags.length - 3}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex items-center text-xs text-gray-500">
                        <Eye className="w-3 h-3 mr-1" />
                        {formatViews(item.views)} views
                      </div>
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-800">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-800">
                          <Download className="w-4 h-4" />
                        </button>
                        <button className="text-purple-600 hover:text-purple-800">
                          <Share2 className="w-4 h-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-800">
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {searchResults.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500">No results found. Try adjusting your search criteria.</p>
              </div>
            )}
          </div>
        )}

        {/* Collections Tab */}
        {activeTab === 'collections' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Library Collections</h2>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center">
                <Plus className="w-4 h-4 mr-2" />
                Create Collection
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {collections.map((collection) => (
                <div key={collection.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">{collection.name}</h3>
                        <p className="text-sm text-gray-600">{collection.description}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getQualityColor(collection.quality)}`}>
                        {collection.quality}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subject:</span>
                        <span className="font-medium capitalize">{collection.subject}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Items:</span>
                        <span className="font-medium">{collection.totalItems}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Last Updated:</span>
                        <span className="font-medium">{collection.lastUpdated.toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center text-xs text-gray-500">
                        {collection.isPublic ? (
                          <><Globe className="w-3 h-3 mr-1" /> Public</>
                        ) : (
                          <><Users className="w-3 h-3 mr-1" /> Private</>
                        )}
                      </div>
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        View Collection →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations Tab */}
        {activeTab === 'recommendations' && (
          <div>
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Personalized Recommendations</h2>
              <p className="text-gray-600 mb-4">
                Based on your learning history and preferences, we've curated these resources just for you.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Subjects</label>
                  <select className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Mathematics, Physics</option>
                    <option>Literature, History</option>
                    <option>Computer Science</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Learning Style</label>
                  <select className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Visual</option>
                    <option>Auditory</option>
                    <option>Kinesthetic</option>
                  </select>
                </div>
              </div>
              
              <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Get Recommendations
              </button>
            </div>

            {/* Recommended Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {searchResults.slice(0, 4).map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      {getMediaTypeIcon(item.mediaType)}
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="font-semibold text-gray-900">{item.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      <div className="mt-2 flex items-center text-xs text-gray-500">
                        <span className="mr-4">{item.source}</span>
                        <span className="mr-4">{item.subject}</span>
                        <span>Difficulty: {item.difficulty}/10</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Statistics Tab */}
        {activeTab === 'statistics' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Library Statistics</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Library className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Total Resources</p>
                    <p className="text-2xl font-semibold text-gray-900">2,847</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <BookOpen className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Collections</p>
                    <p className="text-2xl font-semibold text-gray-900">156</p>
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
                    <p className="text-2xl font-semibold text-gray-900">1,234</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Avg. Rating</p>
                    <p className="text-2xl font-semibold text-gray-900">4.6</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Content by Subject</h3>
                <div className="space-y-3">
                  {[
                    { subject: 'Mathematics', count: 856, color: 'bg-blue-500' },
                    { subject: 'Science', count: 723, color: 'bg-green-500' },
                    { subject: 'Literature', count: 612, color: 'bg-purple-500' },
                    { subject: 'Computer Science', count: 445, color: 'bg-red-500' },
                    { subject: 'History', count: 211, color: 'bg-yellow-500' }
                  ].map((item) => (
                    <div key={item.subject} className="flex items-center">
                      <div className="w-32 text-sm text-gray-600">{item.subject}</div>
                      <div className="flex-1 mx-4 bg-gray-200 rounded-full h-2">
                        <div
                          className={`${item.color} h-2 rounded-full`}
                          style={{ width: `${(item.count / 856) * 100}%` }}
                        />
                      </div>
                      <div className="w-12 text-sm font-medium text-gray-900">{item.count}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Media Type Distribution</h3>
                <div className="space-y-3">
                  {[
                    { type: 'Videos', count: 1234, icon: Video },
                    { type: 'Articles', count: 876, icon: FileText },
                    { type: 'Books', count: 456, icon: BookOpen },
                    { type: 'Podcasts', count: 234, icon: Headphones },
                    { type: 'Websites', count: 47, icon: Globe }
                  ].map((item) => (
                    <div key={item.type} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <item.icon className="w-4 h-4 text-gray-400 mr-3" />
                        <span className="text-sm text-gray-600">{item.type}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{item.count}</span>
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

export default MediaLibraryView;
