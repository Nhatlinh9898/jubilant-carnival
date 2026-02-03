import React, { useState, useEffect } from 'react';
import { Book, Calendar, Clock, Check, X, Search, Filter, Download, History } from 'lucide-react';
import { api } from './data';
import { Button, Modal } from './components';

interface BorrowRecord {
  id: number;
  bookId: number;
  studentId: number;
  borrowedAt: string;
  dueDate: string;
  returnedAt?: string;
  status: 'BORROWED' | 'RETURNED' | 'OVERDUE';
  book?: any;
  student?: any;
}

const LibraryBorrowView = () => {
  const [borrowRecords, setBorrowRecords] = useState<BorrowRecord[]>([]);
  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [selectedRecord, setSelectedRecord] = useState<BorrowRecord | null>(null);
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    // Mock data - trong thực tế sẽ gọi API
    const mockBorrowRecords: BorrowRecord[] = [
      {
        id: 1,
        bookId: 1,
        studentId: 1001,
        borrowedAt: '2024-01-15',
        dueDate: '2024-02-15',
        status: 'BORROWED'
      },
      {
        id: 2,
        bookId: 2,
        studentId: 1002,
        borrowedAt: '2024-01-10',
        dueDate: '2024-02-10',
        returnedAt: '2024-02-08',
        status: 'RETURNED'
      }
    ];
    setBorrowRecords(mockBorrowRecords);
  }, []);

  const filteredRecords = borrowRecords.filter(record => {
    const matchesSearch = record.book?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.student?.fullName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    const matchesTab = activeTab === 'current' ? record.status === 'BORROWED' : record.status !== 'BORROWED';
    return matchesSearch && matchesStatus && matchesTab;
  });

  const handleBorrowBook = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    
    const newRecord: BorrowRecord = {
      id: Date.now(),
      bookId: selectedBook.id,
      studentId: parseInt((form.elements.namedItem('studentId') as HTMLSelectElement).value),
      borrowedAt: new Date().toISOString().split('T')[0],
      dueDate: (form.elements.namedItem('dueDate') as HTMLInputElement).value,
      status: 'BORROWED'
    };

    setBorrowRecords([...borrowRecords, newRecord]);
    setShowBorrowModal(false);
    setSelectedBook(null);
  };

  const handleReturnBook = (recordId: number) => {
    setBorrowRecords(borrowRecords.map(record => 
      record.id === recordId 
        ? { ...record, returnedAt: new Date().toISOString().split('T')[0], status: 'RETURNED' }
        : record
    ));
    setShowReturnModal(false);
    setSelectedRecord(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'BORROWED': return 'bg-blue-100 text-blue-700';
      case 'RETURNED': return 'bg-green-100 text-green-700';
      case 'OVERDUE': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'BORROWED': return <Clock size={16} />;
      case 'RETURNED': return <Check size={16} />;
      case 'OVERDUE': return <X size={16} />;
      default: return null;
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Mượn & Trả Sách</h2>
          <p className="text-gray-500">Quản lý mượn và trả sách thư viện</p>
        </div>
        <Button onClick={() => setShowBorrowModal(true)}>
          <Book size={20} /> Mượn sách
        </Button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="flex border-b border-gray-100">
          <button
            className={`px-4 py-3 font-medium text-sm ${
              activeTab === 'current'
                ? 'border-b-2 border-indigo-500 text-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('current')}
          >
            Đang mượn ({borrowRecords.filter(r => r.status === 'BORROWED').length})
          </button>
          <button
            className={`px-4 py-3 font-medium text-sm ${
              activeTab === 'history'
                ? 'border-b-2 border-indigo-500 text-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('history')}
          >
            Lịch sử ({borrowRecords.filter(r => r.status !== 'BORROWED').length})
          </button>
        </div>

        {/* Search and Filter */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên sách, học sinh..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="BORROWED">Đang mượn</option>
              <option value="RETURNED">Đã trả</option>
              <option value="OVERDUE">Trễ hạn</option>
            </select>
          </div>
        </div>

        {/* Records Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Sách</th>
                <th className="px-4 py-3 text-left">Học sinh</th>
                <th className="px-4 py-3 text-left">Ngày mượn</th>
                <th className="px-4 py-3 text-left">Hạn trả</th>
                <th className="px-4 py-3 text-left">Ngày trả</th>
                <th className="px-4 py-3 text-left">Trạng thái</th>
                <th className="px-4 py-3 text-left">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRecords.map((record) => {
                const isOverdueRecord = record.status === 'BORROWED' && isOverdue(record.dueDate);
                const status = isOverdueRecord ? 'OVERDUE' : record.status;
                
                return (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium text-gray-900">{record.book?.title}</div>
                        <div className="text-sm text-gray-500">{record.book?.author}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{record.student?.fullName}</div>
                      <div className="text-sm text-gray-500">{record.student?.code}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{record.borrowedAt}</td>
                    <td className="px-4 py-3 text-gray-500">
                      <span className={isOverdueRecord ? 'text-red-600 font-medium' : ''}>
                        {record.dueDate}
                        {isOverdueRecord && (
                          <span className="ml-1 text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">TRỄ HẠN</span>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{record.returnedAt || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                        {getStatusIcon(status)}
                        <span className="ml-1">
                          {status === 'BORROWED' ? 'Đang mượn' : 
                           status === 'RETURNED' ? 'Đã trả' : 'Trễ hạn'}
                        </span>
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {record.status === 'BORROWED' && (
                          <Button
                            variant="secondary"
                            className="!px-3 !py-1 !text-xs"
                            onClick={() => {
                              setSelectedRecord(record);
                              setShowReturnModal(true);
                            }}
                          >
                            <Check size={12} /> Trả sách
                          </Button>
                        )}
                        <Button
                          variant="secondary"
                          className="!px-3 !py-1 !text-xs"
                          onClick={() => {
                            // Show details modal
                          }}
                        >
                          <History size={12} /> Chi tiết
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    {/* Borrow Book Modal */}
    <Modal isOpen={showBorrowModal} onClose={() => setShowBorrowModal(false)} title="Mượn sách">
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900">Thông tin sách</h3>
          {selectedBook && (
            <div className="mt-2">
              <p className="text-sm"><strong>Tên sách:</strong> {selectedBook.title}</p>
              <p className="text-sm"><strong>Tác giả:</strong> {selectedBook.author}</p>
              <p className="text-sm"><strong>Danh mục:</strong> {selectedBook.category}</p>
              <p className="text-sm"><strong>Số lượng còn:</strong> {selectedBook.availableCopies}</p>
            </div>
          )}
        </div>

        <form onSubmit={handleBorrowBook} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Học sinh</label>
            <select name="studentId" className="w-full border rounded-lg p-2" required>
              <option value="">Chọn học sinh</option>
              {/* Mock students - trong thực tế sẽ lấy từ API */}
              <option value="1001">Tran Minh Tuan - HS001</option>
              <option value="1002">Le Thu Ha - HS002</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Ngày trả dự kiến</label>
            <input
              type="date"
              name="dueDate"
              className="w-full border rounded-lg p-2"
              required
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="secondary" onClick={() => setShowBorrowModal(false)}>
              Hủy
            </Button>
            <Button type="submit">
              Mượn sách
            </Button>
          </div>
        </form>
      </div>
    </Modal>

    {/* Return Book Modal */}
    <Modal isOpen={showReturnModal} onClose={() => setShowReturnModal(false)} title="Trả sách">
      <div className="space-y-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-medium text-green-900">Xác nhận trả sách</h3>
          {selectedRecord && (
            <div className="mt-2">
              <p className="text-sm"><strong>Sách:</strong> {selectedRecord.book?.title}</p>
              <p className="text-sm"><strong>Học sinh:</strong> {selectedRecord.student?.fullName}</p>
              <p className="text-sm"><strong>Ngày mượn:</strong> {selectedRecord.borrowedAt}</p>
              <p className="text-sm"><strong>Hạn trả:</strong> {selectedRecord.dueDate}</p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="secondary" onClick={() => setShowReturnModal(false)}>
            Hủy
          </Button>
          <Button onClick={() => handleReturnBook(selectedRecord.id)}>
            Xác nhận trả
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default LibraryBorrowView;
