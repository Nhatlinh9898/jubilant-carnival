import { Request, Response } from 'express';
import { prisma } from '@/index';
import { AuditService, AuditAction, AuditResource } from '@/services/auditService';
import { cacheService } from '@/services/cacheService';

export class TeachersController {
  // Get all teachers
  static async getTeachers(req: Request, res: Response) {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        major,
        isActive,
        sortBy = 'fullName',
        sortOrder = 'asc'
      } = req.query;

      const cacheKey = `teachers:${JSON.stringify(req.query)}`;
      
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
          { user: { fullName: { contains: search, mode: 'insensitive' } } },
          { user: { email: { contains: search, mode: 'insensitive' } } },
          { major: { contains: search, mode: 'insensitive' } }
        ];
      }

      if (major) where.major = { contains: major, mode: 'insensitive' };
      if (isActive !== undefined) where.isActive = isActive === 'true';

      const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
      
      const [teachers, total] = await Promise.all([
        prisma.teacher.findMany({
          where,
          include: {
            user: {
              select: {
                id: true,
                email: true,
                fullName: true,
                avatar: true,
                phone: true,
                address: true
              }
            },
            subjects: {
              select: {
                id: true,
                name: true,
                code: true,
                color: true
              }
            },
            classes: {
              select: {
                id: true,
                name: true,
                code: true
              }
            }
          },
          orderBy: { [sortBy as string]: sortOrder as 'asc' | 'desc' },
          skip,
          take: parseInt(limit as string)
        }),
        prisma.teacher.count({ where })
      ]);

      const result = {
        data: teachers,
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
      console.error('Error getting teachers:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve teachers'
      });
    }
  }

  // Get teacher by ID
  static async getTeacherById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const cacheKey = `teacher:${id}`;
      
      const cached = await cacheService.get(cacheKey);
      if (cached) {
        return res.json({
          success: true,
          data: cached
        });
      }

      const teacher = await prisma.teacher.findUnique({
        where: { id: parseInt(id) },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
              avatar: true,
              phone: true,
              address: true
            }
          },
          subjects: {
            select: {
              id: true,
              name: true,
              code: true,
              color: true,
              credits: true
            }
          },
          classes: {
            select: {
              id: true,
              name: true,
              code: true,
              gradeLevel: true,
              studentCount: true
            }
          }
        }
      });

      if (!teacher) {
        return res.status(404).json({
          success: false,
          error: 'Teacher not found'
        });
      }

      await cacheService.set(cacheKey, teacher, { ttl: 600 });

      res.json({
        success: true,
        data: teacher
      });
    } catch (error) {
      console.error('Error getting teacher by ID:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve teacher'
      });
    }
  }

  // Create new teacher
  static async createTeacher(req: Request, res: Response) {
    try {
      const {
        fullName,
        email,
        password,
        major,
        salary,
        phone,
        address
      } = req.body;

      // Check if email already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'Email already exists'
        });
      }

      // Create user first
      const user = await prisma.user.create({
        data: {
          email,
          password,
          fullName,
          role: 'TEACHER',
          phone,
          address
        },
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          avatar: true,
          phone: true,
          address: true
        }
      });

      // Then create teacher
      const teacher = await prisma.teacher.create({
        data: {
          userId: user.id,
          major,
          salary: salary ? parseFloat(salary) : undefined
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
              role: true,
              avatar: true,
              phone: true,
              address: true
            }
          }
        }
      });

      await cacheService.invalidateUserCache(user.id);

      await auditService.logUserAction(
        req.user?.id,
        req.user?.role,
        AuditAction.CREATE,
        AuditResource.TEACHER,
        teacher.id,
        { fullName, major, salary }
      );

      res.status(201).json({
        success: true,
        data: teacher
      });
    } catch (error) {
      console.error('Error creating teacher:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create teacher'
      });
    }
  }

  // Update teacher
  static async updateTeacher(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const {
        major,
        salary,
        phone,
        address,
        isActive
      } = req.body;

      const existingTeacher = await prisma.teacher.findUnique({
        where: { id: parseInt(id) },
        include: {
          user: true
        }
      });

      if (!existingTeacher) {
        return res.status(404).json({
          success: false,
          error: 'Teacher not found'
        });
      }

      // Update teacher
      const updateData: any = {};
      if (major) updateData.major = major;
      if (salary) updateData.salary = parseFloat(salary);
      if (isActive !== undefined) updateData.isActive = isActive;

      const teacher = await prisma.teacher.update({
        where: { id: parseInt(id) },
        data: updateData,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
              role: true,
              avatar: true,
              phone: true,
              address: true
            }
          }
        }
      });

      // Update user if provided
      if (phone || address) {
        const userUpdateData: any = {};
        if (phone) userUpdateData.phone = phone;
        if (address) userUpdateData.address = address;

        await prisma.user.update({
          where: { id: existingTeacher.userId },
          data: userUpdateData
        });
      }

      await cacheService.invalidateUserCache(existingTeacher.userId);
      await cacheService.del(`teacher:${id}`);

      await auditService.logUserAction(
        req.user?.id,
        req.user?.role,
        AuditAction.UPDATE,
        AuditResource.TEACHER,
        parseInt(id),
        updateData
      );

      res.json({
        success: true,
        data: teacher
      });
    } catch (error) {
      console.error('Error updating teacher:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update teacher'
      });
    }
  }

  // Delete teacher
  static async deleteTeacher(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const existingTeacher = await prisma.teacher.findUnique({
        where: { id: parseInt(id) },
        include: {
          user: true,
          subjects: true,
          classes: true
        }
      });

      if (!existingTeacher) {
        return res.status(404).json({
          success: false,
          error: 'Teacher not found'
        });
      }

      // Check if teacher has assigned subjects or classes
      if (existingTeacher.subjects.length > 0 || existingTeacher.classes.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Cannot delete teacher with assigned subjects or classes'
        });
      }

      // Delete teacher and related user
      await prisma.teacher.delete({
        where: { id: parseInt(id) }
      });

      await prisma.user.delete({
        where: { id: existingTeacher.userId }
      });

      await cacheService.invalidateUserCache(existingTeacher.userId);

      await auditService.logUserAction(
        req.user?.id,
        req.user?.role,
        AuditAction.DELETE,
        AuditResource.TEACHER,
        parseInt(id)
      );

      res.json({
        success: true,
        message: 'Teacher deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting teacher:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete teacher'
      });
    }
  }

  // Get teacher statistics
  static async getTeacherStatistics(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const [teacher, subjectStats, classStats, gradeStats] = await Promise.all([
        prisma.teacher.findUnique({
          where: { id: parseInt(id) },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                fullName: true,
                avatar: true
              }
            },
            subjects: {
              select: {
                id: true,
                name: true,
                code: true,
                _count: {
                  select: {
                    grades: true
                  }
                }
              }
            },
            classes: {
              select: {
                id: true,
                name: true,
                code: true,
                _count: {
                  select: {
                    students: true
                  }
                }
              }
            }
          }
        }),
        prisma.$queryRaw`
          SELECT 
            COUNT(*) as totalSubjects,
            SUM(_count.grades) as totalGrades
          FROM subjects s
          LEFT JOIN grades g ON s.id = g.subjectId
          WHERE s.teacherId = ${parseInt(id)}
        `,
        prisma.$queryRaw`
          SELECT 
            COUNT(*) as totalClasses,
            SUM(_count.students) as totalStudents
          FROM classes c
          LEFT JOIN students s ON c.id = s.classId
          WHERE c.homeroomTeacherId = ${parseInt(id)}
        `,
        prisma.$queryRaw`
          SELECT 
            AVG(g.score) as averageGrade,
            COUNT(g.id) as totalGrades,
            COUNT(CASE WHEN g.score >= 5 THEN 1 END) as passingGrades
          FROM grades g
          JOIN subjects s ON g.subjectId = s.id
          WHERE s.teacherId = ${parseInt(id)}
        `
      ]);

      if (!teacher) {
        return res.status(404).json({
          success: false,
          error: 'Teacher not found'
        });
      }

      const statistics = {
        subjects: {
          total: subjectStats[0]?.totalSubjects || 0,
          totalGrades: subjectStats[0]?.totalGrades || 0
        },
        classes: {
          total: classStats[0]?.totalClasses || 0,
          totalStudents: classStats[0]?.totalStudents || 0
        },
        grades: {
          averageGrade: gradeStats[0]?.averageGrade ? parseFloat(gradeStats[0].averageGrade) : 0,
          totalGrades: gradeStats[0]?.totalGrades || 0,
          passingRate: gradeStats[0]?.totalGrades > 0 
            ? (gradeStats[0].passingGrades / gradeStats[0].totalGrades) * 100 
            : 0
        }
      };

      res.json({
        success: true,
        data: {
          teacher,
          statistics
        }
      });
    } catch (error) {
      console.error('Error getting teacher statistics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get teacher statistics'
      });
    }
  }

  // Get teachers by subject
  static async getTeachersBySubject(req: Request, res: Response) {
    try {
      const { subjectId } = req.params;

      const teachers = await prisma.teacher.findMany({
        where: {
          subjects: {
            some: {
              id: parseInt(subjectId)
            }
          },
          isActive: true
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
              avatar: true,
              phone: true,
              address: true
            }
          },
          subjects: {
            select: {
              id: true,
              name: true,
              code: true,
              color: true
            }
          }
        },
        orderBy: {
          user: { fullName: 'asc' }
        }
      });

      res.json({
        success: true,
        data: teachers
      });
    } catch (error) {
      console.error('Error getting teachers by subject:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get teachers by subject'
      });
    }
  }

  // Get available teachers (not assigned as homeroom)
  static async getAvailableTeachers(req: Request, res: Response) {
    try {
      const teachers = await prisma.teacher.findMany({
        where: {
          isActive: true,
          classes: {
            none: {}
          }
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
              avatar: true,
              phone: true,
              address: true
            }
          },
          subjects: {
            select: {
              id: true,
              name: true,
              code: true,
              color: true
            }
          }
        },
        orderBy: {
          user: { fullName: 'asc' }
        }
      });

      res.json({
        success: true,
        data: teachers
      });
    } catch (error) {
      console.error('Error getting available teachers:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get available teachers'
      });
    }
  }

  // Assign subject to teacher
  static async assignSubject(req: Request, res: Response) {
    try {
      const { teacherId, subjectId } = req.body;

      // Check if teacher exists and is active
      const teacher = await prisma.teacher.findUnique({
        where: { id: parseInt(teacherId), isActive: true }
      });

      if (!teacher) {
        return res.status(404).json({
          success: false,
          error: 'Teacher not found or inactive'
        });
      }

      // Check if subject exists
      const subject = await prisma.subject.findUnique({
        where: { id: parseInt(subjectId) }
      });

      if (!subject) {
        return res.status(404).json({
          success: false,
          error: 'Subject not found'
        });
      }

      // Check if subject is already assigned to another teacher
      const existingAssignment = await prisma.subject.findFirst({
        where: {
          id: parseInt(subjectId),
          teacherId: { not: null }
        }
      });

      if (existingAssignment) {
        return res.status(400).json({
          success: false,
          error: 'Subject is already assigned to another teacher'
        });
      }

      // Assign subject to teacher
      const updatedSubject = await prisma.subject.update({
        where: { id: parseInt(subjectId) },
        data: { teacherId: parseInt(teacherId) }
      });

      await cacheService.invalidateUserCache(teacher.userId);
      await cacheService.invalidateSubjectCache(parseInt(subjectId));

      await auditService.logUserAction(
        req.user?.id,
        req.user?.role,
        AuditAction.UPDATE,
        AuditResource.SUBJECT,
        parseInt(subjectId),
        { teacherId: parseInt(teacherId) }
      );

      res.json({
        success: true,
        data: updatedSubject
      });
    } catch (error) {
      console.error('Error assigning subject to teacher:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to assign subject to teacher'
      });
    }
  }

  // Remove subject assignment
  static async removeSubjectAssignment(req: Request, res: Response) {
    try {
      const { subjectId } = req.params;

      const subject = await prisma.subject.findUnique({
        where: { id: parseInt(subjectId) }
      });

      if (!subject) {
        return res.status(404).json({
          success: false,
          error: 'Subject not found'
        });
      }

      const oldTeacherId = subject.teacherId;

      // Remove teacher assignment
      const updatedSubject = await prisma.subject.update({
        where: { id: parseInt(subjectId) },
        data: { teacherId: null }
      });

      if (oldTeacherId) {
        await cacheService.invalidateUserCache(oldTeacherId);
      }
      
      await cacheService.invalidateSubjectCache(parseInt(subjectId));

      await auditService.logUserAction(
        req.user?.id,
        req.user?.role,
        AuditAction.UPDATE,
        AuditResource.SUBJECT,
        parseInt(subjectId),
        { oldTeacherId, newTeacherId: null }
      );

      res.json({
        success: true,
        data: updatedSubject
      });
    } catch (error) {
      console.error('Error removing subject assignment:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to remove subject assignment'
      });
    }
  }

  // Get teacher's subjects
  static async getTeacherSubjects(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const teacher = await prisma.teacher.findUnique({
        where: { id: parseInt(id) },
        include: {
          subjects: {
            select: {
              id: true,
              name: true,
              code: true,
              color: true,
              credits: true,
              _count: {
                select: {
                  grades: true
                }
              }
            }
          }
        }
      });

      if (!teacher) {
        return res.status(404).json({
          success: false,
          error: 'Teacher not found'
        });
      }

      // Add statistics to each subject
      const subjectsWithStats = teacher.subjects.map(subject => ({
        ...subject,
        totalGrades: subject._count.grades
      }));

      res.json({
        success: true,
        data: subjectsWithStats
      });
    } catch (error) {
      console.error('Error getting teacher subjects:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get teacher subjects'
      });
    }
  }

  // Get teacher's classes
  static async getTeacherClasses(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const teacher = await prisma.teacher.findUnique({
        where: { id: parseInt(id) },
        include: {
          classes: {
            select: {
              id: true,
              name: true,
              code: true,
              gradeLevel: true,
              studentCount: true
            }
          }
        }
      });

      if (!teacher) {
        return res.status(404).json({
          success: false,
          error: 'Teacher not found'
        });
      }

      res.json({
        success: true,
        data: teacher.classes
      });
    } catch (error) {
      console.error('Error getting teacher classes:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get teacher classes'
      });
    }
  }
}

export { TeachersController };
