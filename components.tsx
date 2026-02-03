import React, { useContext, useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { AppContext } from './context';
import { Notification } from './types';

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' | 'success' }> = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyle = "px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-200",
    secondary: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50",
    danger: "bg-red-600 text-white hover:bg-red-700 shadow-sm shadow-red-200",
    success: "bg-green-600 text-white hover:bg-green-700 shadow-sm shadow-green-200"
  };
  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export const Card: React.FC<{ title: string; value: string | number; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
    <div className={`p-4 rounded-lg ${color} text-white`}>
      {icon}
    </div>
    <div>
      <p className="text-gray-500 text-sm font-medium">{title}</p>
      <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
    </div>
  </div>
);

export const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode; maxWidth?: string }> = ({ isOpen, onClose, title, children, maxWidth = "max-w-lg" }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
      <div className={`bg-white rounded-xl shadow-xl w-full ${maxWidth} overflow-hidden animate-fade-in-up`}>
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded-full transition">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[80vh]">
          {children}
        </div>
      </div>
    </div>
  );
};

export const NotificationToast: React.FC = () => {
  const { notifications } = useContext(AppContext);
  const [show, setShow] = useState(false);
  const [latest, setLatest] = useState<Notification | null>(null);

  useEffect(() => {
    if (notifications.length > 0) {
      setLatest(notifications[0]);
      setShow(true);
      const timer = setTimeout(() => setShow(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [notifications]);

  if (!show || !latest) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white border-l-4 border-indigo-500 shadow-xl rounded-lg p-4 max-w-sm animate-slide-in z-50 flex items-start gap-3">
       <div className="text-indigo-500 pt-1"><Bell size={20} /></div>
       <div>
         <h4 className="font-semibold text-gray-800">{latest.title}</h4>
         <p className="text-sm text-gray-600">{latest.message}</p>
         <span className="text-xs text-gray-400 mt-1 block">{latest.time}</span>
       </div>
       <button onClick={() => setShow(false)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
    </div>
  );
};