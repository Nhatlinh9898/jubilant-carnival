import React, { useState, useContext } from 'react';
import { Edit, Settings, User as UserIcon, Mail, Phone, MapPin, Key } from 'lucide-react';
import { AppContext } from './context';
import { Button } from './components';

const SettingsView = () => {
  const { user, updateUserProfile } = useContext(AppContext);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile(formData);
    alert("Cập nhật thông tin thành công!");
  };

  const handleAvatarChange = () => {
    alert('Chức năng thay đổi ảnh đại diện đang phát triển!');
  };

  const toggleDarkMode = () => {
    alert('Chức năng giao diện tối đang phát triển!');
  };

  const toggleEmailNotifications = () => {
    alert('Chức năng thông báo email đang phát triển!');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Profile Card */}
        <div className="w-full md:w-1/3 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
             <div className="relative inline-block">
               <img src={user?.avatar} alt="Profile" className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-indigo-50" />
               <button onClick={handleAvatarChange} className="absolute bottom-0 right-0 bg-indigo-600 text-white p-1.5 rounded-full hover:bg-indigo-700 border-2 border-white">
                 <Edit size={12} />
               </button>
             </div>
             <h2 className="text-xl font-bold text-gray-800">{user?.fullName}</h2>
             <span className="inline-block mt-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold">{user?.role}</span>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
             <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Settings size={18}/> Tuỳ chọn</h3>
             <div className="space-y-4">
                <div className="flex items-center justify-between">
                   <span className="text-sm text-gray-600">Giao diện tối</span>
                   <button onClick={toggleDarkMode} className="w-10 h-6 bg-gray-200 rounded-full relative">
                      <span className="w-4 h-4 bg-white rounded-full absolute left-1 top-1 shadow-sm"></span>
                   </button>
                </div>
                <div className="flex items-center justify-between">
                   <span className="text-sm text-gray-600">Thông báo Email</span>
                   <button onClick={toggleEmailNotifications} className="w-10 h-6 bg-indigo-600 rounded-full relative">
                      <span className="w-4 h-4 bg-white rounded-full absolute right-1 top-1 shadow-sm"></span>
                   </button>
                </div>
             </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="flex-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
           <h3 className="text-lg font-bold text-gray-800 mb-6 border-b pb-4">Thông tin cá nhân</h3>
           <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Họ và Tên</label>
                   <div className="relative">
                      <UserIcon size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"/>
                      <input 
                        name="fullName" value={formData.fullName} onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                      />
                   </div>
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                   <div className="relative">
                      <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"/>
                      <input 
                        name="email" value={formData.email} onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                      />
                   </div>
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                   <div className="relative">
                      <Phone size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"/>
                      <input 
                        name="phone" value={formData.phone} onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                      />
                   </div>
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                   <div className="relative">
                      <MapPin size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"/>
                      <input 
                        name="address" value={formData.address} onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                      />
                   </div>
                 </div>
              </div>

              <div className="pt-4 border-t border-gray-100 mt-4">
                 <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Key size={18}/> Bảo mật</h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu hiện tại</label>
                      <input type="password" placeholder="••••••••" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
                      <input type="password" placeholder="••••••••" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                    </div>
                 </div>
              </div>

              <div className="flex justify-end pt-4">
                 <Button type="submit">Lưu thay đổi</Button>
              </div>
           </form>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;