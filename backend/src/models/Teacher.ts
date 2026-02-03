import { Teacher, TeacherWithUser } from '@/types';
import { prisma } from '@/index';

export class TeacherModel {
  // Find teacher by ID
  static async findById(id: number): Promise<TeacherWithUser | null> {
    return await prisma.teacher.findUnique({
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
  }

  // Find teacher by user ID
  static async findByUserId(userId: number): Promise<TeacherWithUser | null> {
    return await prisma.teacher.findUnique({
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
  }

  // Create new teacher
  static async create(teacherData: {
    userId: number;
    major: string;
    salary?: number;
    isActive?: boolean;
  }): Promise<TeacherWithUser> {
    return await prisma.teacher.create({
      data: teacherData,
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
  }

  // Update teacher
  static async update(id: number, updateData: {
    major?: string;
    salary?: number;
    isActive?: boolean;
  }): Promise<TeacherWithUser> {
    return await prisma.teacher.update({
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
  }

  // Delete teacher
  static async delete(id: number): Promise<void> {
    await prisma.teacher.delete({
      where: { id }
    });
  }

  // Get all teachers with filtering
  static async findAll(filters: {
    page?: number;
    limit?: number;
    search?: string;
    major?: string;
    isActive?: boolean;
  } = {}): Promise<{
    teachers: TeacherWithUser[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 10, search, major, isActive } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { user: { fullName: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { major: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (major) where.major = { contains: major, mode: 'insensitive' };
    if (isActive !== undefined) where.isActive = isActive;

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
        },
        orderBy: {
          user: { fullName: 'asc' }
        },
        skip,
        take: limit
      }),
      prisma.teacher.count({ where })
    ]);

    return {
      teachers,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  // Get teachers by subject
  static async findBySubject(subjectId: number): Promise<TeacherWithUser[]> {
    return await prisma.teacher.findMany({
      where: {
        subjects: {
          some: {
            id: subjectId
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
      },
      orderBy: {
        user: { fullName: 'asc' }
      }
    });
  }

  // Get teachers by major
  static async findByMajor(major: string): Promise<TeacherWithUser[]> {
    return await prisma.teacher.findMany({
      where: {
        major: { contains: major, mode: 'insensitive' },
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
      },
      orderBy: {
        user: { fullName: 'asc' }
      }
    });
  }

  // Get active teachers
  static async findActive(): Promise<TeacherWithUser[]> {
    return await prisma.teacher.findMany({
      where: { isActive: true },
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
      },
      orderBy: {
        user: { fullName: 'asc' }
      }
    });
  }

  // Get teacher statistics
  static async getStats(): Promise<{
    total: number;
    active: number;
    byMajor: Record<string, number>;
    averageSalary: number;
    totalSubjects: number;
    totalClasses: number;
  }> {
    const [total, active, majorStats, salaryStats, subjectStats, classStats] = await Promise.all([
      prisma.teacher.count(),
      prisma.teacher.count({ where: { isActive: true } }),
      prisma.teacher.groupBy({
        by: ['major'],
        _count: true
      }),
      prisma.teacher.aggregate({
        where: { isActive: true },
        _avg: { salary: true }
      }),
      prisma.$queryRaw`
        SELECT COUNT(DISTINCT s.id) as totalSubjects
        FROM subjects s
        WHERE s.teacherId IS NOT NULL
      `,
      prisma.$queryRaw`
        SELECT COUNT(DISTINCT c.id) as totalClasses
        FROM classes c
        WHERE c.homeroomTeacherId IS NOT NULL
      `
    ]);

    const byMajor = majorStats.reduce((acc, stat) => {
      acc[stat.major] = stat._count;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      active,
      byMajor,
      averageSalary: salaryStats._avg.salary || 0,
      totalSubjects: subjectStats[0]?.totalSubjects || 0,
      totalClasses: classStats[0]?.totalClasses || 0
    };
  }

  // Search teachers
  static async search(query: string, limit: number = 10): Promise<TeacherWithUser[]> {
    return await prisma.teacher.findMany({
      where: {
        OR: [
          { user: { fullName: { contains: query, mode: 'insensitive' } } },
          { user: { email: { contains: query, mode: 'insensitive' } } },
          { major: { contains: query, mode: 'insensitive' } }
        ],
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
      },
      take: limit,
      orderBy: {
        user: { fullName: 'asc' }
      }
    });
  }

  // Get active teachers count
  static async getActiveCount(): Promise<number> {
    return await prisma.teacher.count({
      where: { isActive: true }
    });
  }

  // Deactivate teacher
  static async deactivate(id: number): Promise<TeacherWithUser> {
    return await prisma.teacher.update({
      where: { id },
      data: { isActive: false },
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
  }

  // Activate teacher
  static async activate(id: number): Promise<TeacherWithUser> {
    return await prisma.teacher.update({
      where: { id },
      data: { isActive: true },
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
  }

  // Get teachers without assigned subjects
  static async getTeachersWithoutSubjects(): Promise<TeacherWithUser[]> {
    return await prisma.teacher.findMany({
      where: {
        isActive: true,
        subjects: {
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
      },
      orderBy: {
        user: { fullName: 'asc' }
      }
    });
  }

  // Get teachers without homeroom assignment
  static async getTeachersWithoutHomeroom(): Promise<TeacherWithUser[]> {
    return await prisma.teacher.findMany({
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
      },
      orderBy: {
        user: { fullName: 'asc' }
      }
    });
  }

  // Get teacher performance summary
  static async getPerformanceSummary(teacherId: number): Promise<{
    averageGrade: number;
    totalGrades: number;
    totalStudents: number;
    totalSubjects: number;
    totalClasses: number;
    passingRate: number;
  }> {
    const [gradeStats, studentStats, subjectStats, classStats] = await Promise.all([
      prisma.$queryRaw`
        SELECT 
          AVG(g.score) as averageGrade,
          COUNT(g.id) as totalGrades,
          COUNT(CASE WHEN g.score >= 5 THEN 1 END) as passingGrades
        FROM grades g
        JOIN subjects s ON g.subjectId = s.id
        WHERE s.teacherId = ${teacherId}
      `,
      prisma.$queryRaw`
        SELECT COUNT(DISTINCT s.id) as totalStudents
        FROM students s
        JOIN grades g ON s.id = g.studentId
        JOIN subjects sub ON g.subjectId = sub.id
        WHERE sub.teacherId = ${teacherId}
      `,
      prisma.subject.count({
        where: { teacherId }
      }),
      prisma.class.count({
        where: { homeroomTeacherId: teacherId }
      })
    ]);

    const averageGrade = gradeStats[0]?.averageGrade ? parseFloat(gradeStats[0].averageGrade) : 0;
    const totalGrades = gradeStats[0]?.totalGrades || 0;
    const passingGrades = gradeStats[0]?.passingGrades || 0;
    const totalStudents = studentStats[0]?.totalStudents || 0;
    const passingRate = totalGrades > 0 ? (passingGrades / totalGrades) * 100 : 0;

    return {
      averageGrade,
      totalGrades,
      totalStudents,
      totalSubjects: subjectStats,
      totalClasses: classStats,
      passingRate
    };
  }

  // Get recently hired teachers
  static async getRecent(limit: number = 5): Promise<TeacherWithUser[]> {
    return await prisma.teacher.findMany({
      where: { isActive: true },
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
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
  }
}

export { TeacherModel };
