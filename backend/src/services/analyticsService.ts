import { prisma } from '@/index';
import moment from 'moment';

export interface AnalyticsData {
  overview: {
    totalStudents: number;
    totalTeachers: number;
    totalClasses: number;
    activeUsers: number;
  };
  attendance: {
    daily: Array<{ date: string; present: number; absent: number; rate: number }>;
    weekly: Array<{ week: string; rate: number }>;
    monthly: Array<{ month: string; rate: number }>;
  };
  academic: {
    gradeDistribution: Array<{ range: string; count: number }>;
    subjectPerformance: Array<{ subject: string; average: number; passRate: number }>;
    classRanking: Array<{ className: string; average: number; rank: number }>;
  };
  financial: {
    revenue: Array<{ month: string; amount: number }>;
    expenses: Array<{ category: string; amount: number }>;
    outstandingFees: number;
  };
  engagement: {
    lmsUsage: Array<{ date: string; views: number; downloads: number }>;
    libraryUsage: Array<{ month: string; booksBorrowed: number }>;
    portalLogins: Array<{ date: string; logins: number }>;
  };
}

export class AnalyticsService {
  // Get overview statistics
  async getOverview(): Promise<AnalyticsData['overview']> {
    const [
      totalStudents,
      totalTeachers,
      totalClasses,
      activeUsers
    ] = await Promise.all([
      prisma.student.count({ where: { status: 'ACTIVE' } }),
      prisma.teacher.count({ where: { isActive: true } }),
      prisma.class.count({ where: { isActive: true } }),
      prisma.user.count({ where: { isActive: true } })
    ]);

    return {
      totalStudents,
      totalTeachers,
      totalClasses,
      activeUsers
    };
  }

  // Get attendance analytics
  async getAttendanceAnalytics(period: 'daily' | 'weekly' | 'monthly' = 'daily'): Promise<AnalyticsData['attendance']> {
    const now = moment();
    let startDate: Date;
    let groupBy: string;

    switch (period) {
      case 'daily':
        startDate = now.clone().subtract(30, 'days');
        groupBy = 'DATE(date)';
        break;
      case 'weekly':
        startDate = now.clone().subtract(12, 'weeks');
        groupBy = 'DATE_TRUNC(\'week\', date)';
        break;
      case 'monthly':
        startDate = now.clone().subtract(12, 'months');
        groupBy = 'DATE_TRUNC(\'month\', date)';
        break;
    }

    const attendanceData = await prisma.$queryRaw`
      SELECT 
        ${groupBy} as date,
        COUNT(CASE WHEN status = 'PRESENT' THEN 1 END) as present,
        COUNT(CASE WHEN status = 'ABSENT' THEN 1 END) as absent,
        ROUND(
          COUNT(CASE WHEN status = 'PRESENT' THEN 1 END) * 100.0 / 
          COUNT(*), 2
        ) as rate
      FROM attendance 
      WHERE date >= ${startDate.toISOString()}
      GROUP BY ${groupBy}
      ORDER BY date ASC
    ` as Array<{
      date: string;
      present: number;
      absent: number;
      rate: number;
    }>;

    return {
      daily: period === 'daily' ? attendanceData : [],
      weekly: period === 'weekly' ? attendanceData : [],
      monthly: period === 'monthly' ? attendanceData : []
    };
  }

  // Get academic performance analytics
  async getAcademicAnalytics(): Promise<AnalyticsData['academic']> {
    // Grade distribution
    const gradeDistribution = await prisma.$queryRaw`
      SELECT 
        CASE 
          WHEN score >= 90 THEN '9.0-10.0'
          WHEN score >= 80 THEN '8.0-8.9'
          WHEN score >= 70 THEN '7.0-7.9'
          WHEN score >= 60 THEN '6.0-6.9'
          ELSE 'Dưới 6.0'
        END as range,
        COUNT(*) as count
      FROM grades 
      GROUP BY 
        CASE 
          WHEN score >= 90 THEN '9.0-10.0'
          WHEN score >= 80 THEN '8.0-8.9'
          WHEN score >= 70 THEN '7.0-7.9'
          WHEN score >= 60 THEN '6.0-6.9'
          ELSE 'Dưới 6.0'
        END
      ORDER BY range DESC
    ` as Array<{ range: string; count: number }>;

    // Subject performance
    const subjectPerformance = await prisma.$queryRaw`
      SELECT 
        s.name as subject,
        AVG(g.score) as average,
        ROUND(
          COUNT(CASE WHEN g.score >= 5 THEN 1 END) * 100.0 / 
          COUNT(*), 2
        ) as passRate
      FROM grades g
      JOIN subjects s ON g.subjectId = s.id
      GROUP BY s.id, s.name
      ORDER BY average DESC
    ` as Array<{ subject: string; average: number; passRate: number }>;

    // Class ranking
    const classRanking = await prisma.$queryRaw`
      SELECT 
        c.name as className,
        AVG(g.score) as average,
        RANK() OVER (ORDER BY AVG(g.score) DESC) as rank
      FROM grades g
      JOIN students st ON g.studentId = st.id
      JOIN classes c ON st.classId = c.id
      GROUP BY c.id, c.name
      ORDER BY average DESC
    ` as Array<{ className: string; average: number; rank: number }>;

    return {
      gradeDistribution,
      subjectPerformance,
      classRanking
    };
  }

  // Get financial analytics
  async getFinancialAnalytics(): Promise<AnalyticsData['financial']> {
    const now = moment();
    const startDate = now.clone().subtract(12, 'months');

    // Monthly revenue
    const revenue = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', paymentDate) as month,
        SUM(amount) as amount
      FROM invoices 
      WHERE status = 'PAID' 
        AND paymentDate >= ${startDate.toISOString()}
      GROUP BY DATE_TRUNC('month', paymentDate)
      ORDER BY month ASC
    ` as Array<{ month: string; amount: number }>;

    // Outstanding fees
    const outstandingFees = await prisma.invoice.aggregate({
      where: {
        status: {
          in: ['UNPAID', 'OVERDUE']
        }
      },
      _sum: {
        amount: true
      }
    });

    return {
      revenue,
      expenses: [], // To be implemented with expense tracking
      outstandingFees: outstandingFees._sum.amount || 0
    };
  }

  // Get engagement analytics
  async getEngagementAnalytics(): Promise<AnalyticsData['engagement']> {
    const now = moment();
    const startDate = now.clone().subtract(30, 'days');

    // LMS usage (placeholder - would need LMS analytics tracking)
    const lmsUsage = Array.from({ length: 30 }, (_, i) => ({
      date: now.clone().subtract(29 - i, 'days').format('YYYY-MM-DD'),
      views: Math.floor(Math.random() * 1000) + 100,
      downloads: Math.floor(Math.random() * 500) + 50
    }));

    // Library usage
    const libraryUsage = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', borrowedDate) as month,
        COUNT(*) as booksBorrowed
      FROM library_books 
      WHERE borrowedDate >= ${now.clone().subtract(12, 'months').toISOString()}
      GROUP BY DATE_TRUNC('month', borrowedDate)
      ORDER BY month ASC
    ` as Array<{ month: string; booksBorrowed: number }>;

    // Portal logins (placeholder - would need login tracking)
    const portalLogins = Array.from({ length: 30 }, (_, i) => ({
      date: now.clone().subtract(29 - i, 'days').format('YYYY-MM-DD'),
      logins: Math.floor(Math.random() * 500) + 200
    }));

    return {
      lmsUsage,
      libraryUsage,
      portalLogins
    };
  }

  // Get comprehensive analytics
  async getComprehensiveAnalytics(): Promise<AnalyticsData> {
    const [overview, attendance, academic, financial, engagement] = await Promise.all([
      this.getOverview(),
      this.getAttendanceAnalytics(),
      this.getAcademicAnalytics(),
      this.getFinancialAnalytics(),
      this.getEngagementAnalytics()
    ]);

    return {
      overview,
      attendance,
      academic,
      financial,
      engagement
    };
  }

  // Get student performance trends
  async getStudentPerformanceTrends(studentId: number): Promise<any> {
    const trends = await prisma.grade.findMany({
      where: { studentId },
      include: {
        subject: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    return trends;
  }

  // Get class performance comparison
  async getClassComparison(classIds: number[]): Promise<any> {
    const comparison = await prisma.$queryRaw`
      SELECT 
        c.name as className,
        s.name as subject,
        AVG(g.score) as average,
        COUNT(*) as totalGrades,
        ROUND(
          COUNT(CASE WHEN g.score >= 5 THEN 1 END) * 100.0 / 
          COUNT(*), 2
        ) as passRate
      FROM grades g
      JOIN students st ON g.studentId = st.id
      JOIN classes c ON st.classId = c.id
      JOIN subjects s ON g.subjectId = s.id
      WHERE c.id = ANY(${classIds})
      GROUP BY c.id, c.name, s.id, s.name
      ORDER BY c.name, s.name
    `;

    return comparison;
  }

  // Get teacher performance metrics
  async getTeacherPerformanceMetrics(teacherId: number): Promise<any> {
    const metrics = await prisma.$queryRaw`
      SELECT 
        COUNT(DISTINCT c.id) as classesTaught,
        COUNT(DISTINCT s.id) as subjectsTaught,
        AVG(g.score) as averageStudentScore,
        COUNT(DISTINCT st.id) as totalStudents,
        COUNT(g.id) as totalGrades
      FROM teachers t
      LEFT JOIN classes c ON t.id = c.homeroomTeacherId
      LEFT JOIN subjects s ON t.id = s.teacherId
      LEFT JOIN grades g ON s.id = g.subjectId
      LEFT JOIN students st ON g.studentId = st.id
      WHERE t.id = ${teacherId}
      GROUP BY t.id
    `;

    return metrics[0];
  }

  // Generate performance report
  async generatePerformanceReport(type: 'student' | 'class' | 'teacher' | 'school', id?: number): Promise<any> {
    switch (type) {
      case 'student':
        return this.getStudentPerformanceTrends(id!);
      case 'class':
        return this.getClassComparison([id!]);
      case 'teacher':
        return this.getTeacherPerformanceMetrics(id!);
      case 'school':
        return this.getComprehensiveAnalytics();
      default:
        throw new Error('Invalid report type');
    }
  }

  // Get predictive analytics
  async getPredictiveAnalytics(): Promise<any> {
    // Predict student performance based on historical data
    const atRiskStudents = await prisma.$queryRaw`
      SELECT 
        st.id,
        st.fullName,
        c.name as className,
        AVG(g.score) as averageScore,
        COUNT(CASE WHEN a.status = 'ABSENT' THEN 1 END) as absentDays,
        COUNT(CASE WHEN g.score < 5 THEN 1 END) as failedSubjects
      FROM students st
      JOIN classes c ON st.classId = c.id
      LEFT JOIN grades g ON st.id = g.studentId
      LEFT JOIN attendance a ON st.id = a.studentId 
        AND a.date >= NOW() - INTERVAL '30 days'
      WHERE st.status = 'ACTIVE'
      GROUP BY st.id, st.fullName, c.name
      HAVING AVG(g.score) < 6.5 OR COUNT(CASE WHEN a.status = 'ABSENT' THEN 1 END) > 5
      ORDER BY averageScore ASC
      LIMIT 10
    `;

    return {
      atRiskStudents,
      recommendations: [
        'Provide additional tutoring support',
        'Schedule parent-teacher conferences',
        'Monitor attendance closely',
        'Offer counseling services'
      ]
    };
  }
}

export { AnalyticsService };
