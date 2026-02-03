import { Class, ClassWithDetails } from '@/types';
import { prisma } from '@/index';

export class ClassModel {
  // Find class by ID
  static async findById(id: number): Promise<ClassWithDetails | null> {
    return await prisma.class.findUnique({
      where: { id },
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
        }
      }
    });
  }

  // Find class by code
  static async findByCode(code: string): Promise<ClassWithDetails | null> {
    return await prisma.class.findUnique({
      where: { code },
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
        }
      }
    });
  }

  // Create new class
  static async create(classData: {
    code: string;
    name: string;
    gradeLevel: number;
    academicYear: string;
    homeroomTeacherId?: number;
    room?: string;
    isActive?: boolean;
  }): Promise<ClassWithDetails> {
    return await prisma.class.create({
      data: classData,
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
        }
      }
    });
  }

  // Update class
  static async update(id: number, updateData: {
    name?: string;
    gradeLevel?: number;
    academicYear?: string;
    homeroomTeacherId?: number | null;
    room?: string;
    isActive?: boolean;
  }): Promise<ClassWithDetails> {
    return await prisma.class.update({
      where: { id },
      data: updateData,
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
        }
      }
    });
  }

  // Delete class
  static async delete(id: number): Promise<void> {
    await prisma.class.delete({
      where: { id }
    });
  }

  // Get all classes with filtering
  static async findAll(filters: {
    page?: number;
    limit?: number;
    search?: string;
    gradeLevel?: number;
    academicYear?: string;
    isActive?: boolean;
  } = {}): Promise<{
    classes: ClassWithDetails[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 10, search, gradeLevel, academicYear, isActive } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (gradeLevel) where.gradeLevel = gradeLevel;
    if (academicYear) where.academicYear = academicYear;
    if (isActive !== undefined) where.isActive = isActive;

    const [classes, total] = await Promise.all([
      prisma.class.findMany({
        where,
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
          }
        },
        orderBy: { gradeLevel: 'asc', name: 'asc' },
        skip,
        take: limit
      }),
      prisma.class.count({ where })
    ]);

    return {
      classes,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  // Get classes by grade level
  static async findByGradeLevel(gradeLevel: number): Promise<ClassWithDetails[]> {
    return await prisma.class.findMany({
      where: { gradeLevel, isActive: true },
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
        }
      },
      orderBy: { name: 'asc' }
    });
  }

  // Get classes by academic year
  static async findByAcademicYear(academicYear: string): Promise<ClassWithDetails[]> {
    return await prisma.class.findMany({
      where: { academicYear, isActive: true },
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
        }
      },
      orderBy: { gradeLevel: 'asc', name: 'asc' }
    });
  }

  // Get classes by homeroom teacher
  static async findByHomeroomTeacher(teacherId: number): Promise<ClassWithDetails[]> {
    return await prisma.class.findMany({
      where: { homeroomTeacherId: teacherId, isActive: true },
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
        }
      },
      orderBy: { name: 'asc' }
    });
  }

  // Get class statistics
  static async getStats(): Promise<{
    total: number;
    active: number;
    byGradeLevel: Record<number, number>;
    byAcademicYear: Record<string, number>;
    totalStudents: number;
    averageStudentsPerClass: number;
  }> {
    const [total, active, gradeStats, yearStats, studentStats] = await Promise.all([
      prisma.class.count(),
      prisma.class.count({ where: { isActive: true } }),
      prisma.class.groupBy({
        by: ['gradeLevel'],
        _count: true
      }),
      prisma.class.groupBy({
        by: ['academicYear'],
        _count: true
      }),
      prisma.class.aggregate({
        where: { isActive: true },
        _sum: { studentCount: true },
        _count: true
      })
    ]);

    const byGradeLevel = gradeStats.reduce((acc, stat) => {
      acc[stat.gradeLevel] = stat._count;
      return acc;
    }, {} as Record<number, number>);

    const byAcademicYear = yearStats.reduce((acc, stat) => {
      acc[stat.academicYear] = stat._count;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      active,
      byGradeLevel,
      byAcademicYear,
      totalStudents: studentStats._sum.studentCount || 0,
      averageStudentsPerClass: studentStats._count > 0 
        ? (studentStats._sum.studentCount || 0) / studentStats._count 
        : 0
    };
  }

  // Check if class code exists
  static async codeExists(code: string): Promise<boolean> {
    const classData = await prisma.class.findUnique({
      where: { code },
      select: { id: true }
    });
    return !!classData;
  }

  // Search classes
  static async search(query: string, limit: number = 10): Promise<ClassWithDetails[]> {
    return await prisma.class.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { code: { contains: query, mode: 'insensitive' } }
        ],
        isActive: true
      },
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
        }
      },
      take: limit,
      orderBy: { name: 'asc' }
    });
  }

  // Get active classes count
  static async getActiveCount(): Promise<number> {
    return await prisma.class.count({
      where: { isActive: true }
    });
  }

  // Update student count
  static async updateStudentCount(id: number): Promise<void> {
    const studentCount = await prisma.student.count({
      where: { classId: id }
    });

    await prisma.class.update({
      where: { id },
      data: { studentCount }
    });
  }

  // Get available homeroom teachers
  static async getAvailableHomeroomTeachers(): Promise<Array<{
    id: number;
    fullName: string;
    email: string;
    avatar?: string;
  }>> {
    const teachers = await prisma.teacher.findMany({
      where: { isActive: true },
      include: {
        user: {
          select: { id: true, fullName: true, email: true, avatar: true }
        },
        classes: {
          select: { id: true }
        }
      }
    });

    return teachers
      .filter(teacher => !teacher.classes || teacher.classes.length === 0)
      .map(teacher => ({
        id: teacher.id,
        fullName: teacher.user.fullName,
        email: teacher.user.email,
        avatar: teacher.user.avatar
      }));
  }

  // Transfer students between classes
  static async transferStudents(
    fromClassId: number,
    toClassId: number,
    studentIds: number[]
  ): Promise<number> {
    const result = await prisma.student.updateMany({
      where: {
        id: { in: studentIds },
        classId: fromClassId
      },
      data: {
        classId: toClassId
      }
    });

    // Update student counts
    await Promise.all([
      this.updateStudentCount(fromClassId),
      this.updateStudentCount(toClassId)
    ]);

    return result.count;
  }

  // Get class performance summary
  static async getPerformanceSummary(classId: number): Promise<{
    averageGrade: number;
    attendanceRate: number;
    totalStudents: number;
    totalGrades: number;
    totalAttendance: number;
  }> {
    const [gradeStats, attendanceStats, studentCount] = await Promise.all([
      prisma.$queryRaw`
        SELECT AVG(g.score) as averageGrade, COUNT(g.id) as totalGrades
        FROM grades g
        JOIN students s ON g.studentId = s.id
        WHERE s.classId = ${classId}
      `,
      prisma.$queryRaw`
        SELECT 
          COUNT(*) as totalAttendance,
          COUNT(CASE WHEN status = 'PRESENT' THEN 1 END) as presentDays
        FROM attendance a
        JOIN students s ON a.studentId = s.id
        WHERE s.classId = ${classId}
      `,
      prisma.student.count({
        where: { classId }
      })
    ]);

    const averageGrade = gradeStats[0]?.averageGrade ? parseFloat(gradeStats[0].averageGrade) : 0;
    const totalGrades = gradeStats[0]?.totalGrades || 0;
    const totalAttendance = attendanceStats[0]?.totalAttendance || 0;
    const presentDays = attendanceStats[0]?.presentDays || 0;
    const attendanceRate = totalAttendance > 0 ? (presentDays / totalAttendance) * 100 : 0;

    return {
      averageGrade,
      attendanceRate,
      totalStudents: studentCount,
      totalGrades,
      totalAttendance
    };
  }

  // Get recently created classes
  static async getRecent(limit: number = 5): Promise<ClassWithDetails[]> {
    return await prisma.class.findMany({
      where: { isActive: true },
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
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
  }

  // Get classes without homeroom teacher
  static async getClassesWithoutHomeroom(): Promise<ClassWithDetails[]> {
    return await prisma.class.findMany({
      where: { 
        homeroomTeacherId: null,
        isActive: true
      },
      include: {
        homeroomTeacher: true,
        students: {
          include: {
            user: {
              select: { id: true, fullName: true, email: true, avatar: true }
            }
          }
        }
      },
      orderBy: { gradeLevel: 'asc', name: 'asc' }
    });
  }
}

export { ClassModel };
