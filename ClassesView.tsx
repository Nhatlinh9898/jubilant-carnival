import React, { useState, useEffect } from 'react';
import { ChevronLeft, Plus, Users, GraduationCap, MapPin } from 'lucide-react';
import { api, MOCK_TEACHERS } from './data';
import { Class, Student } from './types';
import { Button, Modal } from './components';

const ClassesView = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    api.getClasses().then(setClasses);
    api.getStudents().then(setStudents);
  }, []);

  const handleClassClick = (c: Class) => {
    setSelectedClass(c);
  };

  const getStudentsInClass = (classId: number) => {
    return students.filter(s => s.classId === classId);
  };

  const handleAddClass = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const newClass: Class = {
        id: Date.now(),
        code: (form.elements.namedItem('code') as HTMLInputElement).value,
        name: (form.elements.namedItem('name') as HTMLInputElement).value,
        gradeLevel: parseInt((form.elements.namedItem('grade') as HTMLInputElement).value),
        academicYear: "2023-2024",
        studentCount: 0,
        room: (form.elements.namedItem('room') as HTMLInputElement).value
    };
    setClasses([...classes, newClass]);
    setShowAddModal(false);
  };

  if (selectedClass) {
    const classStudents = getStudentsInClass(selectedClass.id);
    const teacher = MOCK_TEACHERS.find(t => t.id === selectedClass.homeroomTeacherId);

    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <Button variant="secondary" onClick={() => setSelectedClass(null)} className="!p-2">
            <ChevronLeft size={20} />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Chi tiết Lớp {selectedClass.name}</h2>
            <p className="text-gray-500">GVCN: {teacher?.fullName || 'Chưa phân công'} | Phòng: {selectedClass.room}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h3 className="font-semibold text-gray-700">Danh sách Học sinh ({classStudents.length})</h3>
            <div className="flex gap-2">
              <Button variant="secondary" className="!py-1 !px-3 text-sm">Xuất Excel</Button>
              <Button className="!py-1 !px-3 text-sm"><Plus size={16}/> Thêm HS</Button>
            </div>
          </div>
          <table className="w-full text-left">
            <thead className="bg-white text-gray-600 text-sm uppercase">
              <tr>
                <th className="p-4 border-b">Mã HS</th>
                <th className="p-4 border-b">Họ Tên</th>
                <th className="p-4 border-b">Ngày Sinh</th>
                <th className="p-4 border-b">Giới Tính</th>
                <th className="p-4 border-b">Liên hệ</th>
                <th className="p-4 border-b text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {classStudents.map(s => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="p-4 font-medium text-indigo-600">{s.code}</td>
                  <td className="p-4 font-medium">{s.fullName}</td>
                  <td className="p-4 text-gray-500">{s.dob}</td>
                  <td className="p-4">{s.gender === 'Male' ? 'Nam' : 'Nữ'}</td>
                  <td className="p-4 text-sm text-gray-500">
                    <div>{s.email}</div>
                    <div>{s.phone}</div>
                  </td>
                  <td className="p-4 text-right">
                    <button className="text-blue-600 hover:underline mr-3">Sửa</button>
                    <button className="text-red-600 hover:underline">Xóa</button>
                  </td>
                </tr>
              ))}
              {classStudents.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">Chưa có học sinh nào trong lớp này.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-gray-800">Quản lý Lớp học</h2>
           <p className="text-gray-500">Danh sách các lớp niên khóa 2023-2024</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}><Plus size={20}/> Thêm Lớp</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map(c => {
           const teacher = MOCK_TEACHERS.find(t => t.id === c.homeroomTeacherId);
           return (
            <div 
              key={c.id} 
              onClick={() => handleClassClick(c)}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  {c.gradeLevel}
                </div>
                <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-500">{c.academicYear}</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-1">{c.name}</h3>
              <p className="text-sm text-gray-500 mb-4">Mã lớp: {c.code}</p>
              
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-gray-400"/>
                  <span>{c.studentCount} Học sinh</span>
                </div>
                <div className="flex items-center gap-2">
                  <GraduationCap size={16} className="text-gray-400"/>
                  <span>GVCN: {teacher?.fullName || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-gray-400"/>
                  <span>Phòng: {c.room}</span>
                </div>
              </div>
            </div>
           );
        })}
      </div>
      
      {/* Add Class Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Thêm Lớp học mới">
          <form onSubmit={handleAddClass} className="space-y-4">
              <div>
                  <label className="block text-sm font-medium mb-1">Tên lớp</label>
                  <input name="name" className="w-full border rounded-lg p-2" placeholder="VD: Lớp 10A5" required/>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium mb-1">Mã lớp</label>
                    <input name="code" className="w-full border rounded-lg p-2" placeholder="VD: 10A5" required/>
                 </div>
                 <div>
                    <label className="block text-sm font-medium mb-1">Khối</label>
                    <select name="grade" className="w-full border rounded-lg p-2">
                        <option value="10">10</option>
                        <option value="11">11</option>
                        <option value="12">12</option>
                    </select>
                 </div>
              </div>
              <div>
                  <label className="block text-sm font-medium mb-1">Phòng học</label>
                  <input name="room" className="w-full border rounded-lg p-2" placeholder="VD: P.305"/>
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

export default ClassesView;