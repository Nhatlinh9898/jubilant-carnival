import React, { useState, useEffect, useContext } from 'react';
import { Upload, PlayCircle, FileText, User as UserIcon, Calendar, Clock, Download, Video } from 'lucide-react';
import { api, MOCK_SUBJECTS } from './data';
import { LMSMaterial } from './types';
import { Button, Modal } from './components';
import { AppContext } from './context';

const LMSView = () => {
  const { user } = useContext(AppContext);
  const [materials, setMaterials] = useState<LMSMaterial[]>([]);
  const [uploadModal, setUploadModal] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<LMSMaterial | null>(null);

  useEffect(() => {
    api.getLMSMaterials().then(setMaterials);
  }, []);

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    const newMaterial: LMSMaterial = {
      id: Date.now(),
      title: "Bài giảng mới: Hình học không gian",
      type: "VIDEO",
      subjectId: 1,
      postedBy: user?.fullName || "User",
      date: new Date().toLocaleDateString('vi-VN'),
      description: "Mô tả bài giảng mới"
    };
    setMaterials([newMaterial, ...materials]);
    setUploadModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-gray-800">Hệ thống Học tập (LMS)</h2>
           <p className="text-gray-500">Bài giảng video và bài tập về nhà</p>
        </div>
        {user?.role === 'TEACHER' && (
          <Button onClick={() => setUploadModal(true)}>
             <Upload size={18} /> Tải lên Tài liệu
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {materials.map(item => (
          <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
            <div className={`h-40 flex items-center justify-center relative ${item.type === 'VIDEO' ? 'bg-gradient-to-br from-red-50 to-red-100' : 'bg-gradient-to-br from-blue-50 to-blue-100'}`}>
               {item.type === 'VIDEO' ? <Video size={48} className="text-red-500" /> : <FileText size={48} className="text-blue-500" />}
               <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all flex items-center justify-center">
                  {item.type === 'VIDEO' && <PlayCircle size={48} className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />}
               </div>
            </div>
            <div className="p-4">
               <div className="flex justify-between items-start mb-2">
                 <span className={`text-xs font-semibold px-2 py-1 rounded ${item.type === 'VIDEO' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                   {item.type === 'VIDEO' ? 'VIDEO BÀI GIẢNG' : 'BÀI TẬP'}
                 </span>
                 <span className="text-xs text-gray-400">{item.date}</span>
               </div>
               <h3 className="font-bold text-gray-800 mb-2 truncate" title={item.title}>{item.title}</h3>
               <p className="text-sm text-gray-500 mb-4">Đăng bởi: {item.postedBy}</p>
               
               <Button variant="secondary" className="w-full text-sm" onClick={() => setSelectedMaterial(item)}>
                   {item.type === 'VIDEO' ? 'Xem ngay' : 'Chi tiết'}
               </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Modal */}
      <Modal isOpen={uploadModal} onClose={() => setUploadModal(false)} title="Tải lên Tài liệu mới">
         <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tiêu đề</label>
              <input type="text" className="w-full border rounded-lg p-2" required placeholder="Nhập tiêu đề..." />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Loại</label>
              <select className="w-full border rounded-lg p-2">
                <option value="VIDEO">Video bài giảng</option>
                <option value="ASSIGNMENT">Bài tập về nhà</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Mô tả</label>
              <textarea className="w-full border rounded-lg p-2" rows={3}></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Đường dẫn / File</label>
              <input type="file" className="w-full border rounded-lg p-2" />
            </div>
            <Button type="submit" className="w-full">Đăng tải</Button>
         </form>
      </Modal>

      {/* Detail Modal */}
      <Modal isOpen={!!selectedMaterial} onClose={() => setSelectedMaterial(null)} title={selectedMaterial?.title || ''}>
          <div className="space-y-4">
              <div className="text-sm text-gray-500 flex justify-between">
                  <span>Môn: {MOCK_SUBJECTS.find(s => s.id === selectedMaterial?.subjectId)?.name}</span>
                  <span>Ngày: {selectedMaterial?.date}</span>
              </div>
              
              {selectedMaterial?.type === 'VIDEO' ? (
                  <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
                      <span className="text-white">Video Player Simulation</span>
                  </div>
              ) : (
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2 mb-2">
                          <Download size={20} className="text-blue-600"/>
                          <span className="font-medium text-blue-600 underline cursor-pointer">tai_lieu_bai_tap.pdf</span>
                      </div>
                      <p className="text-sm text-gray-500">Hạn nộp: {selectedMaterial?.deadline}</p>
                  </div>
              )}

              <div>
                  <h4 className="font-semibold mb-2">Mô tả:</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                      {selectedMaterial?.description || "Không có mô tả chi tiết."}
                  </p>
              </div>

              <div className="flex justify-end pt-2">
                  <Button onClick={() => setSelectedMaterial(null)}>Đóng</Button>
              </div>
          </div>
      </Modal>
    </div>
  );
};

export default LMSView;