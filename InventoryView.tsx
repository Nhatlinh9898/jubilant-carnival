import React, { useState, useEffect } from 'react';
import { Plus, Box, AlertTriangle, Edit } from 'lucide-react';
import { api } from './data';
import { InventoryItem } from './types';
import { Button, Card } from './components';

const InventoryView = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);

  useEffect(() => {
    api.getInventory().then(setInventory);
  }, []);

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-gray-800">Tài sản & Thiết bị</h2>
           <p className="text-gray-500">Quản lý cơ sở vật chất nhà trường</p>
        </div>
        <Button><Plus size={20}/> Nhập Kho</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
         <Card title="Tổng Tài sản" value={inventory.reduce((acc, i) => acc + i.quantity, 0)} icon={<Box size={24}/>} color="bg-blue-500"/>
         <Card title="Hư hỏng / Bảo trì" value={inventory.filter(i => i.condition !== 'GOOD').length} icon={<AlertTriangle size={24}/>} color="bg-red-500"/>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
            <tr>
               <th className="p-4">Tên thiết bị</th>
               <th className="p-4">Danh mục</th>
               <th className="p-4 text-center">Số lượng</th>
               <th className="p-4">Vị trí</th>
               <th className="p-4 text-center">Tình trạng</th>
               <th className="p-4 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
             {inventory.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                   <td className="p-4 font-medium text-gray-800">{item.name}</td>
                   <td className="p-4 text-gray-600">{item.category}</td>
                   <td className="p-4 text-center font-bold">{item.quantity}</td>
                   <td className="p-4 text-gray-600">{item.location}</td>
                   <td className="p-4 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                         item.condition === 'GOOD' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                         {item.condition === 'GOOD' ? 'Tốt' : 'Bảo trì'}
                      </span>
                   </td>
                   <td className="p-4 text-right">
                      <button className="text-gray-400 hover:text-indigo-600"><Edit size={18}/></button>
                   </td>
                </tr>
             ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryView;