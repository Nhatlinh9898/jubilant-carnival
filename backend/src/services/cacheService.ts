import Redis from 'ioredis';

interface CacheOptions {
  ttl?: number; // Time to live in seconds
  prefix?: string;
}

export class CacheService {
  private redis: Redis;
  private defaultTTL: number = 3600; // 1 hour
  private keyPrefix: string = 'edumanager:';

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true
    });

    // Handle Redis events
    this.redis.on('connect', () => {
      console.log('Redis connected successfully');
    });

    this.redis.on('error', (err) => {
      console.error('Redis connection error:', err);
    });

    this.redis.on('close', () => {
      console.log('Redis connection closed');
    });
  }

  // Generate cache key
  private generateKey(key: string, prefix?: string): string {
    const keyPrefix = prefix || this.keyPrefix;
    return `${keyPrefix}${key}`;
  }

  // Set cache value
  async set(key: string, value: any, options: CacheOptions = {}): Promise<void> {
    try {
      const cacheKey = this.generateKey(key, options.prefix);
      const ttl = options.ttl || this.defaultTTL;
      const serializedValue = JSON.stringify(value);

      await this.redis.setex(cacheKey, ttl, serializedValue);
    } catch (error) {
      console.error('Cache set error:', error);
      throw new Error(`Failed to set cache: ${error}`);
    }
  }

  // Get cache value
  async get<T>(key: string, options: CacheOptions = {}): Promise<T | null> {
    try {
      const cacheKey = this.generateKey(key, options.prefix);
      const value = await this.redis.get(cacheKey);

      if (value === null) {
        return null;
      }

      return JSON.parse(value) as T;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  // Delete cache key
  async del(key: string, options: CacheOptions = {}): Promise<void> {
    try {
      const cacheKey = this.generateKey(key, options.prefix);
      await this.redis.del(cacheKey);
    } catch (error) {
      console.error('Cache delete error:', error);
      throw new Error(`Failed to delete cache: ${error}`);
    }
  }

  // Check if key exists
  async exists(key: string, options: CacheOptions = {}): Promise<boolean> {
    try {
      const cacheKey = this.generateKey(key, options.prefix);
      const result = await this.redis.exists(cacheKey);
      return result === 1;
    } catch (error) {
      console.error('Cache exists error:', error);
      return false;
    }
  }

  // Set cache with expiration
  async expire(key: string, ttl: number, options: CacheOptions = {}): Promise<void> {
    try {
      const cacheKey = this.generateKey(key, options.prefix);
      await this.redis.expire(cacheKey, ttl);
    } catch (error) {
      console.error('Cache expire error:', error);
      throw new Error(`Failed to set cache expiration: ${error}`);
    }
  }

  // Get cache TTL
  async ttl(key: string, options: CacheOptions = {}): Promise<number> {
    try {
      const cacheKey = this.generateKey(key, options.prefix);
      return await this.redis.ttl(cacheKey);
    } catch (error) {
      console.error('Cache TTL error:', error);
      return -1;
    }
  }

  // Increment cache value
  async incr(key: string, options: CacheOptions = {}): Promise<number> {
    try {
      const cacheKey = this.generateKey(key, options.prefix);
      return await this.redis.incr(cacheKey);
    } catch (error) {
      console.error('Cache increment error:', error);
      throw new Error(`Failed to increment cache: ${error}`);
    }
  }

  // Increment cache value by amount
  async incrby(key: string, amount: number, options: CacheOptions = {}): Promise<number> {
    try {
      const cacheKey = this.generateKey(key, options.prefix);
      return await this.redis.incrby(cacheKey, amount);
    } catch (error) {
      console.error('Cache increment by error:', error);
      throw new Error(`Failed to increment cache by: ${error}`);
    }
  }

  // Set multiple values
  async mset(keyValues: Record<string, any>, options: CacheOptions = {}): Promise<void> {
    try {
      const ttl = options.ttl || this.defaultTTL;
      const pipeline = this.redis.pipeline();

      Object.entries(keyValues).forEach(([key, value]) => {
        const cacheKey = this.generateKey(key, options.prefix);
        const serializedValue = JSON.stringify(value);
        pipeline.setex(cacheKey, ttl, serializedValue);
      });

      await pipeline.exec();
    } catch (error) {
      console.error('Cache mset error:', error);
      throw new Error(`Failed to set multiple cache values: ${error}`);
    }
  }

  // Get multiple values
  async mget<T>(keys: string[], options: CacheOptions = {}): Promise<(T | null)[]> {
    try {
      const cacheKeys = keys.map(key => this.generateKey(key, options.prefix));
      const values = await this.redis.mget(cacheKeys);

      return values.map(value => {
        if (value === null) return null;
        try {
          return JSON.parse(value) as T;
        } catch {
          return null;
        }
      });
    } catch (error) {
      console.error('Cache mget error:', error);
      return keys.map(() => null);
    }
  }

  // Clear all cache with prefix
  async clear(prefix?: string): Promise<void> {
    try {
      const searchPrefix = this.generateKey('*', prefix);
      const keys = await this.redis.keys(searchPrefix);

      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      console.error('Cache clear error:', error);
      throw new Error(`Failed to clear cache: ${error}`);
    }
  }

  // Cache wrapper for functions
  async memoize<T>(
    key: string,
    fn: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    // Try to get from cache first
    const cached = await this.get<T>(key, options);
    if (cached !== null) {
      return cached;
    }

    // Execute function and cache result
    const result = await fn();
    await this.set(key, result, options);
    return result;
  }

  // Cache invalidation patterns
  async invalidateUserCache(userId: number): Promise<void> {
    const patterns = [
      `user:${userId}:*`,
      `student:${userId}:*`,
      `teacher:${userId}:*`,
      `notifications:${userId}:*`,
      `permissions:${userId}:*`
    ];

    for (const pattern of patterns) {
      await this.clear(pattern);
    }
  }

  async invalidateClassCache(classId: number): Promise<void> {
    const patterns = [
      `class:${classId}:*`,
      `students:class:${classId}:*`,
      `schedule:class:${classId}:*`,
      `attendance:class:${classId}:*`
    ];

    for (const pattern of patterns) {
      await this.clear(pattern);
    }
  }

  async invalidateSubjectCache(subjectId: number): Promise<void> {
    const patterns = [
      `subject:${subjectId}:*`,
      `grades:subject:${subjectId}:*`,
      `schedule:subject:${subjectId}:*`
    ];

    for (const pattern of patterns) {
      await this.clear(pattern);
    }
  }

  // Cache statistics
  async getStats(): Promise<any> {
    try {
      const info = await this.redis.info();
      const keyspace = await this.redis.info('keyspace');

      return {
        connected: this.redis.status === 'ready',
        info: this.parseRedisInfo(info),
        keyspace: this.parseRedisInfo(keyspace)
      };
    } catch (error) {
      console.error('Cache stats error:', error);
      return {
        connected: false,
        error: error
      };
    }
  }

  // Parse Redis info response
  private parseRedisInfo(info: string): Record<string, any> {
    const lines = info.split('\r\n');
    const parsed: Record<string, any> = {};

    lines.forEach(line => {
      if (line && !line.startsWith('#')) {
        const [key, value] = line.split(':');
        if (key && value) {
          parsed[key] = isNaN(Number(value)) ? value : Number(value);
        }
      }
    });

    return parsed;
  }

  // Health check
  async healthCheck(): Promise<{ status: string; latency?: number }> {
    try {
      const start = Date.now();
      await this.redis.ping();
      const latency = Date.now() - start;

      return {
        status: 'healthy',
        latency
      };
    } catch (error) {
      return {
        status: 'unhealthy'
      };
    }
  }

  // Close Redis connection
  async disconnect(): Promise<void> {
    try {
      await this.redis.quit();
    } catch (error) {
      console.error('Redis disconnect error:', error);
    }
  }

  // Cache warming utilities
  async warmUserCache(userId: number): Promise<void> {
    try {
      // Warm user profile
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          avatar: true,
          phone: true,
          address: true,
          isActive: true
        }
      });

      if (user) {
        await this.set(`user:${userId}:profile`, user, { ttl: 1800 }); // 30 minutes
      }

      // Warm user permissions
      const permissions = this.getUserPermissions(user?.role || 'STUDENT');
      await this.set(`permissions:${userId}`, permissions, { ttl: 1800 });

      // Warm notifications
      const notifications = await prisma.notification.findMany({
        where: { userId, isRead: false },
        orderBy: { createdAt: 'desc' },
        take: 10
      });

      await this.set(`notifications:${userId}`, notifications, { ttl: 300 }); // 5 minutes

    } catch (error) {
      console.error('Cache warming error:', error);
    }
  }

  // Get user permissions (helper method)
  private getUserPermissions(role: string): string[] {
    const permissions = {
      ADMIN: [
        'user:read', 'user:write', 'user:delete',
        'student:read', 'student:write', 'student:delete',
        'teacher:read', 'teacher:write', 'teacher:delete',
        'class:read', 'class:write', 'class:delete',
        'grade:read', 'grade:write',
        'attendance:read', 'attendance:write',
        'schedule:read', 'schedule:write',
        'finance:read', 'finance:write',
        'system:admin', 'system:config',
        'report:read', 'report:generate',
        'communication:read', 'communication:write',
        'analytics:read', 'analytics:advanced'
      ],
      TEACHER: [
        'student:read',
        'grade:read', 'grade:write',
        'attendance:read', 'attendance:write',
        'schedule:read',
        'class:read',
        'report:read', 'report:generate',
        'communication:read', 'communication:write',
        'analytics:read'
      ],
      STUDENT: [
        'grade:read',
        'attendance:read',
        'schedule:read',
        'class:read',
        'report:read',
        'communication:read',
        'analytics:read'
      ]
    };

    return permissions[role as keyof typeof permissions] || [];
  }
}

// Create singleton instance
export const cacheService = new CacheService();

// Cache middleware for Express
export const cacheMiddleware = (options: {
  key: string;
  ttl?: number;
  prefix?: string;
}) => {
  return async (req: any, res: any, next: any) => {
    const cacheKey = `${options.key}:${req.method}:${req.originalUrl}`;
    
    try {
      const cached = await cacheService.get(cacheKey, options);
      
      if (cached) {
        res.set('X-Cache', 'HIT');
        return res.json(cached);
      }
      
      // Override res.json to cache the response
      const originalJson = res.json;
      res.json = function(data: any) {
        // Only cache successful responses
        if (res.statusCode === 200) {
          cacheService.set(cacheKey, data, options);
          res.set('X-Cache', 'MISS');
        }
        return originalJson.call(this, data);
      };
      
    } catch (error) {
      console.error('Cache middleware error:', error);
    }
    
    next();
  };
};

export { CacheService, cacheService };
