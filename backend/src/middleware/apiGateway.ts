import { Request, Response, NextFunction } from 'express';
import { cacheService } from '../services/cacheService';
import { auditService } from '../services/auditService';

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: Request) => string;
  onLimitReached?: (req: Request, res: Response) => void;
}

export interface APIGatewayConfig {
  rateLimit: RateLimitConfig;
  cors: {
    origin: string | string[];
    credentials: boolean;
    methods: string[];
    headers: string[];
  };
  security: {
    enableHelmet: boolean;
    enableCSRF: boolean;
    enableXSS: boolean;
  };
  monitoring: {
    enableMetrics: boolean;
    enableLogging: boolean;
    enableTracing: boolean;
  };
}

export class APIGateway {
  private config: APIGatewayConfig;
  private rateLimitStore: Map<string, { count: number; resetTime: number }> = new Map();

  constructor(config: APIGatewayConfig) {
    this.config = config;
    this.startCleanupInterval();
  }

  // Rate limiting middleware
  rateLimit(config?: Partial<RateLimitConfig>) {
    const rateLimitConfig = { ...this.config.rateLimit, ...config };

    return (req: Request, res: Response, next: NextFunction) => {
      try {
        const key = rateLimitConfig.keyGenerator 
          ? rateLimitConfig.keyGenerator(req)
          : this.generateKey(req);

        const now = Date.now();
        const windowStart = now - rateLimitConfig.windowMs;

        // Clean up old entries
        this.cleanupOldEntries(windowStart);

        // Get or create rate limit entry
        let entry = this.rateLimitStore.get(key);
        if (!entry || entry.resetTime <= now) {
          entry = {
            count: 0,
            resetTime: now + rateLimitConfig.windowMs
          };
          this.rateLimitStore.set(key, entry);
        }

        // Check if limit exceeded
        if (entry.count >= rateLimitConfig.maxRequests) {
          const resetIn = Math.ceil((entry.resetTime - now) / 1000);
          
          res.set({
            'X-RateLimit-Limit': rateLimitConfig.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': entry.resetTime.toString(),
            'Retry-After': resetIn.toString()
          });

          if (rateLimitConfig.onLimitReached) {
            rateLimitConfig.onLimitReached(req, res);
          }

          return res.status(429).json({
            success: false,
            error: 'Too Many Requests',
            message: `Rate limit exceeded. Try again in ${resetIn} seconds.`,
            retryAfter: resetIn
          });
        }

        // Increment counter
        entry.count++;

        // Set rate limit headers
        res.set({
          'X-RateLimit-Limit': rateLimitConfig.maxRequests.toString(),
          'X-RateLimit-Remaining': (rateLimitConfig.maxRequests - entry.count).toString(),
          'X-RateLimit-Reset': entry.resetTime.toString()
        });

        // Log rate limit usage
        this.logRateLimitUsage(req, key, entry.count, rateLimitConfig.maxRequests);

        next();
      } catch (error) {
        console.error('Rate limiting error:', error);
        next();
      }
    };
  }

  // CORS middleware
  cors() {
    return (req: Request, res: Response, next: NextFunction) => {
      const { origin, credentials, methods, headers } = this.config.cors;

      // Set CORS headers
      if (typeof origin === 'string') {
        res.set('Access-Control-Allow-Origin', origin);
      } else if (Array.isArray(origin)) {
        const requestOrigin = req.headers.origin;
        if (requestOrigin && origin.includes(requestOrigin)) {
          res.set('Access-Control-Allow-Origin', requestOrigin);
        }
      }

      res.set('Access-Control-Allow-Credentials', credentials.toString());
      res.set('Access-Control-Allow-Methods', methods.join(', '));
      res.set('Access-Control-Allow-Headers', headers.join(', '));
      res.set('Access-Control-Max-Age', '86400'); // 24 hours

      // Handle preflight requests
      if (req.method === 'OPTIONS') {
        return res.status(204).end();
      }

      next();
    };
  }

  // Security headers middleware
  securityHeaders() {
    return (req: Request, res: Response, next: NextFunction) => {
      if (this.config.security.enableHelmet) {
        // Security headers
        res.set('X-Content-Type-Options', 'nosniff');
        res.set('X-Frame-Options', 'DENY');
        res.set('X-XSS-Protection', '1; mode=block');
        res.set('Referrer-Policy', 'strict-origin-when-cross-origin');
        res.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
        
        // HSTS (only in production)
        if (process.env.NODE_ENV === 'production') {
          res.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        }
      }

      if (this.config.security.enableXSS) {
        res.set('X-XSS-Protection', '1; mode=block');
        res.set('Content-Security-Policy', "default-src 'self'");
      }

      next();
    };
  }

  // Request validation middleware
  validateRequest(options: {
    maxBodySize?: number;
    allowedMethods?: string[];
    allowedContentTypes?: string[];
  } = {}) {
    const {
      maxBodySize = 10 * 1024 * 1024, // 10MB
      allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      allowedContentTypes = ['application/json', 'multipart/form-data', 'application/x-www-form-urlencoded']
    } = options;

    return (req: Request, res: Response, next: NextFunction) => {
      // Check method
      if (!allowedMethods.includes(req.method)) {
        return res.status(405).json({
          success: false,
          error: 'Method Not Allowed',
          message: `Method ${req.method} is not allowed`
        });
      }

      // Check content type
      if (req.method !== 'GET' && req.method !== 'DELETE') {
        const contentType = req.headers['content-type'];
        if (contentType && !allowedContentTypes.some(type => contentType.includes(type))) {
          return res.status(415).json({
            success: false,
            error: 'Unsupported Media Type',
            message: `Content type ${contentType} is not supported`
          });
        }
      }

      // Check body size (for non-GET requests)
      if (req.method !== 'GET' && req.method !== 'DELETE') {
        const contentLength = parseInt(req.headers['content-length'] || '0');
        if (contentLength > maxBodySize) {
          return res.status(413).json({
            success: false,
            error: 'Payload Too Large',
            message: `Request body size exceeds limit of ${maxBodySize} bytes`
          });
        }
      }

      next();
    };
  }

  // API versioning middleware
  versioning(versions: { [key: string]: string }) {
    return (req: Request, res: Response, next: NextFunction) => {
      const version = req.headers['api-version'] as string || req.query.version as string;
      
      if (version && versions[version]) {
        req.apiVersion = version;
        req.versionedPath = versions[version];
      } else {
        // Default to latest version
        const latestVersion = Object.keys(versions).sort().pop();
        if (latestVersion) {
          req.apiVersion = latestVersion;
          req.versionedPath = versions[latestVersion];
        }
      }

      // Set API version header
      res.set('API-Version', req.apiVersion || '1.0');

      next();
    };
  }

  // Request logging middleware
  requestLogger() {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!this.config.monitoring.enableLogging) {
        return next();
      }

      const startTime = Date.now();
      const requestId = this.generateRequestId();

      // Add request ID to response headers
      res.set('X-Request-ID', requestId);
      req.requestId = requestId;

      // Log request
      console.log(`[${requestId}] ${req.method} ${req.path} - ${req.ip}`);

      // Log response
      res.on('finish', () => {
        const duration = Date.now() - startTime;
        console.log(`[${requestId}] ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
      });

      next();
    };
  }

  // Metrics collection middleware
  metrics() {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!this.config.monitoring.enableMetrics) {
        return next();
      }

      const startTime = Date.now();

      res.on('finish', () => {
        const duration = Date.now() - startTime;
        const metrics = {
          method: req.method,
          path: req.path,
          statusCode: res.statusCode,
          duration,
          timestamp: new Date().toISOString(),
          userAgent: req.headers['user-agent'],
          ip: req.ip
        };

        // Store metrics (in production, this would go to a metrics system)
        this.storeMetrics(metrics);
      });

      next();
    };
  }

  // API key authentication middleware
  apiKeyAuth(options: {
    headerName?: string;
    queryParam?: string;
    validateKey?: (key: string) => Promise<boolean>;
  } = {}) {
    const {
      headerName = 'X-API-Key',
      queryParam = 'api_key',
      validateKey
    } = options;

    return async (req: Request, res: Response, next: NextFunction) => {
      const apiKey = req.headers[headerName.toLowerCase()] as string || 
                    req.query[queryParam] as string;

      if (!apiKey) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'API key is required'
        });
      }

      try {
        // Validate API key
        if (validateKey) {
          const isValid = await validateKey(apiKey);
          if (!isValid) {
            return res.status(401).json({
              success: false,
              error: 'Unauthorized',
              message: 'Invalid API key'
            });
          }
        } else {
          // Default validation (check against database)
          const validKey = await this.validateAPIKey(apiKey);
          if (!validKey) {
            return res.status(401).json({
              success: false,
              error: 'Unauthorized',
              message: 'Invalid API key'
            });
          }
        }

        req.apiKey = apiKey;
        next();
      } catch (error) {
        console.error('API key validation error:', error);
        return res.status(500).json({
          success: false,
          error: 'Internal Server Error',
          message: 'Error validating API key'
        });
      }
    };
  }

  // Request timeout middleware
  timeout(timeoutMs: number) {
    return (req: Request, res: Response, next: NextFunction) => {
      const timeout = setTimeout(() => {
        if (!res.headersSent) {
          res.status(408).json({
            success: false,
            error: 'Request Timeout',
            message: `Request timed out after ${timeoutMs}ms`
          });
        }
      }, timeoutMs);

      res.on('finish', () => {
        clearTimeout(timeout);
      });

      next();
    };
  }

  // Response compression middleware
  compression() {
    return (req: Request, res: Response, next: NextFunction) => {
      const acceptEncoding = req.headers['accept-encoding'] || '';
      
      if (acceptEncoding.includes('gzip')) {
        res.set('Content-Encoding', 'gzip');
      } else if (acceptEncoding.includes('deflate')) {
        res.set('Content-Encoding', 'deflate');
      }

      next();
    };
  }

  // Cache middleware
  cache(options: {
    ttl?: number;
    keyGenerator?: (req: Request) => string;
    condition?: (req: Request) => boolean;
  } = {}) {
    const { ttl = 300, keyGenerator, condition } = options;

    return async (req: Request, res: Response, next: NextFunction) => {
      // Skip caching for non-GET requests
      if (req.method !== 'GET') {
        return next();
      }

      // Check condition
      if (condition && !condition(req)) {
        return next();
      }

      const key = keyGenerator ? keyGenerator(req) : this.generateCacheKey(req);

      try {
        // Try to get from cache
        const cached = await cacheService.get(key);
        if (cached) {
          res.set('X-Cache', 'HIT');
          return res.json(cached);
        }

        // Cache the response
        const originalJson = res.json;
        res.json = function(data: any) {
          cacheService.set(key, data, { ttl });
          res.set('X-Cache', 'MISS');
          return originalJson.call(this, data);
        };

        next();
      } catch (error) {
        console.error('Cache middleware error:', error);
        next();
      }
    };
  }

  // Private helper methods
  private generateKey(req: Request): string {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    return `${ip}:${userAgent}`;
  }

  private generateRequestId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  private generateCacheKey(req: Request): string {
    return `cache:${req.method}:${req.path}:${JSON.stringify(req.query)}`;
  }

  private cleanupOldEntries(windowStart: number): void {
    for (const [key, entry] of this.rateLimitStore.entries()) {
      if (entry.resetTime <= windowStart) {
        this.rateLimitStore.delete(key);
      }
    }
  }

  private startCleanupInterval(): void {
    setInterval(() => {
      const now = Date.now();
      this.cleanupOldEntries(now);
    }, 60000); // Cleanup every minute
  }

  private async logRateLimitUsage(req: Request, key: string, count: number, max: number): Promise<void> {
    try {
      await auditService.logUserAction(
        0, // System action
        'SYSTEM',
        'RATE_LIMIT',
        'API',
        undefined,
        {
          key,
          count,
          max,
          path: req.path,
          method: req.method,
          ip: req.ip
        }
      );
    } catch (error) {
      console.error('Error logging rate limit usage:', error);
    }
  }

  private async validateAPIKey(apiKey: string): Promise<boolean> {
    try {
      // In production, this would validate against a database
      // For now, we'll use a simple validation
      const validKeys = await cacheService.get('valid_api_keys') || [];
      return validKeys.includes(apiKey);
    } catch (error) {
      console.error('Error validating API key:', error);
      return false;
    }
  }

  private storeMetrics(metrics: any): void {
    // In production, this would send metrics to a monitoring system
    // For now, we'll just log them
    console.log('API Metrics:', metrics);
  }

  // Get rate limit statistics
  getRateLimitStats(): {
    totalEntries: number;
    activeEntries: number;
    entries: Array<{ key: string; count: number; resetTime: number }>;
  } {
    const now = Date.now();
    const entries = Array.from(this.rateLimitStore.entries()).map(([key, entry]) => ({
      key,
      count: entry.count,
      resetTime: entry.resetTime,
      isActive: entry.resetTime > now
    }));

    return {
      totalEntries: entries.length,
      activeEntries: entries.filter(e => e.isActive).length,
      entries
    };
  }

  // Clear rate limit store
  clearRateLimitStore(): void {
    this.rateLimitStore.clear();
  }

  // Add valid API key
  async addValidAPIKey(apiKey: string): Promise<void> {
    try {
      const validKeys = await cacheService.get('valid_api_keys') || [];
      validKeys.push(apiKey);
      await cacheService.set('valid_api_keys', validKeys, { ttl: 86400 }); // 24 hours
    } catch (error) {
      console.error('Error adding valid API key:', error);
    }
  }

  // Remove valid API key
  async removeValidAPIKey(apiKey: string): Promise<void> {
    try {
      const validKeys = await cacheService.get('valid_api_keys') || [];
      const filteredKeys = validKeys.filter((key: string) => key !== apiKey);
      await cacheService.set('valid_api_keys', filteredKeys, { ttl: 86400 });
    } catch (error) {
      console.error('Error removing valid API key:', error);
    }
  }
}

// Default configuration
export const defaultAPIGatewayConfig: APIGatewayConfig = {
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
    skipSuccessfulRequests: false,
    skipFailedRequests: false
  },
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    headers: ['Content-Type', 'Authorization', 'X-API-Key', 'X-Request-ID']
  },
  security: {
    enableHelmet: true,
    enableCSRF: false,
    enableXSS: true
  },
  monitoring: {
    enableMetrics: true,
    enableLogging: true,
    enableTracing: false
  }
};

// Create default instance
export const apiGateway = new APIGateway(defaultAPIGatewayConfig);

// Export middleware functions
export const rateLimit = apiGateway.rateLimit.bind(apiGateway);
export const cors = apiGateway.cors.bind(apiGateway);
export const securityHeaders = apiGateway.securityHeaders.bind(apiGateway);
export const validateRequest = apiGateway.validateRequest.bind(apiGateway);
export const requestLogger = apiGateway.requestLogger.bind(apiGateway);
export const metrics = apiGateway.metrics.bind(apiGateway);
export const apiKeyAuth = apiGateway.apiKeyAuth.bind(apiGateway);
export const timeout = apiGateway.timeout.bind(apiGateway);
export const compression = apiGateway.compression.bind(apiGateway);
export const cache = apiGateway.cache.bind(apiGateway);
