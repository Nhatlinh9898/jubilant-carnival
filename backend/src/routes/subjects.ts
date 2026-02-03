import express from 'express';
import { SubjectsController } from '@/controllers/subjectsController';
import { authenticate, authorize } from '@/middleware/rbac';
import { Permission } from '@/middleware/rbac';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// GET /api/subjects - Get all subjects
router.get('/', 
  authorize([Permission.SUBJECT_READ]),
  SubjectsController.getSubjects
);

// GET /api/subjects/:id - Get subject by ID
router.get('/:id', 
  authorize([Permission.SUBJECT_READ]),
  SubjectsController.getSubjectById
);

// POST /api/subjects - Create new subject
router.post('/', 
  authorize([Permission.SUBJECT_WRITE]),
  SubjectsController.createSubject
);

// PUT /api/subjects/:id - Update subject
router.put('/:id', 
  authorize([Permission.SUBJECT_WRITE]),
  SubjectsController.updateSubject
);

// DELETE /api/subjects/:id - Delete subject
router.delete('/:id', 
  authorize([Permission.SUBJECT_DELETE]),
  SubjectsController.deleteSubject
);

// GET /api/subjects/teacher/:teacherId - Get subjects by teacher
router.get('/teacher/:teacherId', 
  authorize([Permission.SUBJECT_READ]),
  SubjectsController.getSubjectsByTeacher
);

// GET /api/subjects/unassigned - Get subjects without teacher
router.get('/unassigned', 
  authorize([Permission.SUBJECT_READ]),
  SubjectsController.getUnassignedSubjects
);

// GET /api/subjects/:id/statistics - Get subject statistics
router.get('/:id/statistics', 
  authorize([Permission.SUBJECT_READ]),
  SubjectsController.getSubjectStatistics
);

// GET /api/subjects/:id/grades - Get subject grades
router.get('/:id/grades', 
  authorize([Permission.SUBJECT_READ]),
  SubjectsController.getSubjectGrades
);

// GET /api/subjects/grade/:gradeLevel - Get subjects by grade level
router.get('/grade/:gradeLevel', 
  authorize([Permission.SUBJECT_READ]),
  SubjectsController.getSubjectsByGradeLevel
);

// GET /api/subjects/search - Search subjects
router.get('/search', 
  authorize([Permission.SUBJECT_READ]),
  SubjectsController.searchSubjects
);

// POST /api/subjects/performance-comparison - Get subject performance comparison
router.post('/performance-comparison', 
  authorize([Permission.SUBJECT_READ]),
  SubjectsController.getSubjectPerformanceComparison
);

export default router;
