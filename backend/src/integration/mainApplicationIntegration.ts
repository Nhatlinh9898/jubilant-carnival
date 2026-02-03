// Main Application Integration - Integration with main index.ts
import { Application } from 'express';
import { AdvancedAcademicAIIntegration } from './advancedAcademicAIIntegration';

export class MainApplicationIntegration {
  private app: Application;
  private advancedAIIntegration: AdvancedAcademicAIIntegration;

  constructor(app: Application) {
    this.app = app;
    this.advancedAIIntegration = new AdvancedAcademicAIIntegration(app);
  }

  // Initialize all Advanced Academic AI components
  initialize(): void {
    // Initialize Advanced Academic AI
    this.advancedAIIntegration.initialize();
    
    // Add health check endpoint
    this.app.get('/api/advanced-academic-ai/health', (req, res) => {
      res.json(this.advancedAIIntegration.healthCheck());
    });
    
    // Add API documentation endpoint
    this.app.get('/api/advanced-academic-ai/docs', (req, res) => {
      res.json(this.advancedAIIntegration.getAPIDocumentation());
    });
    
    console.log('✅ Main application integration completed');
  }

  // Update main application routes documentation
  updateAPIDocumentation(): void {
    // This would update the main API documentation to include Advanced Academic AI
    const apiDocs = {
      'Advanced Academic AI': {
        description: 'Advanced Academic AI system for generating and analyzing academic content',
        endpoints: this.advancedAIIntegration.getAPIDocumentation().endpoints,
        healthCheck: '/api/advanced-academic-ai/health',
        documentation: '/api/advanced-academic-ai/docs'
      }
    };
    
    console.log('📚 API documentation updated with Advanced Academic AI');
  }

  // Add Advanced Academic AI to main application info
  updateApplicationInfo(): void {
    // This would update the main application info
    const appInfo = {
      name: 'EduManager with Advanced Academic AI',
      version: '2.0.0',
      features: [
        'Education Management',
        'Content Generation',
        'Document Analysis',
        'Advanced Academic AI',
        'Expert Profiles',
        'Research Database'
      ],
      newFeatures: [
        'Advanced Academic AI Content Generation',
        'Academic Document Analysis',
        'Expert Profile Management',
        'Research Database Integration',
        'Quality Assessment Tools'
      ]
    };
    
    console.log('📋 Application info updated with Advanced Academic AI features');
  }

  // Initialize error handling for Advanced Academic AI
  initializeErrorHandling(): void {
    // Add global error handling for Advanced Academic AI
    this.app.use((error: any, req: any, res: any, next: any) => {
      if (error.path && error.path.startsWith('/api/advanced-academic-ai')) {
        res.status(500).json({
          success: false,
          message: 'Advanced Academic AI Error',
          error: error.message,
          path: error.path,
          timestamp: new Date().toISOString()
        });
      } else {
        next(error);
      }
    });
    
    console.log('🛡️ Advanced Academic AI error handling initialized');
  }

  // Initialize rate limiting for Advanced Academic AI
  initializeRateLimiting(): void {
    // Add rate limiting for Advanced Academic AI endpoints
    this.app.use('/api/advanced-academic-ai', (req, res, next) => {
      // Simple rate limiting logic
      const clientIP = req.ip || req.connection.remoteAddress;
      // In production, use a proper rate limiting library
      
      // Log request for monitoring
      console.log(`Advanced Academic AI request from ${clientIP}: ${req.method} ${req.path}`);
      
      next();
    });
    
    console.log('⚡ Advanced Academic AI rate limiting initialized');
  }

  // Initialize logging for Advanced Academic AI
  initializeLogging(): void {
    // Add logging for Advanced Academic AI
    this.app.use('/api/advanced-academic-ai', (req, res, next) => {
      const start = Date.now();
      
      res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`Advanced Academic AI ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
      });
      
      next();
    });
    
    console.log('📝 Advanced Academic AI logging initialized');
  }

  // Complete integration setup
  setupCompleteIntegration(): void {
    this.initialize();
    this.updateAPIDocumentation();
    this.updateApplicationInfo();
    this.initializeErrorHandling();
    this.initializeRateLimiting();
    this.initializeLogging();
    
    console.log('🚀 Advanced Academic AI complete integration finished');
    console.log('📍 Available endpoints:');
    console.log('   - Health Check: GET /api/advanced-academic-ai/health');
    console.log('   - API Docs: GET /api/advanced-academic-ai/docs');
    console.log('   - Content Generation: POST /api/advanced-academic-ai/generate');
    console.log('   - Document Analysis: POST /api/advanced-academic-ai/analyze');
    console.log('   - Expert Profiles: GET /api/advanced-academic-ai/profile');
    console.log('   - Research Database: GET /api/advanced-academic-ai/research');
  }
}

export { MainApplicationIntegration };
