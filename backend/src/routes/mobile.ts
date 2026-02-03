import express from 'express';
import { prisma } from '@/index';
import { authenticate, authorize, canAccessStudent } from '@/middleware/rbac';
import { Permission } from '@/middleware/rbac';

const router = express.Router();

// Mobile-specific middleware for device detection
const detectMobileDevice = (req: any, res: any, next: any) => {
  const userAgent = req.headers['user-agent'] || '';
  const isMobile = /Mobile|Android|iPhone|iPad|iPod/i.test(userAgent);
  
  req.isMobile = isMobile;
  req.deviceInfo = {
    userAgent,
    platform: isMobile ? 'mobile' : 'web',
    timestamp: new Date()
  };
  
  next();
};

// Apply mobile detection to all mobile routes
router.use(detectMobileDevice);

// Mobile Dashboard - Optimized for mobile
router.get('/dashboard', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let dashboardData: any = {};

    switch (userRole) {
      case 'STUDENT':
        dashboardData = await getStudentMobileDashboard(userId);
        break;
      case 'TEACHER':
        dashboardData = await getTeacherMobileDashboard(userId);
        break;
      case 'ADMIN':
        dashboardData = await getAdminMobileDashboard();
        break;
    }

    res.json({
      success: true,
      data: {
        ...dashboardData,
        deviceInfo: req.deviceInfo,
        lastUpdated: new Date()
      }
    });
  } catch (error) {
    next(error);
  }
});

// Student Mobile Dashboard
async function getStudentMobileDashboard(studentId: number) {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      user: {
        select: { fullName: true, email: true, avatar: true }
      },
      class: {
        select: { name: true, gradeLevel: true }
      },
      grades: {
        include: {
          subject: {
            select: { name: true, color: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      },
      attendance: {
        where: {
          date: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        },
        orderBy: { date: 'desc' },
        take: 5
      }
    }
  });

  if (!student) throw new Error('Student not found');

  // Calculate attendance rate
  const attendanceCount = student.attendance.filter(a => a.status === 'PRESENT').length;
  const attendanceRate = student.attendance.length > 0 ? (attendanceCount / student.attendance.length) * 100 : 0;

  // Calculate average grade
  const averageGrade = student.grades.length > 0 
    ? student.grades.reduce((sum, grade) => sum + grade.score, 0) / student.grades.length 
    : 0;

  // Get upcoming events
  const upcomingEvents = await prisma.schoolEvent.findMany({
    where: {
      date: {
        gte: new Date()
      },
      isActive: true
    },
    orderBy: { date: 'asc' },
    take: 3
  });

  // Get unread notifications
  const unreadNotifications = await prisma.notification.findMany({
    where: {
      userId: studentId,
      isRead: false
    },
    orderBy: { createdAt: 'desc' },
    take: 5
  });

  return {
    user: student.user,
    class: student.class,
    stats: {
      attendanceRate: Math.round(attendanceRate),
      averageGrade: Math.round(averageGrade * 10) / 10,
      totalGrades: student.grades.length,
      unreadNotifications: unreadNotifications.length
    },
    recentGrades: student.grades,
    recentAttendance: student.attendance,
    upcomingEvents,
    notifications: unreadNotifications
  };
}

// Teacher Mobile Dashboard
async function getTeacherMobileDashboard(teacherId: number) {
  const teacher = await prisma.teacher.findUnique({
    where: { id: teacherId },
    include: {
      user: {
        select: { fullName: true, email: true, avatar: true }
      },
      classes: {
        include: {
          students: {
            select: { id: true }
          }
        }
      },
      subjects: true
    }
  });

  if (!teacher) throw new Error('Teacher not found');

  // Get today's schedule
  const today = new Date();
  const dayOfWeek = today.getDay() === 0 ? 7 : today.getDay(); // Convert Sunday to 7
  
  const todaySchedule = await prisma.schedule.findMany({
    where: {
      teacherId,
      day: dayOfWeek
    },
    include: {
      subject: {
        select: { name: true, color: true }
      },
      class: {
        select: { name: true }
      }
    },
    orderBy: { period: 'asc' }
  });

  // Get recent attendance for today
  const todayAttendance = await prisma.attendance.findMany({
    where: {
      date: {
        gte: new Date(today.setHours(0, 0, 0, 0)),
        lt: new Date(today.setHours(23, 59, 59, 999))
      }
    },
    include: {
      student: {
        include: {
          class: {
            select: { name: true }
          }
        }
      }
    },
    take: 10
  });

  // Get unread notifications
  const unreadNotifications = await prisma.notification.findMany({
    where: {
      userId: teacherId,
      isRead: false
    },
    orderBy: { createdAt: 'desc' },
    take: 5
  });

  // Calculate total students
  const totalStudents = teacher.classes.reduce((sum, cls) => sum + cls.students.length, 0);

  return {
    user: teacher.user,
    stats: {
      totalClasses: teacher.classes.length,
      totalSubjects: teacher.subjects.length,
      totalStudents,
      todaySchedule: todaySchedule.length,
      unreadNotifications: unreadNotifications.length
    },
    todaySchedule,
    todayAttendance,
    notifications: unreadNotifications
  };
}

// Admin Mobile Dashboard
async function getAdminMobileDashboard() {
  const [
    totalStudents,
    totalTeachers,
    totalClasses,
    activeUsers,
    todayAttendance,
    recentNotifications
  ] = await Promise.all([
    prisma.student.count({ where: { status: 'ACTIVE' } }),
    prisma.teacher.count({ where: { isActive: true } }),
    prisma.class.count({ where: { isActive: true } }),
    prisma.user.count({ where: { isActive: true } }),
    prisma.attendance.count({
      where: {
        date: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    }),
    prisma.notification.findMany({
      where: { isRead: false },
      orderBy: { createdAt: 'desc' },
      take: 5
    })
  ]);

  return {
    stats: {
      totalStudents,
      totalTeachers,
      totalClasses,
      activeUsers,
      todayAttendance,
      unreadNotifications: recentNotifications.length
    },
    notifications: recentNotifications
  };
}

// Mobile Attendance - Quick check-in
router.post('/attendance/checkin', authenticate, authorize([Permission.ATTENDANCE_WRITE]), async (req, res, next) => {
  try {
    const { studentIds, status, notes } = req.body;
    const teacherId = req.user.id;
    const date = new Date();

    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Student IDs array is required'
      });
    }

    // Validate status
    const validStatuses = ['PRESENT', 'ABSENT', 'LATE'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be PRESENT, ABSENT, or LATE'
      });
    }

    // Batch create attendance records
    const attendanceRecords = await Promise.all(
      studentIds.map(studentId =>
        prisma.attendance.upsert({
          where: {
            studentId_date: {
              studentId,
              date
            }
          },
          update: {
            status,
            notes: notes || ''
          },
          create: {
            studentId,
            date,
            status,
            notes: notes || ''
          }
        })
      )
    );

    res.json({
      success: true,
      data: {
        checkedIn: attendanceRecords.length,
        date,
        status,
        records: attendanceRecords
      }
    });
  } catch (error) {
    next(error);
  }
});

// Mobile Grades - Quick grade entry
router.post('/grades/quick', authenticate, authorize([Permission.GRADE_WRITE]), async (req, res, next) => {
  try {
    const { studentId, subjectId, score, maxScore = 100, examType, semester } = req.body;
    const teacherId = req.user.id;

    // Validate input
    if (!studentId || !subjectId || score === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Student ID, subject ID, and score are required'
      });
    }

    if (score < 0 || score > maxScore) {
      return res.status(400).json({
        success: false,
        error: `Score must be between 0 and ${maxScore}`
      });
    }

    // Verify teacher has access to this subject
    const subject = await prisma.subject.findFirst({
      where: {
        id: subjectId,
        teacherId
      }
    });

    if (!subject) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to grade this subject'
      });
    }

    const grade = await prisma.grade.create({
      data: {
        studentId,
        subjectId,
        score,
        maxScore,
        examType: examType || 'QUIZ',
        semester: semester || '1'
      },
      include: {
        student: {
          include: {
            user: {
              select: { fullName: true }
            }
          }
        },
        subject: {
          select: { name: true }
        }
      }
    });

    res.json({
      success: true,
      data: grade
    });
  } catch (error) {
    next(error);
  }
});

// Mobile Notifications - Mark as read
router.put('/notifications/:id/read', authenticate, async (req, res, next) => {
  try {
    const notificationId = parseInt(req.params.id);
    const userId = req.user.id;

    const notification = await prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId
      },
      data: {
        isRead: true
      }
    });

    res.json({
      success: true,
      data: {
        markedAsRead: notification.count
      }
    });
  } catch (error) {
    next(error);
  }
});

// Mobile Notifications - Mark all as read
router.put('/notifications/read-all', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;

    const result = await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false
      },
      data: {
        isRead: true
      }
    });

    res.json({
      success: true,
      data: {
        markedAsRead: result.count
      }
    });
  } catch (error) {
    next(error);
  }
});

// Mobile Profile - Update
router.put('/profile', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { fullName, phone, address } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        fullName,
        phone,
        address
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        address: true,
        role: true,
        avatar: true
      }
    });

    res.json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
});

// Mobile Schedule - Today's schedule
router.get('/schedule/today', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const today = new Date();
    const dayOfWeek = today.getDay() === 0 ? 7 : today.getDay();

    let schedule: any[] = [];

    if (userRole === 'TEACHER') {
      schedule = await prisma.schedule.findMany({
        where: {
          teacherId: userId,
          day: dayOfWeek
        },
        include: {
          subject: {
            select: { name: true, color: true }
          },
          class: {
            select: { name: true }
          }
        },
        orderBy: { period: 'asc' }
      });
    } else if (userRole === 'STUDENT') {
      const student = await prisma.student.findUnique({
        where: { userId },
        include: {
          class: true
        }
      });

      if (student) {
        schedule = await prisma.schedule.findMany({
          where: {
            classId: student.classId,
            day: dayOfWeek
          },
          include: {
            subject: {
              select: { name: true, color: true }
            },
            teacher: {
              include: {
                user: {
                  select: { fullName: true }
                }
              }
            }
          },
          orderBy: { period: 'asc' }
        });
      }
    }

    res.json({
      success: true,
      data: {
        date: today,
        dayOfWeek,
        schedule
      }
    });
  } catch (error) {
    next(error);
  }
});

// Mobile Search - Quick search
router.get('/search', authenticate, async (req, res, next) => {
  try {
    const { q: query, type = 'all', limit = 10 } = req.query;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }

    const searchQuery = query.trim();
    const results: any = {};

    // Search students (for teachers and admins)
    if ((userRole === 'TEACHER' || userRole === 'ADMIN') && (type === 'all' || type === 'students')) {
      results.students = await prisma.student.findMany({
        where: {
          OR: [
            { fullName: { contains: searchQuery, mode: 'insensitive' } },
            { code: { contains: searchQuery, mode: 'insensitive' } }
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
        take: parseInt(limit as string)
      });
    }

    // Search teachers (for admins)
    if (userRole === 'ADMIN' && (type === 'all' || type === 'teachers')) {
      results.teachers = await prisma.teacher.findMany({
        where: {
          user: {
            OR: [
              { fullName: { contains: searchQuery, mode: 'insensitive' } },
              { email: { contains: searchQuery, mode: 'insensitive' } }
            ]
          }
        },
        include: {
          user: {
            select: { fullName: true, email: true, avatar: true }
          },
          subjects: {
            select: { name: true }
          }
        },
        take: parseInt(limit as string)
      });
    }

    // Search classes (for all roles)
    if (type === 'all' || type === 'classes') {
      results.classes = await prisma.class.findMany({
        where: {
          OR: [
            { name: { contains: searchQuery, mode: 'insensitive' } },
            { code: { contains: searchQuery, mode: 'insensitive' } }
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
        take: parseInt(limit as string)
      });
    }

    // Search subjects (for all roles)
    if (type === 'all' || type === 'subjects') {
      results.subjects = await prisma.subject.findMany({
        where: {
          OR: [
            { name: { contains: searchQuery, mode: 'insensitive' } },
            { code: { contains: searchQuery, mode: 'insensitive' } }
          ]
        },
        take: parseInt(limit as string)
      });
    }

    res.json({
      success: true,
      data: {
        query: searchQuery,
        type,
        results
      }
    });
  } catch (error) {
    next(error);
  }
});

// Mobile Device Registration
router.post('/device/register', authenticate, async (req, res, next) => {
  try {
    const { deviceToken, platform, deviceModel, appVersion } = req.body;
    const userId = req.user.id;

    // Store device token for push notifications
    // This would typically integrate with Firebase Cloud Messaging or similar service
    
    console.log(`Device registered for user ${userId}:`, {
      deviceToken,
      platform,
      deviceModel,
      appVersion
    });

    res.json({
      success: true,
      message: 'Device registered successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Mobile App Version Check
router.get('/version', async (req, res, next) => {
  try {
    const { platform } = req.query;
    
    // This would typically check against a database of app versions
    const versionInfo = {
      current: '1.0.0',
      minimum: '0.9.0',
      platform: platform || 'all',
      updateRequired: false,
      updateUrl: platform === 'ios' 
        ? 'https://apps.apple.com/app/edumanager'
        : 'https://play.google.com/store/apps/details?id=com.edumanager',
      releaseNotes: [
        'Bug fixes and performance improvements',
        'New mobile dashboard features',
        'Enhanced offline support'
      ]
    };

    res.json({
      success: true,
      data: versionInfo
    });
  } catch (error) {
    next(error);
  }
});

// Mobile Sync - Sync offline data
router.post('/sync', authenticate, async (req, res, next) => {
  try {
    const { lastSyncTime, dataType } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    const lastSync = lastSyncTime ? new Date(lastSyncTime) : new Date(0);
    
    let syncData: any = {};

    switch (dataType) {
      case 'grades':
        if (userRole === 'STUDENT') {
          syncData.grades = await prisma.grade.findMany({
            where: {
              student: { userId },
              createdAt: { gte: lastSync }
            },
            include: {
              subject: {
                select: { name: true, color: true }
              }
            }
          });
        }
        break;
        
      case 'attendance':
        if (userRole === 'STUDENT') {
          syncData.attendance = await prisma.attendance.findMany({
            where: {
              student: { userId },
              date: { gte: lastSync }
            }
          });
        }
        break;
        
      case 'notifications':
        syncData.notifications = await prisma.notification.findMany({
          where: {
            userId,
            createdAt: { gte: lastSync }
          },
          orderBy: { createdAt: 'desc' }
        });
        break;
        
      case 'schedule':
        // Get updated schedule since last sync
        if (userRole === 'TEACHER') {
          syncData.schedule = await prisma.schedule.findMany({
            where: {
              teacherId: userId,
              updatedAt: { gte: lastSync }
            },
            include: {
              subject: {
                select: { name: true, color: true }
              },
              class: {
                select: { name: true }
              }
            }
          });
        } else if (userRole === 'STUDENT') {
          const student = await prisma.student.findUnique({
            where: { userId },
            select: { classId: true }
          });
          
          if (student) {
            syncData.schedule = await prisma.schedule.findMany({
              where: {
                classId: student.classId,
                updatedAt: { gte: lastSync }
              },
              include: {
                subject: {
                  select: { name: true, color: true }
                },
                teacher: {
                  include: {
                    user: {
                      select: { fullName: true }
                    }
                  }
                }
              }
            });
          }
        }
        break;
    }

    res.json({
      success: true,
      data: {
        lastSyncTime: new Date().toISOString(),
        dataType,
        records: syncData
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
