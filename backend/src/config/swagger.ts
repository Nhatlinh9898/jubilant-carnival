import swaggerJsdoc from 'swagger-jsdoc';
import { Application, json, urlencoded, Request, Response } from 'express';

// Swagger configuration
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'EduManager API',
      version: '1.0.0',
      description: 'Hệ thống quản lý giáo dục toàn diện',
      contact: {
        name: 'EduManager Support',
        email: 'support@edumanager.edu.vn',
        url: 'https://edumanager.edu.vn/support'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:3001',
        description: 'Development server'
      },
      {
        url: 'https://api.edumanager.edu.vn',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT authentication token'
        }
      },
      schemas: {
        User: {
          type: 'object',
          required: ['id', 'email', 'fullName', 'role'],
          properties: {
            id: {
              type: 'integer',
              description: 'User ID'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address'
            },
            fullName: {
              type: 'string',
              description: 'User full name'
            },
            role: {
              type: 'string',
              enum: ['ADMIN', 'TEACHER', 'STUDENT'],
              description: 'User role'
            },
            avatar: {
              type: 'string',
              format: 'uri',
              description: 'Avatar URL'
            },
            phone: {
              type: 'string',
              description: 'Phone number'
            },
            address: {
              type: 'string',
              description: 'Address'
            },
            isActive: {
              type: 'boolean',
              description: 'Account status'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation date'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update date'
            }
          }
        },
        Student: {
          type: 'object',
          required: ['id', 'userId', 'code', 'classId', 'dob', 'gender', 'status'],
          properties: {
            id: {
              type: 'integer',
              description: 'Student ID'
            },
            userId: {
              type: 'integer',
              description: 'User ID'
            },
            code: {
              type: 'string',
              description: 'Student code'
            },
            classId: {
              type: 'integer',
              description: 'Class ID'
            },
            dob: {
              type: 'string',
              format: 'date',
              description: 'Date of birth'
            },
            gender: {
              type: 'string',
              enum: ['MALE', 'FEMALE'],
              description: 'Gender'
            },
            status: {
              type: 'string',
              enum: ['ACTIVE', 'INACTIVE', 'GRADUATED'],
              description: 'Student status'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation date'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update date'
            }
          }
        },
        Teacher: {
          type: 'object',
          required: ['id', 'userId', 'major', 'isActive'],
          properties: {
            id: {
              type: 'integer',
              description: 'Teacher ID'
            },
            userId: {
              type: 'integer',
              description: 'User ID'
            },
            major: {
              type: 'string',
              description: 'Teaching major'
            },
            salary: {
              type: 'number',
              description: 'Salary'
            },
            isActive: {
              type: 'boolean',
              description: 'Employment status'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation date'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update date'
            }
          }
        },
        Class: {
          type: 'object',
          required: ['id', 'code', 'name', 'gradeLevel', 'academicYear', 'isActive'],
          properties: {
            id: {
              type: 'integer',
              description: 'Class ID'
            },
            code: {
              type: 'string',
              description: 'Class code'
            },
            name: {
              type: 'string',
              description: 'Class name'
            },
            gradeLevel: {
              type: 'integer',
              description: 'Grade level (1-12)'
            },
            academicYear: {
              type: 'string',
              description: 'Academic year'
            },
            homeroomTeacherId: {
              type: 'integer',
              description: 'Homeroom teacher ID'
            },
            studentCount: {
              type: 'integer',
              description: 'Number of students'
            },
            room: {
              type: 'string',
              description: 'Classroom'
            },
            isActive: {
              type: 'boolean',
              description: 'Class status'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation date'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update date'
            }
          }
        },
        Grade: {
          type: 'object',
          required: ['id', 'studentId', 'subjectId', 'score', 'maxScore', 'examType', 'semester'],
          properties: {
            id: {
              type: 'integer',
              description: 'Grade ID'
            },
            studentId: {
              type: 'integer',
              description: 'Student ID'
            },
            subjectId: {
              type: 'integer',
              description: 'Subject ID'
            },
            score: {
              type: 'number',
              minimum: 0,
              maximum: 10,
              description: 'Score achieved'
            },
            maxScore: {
              type: 'number',
              minimum: 0,
              description: 'Maximum possible score'
            },
            examType: {
              type: 'string',
              enum: ['QUIZ', 'MIDTERM', 'FINAL', 'ASSIGNMENT'],
              description: 'Type of exam'
            },
            semester: {
              type: 'string',
              description: 'Semester'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation date'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update date'
            }
          }
        },
        Attendance: {
          type: 'object',
          required: ['id', 'studentId', 'date', 'status'],
          properties: {
            id: {
              type: 'integer',
              description: 'Attendance ID'
            },
            studentId: {
              type: 'integer',
              description: 'Student ID'
            },
            date: {
              type: 'string',
              format: 'date',
              description: 'Attendance date'
            },
            status: {
              type: 'string',
              enum: ['PRESENT', 'ABSENT', 'LATE'],
              description: 'Attendance status'
            },
            notes: {
              type: 'string',
              description: 'Additional notes'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation date'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update date'
            }
          }
        },
        ApiResponse: {
          type: 'object',
          required: ['success'],
          properties: {
            success: {
              type: 'boolean',
              description: 'Request success status'
            },
            data: {
              type: 'object',
              description: 'Response data'
            },
            message: {
              type: 'string',
              description: 'Response message'
            },
            error: {
              type: 'string',
              description: 'Error message'
            },
            pagination: {
              type: 'object',
              properties: {
                page: {
                  type: 'integer',
                  description: 'Current page'
                },
                limit: {
                  type: 'integer',
                  description: 'Items per page'
                },
                total: {
                  type: 'integer',
                  description: 'Total items'
                },
                totalPages: {
                  type: 'integer',
                  description: 'Total pages'
                }
              }
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          required: ['success', 'error'],
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            error: {
              type: 'string',
              description: 'Error message'
            },
            details: {
              type: 'object',
              description: 'Error details'
            }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'User email'
            },
            password: {
              type: 'string',
              format: 'password',
              description: 'User password'
            }
          }
        },
        LoginResponse: {
          type: 'object',
          required: ['success', 'token', 'user'],
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            token: {
              type: 'string',
              description: 'JWT authentication token'
            },
            user: {
              $ref: '#/components/schemas/User'
            }
          }
        },
        SearchParams: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query'
            },
            page: {
              type: 'integer',
              minimum: 1,
              default: 1,
              description: 'Page number'
            },
            limit: {
              type: 'integer',
              minimum: 1,
              maximum: 100,
              default: 10,
              description: 'Items per page'
            },
            sortBy: {
              type: 'string',
              description: 'Sort field'
            },
            sortOrder: {
              type: 'string',
              enum: ['asc', 'desc'],
              default: 'asc',
              description: 'Sort order'
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Authentication',
        description: 'Authentication endpoints'
      },
      {
        name: 'Users',
        description: 'User management'
      },
      {
        name: 'Students',
        description: 'Student management'
      },
      {
        name: 'Teachers',
        description: 'Teacher management'
      },
      {
        name: 'Classes',
        description: 'Class management'
      },
      {
        name: 'Grades',
        description: 'Grade management'
      },
      {
        name: 'Attendance',
        description: 'Attendance tracking'
      },
      {
        name: 'Schedule',
        description: 'Schedule management'
      },
      {
        name: 'Analytics',
        description: 'Analytics and reporting'
      },
      {
        name: 'Mobile',
        description: 'Mobile API endpoints'
      },
      {
        name: 'Search',
        description: 'Advanced search'
      },
      {
        name: 'Audit',
        description: 'Audit logging'
      }
    ]
  },
  apis: [
    {
      info: {
        title: 'Authentication',
        description: 'Authentication endpoints'
      },
      paths: {
        '/api/auth/login': {
          post: {
            tags: ['Authentication'],
            summary: 'User login',
            description: 'Authenticate user and return JWT token',
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/LoginRequest'
                  }
                }
              }
            },
            responses: {
              200: {
                description: 'Login successful',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/LoginResponse'
                    }
                  }
                }
              },
              401: {
                description: 'Invalid credentials',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/ErrorResponse'
                    }
                  }
                }
              }
            }
          }
        },
        '/api/auth/register': {
          post: {
            tags: ['Authentication'],
            summary: 'User registration',
            description: 'Register a new user account',
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    required: ['email', 'password', 'fullName', 'role'],
                    properties: {
                      email: {
                        type: 'string',
                        format: 'email',
                        description: 'User email'
                      },
                      password: {
                        type: 'string',
                        format: 'password',
                        description: 'User password'
                      },
                      fullName: {
                        type: 'string',
                        description: 'User full name'
                      },
                      role: {
                        type: 'string',
                        enum: ['ADMIN', 'TEACHER', 'STUDENT'],
                        description: 'User role'
                      },
                      phone: {
                        type: 'string',
                        description: 'Phone number'
                      },
                      address: {
                        type: 'string',
                        description: 'Address'
                      }
                    }
                  }
                }
              }
            },
            responses: {
              201: {
                description: 'Registration successful',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/ApiResponse'
                    }
                  }
                }
              },
              400: {
                description: 'Validation error',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/ErrorResponse'
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    {
      info: {
        title: 'Students',
        description: 'Student management endpoints'
      },
      paths: {
        '/api/students': {
          get: {
            tags: ['Students'],
            summary: 'Get all students',
            description: 'Retrieve a paginated list of students',
            security: [{ bearerAuth: [] }],
            parameters: [
              {
                name: 'page',
                in: 'query',
                schema: {
                  type: 'integer',
                  minimum: 1,
                  default: 1
                }
              },
              {
                name: 'limit',
                in: 'query',
                schema: {
                  type: 'integer',
                  minimum: 1,
                  maximum: 100,
                  default: 10
                }
              },
              {
                name: 'search',
                in: 'query',
                schema: {
                  type: 'string'
                }
              },
              {
                name: 'classId',
                in: 'query',
                schema: {
                  type: 'integer'
                }
              },
              {
                name: 'status',
                in: 'query',
                schema: {
                  type: 'string',
                  enum: ['ACTIVE', 'INACTIVE', 'GRADUATED']
                }
              }
            ],
            responses: {
              200: {
                description: 'Students retrieved successfully',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/ApiResponse'
                    }
                  }
                }
              }
            }
          },
          post: {
            tags: ['Students'],
            summary: 'Create new student',
            description: 'Create a new student record',
            security: [{ bearerAuth: [] }],
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    required: ['code', 'fullName', 'email', 'password', 'classId', 'dob', 'gender'],
                    properties: {
                      code: {
                        type: 'string',
                        description: 'Student code'
                      },
                      fullName: {
                        type: 'string',
                        description: 'Student full name'
                      },
                      email: {
                        type: 'string',
                        format: 'email',
                        description: 'Student email'
                      },
                      password: {
                        type: 'string',
                        format: 'password',
                        description: 'Student password'
                      },
                      classId: {
                        type: 'integer',
                        description: 'Class ID'
                      },
                      dob: {
                        type: 'string',
                        format: 'date',
                        description: 'Date of birth'
                      },
                      gender: {
                        type: 'string',
                        enum: ['MALE', 'FEMALE'],
                        description: 'Gender'
                      },
                      phone: {
                        type: 'string',
                        description: 'Phone number'
                      },
                      address: {
                        type: 'string',
                        description: 'Address'
                      }
                    }
                  }
                }
              }
            },
            responses: {
              201: {
                description: 'Student created successfully',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/ApiResponse'
                    }
                  }
                }
              }
            }
          }
        },
        '/api/students/{id}': {
          get: {
            tags: ['Students'],
            summary: 'Get student by ID',
            description: 'Retrieve a specific student by their ID',
            security: [{ bearerAuth: [] }],
            parameters: [
              {
                name: 'id',
                in: 'path',
                required: true,
                schema: {
                  type: 'integer'
                }
              }
            ],
            responses: {
              200: {
                description: 'Student retrieved successfully',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/ApiResponse'
                    }
                  }
                }
              },
              404: {
                description: 'Student not found',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/ErrorResponse'
                    }
                  }
                }
              }
            }
          },
          put: {
            tags: ['Students'],
            summary: 'Update student',
            description: 'Update student information',
            security: [{ bearerAuth: [] }],
            parameters: [
              {
                name: 'id',
                in: 'path',
                required: true,
                schema: {
                  type: 'integer'
                }
              }
            ],
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      classId: {
                        type: 'integer',
                        description: 'Class ID'
                      },
                      status: {
                        type: 'string',
                        enum: ['ACTIVE', 'INACTIVE', 'GRADUATED'],
                        description: 'Student status'
                      }
                    }
                  }
                }
              }
            },
            responses: {
              200: {
                description: 'Student updated successfully',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/ApiResponse'
                    }
                  }
                }
              }
            }
          },
          delete: {
            tags: ['Students'],
            summary: 'Delete student',
            description: 'Delete a student record',
            security: [{ bearerAuth: [] }],
            parameters: [
              {
                name: 'id',
                in: 'path',
                required: true,
                schema: {
                  type: 'integer'
                }
              }
            ],
            responses: {
              200: {
                description: 'Student deleted successfully',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/ApiResponse'
                    }
                  }
                }
              },
              404: {
                description: 'Student not found',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/ErrorResponse'
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  ]
};

// Swagger setup function
export const setupSwagger = (app: Application) => {
  // Add swagger documentation
  app.use('/api-docs', swaggerUi.serve);
  app.use('/api-docs', swaggerUi.setup(options));
  
  // Add JSON API documentation
  app.get('/api-docs.json', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(options.definition);
  });
  
  // Serve swagger UI assets
  app.use('/api-docs/swagger-ui.css', swaggerUi.setupFiles);
  app.use('/api-docs/swagger-ui-bundle.js', swaggerUi.setupFiles);
  app.use('/api-docs/swagger-ui-standalone-preset.js', swaggerUi.setupFiles);
  
  // Custom swagger UI configuration
  app.use('/api-docs', swaggerUi.setup(options));
};

export { setupSwagger, options };
