import React, { useState, useEffect } from 'react';
import { Plus, Calendar as CalendarIcon, Filter, Search, X, MoreVertical, Clock, MapPin, Users, Tag } from 'lucide-react';
import { api } from './data';
import { SchoolEvent } from './types';
import { Button, Input, Select, Modal, Textarea } from './components';
import { format, parseISO, isToday, isTomorrow, isThisWeek, isThisMonth } from 'date-fns';
import { vi } from 'date-fns/locale';

const EventsView = () => {
  const [events, setEvents] = useState<SchoolEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<SchoolEvent[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [eventType, setEventType] = useState<string>('ALL');
  const [timeFilter, setTimeFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  
  // New event form state
  const [newEvent, setNewEvent] = useState<Partial<SchoolEvent>>({
    title: '',
    description: '',
    type: 'ACTIVITY',
    date: new Date().toISOString(),
    location: '',
    participants: []
  });

  useEffect(() => {
    api.getEvents().then(data => {
      setEvents(data);
      setFilteredEvents(data);
    });
  }, []);

  useEffect(() => {
    filterEvents();
  }, [searchTerm, eventType, timeFilter, events]);

  const filterEvents = () => {
    let result = [...events];
    
    // Apply search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(event => 
        event.title.toLowerCase().includes(term) || 
        event.description.toLowerCase().includes(term) ||
        event.location?.toLowerCase().includes(term)
      );
    }
    
    // Apply event type filter
    if (eventType !== 'ALL') {
      result = result.filter(event => event.type === eventType);
    }
    
    // Apply time filter
    if (timeFilter !== 'ALL') {
      const now = new Date();
      result = result.filter(event => {
        const eventDate = new Date(event.date);
        switch(timeFilter) {
          case 'TODAY': return isToday(eventDate);
          case 'TOMORROW': return isTomorrow(eventDate);
          case 'THIS_WEEK': return isThisWeek(eventDate);
          case 'THIS_MONTH': return isThisMonth(eventDate);
          case 'PAST': return eventDate < now;
          case 'UPCOMING': return eventDate > now;
          default: return true;
        }
      });
    }
    
    setFilteredEvents(result);
  };
  
  const handleCreateEvent = async () => {
    if (!newEvent.title || !newEvent.date) return;
    
    try {
      const createdEvent = await api.createEvent({
        ...newEvent,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as SchoolEvent);
      
      setEvents([...events, createdEvent]);
      setIsModalOpen(false);
      // Reset form
      setNewEvent({
        title: '',
        description: '',
        type: 'ACTIVITY',
        date: new Date().toISOString(),
        location: '',
        participants: []
      });
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };
  
  const deleteEvent = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sự kiện này?')) {
      try {
        await api.deleteEvent(id);
        setEvents(events.filter(event => event.id !== id));
      } catch (error) {
        console.error('Error deleting event:', error);
      }
    }
  };

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'HOLIDAY': return 'bg-red-100 text-red-700 border-red-200';
      case 'ACADEMIC': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'ACTIVITY': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getTypeLabel = (type: string) => {
    switch(type) {
      case 'HOLIDAY': return 'Ngày Lễ';
      case 'ACADEMIC': return 'Học Tập';
      case 'ACTIVITY': return 'Hoạt Động';
      default: return 'Khác';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Sự Kiện & Lịch Hoạt Động</h2>
          <p className="text-gray-500">Quản lý các sự kiện và hoạt động của nhà trường</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setViewMode(viewMode === 'list' ? 'calendar' : 'list')}>
            {viewMode === 'list' ? (
              <>
                <CalendarIcon className="mr-2 h-4 w-4" />
                Xem Lịch
              </>
            ) : (
              <>
                <List className="mr-2 h-4 w-4" />
                Xem Danh Sách
              </>
            )}
          </Button>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Thêm Sự Kiện
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm sự kiện..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select
            value={eventType}
            onValueChange={setEventType}
          >
            <Select.Trigger className="w-full">
              <Select.Value placeholder="Tất cả loại sự kiện" />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="ALL">Tất cả loại sự kiện</Select.Item>
              <Select.Item value="ACADEMIC">Học Tập</Select.Item>
              <Select.Item value="ACTIVITY">Hoạt Động</Select.Item>
              <Select.Item value="HOLIDAY">Ngày Lễ</Select.Item>
            </Select.Content>
          </Select>
          <Select
            value={timeFilter}
            onValueChange={setTimeFilter}
          >
            <Select.Trigger className="w-full">
              <Select.Value placeholder="Tất cả thời gian" />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="ALL">Tất cả thời gian</Select.Item>
              <Select.Item value="TODAY">Hôm nay</Select.Item>
              <Select.Item value="TOMORROW">Ngày mai</Select.Item>
              <Select.Item value="THIS_WEEK">Tuần này</Select.Item>
              <Select.Item value="THIS_MONTH">Tháng này</Select.Item>
              <Select.Item value="UPCOMING">Sắp tới</Select.Item>
              <Select.Item value="PAST">Đã qua</Select.Item>
            </Select.Content>
          </Select>
          <Button variant="outline" className="w-full" onClick={() => {
            setSearchTerm('');
            setEventType('ALL');
            setTimeFilter('ALL');
          }}>
            <X className="mr-2 h-4 w-4" />
            Xóa bộ lọc
          </Button>
        </div>
      </div>

      {filteredEvents.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-200">
          <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">Không có sự kiện nào</h3>
          <p className="mt-1 text-sm text-gray-500">Không tìm thấy sự kiện nào phù hợp với bộ lọc hiện tại.</p>
          <div className="mt-6">
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="-ml-1 mr-2 h-4 w-4" />
              Tạo sự kiện mới
            </Button>
          </div>
        </div>
      ) : viewMode === 'list' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredEvents.map(evt => {
            const eventDate = new Date(evt.date);
            const isPast = eventDate < new Date();
            
            return (
              <div key={evt.id} className={`bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all ${
                isPast ? 'opacity-75' : ''
              }`}>
                <div className="flex items-start gap-4">
                  <div className={`flex-shrink-0 w-16 h-16 rounded-lg flex flex-col items-center justify-center border ${
                    isPast ? 'bg-gray-50 border-gray-200' : 'bg-indigo-50 border-indigo-100'
                  }`}>
                    <span className="text-xs font-bold text-gray-500 uppercase">
                      {format(eventDate, 'MMM', { locale: vi })}
                    </span>
                    <span className={`text-2xl font-bold ${
                      isPast ? 'text-gray-800' : 'text-indigo-600'
                    }`}>
                      {eventDate.getDate()}
                    </span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded border ${getTypeColor(evt.type)}`}>
                        {getTypeLabel(evt.type)}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center">
                        <Clock className="mr-1 h-3 w-3" />
                        {format(eventDate, 'HH:mm', { locale: vi })}
                      </span>
                      {evt.location && (
                        <span className="text-xs text-gray-500 flex items-center">
                          <MapPin className="mr-1 h-3 w-3" />
                          {evt.location}
                        </span>
                      )}
                    </div>
                    
                    <h3 className="font-bold text-lg text-gray-800 truncate">{evt.title}</h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{evt.description}</p>
                    
                    <div className="mt-3 flex items-center justify-between">
                      {evt.participants && evt.participants.length > 0 ? (
                        <div className="flex -space-x-2">
                          {evt.participants.slice(0, 3).map((p, i) => (
                            <div key={i} className="h-8 w-8 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-xs font-medium text-indigo-700">
                              {p.name.charAt(0).toUpperCase()}
                            </div>
                          ))}
                          {evt.participants.length > 3 && (
                            <div className="h-8 w-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600">
                              +{evt.participants.length - 3}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-xs text-gray-500 flex items-center">
                          <Users className="mr-1 h-3 w-3" />
                          Chưa có người tham gia
                        </div>
                      )}
                      
                      <div className="relative group">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Tùy chọn</span>
                        </Button>
                        <div className="absolute right-0 mt-1 w-40 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block border border-gray-100">
                          <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            Chỉnh sửa
                          </button>
                          <button 
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                            onClick={() => deleteEvent(evt.id)}
                          >
                            Xóa
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">
              {format(new Date(), 'MMMM yyyy', { locale: vi })}
            </h3>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                Hôm nay
              </Button>
              <Button variant="ghost" size="sm">
                &lt;
              </Button>
              <Button variant="ghost" size="sm">
                &gt;
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 31 }).map((_, i) => {
              const day = i + 1;
              const dayEvents = filteredEvents.filter(evt => new Date(evt.date).getDate() === day);
              const isToday = day === new Date().getDate() && new Date().getMonth() === 0; // Assuming January for demo
              
              return (
                <div 
                  key={day}
                  className={`min-h-24 p-1 border rounded-md ${
                    isToday ? 'bg-indigo-50 border-indigo-200' : 'border-gray-100'
                  }`}
                >
                  <div className={`text-right text-sm ${
                    isToday ? 'font-bold text-indigo-700' : 'text-gray-700'
                  }`}>
                    {day}
                  </div>
                  <div className="space-y-1 mt-1">
                    {dayEvents.slice(0, 2).map(evt => (
                      <div 
                        key={evt.id} 
                        className={`text-xs p-1 rounded truncate ${
                          evt.type === 'HOLIDAY' ? 'bg-red-100 text-red-800' :
                          evt.type === 'ACADEMIC' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}
                      >
                        {evt.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-gray-500 text-center">
                        +{dayEvents.length - 2} sự kiện
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Create Event Modal */}
      <Modal open={isModalOpen} onOpenChange={setIsModalOpen}>
        <Modal.Content>
          <Modal.Header>
            <Modal.Title>Tạo sự kiện mới</Modal.Title>
            <Modal.Description>
              Thêm sự kiện mới vào lịch hoạt động của nhà trường
            </Modal.Description>
          </Modal.Header>
          
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tiêu đề <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Nhập tiêu đề sự kiện"
                value={newEvent.title}
                onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày và giờ <span className="text-red-500">*</span>
                </label>
                <Input
                  type="datetime-local"
                  value={newEvent.date ? format(new Date(newEvent.date), "yyyy-MM-dd'T'HH:mm") : ''}
                  onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Loại sự kiện
                </label>
                <Select
                  value={newEvent.type}
                  onValueChange={(value) => setNewEvent({...newEvent, type: value as any})}
                >
                  <Select.Trigger>
                    <Select.Value placeholder="Chọn loại sự kiện" />
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Item value="ACTIVITY">Hoạt Động</Select.Item>
                    <Select.Item value="ACADEMIC">Học Tập</Select.Item>
                    <Select.Item value="HOLIDAY">Ngày Lễ</Select.Item>
                  </Select.Content>
                </Select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Địa điểm
              </label>
              <Input
                placeholder="Nhập địa điểm tổ chức"
                value={newEvent.location || ''}
                onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mô tả
              </label>
              <Textarea
                placeholder="Nhập mô tả chi tiết về sự kiện"
                rows={4}
                value={newEvent.description || ''}
                onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Người tham gia
              </label>
              <Select>
                <Select.Trigger>
                  <Select.Value placeholder="Thêm người tham gia" />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="all">Tất cả giáo viên</Select.Item>
                  <Select.Item value="students">Tất cả học sinh</Select.Item>
                  <Select.Item value="specific">Chọn cụ thể...</Select.Item>
                </Select.Content>
              </Select>
            </div>
          </div>
          
          <Modal.Footer>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleCreateEvent}>
              Tạo sự kiện
            </Button>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
  );
};

// Add List icon import at the top with other imports
const List = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="8" x2="21" y1="6" y2="6" />
    <line x1="8" x2="21" y1="12" y2="12" />
    <line x1="8" x2="21" y1="18" y2="18" />
    <line x1="3" x2="3.01" y1="6" y2="6" />
    <line x1="3" x2="3.01" y1="12" y2="12" />
    <line x1="3" x2="3.01" y1="18" y2="18" />
  </svg>
);

export default EventsView;