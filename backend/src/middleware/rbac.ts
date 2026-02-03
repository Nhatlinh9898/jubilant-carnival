import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '@/index';

// Define permissions
export enum Permission {
  // User Management
  USER_READ = 'user:read',
  USER_WRITE = 'user:write',
  USER_DELETE = 'user:delete',
  
  // Student Management
  STUDENT_READ = 'student:read',
  STUDENT_WRITE = 'student:write',
  STUDENT_DELETE = 'student:delete',
  
  // Teacher Management
  TEACHER_READ = 'teacher:read',
  TEACHER_WRITE = 'teacher:write',
  TEACHER_DELETE = 'teacher:delete',
  
  // Class Management
  CLASS_READ = 'class:read',
  CLASS_WRITE = 'class:write',
  CLASS_DELETE = 'class:delete',
  
  // Academic Management
  GRADE_READ = 'grade:read',
  GRADE_WRITE = 'grade:write',
  ATTENDANCE_READ = 'attendance:read',
  ATTENDANCE_WRITE = 'attendance:write',
  SCHEDULE_READ = 'schedule:read',
  SCHEDULE_WRITE = 'schedule:write',
  
  // Financial Management
  FINANCE_READ = 'finance:read',
  FINANCE_WRITE = 'finance:write',
  
  // System Administration
  SYSTEM_ADMIN = 'system:admin',
  SYSTEM_CONFIG = 'system:config',
  
  // Reports
  REPORT_READ = 'report:read',
  REPORT_GENERATE = 'report:generate',
  
  // Communication
  COMMUNICATION_READ = 'communication:read',
  COMMUNICATION_WRITE = 'communication:write',
  
  // Analytics
  ANALYTICS_READ = 'analytics:read',
  ANALYTICS_ADVANCED = 'analytics:advanced'
}

// Role permissions mapping
export const ROLE_PERMISSIONS = {
  ADMIN: [
    Permission.USER_READ,
    Permission.USER_WRITE,
    Permission.USER_DELETE,
    Permission.STUDENT_READ,
    Permission.STUDENT_WRITE,
    Permission.STUDENT_DELETE,
    Permission.TEACHER_READ,
    Permission.TEACHER_WRITE,
    Permission.TEACHER_DELETE,
    Permission.CLASS_READ,
    Permission.CLASS_WRITE,
    Permission.CLASS_DELETE,
    Permission.GRADE_READ,
    Permission.GRADE_WRITE,
    Permission.ATTENDANCE_READ,
    Permission.ATTENDANCE_WRITE,
    Permission.SCHEDULE_READ,
    Permission.SCHEDULE_WRITE,
    Permission.FINANCE_READ,
    Permission.FINANCE_WRITE,
    Permission.SYSTEM_ADMIN,
    Permission.SYSTEM_CONFIG,
    Permission.REPORT_READ,
    Permission.REPORT_GENERATE,
    Permission.COMMUNICATION_READ,
    Permission.COMMUNICATION_WRITE,
    Permission.ANALYTICS_READ,
    Permission.ANALYTICS_ADVANCED
  ],
  TEACHER: [
    Permission.STUDENT_READ,
    Permission.GRADE_READ,
    Permission.GRADE_WRITE,
    Permission.ATTENDANCE_READ,
    Permission.ATTENDANCE_WRITE,
    Permission.SCHEDULE_READ,
    Permission.CLASS_READ,
    Permission.REPORT_READ,
    Permission.REPORT_GENERATE,
    Permission.COMMUNICATION_READ,
    Permission.COMMUNICATION_WRITE,
    Permission.ANALYTICS_READ
  ],
  STUDENT: [
    Permission.GRADE_READ,
    Permission.ATTENDANCE_READ,
    Permission.SCHEDULE_READ,
    Permission.CLASS_READ,
    Permission.REPORT_READ,
    Permission.COMMUNICATION_READ,
    Permission.ANALYTICS_READ
  ]
};

// Resource ownership types
export enum OwnershipType {
  OWN = 'own',
  CLASS = 'class',
  DEPARTMENT = 'department',
  SCHOOL = 'school'
}

// Middleware to check if user is authenticated
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        role: true,
        fullName: true,
        isActive: true
      }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or inactive user'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
};

// Middleware to check permissions
export const authorize = (permissions: Permission | Permission[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const userPermissions = ROLE_PERMISSIONS[req.user.role as keyof typeof ROLE_PERMISSIONS] || [];
    const requiredPermissions = Array.isArray(permissions) ? permissions : [permissions];

    const hasPermission = requiredPermissions.every(permission =>
      userPermissions.includes(permission)
    );

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
        required: requiredPermissions,
        userRole: req.user.role
      });
    }

    next();
  };
};

// Middleware to check resource ownership
export const checkOwnership = (resourceType: OwnershipType, resourceIdParam: string = 'id') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const resourceId = parseInt(req.params[resourceIdParam]);
      const userId = req.user!.id;
      const userRole = req.user!.role;

      let isOwner = false;

      switch (resourceType) {
        case OwnershipType.OWN:
          isOwner = resourceId === userId;
          break;
          
        case OwnershipType.CLASS:
          // Teachers can access their own classes
          if (userRole === 'TEACHER') {
            const teacherClass = await prisma.class.findFirst({
              where: {
                id: resourceId,
                homeroomTeacherId: userId
              }
            });
            isOwner = !!teacherClass;
          }
          // Admins can access all classes
          else if (userRole === 'ADMIN') {
            isOwner = true;
          }
          break;
          
        case OwnershipType.DEPARTMENT:
          // Department-based access logic
          if (userRole === 'ADMIN') {
            isOwner = true;
          }
          // Add department-specific logic for other roles
          break;
          
        case OwnershipType.SCHOOL:
          // All authenticated users can access school-wide resources
          isOwner = true;
          break;
      }

      if (!isOwner) {
        return res.status(403).json({
          success: false,
          error: 'Access denied: insufficient ownership rights'
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Error checking ownership'
      });
    }
  };
};

// Middleware to check if user can access specific student data
export const canAccessStudent = (studentIdParam: string = 'studentId') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const studentId = parseInt(req.params[studentIdParam]);
      const userId = req.user!.id;
      const userRole = req.user!.role;

      let canAccess = false;

      switch (userRole) {
        case 'ADMIN':
          canAccess = true;
          break;
          
        case 'TEACHER':
          // Check if student is in teacher's class
          const student = await prisma.student.findUnique({
            where: { id: studentId },
            include: {
              class: {
                include: {
                  homeroomTeacher: true
                }
              }
            }
          });
          
          if (student && student.class.homeroomTeacherId === userId) {
            canAccess = true;
          }
          break;
          
        case 'STUDENT':
          // Students can only access their own data
          canAccess = studentId === userId;
          break;
      }

      if (!canAccess) {
        return res.status(403).json({
          success: false,
          error: 'Access denied: cannot access student data'
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Error checking student access'
      });
    }
  };
};

// Middleware to check if user can access class data
export const canAccessClass = (classIdParam: string = 'classId') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const classId = parseInt(req.params[classIdParam]);
      const userId = req.user!.id;
      const userRole = req.user!.role;

      let canAccess = false;

      switch (userRole) {
        case 'ADMIN':
          canAccess = true;
          break;
          
        case 'TEACHER':
          // Check if teacher is homeroom teacher or teaches the class
          const classInfo = await prisma.class.findUnique({
            where: { id: classId },
            include: {
              homeroomTeacher: true
            }
          });
          
          if (classInfo && classInfo.homeroomTeacherId === userId) {
            canAccess = true;
          }
          break;
          
        case 'STUDENT':
          // Check if student is enrolled in the class
          const student = await prisma.student.findFirst({
            where: {
              id: userId,
              classId
            }
          });
          
          canAccess = !!student;
          break;
      }

      if (!canAccess) {
        return res.status(403).json({
          success: false,
          error: 'Access denied: cannot access class data'
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Error checking class access'
      });
    }
  };
};

// Middleware to check if user has specific role
export const hasRole = (roles: string | string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const userRole = req.user.role;
    const requiredRoles = Array.isArray(roles) ? roles : [roles];
    const hasRequiredRole = requiredRoles.includes(userRole);

    if (!hasRequiredRole) {
      return res.status(403).json({
        success: false,
        error: 'Access denied: insufficient role',
        required: requiredRoles,
        userRole
      });
    }

    next();
  };
};

// Middleware to check if user is admin or the resource owner
export const isAdminOrOwner = (resourceType: OwnershipType, resourceIdParam: string = 'id') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userRole = req.user!.role;
      
      if (userRole === 'ADMIN') {
        return next();
      }
      
      // Use ownership check for non-admin users
      return checkOwnership(resourceType, resourceIdParam)(req, res, next);
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Error checking admin or ownership'
      });
    }
  };
};

// Middleware to rate limit based on user role
export const rateLimitByRole = (limits: Record<string, { windowMs: number; max: number }>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user?.role || 'ANONYMOUS';
    const limit = limits[userRole] || limits['ANONYMOUS'];
    
    // This would integrate with your rate limiting middleware
    // For now, just pass through
    next();
  };
};

// Helper function to check if user has permission
export const hasPermission = (userRole: string, permission: Permission): boolean => {
  const userPermissions = ROLE_PERMISSIONS[userRole as keyof typeof ROLE_PERMISSIONS] || [];
  return userPermissions.includes(permission);
};

// Helper function to get user permissions
export const getUserPermissions = (userRole: string): Permission[] => {
  return ROLE_PERMISSIONS[userRole as keyof typeof ROLE_PERMISSIONS] || [];
};

export {
  Permission,
  OwnershipType,
  ROLE_PERMISSIONS,
  authenticate,
  authorize,
  checkOwnership,
  canAccessStudent,
  canAccessClass,
  hasRole,
  isAdminOrOwner,
  rateLimitByRole,
  hasPermission,
  getUserPermissions
};
