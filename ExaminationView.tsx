import React, { useState, useEffect, useContext } from 'react';
import { Plus, ClipboardList, Calendar, Clock, AlertCircle, Timer } from 'lucide-react';
import { api, MOCK_SUBJECTS } from './data';
import { Exam } from './types';
import { Button, Modal } from './components';
import { AppContext } from './context';

const ExaminationView = () => {
  const { user } = useContext(AppContext);
  const [exams, setExams] = useState<Exam[]>([]);
  const [testModal, setTestModal] = useState(false);
  const [activeExam, setActiveExam] = useState<Exam | null>(null);

  useEffect(() => {
    api.getExams().then(setExams);
  }, []);

  const handleStartExam = (exam: Exam) => {
    setActiveExam(exam);
    setTestModal(true);
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-gray-800">Thi Cử & Kiểm Tra</h2>
           <p className="text-gray-500">Quản lý lịch thi và làm bài trực tuyến</p>
        </div>
        {user?.role !== 'STUDENT' && <Button><Plus size={20}/> Tạo Kỳ Thi</Button>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exams.map(exam => {
           const subject = MOCK_SUBJECTS.find(s => s.id === exam.subjectId);
           return (
             <div key={exam.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                   <div className={`p-3 rounded-lg ${subject?.color || 'bg-gray-100'} bg-opacity-20`}>
                      <ClipboardList size={24} className="text-gray-700"/>
                   </div>
                   <span className={`px-2 py-1 rounded text-xs font-bold ${
                      exam.status === 'ONGOING' ? 'bg-green-100 text-green-700' : 
                      exam.status === 'UPCOMING' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'
                   }`}>
                      {exam.status === 'ONGOING' ? 'Đang diễn ra' : exam.status === 'UPCOMING' ? 'Sắp diễn ra' : 'Đã kết thúc'}
                   </span>
                </div>
                <h3 className="font-bold text-gray-800 mb-1">{exam.title}</h3>
                <p className="text-sm text-gray-500 mb-4">{subject?.name}</p>
                
                <div className="space-y-2 text-sm text-gray-600 mb-6">
                   <div className="flex items-center gap-2"><Calendar size={16}/> {exam.date}</div>
                   <div className="flex items-center gap-2"><Clock size={16}/> {exam.duration} phút</div>
                   <div className="flex items-center gap-2"><AlertCircle size={16}/> {exam.totalQuestions} câu hỏi</div>
                </div>

                <Button 
                   className="w-full" 
                   variant={exam.status === 'ONGOING' ? 'primary' : 'secondary'}
                   disabled={exam.status !== 'ONGOING'}
                   onClick={() => handleStartExam(exam)}
                >
                   {exam.status === 'ONGOING' ? 'Làm bài ngay' : 'Chưa mở'}
                </Button>
             </div>
           )
        })}
      </div>

      {/* Online Test Simulation Modal */}
      <Modal isOpen={testModal} onClose={() => setTestModal(false)} title={activeExam?.title || "Bài thi"} maxWidth="max-w-4xl">
         <div className="flex flex-col h-[60vh]">
            <div className="flex justify-between items-center mb-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
               <div className="flex items-center gap-2 text-blue-700 font-bold">
                  <Timer size={20}/>
                  <span>Thời gian còn lại: 45:00</span>
               </div>
               <div className="text-sm text-gray-600">Câu hỏi 1 / {activeExam?.totalQuestions}</div>
            </div>

            <div className="flex-1 overflow-y-auto mb-6">
               <h4 className="font-semibold text-lg mb-4">Câu 1: Tập xác định của hàm số y = √(x-1) là:</h4>
               <div className="space-y-3">
                  {['A. D = [1; +∞)', 'B. D = (1; +∞)', 'C. D = R \\ {1}', 'D. D = (-∞; 1]'].map((opt, idx) => (
                     <label key={idx} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input type="radio" name="q1" className="w-4 h-4 text-indigo-600"/>
                        <span>{opt}</span>
                     </label>
                  ))}
               </div>
               
               <div className="mt-8">
                  <h4 className="font-semibold text-lg mb-4">Câu 2: Cho tam giác ABC vuông tại A...</h4>
                  <div className="h-32 bg-gray-100 rounded flex items-center justify-center text-gray-400">Nội dung câu hỏi tiếp theo...</div>
               </div>
            </div>

            <div className="flex justify-between border-t pt-4">
               <Button variant="secondary">Câu trước</Button>
               <div className="flex gap-2">
                  <Button variant="secondary">Lưu nháp</Button>
                  <Button onClick={() => { setTestModal(false); alert("Nộp bài thành công!"); }}>Nộp bài</Button>
               </div>
            </div>
         </div>
      </Modal>
    </div>
  );
};

export default ExaminationView;