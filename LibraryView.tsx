import React, { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import { api } from './data';
import { Book } from './types';
import { Button } from './components';

const LibraryView = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    api.getBooks().then(setBooks);
  }, []);

  const filteredBooks = books.filter(b => b.title.toLowerCase().includes(searchTerm.toLowerCase()) || b.author.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Thư Viện</h2>
          <p className="text-gray-500">Tra cứu sách và quản lý mượn trả</p>
        </div>
        <Button><Plus size={20}/> Nhập Sách Mới</Button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 relative">
          <Search className="absolute left-7 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Tìm kiếm sách theo tên, tác giả..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
         {filteredBooks.map(book => (
           <div key={book.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all group flex flex-col h-full">
              <div className="aspect-[2/3] bg-gray-200 relative overflow-hidden">
                <img src={book.cover} alt={book.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                {book.status === 'BORROWED' && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <span className="bg-red-600 text-white px-3 py-1 text-xs font-bold rounded-full transform -rotate-12">ĐÃ MƯỢN</span>
                  </div>
                )}
              </div>
              <div className="p-4 flex flex-col flex-1">
                 <h3 className="font-bold text-gray-800 leading-tight mb-1 line-clamp-2" title={book.title}>{book.title}</h3>
                 <p className="text-sm text-gray-500 mb-2">{book.author}</p>
                 <div className="mt-auto">
                   <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{book.category}</span>
                   {book.status === 'AVAILABLE' ? (
                     <Button variant="secondary" className="w-full mt-3 text-sm !py-1">Mượn sách</Button>
                   ) : (
                      <Button variant="secondary" className="w-full mt-3 text-sm !py-1 opacity-50 cursor-not-allowed">Đã hết</Button>
                   )}
                 </div>
              </div>
           </div>
         ))}
      </div>
    </div>
  );
};

export default LibraryView;