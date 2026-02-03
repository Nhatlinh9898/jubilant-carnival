export type Role = 'ADMIN' | 'TEACHER' | 'STUDENT';

export interface User {
  id: number;
  fullName: string;
  email: string;
  role: Role;
  avatar?: string;
  phone?: string;
  address?: string;
}

export interface Class {
  id: number;
  code: string;
  name: string;
  gradeLevel: number;
  academicYear: string;
  homeroomTeacherId?: number;
  studentCount: number;
  room?: string;
}

export interface Student {
  id: number;
  code: string;
  fullName: string;
  classId: number;
  dob: string;
  gender: 'Male' | 'Female';
  status: 'Active' | 'Inactive';
  email?: string;
  phone?: string;
}

export interface Teacher {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  major: string;
  avatar?: string;
}

export interface Subject {
  id: number;
  code: string;
  name: string;
  credits: number;
  color?: string;
}

export interface LMSMaterial {
  id: number;
  title: string;
  type: 'VIDEO' | 'ASSIGNMENT';
  subjectId: number;
  url?: string;
  deadline?: string;
  postedBy: string;
  date: string;
  description?: string;
}

export interface ChatMessage {
  id: number;
  senderId: number;
  senderName: string;
  text: string;
  timestamp: string;
  isMe: boolean;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export interface ScheduleItem {
  day: number;
  period: number;
  subjectId: number;
  teacherId: number;
  room?: string;
}

export interface Invoice {
  id: number;
  studentId: number;
  title: string;
  amount: number;
  dueDate: string;
  status: 'PAID' | 'UNPAID' | 'OVERDUE';
  paymentDate?: string;
}

export interface Book {
  id: number;
  title: string;
  author: string;
  category: string;
  cover?: string;
  status: 'AVAILABLE' | 'BORROWED';
  borrowedBy?: number;
}

export interface SchoolEvent {
  id: number;
  title: string;
  date: string;
  type: 'ACADEMIC' | 'HOLIDAY' | 'ACTIVITY';
  description: string;
}

export interface Exam {
  id: number;
  title: string;
  subjectId: number;
  date: string;
  duration: number;
  totalQuestions: number;
  status: 'UPCOMING' | 'ONGOING' | 'COMPLETED';
}

export interface TransportRoute {
  id: number;
  name: string;
  driverName: string;
  driverPhone: string;
  licensePlate: string;
  capacity: number;
  studentCount: number;
  status: 'ON_ROUTE' | 'IDLE';
}

export interface InventoryItem {
  id: number;
  name: string;
  category: string;
  quantity: number;
  location: string;
  condition: 'GOOD' | 'DAMAGED' | 'MAINTENANCE';
}

export interface Staff {
  id: number;
  fullName: string;
  role: string;
  department: string;
  status: 'Active' | 'On Leave';
  email: string;
  phone: string;
  salary: number;
}

export interface LeaveRequest {
  id: number;
  staffId: number;
  type: 'Sick' | 'Annual' | 'Personal';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

export interface CanteenItem {
  id: number;
  name: string;
  price: number;
  category: 'Food' | 'Drink' | 'Snack';
  image: string;
  available: boolean;
  calories?: number;
}

export interface DormRoom {
  id: number;
  name: string;
  type: 'Male' | 'Female';
  capacity: number;
  occupied: number;
  status: 'Available' | 'Full' | 'Maintenance';
  block: string;
}

export interface Alumnus {
  id: number;
  fullName: string;
  graduationYear: number;
  currentJob: string;
  company: string;
  email: string;
  phone: string;
  avatar: string;
}

// --- New Types for Health & Feedback ---

export interface MedicalRecord {
  id: number;
  studentId: number;
  condition: string;
  allergies: string;
  bloodType: string;
  lastCheckup: string;
  notes: string;
}

export interface HealthIncident {
  id: number;
  studentId: number;
  date: string;
  description: string;
  treatment: string;
  severity: 'Low' | 'Medium' | 'High';
  status: 'Resolved' | 'Follow-up';
}

export interface Survey {
  id: number;
  title: string;
  deadline: string;
  participants: number;
  totalTarget: number;
  status: 'Active' | 'Closed';
  type: 'TeacherEval' | 'Facility' | 'General';
}

export interface FeedbackItem {
  id: number;
  senderName: string; // Often "Anonymous"
  category: string;
  content: string;
  date: string;
  status: 'New' | 'Read' | 'Replied';
}