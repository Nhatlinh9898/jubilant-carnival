# 🚀 EduManager Backend API

## 📋 Overview

Backend API cho hệ thống quản lý giáo dục EduManager, được xây dựng với Node.js, Express, TypeScript và Prisma.

## 🛠️ Tech Stack

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JWT
- **Validation:** Joi
- **File Upload:** Multer
- **Rate Limiting:** rate-limiter-flexible

## 📁 Project Structure

```
backend/
├── src/
│   ├── controllers/     # Business logic
│   ├── routes/         # API routes
│   ├── middleware/     # Custom middleware
│   ├── models/         # Data models
│   ├── utils/          # Utility functions
│   ├── config/         # Configuration files
│   ├── types/          # TypeScript type definitions
│   └── index.ts        # Server entry point
├── prisma/
│   ├── schema.prisma   # Database schema
│   └── seed.ts         # Seed data
├── uploads/            # File uploads
├── logs/              # Application logs
└── dist/              # Compiled JavaScript
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

1. **Clone và cài đặt dependencies:**
```bash
cd backend
npm install
```

2. **Cấu hình environment variables:**
```bash
cp .env.example .env
# Chỉnh sửa .env với thông tin database và các cấu hình khác
```

3. **Setup database:**
```bash
# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Seed database (optional)
npm run db:seed
```

4. **Khởi động server:**
```bash
# Development mode
npm run dev

# Production mode
npm run build
npm start
```

## 📚 API Documentation

### Base URL
```
Development: http://localhost:3001
Production: https://api.edumanager.edu.vn
```

### Authentication

API sử dụng JWT token cho authentication. Include token trong header:

```
Authorization: Bearer <token>
```

### Main Endpoints

#### 🔐 Authentication
- `POST /api/auth/register` - Đăng ký user mới
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/me` - Lấy thông tin user hiện tại

#### 👥 Users Management
- `GET /api/users` - Lấy danh sách users
- `GET /api/users/:id` - Lấy chi tiết user
- `PUT /api/users/:id` - Cập nhật user
- `DELETE /api/users/:id` - Xóa user

#### 🎓 Students
- `GET /api/students` - Lấy danh sách học sinh
- `POST /api/students` - Thêm học sinh mới
- `GET /api/students/:id` - Chi tiết học sinh
- `PUT /api/students/:id` - Cập nhật học sinh
- `DELETE /api/students/:id` - Xóa học sinh

#### 🏫 Classes
- `GET /api/classes` - Danh sách lớp học
- `POST /api/classes` - Tạo lớp mới
- `PUT /api/classes/:id` - Cập nhật lớp
- `DELETE /api/classes/:id` - Xóa lớp

#### 👨‍🏫 Teachers
- `GET /api/teachers` - Danh sách giáo viên
- `POST /api/teachers` - Thêm giáo viên mới
- `PUT /api/teachers/:id` - Cập nhật giáo viên

#### 📚 Subjects
- `GET /api/subjects` - Danh sách môn học
- `POST /api/subjects` - Thêm môn học mới

#### 📅 Schedules
- `GET /api/schedules` - Thời khóa biểu
- `POST /api/schedules` - Tạo lịch học

#### 📝 Attendance
- `GET /api/attendance` - Danh sách điểm danh
- `POST /api/attendance` - Điểm danh
- `PUT /api/attendance/:id` - Cập nhật điểm danh

#### 📊 Grades
- `GET /api/grades` - Bảng điểm
- `POST /api/grades` - Nhập điểm
- `PUT /api/grades/:id` - Cập nhật điểm

#### 💬 Chat
- `GET /api/chat` - Lịch sử hội thoại
- `POST /api/chat` - Gửi tin nhắn

#### 💰 Finance
- `GET /api/finance/invoices` - Hóa đơn
- `POST /api/finance/invoices` - Tạo hóa đơn

#### 📚 Library
- `GET /api/library/books` - Sách thư viện
- `POST /api/library/books` - Thêm sách mới

#### 🎉 Events
- `GET /api/events` - Sự kiện trường
- `POST /api/events` - Tạo sự kiện

#### 📝 Exams
- `GET /api/exams` - Lịch thi
- `POST /api/exams` - Tạo kỳ thi

#### 🚌 Transport
- `GET /api/transport/routes` - Tuyến xe
- `POST /api/transport/routes` - Thêm tuyến mới

#### 📦 Inventory
- `GET /api/inventory/items` - Tài sản
- `POST /api/inventory/items` - Thêm tài sản

#### 👥 HR
- `GET /api/hr/staff` - Nhân sự
- `POST /api/hr/staff` - Thêm nhân viên

#### 🍽️ Canteen
- `GET /api/canteen/menu` - Thực đơn căng tin
- `POST /api/canteen/orders` - Đặt món

#### 🏠 Dormitory
- `GET /api/dormitory/rooms` - Phòng ký túc xá
- `POST /api/dormitory/rooms` - Thêm phòng

#### 🎓 Alumni
- `GET /api/alumni` - Cựu học sinh
- `POST /api/alumni` - Thêm cựu học sinh

#### 🏥 Health
- `GET /api/health/records` - Hồ sơ y tế
- `POST /api/health/incidents` - Báo cáo sự cố

#### 💬 Feedback
- `GET /api/feedback` - Phản hồi
- `POST /api/feedback` - Gửi phản hồi

## 🔧 Development

### Database Commands
```bash
# Tạo migration mới
npx prisma migrate dev --name <migration-name>

# Reset database
npx prisma migrate reset

# Xem database
npx prisma studio
```

### Testing
```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

### Code Quality
```bash
# Lint code
npm run lint

# Format code
npm run format
```

## 🚀 Deployment

### Environment Variables
```env
NODE_ENV=production
PORT=3001
DATABASE_URL="postgresql://user:password@localhost:5432/edumanager"
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"
```

### Build & Deploy
```bash
# Build for production
npm run build

# Start production server
npm start
```

## 🔒 Security Features

- JWT Authentication
- Rate Limiting
- CORS Configuration
- Helmet Security Headers
- Input Validation
- Password Hashing
- SQL Injection Prevention (Prisma)

## 📝 API Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

MIT License - xem [LICENSE](LICENSE) file

## 🆘 Support

- Email: support@edumanager.edu.vn
- Documentation: https://docs.edumanager.edu.vn
- Issues: https://github.com/edumanager/backend/issues
