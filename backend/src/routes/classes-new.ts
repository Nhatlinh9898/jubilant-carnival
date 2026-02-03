import express from 'express';
import { ClassesController } from '@/controllers/classesController';
import { authenticate, authorize } from '@/middleware/rbac';
import { Permission } from '@/middleware/rbac';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// GET /api/classes - Get all classes
router.get('/', 
  authorize([Permission.CLASS_READ]),
  ClassesController.getClasses
);

// GET /api/classes/:id - Get class by ID
router.get('/:id', 
  authorize([Permission.CLASS_READ]),
  ClassesController.getClassById
);

// POST /api/classes - Create new class
router.post('/', 
  authorize([Permission.CLASS_WRITE]),
  ClassesController.createClass
);

// PUT /api/classes/:id - Update class
router.put('/:id', 
  authorize([Permission.CLASS_WRITE]),
  ClassesController.updateClass
);

// DELETE /api/classes/:id - Delete class
router.delete('/:id', 
  authorize([Permission.CLASS_DELETE]),
  ClassesController.deleteClass
);

// GET /api/classes/:id/statistics - Get class statistics
router.get('/:id/statistics', 
  authorize([Permission.CLASS_READ]),
  ClassesController.getClassStatistics
);

// GET /api/classes/grade/:gradeLevel - Get classes by grade level
router.get('/grade/:gradeLevel', 
  authorize([Permission.CLASS_READ]),
  ClassesController.getClassesByGradeLevel
);

// GET /api/classes/academic/:academicYear - Get classes by academic year
router.get('/academic/:academicYear', 
  authorize([Permission.CLASS_READ]),
  ClassesController.getClassesByAcademicYear
);

// GET /api/classes/homeroom-teachers - Get available homeroom teachers
router.get('/homeroom-teachers', 
  authorize([Permission.CLASS_WRITE]),
  ClassesController.getAvailableHomeroomTeachers
);

// POST /api/classes/transfer - Transfer students between classes
router.post('/transfer', 
  authorize([Permission.CLASS_WRITE]),
  ClassesController.transferStudents
);

// GET /api/classes/:id/schedule - Get class schedule
router.get('/:id/schedule', 
  authorize([Permission.CLASS_READ]),
  ClassesController.getClassSchedule
);

export default router;
