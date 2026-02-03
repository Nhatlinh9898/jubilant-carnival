import React, { useState, useEffect } from 'react';
import { MessageSquare, BarChart, CheckCircle2, Clock, Plus } from 'lucide-react';
import { api } from './data';
import { Survey, FeedbackItem } from './types';
import { Button } from './components';

const FeedbackView = () => {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);

  useEffect(() => {
    api.getSurveys().then(setSurveys);
    api.getFeedbacks().then(setFeedbacks);
  }, []);

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-gray-800">Khảo sát & Ý kiến</h2>
           <p className="text-gray-500">Lắng nghe ý kiến để nâng cao chất lượng</p>
        </div>
        <Button><Plus size={20}/> Tạo Khảo sát mới</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* Surveys Section */}
         <div className="space-y-4">
            <h3 className="font-bold text-gray-700 flex items-center gap-2"><BarChart size={20}/> Khảo sát đang diễn ra</h3>
            <div className="space-y-4">
               {surveys.map(survey => (
                  <div key={survey.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
                     <div className="flex justify-between items-start mb-2">
                        <span className={`text-xs font-bold px-2 py-1 rounded ${
                           survey.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                           {survey.status === 'Active' ? 'Đang mở' : 'Đã đóng'}
                        </span>
                        <span className="text-xs text-gray-400">Hạn: {survey.deadline}</span>
                     </div>
                     <h4 className="font-bold text-gray-800 text-lg mb-4">{survey.title}</h4>
                     
                     <div className="space-y-2">
                        <div className="flex justify-between text-sm text-gray-600">
                           <span>Tiến độ</span>
                           <span className="font-medium">{survey.participants} / {survey.totalTarget}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                           <div 
                              className="bg-indigo-600 h-2 rounded-full transition-all duration-500" 
                              style={{width: `${(survey.participants / survey.totalTarget) * 100}%`}}
                           ></div>
                        </div>
                     </div>
                     <div className="mt-4 flex gap-2">
                        <button className="flex-1 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100">Xem kết quả</button>
                        <button className="flex-1 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100">Chia sẻ</button>
                     </div>
                  </div>
               ))}
            </div>
         </div>

         {/* Feedback Box Section */}
         <div className="space-y-4">
            <h3 className="font-bold text-gray-700 flex items-center gap-2"><MessageSquare size={20}/> Hòm thư góp ý</h3>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-[500px] flex flex-col">
               <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {feedbacks.map(fb => (
                     <div key={fb.id} className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition">
                        <div className="flex justify-between items-start mb-2">
                           <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-xs">?</div>
                              <div>
                                 <p className="font-bold text-sm text-gray-800">{fb.senderName}</p>
                                 <p className="text-xs text-gray-500">{fb.category}</p>
                              </div>
                           </div>
                           <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                              fb.status === 'New' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-gray-50 border-gray-200 text-gray-600'
                           }`}>
                              {fb.status === 'New' ? 'Mới' : 'Đã trả lời'}
                           </span>
                        </div>
                        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg mb-2">"{fb.content}"</p>
                        <div className="flex justify-between items-center">
                           <span className="text-xs text-gray-400">{fb.date}</span>
                           <button className="text-xs font-medium text-indigo-600 hover:underline">Phản hồi</button>
                        </div>
                     </div>
                  ))}
               </div>
               <div className="p-4 border-t border-gray-100 bg-gray-50">
                  <Button className="w-full">Xem tất cả góp ý</Button>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default FeedbackView;