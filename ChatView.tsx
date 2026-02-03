import React, { useState, useContext } from 'react';
import { Search, Phone, Video, AlertCircle, Paperclip, Send, MessageCircle } from 'lucide-react';
import { AppContext } from './context';
import { MOCK_TEACHERS, MOCK_STUDENTS, MOCK_CHAT_HISTORY } from './data';
import { ChatMessage } from './types';

const ChatView = () => {
  const { user } = useContext(AppContext);
  const [activeContact, setActiveContact] = useState<number | null>(MOCK_TEACHERS[0].id);
  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_CHAT_HISTORY);
  const [inputText, setInputText] = useState("");

  const handleSend = () => {
    if (!inputText.trim()) return;
    const newMsg: ChatMessage = {
      id: Date.now(),
      senderId: user?.id || 0,
      senderName: "Me",
      text: inputText,
      timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      isMe: true
    };
    setMessages([...messages, newMsg]);
    setInputText("");
    
    // Auto reply mock
    setTimeout(() => {
       const reply: ChatMessage = {
          id: Date.now() + 1,
          senderId: activeContact || 0,
          senderName: "Người nhận",
          text: "Tôi đã nhận được tin nhắn của bạn.",
          timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
          isMe: false
       };
       setMessages(prev => [...prev, reply]);
    }, 1000);
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
       {/* Sidebar Contacts */}
       <div className="w-80 border-r border-gray-100 flex flex-col hidden md:flex">
          <div className="p-4 border-b border-gray-100">
             <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"/>
                <input placeholder="Tìm kiếm liên hệ..." className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 bg-gray-50"/>
             </div>
          </div>
          <div className="flex-1 overflow-y-auto">
             <div className="px-4 py-2 text-xs font-semibold text-gray-500 bg-gray-50 uppercase">Giáo viên</div>
             {MOCK_TEACHERS.map(t => (
                <div 
                  key={t.id} 
                  onClick={() => setActiveContact(t.id)}
                  className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 ${activeContact === t.id ? 'bg-indigo-50' : ''}`}
                >
                   <div className="relative">
                      <img src={t.avatar} alt="" className="w-10 h-10 rounded-full"/>
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                   </div>
                   <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-800 truncate">{t.fullName}</h4>
                      <p className="text-xs text-gray-500 truncate">{t.major}</p>
                   </div>
                </div>
             ))}
             <div className="px-4 py-2 text-xs font-semibold text-gray-500 bg-gray-50 uppercase mt-2">Lớp 10A1</div>
             {MOCK_STUDENTS.slice(0, 3).map(s => (
                <div key={s.id} className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50">
                   <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500">
                      {s.fullName.charAt(0)}
                   </div>
                   <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-800 truncate">{s.fullName}</h4>
                      <p className="text-xs text-gray-500 truncate">Học sinh</p>
                   </div>
                </div>
             ))}
          </div>
       </div>

       {/* Main Chat Area */}
       <div className="flex-1 flex flex-col bg-gray-50/50">
          {activeContact ? (
             <>
               <div className="p-4 bg-white border-b border-gray-100 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                     <img src={MOCK_TEACHERS.find(t => t.id === activeContact)?.avatar} alt="" className="w-10 h-10 rounded-full"/>
                     <div>
                        <h3 className="font-bold text-gray-800">{MOCK_TEACHERS.find(t => t.id === activeContact)?.fullName || 'Người dùng'}</h3>
                        <span className="text-xs text-green-600 flex items-center gap-1"><span className="w-2 h-2 bg-green-500 rounded-full"></span> Trực tuyến</span>
                     </div>
                  </div>
                  <div className="flex gap-2 text-gray-400">
                     <button className="p-2 hover:bg-gray-100 rounded-full"><Phone size={20}/></button>
                     <button className="p-2 hover:bg-gray-100 rounded-full"><Video size={20}/></button>
                     <button className="p-2 hover:bg-gray-100 rounded-full"><AlertCircle size={20}/></button>
                  </div>
               </div>
               
               <div className="flex-1 p-4 overflow-y-auto space-y-4">
                  {messages.map(msg => (
                     <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] p-3 rounded-2xl shadow-sm ${
                           msg.isMe ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
                        }`}>
                           <p className="text-sm">{msg.text}</p>
                           <span className={`text-[10px] block mt-1 ${msg.isMe ? 'text-indigo-200' : 'text-gray-400'}`}>{msg.timestamp}</span>
                        </div>
                     </div>
                  ))}
               </div>

               <div className="p-4 bg-white border-t border-gray-100">
                  <div className="flex items-center gap-2">
                     <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-gray-100 rounded-full"><Paperclip size={20}/></button>
                     <input 
                        className="flex-1 border border-gray-200 rounded-full px-4 py-2 focus:outline-none focus:border-indigo-500 bg-gray-50"
                        placeholder="Nhập tin nhắn..."
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                     />
                     <button 
                       onClick={handleSend}
                       className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 shadow-md transform active:scale-95 transition"
                     >
                        <Send size={20} className="ml-0.5"/>
                     </button>
                  </div>
               </div>
             </>
          ) : (
             <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                <MessageCircle size={64} className="mb-4 opacity-20"/>
                <p>Chọn một liên hệ để bắt đầu trò chuyện</p>
             </div>
          )}
       </div>
    </div>
  );
};

export default ChatView;