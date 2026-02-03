import { prisma } from '@/index';
import { EmailService } from './emailService';
import { cacheService } from './cacheService';
import { auditService } from './auditService';

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  variables: string[];
  category: 'transactional' | 'marketing' | 'notification' | 'report';
  isActive: boolean;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailTemplateVariable {
  name: string;
  label: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'url';
  required: boolean;
  defaultValue?: any;
  description?: string;
}

export interface EmailTemplatePreview {
  subject: string;
  htmlContent: string;
  textContent?: string;
}

export interface EmailTemplateTest {
  to: string;
  variables: Record<string, any>;
}

export class EmailTemplateService {
  private emailService: EmailService;
  private templates: Map<string, EmailTemplate> = new Map();
  private defaultTemplates: EmailTemplate[] = [];

  constructor() {
    this.emailService = new EmailService();
    this.initializeDefaultTemplates();
  }

  private initializeDefaultTemplates() {
    // Welcome Email Template
    this.defaultTemplates.push({
      id: 'welcome',
      name: 'Welcome Email',
      subject: 'Chào mừng {{userName}} đến với EduManager!',
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Chào mừng đến với EduManager</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎓 Chào mừng đến với EduManager!</h1>
              <p>Hệ thống quản lý giáo dục thông minh</p>
            </div>
            <div class="content">
              <h2>Xin chào {{userName}},</h2>
              <p>Chúng tôi rất vui mừng chào đón bạn đến với EduManager - hệ thống quản lý giáo dục tiên tiến.</p>
              
              <h3>🌟 Tính năng nổi bật:</h3>
              <ul>
                <li>📊 Theo dõi hiệu suất học tập theo thời gian thực</li>
                <li>📱 Ứng dụng di động tiện lợi</li>
                <li>🔔 Thông báo tự động</li>
                <li>📈 Phân tích và báo cáo chi tiết</li>
                <li>💬 Hệ thống chat và thông báo</li>
              </ul>
              
              <p>Bạn có thể bắt đầu bằng cách:</p>
              <ol>
                <li>Hoàn thành hồ sơ cá nhân</li>
                <li>Khám phá các tính năng</li>
                <li>Liên hệ với giáo viên</li>
              </ol>
              
              <div style="text-align: center;">
                <a href="{{loginUrl}}" class="button">Bắt đầu ngay</a>
              </div>
              
              <p>Nếu có bất kỳ câu hỏi nào, đừng ngần ngại liên hệ với chúng tôi.</p>
              
              <p>Trân trọng,<br>Đội ngũ EduManager</p>
            </div>
            <div class="footer">
              <p>© 2024 EduManager. All rights reserved.</p>
              <p>Địa chỉ: 123 Đường Giáo dục, Quận 1, TP.HCM</p>
              <p>Email: support@edumanager.vn | Hotline: 1900-1234</p>
            </div>
          </div>
        </body>
        </html>
      `,
      textContent: `
        Chào mừng {{userName}} đến với EduManager!
        
        Chúng tôi rất vui mừng chào đón bạn đến với hệ thống quản lý giáo dục tiên tiến.
        
        Tính năng nổi bật:
        - Theo dõi hiệu suất học tập theo thời gian thực
        - Ứng dụng di động tiện lợi
        - Thông báo tự động
        - Phân tích và báo cáo chi tiết
        - Hệ thống chat và thông báo
        
        Bắt đầu ngay: {{loginUrl}}
        
        Trân trọng,
        Đội ngũ EduManager
      `,
      variables: ['userName', 'loginUrl'],
      category: 'transactional',
      isActive: true,
      isDefault: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Grade Notification Template
    this.defaultTemplates.push({
      id: 'grade_notification',
      name: 'Grade Notification',
      subject: '📊 Bạn có điểm mới: {{score}}/{{maxScore}} môn {{subjectName}}',
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Thông báo điểm mới</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .grade-box { background: white; border-left: 4px solid #28a745; padding: 20px; margin: 20px 0; border-radius: 5px; }
            .grade-score { font-size: 24px; font-weight: bold; color: #28a745; }
            .button { display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📊 Thông báo điểm mới</h1>
              <p>EduManager</p>
            </div>
            <div class="content">
              <h2>Xin chào {{studentName}},</h2>
              <p>Bạn vừa nhận được điểm mới cho môn học:</p>
              
              <div class="grade-box">
                <h3>{{subjectName}}</h3>
                <div class="grade-score">{{score}}/{{maxScore}}</div>
                <p><strong>Loại thi:</strong> {{examType}}</p>
                <p><strong>Ngày thi:</strong> {{examDate}}</p>
                <p><strong>Giáo viên:</strong> {{teacherName}}</p>
              </div>
              
              <div style="text-align: center;">
                <a href="{{viewGradesUrl}}" class="button">Xem chi tiết điểm số</a>
              </div>
              
              <p>Chúc mừng bạn! Hãy tiếp tục cố gắng để đạt kết quả tốt hơn.</p>
              
              <p>Trân trọng,<br>Đội ngũ EduManager</p>
            </div>
            <div class="footer">
              <p>© 2024 EduManager. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      variables: ['studentName', 'subjectName', 'score', 'maxScore', 'examType', 'examDate', 'teacherName', 'viewGradesUrl'],
      category: 'notification',
      isActive: true,
      isDefault: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Attendance Alert Template
    this.defaultTemplates.push({
      id: 'attendance_alert',
      name: 'Attendance Alert',
      subject: '⚠️ Thông báo vắng mặt: {{date}}',
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Thông báo vắng mặt</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .alert-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 20px 0; border-radius: 5px; }
            .button { display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⚠️ Thông báo vắng mặt</h1>
              <p>EduManager</p>
            </div>
            <div class="content">
              <h2>Xin chào {{parentName}},</h2>
              <p>Chúng tôi xin thông báo rằng học sinh {{studentName}} đã vắng mặt vào ngày {{date}}.</p>
              
              <div class="alert-box">
                <h3>Chi tiết vắng mặt:</h3>
                <p><strong>Học sinh:</strong> {{studentName}}</p>
                <p><strong>Lớp:</strong> {{className}}</p>
                <p><strong>Ngày:</strong> {{date}}</p>
                <p><strong>Giáo viên điểm danh:</strong> {{teacherName}}</p>
                <p><strong>Lý do:</strong> {{reason || 'Không có ghi chú'}}</p>
              </div>
              
              <div style="text-align: center;">
                <a href="{{viewAttendanceUrl}}" class="button">Xem chi tiết chuyên cần</a>
              </div>
              
              <p>Vui lòng liên hệ với giáo viên nếu có bất kỳ thắc mắc nào.</p>
              
              <p>Trân trọng,<br>Đội ngũ EduManager</p>
            </div>
            <div class="footer">
              <p>© 2024 EduManager. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      variables: ['parentName', 'studentName', 'className', 'date', 'teacherName', 'reason', 'viewAttendanceUrl'],
      category: 'notification',
      isActive: true,
      isDefault: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Invoice Due Template
    this.defaultTemplates.push({
      id: 'invoice_due',
      name: 'Invoice Due',
      subject: '💰 Học phí đến hạn: {{invoiceTitle}}',
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Học phí đến hạn</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .invoice-box { background: white; border: 2px solid #ffc107; padding: 20px; margin: 20px 0; border-radius: 5px; }
            .amount { font-size: 28px; font-weight: bold; color: #ff9800; }
            .button { display: inline-block; background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>💰 Học phí đến hạn</h1>
              <p>EduManager</p>
            </div>
            <div class="content">
              <h2>Xin chào {{parentName}},</h2>
              <p>Học phí của học sinh {{studentName}} sắp đến hạn. Vui lòng thanh toán đúng hạn.</p>
              
              <div class="invoice-box">
                <h3>{{invoiceTitle}}</h3>
                <div class="amount">{{amount}} VNĐ</div>
                <p><strong>Học sinh:</strong> {{studentName}}</p>
                <p><strong>Lớp:</strong> {{className}}</p>
                <p><strong>Ngày đến hạn:</strong> {{dueDate}}</p>
                <p><strong>Mã hóa đơn:</strong> {{invoiceCode}}</p>
              </div>
              
              <div style="text-align: center;">
                <a href="{{paymentUrl}}" class="button">Thanh toán ngay</a>
              </div>
              
              <p>Nếu đã thanh toán, vui lòng bỏ qua email này.</p>
              
              <p>Trân trọng,<br>Đội ngũ EduManager</p>
            </div>
            <div class="footer">
              <p>© 2024 EduManager. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      variables: ['parentName', 'studentName', 'className', 'invoiceTitle', 'amount', 'dueDate', 'invoiceCode', 'paymentUrl'],
      category: 'transactional',
      isActive: true,
      isDefault: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Exam Reminder Template
    this.defaultTemplates.push({
      id: 'exam_reminder',
      name: 'Exam Reminder',
      subject: '📝 Nhắc nhở thi: {{examName}}',
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Nhắc nhở thi</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #17a2b8 0%, #138496 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .exam-box { background: white; border-left: 4px solid #17a2b8; padding: 20px; margin: 20px 0; border-radius: 5px; }
            .button { display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📝 Nhắc nhở thi</h1>
              <p>EduManager</p>
            </div>
            <div class="content">
              <h2>Xin chào {{studentName}},</h2>
              <p>Bạn có bài thi sắp diễn ra. Hãy chuẩn bị kỹ lưỡng!</p>
              
              <div class="exam-box">
                <h3>{{examName}}</h3>
                <p><strong>Môn học:</strong> {{subjectName}}</p>
                <p><strong>Ngày thi:</strong> {{examDate}}</p>
                <p><strong>Thời gian:</strong> {{examTime}}</p>
                <p><strong>Phòng thi:</strong> {{examRoom}}</p>
                <p><strong>Thời lượng:</strong> {{duration}} phút</p>
                <p><strong>Giáo viên:</strong> {{teacherName}}</p>
              </div>
              
              <h3>📚 Lưu ý:</h3>
              <ul>
                <li>Có mặt trước 15 phút</li>
                <li>Mang theo đầy đủ dụng cụ học tập</li>
                <li>Không sử dụng điện thoại trong phòng thi</li>
                <li>Đọc kỹ đề bài trước khi làm</li>
              </ul>
              
              <div style="text-align: center;">
                <a href="{{examDetailsUrl}}" class="button">Xem chi tiết bài thi</a>
              </div>
              
              <p>Chúc bạn thi tốt!</p>
              
              <p>Trân trọng,<br>Đội ngũ EduManager</p>
            </div>
            <div class="footer">
              <p>© 2024 EduManager. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      variables: ['studentName', 'examName', 'subjectName', 'examDate', 'examTime', 'examRoom', 'duration', 'teacherName', 'examDetailsUrl'],
      category: 'notification',
      isActive: true,
      isDefault: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Load default templates into memory
    this.defaultTemplates.forEach(template => {
      this.templates.set(template.id, template);
    });
  }

  // Get all templates
  async getTemplates(): Promise<EmailTemplate[]> {
    try {
      // Try to get from database first
      const dbTemplates = await prisma.emailTemplate.findMany({
        orderBy: { name: 'asc' }
      });

      if (dbTemplates.length > 0) {
        return dbTemplates;
      }

      // Return default templates if no database templates
      return Array.from(this.templates.values());
    } catch (error) {
      console.error('Error getting templates:', error);
      return Array.from(this.templates.values());
    }
  }

  // Get template by ID
  async getTemplate(id: string): Promise<EmailTemplate | null> {
    try {
      // Try cache first
      const cached = await cacheService.get(`email_template:${id}`);
      if (cached) {
        return cached;
      }

      // Try database
      const dbTemplate = await prisma.emailTemplate.findUnique({
        where: { id }
      });

      if (dbTemplate) {
        await cacheService.set(`email_template:${id}`, dbTemplate, { ttl: 3600 });
        return dbTemplate;
      }

      // Return default template
      return this.templates.get(id) || null;
    } catch (error) {
      console.error('Error getting template:', error);
      return this.templates.get(id) || null;
    }
  }

  // Create template
  async createTemplate(template: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<EmailTemplate> {
    try {
      const newTemplate = await prisma.emailTemplate.create({
        data: {
          ...template,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      // Cache the new template
      await cacheService.set(`email_template:${newTemplate.id}`, newTemplate, { ttl: 3600 });

      // Log audit
      await auditService.logUserAction(
        1, // This would be the user ID
        'USER',
        'CREATE',
        'EMAIL_TEMPLATE',
        newTemplate.id,
        { name: template.name, category: template.category }
      );

      return newTemplate;
    } catch (error) {
      console.error('Error creating template:', error);
      throw error;
    }
  }

  // Update template
  async updateTemplate(id: string, updates: Partial<EmailTemplate>): Promise<EmailTemplate | null> {
    try {
      const updatedTemplate = await prisma.emailTemplate.update({
        where: { id },
        data: {
          ...updates,
          updatedAt: new Date()
        }
      });

      // Update cache
      await cacheService.set(`email_template:${id}`, updatedTemplate, { ttl: 3600 });

      // Log audit
      await auditService.logUserAction(
        1, // This would be the user ID
        'USER',
        'UPDATE',
        'EMAIL_TEMPLATE',
        id,
        updates
      );

      return updatedTemplate;
    } catch (error) {
      console.error('Error updating template:', error);
      throw error;
    }
  }

  // Delete template
  async deleteTemplate(id: string): Promise<boolean> {
    try {
      await prisma.emailTemplate.delete({
        where: { id }
      });

      // Remove from cache
      await cacheService.del(`email_template:${id}`);

      // Log audit
      await auditService.logUserAction(
        1, // This would be the user ID
        'USER',
        'DELETE',
        'EMAIL_TEMPLATE',
        id
      );

      return true;
    } catch (error) {
      console.error('Error deleting template:', error);
      throw error;
    }
  }

  // Preview template
  async previewTemplate(id: string, variables: Record<string, any>): Promise<EmailTemplatePreview> {
    try {
      const template = await this.getTemplate(id);
      if (!template) {
        throw new Error('Template not found');
      }

      const subject = this.processTemplate(template.subject, variables);
      const htmlContent = this.processTemplate(template.htmlContent, variables);
      const textContent = template.textContent ? this.processTemplate(template.textContent, variables) : undefined;

      return {
        subject,
        htmlContent,
        textContent
      };
    } catch (error) {
      console.error('Error previewing template:', error);
      throw error;
    }
  }

  // Send email using template
  async sendEmailUsingTemplate(
    templateId: string,
    to: string | string[],
    variables: Record<string, any>,
    options: {
      cc?: string | string[];
      bcc?: string | string[];
      attachments?: any[];
    } = {}
  ): Promise<void> {
    try {
      const template = await this.getTemplate(templateId);
      if (!template) {
        throw new Error(`Template ${templateId} not found`);
      }

      const preview = await this.previewTemplate(templateId, variables);

      await this.emailService.sendEmail({
        to: Array.isArray(to) ? to : [to],
        subject: preview.subject,
        html: preview.htmlContent,
        text: preview.textContent,
        cc: options.cc,
        bcc: options.bcc,
        attachments: options.attachments
      });

      // Log audit
      await auditService.logUserAction(
        1, // This would be the user ID
        'USER',
        'CREATE',
        'EMAIL',
        undefined,
        { templateId, to, variables }
      );
    } catch (error) {
      console.error('Error sending email using template:', error);
      throw error;
    }
  }

  // Test template
  async testTemplate(templateId: string, test: EmailTemplateTest): Promise<void> {
    try {
      await this.sendEmailUsingTemplate(templateId, test.to, test.variables);
    } catch (error) {
      console.error('Error testing template:', error);
      throw error;
    }
  }

  // Get template variables
  getTemplateVariables(templateId: string): EmailTemplateVariable[] {
    const template = this.templates.get(templateId);
    if (!template) {
      return [];
    }

    return template.variables.map(variable => ({
      name: variable,
      label: variable.charAt(0).toUpperCase() + variable.slice(1),
      type: 'string' as const,
      required: true,
      description: `Variable: ${variable}`
    }));
  }

  // Process template variables
  private processTemplate(template: string, variables: Record<string, any>): string {
    let processed = template;

    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      processed = processed.replace(regex, String(value));
    }

    return processed;
  }

  // Validate template
  validateTemplate(template: EmailTemplate): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!template.name || template.name.trim().length === 0) {
      errors.push('Template name is required');
    }

    if (!template.subject || template.subject.trim().length === 0) {
      errors.push('Template subject is required');
    }

    if (!template.htmlContent || template.htmlContent.trim().length === 0) {
      errors.push('Template HTML content is required');
    }

    // Check for required variables
    const variables = this.extractVariables(template.subject + template.htmlContent);
    const missingVariables = variables.filter(v => !template.variables.includes(v));
    
    if (missingVariables.length > 0) {
      errors.push(`Missing variables: ${missingVariables.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Extract variables from template
  private extractVariables(template: string): string[] {
    const regex = /{{([^}]+)}}/g;
    const variables: string[] = [];
    let match;

    while ((match = regex.exec(template)) !== null) {
      variables.push(match[1]);
    }

    return [...new Set(variables)];
  }

  // Clone template
  async cloneTemplate(id: string, newName: string): Promise<EmailTemplate | null> {
    try {
      const originalTemplate = await this.getTemplate(id);
      if (!originalTemplate) {
        return null;
      }

      const clonedTemplate = await this.createTemplate({
        name: newName,
        subject: originalTemplate.subject,
        htmlContent: originalTemplate.htmlContent,
        textContent: originalTemplate.textContent,
        variables: originalTemplate.variables,
        category: originalTemplate.category,
        isActive: false,
        isDefault: false
      });

      return clonedTemplate;
    } catch (error) {
      console.error('Error cloning template:', error);
      throw error;
    }
  }

  // Get template statistics
  async getTemplateStatistics(): Promise<{
    total: number;
    active: number;
    byCategory: Record<string, number>;
  }> {
    try {
      const templates = await this.getTemplates();
      
      const total = templates.length;
      const active = templates.filter(t => t.isActive).length;
      
      const byCategory = templates.reduce((acc, template) => {
        acc[template.category] = (acc[template.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        total,
        active,
        byCategory
      };
    } catch (error) {
      console.error('Error getting template statistics:', error);
      return {
        total: 0,
        active: 0,
        byCategory: {}
      };
    }
  }

  // Export templates
  async exportTemplates(templateIds?: string[]): Promise<EmailTemplate[]> {
    try {
      if (templateIds && templateIds.length > 0) {
        const templates = await Promise.all(
          templateIds.map(id => this.getTemplate(id))
        );
        return templates.filter(t => t !== null) as EmailTemplate[];
      }

      return await this.getTemplates();
    } catch (error) {
      console.error('Error exporting templates:', error);
      throw error;
    }
  }

  // Import templates
  async importTemplates(templates: EmailTemplate[]): Promise<{
    imported: number;
    errors: string[];
  }> {
    try {
      let imported = 0;
      const errors: string[] = [];

      for (const template of templates) {
        try {
          // Check if template already exists
          const existing = await this.getTemplate(template.id);
          if (existing) {
            // Update existing template
            await this.updateTemplate(template.id, {
              name: template.name,
              subject: template.subject,
              htmlContent: template.htmlContent,
              textContent: template.textContent,
              variables: template.variables,
              category: template.category,
              isActive: template.isActive
            });
          } else {
            // Create new template
            await this.createTemplate({
              name: template.name,
              subject: template.subject,
              htmlContent: template.htmlContent,
              textContent: template.textContent,
              variables: template.variables,
              category: template.category,
              isActive: template.isActive,
              isDefault: template.isDefault
            });
          }
          imported++;
        } catch (error) {
          errors.push(`Failed to import template ${template.name}: ${error.message}`);
        }
      }

      return { imported, errors };
    } catch (error) {
      console.error('Error importing templates:', error);
      throw error;
    }
  }
}

export { EmailTemplateService };
