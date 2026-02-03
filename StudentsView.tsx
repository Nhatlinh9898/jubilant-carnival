import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, ChevronLeft, Printer } from 'lucide-react';
import { api, MOCK_CLASSES, MOCK_INVOICES } from './data';
import { Student } from './types';
import { Button, Modal } from './components';

const StudentsView = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [filterClass, setFilterClass] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  useEffect(() => {
    api.getStudents().then(setStudents);
  }, []);

  const handleAddStudent = (e: React.FormEvent) => {
      e.preventDefault();
      const form = e.target as HTMLFormElement;
      const newStudent: Student = {
          id: Date.now(),
          code: (form.elements.namedItem('code') as HTMLInputElement).value,
          fullName: (form.elements.namedItem('fullname') as HTMLInputElement).value,
          classId: parseInt((form.elements.namedItem('classId') as HTMLSelectElement).value),
          dob: (form.elements.namedItem('dob') as HTMLInputElement).value,
          gender: (form.elements.namedItem('gender') as HTMLSelectElement).value as 'Male' | 'Female',
          status: 'Active',
          email: (form.elements.namedItem('email') as HTMLInputElement).value,
          phone: (form.elements.namedItem('phone') as HTMLInputElement).value
      };
      setStudents([newStudent, ...students]);
      setShowAddModal(false);
  }

  const filteredStudents = students.filter(s => {
    const matchClass = filterClass === "all" || s.classId.toString() === filterClass;
    const matchSearch = s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || s.code.toLowerCase().includes(searchTerm.toLowerCase());
    return matchClass && matchSearch;
  });

  if (selectedStudent) {
    const className = MOCK_CLASSES.find(c => c.id === selectedStudent.classId)?.name;
    const studentInvoices = MOCK_INVOICES.filter(i => i.studentId === selectedStudent.id);
    
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <Button variant="secondary" onClick={() => setSelectedStudent(null)} className="!p-2">
            <ChevronLeft size={20} />
          </Button>
          <div className="flex-1">
             <h2 className="text-2xl font-bold text-gray-800">{selectedStudent.fullName}</h2>
             <p className="text-gray-500">Mã HS: {selectedStudent.code} | Lớp: {className}</p>
          </div>
          <div className="flex gap-2">
             <Button variant="secondary"><Printer size={16}/> In Hồ sơ</Button>
             <Button><Edit size={16}/> Chỉnh sửa</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {/* Profile Card */}
           <div className="md:col-span-1 space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                 <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Thông tin cá nhân</h3>
                 <div className="space-y-3 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">Ngày sinh:</span> <span className="font-medium">{selectedStudent.dob}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Giới tính:</span> <span className="font-medium">{selectedStudent.gender === 'Male' ? 'Nam' : 'Nữ'}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Email:</span> <span className="font-medium">{selectedStudent.email}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">SĐT:</span> <span className="font-medium">{selectedStudent.phone}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Trạng thái:</span> <span className="text-green-600 font-medium">{selectedStudent.status === 'Active' ? 'Đang học' : 'Nghỉ'}</span></div>
                 </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                 <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Tình trạng Tài chính</h3>
                 <div className="space-y-3">
                   {studentInvoices.map(inv => (
                     <div key={inv.id} className="flex justify-between items-center text-sm">
                        <span className="text-gray-600 truncate max-w-[120px]" title={inv.title}>{inv.title}</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${inv.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                           {inv.status === 'PAID' ? 'Đã đóng' : 'Chưa đóng'}
                        </span>
                     </div>
                   ))}
                   {studentInvoices.length === 0 && <p className="text-sm text-gray-500 italic">Không có hóa đơn.</p>}
                 </div>
              </div>
           </div>

           {/* Stats & Grades */}
           <div className="md:col-span-2 space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4">
                 <div className="bg-blue-50 p-4 rounded-xl text-center">
                    <div className="text-2xl font-bold text-blue-700">8.2</div>
                    <div className="text-xs text-blue-500 font-semibold">Điểm TB Tích lũy</div>
                 </div>
                 <div className="bg-green-50 p-4 rounded-xl text-center">
                    <div className="text-2xl font-bold text-green-700">98%</div>
                    <div className="text-xs text-green-500 font-semibold">Tỉ lệ chuyên cần</div>
                 </div>
                 <div className="bg-purple-50 p-4 rounded-xl text-center">
                    <div className="text-2xl font-bold text-purple-700">Giỏi</div>
                    <div className="text-xs text-purple-500 font-semibold">Hạnh kiểm</div>
                 </div>
              </div>

              {/* Grades Table */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                 <div className="p-4 bg-gray-50 border-b border-gray-100 font-semibold text-gray-700">Bảng điểm Học kỳ I</div>
                 <table className="w-full text-left text-sm">
                    <thead className="bg-white text-gray-500 border-b border-gray-100">
                       <tr>
                          <th className="p-3">Môn học</th>
                          <th className="p-3 text-center">Giữa kỳ</th>
                          <th className="p-3 text-center">Cuối kỳ</th>
                          <th className="p-3 text-center">Tổng kết</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                       <tr>
                          <td className="p-3 font-medium">Toán học</td>
                          <td className="p-3 text-center">8.0</td>
                          <td className="p-3 text-center">9.0</td>
                          <td className="p-3 text-center font-bold text-indigo-600">8.5</td>
                       </tr>
                       <tr>
                          <td className="p-3 font-medium">Ngữ Văn</td>
                          <td className="p-3 text-center">7.5</td>
                          <td className="p-3 text-center">7.5</td>
                          <td className="p-3 text-center font-bold text-indigo-600">7.5</td>
                       </tr>
                       <tr>
                          <td className="p-3 font-medium">Tiếng Anh</td>
                          <td className="p-3 text-center">9.0</td>
                          <td className="p-3 text-center">9.0</td>
                          <td className="p-3 text-center font-bold text-indigo-600">9.0</td>
                       </tr>
                    </tbody>
                 </table>
              </div>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Quản lý Học sinh</h2>
          <p className="text-gray-500">Tổng số: {filteredStudents.length} học sinh</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}><Plus size={20}/> Thêm mới</Button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Tìm kiếm theo tên hoặc mã HS..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-600 bg-white"
          value={filterClass}
          onChange={(e) => setFilterClass(e.target.value)}
        >
          <option value="all">Tất cả các lớp</option>
          {MOCK_CLASSES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
            <tr>
              <th className="p-4 border-b">Mã HS</th>
              <th className="p-4 border-b">Họ và Tên</th>
              <th className="p-4 border-b">Lớp</th>
              <th className="p-4 border-b">Ngày sinh</th>
              <th className="p-4 border-b">Trạng thái</th>
              <th className="p-4 border-b text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredStudents.map(s => {
               const className = MOCK_CLASSES.find(c => c.id === s.classId)?.name;
               return (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-500">{s.code}</td>
                  <td className="p-4 font-medium text-gray-900">{s.fullName}</td>
                  <td className="p-4"><span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-xs font-semibold">{className}</span></td>
                  <td className="p-4 text-gray-500">{s.dob}</td>
                  <td className="p-4"><span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">{s.status === 'Active' ? 'Đang học' : 'Nghỉ'}</span></td>
                  <td className="p-4 text-right">
                     <button onClick={() => setSelectedStudent(s)} className="text-gray-400 hover:text-indigo-600"><Edit size={18}/></button>
                  </td>
                </tr>
               )
            })}
          </tbody>
        </table>
      </div>

       {/* Add Student Modal */}
       <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Thêm Học sinh mới">
          <form onSubmit={handleAddStudent} className="space-y-4">
              <div>
                  <label className="block text-sm font-medium mb-1">Họ và tên</label>
                  <input name="fullname" className="w-full border rounded-lg p-2" required/>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium mb-1">Mã HS</label>
                    <input name="code" className="w-full border rounded-lg p-2" required/>
                 </div>
                 <div>
                    <label className="block text-sm font-medium mb-1">Lớp</label>
                    <select name="classId" className="w-full border rounded-lg p-2">
                        {MOCK_CLASSES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium mb-1">Ngày sinh</label>
                    <input type="date" name="dob" className="w-full border rounded-lg p-2" required/>
                 </div>
                 <div>
                    <label className="block text-sm font-medium mb-1">Giới tính</label>
                    <select name="gender" className="w-full border rounded-lg p-2">
                        <option value="Male">Nam</option>
                        <option value="Female">Nữ</option>
                    </select>
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input type="email" name="email" className="w-full border rounded-lg p-2"/>
                 </div>
                 <div>
                    <label className="block text-sm font-medium mb-1">Số điện thoại</label>
                    <input name="phone" className="w-full border rounded-lg p-2"/>
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

export default StudentsView;