import React, { useState, useEffect } from 'react';
import { Plus, MapPin } from 'lucide-react';
import { api } from './data';
import { TransportRoute } from './types';
import { Button } from './components';

const TransportView = () => {
  const [routes, setRoutes] = useState<TransportRoute[]>([]);

  useEffect(() => {
    api.getRoutes().then(setRoutes);
  }, []);

  const handleAddRoute = () => {
    alert('Chức năng thêm tuyến xe mới đang phát triển!');
  };

  const handleViewDetails = (route: TransportRoute) => {
    alert(`Chi tiết tuyến: ${route.name}\nTài xế: ${route.driverName}\nSĐT: ${route.driverPhone}\nSĩ số: ${route.studentCount}/${route.capacity}`);
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-gray-800">Quản lý Vận tải</h2>
           <p className="text-gray-500">Theo dõi đội xe và đưa đón học sinh</p>
        </div>
        <Button onClick={handleAddRoute}><Plus size={20}/> Thêm Tuyến</Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
            <tr>
               <th className="p-4">Tuyến xe</th>
               <th className="p-4">Tài xế</th>
               <th className="p-4">Biển số</th>
               <th className="p-4 text-center">Sĩ số</th>
               <th className="p-4 text-center">Trạng thái</th>
               <th className="p-4 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
             {routes.map(route => (
                <tr key={route.id} className="hover:bg-gray-50">
                   <td className="p-4">
                      <div className="font-bold text-gray-800">{route.name}</div>
                   </td>
                   <td className="p-4">
                      <div className="font-medium">{route.driverName}</div>
                      <div className="text-xs text-gray-500">{route.driverPhone}</div>
                   </td>
                   <td className="p-4 text-gray-600">{route.licensePlate}</td>
                   <td className="p-4 text-center">
                      <span className="font-bold">{route.studentCount}</span>/{route.capacity}
                   </td>
                   <td className="p-4 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${route.status === 'ON_ROUTE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                         {route.status === 'ON_ROUTE' ? 'Đang chạy' : 'Đang chờ'}
                      </span>
                   </td>
                   <td className="p-4 text-right">
                      <button onClick={() => handleViewDetails(route)} className="text-indigo-600 hover:underline text-sm font-medium">Chi tiết</button>
                   </td>
                </tr>
             ))}
          </tbody>
        </table>
      </div>
      
      {/* Map Placeholder */}
      <div className="bg-gray-100 rounded-xl h-64 border border-gray-200 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=21.028511,105.804817&zoom=13&size=600x300&sensor=false')] bg-cover opacity-50 bg-center"></div>
          <div className="relative bg-white p-4 rounded-lg shadow-lg text-center">
             <MapPin size={32} className="text-red-500 mx-auto mb-2"/>
             <p className="font-bold text-gray-800">Bản đồ trực tuyến</p>
             <p className="text-xs text-gray-500">Tính năng đang phát triển</p>
          </div>
      </div>
    </div>
  );
};

export default TransportView;