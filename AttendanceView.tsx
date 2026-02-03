import React, { useState, useEffect } from 'react';
import { QrCode } from 'lucide-react';
import { api, MOCK_CLASSES } from './data';
import { Student } from './types';
import { Button } from './components';

const AttendanceView = () => {
  const [selectedClassId, setSelectedClassId] = useState<number>(MOCK_CLASSES[0]?.id || 1);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Record<number, 'present' | 'absent' | 'late'>>({});
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    api.getStudents().then(allStudents => {
       setStudents(allStudents.filter(s => s.classId === Number(selectedClassId)));
    });
  }, [selectedClassId]);

  const handleAttendance = (studentId: number, status: 'present' | 'absent' | 'late') => {
    setAttendance(prev => ({...prev, [studentId]: status}));
  };

  return (
    <div className="space-y-6">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
         <div>
            <h2 className="text-2xl font-bold text-gray-800">Điểm danh Lớp học</h2>
            <p className="text-gray-500">Quản lý chuyên cần hàng ngày</p>
         </div>
         <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setShowQR(!showQR)}>
              <QrCode size={18} /> {showQR ? "Ẩn QR Code" : "Tạo mã QR"}
            </Button>
            <input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
            />
         </div>
       </div>

       {showQR && (
         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center animate-fade-in">
           <div className="bg-gray-900 p-4 rounded-lg">
             <QrCode size={150} color="white" />
           </div>
           <p className="mt-4 font-medium text-gray-800">Quét mã để điểm danh ngày {date}</p>
           <p className="text-sm text-gray-500">Mã có hiệu lực trong 15 phút</p>
         </div>
       )}

      <div className="flex gap-4 items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
         <span className="font-medium text-gray-700">Chọn lớp:</span>
         <select 
           className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
           value={selectedClassId}
           onChange={(e) => setSelectedClassId(Number(e.target.value))}
         >
           {MOCK_CLASSES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
         </select>
         <span className="ml-auto text-sm text-gray-500">Sĩ số: {students.length}</span>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
            <tr>
              <th className="p-4">Mã HS</th>
              <th className="p-4">Họ và Tên</th>
              <th className="p-4 text-center">Có mặt</th>
              <th className="p-4 text-center">Vắng</th>
              <th className="p-4 text-center">Muộn</th>
              <th className="p-4">Ghi chú</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {students.map(s => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="p-4 font-medium text-gray-500">{s.code}</td>
                <td className="p-4 font-medium">{s.fullName}</td>
                <td className="p-4 text-center">
                  <input 
                    type="radio" 
                    name={`att-${s.id}`} 
                    className="w-5 h-5 text-green-600 focus:ring-green-500"
                    checked={attendance[s.id] === 'present' || !attendance[s.id]}
                    onChange={() => handleAttendance(s.id, 'present')}
                  />
                </td>
                <td className="p-4 text-center">
                  <input 
                    type="radio" 
                    name={`att-${s.id}`} 
                    className="w-5 h-5 text-red-600 focus:ring-red-500"
                    checked={attendance[s.id] === 'absent'}
                    onChange={() => handleAttendance(s.id, 'absent')}
                  />
                </td>
                <td className="p-4 text-center">
                  <input 
                    type="radio" 
                    name={`att-${s.id}`} 
                    className="w-5 h-5 text-yellow-600 focus:ring-yellow-500"
                    checked={attendance[s.id] === 'late'}
                    onChange={() => handleAttendance(s.id, 'late')}
                  />
                </td>
                <td className="p-4">
                  <input type="text" placeholder="Lý do..." className="border border-gray-200 rounded px-2 py-1 text-sm w-full"/>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
         <div className="p-4 border-t bg-gray-50 flex justify-end">
           <Button variant="success">Lưu Điểm Danh</Button>
         </div>
      </div>
    </div>
  );
};

export default AttendanceView;