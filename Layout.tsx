import React, { useContext } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  BookOpen, 
  Calendar, 
  FileText, 
  Settings, 
  LogOut, 
  ChevronRight, 
  Bell, 
  Menu, 
  X, 
  MessageCircle, 
  Video, 
  CheckSquare, 
  CreditCard, 
  Library, 
  CalendarDays, 
  Bus, 
  Box, 
  ClipboardList,
  Briefcase,
  Utensils,
  BedDouble,
  Users2,
  HeartPulse,
  MessageSquare
} from 'lucide-react';
import { AppContext } from './context';

export const Sidebar: React.FC<{ mobile?: boolean }> = ({ mobile }) => {
  const { activeTab, setActiveTab, user, logout, toggleMobileMenu } = useContext(AppContext);

  const menuItems = [
    { id: 'dashboard', label: 'Tổng Quan', icon: <LayoutDashboard size={20} /> },
    { id: 'timetable', label: 'Thời Khóa Biểu', icon: <Calendar size={20} /> },
    { id: 'exam', label: 'Thi Cử', icon: <ClipboardList size={20} /> },
    { id: 'lms', label: 'Học Tập (LMS)', icon: <Video size={20} /> },
    { id: 'library', label: 'Thư Viện', icon: <Library size={20} /> }, 
    { id: 'finance', label: 'Tài Chính', icon: <CreditCard size={20} /> }, 
    { id: 'hr', label: 'Nhân Sự', icon: <Briefcase size={20} /> }, 
    { id: 'canteen', label: 'Căng Tin', icon: <Utensils size={20} /> }, 
    { id: 'dormitory', label: 'Ký Túc Xá', icon: <BedDouble size={20} /> }, 
    { id: 'health', label: 'Y Tế', icon: <HeartPulse size={20} /> }, // New
    { id: 'feedback', label: 'Khảo Sát', icon: <MessageSquare size={20} /> }, // New
    { id: 'alumni', label: 'Cựu HS', icon: <Users2 size={20} /> },
    { id: 'transport', label: 'Vận Tải', icon: <Bus size={20} /> },
    { id: 'inventory', label: 'Tài Sản', icon: <Box size={20} /> },
    { id: 'events', label: 'Sự Kiện', icon: <CalendarDays size={20} /> },
    { id: 'attendance', label: 'Điểm Danh', icon: <CheckSquare size={20} /> },
    { id: 'grades', label: 'Sổ Điểm', icon: <FileText size={20} /> },
    { id: 'chat', label: 'Tin Nhắn', icon: <MessageCircle size={20} /> },
    { id: 'classes', label: 'Lớp Học', icon: <Users size={20} /> },
    { id: 'students', label: 'Học Sinh', icon: <GraduationCap size={20} /> },
    { id: 'teachers', label: 'Giáo Viên', icon: <BookOpen size={20} /> },
    { id: 'settings', label: 'Cài Đặt', icon: <Settings size={20} /> },
  ];

  const className = mobile 
    ? "w-64 bg-white h-full shadow-lg flex flex-col" 
    : "w-64 bg-white h-screen border-r border-gray-200 flex flex-col fixed left-0 top-0 z-10 hidden md:flex";

  const handleItemClick = (id: string) => {
    setActiveTab(id);
    if (mobile) toggleMobileMenu();
  };

  return (
    <div className={className} onClick={e => e.stopPropagation()}>
      <div className="p-6 flex items-center gap-3 border-b border-gray-100">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
          <GraduationCap className="text-white" size={20} />
        </div>
        <h1 className="text-xl font-bold text-gray-800 tracking-tight">EduManager</h1>
        {mobile && (
           <button onClick={toggleMobileMenu} className="ml-auto text-gray-500">
             <X size={24} />
           </button>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleItemClick(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              activeTab === item.id 
                ? 'bg-indigo-50 text-indigo-700 font-medium shadow-sm' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
            {activeTab === item.id && <ChevronRight className="ml-auto" size={16} />}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-4 py-3 mb-2 cursor-pointer hover:bg-gray-50 rounded-lg" onClick={() => handleItemClick('settings')}>
          <img src={user?.avatar} alt="User" className="w-8 h-8 rounded-full bg-gray-200" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.fullName}</p>
            <p className="text-xs text-gray-500 truncate">{user?.role}</p>
          </div>
        </div>
        <button 
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
        >
          <LogOut size={18} />
          Đăng xuất
        </button>
      </div>
    </div>
  );
};

export const Header: React.FC<{ onMenuClick: () => void }> = ({ onMenuClick }) => {
  const { notifications, setActiveTab } = useContext(AppContext);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-20 print:hidden">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="md:hidden text-gray-500 hover:text-gray-700">
          <Menu size={24} />
        </button>
        <h2 className="text-lg font-semibold text-gray-800 hidden sm:block">
          Hệ thống Quản lý Trường học
        </h2>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          )}
        </button>
        <div className="h-8 w-px bg-gray-200 mx-1"></div>
        <button onClick={() => setActiveTab('settings')} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
          <Settings size={20} />
        </button>
      </div>
    </header>
  );
};