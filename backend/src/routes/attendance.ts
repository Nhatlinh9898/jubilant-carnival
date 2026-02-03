import express from 'express';
import { AttendanceController } from '@/controllers/attendanceController';
import { authenticate, authorize } from '@/middleware/rbac';
import { Permission } from '@/middleware/rbac';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// GET /api/attendance - Get all attendance records
router.get('/', 
  authorize([Permission.ATTENDANCE_READ]),
  AttendanceController.getAttendance
);

// GET /api/attendance/:id - Get attendance by ID
router.get('/:id', 
  authorize([Permission.ATTENDANCE_READ]),
  AttendanceController.getAttendanceById
);

// POST /api/attendance - Create attendance record
router.post('/', 
  authorize([Permission.ATTENDANCE_WRITE]),
  AttendanceController.createAttendance
);

// PUT /api/attendance/:id - Update attendance record
router.put('/:id', 
  authorize([Permission.ATTENDANCE_WRITE]),
  AttendanceController.updateAttendance
);

// DELETE /api/attendance/:id - Delete attendance record
router.delete('/:id', 
  authorize([Permission.ATTENDANCE_WRITE]),
  AttendanceController.deleteAttendance
);

// GET /api/attendance/class/:id - Get class attendance
router.get('/class/:id', 
  authorize([Permission.ATTENDANCE_READ]),
  AttendanceController.getClassAttendance
);

// POST /api/attendance/bulk - Bulk create attendance for class
router.post('/bulk', 
  authorize([Permission.ATTENDANCE_WRITE]),
  AttendanceController.bulkCreateClassAttendance
);

// GET /api/attendance/statistics - Get attendance statistics
router.get('/statistics', 
  authorize([Permission.ATTENDANCE_READ]),
  AttendanceController.getAttendanceStatistics
);

// GET /api/attendance/student/:id/history - Get student attendance history
router.get('/student/:id/history', 
  authorize([Permission.ATTENDANCE_READ]),
  AttendanceController.getStudentAttendanceHistory
);

export default router;
