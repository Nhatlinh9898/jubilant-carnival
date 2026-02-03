import { Request, Response } from 'express';
import { prisma } from '@/index';
import { AuditService, AuditAction, AuditResource } from '@/services/auditService';
import { cacheService } from '@/services/cacheService';

export class EnrollmentController {
  // Get all enrollments
  static async getEnrollments(req: Request, res: Response) {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        status,
        academicYear,
        gradeLevel,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      const where: any = {};

      if (search) {
        where.OR = [
          { student: { user: { fullName: { contains: search, mode: 'insensitive' } } } },
          { student: { code: { contains: search, mode: 'insensitive' } } },
          { class: { name: { contains: search, mode: 'insensitive' } } },
          { class: { code: { contains: search, mode: 'insensitive' } } }
        ];
      }

      if (status) where.status = status;
      if (academicYear) where.academicYear = academicYear;
      if (gradeLevel) where.class = { gradeLevel: parseInt(gradeLevel as string) };

      const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
      
      const [enrollments, total] = await Promise.all([
        prisma.enrollment.findMany({
          where,
          include: {
            student: {
              include: {
                user: {
                  select: {
                    id: true,
                    fullName: true,
                    email: true,
                    phone: true
                  }
                }
              }
            },
            class: {
              select: {
                id: true,
                name: true,
                code: true,
                gradeLevel: true
              }
            }
          },
          orderBy: { [sortBy as string]: sortOrder as 'asc' | 'desc' },
          skip,
          take: parseInt(limit as string)
        }),
        prisma.enrollment.count({ where })
      ]);

      const result = {
        data: enrollments,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          totalPages: Math.ceil(total / parseInt(limit as string))
        }
      };

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error getting enrollments:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve enrollments'
      });
    }
  }

  // Create new enrollment
  static async createEnrollment(req: Request, res: Response) {
    try {
      const {
        studentId,
        classId,
        academicYear,
        enrollmentDate,
        status = 'PENDING',
        notes
      } = req.body;

      // Check if student exists
      const student = await prisma.student.findUnique({
        where: { id: parseInt(studentId) },
        include: {
          user: {
            select: {
              fullName: true,
              email: true
            }
          }
        }
      });

      if (!student) {
        return res.status(404).json({
          success: false,
          error: 'Student not found'
        });
      }

      // Check if class exists
      const classData = await prisma.class.findUnique({
        where: { id: parseInt(classId) }
      });

      if (!classData) {
        return res.status(404).json({
          success: false,
          error: 'Class not found'
        });
      }

      // Check if student is already enrolled in this class
      const existingEnrollment = await prisma.enrollment.findFirst({
        where: {
          studentId: parseInt(studentId),
          classId: parseInt(classId),
          academicYear,
          status: { in: ['PENDING', 'APPROVED'] }
        }
      });

      if (existingEnrollment) {
        return res.status(400).json({
          success: false,
          error: 'Student is already enrolled in this class'
        });
      }

      // Check class capacity
      const currentEnrollments = await prisma.enrollment.count({
        where: {
          classId: parseInt(classId),
          academicYear,
          status: 'APPROVED'
        }
      });

      if (currentEnrollments >= classData.maxStudents) {
        return res.status(400).json({
          success: false,
          error: 'Class has reached maximum capacity'
        });
      }

      const enrollment = await prisma.enrollment.create({
        data: {
          studentId: parseInt(studentId),
          classId: parseInt(classId),
          academicYear,
          enrollmentDate: new Date(enrollmentDate),
          status,
          notes
        },
        include: {
          student: {
            include: {
              user: {
                select: {
                  fullName: true,
                  email: true
                }
              }
            }
          },
          class: {
            select: {
              name: true,
              code: true,
              gradeLevel: true
            }
          }
        }
      });

      // Update student's current class if approved
      if (status === 'APPROVED') {
        await prisma.student.update({
          where: { id: parseInt(studentId) },
          data: { classId: parseInt(classId) }
        });
      }

      await cacheService.invalidateUserCache(parseInt(studentId));
      await cacheService.invalidateClassCache(parseInt(classId));

      await auditService.logUserAction(
        req.user?.id,
        req.user?.role,
        AuditAction.CREATE,
        AuditResource.ENROLLMENT,
        enrollment.id,
        { studentId, classId, academicYear, status }
      );

      res.status(201).json({
        success: true,
        data: enrollment
      });
    } catch (error) {
      console.error('Error creating enrollment:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create enrollment'
      });
    }
  }

  // Update enrollment status
  static async updateEnrollmentStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;

      const existingEnrollment = await prisma.enrollment.findUnique({
        where: { id: parseInt(id) },
        include: {
          student: true,
          class: true
        }
      });

      if (!existingEnrollment) {
        return res.status(404).json({
          success: false,
          error: 'Enrollment not found'
        });
      }

      // Update enrollment
      const updateData: any = { status };
      if (notes) updateData.notes = notes;

      const enrollment = await prisma.enrollment.update({
        where: { id: parseInt(id) },
        data: updateData,
        include: {
          student: {
            include: {
              user: {
                select: {
                  fullName: true,
                  email: true
                }
              }
            }
          },
          class: {
            select: {
              name: true,
              code: true,
              gradeLevel: true
            }
          }
        }
      });

      // Update student's current class if approved
      if (status === 'APPROVED') {
        await prisma.student.update({
          where: { id: existingEnrollment.studentId },
          data: { classId: existingEnrollment.classId }
        });
      } else if (status === 'REJECTED') {
        // Remove student from class if rejected
        await prisma.student.update({
          where: { id: existingEnrollment.studentId },
          data: { classId: null }
        });
      }

      await cacheService.invalidateUserCache(existingEnrollment.studentId);
      await cacheService.invalidateClassCache(existingEnrollment.classId);

      await auditService.logUserAction(
        req.user?.id,
        req.user?.role,
        AuditAction.UPDATE,
        AuditResource.ENROLLMENT,
        parseInt(id),
        { status, notes }
      );

      res.json({
        success: true,
        data: enrollment
      });
    } catch (error) {
      console.error('Error updating enrollment status:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update enrollment status'
      });
    }
  }

  // Delete enrollment
  static async deleteEnrollment(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const existingEnrollment = await prisma.enrollment.findUnique({
        where: { id: parseInt(id) },
        include: {
          student: true,
          class: true
        }
      });

      if (!existingEnrollment) {
        return res.status(404).json({
          success: false,
          error: 'Enrollment not found'
        });
      }

      // Remove student from class if enrollment was approved
      if (existingEnrollment.status === 'APPROVED') {
        await prisma.student.update({
          where: { id: existingEnrollment.studentId },
          data: { classId: null }
        });
      }

      await prisma.enrollment.delete({
        where: { id: parseInt(id) }
      });

      await cacheService.invalidateUserCache(existingEnrollment.studentId);
      await cacheService.invalidateClassCache(existingEnrollment.classId);

      await auditService.logUserAction(
        req.user?.id,
        req.user?.role,
        AuditAction.DELETE,
        AuditResource.ENROLLMENT,
        parseInt(id)
      );

      res.json({
        success: true,
        message: 'Enrollment deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting enrollment:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete enrollment'
      });
    }
  }

  // Get enrollment statistics
  static async getEnrollmentStatistics(req: Request, res: Response) {
    try {
      const { academicYear, gradeLevel } = req.query;

      const where: any = {};
      if (academicYear) where.academicYear = academicYear;
      if (gradeLevel) where.class = { gradeLevel: parseInt(gradeLevel as string) };

      const [
        totalEnrollments,
        pendingEnrollments,
        approvedEnrollments,
        rejectedEnrollments,
        enrollmentsByGrade,
        enrollmentsByClass
      ] = await Promise.all([
        prisma.enrollment.count({ where }),
        prisma.enrollment.count({ where: { ...where, status: 'PENDING' } }),
        prisma.enrollment.count({ where: { ...where, status: 'APPROVED' } }),
        prisma.enrollment.count({ where: { ...where, status: 'REJECTED' } }),
        prisma.enrollment.groupBy({
          by: ['class'],
          where,
          _count: true,
          include: {
            class: {
              select: {
                gradeLevel: true
              }
            }
          }
        }),
        prisma.enrollment.groupBy({
          by: ['classId'],
          where,
          _count: true,
          include: {
            class: {
              select: {
                name: true,
                code: true
              }
            }
          }
        })
      ]);

      const statistics = {
        overview: {
          total: totalEnrollments,
          pending: pendingEnrollments,
          approved: approvedEnrollments,
          rejected: rejectedEnrollments
        },
        byGrade: enrollmentsByGrade.reduce((acc: any, item: any) => {
          const grade = item.class.gradeLevel;
          acc[grade] = (acc[grade] || 0) + item._count;
          return acc;
        }, {}),
        byClass: enrollmentsByClass.map(item => ({
          classId: item.classId,
          className: item.class.name,
          classCode: item.class.code,
          enrollments: item._count
        }))
      };

      res.json({
        success: true,
        data: statistics
      });
    } catch (error) {
      console.error('Error getting enrollment statistics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve enrollment statistics'
      });
    }
  }

  // Auto-assign students to classes
  static async autoAssignStudents(req: Request, res: Response) {
    try {
      const { gradeLevel, academicYear, maxStudentsPerClass = 30 } = req.body;

      // Get all students without class for this grade level
      const students = await prisma.student.findMany({
        where: {
          classId: null,
          status: 'ACTIVE'
        },
        include: {
          user: {
            select: {
              fullName: true,
              email: true
            }
          }
        },
        orderBy: {
          user: { fullName: 'asc' }
        }
      });

      // Get available classes for this grade level
      const classes = await prisma.class.findMany({
        where: {
          gradeLevel: parseInt(gradeLevel),
          academicYear
        },
        orderBy: { name: 'asc' }
      });

      if (classes.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No classes available for this grade level and academic year'
        });
      }

      const assignments = [];
      let currentClassIndex = 0;
      let currentClassStudents = 0;

      // Create enrollments
      for (const student of students) {
        const currentClass = classes[currentClassIndex];

        // Check if current class is full
        if (currentClassStudents >= maxStudentsPerClass) {
          currentClassIndex++;
          currentClassStudents = 0;

          if (currentClassIndex >= classes.length) {
            // All classes are full, create new class
            const newClass = await prisma.class.create({
              data: {
                code: `${gradeLevel}A${Math.floor(currentClassIndex / classes.length) + 1}`,
                name: `Lớp ${gradeLevel}A${Math.floor(currentClassIndex / classes.length) + 1}`,
                gradeLevel: parseInt(gradeLevel),
                academicYear,
                maxStudents: maxStudentsPerClass
              }
            });
            classes.push(newClass);
          }
        }

        const targetClass = classes[currentClassIndex];

        // Create enrollment
        const enrollment = await prisma.enrollment.create({
          data: {
            studentId: student.id,
            classId: targetClass.id,
            academicYear,
            enrollmentDate: new Date(),
            status: 'APPROVED',
            notes: 'Auto-assigned by system'
          }
        });

        // Update student's class
        await prisma.student.update({
          where: { id: student.id },
          data: { classId: targetClass.id }
        });

        assignments.push({
          studentId: student.id,
          studentName: student.user.fullName,
          classId: targetClass.id,
          className: targetClass.name
        });

        currentClassStudents++;
      }

      await auditService.logUserAction(
        req.user?.id,
        req.user?.role,
        AuditAction.CREATE,
        AuditResource.ENROLLMENT,
        undefined,
        { gradeLevel, academicYear, totalAssigned: assignments.length }
      );

      res.json({
        success: true,
        data: {
          totalAssigned: assignments.length,
          assignments
        }
      });
    } catch (error) {
      console.error('Error auto-assigning students:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to auto-assign students'
      });
    }
  }

  // Promote students to next grade
  static async promoteStudents(req: Request, res: Response) {
    try {
      const { currentGradeLevel, currentAcademicYear, newAcademicYear } = req.body;

      // Get all students in current grade level
      const students = await prisma.student.findMany({
        where: {
          class: {
            gradeLevel: parseInt(currentGradeLevel),
            academicYear: currentAcademicYear
          },
          status: 'ACTIVE'
        },
        include: {
          class: true,
          user: {
            select: {
              fullName: true,
              email: true
            }
          }
        }
      });

      const promotions = [];
      const newGradeLevel = parseInt(currentGradeLevel) + 1;

      for (const student of students) {
        // Find or create class for next grade
        let targetClass = await prisma.class.findFirst({
          where: {
            gradeLevel: newGradeLevel,
            academicYear: newAcademicYear,
            studentCount: { lt: 30 } // Assuming max 30 students per class
          }
        });

        if (!targetClass) {
          // Create new class
          const classCode = `${newGradeLevel}A${Math.floor(Date.now() / 1000)}`;
          targetClass = await prisma.class.create({
            data: {
              code: classCode,
              name: `Lớp ${newGradeLevel}A`,
              gradeLevel: newGradeLevel,
              academicYear: newAcademicYear,
              maxStudents: 30
            }
          });
        }

        // Create enrollment for new grade
        const enrollment = await prisma.enrollment.create({
          data: {
            studentId: student.id,
            classId: targetClass.id,
            academicYear: newAcademicYear,
            enrollmentDate: new Date(),
            status: 'APPROVED',
            notes: `Promoted from grade ${currentGradeLevel}`
          }
        });

        // Update student's class
        await prisma.student.update({
          where: { id: student.id },
          data: { classId: targetClass.id }
        });

        promotions.push({
          studentId: student.id,
          studentName: student.user.fullName,
          oldClass: student.class.name,
          newClass: targetClass.name,
          oldGrade: currentGradeLevel,
          newGrade: newGradeLevel
        });
      }

      await auditService.logUserAction(
        req.user?.id,
        req.user?.role,
        AuditAction.UPDATE,
        AuditResource.ENROLLMENT,
        undefined,
        { 
          currentGradeLevel, 
          currentAcademicYear, 
          newAcademicYear, 
          totalPromoted: promotions.length 
        }
      );

      res.json({
        success: true,
        data: {
          totalPromoted: promotions.length,
          promotions
        }
      });
    } catch (error) {
      console.error('Error promoting students:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to promote students'
      });
    }
  }

  // Get student enrollment history
  static async getStudentEnrollmentHistory(req: Request, res: Response) {
    try {
      const { studentId } = req.params;

      const enrollments = await prisma.enrollment.findMany({
        where: { studentId: parseInt(studentId) },
        include: {
          class: {
            select: {
              name: true,
              code: true,
              gradeLevel: true,
              academicYear: true
            }
          }
        },
        orderBy: { academicYear: 'desc', createdAt: 'desc' }
      });

      res.json({
        success: true,
        data: enrollments
      });
    } catch (error) {
      console.error('Error getting student enrollment history:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve enrollment history'
      });
    }
  }
}

export { EnrollmentController };
