import { Teacher, Class, Student, Subject, LMSMaterial, ChatMessage, ScheduleItem, Invoice, Book, SchoolEvent, Exam, TransportRoute, InventoryItem, Staff, LeaveRequest, CanteenItem, DormRoom, Alumnus, MedicalRecord, HealthIncident, Survey, FeedbackItem } from './types';

export const MOCK_TEACHERS: Teacher[] = [
  { id: 101, fullName: "Nguyen Van A", email: "anv@school.edu.vn", phone: "0901234567", major: "Toán Học", avatar: "https://ui-avatars.com/api/?name=Nguyen+Van+A&background=e0e7ff&color=4338ca" },
  { id: 102, fullName: "Tran Thi B", email: "btt@school.edu.vn", phone: "0902345678", major: "Ngữ Văn", avatar: "https://ui-avatars.com/api/?name=Tran+Thi+B&background=fce7f3&color=db2777" },
  { id: 103, fullName: "Le Van C", email: "clv@school.edu.vn", phone: "0903456789", major: "Vật Lý", avatar: "https://ui-avatars.com/api/?name=Le+Van+C&background=ffedd5&color=c2410c" },
  { id: 104, fullName: "Pham Thi D", email: "ptd@school.edu.vn", phone: "0904567890", major: "Tiếng Anh", avatar: "https://ui-avatars.com/api/?name=Pham+Thi+D&background=dcfce7&color=15803d" },
];

export const MOCK_CLASSES: Class[] = [
  { id: 1, code: "10A1", name: "Lớp 10A1", gradeLevel: 10, academicYear: "2023-2024", homeroomTeacherId: 101, studentCount: 35, room: "P.201" },
  { id: 2, code: "11B2", name: "Lớp 11B2", gradeLevel: 11, academicYear: "2023-2024", homeroomTeacherId: 102, studentCount: 32, room: "P.202" },
  { id: 3, code: "12C3", name: "Lớp 12C3", gradeLevel: 12, academicYear: "2023-2024", homeroomTeacherId: 103, studentCount: 30, room: "P.301" },
];

export const MOCK_STUDENTS: Student[] = [
  { id: 1001, code: "HS001", fullName: "Tran Minh Tuan", classId: 1, dob: "2008-05-12", gender: "Male", status: "Active", email: "tuan@st.edu.vn", phone: "0987654321" },
  { id: 1002, code: "HS002", fullName: "Le Thu Ha", classId: 1, dob: "2008-08-20", gender: "Female", status: "Active", email: "ha@st.edu.vn", phone: "0987654322" },
  { id: 1003, code: "HS003", fullName: "Nguyen Hoang Nam", classId: 2, dob: "2007-02-15", gender: "Male", status: "Active", email: "nam@st.edu.vn", phone: "0987654323" },
  { id: 1004, code: "HS004", fullName: "Pham Lan Anh", classId: 2, dob: "2006-11-30", gender: "Female", status: "Active", email: "lananh@st.edu.vn", phone: "0987654324" },
  { id: 1005, code: "HS005", fullName: "Do Minh Duc", classId: 3, dob: "2005-09-10", gender: "Male", status: "Active", email: "duc@st.edu.vn", phone: "0987654325" },
];

export const MOCK_SUBJECTS: Subject[] = [
  { id: 1, code: "MATH", name: "Toán Học", credits: 4, color: "bg-blue-100 text-blue-700 border-blue-200" },
  { id: 2, code: "LIT", name: "Ngữ Văn", credits: 3, color: "bg-pink-100 text-pink-700 border-pink-200" },
  { id: 3, code: "ENG", name: "Tiếng Anh", credits: 3, color: "bg-green-100 text-green-700 border-green-200" },
  { id: 4, code: "PHY", name: "Vật Lý", credits: 2, color: "bg-orange-100 text-orange-700 border-orange-200" },
  { id: 5, code: "CHE", name: "Hóa Học", credits: 2, color: "bg-purple-100 text-purple-700 border-purple-200" },
  { id: 6, code: "HIS", name: "Lịch Sử", credits: 1, color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
];

export const MOCK_LMS_MATERIALS: LMSMaterial[] = [
  { id: 1, title: "Bài giảng: Hàm số bậc hai", type: 'VIDEO', subjectId: 1, url: "#", postedBy: "Nguyen Van A", date: "2023-10-15", description: "Video bài giảng chi tiết về hàm số bậc hai, cách vẽ đồ thị và khảo sát sự biến thiên." },
  { id: 2, title: "Bài tập về nhà: Phân tích tác phẩm", type: 'ASSIGNMENT', subjectId: 2, deadline: "2023-10-20", postedBy: "Tran Thi B", date: "2023-10-16", description: "Các em hãy phân tích hình tượng nhân vật chính trong tác phẩm. Nộp file Word hoặc PDF." },
];

export const MOCK_CHAT_HISTORY: ChatMessage[] = [
  { id: 1, senderId: 101, senderName: "Nguyen Van A (GVCN)", text: "Chào em, hôm nay em có đi học không?", timestamp: "08:30", isMe: false },
  { id: 2, senderId: 1, senderName: "Me", text: "Dạ có ạ, em đang trên đường đến trường.", timestamp: "08:31", isMe: true },
];

export const MOCK_SCHEDULE: ScheduleItem[] = [
  { day: 2, period: 1, subjectId: 1, teacherId: 101 }, { day: 2, period: 2, subjectId: 1, teacherId: 101 }, { day: 2, period: 3, subjectId: 3, teacherId: 104 },
  { day: 3, period: 1, subjectId: 2, teacherId: 102 }, { day: 3, period: 2, subjectId: 4, teacherId: 103 },
  { day: 4, period: 1, subjectId: 3, teacherId: 104 }, { day: 4, period: 2, subjectId: 1, teacherId: 101 },
  { day: 5, period: 1, subjectId: 4, teacherId: 103 }, { day: 5, period: 2, subjectId: 2, teacherId: 102 },
  { day: 6, period: 1, subjectId: 1, teacherId: 101 }, { day: 6, period: 2, subjectId: 3, teacherId: 104 },
];

export const MOCK_INVOICES: Invoice[] = [
  { id: 1, studentId: 1001, title: "Học phí HK1 2023-2024", amount: 5000000, dueDate: "2023-09-30", status: "PAID", paymentDate: "2023-09-15" },
  { id: 2, studentId: 1001, title: "Phí Bảo hiểm Y tế", amount: 600000, dueDate: "2023-09-15", status: "PAID", paymentDate: "2023-09-10" },
  { id: 3, studentId: 1002, title: "Học phí HK1 2023-2024", amount: 5000000, dueDate: "2023-09-30", status: "UNPAID" },
  { id: 4, studentId: 1003, title: "Học phí HK1 2023-2024", amount: 5000000, dueDate: "2023-09-15", status: "OVERDUE" },
];

export const MOCK_BOOKS: Book[] = [
  { id: 1, title: "Đại số 10 Nâng cao", author: "Bộ Giáo Dục", category: "Sách Giáo Khoa", status: "AVAILABLE", cover: "https://placehold.co/150x220/e2e8f0/1e293b?text=Toan+10" },
  { id: 2, title: "Vật Lý Đại Cương", author: "Nguyễn Văn X", category: "Tham Khảo", status: "BORROWED", borrowedBy: 1001, cover: "https://placehold.co/150x220/e2e8f0/1e293b?text=Vat+Ly" },
  { id: 3, title: "History of the World", author: "H. G. Wells", category: "Lịch Sử", status: "AVAILABLE", cover: "https://placehold.co/150x220/e2e8f0/1e293b?text=History" },
  { id: 4, title: "Lập trình Python", author: "Guido van Rossum", category: "Tin Học", status: "AVAILABLE", cover: "https://placehold.co/150x220/e2e8f0/1e293b?text=Python" },
];

export const MOCK_EVENTS: SchoolEvent[] = [
  { id: 1, title: "Lễ Khai Giảng", date: "2023-09-05", type: "ACTIVITY", description: "Toàn trường tập trung tại sân trường lúc 7:00." },
  { id: 2, title: "Thi Giữa Kỳ I", date: "2023-11-01", type: "ACADEMIC", description: "Các khối 10, 11, 12 thi tập trung." },
  { id: 3, title: "Nghỉ Lễ Quốc Khánh", date: "2023-09-02", type: "HOLIDAY", description: "Nghỉ theo quy định nhà nước." },
];

export const MOCK_EXAMS: Exam[] = [
  { id: 1, title: "Thi Giữa Kỳ I - Toán 10", subjectId: 1, date: "2023-11-05", duration: 90, totalQuestions: 50, status: 'ONGOING' },
  { id: 2, title: "Kiểm tra 15 phút - Anh 10", subjectId: 3, date: "2023-11-10", duration: 15, totalQuestions: 20, status: 'UPCOMING' },
  { id: 3, title: "Thi Cuối Kỳ I - Vật Lý 10", subjectId: 4, date: "2023-12-20", duration: 60, totalQuestions: 40, status: 'UPCOMING' },
];

export const MOCK_ROUTES: TransportRoute[] = [
  { id: 1, name: "Tuyến 01: Cầu Giấy - Trường", driverName: "Nguyen Van Tai", driverPhone: "0912345678", licensePlate: "29B-123.45", capacity: 45, studentCount: 40, status: 'ON_ROUTE' },
  { id: 2, name: "Tuyến 02: Hà Đông - Trường", driverName: "Le Van Xe", driverPhone: "0912345679", licensePlate: "29B-678.90", capacity: 29, studentCount: 25, status: 'IDLE' },
];

export const MOCK_INVENTORY: InventoryItem[] = [
  { id: 1, name: "Máy chiếu Panasonic", category: "Thiết bị điện tử", quantity: 20, location: "Kho A", condition: 'GOOD' },
  { id: 2, name: "Bàn ghế học sinh", category: "Nội thất", quantity: 500, location: "Các lớp học", condition: 'GOOD' },
  { id: 3, name: "Kính hiển vi quang học", category: "Thiết bị thí nghiệm", quantity: 30, location: "Phòng Lab Lý", condition: 'MAINTENANCE' },
];

export const MOCK_STAFF: Staff[] = [
  { id: 1, fullName: "Nguyen Thi Hanh", role: "Kế toán trưởng", department: "Tài chính", status: "Active", email: "hanh.nt@school.edu.vn", phone: "0988111222", salary: 15000000 },
  { id: 2, fullName: "Tran Van Bao", role: "Bảo vệ", department: "An ninh", status: "Active", email: "bao.tv@school.edu.vn", phone: "0977333444", salary: 7000000 },
  { id: 3, fullName: "Le Thi Mai", role: "Y tá", department: "Y tế", status: "On Leave", email: "mai.lt@school.edu.vn", phone: "0966555666", salary: 9000000 },
];

export const MOCK_LEAVE_REQUESTS: LeaveRequest[] = [
  { id: 1, staffId: 3, type: "Sick", startDate: "2023-10-20", endDate: "2023-10-22", reason: "Sốt virus", status: "Approved" },
  { id: 2, staffId: 1, type: "Annual", startDate: "2023-11-01", endDate: "2023-11-05", reason: "Du lịch gia đình", status: "Pending" },
];

export const MOCK_MENU: CanteenItem[] = [
  { id: 1, name: "Cơm Rang Thập Cẩm", price: 35000, category: "Food", available: true, calories: 550, image: "https://placehold.co/200x200/ffedd5/c2410c?text=Com+Rang" },
  { id: 2, name: "Phở Bò", price: 40000, category: "Food", available: true, calories: 450, image: "https://placehold.co/200x200/dcfce7/15803d?text=Pho+Bo" },
  { id: 3, name: "Bánh Mì Pate", price: 20000, category: "Food", available: true, calories: 350, image: "https://placehold.co/200x200/fce7f3/db2777?text=Banh+Mi" },
  { id: 4, name: "Nước Cam Ép", price: 25000, category: "Drink", available: true, calories: 120, image: "https://placehold.co/200x200/e0e7ff/4338ca?text=Nuoc+Cam" },
  { id: 5, name: "Sữa Chua", price: 10000, category: "Snack", available: true, calories: 100, image: "https://placehold.co/200x200/f3f4f6/374151?text=Sua+Chua" },
];

export const MOCK_DORM_ROOMS: DormRoom[] = [
  { id: 101, name: "Phòng 101 - A1", type: "Male", capacity: 4, occupied: 3, status: "Available", block: "A" },
  { id: 102, name: "Phòng 102 - A1", type: "Male", capacity: 4, occupied: 4, status: "Full", block: "A" },
  { id: 201, name: "Phòng 201 - B1", type: "Female", capacity: 6, occupied: 2, status: "Available", block: "B" },
  { id: 202, name: "Phòng 202 - B1", type: "Female", capacity: 6, occupied: 0, status: "Maintenance", block: "B" },
];

export const MOCK_ALUMNI: Alumnus[] = [
  { id: 1, fullName: "Phạm Nhật M", graduationYear: 2010, currentJob: "CEO", company: "Tech Group", email: "m.pham@tech.com", phone: "0999888777", avatar: "https://ui-avatars.com/api/?name=Pham+Nhat+M&background=0D8ABC&color=fff" },
  { id: 2, fullName: "Tran Thu T", graduationYear: 2012, currentJob: "Marketing Manager", company: "Vin Corp", email: "t.tran@vin.com", phone: "0999111222", avatar: "https://ui-avatars.com/api/?name=Tran+Thu+T&background=random&color=fff" },
  { id: 3, fullName: "Nguyen Van K", graduationYear: 2015, currentJob: "Software Engineer", company: "Google", email: "k.nguyen@google.com", phone: "0999333444", avatar: "https://ui-avatars.com/api/?name=Nguyen+Van+K&background=random&color=fff" },
];

// Mock Health Data
export const MOCK_MEDICAL_RECORDS: MedicalRecord[] = [
  { id: 1, studentId: 1001, condition: "Hen suyễn nhẹ", allergies: "Phấn hoa", bloodType: "A+", lastCheckup: "2023-08-15", notes: "Cần mang theo ống hít." },
  { id: 2, studentId: 1003, condition: "Bình thường", allergies: "Hải sản", bloodType: "O", lastCheckup: "2023-09-01", notes: "Không có vấn đề gì." },
];

export const MOCK_HEALTH_INCIDENTS: HealthIncident[] = [
  { id: 1, studentId: 1005, date: "2023-10-10", description: "Ngã khi đá bóng", treatment: "Băng bó vết thương, chườm đá", severity: "Medium", status: "Resolved" },
  { id: 2, studentId: 1002, date: "2023-11-05", description: "Đau bụng, sốt nhẹ", treatment: "Nghỉ ngơi tại phòng y tế, uống thuốc hạ sốt", severity: "Low", status: "Resolved" },
];

// Mock Feedback Data
export const MOCK_SURVEYS: Survey[] = [
  { id: 1, title: "Đánh giá chất lượng giảng dạy HK1", deadline: "2023-12-31", participants: 150, totalTarget: 500, status: 'Active', type: 'TeacherEval' },
  { id: 2, title: "Khảo sát chất lượng bữa ăn Căng tin", deadline: "2023-11-30", participants: 300, totalTarget: 500, status: 'Closed', type: 'Facility' },
];

export const MOCK_FEEDBACKS: FeedbackItem[] = [
  { id: 1, senderName: "Ẩn danh", category: "Cơ sở vật chất", content: "Điều hòa phòng 201 bị hỏng, mong nhà trường sửa sớm.", date: "2023-11-15", status: 'New' },
  { id: 2, senderName: "Phụ huynh em A", category: "Giảng dạy", content: "Cô giáo môn Anh dạy rất dễ hiểu, cảm ơn nhà trường.", date: "2023-11-10", status: 'Replied' },
];

export const api = {
  getClasses: () => Promise.resolve(MOCK_CLASSES),
  getStudents: () => Promise.resolve(MOCK_STUDENTS),
  getTeachers: () => Promise.resolve(MOCK_TEACHERS),
  getSubjects: () => Promise.resolve(MOCK_SUBJECTS),
  getLMSMaterials: () => Promise.resolve(MOCK_LMS_MATERIALS),
  getSchedule: () => Promise.resolve(MOCK_SCHEDULE),
  getInvoices: () => Promise.resolve(MOCK_INVOICES),
  getBooks: () => Promise.resolve(MOCK_BOOKS),
  getEvents: () => Promise.resolve(MOCK_EVENTS),
  getExams: () => Promise.resolve(MOCK_EXAMS),
  getRoutes: () => Promise.resolve(MOCK_ROUTES),
  getInventory: () => Promise.resolve(MOCK_INVENTORY),
  getStaff: () => Promise.resolve(MOCK_STAFF),
  getLeaveRequests: () => Promise.resolve(MOCK_LEAVE_REQUESTS),
  getMenu: () => Promise.resolve(MOCK_MENU),
  getDormRooms: () => Promise.resolve(MOCK_DORM_ROOMS),
  getAlumni: () => Promise.resolve(MOCK_ALUMNI),
  getMedicalRecords: () => Promise.resolve(MOCK_MEDICAL_RECORDS),
  getHealthIncidents: () => Promise.resolve(MOCK_HEALTH_INCIDENTS),
  getSurveys: () => Promise.resolve(MOCK_SURVEYS),
  getFeedbacks: () => Promise.resolve(MOCK_FEEDBACKS),
};