import React, { createContext, useState, useEffect } from 'react';
import { User, Notification, Role } from './types';

interface AppState {
  user: User | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  login: (role: Role) => void;
  logout: () => void;
  notifications: Notification[];
  addNotification: (n: Notification) => void;
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
  updateUserProfile: (data: Partial<User>) => void;
}

export const AppContext = createContext<AppState>({} as AppState);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    const timer = setTimeout(() => {
      addNotification({
        id: Date.now(),
        title: "Thông báo mới",
        message: "Giáo viên vừa cập nhật điểm thi môn Toán.",
        time: "Vừa xong",
        read: false
      });
    }, 10000);
    return () => clearTimeout(timer);
  }, [user]);

  const addNotification = (n: Notification) => {
    setNotifications(prev => [n, ...prev]);
  };

  const login = (role: Role) => {
    setUser({
      id: 1,
      fullName: role === 'ADMIN' ? 'Nguyễn Quản Trị' : role === 'TEACHER' ? 'Thầy Giáo A' : 'Em Học Sinh B',
      email: 'user@school.edu.vn',
      role: role,
      avatar: `https://ui-avatars.com/api/?name=${role}&background=random&color=fff`,
      phone: "0901234567",
      address: "Hà Nội, Việt Nam"
    });
    setActiveTab('dashboard');
    setNotifications([{
      id: 1, title: "Chào mừng", message: "Đăng nhập thành công vào hệ thống.", time: "Bây giờ", read: false
    }]);
  };

  const logout = () => {
    setUser(null);
    setNotifications([]);
  };

  const updateUserProfile = (data: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...data });
    }
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen(prev => !prev);

  return (
    <AppContext.Provider value={{ 
      user, activeTab, setActiveTab, login, logout, 
      notifications, addNotification, 
      isMobileMenuOpen, toggleMobileMenu,
      updateUserProfile
    }}>
      {children}
    </AppContext.Provider>
  );
};