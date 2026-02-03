import { User, UserRole } from '@/types';
import { prisma } from '@/index';

export class UserModel {
  // Find user by ID
  static async findById(id: number): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        avatar: true,
        phone: true,
        address: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });
  }

  // Find user by email
  static async findByEmail(email: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        avatar: true,
        phone: true,
        address: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });
  }

  // Find user with password (for authentication)
  static async findByEmailWithPassword(email: string): Promise<User & { password: string } | null> {
    return await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        fullName: true,
        role: true,
        avatar: true,
        phone: true,
        address: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });
  }

  // Create new user
  static async create(userData: {
    email: string;
    password: string;
    fullName: string;
    role: UserRole;
    phone?: string;
    address?: string;
  }): Promise<User> {
    return await prisma.user.create({
      data: userData,
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        avatar: true,
        phone: true,
        address: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });
  }

  // Update user
  static async update(id: number, updateData: {
    fullName?: string;
    phone?: string;
    address?: string;
    avatar?: string;
    isActive?: boolean;
  }): Promise<User> {
    return await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        avatar: true,
        phone: true,
        address: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });
  }

  // Update password
  static async updatePassword(id: number, password: string): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: { password }
    });
  }

  // Delete user
  static async delete(id: number): Promise<void> {
    await prisma.user.delete({
      where: { id }
    });
  }

  // Get all users with filtering
  static async findAll(filters: {
    page?: number;
    limit?: number;
    search?: string;
    role?: UserRole;
    isActive?: boolean;
  } = {}): Promise<{
    users: User[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 10, search, role, isActive } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (role) where.role = role;
    if (isActive !== undefined) where.isActive = isActive;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          avatar: true,
          phone: true,
          address: true,
          isActive: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.user.count({ where })
    ]);

    return {
      users,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  // Get user statistics
  static async getStats(): Promise<{
    total: number;
    active: number;
    byRole: Record<UserRole, number>;
  }> {
    const [total, active, roleStats] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.groupBy({
        by: ['role'],
        _count: true
      })
    ]);

    const byRole = roleStats.reduce((acc, stat) => {
      acc[stat.role as UserRole] = stat._count;
      return acc;
    }, {} as Record<UserRole, number>);

    // Ensure all roles are present
    Object.values(UserRole).forEach(role => {
      if (!byRole[role]) byRole[role] = 0;
    });

    return {
      total,
      active,
      byRole
    };
  }

  // Check if email exists
  static async emailExists(email: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true }
    });
    return !!user;
  }

  // Get users by role
  static async findByRole(role: UserRole): Promise<User[]> {
    return await prisma.user.findMany({
      where: { role, isActive: true },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        avatar: true,
        phone: true,
        address: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { fullName: 'asc' }
    });
  }

  // Search users
  static async search(query: string, limit: number = 10): Promise<User[]> {
    return await prisma.user.findMany({
      where: {
        OR: [
          { fullName: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } }
        ],
        isActive: true
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        avatar: true,
        phone: true,
        address: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      },
      take: limit,
      orderBy: { fullName: 'asc' }
    });
  }

  // Get active users count
  static async getActiveCount(): Promise<number> {
    return await prisma.user.count({
      where: { isActive: true }
    });
  }

  // Deactivate user
  static async deactivate(id: number): Promise<User> {
    return await prisma.user.update({
      where: { id },
      data: { isActive: false },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        avatar: true,
        phone: true,
        address: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });
  }

  // Activate user
  static async activate(id: number): Promise<User> {
    return await prisma.user.update({
      where: { id },
      data: { isActive: true },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        avatar: true,
        phone: true,
        address: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });
  }

  // Get recently created users
  static async getRecent(limit: number = 5): Promise<User[]> {
    return await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        avatar: true,
        phone: true,
        address: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
  }
}

export { UserModel };
