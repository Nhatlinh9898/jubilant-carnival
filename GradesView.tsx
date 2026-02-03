import React, { useState, useEffect } from 'react';
import { Upload, Download, Printer, FileSpreadsheet } from 'lucide-react';
import { api, MOCK_CLASSES, MOCK_SUBJECTS } from './data';
import { Student } from './types';
import { Button } from './components';

const GradesView = () => {
  const [selectedClassId, setSelectedClassId] = useState<number>(MOCK_CLASSES[0]?.id || 1);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number>(MOCK_SUBJECTS[0]?.id || 1);
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    api.getStudents().then(allStudents => {
       setStudents(allStudents.filter(s => s.classId === Number(selectedClassId)));
    });
  }, [selectedClassId]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    const headers = ["ID,Student Name,Math,Literature,English,Physics\n"];
    const rows = students.map(s => `${s.code},${s.fullName},8.5,7.0,9.0,8.0`).join("\n");
    const csvContent = "data:text/csv;charset=utf-8," + headers + rows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "bang_diem.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
         <div>
            <h2 className="text-2xl font-bold text-gray-800">Sổ điểm & Báo cáo</h2>
            <p className="text-gray-500">Quản lý điểm số và xuất báo cáo học tập</p>
         </div>
         <div className="flex gap-2">
            <Button variant="secondary" onClick={handlePrint}>
              <Printer size={18} /> In Báo Cáo
            </Button>
            <Button variant="success" onClick={handleExportExcel}>
              <FileSpreadsheet size={18} /> Xuất Excel
            </Button>
         </div>
       </div>

      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
         <div className="flex items-center gap-2">
            <span className="font-medium text-gray-700">Lớp:</span>
            <select 
              className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(Number(e.target.value))}
            >
              {MOCK_CLASSES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
         </div>
         <div className="flex items-center gap-2">
            <span className="font-medium text-gray-700">Môn học:</span>
            <select 
              className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(Number(e.target.value))}
            >
              {MOCK_SUBJECTS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
         </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto" id="printable-area">
        <table className="w-full text-left min-w-[800px]">
          <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
            <tr>
              <th className="p-4 sticky left-0 bg-gray-50 border-r">Họ và Tên</th>
              <th className="p-4 text-center">Miệng</th>
              <th className="p-4 text-center">15 phút (1)</th>
              <th className="p-4 text-center">15 phút (2)</th>
              <th className="p-4 text-center">1 tiết</th>
              <th className="p-4 text-center">Giữa kỳ</th>
              <th className="p-4 text-center">Cuối kỳ</th>
              <th className="p-4 text-center font-bold">TB Môn</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {students.map((s, idx) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="p-4 font-medium sticky left-0 bg-white border-r shadow-[4px_0_8px_-4px_rgba(0,0,0,0.1)]">{s.fullName}</td>
                {/* Mock inputs for grades */}
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <td key={i} className="p-2 text-center">
                    <input 
                       className="w-12 h-8 text-center border border-gray-200 rounded focus:ring-2 focus:ring-indigo-500 outline-none" 
                       placeholder="-"
                       defaultValue={Math.floor(Math.random() * 3 + 7)} // Mock grade
                    />
                  </td>
                ))}
                <td className="p-4 text-center font-bold text-indigo-600">
                   {/* Mock Average */}
                   {(Math.random() * 2 + 7).toFixed(1)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GradesView;