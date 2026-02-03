import { Request, Response } from 'express';
import { prisma } from '@/index';
import { AuditService, AuditAction, AuditResource } from '@/services/auditService';
import { cacheService } from '@/services/cacheService';

export class ClassesController {
  // Get all classes
  static async getClasses(req: Request, res: Response) {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        gradeLevel,
        academicYear,
        isActive,
        sortBy = 'name',
        sortOrder = 'asc'
      } = req.query;

      const cacheKey = `classes:${JSON.stringify(req.query)}`;
      
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
          { code: { contains: search, mode: 'insensitive' } }
        ];
      }

      if (gradeLevel) where.gradeLevel = parseInt(gradeLevel as string);
      if (academicYear) where.academicYear = academicYear;
      if (isActive !== undefined) where.isActive = isActive === 'true';

      const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
      
      const [classes, total] = await Promise.all([
        prisma.class.findMany({
          where,
          include: {
            homeroomTeacher: {
              include: {
                user: {
                  select: { id: true, fullName: true, avatar: true }
                }
              }
            },
            _count: {
              select: {
                students: true
              }
            }
          },
          orderBy: { [sortBy as string]: sortOrder as 'asc' | 'desc' },
          skip,
          take: parseInt(limit as string)
        }),
        prisma.class.count({ where })
      ]);

      const result = {
        data: classes.map(cls => ({
          ...cls,
          studentCount: cls._count.students
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
      console.error('Error getting classes:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve classes'
      });
    }
  }

  // Get class by ID
  static async getClassById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const cacheKey = `class:${id}`;
      
      const cached = await cacheService.get(cacheKey);
      if (cached) {
        return res.json({
          success: true,
          data: cached
        });
      }

      const classData = await prisma.class.findUnique({
        where: { id: parseInt(id) },
        include: {
          homeroomTeacher: {
            include: {
              user: {
                select: { id: true, fullName: true, email: true, avatar: true }
              }
            }
          },
          students: {
            include: {
              user: {
                select: { id: true, fullName: true, email: true, avatar: true }
              }
            }
          },
          schedules: {
            include: {
              subject: {
                select: { id: true, name: true, color: true }
              },
              teacher: {
                include: {
                  user: {
                    select: { id: true, fullName: true, avatar: true }
                  }
                }
              }
            }
          }
        }
      });

      if (!classData) {
        return res.status(404).json({
          success: false,
          error: 'Class not found'
        });
      }

      await cacheService.set(cacheKey, classData, { ttl: 600 });

      res.json({
        success: true,
        data: classData
      });
    } catch (error) {
      console.error('Error getting class by ID:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve class'
      });
    }
  }

  // Create new class
  static async createClass(req: Request, res: Response) {
    try {
      const {
        code,
        name,
        gradeLevel,
        academicYear,
        homeroomTeacherId,
        room,
        isActive = true
      } = req.body;

      // Check if class code already exists
      const existingClass = await prisma.class.findFirst({
        where: { code }
      });

      if (existingClass) {
        return res.status(400).json({
          success: false,
          error: 'Class code already exists'
        });
      }

      const classData = await prisma.class.create({
        data: {
          code,
          name,
          gradeLevel: parseInt(gradeLevel),
          academicYear,
          homeroomTeacherId: homeroomTeacherId ? parseInt(homeroomTeacherId) : undefined,
          room,
          isActive
        },
        include: {
          homeroomTeacher: {
            include: {
              user: {
                select: { id: true, fullName: true, email: true, avatar: true }
              }
            }
          }
        }
      });

      await cacheService.invalidateClassCache(classData.id);

      await auditService.logUserAction(
        req.user?.id,
        req.user?.role,
        AuditAction.CREATE,
        AuditResource.CLASS,
        classData.id,
        { code, name, gradeLevel }
      );

      res.status(201).json({
        success: true,
        data: classData
      });
    } catch (error) {
      console.error('Error creating class:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create class'
      });
    }
  }

  // Update class
  static async updateClass(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const {
        name,
        gradeLevel,
        academicYear,
        homeroomTeacherId,
        room,
        isActive
      } = req.body;

      const existingClass = await prisma.class.findUnique({
        where: { id: parseInt(id) }
      });

      if (!existingClass) {
        return res.status(404).json({
          success: false,
          error: 'Class not found'
        });
      }

      const updateData: any = {};
      if (name) updateData.name = name;
      if (gradeLevel) updateData.gradeLevel = parseInt(gradeLevel);
      if (academicYear) updateData.academicYear = academicYear;
      if (homeroomTeacherId !== undefined) updateData.homeroomTeacherId = homeroomTeacherId ? parseInt(homeroomTeacherId) : null;
      if (room) updateData.room = room;
      if (isActive !== undefined) updateData.isActive = isActive;

      const classData = await prisma.class.update({
        where: { id: parseInt(id) },
        data: updateData,
        include: {
          homeroomTeacher: {
            include: {
              user: {
                select: { id: true, fullName: true, email: true, avatar: true }
              }
            }
          }
        }
      });

      await cacheService.invalidateClassCache(parseInt(id));
      await cacheService.del(`class:${id}`);

      await auditService.logUserAction(
        req.user?.id,
        req.user?.role,
        AuditAction.UPDATE,
        AuditResource.CLASS,
        parseInt(id),
        updateData
      );

      res.json({
        success: true,
        data: classData
      });
    } catch (error) {
      console.error('Error updating class:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update class'
      });
    }
  }

  // Delete class
  static async deleteClass(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const existingClass = await prisma.class.findUnique({
        where: { id: parseInt(id) }
      });

      if (!existingClass) {
        return res.status(404).json({
          success: false,
          error: 'Class not found'
        });
      }

      // Check if class has students
      const studentCount = await prisma.student.count({
        where: { classId: parseInt(id) }
      });

      if (studentCount > 0) {
        return res.status(400).json({
          success: false,
          error: 'Cannot delete class with enrolled students'
        });
      }

      await prisma.class.delete({
        where: { id: parseInt(id) }
      });

      await cacheService.invalidateClassCache(parseInt(id));

      await auditService.logUserAction(
        req.user?.id,
        req.user?.role,
        AuditAction.DELETE,
        AuditResource.CLASS,
        parseInt(id)
      );

      res.json({
        success: true,
        message: 'Class deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting class:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete class'
      });
    }
  }

  // Get class statistics
  static async getClassStatistics(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const [classData, studentStats, gradeStats, attendanceStats] = await Promise.all([
        prisma.class.findUnique({
          where: { id: parseInt(id) },
          include: {
            homeroomTeacher: {
              include: {
                user: {
                  select: { id: true, fullName: true, avatar: true }
                }
              }
            }
          }
        }),
        prisma.student.count({
          where: { classId: parseInt(id) }
        }),
        prisma.$queryRaw`
          SELECT 
            AVG(g.score) as averageGrade,
            COUNT(g.id) as totalGrades,
            COUNT(CASE WHEN g.score >= 5 THEN 1 END) as passingGrades
          FROM grades g
          JOIN students s ON g.studentId = s.id
          WHERE s.classId = ${parseInt(id)}
        `,
        prisma.$queryRaw`
          SELECT 
            COUNT(*) as totalAttendance,
            COUNT(CASE WHEN status = 'PRESENT' THEN 1 END) as presentDays,
            COUNT(CASE WHEN status = 'ABSENT' THEN 1 END) as absentDays,
            COUNT(CASE WHEN status = 'LATE' THEN 1 END) as lateDays
          FROM attendance a
          JOIN students s ON a.studentId = s.id
          WHERE s.classId = ${parseInt(id)}
        `
      ]);

      if (!classData) {
        return res.status(404).json({
          success: false,
          error: 'Class not found'
        });
      }

      const statistics = {
        studentCount: studentStats,
        averageGrade: gradeStats[0]?.averageGrade ? parseFloat(gradeStats[0].averageGrade) : 0,
        totalGrades: gradeStats[0]?.totalGrades || 0,
        passingRate: gradeStats[0]?.totalGrades > 0 
          ? (gradeStats[0].passingGrades / gradeStats[0].totalGrades) * 100 
          : 0,
        attendance: {
          total: attendanceStats[0]?.totalAttendance || 0,
          present: attendanceStats[0]?.presentDays || 0,
          absent: attendanceStats[0]?.absentDays || 0,
          late: attendanceStats[0]?.lateDays || 0,
          attendanceRate: attendanceStats[0]?.totalAttendance > 0 
            ? (attendanceStats[0].presentDays / attendanceStats[0].totalAttendance) * 100 
            : 0
        }
      };

      res.json({
        success: true,
        data: {
          class: classData,
          statistics
        }
      });
    } catch (error) {
      console.error('Error getting class statistics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get class statistics'
      });
    }
  }

  // Get classes by grade level
  static async getClassesByGradeLevel(req: Request, res: Response) {
    try {
      const { gradeLevel } = req.params;

      const classes = await prisma.class.findMany({
        where: { 
          gradeLevel: parseInt(gradeLevel),
          isActive: true
        },
        include: {
          homeroomTeacher: {
            include: {
              user: {
                select: { id: true, fullName: true, avatar: true }
              }
            }
          },
          _count: {
            select: {
              students: true
            }
          }
        },
        orderBy: { name: 'asc' }
      });

      const result = classes.map(cls => ({
        ...cls,
        studentCount: cls._count.students
      }));

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error getting classes by grade level:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get classes by grade level'
      });
    }
  }

  // Get classes by academic year
  static async getClassesByAcademicYear(req: Request, res: Response) {
    try {
      const { academicYear } = req.params;

      const classes = await prisma.class.findMany({
        where: { 
          academicYear,
          isActive: true
        },
        include: {
          homeroomTeacher: {
            include: {
              user: {
                select: { id: true, fullName: true, avatar: true }
              }
            }
          },
          _count: {
            select: {
              students: true
            }
          }
        },
        orderBy: { gradeLevel: 'asc', name: 'asc' }
      });

      const result = classes.map(cls => ({
        ...cls,
        studentCount: cls._count.students
      }));

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error getting classes by academic year:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get classes by academic year'
      });
    }
  }

  // Get available homeroom teachers
  static async getAvailableHomeroomTeachers(req: Request, res: Response) {
    try {
      const teachers = await prisma.teacher.findMany({
        where: { isActive: true },
        include: {
          user: {
            select: { id: true, fullName: true, email: true, avatar: true }
          },
          classes: {
            select: { id: true, name: true }
          }
        }
      });

      const availableTeachers = teachers.filter(teacher => 
        !teacher.classes || teacher.classes.length === 0
      );

      res.json({
        success: true,
        data: availableTeachers
      });
    } catch (error) {
      console.error('Error getting available homeroom teachers:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get available homeroom teachers'
      });
    }
  }

  // Transfer students between classes
  static async transferStudents(req: Request, res: Response) {
    try {
      const { fromClassId, toClassId, studentIds } = req.body;

      if (!fromClassId || !toClassId || !Array.isArray(studentIds) || studentIds.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'From class ID, to class ID, and student IDs array are required'
        });
      }

      // Verify both classes exist
      const [fromClass, toClass] = await Promise.all([
        prisma.class.findUnique({
          where: { id: parseInt(fromClassId) }
        }),
        prisma.class.findUnique({
          where: { id: parseInt(toClassId) }
        })
      ]);

      if (!fromClass || !toClass) {
        return res.status(404).json({
          success: false,
          error: 'One or both classes not found'
        });
      }

      // Transfer students in a transaction
      const transferredStudents = await prisma.$transaction(async (tx) => {
        return Promise.all(
          studentIds.map((studentId: number) =>
            tx.student.update({
              where: { id: studentId },
              data: { classId: parseInt(toClassId) }
            })
          )
        );
      });

      // Invalidate cache for both classes
      await cacheService.invalidateClassCache(parseInt(fromClassId));
      await cacheService.invalidateClassCache(parseInt(toClassId));

      // Invalidate cache for all transferred students
      for (const studentId of studentIds) {
        await cacheService.invalidateUserCache(studentId);
      }

      await auditService.logUserAction(
        req.user?.id,
        req.user?.role,
        AuditAction.UPDATE,
        AuditResource.CLASS,
        parseInt(toClassId),
        { 
          action: 'transfer_students',
          fromClassId: parseInt(fromClassId),
          studentIds,
          count: transferredStudents.length
        }
      );

      res.json({
        success: true,
        data: {
          transferredCount: transferredStudents.length,
          fromClassId: parseInt(fromClassId),
          toClassId: parseInt(toClassId)
        }
      });
    } catch (error) {
      console.error('Error transferring students:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to transfer students'
      });
    }
  }

  // Get class schedule
  static async getClassSchedule(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { day } = req.query;

      const where: any = { classId: parseInt(id) };
      if (day) where.day = parseInt(day as string);

      const schedule = await prisma.schedule.findMany({
        where,
        include: {
          subject: {
            select: { id: true, name: true, color: true }
          },
          teacher: {
            include: {
              user: {
                select: { id: true, fullName: true, avatar: true }
              }
            }
          }
        },
        orderBy: { period: 'asc' }
      });

      res.json({
        success: true,
        data: schedule
      });
    } catch (error) {
      console.error('Error getting class schedule:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get class schedule'
      });
    }
  }
}

export { ClassesController };
