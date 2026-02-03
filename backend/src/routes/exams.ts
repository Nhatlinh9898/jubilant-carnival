import express from 'express';
import { GradesController } from '@/controllers/gradesController';
import { authenticate, authorize } from '@/middleware/rbac';
import { Permission } from '@/middleware/rbac';
import { auditMiddleware } from '@/services/auditService';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// GET /api/exams - Get all exams
router.get('/', 
  authorize([Permission(Permission.EXAM_READ]),
  auditMiddleware('READ', 'EXAM'),
  GradesController.getExams
);

// GET /api/exams/:id - Get exam by ID
router.get('/:id', 
  authorize([Permission(Permission.EXAM_READ]),
  auditMiddleware('READ', 'EXAM'),
  GradesController.getExamById
);

// POST /api/exams - Create new exam
router.post('/', 
  authorize([Permission(Permission.EXAM_WRITE]),
  auditMiddleware('CREATE', 'EXAM'),
  GradesController.createExam
);

// PUT /api/exams/:id - Update exam
router.put('/:id', 
  authorize([Permission(Permission.EXAM_WRITE]),
  auditMiddleware('UPDATE', 'EXAM'),
  GradesController.updateExam
);

// DELETE /api/exams/:id - Delete exam
router.delete('/:id', 
  authorize([Permission(Permission.EXAM_DELETE]),
  auditMiddleware('DELETE', 'EXAM'),
  GradesController.deleteExam
);

// GET /api/exams/subject/:id - Get exams by subject
router.get('/subject/:id', 
  authorize([Permission.EXAM_READ]),
  auditMiddleware('READ', 'EXAM'),
  GradesController.getExamsBySubject
);

// GET /api/exams/class/:id - Get exams by class
router.get('/class/:id', 
  authorize([Permission.EXAM_READ]),
  auditMiddleware('READ', 'EXAM'),
  GradesController.getExamsByClass
);

// GET /api/exams/student/:id - Get student's exams
router.get('/student/:id', 
  authorize([Permission.EXAM_READ]),
  auditMiddleware('READ', 'EXAM'),
  GradesController.getStudentExams
);

// GET /api/exams/schedule - Get exam schedule
router.get('/schedule', 
  authorize([Permission.EXAM_READ]),
  auditMiddleware('READ', 'EXAM'),
  GradesController.getExamSchedule
);

// GET /api/exams/statistics - Get exam statistics
router.get('/statistics', 
  authorize([Permission.EXAM_READ]),
  auditMiddleware('READ', 'EXAM'),
  GradesController.getExamStatistics
);

// GET /api/exams/performance - Get exam performance comparison
router.post('/performance', 
  authorize([Permission.EXAM_READ]),
  auditMiddleware('READ', 'EXAM'),
  GradesController.getExamPerformanceComparison
);

// POST /api/exams/:id/grade - Grade exam
router.post('/:id/grade', 
  authorize([Permission.EXAM_WRITE]),
  auditMiddleware('UPDATE', 'EXAM'),
  GradesController.gradeExam
);

// GET /api/exams/:id/report - Generate exam report
router.get('/:id/report', 
  authorize([Permission.EXAM_READ]),
  auditMiddleware('READ', 'EXAM'),
  GradesController.generateExamReport
);

export default router;
