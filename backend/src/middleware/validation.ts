import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '@/types';

export interface ValidationRule {
  field: string;
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'email' | 'date' | 'array' | 'object';
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
}

export class ValidationMiddleware {
  static validate(rules: ValidationRule[]) {
    return (req: Request, res: Response, next: NextFunction) => {
      const errors: ValidationError[] = [];

      for (const rule of rules) {
        const value = req.body[rule.field];
        
        // Check if required
        if (rule.required && (value === undefined || value === null || value === '')) {
          errors.push({
            field: rule.field,
            message: `${rule.field} is required`,
            value
          });
          continue;
        }

        // Skip validation if field is not provided and not required
        if (value === undefined && !rule.required) {
          continue;
        }

        // Type validation
        if (rule.type && !this.validateType(value, rule.type)) {
          errors.push({
            field: rule.field,
            message: `${rule.field} must be of type ${rule.type}`,
            value
          });
          continue;
        }

        // String validations
        if (rule.type === 'string' && typeof value === 'string') {
          if (rule.minLength && value.length < rule.minLength) {
            errors.push({
              field: rule.field,
              message: `${rule.field} must be at least ${rule.minLength} characters long`,
              value
            });
          }

          if (rule.maxLength && value.length > rule.maxLength) {
            errors.push({
              field: rule.field,
              message: `${rule.field} must not exceed ${rule.maxLength} characters`,
              value
            });
          }

          if (rule.pattern && !rule.pattern.test(value)) {
            errors.push({
              field: rule.field,
              message: `${rule.field} format is invalid`,
              value
            });
          }
        }

        // Number validations
        if (rule.type === 'number' && typeof value === 'number') {
          if (rule.min !== undefined && value < rule.min) {
            errors.push({
              field: rule.field,
              message: `${rule.field} must be at least ${rule.min}`,
              value
            });
          }

          if (rule.max !== undefined && value > rule.max) {
            errors.push({
              field: rule.field,
              message: `${rule.field} must not exceed ${rule.max}`,
              value
            });
          }
        }

        // Email validation
        if (rule.type === 'email' && typeof value === 'string') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            errors.push({
              field: rule.field,
              message: `${rule.field} must be a valid email address`,
              value
            });
          }
        }

        // Date validation
        if (rule.type === 'date') {
          const date = new Date(value);
          if (isNaN(date.getTime())) {
            errors.push({
              field: rule.field,
              message: `${rule.field} must be a valid date`,
              value
            });
          }
        }

        // Array validation
        if (rule.type === 'array' && Array.isArray(value)) {
          if (rule.minLength && value.length < rule.minLength) {
            errors.push({
              field: rule.field,
              message: `${rule.field} must have at least ${rule.minLength} items`,
              value
            });
          }

          if (rule.maxLength && value.length > rule.maxLength) {
            errors.push({
              field: rule.field,
              message: `${rule.field} must not exceed ${rule.maxLength} items`,
              value
            });
          }
        }

        // Custom validation
        if (rule.custom) {
          const customResult = rule.custom(value);
          if (customResult !== true) {
            errors.push({
              field: rule.field,
              message: typeof customResult === 'string' ? customResult : `${rule.field} is invalid`,
              value
            });
          }
        }
      }

      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors
        });
      }

      next();
    };
  }

  private static validateType(value: any, type: string): boolean {
    switch (type) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number' && !isNaN(value);
      case 'boolean':
        return typeof value === 'boolean';
      case 'email':
        return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      case 'date':
        return !isNaN(new Date(value).getTime());
      case 'array':
        return Array.isArray(value);
      case 'object':
        return typeof value === 'object' && value !== null && !Array.isArray(value);
      default:
        return true;
    }
  }

  // Common validation rules
  static emailValidation(): ValidationRule[] {
    return [
      {
        field: 'email',
        required: true,
        type: 'email'
      }
    ];
  }

  static passwordValidation(): ValidationRule[] {
    return [
      {
        field: 'password',
        required: true,
        type: 'string',
        minLength: 8,
        pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
      }
    ];
  }

  static studentValidation(): ValidationRule[] {
    return [
      {
        field: 'code',
        required: true,
        type: 'string',
        minLength: 3,
        maxLength: 20,
        pattern: /^[A-Z0-9]+$/
      },
      {
        field: 'fullName',
        required: true,
        type: 'string',
        minLength: 2,
        maxLength: 100
      },
      {
        field: 'classId',
        required: true,
        type: 'number',
        min: 1
      },
      {
        field: 'dob',
        required: true,
        type: 'date',
        custom: (value: string) => {
          const date = new Date(value);
          const now = new Date();
          const age = now.getFullYear() - date.getFullYear();
          return age >= 5 && age <= 25;
        }
      },
      {
        field: 'gender',
        required: true,
        type: 'string',
        custom: (value: string) => ['MALE', 'FEMALE'].includes(value)
      }
    ];
  }

  static gradeValidation(): ValidationRule[] {
    return [
      {
        field: 'studentId',
        required: true,
        type: 'number',
        min: 1
      },
      {
        field: 'subjectId',
        required: true,
        type: 'number',
        min: 1
      },
      {
        field: 'score',
        required: true,
        type: 'number',
        min: 0,
        max: 10
      },
      {
        field: 'maxScore',
        type: 'number',
        min: 1,
        max: 100
      },
      {
        field: 'examType',
        required: true,
        type: 'string',
        custom: (value: string) => ['QUIZ', 'MIDTERM', 'FINAL', 'ASSIGNMENT', 'PROJECT'].includes(value)
      },
      {
        field: 'semester',
        required: true,
        type: 'string',
        pattern: /^[1-2]$/ // Semester 1 or 2
      }
    ];
  }

  static attendanceValidation(): ValidationRule[] {
    return [
      {
        field: 'studentId',
        required: true,
        type: 'number',
        min: 1
      },
      {
        field: 'date',
        required: true,
        type: 'date',
        custom: (value: string) => {
          const date = new Date(value);
          return date <= new Date(); // Cannot mark attendance for future dates
        }
      },
      {
        field: 'status',
        required: true,
        type: 'string',
        custom: (value: string) => ['PRESENT', 'ABSENT', 'LATE'].includes(value)
      }
    ];
  }

  static classValidation(): ValidationRule[] {
    return [
      {
        field: 'code',
        required: true,
        type: 'string',
        minLength: 2,
        maxLength: 20,
        pattern: /^[A-Z0-9]+$/
      },
      {
        field: 'name',
        required: true,
        type: 'string',
        minLength: 2,
        maxLength: 100
      },
      {
        field: 'gradeLevel',
        required: true,
        type: 'number',
        min: 1,
        max: 12
      },
      {
        field: 'academicYear',
        required: true,
        type: 'string',
        pattern: /^\d{4}-\d{4}$/ // Format: 2023-2024
      }
    ];
  }

  static teacherValidation(): ValidationRule[] {
    return [
      {
        field: 'fullName',
        required: true,
        type: 'string',
        minLength: 2,
        maxLength: 100
      },
      {
        field: 'email',
        required: true,
        type: 'email'
      },
      {
        field: 'major',
        required: true,
        type: 'string',
        minLength: 2,
        maxLength: 100
      },
      {
        field: 'salary',
        type: 'number',
        min: 0
      }
    ];
  }

  static subjectValidation(): ValidationRule[] {
    return [
      {
        field: 'code',
        required: true,
        type: 'string',
        minLength: 2,
        maxLength: 20,
        pattern: /^[A-Z0-9]+$/
      },
      {
        field: 'name',
        required: true,
        type: 'string',
        minLength: 2,
        maxLength: 100
      },
      {
        field: 'credits',
        type: 'number',
        min: 1,
        max: 10
      },
      {
        field: 'color',
        type: 'string',
        pattern: /^#[0-9A-Fa-f]{6}$/ // Hex color code
      }
    ];
  }

  // Query parameter validation
  static validateQuery(rules: ValidationRule[]) {
    return (req: Request, res: Response, next: NextFunction) => {
      const errors: ValidationError[] = [];

      for (const rule of rules) {
        const value = req.query[rule.field];
        
        // Check if required
        if (rule.required && (value === undefined || value === null || value === '')) {
          errors.push({
            field: rule.field,
            message: `${rule.field} is required`,
            value
          });
          continue;
        }

        // Skip validation if field is not provided and not required
        if (value === undefined && !rule.required) {
          continue;
        }

        // Convert string values to appropriate types
        let convertedValue = value;
        if (rule.type === 'number' && typeof value === 'string') {
          convertedValue = parseFloat(value);
          if (isNaN(convertedValue)) {
            errors.push({
              field: rule.field,
              message: `${rule.field} must be a valid number`,
              value
            });
            continue;
          }
        }

        if (rule.type === 'boolean' && typeof value === 'string') {
          convertedValue = value.toLowerCase() === 'true';
        }

        if (rule.type === 'array' && typeof value === 'string') {
          try {
            convertedValue = JSON.parse(value);
            if (!Array.isArray(convertedValue)) {
              throw new Error();
            }
          } catch {
            errors.push({
              field: rule.field,
              message: `${rule.field} must be a valid array`,
              value
            });
            continue;
          }
        }

        // Apply the same validation rules as body validation
        if (rule.minLength && typeof convertedValue === 'string' && convertedValue.length < rule.minLength) {
          errors.push({
            field: rule.field,
            message: `${rule.field} must be at least ${rule.minLength} characters long`,
            value
          });
        }

        if (rule.maxLength && typeof convertedValue === 'string' && convertedValue.length > rule.maxLength) {
          errors.push({
            field: rule.field,
            message: `${rule.field} must not exceed ${rule.maxLength} characters`,
            value
          });
        }

        if (rule.min !== undefined && typeof convertedValue === 'number' && convertedValue < rule.min) {
          errors.push({
            field: rule.field,
            message: `${rule.field} must be at least ${rule.min}`,
            value
          });
        }

        if (rule.max !== undefined && typeof convertedValue === 'number' && convertedValue > rule.max) {
          errors.push({
            field: rule.field,
            message: `${rule.field} must not exceed ${rule.max}`,
            value
          });
        }

        if (rule.custom) {
          const customResult = rule.custom(convertedValue);
          if (customResult !== true) {
            errors.push({
              field: rule.field,
              message: typeof customResult === 'string' ? customResult : `${rule.field} is invalid`,
              value
            });
          }
        }
      }

      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Query validation failed',
          details: errors
        });
      }

      next();
    };
  }

  // Pagination validation
  static validatePagination() {
    return this.validateQuery([
      {
        field: 'page',
        type: 'number',
        min: 1,
        custom: (value: number) => Number.isInteger(value)
      },
      {
        field: 'limit',
        type: 'number',
        min: 1,
        max: 100,
        custom: (value: number) => Number.isInteger(value)
      }
    ]);
  }

  // Date range validation
  static validateDateRange() {
    return this.validateQuery([
      {
        field: 'dateFrom',
        type: 'date'
      },
      {
        field: 'dateTo',
        type: 'date',
        custom: (value: string, req: Request) => {
          const dateFrom = req.query.dateFrom;
          if (dateFrom) {
            const from = new Date(dateFrom);
            const to = new Date(value);
            return to >= from;
          }
          return true;
        }
      }
    ]);
  }

  // ID validation
  static validateId(field: string = 'id') {
    return this.validateQuery([
      {
        field,
        type: 'number',
        min: 1,
        custom: (value: number) => Number.isInteger(value)
      }
    ]);
  }

  // Search validation
  static validateSearch() {
    return this.validateQuery([
      {
        field: 'search',
        type: 'string',
        minLength: 1,
        maxLength: 100
      },
      {
        field: 'limit',
        type: 'number',
        min: 1,
        max: 50
      }
    ]);
  }
}

export { ValidationMiddleware };
