import { Request, Response } from 'express';
import { prisma } from '@/index';
import { AuditService, AuditAction, AuditResource } from '@/services/auditService';
import { cacheService } from '@/services/cacheService';

export class SubjectsController {
  // Get all subjects
  static async getSubjects(req: Request, res: Response) {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        teacherId,
        isActive,
        sortBy = 'name',
        sortOrder = 'asc'
      } = req.query;

      const cacheKey = `subjects:${JSON.stringify(req.query)}`;
      
      const cached = await cacheService.get(cacheKey);
      if (cached) {
        return res.json({
          success: true,
          data: cached
        });
      }

      const where: any = {};

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { code: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ];
      }

      if (teacherId) where.teacherId = parseInt(teacherId as string);
      if (isActive !== undefined) where.isActive = isActive === 'true';

      const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
      
      const [subjects, total] = await Promise.all([
        prisma.subject.findMany({
          where,
          include: {
            teacher: {
              include: {
                user: {
                  select: {
                    id: true,
                    fullName: true,
                    avatar: true
                  }
                }
              }
            },
            _count: {
              select: {
                grades: true
              }
            }
          },
          orderBy: { [sortBy as string]: sortOrder as 'asc' | 'desc' },
          skip,
          take: parseInt(limit as string)
        }),
        prisma.subject.count({ where })
      ]);

      const result = {
        data: subjects.map(subject => ({
          ...subject,
          totalGrades: subject._count.grades
        })),
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          totalPages: Math.ceil(total / parseInt(limit as string))
        }
      };

      await cacheService.set(cacheKey, result, { ttl: 300 });

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error getting subjects:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve subjects'
      });
    }
  }

  // Get subject by ID
  static async getSubjectById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const cacheKey = `subject:${id}`;
      
      const cached = await cacheService.get(cacheKey);
      if (cached) {
        return res.json({
          success: true,
          data: cached
        });
      }

      const subject = await prisma.subject.findUnique({
        where: { id: parseInt(id) },
        include: {
          teacher: {
            include: {
              user: {
                select: {
                  id: true,
                fullName: true,
                email: true,
                avatar: true
              }
            }
          },
          _count: {
            select: {
              grades: true
            }
          }
        }
      });

      if (!subject) {
        return res.status(404).json({
          success: false,
          error: 'Subject not found'
        });
      }

      const subjectWithStats = {
        ...subject,
        totalGrades: subject._count.grades
      };

      await cacheService.set(cacheKey, subjectWithStats, { ttl: 600 });

      res.json({
        success: true,
        data: subjectWithStats
      });
    } catch (error) {
      console.error('Error getting subject by ID:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve subject'
      });
    }
  }

  // Create new subject
  static async createSubject(req: Request, res: Response) {
    try {
      const {
        code,
        name,
        description,
        teacherId,
        color,
        credits,
        isActive = true
      } = req.body;

      // Check if code already exists
      const existingSubject = await prisma.subject.findFirst({
        where: { code }
      });

      if (existingSubject) {
        return res.status(400).json({
          success: false,
          error: 'Subject code already exists'
        });
      }

      const subject = await prisma.subject.create({
        data: {
          code,
          name,
          description,
          teacherId: teacherId ? parseInt(teacherId) : null,
          color,
          credits: credits ? parseInt(credits) : null,
          isActive
        },
        include: {
          teacher: {
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                  email: true,
                  avatar: true
                }
              }
            }
          }
        }
      });

      if (teacherId) {
        await cacheService.invalidateUserCache(parseInt(teacherId));
      }

      await auditService.logUserAction(
        req.user?.id,
        req.user?.role,
        AuditAction.CREATE,
        AuditResource.SUBJECT,
        subject.id,
        { code, name, teacherId, color, credits }
      );

      res.status(201).json({
        success: true,
        data: subject
      });
    } catch (error) {
      console.error('Error creating subject:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create subject'
      });
    }
  }

  // Update subject
  static async updateSubject(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const {
        name,
        description,
        teacherId,
        color,
        credits,
        isActive
      } = req.body;

      const existingSubject = await prisma.subject.findUnique({
        where: { id: parseInt(id) }
      });

      if (!existingSubject) {
        return res.status(404).json({
          success: false,
          error: 'Subject not found'
        });
      }

      const updateData: any = {};
      if (name) updateData.name = name;
      if (description) updateData.description = description;
      if (color) updateData.color = color;
      if (credits) updateData.credits = parseInt(credits);
      if (isActive !== undefined) updateData.isActive = isActive;

      // Handle teacher reassignment
      const oldTeacherId = existingSubject.teacherId;
      if (teacherId !== undefined) {
        updateData.teacherId = teacherId ? parseInt(teacherId) : null;
      }

      const subject = await prisma.subject.update({
        where: { id: parseInt(id) },
        data: updateData,
        include: {
          teacher: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                avatar: true
              }
            }
          }
        }
      });

      // Invalidate cache
      if (oldTeacherId) {
        await cacheService.invalidateUserCache(oldTeacherId);
      }
      if (teacherId) {
        await cacheService.invalidateUserCache(parseInt(teacherId));
      }
      await cacheService.invalidateSubjectCache(parseInt(id));
      await cacheService.del(`subject:${id}`);

      await auditService.logUserAction(
        req.user?.id,
        req.user?.role,
        AuditAction.UPDATE,
        AuditResource.SUBJECT,
        parseInt(id),
        updateData
      );

      res.json({
        success: true,
        data: subject
      });
    } catch (error) {
      console.error('Error updating subject:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update subject'
      });
    }
  }

  // Delete subject
  static async deleteSubject(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const existingSubject = await prisma.subject.findUnique({
        where: { id: parseInt(id) },
        include: {
          _count: {
            select: {
              grades: true
            }
          }
        }
      });

      if (!existingSubject) {
        return res.status(404).json({
          success: false,
          error: 'Subject not found'
        });
      }

      if (existingSubject._count.grades > 0) {
        return res.status(400).json({
          success: false,
          error: 'Cannot delete subject with existing grades'
        });
      }

      const oldTeacherId = existingSubject.teacherId;

      await prisma.subject.delete({
        where: { id: parseInt(id) }
      });

      if (oldTeacherId) {
        await cacheService.invalidateUserCache(oldTeacherId);
      }
      await cacheService.invalidateSubjectCache(parseInt(id));
      await cacheService.del(`subject:${id}`);

      await auditService.logUserAction(
        req.user?.id,
        req.user?.role,
        AuditAction.DELETE,
        AuditResource.SUBJECT,
        parseInt(id)
      );

      res.json({
        success: true,
        message: 'Subject deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting subject:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete subject'
      });
    }
  }

  // Get subjects by teacher
  static async getSubjectsByTeacher(req: Request, res: Response) {
    try {
      const { teacherId } = req.params;

      const subjects = await prisma.subject.findMany({
        where: { teacherId: parseInt(teacherId) },
        include: {
          teacher: {
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                  email: true,
                  avatar: true
                }
              }
            }
          },
          _count: {
            select: {
              grades: true
            }
          }
        },
        orderBy: { name: 'asc' }
      });

      const subjectsWithStats = subjects.map(subject => ({
        ...subject,
        totalGrades: subject._count.grades
      }));

      res.json({
        success: true,
        data: subjectsWithStats
      });
    } catch (error) {
      console.error('Error getting subjects by teacher:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get subjects by teacher'
      });
    }
  }

  // Get subjects without teacher
  static async getUnassignedSubjects(req: Request, res: Response) {
    try {
      const subjects = await prisma.subject.findMany({
        where: { teacherId: null, isActive: true },
        include: {
          _count: {
            select: {
              grades: true
            }
          }
        },
        orderBy: { name: 'asc' }
      });

      const subjectsWithStats = subjects.map(subject => ({
        ...subject,
        totalGrades: subject._count.grades
      }));

      res.json({
        success: true,
        data: subjectsWithStats
      });
    } catch (error) {
      console.error('Error getting unassigned subjects:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get unassigned subjects'
      });
    }
  }

  // Get subject statistics
  static async getSubjectStatistics(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const [subject, gradeStats] = await Promise.all([
        prisma.subject.findUnique({
          where: { id: parseInt(id) },
          include: {
            teacher: {
              include: {
                user: {
                  select: {
                    id: true,
                    fullName: true,
                    email: true,
                    avatar: true
                  }
                }
              }
            }
          }
        }),
        prisma.$queryRaw`
          SELECT 
            AVG(g.score) as averageGrade,
            COUNT(g.id) as totalGrades,
            COUNT(CASE WHEN g.score >= 5 THEN 1 END) as passingGrades,
            MIN(g.score) as minGrade,
            MAX(g.score) as maxGrade
          FROM grades g
          WHERE g.subjectId = ${parseInt(id)}
        `
      ]);

      if (!subject) {
        return res.status(404).json({
          success: false,
          error: 'Subject not found'
        });
      }

      const statistics = {
        averageGrade: gradeStats[0]?.averageGrade ? parseFloat(gradeStats[0].averageGrade) : 0,
        totalGrades: gradeStats[0]?.totalGrades || 0,
        passingRate: gradeStats[0]?.totalGrades > 0 
          ? (gradeStats[0].passingGrades / gradeStats[0].totalGrades) * 100 
          : 0,
        minGrade: gradeStats[0]?.minGrade ? parseFloat(gradeStats[0]?.minGrade) : 0,
        maxGrade: gradeStats[0]?.maxGrade ? parseFloat(gradeStats[0]?.maxGrade) : 0
      };

      res.json({
        success: true,
        data: {
          subject,
          statistics
        }
      });
    } catch (error) {
      console.error('Error getting subject statistics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get subject statistics'
      });
    }
  }

  // Get subject grades
  static async getSubjectGrades(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const {
        page = 1,
        limit = 20,
        examType,
        semester,
        dateFrom,
        dateTo
      } = req.query;

      const where: any = { subjectId: parseInt(id) };

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
                  select: {
                    id: true,
                    fullName: true,
                    email: true,
                    avatar: true
                  }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: parseInt(limit as string)
        }),
        prisma.grade.count({ where })
      ]);

      const result = {
        data: grades,
        pagination: {
          page: {
            page: parseInt(page as string),
            limit: parseInt(limit as string),
            total,
            totalPages: Math.ceil(total / parseInt(limit as string))
          }
        }
      };

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error getting subject grades:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get subject grades'
      });
    }
  }

  // Get subjects by grade level
  static async getSubjectsByGradeLevel(req: Request, res: Response) {
    try {
      const { gradeLevel } = req.params;

      const classes = await prisma.class.findMany({
        where: { gradeLevel: parseInt(gradeLevel) },
        select: { id: true, name: true }
      });

      const classIds = classes.map(cls => cls.id);

      const subjects = await prisma.subject.findMany({
        where: {
          isActive: true,
          OR: classIds.length > 0 ? {
            classes: {
              some: {
                id: { in: classIds }
              }
            }
          } : {}
        },
        include: {
          teacher: {
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                  email: true,
                  avatar: true
                }
              }
            }
          }
        },
        orderBy: { name: 'asc' }
      });

      res.json({
        success: true,
        data: subjects
      });
    } catch (error) {
      console.error('Error getting subjects by grade level:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get subjects by grade level'
      });
    }
  }

  // Search subjects
  static async searchSubjects(req: Request, res: Response) {
    try {
      const { query, limit = 10 } = req.query;

      if (!query) {
        return res.status(400).json({
          success: false,
          error: 'Search query is required'
        });
      }

      const subjects = await prisma.subject.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { code: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } }
          ],
          isActive: true
        },
        include: {
          teacher: {
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                  email: true,
                  avatar: true
                }
              }
            }
          }
        },
        take: parseInt(limit as string),
        orderBy: { name: 'asc' }
      });

      res.json({
        success: true,
        data: subjects
      });
    } catch (error) {
      console.error('Error searching subjects:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to search subjects'
      });
    }
  }

  // Get subject performance comparison
  static async getSubjectPerformanceComparison(req: Request, res: Response) {
    try {
      const { subjectIds } = req.body;

      if (!Array.isArray(subjectIds) || subjectIds.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Subject IDs array is required'
        });
      }

      const subjectPerformance = await prisma.$queryRaw`
        SELECT 
          s.name as subjectName,
          AVG(g.score) as averageGrade,
          COUNT(g.id) as totalGrades,
          COUNT(CASE WHEN g.score >= 5 THEN 1 END) as passingGrades
        FROM subjects s
        LEFT JOIN grades g ON s.id = g.subjectId
        WHERE s.id IN (${subjectIds.join(',')})
        GROUP BY s.id, s.name
        ORDER BY averageGrade DESC
      `;

      res.json({
        success: true,
        data: subjectPerformance
      });
    } catch (error) {
      console.error('Error getting subject performance comparison:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get subject performance comparison'
      });
    }
  }
}

export { SubjectsController };
