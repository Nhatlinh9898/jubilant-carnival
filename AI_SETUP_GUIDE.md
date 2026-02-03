# 🤖 AI Integration Guide for EduManager

## Tổng quan

EduManager đã được tích hợp hệ thống AI local thông minh để hỗ trợ học tập và quản lý giáo dục. Hệ thống AI bao gồm:

- 🤖 **AI Chat Assistant** - Trợ lý ảo 24/7 cho học sinh
- 📊 **Learning Analytics** - Phân tích học tập thông minh
- 🎯 **Smart Content Generation** - Tạo nội dung học tập cá nhân hóa
- 📝 **AI-Powered Grading** - Chấm bài tự động với feedback
- 📈 **Performance Prediction** - Dự báo kết quả học tập

## 🚀 Cài đặt

### 1. Dependencies

```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies  
cd ..
npm install
```

### 2. Cấu hình Environment

Tạo file `.env` trong thư mục `backend`:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/edumanager"

# AI Configuration
OLLAMA_URL="http://localhost:11434"
OLLAMA_MODEL="llama2"

# Server
PORT=3001
NODE_ENV=development
CORS_ORIGIN="http://localhost:3000"
```

### 3. Cài đặt Ollama (Local LLM)

```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Pull model
ollama pull llama2

# Start Ollama server
ollama serve
```

### 4. Database Setup

```bash
# Generate Prisma client
cd backend
npx prisma generate

# Run database migrations
npx prisma migrate dev

# (Optional) Seed database
npx prisma db seed
```

### 5. Khởi động ứng dụng

```bash
# Start backend server
cd backend
npm run dev

# Start frontend (mở terminal mới)
npm run dev
```

## 📚 API Endpoints

### AI Chat
```
POST /api/ai/chat
Body: {
  "studentId": 1,
  "message": "Kết quả học tập của tôi thế nào?"
}
```

### Learning Analytics
```
GET /api/ai/analytics/student/:studentId
GET /api/ai/analytics/class/:classId
```

### Content Generation
```
POST /api/ai/content/generate
Body: {
  "subject": "Toán",
  "topic": "Phương trình bậc 2",
  "difficulty": "intermediate",
  "contentType": "explanation"
}
```

### AI Grading
```
POST /api/ai/grade
Body: {
  "assignmentText": "Giải phương trình x² + 5x + 6 = 0",
  "rubric": { "maxScore": 10 },
  "studentAnswer": "x = -2, x = -3"
}
```

### Study Plan
```
POST /api/ai/study-plan
Body: {
  "studentId": 1,
  "goals": ["Cải thiện điểm Vật Lý", "Đạt điểm 8+ Toán"],
  "timeframe": 30
}
```

## 🎯 Tính năng AI

### 1. AI Chat Assistant

- **Hỗ trợ 24/7**: Trả lời câu hỏi học tập anytime
- **Context-aware**: Hiểu thông tin học tập của học sinh
- **Personalized**: Đưa ra khuyến nghị cá nhân hóa
- **Multi-language**: Hỗ trợ Tiếng Việt

**Sample interactions:**
```
User: "Điểm gần đây của tôi thế nào?"
AI: "Dựa trên phân tích, điểm Toán của bạn đang cải thiện (8.2/10), 
     nhưng Vật Lý cần chú ý hơn (5.5/10). Tôi khuyên nên..."

User: "Làm thế nào để học hiệu quả hơn?"
AI: "Dựa trên pattern học tập của bạn, tôi đề xuất:
     • Học vào buổi sáng (9:00-11:00) 
     • Sử dụng sơ đồ tư duy cho Vật Lý
     • Luyện tập 30 phút mỗi ngày"
```

### 2. Learning Analytics

- **Performance Trends**: Phân tích xu hướng học tập
- **Knowledge Gaps**: Xác định lỗ hổng kiến thức
- **Mastery Levels**: Đánh giá mức độ thành thạo từng môn
- **Predictive Insights**: Dự báo kết quả tương lai

### 3. Smart Content Generation

- **Adaptive Content**: Nội dung phù hợp với trình độ
- **Multiple Formats**: Explanation, Examples, Exercises, Quizzes
- **Interactive Elements**: Code snippets, diagrams, simulations
- **Subject Coverage**: Toán, Lý, Hóa, Văn, Anh, etc.

### 4. AI-Powered Grading

- **Automated Scoring**: Chấm điểm tự động
- **Detailed Feedback**: Phản hồi chi tiết
- **Rubric-based**: Đánh giá theo tiêu chí
- **Consistency**: Đảm bảo tính công bằng

### 5. Study Plan Generator

- **Personalized Plans**: Kế hoạch học tập cá nhân
- **Goal-oriented**: Dựa trên mục tiêu cụ thể
- **Time-based**: Phân bổ thời gian hợp lý
- **Flexible**: Dễ dàng điều chỉnh

## 🛠️ Configuration

### AI Model Settings

```javascript
// backend/src/services/aiLocalService.ts
const aiConfig = {
  model: "llama2",           // hoặc "codellama", "mistral", etc.
  temperature: 0.7,          // Level of creativity
  maxTokens: 1000,          // Response length
  contextWindow: 4096       // Memory size
};
```

### Custom Prompts

```javascript
// Customize AI responses
const systemPrompt = `
Bạn là trợ lý AI chuyên giáo dục cho EduManager.
Hãy hỗ trợ học sinh một cách:
- Thân thiện và khuyến khích
- Chính xác và có tính giáo dục  
- Cá nhân hóa dựa trên dữ liệu học tập
- Sử dụng ngôn ngữ Tiếng Việt
`;
```

## 📊 Usage Examples

### Frontend Integration

```typescript
// Using AI Chat in React
import { useState } from 'react';

const AIChat = () => {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');

  const sendMessage = async () => {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId: 1,
        message
      })
    });
    
    const data = await res.json();
    setResponse(data.data.content);
  };

  return (
    <div>
      <input value={message} onChange={(e) => setMessage(e.target.value)} />
      <button onClick={sendMessage}>Gửi</button>
      <div>{response}</div>
    </div>
  );
};
```

### Backend Usage

```typescript
// Using AI Service in Controller
import { AILocalService } from '@/services/aiLocalService';

const aiService = new AILocalService();

// Get student analytics
const analytics = await aiService.generateLearningAnalytics(studentId);

// Generate study plan
const studyPlan = await aiService.generateStudyPlan(
  studentId, 
  ['Cải thiện điểm Toán'], 
  30
);
```

## 🔧 Troubleshooting

### Common Issues

1. **Ollama connection failed**
   ```bash
   # Check if Ollama is running
   curl http://localhost:11434/api/tags
   
   # Restart Ollama
   ollama serve
   ```

2. **Database connection error**
   ```bash
   # Check database URL in .env
   # Restart PostgreSQL service
   sudo systemctl restart postgresql
   ```

3. **TypeScript errors**
   ```bash
   # Install missing types
   npm install --save-dev @types/node @types/express
   ```

4. **Frontend build errors**
   ```bash
   # Clear node_modules
   rm -rf node_modules package-lock.json
   npm install
   ```

### Performance Optimization

- **Caching**: Enable Redis for AI responses
- **Load Balancing**: Multiple Ollama instances
- **Model Optimization**: Use smaller models for simple tasks
- **Batch Processing**: Process multiple requests together

## 🔮 Future Enhancements

### Planned Features

- [ ] **Voice Interaction**: Chat bằng giọng nói
- [ ] **Image Recognition**: Chấm bài viết tay
- [ ] **Multi-modal**: Text + Image + Audio
- [ ] **Real-time Collaboration**: AI trong group study
- [ ] **Emotional Intelligence**: Phát hiện cảm xúc học sinh
- [ ] **Advanced Analytics**: Deep learning insights

### Integration Options

- **OpenAI GPT-4**: Cho premium features
- **Google Gemini**: Multi-modal capabilities
- **Local Models**: Ollama, LM Studio
- **Custom Training**: Fine-tune trên dữ liệu trường

## 📞 Support

### Documentation
- API Docs: `http://localhost:3001/api`
- Swagger UI: `http://localhost:3001/api/docs`

### Community
- GitHub Issues: Report bugs và request features
- Discord Server: Live chat support
- Email: ai-support@edumanager.edu

---

**🎉 Chúc bạn có trải nghiệm tuyệt vời với AI trong EduManager!**

*Last updated: January 2026*
