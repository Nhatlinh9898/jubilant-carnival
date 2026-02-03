import nodemailer from 'nodemailer';
import fs from 'fs/promises';
import path from 'path';
import { prisma } from '@/index';

interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

interface EmailOptions {
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  subject: string;
  html: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    path: string;
    contentType?: string;
  }>;
}

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Send email
  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      const mailOptions = {
        from: `"${process.env.FROM_NAME || 'EduManager'}" <${process.env.FROM_EMAIL}>`,
        to: options.to,
        cc: options.cc,
        bcc: options.bcc,
        subject: options.subject,
        html: options.html,
        text: options.text,
        attachments: options.attachments,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent: ' + info.messageId);
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error(`Failed to send email: ${error}`);
    }
  }

  // Load email template
  private async loadTemplate(templateName: string, data: any = {}): Promise<EmailTemplate> {
    try {
      const templatePath = path.join(process.cwd(), 'src', 'templates', 'emails', `${templateName}.html`);
      const template = await fs.readFile(templatePath, 'utf-8');

      // Replace placeholders with data
      let processedTemplate = template;
      Object.keys(data).forEach(key => {
        const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
        processedTemplate = processedTemplate.replace(regex, data[key]);
      });

      // Extract subject from template
      const subjectMatch = processedTemplate.match(/<title>(.*?)<\/title>/);
      const subject = subjectMatch ? subjectMatch[1] : 'EduManager Notification';

      // Remove title tag from HTML
      const html = processedTemplate.replace(/<title>.*?<\/title>/, '');

      return {
        subject,
        html,
        text: this.htmlToText(html)
      };
    } catch (error) {
      console.error('Error loading template:', error);
      throw new Error(`Failed to load email template: ${templateName}`);
    }
  }

  // Convert HTML to plain text
  private htmlToText(html: string): string {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Send welcome email
  async sendWelcomeEmail(userEmail: string, userName: string, userRole: string): Promise<void> {
    const template = await this.loadTemplate('welcome', {
      userName,
      userRole,
      loginUrl: `${process.env.FRONTEND_URL}/login`,
      supportEmail: process.env.SUPPORT_EMAIL
    });

    await this.sendEmail({
      to: userEmail,
      ...template
    });
  }

  // Send password reset email
  async sendPasswordResetEmail(userEmail: string, resetToken: string, userName: string): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const template = await this.loadTemplate('password-reset', {
      userName,
      resetUrl,
      expiryHours: 1
    });

    await this.sendEmail({
      to: userEmail,
      ...template
    });
  }

  // Send attendance notification
  async sendAttendanceNotification(parentEmail: string, studentName: string, attendanceData: any): Promise<void> {
    const template = await this.loadTemplate('attendance-notification', {
      parentName: parentEmail.split('@')[0], // Extract name from email
      studentName,
      date: attendanceData.date,
      status: attendanceData.status,
      notes: attendanceData.notes || 'Không có ghi chú',
      teacherName: attendanceData.teacherName
    });

    await this.sendEmail({
      to: parentEmail,
      ...template
    });
  }

  // Send grade notification
  async sendGradeNotification(parentEmail: string, studentName: string, gradeData: any): Promise<void> {
    const template = await this.loadTemplate('grade-notification', {
      parentName: parentEmail.split('@')[0],
      studentName,
      subjectName: gradeData.subjectName,
      score: gradeData.score,
      maxScore: gradeData.maxScore,
      examType: gradeData.examType,
      date: gradeData.date
    });

    await this.sendEmail({
      to: parentEmail,
      ...template
    });
  }

  // Send invoice notification
  async sendInvoiceNotification(userEmail: string, invoiceData: any): Promise<void> {
    const template = await this.loadTemplate('invoice-notification', {
      userName: invoiceData.userName,
      invoiceTitle: invoiceData.title,
      amount: invoiceData.amount,
      dueDate: invoiceData.dueDate,
      paymentUrl: `${process.env.FRONTEND_URL}/finance/pay/${invoiceData.id}`
    });

    await this.sendEmail({
      to: userEmail,
      ...template
    });
  }

  // Send exam reminder
  async sendExamReminder(studentEmail: string, examData: any): Promise<void> {
    const template = await this.loadTemplate('exam-reminder', {
      studentName: examData.studentName,
      examTitle: examData.title,
      subjectName: examData.subjectName,
      examDate: examData.date,
      examTime: examData.time,
      examRoom: examData.room,
      duration: examData.duration
    });

    await this.sendEmail({
      to: studentEmail,
      ...template
    });
  }

  // Send monthly report
  async sendMonthlyReport(userEmail: string, reportData: any): Promise<void> {
    const template = await this.loadTemplate('monthly-report', {
      userName: reportData.userName,
      month: reportData.month,
      year: reportData.year,
      attendanceRate: reportData.attendanceRate,
      averageGrade: reportData.averageGrade,
      totalSubjects: reportData.totalSubjects,
      achievements: reportData.achievements || [],
      areasForImprovement: reportData.areasForImprovement || []
    });

    await this.sendEmail({
      to: userEmail,
      ...template
    });
  }

  // Send library notification
  async sendLibraryNotification(userEmail: string, bookData: any): Promise<void> {
    const template = await this.loadTemplate('library-notification', {
      userName: bookData.userName,
      bookTitle: bookData.title,
      author: bookData.author,
      borrowDate: bookData.borrowDate,
      dueDate: bookData.dueDate,
      renewalUrl: `${process.env.FRONTEND_URL}/library/renew/${bookData.bookId}`
    });

    await this.sendEmail({
      to: userEmail,
      ...template
    });
  }

  // Send event notification
  async sendEventNotification(userEmail: string, eventData: any): Promise<void> {
    const template = await this.loadTemplate('event-notification', {
      userName: eventData.userName,
      eventTitle: eventData.title,
      eventDate: eventData.date,
      eventTime: eventData.time,
      eventLocation: eventData.location,
      description: eventData.description
    });

    await this.sendEmail({
      to: userEmail,
      ...template
    });
  }

  // Send bulk email to multiple recipients
  async sendBulkEmail(recipients: string[], templateName: string, data: any = {}): Promise<void> {
    const template = await this.loadTemplate(templateName, data);
    
    const emailPromises = recipients.map(email => 
      this.sendEmail({
        to: email,
        ...template
      })
    );

    await Promise.all(emailPromises);
  }

  // Send email with attachments
  async sendEmailWithAttachments(
    userEmail: string, 
    subject: string, 
    html: string, 
    attachments: Array<{ filename: string; path: string }>
  ): Promise<void> {
    await this.sendEmail({
      to: userEmail,
      subject,
      html,
      attachments
    });
  }

  // Verify email configuration
  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('Email verification failed:', error);
      return false;
    }
  }

  // Create email templates directory and default templates
  async createDefaultTemplates(): Promise<void> {
    const templatesDir = path.join(process.cwd(), 'src', 'templates', 'emails');
    
    try {
      await fs.mkdir(templatesDir, { recursive: true });
    } catch (error) {
      // Directory already exists
    }

    const templates = {
      'welcome.html': `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Chào mừng đến với EduManager</title>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4f46e5; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9fafb; }
            .button { display: inline-block; background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Chào mừng đến với EduManager!</h1>
            </div>
            <div class="content">
              <p>Xin chào {{ userName }},</p>
              <p>Chúng tôi rất vui mừng chào đón bạn đến với hệ thống quản lý giáo dục EduManager với vai trò là {{ userRole }}.</p>
              <p>Bạn có thể đăng nhập vào hệ thống bằng cách nhấp vào nút bên dưới:</p>
              <p style="text-align: center; margin: 20px 0;">
                <a href="{{ loginUrl }}" class="button">Đăng nhập ngay</a>
              </p>
              <p>Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi tại {{ supportEmail }}.</p>
              <p>Trân trọng,<br>Đội ngũ EduManager</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 EduManager. Tất cả quyền được bảo lưu.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      
      'password-reset.html': `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Đặt lại mật khẩu</title>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #ef4444; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9fafb; }
            .button { display: inline-block; background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Đặt lại mật khẩu</h1>
            </div>
            <div class="content">
              <p>Xin chào {{ userName }},</p>
              <p>Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
              <p>Vui lòng nhấp vào nút bên dưới để đặt lại mật khẩu của bạn:</p>
              <p style="text-align: center; margin: 20px 0;">
                <a href="{{ resetUrl }}" class="button">Đặt lại mật khẩu</a>
              </p>
              <p><strong>Lưu ý:</strong> Link này sẽ hết hiệu lực sau {{ expiryHours }} giờ.</p>
              <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
              <p>Trân trọng,<br>Đội ngũ EduManager</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 EduManager. Tất cả quyền được bảo lưu.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    for (const [filename, content] of Object.entries(templates)) {
      const filePath = path.join(templatesDir, filename);
      try {
        await fs.access(filePath);
      } catch {
        await fs.writeFile(filePath, content);
      }
    }
  }
}

export { EmailService };
