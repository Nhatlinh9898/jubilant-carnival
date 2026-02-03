import React, { useState, useEffect } from 'react';
import { Plus, Search, Calendar, Users, CheckCircle, XCircle, Clock, ChevronRight } from 'lucide-react';
import { api, MOCK_CLASSES, MOCK_STUDENTS } from './data';
import { Button, Modal } from './components';

interface Enrollment {
  id: number;
  studentId: number;
  classId: number;
  academicYear: string;
  enrollmentDate: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  notes?: string;
  student?: any;
  class?: any;
}

const EnrollmentView = () => {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [filteredEnrollments, setFilteredEnrollments] = useState<Enrollment[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);

  useEffect(() => {
    // Mock data - trong thực tế sẽ gọi API
    const mockEnrollments: Enrollment[] = [
      {
        id: 1,
        studentId: 1001,
        classId: 1,
        academicYear: '2024-2025',
        enrollmentDate: '2024-01-15',
        status: 'APPROVED',
        notes: 'Đăng ký đúng hạn'
      },
      {
        id: 2,
        studentId: 1002,
        classId: 2,
        academicYear: '2024-2025',
        enrollmentDate: '2024-01-16',
        status: 'PENDING',
        notes: 'Chờ phê duyệt'
      }
    ];
    setEnrollments(mockEnrollments);
  }, []);

  useEffect(() => {
    let filtered = enrollments;

    if (searchTerm) {
      filtered = filtered.filter(e => 
        e.student?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.student?.code?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(e => e.status === statusFilter);
    }

    if (gradeFilter !== 'all') {
      filtered = filtered.filter(e => e.class?.gradeLevel === parseInt(gradeFilter));
    }

    setFilteredEnrollments(filtered);
  }, [enrollments, searchTerm, statusFilter, gradeFilter]);

  const handleAddEnrollment = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    
    const newEnrollment: Enrollment = {
      id: Date.now(),
      studentId: parseInt((form.elements.namedItem('studentId') as HTMLSelectElement).value),
      classId: parseInt((form.elements.namedItem('classId') as HTMLSelectElement).value),
      academicYear: (form.elements.namedItem('academicYear') as HTMLInputElement).value,
      enrollmentDate: new Date().toISOString().split('T')[0],
      status: 'PENDING',
      notes: (form.elements.namedItem('notes') as HTMLTextAreaElement).value
    };

    setEnrollments([...enrollments, newEnrollment]);
    setShowAddModal(false);
  };

  const handleStatusUpdate = (enrollmentId: number, status: 'APPROVED' | 'REJECTED') => {
    setEnrollments(enrollments.map(e => 
      e.id === enrollmentId ? { ...e, status } : e
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-700';
      case 'REJECTED': return 'bg-red-100 text-red-700';
      case 'PENDING': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED': return <CheckCircle size={16} />;
      case 'REJECTED': return <XCircle size={16} />;
      case 'PENDING': return <Clock size={16} />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Quản lý Đăng ký</h2>
          <p className="text-gray-500">Đăng ký học mới và quản lý chuyển lớp</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setShowTransferModal(true)}>
            <Users size={16} /> Chuyển lớp
          </Button>
          <Button variant="secondary" onClick={() => setShowPromoteModal(true)}>
            <ChevronRight size={16} /> Chuyển cấp
          </Button>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus size={16} /> Đăng ký mới
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, mã học sinh..."
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
            <option value="PENDING">Chờ duyệt</option>
            <option value="APPROVED">Đã duyệt</option>
            <option value="REJECTED">Từ chối</option>
          </select>
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
          >
            <option value="all">Tất cả khối</option>
            <option value="10">Khối 10</option>
            <option value="11">Khối 11</option>
            <option value="12">Khối 12</option>
          </select>
        </div>
      </div>

      {/* Enrollments List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Học sinh</th>
                <th className="px-4 py-3 text-left">Lớp</th>
                <th className="px-4 py-3 text-left">Năm học</th>
                <th className="px-4 py-3 text-left">Ngày đăng ký</th>
                <th className="px-4 py-3 text-left">Trạng thái</th>
                <th className="px-4 py-3 text-left">Ghi chú</th>
                <th className="px-4 py-3 text-left">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredEnrollments.map((enrollment) => {
                const student = MOCK_STUDENTS.find(s => s.id === enrollment.studentId);
                const classData = MOCK_CLASSES.find(c => c.id === enrollment.classId);
                
                return (
                  <tr key={enrollment.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium text-gray-900">{student?.fullName}</div>
                        <div className="text-sm text-gray-500">{student?.code}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{classData?.name}</div>
                      <div className="text-sm text-gray-500">{classData?.code}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{enrollment.academicYear}</td>
                    <td className="px-4 py-3 text-gray-500">{enrollment.enrollmentDate}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(enrollment.status)}`}>
                        {getStatusIcon(enrollment.status)}
                        <span className="ml-1">
                          {enrollment.status === 'APPROVED' ? 'Đã duyệt' : 
                           enrollment.status === 'REJECTED' ? 'Từ chối' : 'Chờ duyệt'}
                        </span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{enrollment.notes || '-'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {enrollment.status === 'PENDING' && (
                          <>
                            <Button
                              variant="secondary"
                              className="!px-3 !py-1 !text-xs"
                              onClick={() => handleStatusUpdate(enrollment.id, 'APPROVED')}
                            >
                              <CheckCircle size={12} /> Duyệt
                            </Button>
                            <Button
                              variant="secondary"
                              className="!px-3 !py-1 !text-xs"
                              onClick={() => handleStatusUpdate(enrollment.id, 'REJECTED')}
                            >
                              <XCircle size={12} /> Từ chối
                            </Button>
                          </>
                        )}
                        <Button
                          variant="secondary"
                          className="!px-3 !py-1 !text-xs"
                          onClick={() => setSelectedEnrollment(enrollment)}
                        >
                          Chi tiết
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

      {/* Add Enrollment Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Đăng ký học sinh mới">
        <form onSubmit={handleAddEnrollment} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Học sinh</label>
            <select name="studentId" className="w-full border rounded-lg p-2" required>
              <option value="">Chọn học sinh</option>
              {MOCK_STUDENTS.map(student => (
                <option key={student.id} value={student.id}>
                  {student.fullName} - {student.code}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Lớp</label>
            <select name="classId" className="w-full border rounded-lg p-2" required>
              <option value="">Chọn lớp</option>
              {MOCK_CLASSES.map(cls => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} - {cls.code}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Năm học</label>
            <input
              type="text"
              name="academicYear"
              className="w-full border rounded-lg p-2"
              placeholder="2024-2025"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Ghi chú</label>
            <textarea
              name="notes"
              className="w-full border rounded-lg p-2"
              rows={3}
              placeholder="Ghi chú về đăng ký..."
            />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="secondary" onClick={() => setShowAddModal(false)}>
              Hủy
            </Button>
            <Button type="submit">
              Đăng ký
            </Button>
          </div>
        </form>
      </Modal>

      {/* Transfer Students Modal */}
      <Modal isOpen={showTransferModal} onClose={() => setShowTransferModal(false)} title="Chuyển học sinh">
        <div className="space-y-4">
          <p className="text-gray-600">Chọn học sinh và lớp đích để chuyển</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Học sinh</label>
              <select className="w-full border rounded-lg p-2">
                <option value="">Chọn học sinh</option>
                {MOCK_STUDENTS.map(student => (
                  <option key={student.id} value={student.id}>
                    {student.fullName} - {student.code}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Lớp đích</label>
              <select className="w-full border rounded-lg p-2">
                <option value="">Chọn lớp đích</option>
                {MOCK_CLASSES.map(cls => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} - {cls.code}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="secondary" onClick={() => setShowTransferModal(false)}>
              Hủy
            </Button>
            <Button>
              Chuyển lớp
            </Button>
          </div>
        </div>
      </Modal>

      {/* Promote Students Modal */}
      <Modal isOpen={showPromoteModal} onClose={() => setShowPromoteModal(false)} title="Chuyển cấp hàng loạt">
        <div className="space-y-4">
          <p className="text-gray-600">Chuyển tất cả học sinh lên lớp trên</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Từ khối</label>
              <select className="w-full border rounded-lg p-2">
                <option value="10">Khối 10</option>
                <option value="11">Khối 11</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Năm học mới</label>
              <input
                type="text"
                className="w-full border rounded-lg p-2"
                placeholder="2025-2026"
              />
            </div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Lưu ý:</strong> Hệ thống sẽ tự động tạo lớp mới nếu lớp hiện tại đã đầy.
            </p>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="secondary" onClick={() => setShowPromoteModal(false)}>
              Hủy
            </Button>
            <Button>
              Chuyển cấp
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default EnrollmentView;
