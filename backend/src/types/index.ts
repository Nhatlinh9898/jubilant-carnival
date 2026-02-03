// User and Authentication Types
export interface User {
  id: number;
  email: string;
  fullName: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  address?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT'
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  user: User;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
  phone?: string;
  address?: string;
}

// Student Types
export interface Student {
  id: number;
  userId: number;
  code: string;
  classId: number;
  dob: Date;
  gender: Gender;
  status: StudentStatus;
  createdAt: Date;
  updatedAt: Date;
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE'
}

export enum StudentStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  GRADUATED = 'GRADUATED'
}

export interface StudentWithUser extends Student {
  user: User;
  class?: Class;
}

// Teacher Types
export interface Teacher {
  id: number;
  userId: number;
  major: string;
  salary?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeacherWithUser extends Teacher {
  user: User;
  subjects?: Subject[];
  classes?: Class[];
}

// Class Types
export interface Class {
  id: number;
  code: string;
  name: string;
  gradeLevel: number;
  academicYear: string;
  homeroomTeacherId?: number;
  studentCount?: number;
  room?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClassWithDetails extends Class {
  homeroomTeacher?: TeacherWithUser;
  students?: StudentWithUser[];
}

// Subject Types
export interface Subject {
  id: number;
  code: string;
  name: string;
  description?: string;
  teacherId?: number;
  color?: string;
  credits?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubjectWithTeacher extends Subject {
  teacher?: TeacherWithUser;
}

// Grade Types
export interface Grade {
  id: number;
  studentId: number;
  subjectId: number;
  score: number;
  maxScore: number;
  examType: ExamType;
  semester: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum ExamType {
  QUIZ = 'QUIZ',
  MIDTERM = 'MIDTERM',
  FINAL = 'FINAL',
  ASSIGNMENT = 'ASSIGNMENT',
  PROJECT = 'PROJECT'
}

export interface GradeWithDetails extends Grade {
  student: StudentWithUser;
  subject: SubjectWithTeacher;
}

// Attendance Types
export interface Attendance {
  id: number;
  studentId: number;
  date: Date;
  status: AttendanceStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE'
}

export interface AttendanceWithStudent extends Attendance {
  student: StudentWithUser;
}

// Schedule Types
export interface Schedule {
  id: number;
  classId: number;
  subjectId: number;
  teacherId: number;
  day: number;
  period: number;
  room?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ScheduleWithDetails extends Schedule {
  class: Class;
  subject: SubjectWithTeacher;
  teacher: TeacherWithUser;
}

// Notification Types
export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Chat Message Types
export interface ChatMessage {
  id: number;
  senderId: number;
  recipientId?: number;
  content: string;
  timestamp: Date;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessageWithSender extends ChatMessage {
  sender: User;
}

// Invoice Types
export interface Invoice {
  id: number;
  studentId: number;
  title: string;
  description?: string;
  amount: number;
  dueDate: Date;
  status: InvoiceStatus;
  paymentDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum InvoiceStatus {
  UNPAID = 'UNPAID',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED'
}

// Library Book Types
export interface LibraryBook {
  id: number;
  title: string;
  author: string;
  isbn?: string;
  category?: string;
  description?: string;
  coverImage?: string;
  totalCopies: number;
  availableCopies: number;
  borrowedDate?: Date;
  dueDate?: Date;
  borrowedStudentId?: number;
  status: BookStatus;
  createdAt: Date;
  updatedAt: Date;
}

export enum BookStatus {
  AVAILABLE = 'AVAILABLE',
  BORROWED = 'BORROWED',
  RESERVED = 'RESERVED',
  MAINTENANCE = 'MAINTENANCE'
}

// Event Types
export interface SchoolEvent {
  id: number;
  title: string;
  description?: string;
  date: Date;
  time?: string;
  location?: string;
  type: EventType;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum EventType {
  ACADEMIC = 'ACADEMIC',
  SPORTS = 'SPORTS',
  CULTURAL = 'CULTURAL',
  HOLIDAY = 'HOLIDAY',
  MEETING = 'MEETING'
}

// Exam Types
export interface Exam {
  id: number;
  title: string;
  description?: string;
  subjectId: number;
  date: Date;
  time?: string;
  duration?: number;
  room?: string;
  type: ExamType;
  status: ExamStatus;
  createdAt: Date;
  updatedAt: Date;
}

export enum ExamStatus {
  UPCOMING = 'UPCOMING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: PaginationInfo;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ErrorResponse {
  success: false;
  error: string;
  details?: any;
}

// Query Parameters Types
export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  dateFrom?: string;
  dateTo?: string;
}

export interface StudentQueryParams extends QueryParams {
  classId?: number;
  status?: StudentStatus;
  gender?: Gender;
}

export interface GradeQueryParams extends QueryParams {
  studentId?: number;
  subjectId?: number;
  classId?: number;
  examType?: ExamType;
  semester?: string;
}

export interface AttendanceQueryParams extends QueryParams {
  studentId?: number;
  classId?: number;
  status?: AttendanceStatus;
}

// Request Body Types
export interface CreateStudentRequest {
  code: string;
  fullName: string;
  email: string;
  password: string;
  classId: number;
  dob: string;
  gender: Gender;
  phone?: string;
  address?: string;
}

export interface UpdateStudentRequest {
  classId?: number;
  status?: StudentStatus;
}

export interface CreateTeacherRequest {
  fullName: string;
  email: string;
  password: string;
  major: string;
  salary?: number;
  phone?: string;
  address?: string;
}

export interface CreateGradeRequest {
  studentId: number;
  subjectId: number;
  score: number;
  maxScore?: number;
  examType?: ExamType;
  semester?: string;
  notes?: string;
}

export interface CreateAttendanceRequest {
  studentId: number;
  date: string;
  status: AttendanceStatus;
  notes?: string;
}

export interface BulkAttendanceRequest {
  classId: number;
  date: string;
  attendance: Array<{
    studentId: number;
    status: AttendanceStatus;
    notes?: string;
  }>;
}

export interface BulkGradeRequest {
  grades: Array<{
    studentId: number;
    subjectId: number;
    score: number;
    maxScore?: number;
    examType?: ExamType;
    semester?: string;
    notes?: string;
  }>;
}

// Dashboard Types
export interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  activeUsers: number;
}

export interface StudentDashboard {
  user: User;
  class: Class;
  stats: {
    attendanceRate: number;
    averageGrade: number;
    totalGrades: number;
    unreadNotifications: number;
  };
  recentGrades: GradeWithDetails[];
  recentAttendance: AttendanceWithStudent[];
  upcomingEvents: SchoolEvent[];
  notifications: Notification[];
}

export interface TeacherDashboard {
  user: User;
  stats: {
    totalClasses: number;
    totalSubjects: number;
    totalStudents: number;
    todaySchedule: number;
    unreadNotifications: number;
  };
  todaySchedule: ScheduleWithDetails[];
  todayAttendance: AttendanceWithStudent[];
  notifications: Notification[];
}

export interface AdminDashboard {
  stats: DashboardStats;
  notifications: Notification[];
}

// Mobile API Types
export interface MobileDevice {
  deviceToken: string;
  platform: 'ios' | 'android';
  deviceModel?: string;
  appVersion?: string;
}

export interface MobileSyncRequest {
  lastSyncTime?: string;
  dataType: 'grades' | 'attendance' | 'notifications' | 'schedule';
}

export interface MobileSyncResponse {
  lastSyncTime: string;
  dataType: string;
  records: any;
}

// Search Types
export interface SearchRequest {
  query: string;
  type?: 'all' | 'students' | 'teachers' | 'classes' | 'subjects';
  limit?: number;
}

export interface SearchResponse {
  query: string;
  type: string;
  results: {
    students?: StudentWithUser[];
    teachers?: TeacherWithUser[];
    classes?: Class[];
    subjects?: Subject[];
  };
}

// Analytics Types
export interface AttendanceAnalytics {
  daily: Array<{
    date: string;
    present: number;
    absent: number;
    rate: number;
  }>;
  weekly: Array<{
    week: string;
    rate: number;
  }>;
  monthly: Array<{
    month: string;
    rate: number;
  }>;
}

export interface GradeAnalytics {
  gradeDistribution: Array<{
    range: string;
    count: number;
  }>;
  subjectPerformance: Array<{
    subject: string;
    average: number;
    passRate: number;
  }>;
  classRanking: Array<{
    className: string;
    average: number;
    rank: number;
  }>;
}

export interface FinancialAnalytics {
  revenue: Array<{
    month: string;
    amount: number;
  }>;
  expenses: Array<{
    category: string;
    amount: number;
  }>;
  outstandingFees: number;
}

export interface EngagementAnalytics {
  lmsUsage: Array<{
    date: string;
    views: number;
    downloads: number;
  }>;
  libraryUsage: Array<{
    month: string;
    booksBorrowed: number;
  }>;
  portalLogins: Array<{
    date: string;
    logins: number;
  }>;
}

// Cache Types
export interface CacheOptions {
  ttl?: number;
  prefix?: string;
}

// Audit Types
export interface AuditLog {
  id: number;
  userId?: number;
  userRole?: string;
  action: AuditAction;
  resource: AuditResource;
  resourceId?: number;
  resourceType?: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
  level: AuditLevel;
  timestamp: Date;
  sessionId?: string;
  success?: boolean;
  errorMessage?: string;
}

export enum AuditAction {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  EXPORT = 'EXPORT',
  IMPORT = 'IMPORT',
  PRINT = 'PRINT',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  SEND_EMAIL = 'SEND_EMAIL',
  FILE_UPLOAD = 'FILE_UPLOAD',
  FILE_DOWNLOAD = 'FILE_DOWNLOAD',
  SYSTEM_CONFIG = 'SYSTEM_CONFIG',
  SECURITY_ALERT = 'SECURITY_ALERT',
  ERROR = 'ERROR'
}

export enum AuditResource {
  USER = 'USER',
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
  CLASS = 'CLASS',
  SUBJECT = 'SUBJECT',
  GRADE = 'GRADE',
  ATTENDANCE = 'ATTENDANCE',
  SCHEDULE = 'SCHEDULE',
  INVOICE = 'INVOICE',
  LIBRARY_BOOK = 'LIBRARY_BOOK',
  EVENT = 'EVENT',
  EXAM = 'EXAM',
  NOTIFICATION = 'NOTIFICATION',
  REPORT = 'REPORT',
  SYSTEM = 'SYSTEM'
}

export enum AuditLevel {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL'
}

// Scheduler Types
export interface ScheduledTask {
  id: string;
  name: string;
  schedule: string;
  enabled: boolean;
  lastRun?: Date;
  nextRun?: Date;
  handler: () => Promise<void>;
}

// File Upload Types
export interface FileUploadOptions {
  maxSize?: number;
  allowedTypes?: string[];
  destination?: string;
}

export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
}

// Email Types
export interface EmailOptions {
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  subject: string;
  html: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    path: string;
    contentType?: string;
  }>;
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

// WebSocket Types
export interface SocketUser {
  id: number;
  role: string;
  fullName: string;
  avatar?: string;
}

export interface SocketMessage {
  type: string;
  data: any;
  timestamp: Date;
  sender?: SocketUser;
}

export interface NotificationMessage extends SocketMessage {
  type: 'notification';
  data: {
    id: number;
    title: string;
    message: string;
    type: string;
    timestamp: Date;
  };
}

export interface ChatMessageData extends SocketMessage {
  type: 'chat';
  data: {
    id: number;
    senderId: number;
    recipientId?: number;
    content: string;
    timestamp: Date;
    sender: SocketUser;
  };
}

// Validation Types
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Export Types
export interface ExportOptions {
  format: 'csv' | 'json' | 'pdf' | 'excel';
  dateFrom?: Date;
  dateTo?: Date;
  filters?: Record<string, any>;
}

export interface ExportResponse {
  url: string;
  filename: string;
  size: number;
  format: string;
}

// Health Check Types
export interface HealthCheck {
  status: 'healthy' | 'unhealthy';
  timestamp: Date;
  services: {
    database: ServiceStatus;
    redis: ServiceStatus;
    email: ServiceStatus;
  };
  metrics: {
    uptime: number;
    memory: NodeJS.MemoryUsage;
    cpu: number;
  };
}

export interface ServiceStatus {
  status: 'healthy' | 'unhealthy';
  latency?: number;
  error?: string;
}

// Configuration Types
export interface AppConfig {
  port: number;
  nodeEnv: string;
  databaseUrl: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  redisHost: string;
  redisPort: number;
  redisPassword?: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  awsAccessKeyId?: string;
  awsSecretAccessKey?: string;
  awsS3Bucket?: string;
  awsRegion?: string;
  corsOrigin: string;
  fromEmail: string;
  fromName: string;
  supportEmail: string;
  frontendUrl: string;
}

// Error Types
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  public errors: ValidationError[];

  constructor(errors: ValidationError[]) {
    super('Validation failed', 400);
    this.errors = errors;
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409);
  }
}

export class InternalServerError extends AppError {
  constructor(message: string = 'Internal server error') {
    super(message, 500);
  }
}

// Utility Types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Database Transaction Types
export type TransactionCallback<T> = (tx: any) => Promise<T>;

// Middleware Types
export interface AuthenticatedRequest extends Request {
  user?: User;
  isMobile?: boolean;
  deviceInfo?: {
    userAgent: string;
    platform: string;
    timestamp: Date;
  };
}

// Export all types
export * from './api';
export * from './database';
export * from './validation';
export * from './utils';
