import express from 'express';
import { TeachersController } from '@/controllers/teachersController';
import { authenticate, authorize } from '@/middleware/rbac';
import { Permission } from '@/middleware/rbac';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// GET /api/teachers - Get all teachers
router.get('/', 
  authorize([Permission.TEACHER_READ]),
  TeachersController.getTeachers
);

// GET /api/teachers/:id - Get teacher by ID
router.get('/:id', 
  authorize([Permission.TEACHER_READ]),
  TeachersController.getTeacherById
);

// POST /api/teachers - Create new teacher
router.post('/', 
  authorize([Permission.TEACHER_WRITE]),
  TeachersController.createTeacher
);

// PUT /api/teachers/:id - Update teacher
router.put('/:id', 
  authorize([Permission.TEACHER_WRITE]),
  TeachersController.updateTeacher
);

// DELETE /api/teachers/:id - Delete teacher
router.delete('/:id', 
  authorize([Permission.TEACHER_DELETE]),
  TeachersController.deleteTeacher
);

// GET /api/teachers/:id/statistics - Get teacher statistics
router.get('/:id/statistics', 
  authorize([Permission.TEACHER_READ]),
  TeachersController.getTeacherStatistics
);

// GET /api/teachers/subject/:subjectId - Get teachers by subject
router.get('/subject/:subjectId', 
  authorize([Permission.TEACHER_READ]),
  TeachersController.getTeachersBySubject
);

// GET /api/teachers/available - Get available teachers
router.get('/available', 
  authorize([Permission.TEACHER_READ]),
  TeachersController.getAvailableTeachers
);

// POST /api/teachers/assign-subject - Assign subject to teacher
router.post('/assign-subject', 
  authorize([Permission.TEACHER_WRITE]),
  TeachersController.assignSubject
);

// DELETE /api/subjects/:subjectId/assignment - Remove subject assignment
router.delete('/subjects/:subjectId/assignment', 
  authorize([Permission.TEACHER_WRITE]),
  TeachersController.removeSubjectAssignment
);

// GET /api/teachers/:id/subjects - Get teacher's subjects
router.get('/:id/subjects', 
  authorize([Permission.TEACHER_READ]),
  TeachersController.getTeacherSubjects
);

// GET /api/teachers/:id/classes - Get teacher's classes
router.get('/:id/classes', 
  authorize([Permission.TEACHER_READ]),
  TeachersController.getTeacherClasses
);

export default router;
