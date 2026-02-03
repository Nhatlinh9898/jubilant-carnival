import express from 'express';
import { GradesController } from '@/controllers/gradesController';
import { authenticate, authorize } from '@/middleware/rbac';
import { Permission } from '@/middleware/rbac';
import { auditMiddleware } from '@/services/auditService';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// GET /api/grades - Get all grades with filtering
router.get('/', 
  authorize([Permission.GRADE_READ]),
  auditMiddleware(AuditAction.READ, AuditResource.GRADE),
  GradesController.getGrades
);

// GET /api/grades/:id - Get grade by ID
router.get('/:id', 
  authorize([Permission.GRADE_READ]),
  auditMiddleware(AuditAction.READ, AuditResource.GRADE),
  GradesController.getGradeById
);

// POST /api/grades - Create new grade
router.post('/', 
  authorize([Permission.GRADE_WRITE]),
  auditMiddleware(AuditAction.CREATE, AuditResource.GRADE),
  GradesController.createGrade
);

// PUT /api/grades/:id - Update grade
router.put('/:id', 
  authorize([Permission.GRADE_WRITE]),
  auditMiddleware(AuditAction.UPDATE, AuditResource.GRADE),
  GradesController.updateGrade
);

// DELETE /api/grades/:id - Delete grade
router.delete('/:id', 
  authorize([Permission.GRADE_DELETE]),
  auditMiddleware(AuditAction.DELETE, AuditResource.GRADE),
  GradesController.deleteGrade
);

// GET /api/grades/student/:id - Get grades by student
router.get('/student/:id', 
  authorize([Permission.GRADE_READ]),
  auditMiddleware(AuditAction.READ, AuditResource.GRADE),
  GradesController.getGradesByStudent
);

// GET /api/grades/subject/:id - Get grades by subject
router.get('/subject/:id', 
  authorize([Permission.GRADE_READ]),
  auditMiddleware(AuditAction.READ, AuditResource.GRADE),
  GradesController.getGradesBySubject
);

// GET /api/grades/statistics - Get grade statistics
router.get('/statistics', 
  authorize([Permission.GRADE_READ]),
  auditMiddleware(AuditAction.READ, AuditResource.GRADE),
  GradesController.getGradeStatistics
);

// POST /api/grades/bulk - Bulk create grades
router.post('/bulk', 
  authorize([Permission.GRADE_WRITE]),
  auditMiddleware(AuditAction.CREATE, AuditResource.GRADE),
  GradesController.bulkCreateGrades
);

export default router;
