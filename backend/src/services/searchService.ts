import { prisma } from '@/index';

interface SearchOptions {
  query?: string;
  filters?: Record<string, any>;
  sort?: {
    field: string;
    order: 'asc' | 'desc';
  };
  pagination?: {
    page: number;
    limit: number;
  };
  include?: string[];
}

interface SearchResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  facets?: Record<string, Array<{ value: string; count: number }>>;
}

export class SearchService {
  // Advanced search for students
  async searchStudents(options: SearchOptions): Promise<SearchResult<any>> {
    const {
      query,
      filters = {},
      sort = { field: 'fullName', order: 'asc' },
      pagination = { page: 1, limit: 10 },
      include = ['user', 'class']
    } = options;

    const where: any = {};

    // Text search
    if (query) {
      where.OR = [
        { user: { fullName: { contains: query, mode: 'insensitive' } } },
        { code: { contains: query, mode: 'insensitive' } },
        { user: { email: { contains: query, mode: 'insensitive' } } }
      ];
    }

    // Apply filters
    if (filters.classId) {
      where.classId = parseInt(filters.classId);
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.gender) {
      where.gender = filters.gender;
    }

    if (filters.gradeLevel) {
      where.class = {
        gradeLevel: parseInt(filters.gradeLevel)
      };
    }

    if (filters.ageFrom || filters.ageTo) {
      const currentYear = new Date().getFullYear();
      where.dob = {};
      
      if (filters.ageFrom) {
        where.dob.lte = new Date(currentYear - parseInt(filters.ageFrom), 0, 1);
      }
      
      if (filters.ageTo) {
        where.dob.gte = new Date(currentYear - parseInt(filters.ageTo), 11, 31);
      }
    }

    // Build include relations
    const includeRelations: any = {};
    if (include.includes('user')) {
      includeRelations.user = {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          avatar: true
        }
      };
    }
    
    if (include.includes('class')) {
      includeRelations.class = true;
    }
    
    if (include.includes('grades')) {
      includeRelations.grades = {
        include: {
          subject: {
            select: { name: true, color: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      };
    }

    // Execute search with pagination
    const skip = (pagination.page - 1) * pagination.limit;
    
    const [data, total] = await Promise.all([
      prisma.student.findMany({
        where,
        include: includeRelations,
        orderBy: { [sort.field]: sort.order },
        skip,
        take: pagination.limit
      }),
      prisma.student.count({ where })
    ]);

    // Generate facets
    const facets = await this.generateStudentFacets(where);

    return {
      data,
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(total / pagination.limit),
      facets
    };
  }

  // Advanced search for teachers
  async searchTeachers(options: SearchOptions): Promise<SearchResult<any>> {
    const {
      query,
      filters = {},
      sort = { field: 'fullName', order: 'asc' },
      pagination = { page: 1, limit: 10 },
      include = ['user', 'subjects', 'classes']
    } = options;

    const where: any = {};

    // Text search
    if (query) {
      where.OR = [
        { user: { fullName: { contains: query, mode: 'insensitive' } } },
        { user: { email: { contains: query, mode: 'insensitive' } } },
        { major: { contains: query, mode: 'insensitive' } }
      ];
    }

    // Apply filters
    if (filters.major) {
      where.major = { contains: filters.major, mode: 'insensitive' };
    }

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive === 'true';
    }

    if (filters.subjectId) {
      where.subjects = {
        some: {
          id: parseInt(filters.subjectId)
        }
      };
    }

    // Build include relations
    const includeRelations: any = {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          avatar: true
        }
      }
    };

    if (include.includes('subjects')) {
      includeRelations.subjects = true;
    }

    if (include.includes('classes')) {
      includeRelations.classes = true;
    }

    // Execute search
    const skip = (pagination.page - 1) * pagination.limit;
    
    const [data, total] = await Promise.all([
      prisma.teacher.findMany({
        where,
        include: includeRelations,
        orderBy: { [sort.field]: sort.order },
        skip,
        take: pagination.limit
      }),
      prisma.teacher.count({ where })
    ]);

    // Generate facets
    const facets = await this.generateTeacherFacets(where);

    return {
      data,
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(total / pagination.limit),
      facets
    };
  }

  // Search grades with advanced filtering
  async searchGrades(options: SearchOptions): Promise<SearchResult<any>> {
    const {
      query,
      filters = {},
      sort = { field: 'createdAt', order: 'desc' },
      pagination = { page: 1, limit: 20 },
      include = ['student', 'subject']
    } = options;

    const where: any = {};

    // Apply filters
    if (filters.studentId) {
      where.studentId = parseInt(filters.studentId);
    }

    if (filters.subjectId) {
      where.subjectId = parseInt(filters.subjectId);
    }

    if (filters.classId) {
      where.student = {
        classId: parseInt(filters.classId)
      };
    }

    if (filters.examType) {
      where.examType = filters.examType;
    }

    if (filters.semester) {
      where.semester = filters.semester;
    }

    if (filters.scoreFrom || filters.scoreTo) {
      where.score = {};
      
      if (filters.scoreFrom !== undefined) {
        where.score.gte = parseFloat(filters.scoreFrom);
      }
      
      if (filters.scoreTo !== undefined) {
        where.score.lte = parseFloat(filters.scoreTo);
      }
    }

    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      
      if (filters.dateFrom) {
        where.createdAt.gte = new Date(filters.dateFrom);
      }
      
      if (filters.dateTo) {
        where.createdAt.lte = new Date(filters.dateTo);
      }
    }

    // Build include relations
    const includeRelations: any = {};
    
    if (include.includes('student')) {
      includeRelations.student = {
        include: {
          user: {
            select: { fullName: true, code: true }
          },
          class: {
            select: { name: true }
          }
        }
      };
    }

    if (include.includes('subject')) {
      includeRelations.subject = {
        select: { name: true, color: true }
      };
    }

    // Execute search
    const skip = (pagination.page - 1) * pagination.limit;
    
    const [data, total] = await Promise.all([
      prisma.grade.findMany({
        where,
        include: includeRelations,
        orderBy: { [sort.field]: sort.order },
        skip,
        take: pagination.limit
      }),
      prisma.grade.count({ where })
    ]);

    // Calculate statistics
    const stats = await this.calculateGradeStats(where);

    return {
      data,
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(total / pagination.limit),
      facets: {
        scoreRanges: stats.scoreRanges,
        examTypes: stats.examTypes,
        subjects: stats.subjects
      }
    };
  }

  // Search attendance with advanced filtering
  async searchAttendance(options: SearchOptions): Promise<SearchResult<any>> {
    const {
      filters = {},
      sort = { field: 'date', order: 'desc' },
      pagination = { page: 1, limit: 20 },
      include = ['student', 'class']
    } = options;

    const where: any = {};

    // Apply filters
    if (filters.studentId) {
      where.studentId = parseInt(filters.studentId);
    }

    if (filters.classId) {
      where.student = {
        classId: parseInt(filters.classId)
      };
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.dateFrom || filters.dateTo) {
      where.date = {};
      
      if (filters.dateFrom) {
        where.date.gte = new Date(filters.dateFrom);
      }
      
      if (filters.dateTo) {
        where.date.lte = new Date(filters.dateTo);
      }
    }

    // Build include relations
    const includeRelations: any = {};
    
    if (include.includes('student')) {
      includeRelations.student = {
        include: {
          user: {
            select: { fullName: true, code: true }
          },
          class: {
            select: { name: true }
          }
        }
      };
    }

    // Execute search
    const skip = (pagination.page - 1) * pagination.limit;
    
    const [data, total] = await Promise.all([
      prisma.attendance.findMany({
        where,
        include: includeRelations,
        orderBy: { [sort.field]: sort.order },
        skip,
        take: pagination.limit
      }),
      prisma.attendance.count({ where })
    ]);

    // Calculate attendance statistics
    const stats = await this.calculateAttendanceStats(where);

    return {
      data,
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(total / pagination.limit),
      facets: {
        statusDistribution: stats.statusDistribution,
        attendanceRate: stats.attendanceRate
      }
    };
  }

  // Global search across multiple entities
  async globalSearch(query: string, options: {
    entities?: string[];
    limit?: number;
  } = {}): Promise<any> {
    const { entities = ['students', 'teachers', 'classes', 'subjects'], limit = 5 } = options;
    
    const results: any = {};

    if (entities.includes('students')) {
      results.students = await prisma.student.findMany({
        where: {
          OR: [
            { user: { fullName: { contains: query, mode: 'insensitive' } } },
            { code: { contains: query, mode: 'insensitive' } }
          ]
        },
        include: {
          user: {
            select: { fullName: true, email: true, avatar: true }
          },
          class: {
            select: { name: true }
          }
        },
        take: limit
      });
    }

    if (entities.includes('teachers')) {
      results.teachers = await prisma.teacher.findMany({
        where: {
          OR: [
            { user: { fullName: { contains: query, mode: 'insensitive' } } },
            { major: { contains: query, mode: 'insensitive' } }
          ]
        },
        include: {
          user: {
            select: { fullName: true, email: true, avatar: true }
          },
          subjects: {
            select: { name: true }
          }
        },
        take: limit
      });
    }

    if (entities.includes('classes')) {
      results.classes = await prisma.class.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { code: { contains: query, mode: 'insensitive' } }
          ]
        },
        include: {
          homeroomTeacher: {
            include: {
              user: {
                select: { fullName: true }
              }
            }
          }
        },
        take: limit
      });
    }

    if (entities.includes('subjects')) {
      results.subjects = await prisma.subject.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { code: { contains: query, mode: 'insensitive' } }
          ]
        },
        take: limit
      });
    }

    return results;
  }

  // Generate search suggestions
  async getSearchSuggestions(query: string, type: string = 'all'): Promise<string[]> {
    const suggestions: string[] = [];
    const limit = 5;

    if (type === 'all' || type === 'students') {
      const students = await prisma.student.findMany({
        where: {
          user: {
            fullName: {
              contains: query,
              mode: 'insensitive'
            }
          }
        },
        include: {
          user: {
            select: { fullName: true }
          }
        },
        take: limit
      });

      suggestions.push(...students.map(s => s.user.fullName));
    }

    if (type === 'all' || type === 'teachers') {
      const teachers = await prisma.teacher.findMany({
        where: {
          user: {
            fullName: {
              contains: query,
              mode: 'insensitive'
            }
          }
        },
        include: {
          user: {
            select: { fullName: true }
          }
        },
        take: limit
      });

      suggestions.push(...teachers.map(t => t.user.fullName));
    }

    if (type === 'all' || type === 'subjects') {
      const subjects = await prisma.subject.findMany({
        where: {
          name: {
            contains: query,
            mode: 'insensitive'
          }
        },
        take: limit
      });

      suggestions.push(...subjects.map(s => s.name));
    }

    // Remove duplicates and limit
    return [...new Set(suggestions)].slice(0, limit);
  }

  // Helper methods for generating facets
  private async generateStudentFacets(where: any): Promise<any> {
    const [statusFacet, genderFacet, classFacet] = await Promise.all([
      prisma.student.groupBy({
        by: ['status'],
        where,
        _count: true
      }),
      prisma.student.groupBy({
        by: ['gender'],
        where,
        _count: true
      }),
      prisma.student.groupBy({
        by: ['classId'],
        where,
        _count: true,
        include: {
          class: {
            select: { name: true }
          }
        }
      })
    ]);

    return {
      status: statusFacet.map(item => ({
        value: item.status,
        count: item._count
      })),
      gender: genderFacet.map(item => ({
        value: item.gender,
        count: item._count
      })),
      classes: classFacet.map(item => ({
        value: item.class?.name || 'Unknown',
        count: item._count
      }))
    };
  }

  private async generateTeacherFacets(where: any): Promise<any> {
    const [majorFacet, statusFacet] = await Promise.all([
      prisma.teacher.groupBy({
        by: ['major'],
        where,
        _count: true
      }),
      prisma.teacher.groupBy({
        by: ['isActive'],
        where,
        _count: true
      })
    ]);

    return {
      major: majorFacet.map(item => ({
        value: item.major,
        count: item._count
      })),
      status: statusFacet.map(item => ({
        value: item.isActive ? 'Active' : 'Inactive',
        count: item._count
      }))
    };
  }

  private async calculateGradeStats(where: any): Promise<any> {
    const grades = await prisma.grade.findMany({
      where,
      include: {
        subject: {
          select: { name: true }
        }
      }
    });

    // Score ranges
    const scoreRanges = [
      { range: '0-4', count: 0 },
      { range: '4-6', count: 0 },
      { range: '6-8', count: 0 },
      { range: '8-10', count: 0 }
    ];

    grades.forEach(grade => {
      if (grade.score < 4) scoreRanges[0].count++;
      else if (grade.score < 6) scoreRanges[1].count++;
      else if (grade.score < 8) scoreRanges[2].count++;
      else scoreRanges[3].count++;
    });

    // Exam types
    const examTypes = grades.reduce((acc, grade) => {
      acc[grade.examType] = (acc[grade.examType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Subjects
    const subjects = grades.reduce((acc, grade) => {
      acc[grade.subject.name] = (acc[grade.subject.name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      scoreRanges,
      examTypes: Object.entries(examTypes).map(([type, count]) => ({ value: type, count })),
      subjects: Object.entries(subjects).map(([name, count]) => ({ value: name, count }))
    };
  }

  private async calculateAttendanceStats(where: any): Promise<any> {
    const attendance = await prisma.attendance.findMany({
      where,
      select: { status: true }
    });

    const statusDistribution = attendance.reduce((acc, record) => {
      acc[record.status] = (acc[record.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const attendanceRate = attendance.length > 0 
      ? (statusDistribution.PRESENT || 0) / attendance.length * 100 
      : 0;

    return {
      statusDistribution: Object.entries(statusDistribution).map(([status, count]) => ({
        value: status,
        count
      })),
      attendanceRate: Math.round(attendanceRate * 100) / 100
    };
  }
}

export { SearchService };
