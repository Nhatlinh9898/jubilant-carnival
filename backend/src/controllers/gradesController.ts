import { Request, Response } from 'express';
import { prisma } from '@/index';
import { authenticate, authorize, canAccessStudent } from '@/middleware/rbac';
import { Permission } from '@/middleware/rbac';
import { AuditService, AuditAction, AuditResource } from '@/services/auditService';
import { cacheService } from '@/services/cacheService';

export class GradesController {
  // Get all grades with filtering
  static async getGrades(req: Request, res: Response) {
    try {
      const {
        page = 1,
        limit = 20,
        subjectId,
        classId,
        examType,
        semester,
        dateFrom,
        dateTo,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      const cacheKey = `grades:${JSON.stringify(req.query)}`;
      
      // Try to get from cache first
      const cached = await cacheService.get(cacheKey);
      if (cached) {
        return res.json({
          success: true,
          data: cached
        });
      }

      const where: any = {};

      if (subjectId) where.subjectId = parseInt(subjectId as string);
      if (classId) where.student = { classId: parseInt(classId as string) };
      if (examType) where.examType = examType;
      if (semester) where.semester = semester;
      
      if (dateFrom || dateTo) {
        where.createdAt = {};
        if (dateFrom) where.createdAt.gte = new Date(dateFrom as string);
        if (dateTo) where.createdAt.lte = new Date(dateTo as string);
      }

      const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
      
      const [grades, total] = await Promise.all([
        prisma.grade.findMany({
          where,
          include: {
            student: {
              include: {
                user: {
                  select: { id: true, fullName: true, email: true }
                },
                class: {
                  select: { id: true, name: true }
                }
              }
            },
            subject: {
              select: { id: true, name: true, color: true }
            }
          },
          orderBy: { [sortBy as string]: sortOrder as 'asc' | 'desc' },
          skip,
          take: parseInt(limit as string)
        }),
        prisma.grade.count({ where })
      ]);

      const result = {
        data: grades,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          totalPages: Math.ceil(total / parseInt(limit as string))
        }
      };

      // Cache the result
      await cacheService.set(cacheKey, result, { ttl: 300 }); // 5 minutes

      // Log the access
      await auditService.logUserAction(
        req.user?.id,
        req.user?.role,
        AuditAction.READ,
        AuditResource.GRADE,
        undefined,
        { query: req.query }
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error getting grades:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve grades'
      });
    }
  }

  // Get grade by ID
  static async getGradeById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const cacheKey = `grade:${id}`;
      
      const cached = await cacheService.get(cacheKey);
      if (cached) {
        return res.json({
          success: true,
          data: cached
        });
      }

      const grade = await prisma.grade.findUnique({
        where: { id: parseInt(id) },
        include: {
          student: {
            include: {
              user: {
                select: { id: true, fullName: true, email: true }
              },
              class: {
                select: { id: true, name: true }
              }
            }
          },
          subject: {
            select: { id: true, name: true, color: true }
          }
        }
      });

      if (!grade) {
        return res.status(404).json({
          success: false,
          error: 'Grade not found'
        });
      }

      // Cache the result
      await cacheService.set(cacheKey, grade, { ttl: 600 }); // 10 minutes

      await auditService.logUserAction(
        req.user?.id,
        req.user?.role,
        AuditAction.READ,
        AuditResource.GRADE,
        grade.id
      );

      res.json({
        success: true,
        data: grade
      });
    } catch (error) {
      console.error('Error getting grade by ID:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve grade'
      });
    }
  }

  // Create new grade
  static async createGrade(req: Request, res: Response) {
    try {
      const {
        studentId,
        subjectId,
        score,
        maxScore = 100,
        examType = 'QUIZ',
        semester = '1',
        notes
      } = req.body;

      // Validate input
      if (!studentId || !subjectId || score === undefined) {
        return res.status(400).json({
          success: false,
          error: 'Student ID, subject ID, and score are required'
        });
      }

      if (score < 0 || score > maxScore) {
        return res.status(400).json({
          success: false,
          error: `Score must be between 0 and ${maxScore}`
        });
      }

      // Verify teacher has access to this subject
      const subject = await prisma.subject.findFirst({
        where: {
          id: parseInt(subjectId),
          teacherId: req.user?.id
        }
      });

      if (!subject && req.user?.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          error: 'You do not have permission to grade this subject'
        });
      }

      const grade = await prisma.grade.create({
        data: {
          studentId: parseInt(studentId),
          subjectId: parseInt(subjectId),
          score: parseFloat(score),
          maxScore: parseFloat(maxScore),
          examType,
          semester,
          notes
        },
        include: {
          student: {
            include: {
              user: {
                select: { id: true, fullName: true, email: true }
              },
              class: {
                select: { id: true, name: true }
              }
            }
          },
          subject: {
            select: { id: true, name: true, color: true }
          }
        }
      });

      // Invalidate relevant cache
      await cacheService.invalidateUserCache(studentId);
      await cacheService.invalidateSubjectCache(parseInt(subjectId));

      // Send notification to student
      const student = await prisma.student.findUnique({
        where: { id: parseInt(studentId) },
        include: { user: { select: { email: true } } }
      });

      if (student) {
        // Here you would send a notification to the student
        console.log(`Grade created for student ${student.user.email}: ${score}/${maxScore} in ${subject.name}`);
      }

      await auditService.logUserAction(
        req.user?.id,
        req.user?.role,
        AuditAction.CREATE,
        AuditResource.GRADE,
        grade.id,
        { score, maxScore, examType, semester }
      );

      res.status(201).json({
        success: true,
        data: grade
      });
    } catch (error) {
      console.error('Error creating grade:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create grade'
      });
    }
  }

  // Update grade
  static async updateGrade(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { score, maxScore, examType, semester, notes } = req.body;

      const existingGrade = await prisma.grade.findUnique({
        where: { id: parseInt(id) }
      });

      if (!existingGrade) {
        return res.status(404).json({
          success: false,
          error: 'Grade not found'
        });
      }

      // Verify teacher has access to update this grade
      const subject = await prisma.subject.findFirst({
        where: {
          id: existingGrade.subjectId,
          teacherId: req.user?.id
        }
      });

      if (!subject && req.user?.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          error: 'You do not have permission to update this grade'
        });
      }

      const updateData: any = {};
      if (score !== undefined) updateData.score = parseFloat(score);
      if (maxScore !== undefined) updateData.maxScore = parseFloat(maxScore);
      if (examType) updateData.examType = examType;
      if (semester) updateData.semester = semester;
      if (notes !== undefined) updateData.notes = notes;

      const grade = await prisma.grade.update({
        where: { id: parseInt(id) },
        data: updateData,
        include: {
          student: {
            include: {
              user: {
                select: { id: true, fullName: true, email: true }
              },
              class: {
                select: { id: true, name: true }
              }
            }
          },
          subject: {
            select: { id: true, name: true, color: true }
          }
        }
      });

      // Invalidate cache
      await cacheService.invalidateUserCache(grade.studentId);
      await cacheService.invalidateSubjectCache(grade.subjectId);
      await cacheService.del(`grade:${id}`);

      await auditService.logUserAction(
        req.user?.id,
        req.user?.role,
        AuditAction.UPDATE,
        AuditResource.GRADE,
        grade.id,
        updateData
      );

      res.json({
        success: true,
        data: grade
      });
    } catch (error) {
      console.error('Error updating grade:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update grade'
      });
    }
  }

  // Delete grade
  static async deleteGrade(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const existingGrade = await prisma.grade.findUnique({
        where: { id: parseInt(id) }
      });

      if (!existingGrade) {
        return res.status(404).json({
          success: false,
          error: 'Grade not found'
        });
      }

      // Verify teacher has access to delete this grade
      const subject = await prisma.subject.findFirst({
        where: {
          id: existingGrade.subjectId,
          teacherId: req.user?.id
        }
      });

      if (!subject && req.user?.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          error: 'You do not have permission to delete this grade'
        });
      }

      await prisma.grade.delete({
        where: { id: parseInt(id) }
      });

      // Invalidate cache
      await cacheService.invalidateUserCache(existingGrade.studentId);
      await cacheService.invalidateSubjectCache(existingGrade.subjectId);
      await cacheService.del(`grade:${id}`);

      await auditService.logUserAction(
        req.user?.id,
        req.user?.role,
        AuditAction.DELETE,
        AuditResource.GRADE,
        existingGrade.id
      );

      res.json({
        success: true,
        message: 'Grade deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting grade:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete grade'
      });
    }
  }

  // Get grades by student
  static async getGradesByStudent(req: Request, res: Response) {
    try {
      const { studentId } = req.params;
      const { page = 1, limit = 20 } = req.query;

      const cacheKey = `grades:student:${studentId}:${page}:${limit}`;
      
      const cached = await cacheService.get(cacheKey);
      if (cached) {
        return res.json({
          success: true,
          data: cached
        });
      }

      const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

      const [grades, total] = await Promise.all([
        prisma.grade.findMany({
          where: { studentId: parseInt(studentId) },
          include: {
            subject: {
              select: { id: true, name: true, color: true }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: parseInt(limit as string)
        }),
        prisma.grade.count({
          where: { studentId: parseInt(studentId) }
        })
      ]);

      const result = {
        data: grades,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          totalPages: Math.ceil(total / parseInt(limit as string))
        }
      };

      await cacheService.set(cacheKey, result, { ttl: 300 });

      await auditService.logUserAction(
        req.user?.id,
        req.user?.role,
        AuditAction.READ,
        AuditResource.GRADE,
        parseInt(studentId),
        { page, limit }
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error getting grades by student:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve grades by student'
      });
    }
  }

  // Get grades by subject
  static async getGradesBySubject(req: Request, res: Response) {
    try {
      const { subjectId } = req.params;
      const { page = 1, limit = 20 } = req.query;

      const cacheKey = `grades:subject:${subjectId}:${page}:${limit}`;
      
      const cached = await cacheService.get(cacheKey);
      if (cached) {
        return res.json({
          success: true,
          data: cached
        });
      }

      const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

      const [grades, total] = await Promise.all([
        prisma.grade.findMany({
          where: { subjectId: parseInt(subjectId) },
          include: {
            student: {
              include: {
                user: {
                  select: { id: true, fullName: true, email: true }
                },
                class: {
                  select: { id: true, name: true }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: parseInt(limit as string)
        }),
        prisma.grade.count({
          where: { subjectId: parseInt(subjectId) }
        })
      ]);

      // Calculate statistics
      const stats = await prisma.grade.aggregate({
        where: { subjectId: parseInt(subjectId) },
        _avg: {
          score: true
        },
        _min: {
          score: true
        },
        _max: {
          score: true
        },
        _count: true
      });

      const result = {
        data: grades,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          totalPages: Math.ceil(total / parseInt(limit as string))
        },
        statistics: {
          average: stats._avg.score,
          minimum: stats._min.score,
          maximum: stats._max.score,
          count: stats._count
        }
      };

      await cacheService.set(cacheKey, result, { ttl: 300 });

      await auditService.logUserAction(
        req.user?.id,
        req.user?.role,
        AuditAction.READ,
        AuditResource.GRADE,
        parseInt(subjectId),
        { page, limit }
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error getting grades by subject:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve grades by subject'
      });
    }
  }

  // Get grade statistics
  static async getGradeStatistics(req: Request, res: Response) {
    try {
      const { classId, subjectId, dateFrom, dateTo } = req.query;

      const where: any = {};

      if (classId) where.student = { classId: parseInt(classId as string) };
      if (subjectId) where.subjectId = parseInt(subjectId as string);
      
      if (dateFrom || dateTo) {
        where.createdAt = {};
        if (dateFrom) where.createdAt.gte = new Date(dateFrom as string);
        if (dateTo) where.createdAt.lte = new Date(dateTo as string);
      }

      const [
        totalGrades,
        averageScore,
        gradeDistribution,
        subjectPerformance
      ] = await Promise.all([
        prisma.grade.count({ where }),
        prisma.grade.aggregate({
          where,
          _avg: { score: true }
        }),
        prisma.$queryRaw`
          SELECT 
            CASE 
              WHEN score >= 9 THEN '9.0-10.0'
              WHEN score >= 8 THEN '8.0-8.9'
              WHEN score >= 7 THEN '7.0-7.9'
              WHEN score >= 6 THEN '6.0-6.9'
              ELSE 'Dưới 6.0'
            END as range,
            COUNT(*) as count
          FROM grades 
          ${Object.keys(where).length > 0 ? 'WHERE ' + Object.entries(where).map(([key, value]) => `${key} = ${JSON.stringify(value)}`).join(' AND ') : ''}
          GROUP BY range
        `,
        prisma.$queryRaw`
          SELECT 
            s.name as subject,
            AVG(g.score) as average,
            COUNT(g.id) as count
          FROM grades g
          JOIN subjects s ON g.subjectId = s.id
          ${Object.keys(where).length > 0 ? 'WHERE ' + Object.entries(where).map(([key, value]) => `${key} = ${JSON.stringify(value)}`).join(' AND ') : ''}
          GROUP BY s.id, s.name
        `
      ]);

      return res.json({
        success: true,
        data: {
          totalGrades,
          averageScore: averageScore._avg.score,
          gradeDistribution,
          subjectPerformance
        }
      });
    } catch (error) {
      console.error('Error getting grade statistics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get grade statistics'
      });
    }
  }

  // Bulk create grades
  static async bulkCreateGrades(req: Request, res: Response) {
    try {
      const { grades } = req.body;

      if (!Array.isArray(grades) || grades.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Grades array is required'
        });
      }

      // Validate all grades
      for (const gradeData of grades) {
        if (!gradeData.studentId || !gradeData.subjectId || gradeData.score === undefined) {
          return res.status(400).json({
            success: false,
            error: 'Each grade must have studentId, subjectId, and score'
          });
        }

        if (gradeData.score < 0 || gradeData.score > (gradeData.maxScore || 100)) {
          return res.status(400).json({
            success: false,
            error: `Invalid score for student ${gradeData.studentId}: ${gradeData.score}`
          });
        }
      }

      // Verify permissions for all grades
      if (req.user?.role !== 'ADMIN') {
        for (const gradeData of grades) {
          const subject = await prisma.subject.findFirst({
            where: {
              id: gradeData.subjectId,
              teacherId: req.user?.id
            }
          });

          if (!subject) {
            return res.status(403).json({
              success: false,
              error: `No permission to grade subject ${gradeData.subjectId}`
            });
          }
        }
      }

      // Create all grades in a transaction
      const createdGrades = await prisma.$transaction(async (tx) => {
        return Promise.all(
          grades.map(gradeData =>
            tx.grade.create({
              data: {
                studentId: gradeData.studentId,
                subjectId: gradeData.subjectId,
                score: parseFloat(gradeData.score),
                maxScore: gradeData.maxScore || 100,
                examType: gradeData.examType || 'QUIZ',
                semester: gradeData.semester || '1',
                notes: gradeData.notes
              }
            })
          )
        );
      });

      // Invalidate cache for all affected students and subjects
      const studentIds = [...new Set(grades.map(g => g.studentId))];
      const subjectIds = [...new Set(grades.map(g => g.subjectId))];
      
      for (const studentId of studentIds) {
        await cacheService.invalidateUserCache(studentId);
      }
      
      for (const subjectId of subjectIds) {
        await cacheService.invalidateSubjectCache(subjectId);
      }

      await auditService.logUserAction(
        req.user?.id,
        req.user?.role,
        AuditAction.CREATE,
        AuditResource.GRADE,
        undefined,
        { count: createdGrades.length }
      );

      res.status(201).json({
        success: true,
        data: createdGrades
      });
    } catch (error) {
      console.error('Error bulk creating grades:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to bulk create grades'
      });
    }
  }
}

export { GradesController };
