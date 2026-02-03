import React, { useState, useEffect } from 'react';
import { Plus, Search, Book, Users, Calendar, Download, Filter, Eye, Edit, Trash2 } from 'lucide-react';
import { api } from './data';
import { Button, Modal } from './components';

interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  category: string;
  description?: string;
  totalCopies: number;
  availableCopies: number;
  publisher?: string;
  publishedYear?: number;
  location?: string;
  cover?: string;
  status: 'AVAILABLE' | 'UNAVAILABLE';
}

interface BorrowRecord {
  id: number;
  bookId: number;
  studentId: number;
  borrowedAt: string;
  dueDate: string;
  returnedAt?: string;
  status: 'BORROWED' | 'RETURNED' | 'OVERDUE';
  book?: Book;
  student?: any;
}

const LibraryViewEnhanced = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [borrowRecords, setBorrowRecords] = useState<BorrowRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [showBookDetails, setShowBookDetails] = useState<Book | null>(null);
  const [editBook, setEditBook] = useState<Book | null>(null);
  const [activeTab, setActiveTab] = useState<'books' | 'borrowed' | 'statistics'>('books');

  useEffect(() => {
    // Mock data - trong thực tế sẽ gọi API
    const mockBooks: Book[] = [
      {
        id: 1,
        title: "Toán cao cấp 1",
        author: "Nguyễn Văn A",
        isbn: "978-604-123456-7",
        category: "Giáo trình",
        description: "Sách giáo trình toán cao cấp 1 cho học sinh lớp 10",
        totalCopies: 30,
        availableCopies: 25,
        publisher: "Nhà xuất bản Giáo dục",
        publishedYear: 2023,
        location: "Kệ A1",
        status: 'AVAILABLE'
      },
      {
        id: 2,
        title: "Ngữ văn 10",
        author: "Trần Thị B",
        isbn: "978-604-123456-8",
        category: "Ngữ văn",
        description: "Sách giáo trình ngữ văn lớp 10",
        totalCopies: 25,
        availableCopies: 20,
        publisher: "Nhà xuất bản Giáo dục",
        publishedYear: 2023,
        location: "Kệ A2",
        status: 'AVAILABLE'
      }
    ];

    const mockBorrowRecords: BorrowRecord[] = [
      {
        id: 1,
        bookId: 1,
        studentId: 1001,
        borrowedAt: '2024-01-15',
        dueDate: '2024-02-15',
        status: 'BORROWED'
      }
    ];

    setBooks(mockBooks);
    setBorrowRecords(mockBorrowRecords);
  }, []);

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.isbn?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || book.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || book.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleAddBook = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    
    const newBook: Book = {
      id: Date.now(),
      title: (form.elements.namedItem('title') as HTMLInputElement).value,
      author: (form.elements.namedItem('author') as HTMLInputElement).value,
      isbn: (form.elements.namedItem('isbn') as HTMLInputElement).value,
      category: (form.elements.namedItem('category') as HTMLSelectElement).value,
      description: (form.elements.namedItem('description') as HTMLTextAreaElement).value,
      totalCopies: parseInt((form.elements.namedItem('totalCopies') as HTMLInputElement).value),
      availableCopies: parseInt((form.elements.namedItem('totalCopies') as HTMLInputElement).value),
      publisher: (form.elements.namedItem('publisher') as HTMLInputElement).value,
      publishedYear: parseInt((form.elements.namedItem('publishedYear') as HTMLInputElement).value),
      location: (form.elements.namedItem('location') as HTMLInputElement).value,
      status: 'AVAILABLE'
    };

    setBooks([...books, newBook]);
    setShowAddBookModal(false);
  };

  const handleEditBook = (book: Book) => {
    setEditBook(book);
    setShowAddBookModal(true);
  };

  const handleDeleteBook = (bookId: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sách này?')) {
      setBooks(books.filter(b => b.id !== bookId));
    }
  };

  const handleBorrowBook = (book: Book) => {
    setSelectedBook(book);
    setShowBorrowModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-green-100 text-green-700';
      case 'UNAVAILABLE': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getAvailableCopies = (book: Book) => {
    const borrowedCount = borrowRecords.filter(r => r.bookId === book.id && r.status === 'BORROWED').length;
    return book.totalCopies - borrowedCount;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Thư viện</h2>
          <p className="text-gray-500">Quản lý sách và mượn trả</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setShowAddBookModal(true)}>
            <Plus size={20} /> Thêm sách mới
          </Button>
          <Button variant="secondary">
            <Download size={20} /> Xuất Excel
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="flex border-b border-gray-100">
          <button
            className={`px-4 py-3 font-medium text-sm ${
              activeTab === 'books'
                ? 'border-b-2 border-indigo-500 text-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('books')}
          >
            Sách ({books.length})
          </button>
          <button
            className={`px-4 py-3 font-medium text-sm ${
              activeTab === 'borrowed'
                ? 'border-b-2 border-indigo-500 text-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('borrowed')}
          >
            Đang mượn ({borrowRecords.filter(r => r.status === 'BORROWED').length})
          </button>
          <button
            className={`px-4 py-3 font-medium text-sm ${
              activeTab === 'statistics'
                ? 'border-b-2 border-indigo-500 text-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('statistics')}
          >
            Thống kê
          </button>
        </div>

        {activeTab === 'books' && (
          <div className="p-4">
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Tìm kiếm sách theo tên, tác giả, ISBN..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">Tất cả danh mục</option>
                <option value="Giáo trình">Giáo trình</option>
                <option value="Văn học">Văn học</option>
                <option value="Khoa học">Khoa học</option>
                <option value="Ngữ văn">Ngữ văn</option>
                <option value="Tiếng Anh">Tiếng Anh</option>
              </select>
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="AVAILABLE">Có sẵn</option>
                <option value="UNAVAILABLE">Hết sách</option>
              </select>
            </div>
          </div>

          {/* Books Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4">
            {filteredBooks.map(book => {
              const availableCopies = getAvailableCopies(book);
              return (
                <div key={book.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all group">
                  <div className="aspect-[3/4] bg-gray-200 relative overflow-hidden">
                    <img 
                      src={book.cover || `https://ui-avatars.com/api/?name=${encodeURIComponent(book.title)}&background=random&color=6366f1`} 
                      alt={book.title} 
                      className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                    />
                    {availableCopies === 0 && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <span className="bg-red-600 text-white px-3 py-1 text-xs font-bold rounded-full">HẾT SÁCH</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-800 leading-tight mb-2 line-clamp-2" title={book.title}>
                      {book.title}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">{book.author}</p>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {book.category}
                      </span>
                      <span className="text-xs text-gray-500">
                        {availableCopies}/{book.totalCopies} bản
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        className="flex-1 text-sm !py-1"
                        onClick={() => handleBorrowBook(book)}
                        disabled={availableCopies === 0}
                      >
                        {availableCopies > 0 ? 'Mượn' : 'Hết sách'}
                      </Button>
                      <Button
                        variant="secondary"
                        className="flex-1 text-sm !py-1"
                        onClick={() => setShowBookDetails(book)}
                      >
                        <Eye size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'borrowed' && (
        <div className="p-4">
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
                {borrowRecords
                  .filter(record => record.status === 'BORROWED')
                  .map((record) => {
                    const book = books.find(b => b.id === record.bookId);
                    return (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">{book?.title}</div>
                          <div className="text-sm text-gray-500">{book?.author}</div>
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {/* Mock student data */}
                          <div className="font-medium text-gray-900">Tran Minh Tuan</div>
                          <div className="text-sm text-gray-500">HS001</div>
                        </td>
                        <td className="px-4 py-3 text-gray-500">{record.borrowedAt}</td>
                        <td className="px-4 py-3 text-gray-500">{record.dueDate}</td>
                        <td className="px-4 py-3 text-gray-500">-</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                            <Clock size={12} />
                            <span className="ml-1">Đang mượn</span>
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <Button
                              variant="secondary"
                              className="!px-3 !py-1 !text-xs"
                            >
                              <Check size={12} /> Trả sách
                            </Button>
                            <Button
                              variant="secondary"
                              className="!px-3 !py-1 !text-xs"
                            >
                              <Eye size={12} /> Chi tiết
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
      )}

      {activeTab === 'statistics' && (
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-6 rounded-xl">
              <div className="text-2xl font-bold text-blue-700">{books.length}</div>
              <div className="text-sm text-blue-600">Tổng số sách</div>
            </div>
            <div className="bg-green-50 p-6 rounded-xl">
              <div className="text-2xl font-bold text-green-700">
                {books.reduce((sum, book) => sum + book.availableCopies, 0)}
              </div>
              <div className="text-sm text-green-600">Sách có sẵn</div>
            </div>
            <div className="bg-orange-50 p-6 rounded-xl">
              <div className="text-2xl font-bold text-orange-700">
                {borrowRecords.filter(r => r.status === 'BORROWED').length}
              </div>
              <div className="text-sm text-orange-600">Đang mượn</div>
            </div>
          </div>
        </div>
      )}
    </div>

    {/* Add/Edit Book Modal */}
    <Modal 
      isOpen={showAddBookModal} 
      onClose={() => {
        setShowAddBookModal(false);
        setEditBook(null);
      }} 
      title={editBook ? 'Chỉnh sửa thông tin sách' : 'Thêm sách mới'}
    >
      <form onSubmit={handleAddBook} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tên sách *</label>
            <input
              type="text"
              name="title"
              defaultValue={editBook?.title || ''}
              className="w-full border rounded-lg p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tác giả *</label>
            <input
              type="text"
              name="author"
              defaultValue={editBook?.author || ''}
              className="w-full border rounded-lg p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">ISBN</label>
            <input
              type="text"
              name="isbn"
              defaultValue={editBook?.isbn || ''}
              className="w-full border rounded-lg p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Danh mục</label>
            <select
              name="category"
              defaultValue={editBook?.category || ''}
              className="w-full border rounded-lg p-2"
              required
            >
              <option value="">Chọn danh mục</option>
              <option value="Giáo trình">Giáo trình</option>
              <option value="Văn học">Văn học</option>
              <option value="Khoa học">Khoa học</option>
              <option value="Ngữ văn">Ngữ văn</option>
              <option value="Tiếng Anh">Tiếng Anh</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Số lượng</label>
            <input
              type="number"
              name="totalCopies"
              defaultValue={editBook?.totalCopies?.toString() || ''}
              className="w-full border rounded-lg p-2"
              min="1"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Nhà xuất bản</label>
            <input
              type="text"
              name="publisher"
              defaultValue={editBook?.publisher || ''}
              className="w-full border rounded-lg p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Năm xuất bản</label>
            <input
              type="number"
              name="publishedYear"
              defaultValue={editBook?.publishedYear?.toString() || ''}
              className="w-full border rounded-lg p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Vị trí</label>
            <input
              type="text"
              name="location"
              defaultValue={editBook?.location || ''}
              className="w-full border rounded-lg p-2"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Mô tả</label>
            <textarea
              name="description"
              defaultValue={editBook?.description || ''}
              className="w-full border rounded-lg p-2"
              rows={3}
              placeholder="Mô tả về sách..."
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setShowAddBookModal(false);
              setEditBook(null);
            }}
          >
            Hủy
          </Button>
          <Button type="submit">
            {editBook ? 'Cập nhật' : 'Thêm sách'}
          </Button>
        </div>
      </form>
    </Modal>

    {/* Book Details Modal */}
    <Modal
      isOpen={showBookDetails}
      onClose={() => setShowBookDetails(null)}
      title="Chi tiết sách"
    >
      {showBookDetails && (
        <div className="space-y-4">
          <div className="flex items-start space-x-4">
            {showBookDetails.cover && (
              <img
                src={showBookDetails.cover}
                alt={showBookDetails.title}
                className="w-32 h-48 object-cover rounded-lg"
              />
            )}
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900">{showBookDetails.title}</h3>
              <p className="text-gray-600">{showBookDetails.author}</p>
              <p className="text-sm text-gray-500">ISBN: {showBookDetails.isbn}</p>
              <p className="text-sm text-gray-500">Danh mục: {showBookDetails.category}</p>
            </div>
          </div>
          <div className="border-t pt-4">
            <h4 className="font-semibold text-gray-800 mb-2">Thông tin chi tiết</h4>
            <p className="text-gray-600">{showBookDetails.description || 'Không có mô tả'}</p>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <span className="text-sm text-gray-500">Nhà xuất bản:</span>
                <span className="font-medium">{showBookDetails.publisher || 'Chưa có'}</span>
              </div>
              <div>
                <span className="text-sm text-gray-500">Năm xuất bản:</span>
                <span className="font-medium">{showBookDetails.publishedYear || 'Chưa có'}</span>
              </div>
              <div>
                <span className="text-sm text-gray-500">Vị trí:</span>
                <span className="font-medium">{showBookDetails.location || 'Chưa có'}</span>
              </div>
              <div>
                <span className="text-sm text-gray-500">Tổng số:</span>
                <span className="font-medium">{showBookDetails.totalCopies} bản</span>
              </div>
              <div>
                <span className="text-sm text-gray-500">Có sẵn:</span>
                <span className="font-medium">{getAvailableCopies(showBookDetails)} bản</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default LibraryViewEnhanced;
