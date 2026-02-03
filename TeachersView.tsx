import React, { useState, useEffect } from 'react';
import { Plus, Mail, Phone, MessageCircle } from 'lucide-react';
import { api } from './data';
import { Teacher } from './types';
import { Button, Modal } from './components';

const TeachersView = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    api.getTeachers().then(setTeachers);
  }, []);

  const handleAddTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const newTeacher: Teacher = {
        id: Date.now(),
        fullName: (form.elements.namedItem('fullName') as HTMLInputElement).value,
        email: (form.elements.namedItem('email') as HTMLInputElement).value,
        phone: (form.elements.namedItem('phone') as HTMLInputElement).value,
        major: (form.elements.namedItem('major') as HTMLInputElement).value,
        avatar: `https://ui-avatars.com/api/?name=${(form.elements.namedItem('fullName') as HTMLInputElement).value}&background=random`
    };
    setTeachers([...teachers, newTeacher]);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-gray-800">Đội ngũ Giáo viên</h2>
           <p className="text-gray-500">Danh sách giáo viên cơ hữu</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}><Plus size={20}/> Thêm Giáo viên</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teachers.map(t => (
          <div key={t.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
             <img src={t.avatar} alt={t.fullName} className="w-24 h-24 rounded-full mb-4 border-4 border-gray-50"/>
             <h3 className="text-lg font-bold text-gray-900">{t.fullName}</h3>
             <p className="text-indigo-600 font-medium text-sm mb-4">{t.major}</p>
             
             <div className="w-full space-y-3 border-t border-gray-100 pt-4">
               <div className="flex items-center gap-3 text-sm text-gray-600 justify-center">
                 <Mail size={16} className="text-gray-400"/>
                 {t.email}
               </div>
               <div className="flex items-center gap-3 text-sm text-gray-600 justify-center">
                 <Phone size={16} className="text-gray-400"/>
                 {t.phone}
               </div>
             </div>
             
             <div className="mt-6 flex gap-2 w-full">
               <Button variant="secondary" className="flex-1 text-sm">Hồ sơ</Button>
               <Button className="flex-1 text-sm"><MessageCircle size={16}/> Chat</Button>
             </div>
          </div>
        ))}
      </div>

      {/* Add Teacher Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Thêm Giáo viên mới">
          <form onSubmit={handleAddTeacher} className="space-y-4">
              <div>
                  <label className="block text-sm font-medium mb-1">Họ và tên</label>
                  <input name="fullName" className="w-full border rounded-lg p-2" required/>
              </div>
              <div>
                  <label className="block text-sm font-medium mb-1">Chuyên môn</label>
                  <select name="major" className="w-full border rounded-lg p-2">
                     <option value="Toán Học">Toán Học</option>
                     <option value="Ngữ Văn">Ngữ Văn</option>
                     <option value="Tiếng Anh">Tiếng Anh</option>
                     <option value="Vật Lý">Vật Lý</option>
                     <option value="Hóa Học">Hóa Học</option>
                  </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input type="email" name="email" className="w-full border rounded-lg p-2" required/>
                 </div>
                 <div>
                    <label className="block text-sm font-medium mb-1">Số điện thoại</label>
                    <input name="phone" className="w-full border rounded-lg p-2" required/>
                 </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                  <Button type="button" variant="secondary" onClick={() => setShowAddModal(false)}>Hủy</Button>
                  <Button type="submit">Lưu</Button>
              </div>
          </form>
      </Modal>
    </div>
  );
};

export default TeachersView;