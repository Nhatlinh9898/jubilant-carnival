import React, { useState, useEffect } from 'react';
import { HeartPulse, Activity, FileText, AlertTriangle, Plus, Search } from 'lucide-react';
import { api, MOCK_STUDENTS } from './data';
import { MedicalRecord, HealthIncident } from './types';
import { Button, Card, Modal } from './components';

const HealthView = () => {
  const [activeTab, setActiveTab] = useState<'records' | 'incidents'>('records');
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [incidents, setIncidents] = useState<HealthIncident[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    api.getMedicalRecords().then(setRecords);
    api.getHealthIncidents().then(setIncidents);
  }, []);

  const getStudentName = (id: number) => MOCK_STUDENTS.find(s => s.id === id)?.fullName || "Unknown";

  const filteredRecords = records.filter(r => {
    const studentName = getStudentName(r.studentId).toLowerCase();
    return studentName.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-gray-800">Y tế Học đường</h2>
           <p className="text-gray-500">Theo dõi sức khỏe và an toàn học sinh</p>
        </div>
        <div className="flex gap-2">
           <button 
             onClick={() => setActiveTab('records')}
             className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'records' ? 'bg-rose-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
           >
             Hồ sơ Y tế
           </button>
           <button 
             onClick={() => setActiveTab('incidents')}
             className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'incidents' ? 'bg-rose-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
           >
             Sự cố / Tai nạn
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <Card 
            title="Học sinh cần lưu ý" 
            value={records.length} 
            icon={<AlertTriangle size={24}/>} 
            color="bg-orange-500"
         />
         <Card 
            title="Sự cố trong tháng" 
            value={incidents.length} 
            icon={<Activity size={24}/>} 
            color="bg-rose-500"
         />
         <Card 
            title="Đã khám sức khỏe" 
            value={MOCK_STUDENTS.length} 
            icon={<HeartPulse size={24}/>} 
            color="bg-teal-500"
         />
      </div>

      {activeTab === 'records' && (
        <div className="space-y-4">
           <div className="flex justify-between gap-4">
              <div className="relative flex-1">
                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                 <input 
                   type="text" 
                   placeholder="Tìm kiếm hồ sơ học sinh..." 
                   className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                 />
              </div>
              <Button className="bg-rose-600 hover:bg-rose-700 shadow-rose-200"><Plus size={20}/> Thêm Hồ sơ</Button>
           </div>

           <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
             <table className="w-full text-left">
               <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
                 <tr>
                    <th className="p-4">Học sinh</th>
                    <th className="p-4">Nhóm máu</th>
                    <th className="p-4">Tình trạng / Bệnh lý</th>
                    <th className="p-4">Dị ứng</th>
                    <th className="p-4">Khám lần cuối</th>
                    <th className="p-4">Ghi chú</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                  {filteredRecords.map(rec => (
                     <tr key={rec.id} className="hover:bg-gray-50">
                        <td className="p-4 font-bold text-gray-800">{getStudentName(rec.studentId)}</td>
                        <td className="p-4"><span className="px-2 py-1 bg-gray-100 rounded font-mono text-xs">{rec.bloodType}</span></td>
                        <td className="p-4 text-rose-600 font-medium">{rec.condition}</td>
                        <td className="p-4">{rec.allergies}</td>
                        <td className="p-4 text-sm text-gray-500">{rec.lastCheckup}</td>
                        <td className="p-4 text-sm text-gray-500 italic">{rec.notes}</td>
                     </tr>
                  ))}
               </tbody>
             </table>
           </div>
        </div>
      )}

      {activeTab === 'incidents' && (
         <div className="space-y-4">
            <div className="flex justify-end">
               <Button className="bg-rose-600 hover:bg-rose-700 shadow-rose-200"><Plus size={20}/> Ghi nhận sự cố</Button>
            </div>
            <div className="grid grid-cols-1 gap-4">
               {incidents.map(inc => (
                  <div key={inc.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start gap-4">
                     <div className={`p-3 rounded-full flex-shrink-0 ${
                        inc.severity === 'High' ? 'bg-red-100 text-red-600' :
                        inc.severity === 'Medium' ? 'bg-orange-100 text-orange-600' : 'bg-yellow-100 text-yellow-600'
                     }`}>
                        <Activity size={24}/>
                     </div>
                     <div className="flex-1">
                        <div className="flex justify-between items-start">
                           <h4 className="font-bold text-gray-800 text-lg">{inc.description}</h4>
                           <span className="text-sm text-gray-500">{inc.date}</span>
                        </div>
                        <p className="text-sm font-medium text-gray-600 mt-1">Học sinh: <span className="text-indigo-600">{getStudentName(inc.studentId)}</span></p>
                        <p className="text-sm text-gray-600 mt-2">Xử lý: {inc.treatment}</p>
                     </div>
                     <div className="flex flex-col items-end gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                           inc.severity === 'High' ? 'bg-red-50 border-red-200 text-red-700' :
                           inc.severity === 'Medium' ? 'bg-orange-50 border-orange-200 text-orange-700' : 'bg-yellow-50 border-yellow-200 text-yellow-700'
                        }`}>
                           Mức độ: {inc.severity}
                        </span>
                        <span className={`text-xs font-medium ${inc.status === 'Resolved' ? 'text-green-600' : 'text-orange-600'}`}>
                           {inc.status === 'Resolved' ? 'Đã xử lý' : 'Cần theo dõi'}
                        </span>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      )}
    </div>
  );
};

export default HealthView;