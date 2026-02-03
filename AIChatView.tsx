import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Sparkles, BookOpen, TrendingUp, Calendar } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  confidence?: number;
}

interface AIAnalytics {
  performanceTrend: 'improving' | 'declining' | 'stable';
  knowledgeGaps: string[];
  masteryLevel: Record<string, number>;
  recommendations: string[];
}

const AIChatView: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [studentId, setStudentId] = useState(1); // Mock student ID
  const [analytics, setAnalytics] = useState<AIAnalytics | null>(null);
  const [activeTab, setActiveTab] = useState<'chat' | 'analytics' | 'content'>('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Load initial analytics
    loadAnalytics();
    
    // Welcome message
    setMessages([{
      id: '1',
      role: 'assistant',
      content: 'Xin chào! Tôi là trợ lý AI thông minh của EduManager. Tôi có thể giúp bạn:\n\n📚 Hỏi đáp về bài tập\n📊 Phân tích kết quả học tập\n🎯 Tạo kế hoạch học tập cá nhân\n💡 Đưa ra khuyến nghị học tập\n\nBạn cần hỗ trợ gì hôm nay?',
      timestamp: new Date(),
      confidence: 0.95
    }]);
  }, []);

  const loadAnalytics = async () => {
    try {
      // Mock API call - replace with actual API
      const mockAnalytics: AIAnalytics = {
        performanceTrend: 'improving',
        knowledgeGaps: ['Vật Lý', 'Hóa Học'],
        masteryLevel: {
          'Toán': 0.85,
          'Văn': 0.75,
          'Anh': 0.90,
          'Lý': 0.55,
          'Hóa': 0.60
        },
        recommendations: [
          'Tăng thời gian ôn tập Vật Lý và Hóa Học',
          'Tiếp tục duy trì kết tốt môn Toán và Anh',
          'Tham gia nhóm học tập cho các môn yếu'
        ]
      };
      setAnalytics(mockAnalytics);
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Mock API call - replace with actual API
      setTimeout(() => {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: generateAIResponse(input),
          timestamp: new Date(),
          confidence: 0.85
        };
        setMessages(prev => [...prev, aiResponse]);
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      console.error('Error sending message:', error);
      setIsLoading(false);
    }
  };

  const generateAIResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes('điểm') || input.includes('kết quả')) {
      return `Dựa trên phân tích dữ liệu học tập gần đây của bạn:\n\n📈 **Xu hướng:** Đang cải thiện tốt\n📚 **Môn thành thạo:** Toán (85%), Anh (90%)\n⚠️ **Cần cải thiện:** Vật Lý (55%), Hóa Học (60%)\n\n**Khuyến nghị:**\n• Dành thêm 30 phút mỗi ngày cho Vật Lý\n• Tìm gia sư hoặc nhóm học cho Hóa Học\n• Tiếp tục phương pháp học tốt cho Toán và Anh`;
    }
    
    if (input.includes('học') && input.includes('như thế nào')) {
      return `Để học tập hiệu quả, tôi đề xuất kế hoạch sau:\n\n🕐 **Thời gian biểu gợi ý:**\n• 19:00-20:30: Ôn bài ngày hôm qua\n• 20:45-21:30: Học bài mới\n• 21:30-22:00: Làm bài tập\n\n🎯 **Phương pháp học:**\n• Sử dụng kỹ thuật Pomodoro (25 phút học, 5 phút nghỉ)\n• Vẽ sơ đồ tư duy cho các môn khó\n• Tập trung vào Vật Lý và Hóa Học trước\n\nBạn muốn tôi tạo kế hoạch chi tiết hơn không?`;
    }
    
    if (input.includes('kế hoạch') || input.includes('lịch học')) {
      return `Tôi sẽ tạo kế hoạch học tập cá nhân hóa cho bạn:\n\n**Tuần này (15/1 - 21/1):**\n\n**Thứ 2:** Toán (Đại số) + Anh (Từ vựng)\n**Thứ 3:** Vật Lý (Cơ học) + Văn (Đọc hiểu)\n**Thứ 4:** Toán (Hình học) + Hóa Học (Hợp chất)\n**Thứ 5:** Anh (Ngữ pháp) + Luyện tập tổng hợp\n**Thứ 6:** Ôn tập tuần + giải đáp thắc mắc\n\n**Mục tiêu:**\n✅ Hoàn thành 80% bài tập\n✅ Điểm kiểm tra > 7.0\n✅ Hiểu rõ các khái niệm cơ bản\n\nBạn có muốn điều chỉnh gì không?`;
    }
    
    return `Cảm ơn câu hỏi của bạn! Đây là chủ đề thú vị. Dựa trên dữ liệu học tập của bạn, tôi nghĩ bạn nên:\n\n1. **Tập trung vào điểm mạnh:** Bạn đang làm rất tốt môn Toán và Anh\n2. **Cải thiện điểm yếu:** Cần thêm thời gian cho Vật Lý và Hóa Học\n3. **Phương pháp học:** Kết hợp lý thuyết và thực hành\n\nBạn có muốn tôi giải thích cụ thể hơn về phần nào không?`;
  };

  const renderMessage = (message: Message) => (
    <div
      key={message.id}
      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`flex max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-2 ${
          message.role === 'user' ? 'bg-blue-500' : 'bg-purple-500'
        }`}>
          {message.role === 'user' ? <User size={16} className="text-white" /> : <Bot size={16} className="text-white" />}
        </div>
        <div className={`px-4 py-3 rounded-lg ${
          message.role === 'user' 
            ? 'bg-blue-500 text-white' 
            : 'bg-gray-100 text-gray-800 border border-gray-200'
        }`}>
          <p className="whitespace-pre-line text-sm">{message.content}</p>
          {message.confidence && (
            <div className="flex items-center mt-2 text-xs opacity-70">
              <Sparkles size={12} className="mr-1" />
              Độ tin cậy: {Math.round(message.confidence * 100)}%
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <TrendingUp className="mr-2 text-green-500" />
          Phân tích học tập
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-800">Xu hướng học tập</h4>
            <p className="text-2xl font-bold text-green-600 mt-2">
              {analytics?.performanceTrend === 'improving' ? '📈 Cải thiện' : 
               analytics?.performanceTrend === 'declining' ? '📉 Giảm' : '➡️ Ổn định'}
            </p>
          </div>
          
          <div className="bg-orange-50 p-4 rounded-lg">
            <h4 className="font-medium text-orange-800">Lỗ hổng kiến thức</h4>
            <div className="mt-2">
              {analytics?.knowledgeGaps.map((gap, index) => (
                <span key={index} className="inline-block bg-orange-200 text-orange-800 px-2 py-1 rounded text-sm mr-2 mb-2">
                  {gap}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <BookOpen className="mr-2 text-blue-500" />
          Mức độ thành thạo
        </h3>
        <div className="space-y-3">
          {analytics?.masteryLevel && Object.entries(analytics.masteryLevel).map(([subject, level]) => (
            <div key={subject}>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">{subject}</span>
                <span className="text-sm text-gray-600">{Math.round(level * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    level >= 0.8 ? 'bg-green-500' : 
                    level >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${level * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Khuyến nghị AI</h3>
        <ul className="space-y-2">
          {analytics?.recommendations.map((rec, index) => (
            <li key={index} className="flex items-start">
              <span className="text-purple-500 mr-2">💡</span>
              <span className="text-sm">{rec}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  const renderContentGenerator = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Tạo nội dung học tập thông minh</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Môn học</label>
            <select className="w-full p-2 border rounded-lg">
              <option>Toán</option>
              <option>Vật Lý</option>
              <option>Hóa Học</option>
              <option>Văn</option>
              <option>Anh</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Chủ đề</label>
            <input type="text" className="w-full p-2 border rounded-lg" placeholder="Nhập chủ đề..." />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Độ khó</label>
            <select className="w-full p-2 border rounded-lg">
              <option>Cơ bản</option>
              <option>Trung bình</option>
              <option>Nâng cao</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Loại nội dung</label>
            <select className="w-full p-2 border rounded-lg">
              <option>Giải thích</option>
              <option>Ví dụ</option>
              <option>Bài tập</option>
              <option>Trắc nghiệm</option>
            </select>
          </div>
        </div>
        
        <button className="mt-4 bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600 transition">
          Tạo nội dung
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <Bot className="mr-2 text-purple-500" />
            AI Assistant
          </h2>
        </div>
        
        <nav className="mt-6">
          <button
            onClick={() => setActiveTab('chat')}
            className={`w-full px-6 py-3 text-left hover:bg-gray-100 transition ${
              activeTab === 'chat' ? 'bg-purple-50 border-l-4 border-purple-500' : ''
            }`}
          >
            💬 Chat với AI
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`w-full px-6 py-3 text-left hover:bg-gray-100 transition ${
              activeTab === 'analytics' ? 'bg-purple-50 border-l-4 border-purple-500' : ''
            }`}
          >
            📊 Phân tích học tập
          </button>
          <button
            onClick={() => setActiveTab('content')}
            className={`w-full px-6 py-3 text-left hover:bg-gray-100 transition ${
              activeTab === 'content' ? 'bg-purple-50 border-l-4 border-purple-500' : ''
            }`}
          >
            📚 Tạo nội dung
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {activeTab === 'chat' && (
          <>
            {/* Chat Header */}
            <div className="bg-white shadow-sm p-4 border-b">
              <h3 className="text-lg font-semibold">Trò chuyện với AI Assistant</h3>
              <p className="text-sm text-gray-600">Hỗ trợ học tập 24/7</p>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6">
              {messages.map(renderMessage)}
              {isLoading && (
                <div className="flex justify-start mb-4">
                  <div className="flex">
                    <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center mr-2">
                      <Bot size={16} className="text-white" />
                    </div>
                    <div className="bg-gray-100 px-4 py-3 rounded-lg border border-gray-200">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <div className="bg-white border-t p-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Nhập câu hỏi của bạn..."
                  className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  disabled={isLoading}
                />
                <button
                  onClick={sendMessage}
                  disabled={isLoading || !input.trim()}
                  className="bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={20} />
                </button>
              </div>
              
              {/* Quick Actions */}
              <div className="mt-3 flex flex-wrap gap-2">
                <button 
                  onClick={() => setInput('Kết quả học tập gần đây của tôi thế nào?')}
                  className="text-xs bg-gray-100 px-3 py-1 rounded-full hover:bg-gray-200 transition"
                >
                  📊 Xem kết quả
                </button>
                <button 
                  onClick={() => setInput('Tạo kế hoạch học tập cho tuần này')}
                  className="text-xs bg-gray-100 px-3 py-1 rounded-full hover:bg-gray-200 transition"
                >
                  📅 Kế hoạch học tập
                </button>
                <button 
                  onClick={() => setInput('Làm thế nào để học Vật Lý hiệu quả?')}
                  className="text-xs bg-gray-100 px-3 py-1 rounded-full hover:bg-gray-200 transition"
                >
                  🔬 Học Vật Lý
                </button>
              </div>
            </div>
          </>
        )}

        {activeTab === 'analytics' && (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold mb-6">Phân tích học tập thông minh</h2>
              {renderAnalytics()}
            </div>
          </div>
        )}

        {activeTab === 'content' && (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold mb-6">Tạo nội dung học tập cá nhân hóa</h2>
              {renderContentGenerator()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIChatView;
