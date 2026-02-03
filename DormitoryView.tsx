import React, { useState, useEffect } from 'react';
import { BedDouble, Users, AlertTriangle, CheckCircle2, Home } from 'lucide-react';
import { api } from './data';
import { DormRoom } from './types';
import { Button, Card } from './components';

const DormitoryView = () => {
  const [rooms, setRooms] = useState<DormRoom[]>([]);
  const [filterBlock, setFilterBlock] = useState<string>('All');

  useEffect(() => {
    api.getDormRooms().then(setRooms);
  }, []);

  const filteredRooms = filterBlock === 'All' ? rooms : rooms.filter(r => r.block === filterBlock);

  const getStatusColor = (status: string, occupied: number, capacity: number) => {
    if (status === 'Maintenance') return 'bg-red-50 border-red-200 text-red-700';
    if (occupied >= capacity) return 'bg-orange-50 border-orange-200 text-orange-700';
    return 'bg-green-50 border-green-200 text-green-700';
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-gray-800">Quản lý Ký túc xá</h2>
           <p className="text-gray-500">Sắp xếp phòng và theo dõi học sinh nội trú</p>
        </div>
        <div className="flex gap-2">
           {['All', 'A', 'B'].map(block => (
              <button 
                key={block}
                onClick={() => setFilterBlock(block)}
                className={`px-4 py-2 rounded-lg font-medium transition ${filterBlock === block ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
              >
                 {block === 'All' ? 'Tất cả' : `Khu ${block}`}
              </button>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <Card 
            title="Tổng số chỗ" 
            value={rooms.reduce((acc, r) => acc + r.capacity, 0)} 
            icon={<Home size={24}/>} 
            color="bg-blue-500"
         />
         <Card 
            title="Đã sử dụng" 
            value={rooms.reduce((acc, r) => acc + r.occupied, 0)} 
            icon={<Users size={24}/>} 
            color="bg-green-500"
         />
         <Card 
            title="Phòng trống" 
            value={rooms.filter(r => r.occupied < r.capacity && r.status !== 'Maintenance').length} 
            icon={<CheckCircle2 size={24}/>} 
            color="bg-indigo-500"
         />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
         {filteredRooms.map(room => (
            <div key={room.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
               <div className="p-4 border-b border-gray-100 flex justify-between items-start">
                  <div>
                     <h3 className="font-bold text-gray-800 text-lg">{room.name}</h3>
                     <p className="text-sm text-gray-500">Khu {room.block} • {room.type === 'Male' ? 'Nam' : 'Nữ'}</p>
                  </div>
                  <div className={`p-2 rounded-lg ${room.type === 'Male' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'}`}>
                     <BedDouble size={20}/>
                  </div>
               </div>
               
               <div className="p-4">
                  <div className="flex justify-between items-center mb-2">
                     <span className="text-sm text-gray-600">Sĩ số:</span>
                     <span className="font-bold text-gray-800">{room.occupied} / {room.capacity}</span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                     <div 
                        className={`h-2.5 rounded-full ${room.status === 'Maintenance' ? 'bg-red-500' : room.occupied >= room.capacity ? 'bg-orange-500' : 'bg-green-500'}`} 
                        style={{width: `${(room.occupied / room.capacity) * 100}%`}}
                     ></div>
                  </div>

                  <div className={`px-3 py-2 rounded-lg text-center text-sm font-medium ${getStatusColor(room.status, room.occupied, room.capacity)}`}>
                     {room.status === 'Maintenance' ? 'Đang bảo trì' : room.occupied >= room.capacity ? 'Đã đầy' : 'Còn trống'}
                  </div>
               </div>

               <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-between">
                  <button className="text-sm font-medium text-gray-600 hover:text-indigo-600">Danh sách</button>
                  <button className="text-sm font-medium text-indigo-600 hover:text-indigo-800">Xếp chỗ</button>
               </div>
            </div>
         ))}
      </div>
    </div>
  );
};

export default DormitoryView;
