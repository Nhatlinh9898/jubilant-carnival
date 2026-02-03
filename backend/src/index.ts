import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Import routes
import authRoutes from '@/routes/auth';
import userRoutes from '@/routes/users';
import classRoutes from '@/routes/classes';
import studentRoutes from '@/routes/students';
import teacherRoutes from '@/routes/teachers';
import subjectRoutes from '@/routes/subjects';
import scheduleRoutes from '@/routes/schedules';
import attendanceRoutes from '@/routes/attendance';
import gradeRoutes from '@/routes/grades';
import lmsRoutes from '@/routes/lms';
import chatRoutes from '@/routes/chat';
import financeRoutes from '@/routes/finance';
import libraryRoutes from '@/routes/library';
import eventRoutes from '@/routes/events';
import examRoutes from '@/routes/exams';
import transportRoutes from '@/routes/transport';
import inventoryRoutes from '@/routes/inventory';
import hrRoutes from '@/routes/hr';
import canteenRoutes from '@/routes/canteen';
import dormitoryRoutes from '@/routes/dormitory';
import alumniRoutes from '@/routes/alumni';
import healthRoutes from '@/routes/health';
import feedbackRoutes from '@/routes/feedback';
import aiRoutes from '@/routes/ai';
import standaloneAIRoutes from '@/routes/standaloneAI';
import documentAnalysisRoutes from '@/routes/documentAnalysis';

// Import middleware
import { errorHandler } from '@/middleware/errorHandler';
import { notFound } from '@/middleware/notFound';
import { rateLimiter } from '@/middleware/rateLimiter';

// Load environment variables
dotenv.config();

// Initialize Prisma Client
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

// Create Express app
const app = express();

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate limiting
app.use(rateLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/grades', gradeRoutes);
app.use('/api/lms', lmsRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/transport', transportRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/hr', hrRoutes);
app.use('/api/canteen', canteenRoutes);
app.use('/api/dormitory', dormitoryRoutes);
app.use('/api/alumni', alumniRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/ai-standalone', standaloneAIRoutes);
app.use('/api/documents', documentAnalysisRoutes);

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'EduManager API v1.0',
    version: '1.0.0',
    documentation: '/api/docs',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      classes: '/api/classes',
      students: '/api/students',
      teachers: '/api/teachers',
      subjects: '/api/subjects',
      schedules: '/api/schedules',
      attendance: '/api/attendance',
      grades: '/api/grades',
      lms: '/api/lms',
      chat: '/api/chat',
      finance: '/api/finance',
      library: '/api/library',
      events: '/api/events',
      exams: '/api/exams',
      transport: '/api/transport',
      inventory: '/api/inventory',
      hr: '/api/hr',
      canteen: '/api/canteen',
      dormitory: '/api/dormitory',
      alumni: '/api/alumni',
      health: '/api/health',
      feedback: '/api/feedback',
      ai: '/api/ai',
      'ai-standalone': '/api/ai-standalone',
      'documents': '/api/documents',
    },
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Received SIGINT, shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 EduManager API Server running on port ${PORT}`);
  console.log(`📚 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 API Documentation: http://localhost:${PORT}/api`);
});

export default app;
