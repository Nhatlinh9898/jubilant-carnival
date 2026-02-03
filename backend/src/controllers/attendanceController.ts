import { Request, Response } from 'express';
import { prisma } from '@/index';
import { AuditService, AuditAction, AuditResource } from '@/services/auditService';
import { cacheService } from '@/services/cacheService';
import { NotificationService } from '@/services/socketService';

export class AttendanceController {
  // Get all attendance records
  static async getAttendance(req: Request, res: Response) {
    try {
      const {
        page = 1,
        limit = 20,
        studentId,
        classId,
        status,
        dateFrom,
        dateTo,
        sortBy = 'date',
        sortOrder = 'desc'
      } = req.query;

      const cacheKey = `attendance:${JSON.stringify(req.query)}`;
      
      const cached = await cacheService.get(cacheKey);
      if (cached) {
        return res.json({
          success: true,
          data: cached
        });
      }

      const where: any = {};

      if (studentId) where.studentId = parseInt(studentId as string);
      if (classId) where.student = { classId: parseInt(classId as string) };
      if (status) where.status = status;
      
      if (dateFrom || dateTo) {
        where.date = {};
        if (dateFrom) where.date.gte = new Date(dateFrom as string);
        if (dateTo) where.date.lte = new Date(dateTo as string);
      }

      const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
      
      const [attendance, total] = await Promise.all([
        prisma.attendance.findMany({
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
            }
          },
          orderBy: { [sortBy as string]: sortOrder as 'asc' | 'desc' },
          skip,
          take: parseInt(limit as string)
        }),
        prisma.attendance.count({ where })
      ]);

      const result = {
        data: attendance,
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
      console.error('Error getting attendance:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve attendance'
      });
    }
  }

  // Get attendance by ID
  static async getAttendanceById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const attendance = await prisma.attendance.findUnique({
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
          }
        }
      });

      if (!attendance) {
        return res.status(404).json({
          success: false,
          error: 'Attendance record not found'
        });
      }

      res.json({
        success: true,
        data: attendance
      });
    } catch (error) {
      console.error('Error getting attendance by ID:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve attendance'
      });
    }
  }

  // Create attendance record
  static async createAttendance(req: Request, res: Response) {
    try {
      const { studentId, date, status = 'PRESENT', notes } = req.body;

      if (!studentId || !date) {
        return res.status(400).json({
          success: false,
          error: 'Student ID and date are required'
        });
      }

      // Check if attendance already exists for this student and date
      const existing = await prisma.attendance.findFirst({
        where: {
          studentId: parseInt(studentId),
          date: new Date(date)
        }
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          error: 'Attendance already recorded for this student on this date'
        });
      }

      const attendance = await prisma.attendance.create({
        data: {
          studentId: parseInt(studentId),
          date: new Date(date),
          status,
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
          }
        }
      });

      // Invalidate cache
      await cacheService.invalidateUserCache(studentId);

      // Send notification if student is absent
      if (status === 'ABSENT') {
        // Here you would send notification to parents
        console.log(`Student ${attendance.student.user.fullName} marked absent on ${date}`);
      }

      res.status(201).json({
        success: true,
        data: attendance
      });
    } catch (error) {
      console.error('Error creating attendance:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create attendance'
      });
    }
  }

  // Update attendance
  static async updateAttendance(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;

      const existing = await prisma.attendance.findUnique({
        where: { id: parseInt(id) }
      });

      if (!existing) {
        return res.status(404).json({
          success: false,
          error: 'Attendance record not found'
        });
      }

      const updateData: any = {};
      if (status) updateData.status = status;
      if (notes !== undefined) updateData.notes = notes;

      const attendance = await prisma.attendance.update({
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
          }
        }
      });

      // Invalidate cache
      await cacheService.invalidateUserCache(existing.studentId);

      res.json({
        success: true,
        data: attendance
      });
    } catch (error) {
      console.error('Error updating attendance:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update attendance'
      });
    }
  }

  // Delete attendance
  static async deleteAttendance(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const existing = await prisma.attendance.findUnique({
        where: { id: parseInt(id) }
      });

      if (!existing) {
        return res.status(404).json({
          success: false,
          error: 'Attendance record not found'
        });
      }

      await prisma.attendance.delete({
        where: { id: parseInt(id) }
      });

      // Invalidate cache
      await cacheService.invalidateUserCache(existing.studentId);

      res.json({
        success: true,
        message: 'Attendance record deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting attendance:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete attendance'
      });
    }
  }

  // Get attendance by class and date
  static async getClassAttendance(req: Request, res: Response) {
    try {
      const { classId } = req.params;
      const { date } = req.query;

      if (!date) {
        return res.status(400).json({
          success: false,
          error: 'Date is required'
        });
      }

      const cacheKey = `attendance:class:${classId}:${date}`;
      
      const cached = await cacheService.get(cacheKey);
      if (cached) {
        return res.json({
          success: true,
          data: cached
        });
      }

      const attendance = await prisma.attendance.findMany({
        where: {
          student: { classId: parseInt(classId) },
          date: new Date(date as string)
        },
        include: {
          student: {
            include: {
              user: {
                select: { id: true, fullName: true, email: true }
              }
            }
          }
        },
        orderBy: {
          student: {
            user: { fullName: 'asc' }
          }
        }
      });

      // Calculate statistics
      const stats = {
        total: attendance.length,
        present: attendance.filter(a => a.status === 'PRESENT').length,
        absent: attendance.filter(a => a.status === 'ABSENT').length,
        late: attendance.filter(a => a.status === 'LATE').length,
        attendanceRate: attendance.length > 0 ? (attendance.filter(a => a.status === 'PRESENT').length / attendance.length) * 100 : 0
      };

      const result = {
        date,
        classId: parseInt(classId),
        statistics: stats,
        attendance
      };

      await cacheService.set(cacheKey, result, { ttl: 600 }); // 10 minutes

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error getting class attendance:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve class attendance'
      });
    }
  }

  // Bulk create attendance for class
  static async bulkCreateClassAttendance(req: Request, res: Response) {
    try {
      const { classId, date, attendance } = req.body;

      if (!classId || !date || !Array.isArray(attendance)) {
        return res.status(400).json({
          success: false,
          error: 'Class ID, date, and attendance array are required'
        });
      }

      // Get all students in the class
      const students = await prisma.student.findMany({
        where: { classId: parseInt(classId) },
        select: { id: true }
      });

      // Create attendance records in a transaction
      const createdAttendance = await prisma.$transaction(async (tx) => {
        return Promise.all(
          attendance.map((record: any) => {
            // Verify student is in the class
            const student = students.find(s => s.id === record.studentId);
            if (!student) {
              throw new Error(`Student ${record.studentId} is not in class ${classId}`);
            }

            return tx.attendance.upsert({
              where: {
                studentId_date: {
                  studentId: record.studentId,
                  date: new Date(date)
                }
              },
              update: {
                status: record.status,
                notes: record.notes
              },
              create: {
                studentId: record.studentId,
                date: new Date(date),
                status: record.status,
                notes: record.notes
              }
            });
          })
        );
      });

      // Invalidate cache for all students
      for (const student of students) {
        await cacheService.invalidateUserCache(student.id);
      }

      res.status(201).json({
        success: true,
        data: createdAttendance
      });
    } catch (error) {
      console.error('Error bulk creating attendance:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to bulk create attendance'
      });
    }
  }

  // Get attendance statistics
  static async getAttendanceStatistics(req: Request, res: Response) {
    try {
      const { classId, dateFrom, dateTo } = req.query;

      const where: any = {};

      if (classId) where.student = { classId: parseInt(classId as string) };
      
      if (dateFrom || dateTo) {
        where.date = {};
        if (dateFrom) where.date.gte = new Date(dateFrom as string);
        if (dateTo) where.date.lte = new Date(dateTo as string);
      }

      const [
        totalRecords,
        statusDistribution,
        dailyAttendance,
        monthlyTrends
      ] = await Promise.all([
        prisma.attendance.count({ where }),
        prisma.attendance.groupBy({
          by: ['status'],
          where,
          _count: true
        }),
        prisma.$queryRaw`
          SELECT 
            DATE(date) as date,
            COUNT(*) as total,
            COUNT(CASE WHEN status = 'PRESENT' THEN 1 END) as present,
            COUNT(CASE WHEN status = 'ABSENT' THEN 1 END) as absent,
            COUNT(CASE WHEN status = 'LATE' THEN 1 END) as late
          FROM attendance 
          ${Object.keys(where).length > 0 ? 'WHERE ' + Object.entries(where).map(([key, value]) => `${key} = ${JSON.stringify(value)}`).join(' AND ') : ''}
          GROUP BY DATE(date)
          ORDER BY date DESC
          LIMIT 30
        `,
        prisma.$queryRaw`
          SELECT 
            DATE_TRUNC('month', date) as month,
            COUNT(*) as total,
            COUNT(CASE WHEN status = 'PRESENT' THEN 1 END) as present,
            COUNT(CASE WHEN status = 'ABSENT' THEN 1 END) as absent,
            COUNT(CASE WHEN status = 'LATE' THEN 1 END) as late
          FROM attendance 
          ${Object.keys(where).length > 0 ? 'WHERE ' + Object.entries(where).map(([key, value]) => `${key} = ${JSON.stringify(value)}`).join(' AND ') : ''}
          GROUP BY DATE_TRUNC('month', date)
          ORDER BY month DESC
          LIMIT 12
        `
      ]);

      res.json({
        success: true,
        data: {
          totalRecords,
          statusDistribution,
          dailyAttendance,
          monthlyTrends
        }
      });
    } catch (error) {
      console.error('Error getting attendance statistics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get attendance statistics'
      });
    }
  }

  // Get student attendance history
  static async getStudentAttendanceHistory(req: Request, res: Response) {
    try {
      const { studentId } = req.params;
      const { page = 1, limit = 30, dateFrom, dateTo } = req.query;

      const where: any = { studentId: parseInt(studentId) };
      
      if (dateFrom || dateTo) {
        where.date = {};
        if (dateFrom) where.date.gte = new Date(dateFrom as string);
        if (dateTo) where.date.lte = new Date(dateTo as string);
      }

      const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

      const [attendance, total] = await Promise.all([
        prisma.attendance.findMany({
          where,
          orderBy: { date: 'desc' },
          skip,
          take: parseInt(limit as string)
        }),
        prisma.attendance.count({ where })
      ]);

      // Calculate attendance rate
      const attendanceRate = attendance.length > 0 
        ? (attendance.filter(a => a.status === 'PRESENT').length / attendance.length) * 100 
        : 0;

      const result = {
        data: attendance,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          totalPages: Math.ceil(total / parseInt(limit as string))
        },
        statistics: {
          attendanceRate: Math.round(attendanceRate * 100) / 100,
          totalRecords: total,
          present: attendance.filter(a => a.status === 'PRESENT').length,
          absent: attendance.filter(a => a.status === 'ABSENT').length,
          late: attendance.filter(a => a.status === 'LATE').length
        }
      };

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error getting student attendance history:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get student attendance history'
      });
    }
  }
}
