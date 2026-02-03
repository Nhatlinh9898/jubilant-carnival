import React, { useState, useEffect } from 'react';
import { Download, Clock, Users, MapPin } from 'lucide-react';
import { api, MOCK_SUBJECTS, MOCK_TEACHERS } from './data';
import { ScheduleItem } from './types';
import { Button } from './components';

const TimetableView = () => {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  
  useEffect(() => {
    api.getSchedule().then(setSchedule);
  }, []);

  const days = [
    { num: 2, name: 'Thứ 2' },
    { num: 3, name: 'Thứ 3' },
    { num: 4, name: 'Thứ 4' },
    { num: 5, name: 'Thứ 5' },
    { num: 6, name: 'Thứ 6' },
    { num: 7, name: 'Thứ 7' },
  ];
  const periods = [1, 2, 3, 4, 5];

  const getSubject = (id: number) => MOCK_SUBJECTS.find(s => s.id === id);
  const getTeacher = (id: number) => MOCK_TEACHERS.find(t => t.id === id);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-gray-800">Thời Khóa Biểu</h2>
           <p className="text-gray-500">Lịch học tuần này (Lớp 10A1)</p>
        </div>
        <Button variant="secondary" onClick={() => alert('Xuất PDF thời khóa biểu đang phát triển!')}><Download size={18}/> Xuất PDF</Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <div className="min-w-[800px]">
          <div className="grid grid-cols-7 border-b border-gray-200">
             <div className="p-4 bg-gray-50 font-semibold text-gray-600 border-r text-center">Tiết / Ngày</div>
             {days.map(d => (
               <div key={d.num} className="p-4 bg-gray-50 font-semibold text-gray-800 text-center border-r last:border-0">
                 {d.name}
               </div>
             ))}
          </div>
          {periods.map(p => (
            <div key={p} className="grid grid-cols-7 border-b border-gray-100 last:border-0 h-32">
               <div className="p-4 border-r bg-gray-50 flex flex-col items-center justify-center">
                 <span className="font-bold text-xl text-gray-700">{p}</span>
                 <span className="text-xs text-gray-500 flex items-center gap-1"><Clock size={10}/> 45'</span>
               </div>
               {days.map(d => {
                 const item = schedule.find(s => s.day === d.num && s.period === p);
                 if (!item) return <div key={d.num} className="border-r last:border-0"></div>;
                 
                 const subject = getSubject(item.subjectId);
                 const teacher = getTeacher(item.teacherId);
                 
                 return (
                   <div key={d.num} className="p-2 border-r last:border-0">
                     <div className={`h-full rounded-lg p-3 border ${subject?.color || 'bg-gray-100'} flex flex-col justify-between hover:scale-105 transition-transform cursor-pointer shadow-sm`}>
                       <div>
                         <span className="text-xs font-bold uppercase opacity-75">{subject?.code}</span>
                         <h4 className="font-bold text-sm leading-tight mt-1">{subject?.name}</h4>
                       </div>
                       <div className="mt-2 text-xs opacity-90">
                         <div className="flex items-center gap-1 mb-1"><Users size={12}/> {teacher?.fullName}</div>
                         <div className="flex items-center gap-1"><MapPin size={12}/> P.201</div>
                       </div>
                     </div>
                   </div>
                 );
               })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TimetableView;