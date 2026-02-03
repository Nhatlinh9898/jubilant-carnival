import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import { prisma } from '@/index';

interface AuthenticatedSocket extends Socket {
  userId?: number;
  userRole?: string;
}

export class SocketService {
  private io: SocketIOServer;
  private connectedUsers: Map<number, string> = new Map();

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.CORS_ORIGIN || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
      }
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware() {
    // Authentication middleware
    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Authentication error'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        const user = await prisma.user.findUnique({
          where: { id: decoded.id },
          select: { id: true, role: true, fullName: true, isActive: true }
        });

        if (!user || !user.isActive) {
          return next(new Error('User not found or inactive'));
        }

        socket.userId = user.id;
        socket.userRole = user.role;
        next();
      } catch (error) {
        next(new Error('Authentication error'));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      console.log(`User ${socket.userId} connected with role ${socket.userRole}`);
      
      // Store user connection
      if (socket.userId) {
        this.connectedUsers.set(socket.userId, socket.id);
      }

      // Join user to their role-based room
      socket.join(`role:${socket.userRole}`);
      
      // Join user to their personal room
      if (socket.userId) {
        socket.join(`user:${socket.userId}`);
      }

      // Handle joining class/subject rooms
      socket.on('join:room', (roomData) => {
        const { type, id } = roomData;
        socket.join(`${type}:${id}`);
        console.log(`User ${socket.userId} joined room: ${type}:${id}`);
      });

      // Handle leaving rooms
      socket.on('leave:room', (roomData) => {
        const { type, id } = roomData;
        socket.leave(`${type}:${id}`);
        console.log(`User ${socket.userId} left room: ${type}:${id}`);
      });

      // Handle real-time chat
      socket.on('send:message', async (messageData) => {
        try {
          const { content, recipientId, type = 'direct' } = messageData;
          
          // Save message to database
          const message = await prisma.chatMessage.create({
            data: {
              senderId: socket.userId!,
              content,
              timestamp: new Date()
            },
            include: {
              sender: {
                select: {
                  id: true,
                  fullName: true,
                  avatar: true
                }
              }
            }
          });

          // Send to recipient
          if (recipientId) {
            this.io.to(`user:${recipientId}`).emit('new:message', message);
          }

          // Send confirmation to sender
          socket.emit('message:sent', message);

          // Send to admin room if needed
          if (type === 'support') {
            this.io.to('role:ADMIN').emit('new:message', message);
          }

        } catch (error) {
          socket.emit('error', { message: 'Failed to send message' });
        }
      });

      // Handle typing indicators
      socket.on('typing:start', (data) => {
        const { recipientId } = data;
        socket.to(`user:${recipientId}`).emit('user:typing', {
          userId: socket.userId,
          isTyping: true
        });
      });

      socket.on('typing:stop', (data) => {
        const { recipientId } = data;
        socket.to(`user:${recipientId}`).emit('user:typing', {
          userId: socket.userId,
          isTyping: false
        });
      });

      // Handle online status
      socket.on('get:online:users', async () => {
        const onlineUserIds = Array.from(this.connectedUsers.keys());
        const onlineUsers = await prisma.user.findMany({
          where: {
            id: { in: onlineUserIds },
            isActive: true
          },
          select: {
            id: true,
            fullName: true,
            role: true,
            avatar: true
          }
        });
        
        socket.emit('online:users', onlineUsers);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`User ${socket.userId} disconnected`);
        if (socket.userId) {
          this.connectedUsers.delete(socket.userId);
          
          // Notify others that user went offline
          socket.broadcast.emit('user:offline', {
            userId: socket.userId
          });
        }
      });
    });
  }

  // Public methods for sending notifications
  public sendNotification(userId: number, notification: any) {
    this.io.to(`user:${userId}`).emit('new:notification', notification);
  }

  public sendToRole(role: string, event: string, data: any) {
    this.io.to(`role:${role}`).emit(event, data);
  }

  public sendToRoom(room: string, event: string, data: any) {
    this.io.to(room).emit(event, data);
  }

  public broadcast(event: string, data: any) {
    this.io.emit(event, data);
  }

  public getOnlineUserCount(): number {
    return this.connectedUsers.size;
  }

  public isUserOnline(userId: number): boolean {
    return this.connectedUsers.has(userId);
  }
}

// Notification service
export class NotificationService {
  private socketService: SocketService;

  constructor(socketService: SocketService) {
    this.socketService = socketService;
  }

  async sendNotification(userId: number, title: string, message: string, type: string = 'info') {
    try {
      // Save to database
      const notification = await prisma.notification.create({
        data: {
          userId,
          title,
          message,
          isRead: false
        }
      });

      // Send real-time notification if user is online
      if (this.socketService.isUserOnline(userId)) {
        this.socketService.sendNotification(userId, {
          id: notification.id,
          title,
          message,
          type,
          timestamp: notification.createdAt
        });
      }

      return notification;
    } catch (error) {
      console.error('Failed to send notification:', error);
      throw error;
    }
  }

  async sendToRole(role: string, title: string, message: string, type: string = 'info') {
    try {
      // Get all users with the specified role
      const users = await prisma.user.findMany({
        where: { role, isActive: true },
        select: { id: true }
      });

      // Create notifications for all users
      const notifications = await Promise.all(
        users.map(user =>
          prisma.notification.create({
            data: {
              userId: user.id,
              title,
              message,
              isRead: false
            }
          })
        )
      );

      // Send real-time notifications to online users
      this.socketService.sendToRole(role, 'new:notification', {
        title,
        message,
        type,
        timestamp: new Date()
      });

      return notifications;
    } catch (error) {
      console.error('Failed to send role notification:', error);
      throw error;
    }
  }

  async sendToClass(classId: number, title: string, message: string, type: string = 'info') {
    try {
      // Get all students in the class
      const students = await prisma.student.findMany({
        where: { classId },
        include: {
          user: {
            select: { id: true, isActive: true }
          }
        }
      });

      const activeStudents = students.filter(student => student.user.isActive);

      // Create notifications
      const notifications = await Promise.all(
        activeStudents.map(student =>
          prisma.notification.create({
            data: {
              userId: student.user.id,
              title,
              message,
              isRead: false
            }
          })
        )
      );

      // Send real-time notifications
      this.socketService.sendToRoom(`class:${classId}`, 'new:notification', {
        title,
        message,
        type,
        timestamp: new Date()
      });

      return notifications;
    } catch (error) {
      console.error('Failed to send class notification:', error);
      throw error;
    }
  }
}

export { SocketService, NotificationService };
