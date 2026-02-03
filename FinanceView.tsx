import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { api, MOCK_STUDENTS } from './data';
import { Invoice } from './types';
import { Button } from './components';

const FinanceView = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PAID' | 'UNPAID' | 'OVERDUE'>('ALL');

  useEffect(() => {
    api.getInvoices().then(setInvoices);
  }, []);

  const filteredInvoices = filterStatus === 'ALL' ? invoices : invoices.filter(i => i.status === filterStatus);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-green-100 text-green-700';
      case 'UNPAID': return 'bg-yellow-100 text-yellow-700';
      case 'OVERDUE': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PAID': return 'Đã thanh toán';
      case 'UNPAID': return 'Chưa thanh toán';
      case 'OVERDUE': return 'Quá hạn';
      default: return status;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Tài Chính & Học Phí</h2>
          <p className="text-gray-500">Quản lý thu chi và hóa đơn học sinh</p>
        </div>
        <Button><Plus size={20}/> Tạo Hóa Đơn</Button>
      </div>

      <div className="flex gap-4 mb-4 overflow-x-auto pb-2">
         {['ALL', 'PAID', 'UNPAID', 'OVERDUE'].map(status => (
           <button 
             key={status}
             onClick={() => setFilterStatus(status as any)}
             className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
               filterStatus === status ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
             }`}
           >
             {status === 'ALL' ? 'Tất cả' : getStatusText(status)}
           </button>
         ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
         <table className="w-full text-left">
           <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
             <tr>
               <th className="p-4">Mã HĐ</th>
               <th className="p-4">Học sinh</th>
               <th className="p-4">Nội dung</th>
               <th className="p-4 text-right">Số tiền</th>
               <th className="p-4">Hạn nộp</th>
               <th className="p-4 text-center">Trạng thái</th>
               <th className="p-4 text-right">Hành động</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-gray-100">
             {filteredInvoices.map(inv => {
               const student = MOCK_STUDENTS.find(s => s.id === inv.studentId);
               return (
                 <tr key={inv.id} className="hover:bg-gray-50">
                   <td className="p-4 text-gray-500">#{inv.id}</td>
                   <td className="p-4 font-medium">{student?.fullName} <span className="text-xs text-gray-400">({student?.code})</span></td>
                   <td className="p-4">{inv.title}</td>
                   <td className="p-4 text-right font-bold text-gray-800">{formatCurrency(inv.amount)}</td>
                   <td className="p-4 text-sm text-gray-500">{inv.dueDate}</td>
                   <td className="p-4 text-center">
                     <span className={`px-2 py-1 rounded text-xs font-bold ${getStatusColor(inv.status)}`}>
                       {getStatusText(inv.status)}
                     </span>
                   </td>
                   <td className="p-4 text-right">
                     <button className="text-indigo-600 hover:underline text-sm font-medium">Chi tiết</button>
                   </td>
                 </tr>
               );
             })}
           </tbody>
         </table>
         {filteredInvoices.length === 0 && (
           <div className="p-8 text-center text-gray-500">Không có hóa đơn nào.</div>
         )}
      </div>
    </div>
  );
};

export default FinanceView;