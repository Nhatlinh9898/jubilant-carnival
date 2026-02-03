import React, { useState, useEffect } from 'react';
import { Plus, Search, Check, X, Briefcase, User as UserIcon, Phone, Mail } from 'lucide-react';
import { api } from './data';
import { Staff, LeaveRequest } from './types';
import { Button } from './components';

const HRView = () => {
  const [activeTab, setActiveTab] = useState<'staff' | 'leave'>('staff');
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    api.getStaff().then(setStaffList);
    api.getLeaveRequests().then(setLeaveRequests);
  }, []);

  const filteredStaff = staffList.filter(s => 
    s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-gray-800">Quản trị Nhân sự</h2>
           <p className="text-gray-500">Quản lý hồ sơ nhân viên và nghỉ phép</p>
        </div>
        <div className="flex gap-2">
           <button 
             onClick={() => setActiveTab('staff')}
             className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'staff' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600'}`}
           >
             Danh sách NV
           </button>
           <button 
             onClick={() => setActiveTab('leave')}
             className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'leave' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600'}`}
           >
             Duyệt Phép
           </button>
        </div>
      </div>

      {activeTab === 'staff' && (
        <>
          <div className="flex justify-between gap-4">
             <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="text" 
                  placeholder="Tìm kiếm nhân viên, phòng ban..." 
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
             <Button><Plus size={20}/> Thêm Nhân viên</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {filteredStaff.map(s => (
               <div key={s.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                           {s.fullName.charAt(0)}
                        </div>
                        <div>
                           <h3 className="font-bold text-gray-800">{s.fullName}</h3>
                           <p className="text-sm text-indigo-600 font-medium">{s.role}</p>
                        </div>
                     </div>
                     <span className={`px-2 py-1 rounded text-xs font-bold ${s.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {s.status === 'Active' ? 'Đang làm' : 'Nghỉ phép'}
                     </span>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600 border-t border-gray-50 pt-4 flex-1">
                     <div className="flex items-center gap-2"><Briefcase size={16}/> {s.department}</div>
                     <div className="flex items-center gap-2"><Mail size={16}/> {s.email}</div>
                     <div className="flex items-center gap-2"><Phone size={16}/> {s.phone}</div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                     <span className="text-xs text-gray-500">Lương cơ bản</span>
                     <span className="font-bold text-gray-800">{formatCurrency(s.salary)}</span>
                  </div>
               </div>
             ))}
          </div>
        </>
      )}

      {activeTab === 'leave' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
           <table className="w-full text-left">
             <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
               <tr>
                 <th className="p-4">Nhân viên</th>
                 <th className="p-4">Loại nghỉ</th>
                 <th className="p-4">Thời gian</th>
                 <th className="p-4">Lý do</th>
                 <th className="p-4 text-center">Trạng thái</th>
                 <th className="p-4 text-right">Hành động</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-gray-100">
               {leaveRequests.map(req => {
                 const staff = staffList.find(s => s.id === req.staffId);
                 return (
                   <tr key={req.id} className="hover:bg-gray-50">
                     <td className="p-4 font-medium">{staff?.fullName} <span className="text-xs text-gray-400 block">{staff?.department}</span></td>
                     <td className="p-4"><span className="px-2 py-1 bg-gray-100 rounded text-xs">{req.type}</span></td>
                     <td className="p-4 text-sm">
                        <div className="font-medium">{req.startDate}</div>
                        <div className="text-gray-500">đến {req.endDate}</div>
                     </td>
                     <td className="p-4 text-gray-600 italic">{req.reason}</td>
                     <td className="p-4 text-center">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                           req.status === 'Approved' ? 'bg-green-100 text-green-700' :
                           req.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                           {req.status === 'Approved' ? 'Đã duyệt' : req.status === 'Rejected' ? 'Từ chối' : 'Chờ duyệt'}
                        </span>
                     </td>
                     <td className="p-4 text-right">
                        {req.status === 'Pending' && (
                           <div className="flex justify-end gap-2">
                              <button className="p-1 text-green-600 hover:bg-green-50 rounded"><Check size={20}/></button>
                              <button className="p-1 text-red-600 hover:bg-red-50 rounded"><X size={20}/></button>
                           </div>
                        )}
                     </td>
                   </tr>
                 )
               })}
             </tbody>
           </table>
        </div>
      )}
    </div>
  );
};

export default HRView;
