import React, { useContext } from 'react';
import { GraduationCap, ChevronRight } from 'lucide-react';
import { AppContext } from './context';
import { Button } from './components';

const LoginScreen: React.FC = () => {
  const { login } = useContext(AppContext);
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">EduManager</h1>
          <p className="text-gray-500 mt-2">Hệ thống quản lý giáo dục toàn diện</p>
        </div>
        <div className="space-y-3">
          <Button className="w-full justify-between" onClick={() => login('ADMIN')}>
             <span>Quản trị viên</span> <ChevronRight size={16}/>
          </Button>
          <Button variant="secondary" className="w-full justify-between" onClick={() => login('TEACHER')}>
             <span>Giáo viên</span> <ChevronRight size={16}/>
          </Button>
          <Button variant="secondary" className="w-full justify-between" onClick={() => login('STUDENT')}>
             <span>Học sinh</span> <ChevronRight size={16}/>
          </Button>
          <div className="text-center mt-6">
             <p className="text-xs text-gray-400">Hỗ trợ Mobile App qua API</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;