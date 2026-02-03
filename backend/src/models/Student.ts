import { Student, StudentWithUser, StudentStatus, Gender } from '@/types';
import { prisma } from '@/index';

export class StudentModel {
  // Find student by ID
  static async findById(id: number): Promise<StudentWithUser | null> {
    return await prisma.student.findUnique({
      where: { id },
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
        class: true
      }
    });
  }

  // Find student by code
  static async findByCode(code: string): Promise<StudentWithUser | null> {
    return await prisma.student.findUnique({
      where: { code },
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
        class: true
      }
    });
  }

  // Find student by user ID
  static async findByUserId(userId: number): Promise<StudentWithUser | null> {
    return await prisma.student.findUnique({
      where: { userId },
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
        class: true
      }
    });
  }

  // Create new student
  static async create(studentData: {
    userId: number;
    code: string;
    classId: number;
    dob: Date;
    gender: Gender;
    status?: StudentStatus;
  }): Promise<StudentWithUser> {
    return await prisma.student.create({
      data: studentData,
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
        class: true
      }
    });
  }

  // Update student
  static async update(id: number, updateData: {
    classId?: number;
    status?: StudentStatus;
  }): Promise<StudentWithUser> {
    return await prisma.student.update({
      where: { id },
      data: updateData,
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
        class: true
      }
    });
  }

  // Delete student
  static async delete(id: number): Promise<void> {
    await prisma.student.delete({
      where: { id }
    });
  }

  // Get all students with filtering
  static async findAll(filters: {
    page?: number;
    limit?: number;
    search?: string;
    classId?: number;
    status?: StudentStatus;
    gender?: Gender;
    gradeLevel?: number;
  } = {}): Promise<{
    students: StudentWithUser[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 10, search, classId, status, gender, gradeLevel } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { user: { fullName: { contains: search, mode: 'insensitive' } } }
      ];
    }

    if (classId) where.classId = classId;
    if (status) where.status = status;
    if (gender) where.gender = gender;
    
    if (gradeLevel) {
      where.class = {
        gradeLevel
      };
    }

    const [students, total] = await Promise.all([
      prisma.student.findMany({
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
          class: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.student.count({ where })
    ]);

    return {
      students,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  // Get students by class
  static async findByClass(classId: number): Promise<StudentWithUser[]> {
    return await prisma.student.findMany({
      where: { classId },
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
        class: true
      },
      orderBy: {
        user: { fullName: 'asc' }
      }
    });
  }

  // Get students by status
  static async findByStatus(status: StudentStatus): Promise<StudentWithUser[]> {
    return await prisma.student.findMany({
      where: { status },
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
        class: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  // Get student statistics
  static async getStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    graduated: number;
    byGender: Record<Gender, number>;
    byGrade: Record<number, number>;
  }> {
    const [total, statusStats, genderStats] = await Promise.all([
      prisma.student.count(),
      prisma.student.groupBy({
        by: ['status'],
        _count: true
      }),
      prisma.student.groupBy({
        by: ['gender'],
        _count: true
      })
    ]);

    const byStatus = statusStats.reduce((acc: Record<StudentStatus, number>, stat: any) => {
      acc[stat.status as StudentStatus] = stat._count;
      return acc;
    }, {} as Record<StudentStatus, number>);

    const byGender = genderStats.reduce((acc: Record<Gender, number>, stat: any) => {
      acc[stat.gender as Gender] = stat._count;
      return acc;
    }, {} as Record<Gender, number>);

    // Get grade distribution
    const studentsWithGrade = await prisma.student.findMany({
      include: {
        class: {
          select: { gradeLevel: true }
        }
      }
    });

    const byGrade = studentsWithGrade.reduce((acc: Record<number, number>, student: any) => {
      const grade = student.class.gradeLevel;
      acc[grade] = (acc[grade] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    return {
      total,
      active: byStatus[StudentStatus.ACTIVE] || 0,
      inactive: byStatus[StudentStatus.INACTIVE] || 0,
      graduated: byStatus[StudentStatus.GRADUATED] || 0,
      byGender,
      byGrade
    };
  }

  // Check if student code exists
  static async codeExists(code: string): Promise<boolean> {
    const student = await prisma.student.findUnique({
      where: { code },
      select: { id: true }
    });
    return !!student;
  }

  // Search students
  static async search(query: string, limit: number = 10): Promise<StudentWithUser[]> {
    return await prisma.student.findMany({
      where: {
        OR: [
          { code: { contains: query, mode: 'insensitive' } },
          { user: { fullName: { contains: query, mode: 'insensitive' } } }
        ],
        status: StudentStatus.ACTIVE
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
        class: true
      },
      take: limit,
      orderBy: {
        user: { fullName: 'asc' }
      }
    });
  }

  // Get active students count
  static async getActiveCount(): Promise<number> {
    return await prisma.student.count({
      where: { status: StudentStatus.ACTIVE }
    });
  }

  // Get students by grade level
  static async findByGradeLevel(gradeLevel: number): Promise<StudentWithUser[]> {
    return await prisma.student.findMany({
      where: {
        status: StudentStatus.ACTIVE,
        class: {
          gradeLevel
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
        class: true
      },
      orderBy: {
        class: { name: 'asc' },
        user: { fullName: 'asc' }
      }
    });
  }

  // Update student status
  static async updateStatus(id: number, status: StudentStatus): Promise<StudentWithUser> {
    return await prisma.student.update({
      where: { id },
      data: { status },
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
        class: true
      }
    });
  }

  // Transfer student to another class
  static async transferClass(studentId: number, newClassId: number): Promise<StudentWithUser> {
    return await prisma.student.update({
      where: { id: studentId },
      data: { classId: newClassId },
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
        class: true
      }
    });
  }

  // Get recently enrolled students
  static async getRecent(limit: number = 5): Promise<StudentWithUser[]> {
    return await prisma.student.findMany({
      where: { status: StudentStatus.ACTIVE },
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
        class: true
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
  }

  // Get student age
  static async getAge(studentId: number): Promise<number> {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { dob: true }
    });

    if (!student) return 0;

    const today = new Date();
    const birthDate = new Date(student.dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }

  // Get students with attendance for a specific date
  static async getWithAttendance(date: Date, classId?: number): Promise<Array<{
    student: StudentWithUser;
    attendance?: {
      id: number;
      status: string;
      notes?: string;
    };
  }>> {
    const where: any = {
      status: StudentStatus.ACTIVE
    };

    if (classId) {
      where.classId = classId;
    }

    const students = await prisma.student.findMany({
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
        class: true
      },
      orderBy: {
        user: { fullName: 'asc' }
      }
    });

    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        date,
        studentId: {
          in: students.map((s: any) => s.id)
        }
      }
    });

    return students.map((student: any) => ({
      student,
      attendance: attendanceRecords.find((a: any) => a.studentId === student.id)
    }));
  }
}
