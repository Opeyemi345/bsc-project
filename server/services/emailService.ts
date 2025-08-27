import nodemailer from 'nodemailer';
import { AppError } from '../utils/errorHandler';

// Email templates
interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

interface EmailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    path?: string;
    content?: Buffer;
    contentType?: string;
  }>;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Debug environment variables
    console.log('Gmail User:', process.env.GMAIL_USER ? 'Set' : 'Not set');
    console.log('Gmail App Password:', process.env.GMAIL_APP_PASSWORD ? 'Set' : 'Not set');

    // Check if Gmail credentials are available
    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
      console.log('Using Gmail service configuration');
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      });
    } else {
      console.log('Gmail credentials missing, using SMTP fallback');
      // Fallback to SMTP configuration
      this.transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.MAIL_PORT || '587'),
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.MAIL_USER || process.env.GMAIL_USER,
          pass: process.env.MAIL_PASS || process.env.GMAIL_APP_PASSWORD,
        },
        tls: {
          rejectUnauthorized: false
        }
      });
    }
  }

  // Verify email configuration
  async verifyConnection(): Promise<boolean> {
    try {
      console.log('Verifying email service connection...');
      await this.transporter.verify();
      console.log('✅ Email service is ready to send emails');
      return true;
    } catch (error: any) {
      console.warn('❌ Email service verification failed - continuing without email features');
      console.error('Email error details:', error.message);

      if (error.code === 'EAUTH') {
        console.log('🔧 Authentication failed. Please check:');
        console.log('   1. Gmail App Password is correct (no spaces, no quotes)');
        console.log('   2. 2-Factor Authentication is enabled on Gmail');
        console.log('   3. App Password was generated recently');
      } else if (error.code === 'ECONNECTION') {
        console.log('🔧 Connection failed. Please check your internet connection');
      } else {
        console.log('🔧 To fix: Generate a new Gmail App Password and update GMAIL_APP_PASSWORD in .env');
      }

      return false;
    }
  }

  // Send email
  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const mailOptions = {
        from: `"OausConnect" <${process.env.GMAIL_USER}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        attachments: options.attachments,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      throw new AppError('Failed to send email', 500);
    }
  }

  // Welcome email template
  getWelcomeEmailTemplate(name: string, email: string, verificationUrl?: string): EmailTemplate {
    const subject = 'Welcome to OausConnect! 🎓';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to OausConnect</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to OausConnect! 🎓</h1>
            <p>Your University Social Network</p>
          </div>
          <div class="content">
            <h2>Hello ${name}!</h2>
            <p>Welcome to OausConnect, the premier social networking platform for university students and staff. We're excited to have you join our community!</p>
            
            <h3>What you can do on OausConnect:</h3>
            <ul>
              <li>📝 Share posts and updates with your university community</li>
              <li>💬 Chat with classmates and professors in real-time</li>
              <li>👥 Join communities based on your interests and courses</li>
              <li>📚 Collaborate on projects and study groups</li>
              <li>🎯 Stay updated with university news and events</li>
            </ul>
            
            ${verificationUrl ? `
              <p>To get started, please verify your email address by clicking the button below:</p>
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
              </div>
              <p><small>If the button doesn't work, copy and paste this link into your browser: ${verificationUrl}</small></p>
            ` : `
              <p>Your account is ready to use! You can now log in and start connecting with your university community.</p>
              <div style="text-align: center;">
                <a href="${process.env.CLIENT_URL}/auth" class="button">Login to OausConnect</a>
              </div>
            `}
            
            <p>If you have any questions or need help getting started, don't hesitate to reach out to our support team.</p>
            
            <p>Best regards,<br>The OausConnect Team</p>
          </div>
          <div class="footer">
            <p>© 2024 OausConnect. All rights reserved.</p>
            <p>This email was sent to ${email}. If you didn't create an account, please ignore this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Welcome to OausConnect! 🎓
      
      Hello ${name}!
      
      Welcome to OausConnect, the premier social networking platform for university students and staff. We're excited to have you join our community!
      
      What you can do on OausConnect:
      - Share posts and updates with your university community
      - Chat with classmates and professors in real-time
      - Join communities based on your interests and courses
      - Collaborate on projects and study groups
      - Stay updated with university news and events
      
      ${verificationUrl ? `
        To get started, please verify your email address by visiting: ${verificationUrl}
      ` : `
        Your account is ready to use! You can now log in at: ${process.env.CLIENT_URL}/auth
      `}
      
      If you have any questions or need help getting started, don't hesitate to reach out to our support team.
      
      Best regards,
      The OausConnect Team
      
      © 2024 OausConnect. All rights reserved.
    `;

    return { subject, html, text };
  }

  // Password reset email template
  getPasswordResetEmailTemplate(name: string, email: string, resetUrl: string): EmailTemplate {
    const subject = 'Reset Your OausConnect Password 🔐';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #f5576c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request 🔐</h1>
          </div>
          <div class="content">
            <h2>Hello ${name}!</h2>
            <p>We received a request to reset your OausConnect password. If you made this request, click the button below to reset your password:</p>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </div>
            
            <p><small>If the button doesn't work, copy and paste this link into your browser: ${resetUrl}</small></p>
            
            <div class="warning">
              <strong>⚠️ Important Security Information:</strong>
              <ul>
                <li>This link will expire in 1 hour for security reasons</li>
                <li>If you didn't request this password reset, please ignore this email</li>
                <li>Never share this link with anyone</li>
                <li>Make sure you're on the official OausConnect website when resetting your password</li>
              </ul>
            </div>
            
            <p>If you continue to have problems, please contact our support team.</p>
            
            <p>Best regards,<br>The OausConnect Security Team</p>
          </div>
          <div class="footer">
            <p>© 2024 OausConnect. All rights reserved.</p>
            <p>This email was sent to ${email} for security purposes.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Password Reset Request 🔐
      
      Hello ${name}!
      
      We received a request to reset your OausConnect password. If you made this request, visit this link to reset your password:
      
      ${resetUrl}
      
      Important Security Information:
      - This link will expire in 1 hour for security reasons
      - If you didn't request this password reset, please ignore this email
      - Never share this link with anyone
      - Make sure you're on the official OausConnect website when resetting your password
      
      If you continue to have problems, please contact our support team.
      
      Best regards,
      The OausConnect Security Team
      
      © 2024 OausConnect. All rights reserved.
    `;

    return { subject, html, text };
  }

  // Email verification template
  getEmailVerificationTemplate(name: string, email: string, verificationUrl: string): EmailTemplate {
    const subject = 'Verify Your OausConnect Email Address ✉️';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #4facfe; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Verify Your Email Address ✉️</h1>
          </div>
          <div class="content">
            <h2>Hello ${name}!</h2>
            <p>Thank you for signing up for OausConnect! To complete your registration and start connecting with your university community, please verify your email address.</p>
            
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button">Verify Email Address</a>
            </div>
            
            <p><small>If the button doesn't work, copy and paste this link into your browser: ${verificationUrl}</small></p>
            
            <p>Once verified, you'll be able to:</p>
            <ul>
              <li>Access all OausConnect features</li>
              <li>Receive important notifications</li>
              <li>Reset your password if needed</li>
              <li>Join university communities</li>
            </ul>
            
            <p>This verification link will expire in 24 hours for security reasons.</p>
            
            <p>If you didn't create an OausConnect account, please ignore this email.</p>
            
            <p>Best regards,<br>The OausConnect Team</p>
          </div>
          <div class="footer">
            <p>© 2024 OausConnect. All rights reserved.</p>
            <p>This email was sent to ${email}.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Verify Your Email Address ✉️
      
      Hello ${name}!
      
      Thank you for signing up for OausConnect! To complete your registration and start connecting with your university community, please verify your email address by visiting:
      
      ${verificationUrl}
      
      Once verified, you'll be able to:
      - Access all OausConnect features
      - Receive important notifications
      - Reset your password if needed
      - Join university communities
      
      This verification link will expire in 24 hours for security reasons.
      
      If you didn't create an OausConnect account, please ignore this email.
      
      Best regards,
      The OausConnect Team
      
      © 2024 OausConnect. All rights reserved.
    `;

    return { subject, html, text };
  }

  // Send welcome email
  async sendWelcomeEmail(to: string, name: string, verificationUrl?: string): Promise<boolean> {
    const template = this.getWelcomeEmailTemplate(name, to, verificationUrl || '');
    return this.sendEmail({
      to,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  // Send password reset email
  async sendPasswordResetEmail(to: string, name: string, resetUrl: string): Promise<boolean> {
    const template = this.getPasswordResetEmailTemplate(name, to, resetUrl);
    return this.sendEmail({
      to,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  // Send email verification
  async sendEmailVerification(to: string, name: string, verificationUrl: string): Promise<boolean> {
    const template = this.getEmailVerificationTemplate(name, to, verificationUrl);
    return this.sendEmail({
      to,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  // Send notification email
  async sendNotificationEmail(to: string, subject: string, message: string): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">OausConnect Notification</h2>
        <p style="color: #666; line-height: 1.6;">${message}</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #999; font-size: 12px;">
          This is an automated notification from OausConnect. Please do not reply to this email.
        </p>
      </div>
    `;

    return this.sendEmail({
      to,
      subject: `OausConnect: ${subject}`,
      html,
      text: message,
    });
  }
}

// Create singleton instance
export const emailService = new EmailService();

// Initialize email service
export const initializeEmailService = async (): Promise<void> => {
  const isReady = await emailService.verifyConnection();
  if (!isReady) {
    console.warn('Email service is not properly configured. Email features will be disabled.');
  }
};
