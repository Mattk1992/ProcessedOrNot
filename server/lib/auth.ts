import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

// Password hashing utilities
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

// Token generation utilities
export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function generatePasswordResetToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function generateEmailVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Email utilities (placeholder - configure with real SMTP settings)
export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  // Configure with real SMTP settings in production
  if (process.env.NODE_ENV === 'development') {
    console.log('📧 Email would be sent to:', to);
    console.log('📧 Subject:', subject);
    console.log('📧 Content:', html);
    return;
  }

  // Real email configuration for production
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.FROM_EMAIL || 'noreply@processedornot.com',
    to,
    subject,
    html,
  });
}

export async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
  const resetUrl = `${process.env.BASE_URL || 'http://localhost:5000'}/reset-password?token=${token}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2563eb; margin: 0;">ProcessedOrNot Scanner</h1>
        <p style="color: #6b7280; margin: 5px 0;">Password Reset Request</p>
      </div>
      
      <div style="background: #f8fafc; border-radius: 8px; padding: 30px; margin: 20px 0;">
        <h2 style="color: #1f2937; margin-top: 0;">Reset Your Password</h2>
        <p style="color: #4b5563; line-height: 1.6;">
          We received a request to reset your password. Click the button below to create a new password:
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background: #2563eb; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 6px; display: inline-block;
                    font-weight: 500;">
            Reset Password
          </a>
        </div>
        
        <p style="color: #6b7280; font-size: 14px; margin-bottom: 0;">
          This link will expire in 1 hour. If you didn't request this reset, you can safely ignore this email.
        </p>
      </div>
      
      <div style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 30px;">
        <p>© 2025 ProcessedOrNot Scanner. All rights reserved.</p>
      </div>
    </div>
  `;

  await sendEmail(email, 'Reset Your Password - ProcessedOrNot Scanner', html);
}

export async function sendEmailVerification(email: string, token: string): Promise<void> {
  const verifyUrl = `${process.env.BASE_URL || 'http://localhost:5000'}/verify-email?token=${token}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2563eb; margin: 0;">ProcessedOrNot Scanner</h1>
        <p style="color: #6b7280; margin: 5px 0;">Welcome to ProcessedOrNot!</p>
      </div>
      
      <div style="background: #f8fafc; border-radius: 8px; padding: 30px; margin: 20px 0;">
        <h2 style="color: #1f2937; margin-top: 0;">Verify Your Email</h2>
        <p style="color: #4b5563; line-height: 1.6;">
          Thank you for registering! Please verify your email address to activate your account:
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verifyUrl}" 
             style="background: #10b981; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 6px; display: inline-block;
                    font-weight: 500;">
            Verify Email
          </a>
        </div>
        
        <p style="color: #6b7280; font-size: 14px; margin-bottom: 0;">
          This link will expire in 24 hours. If you didn't create this account, you can safely ignore this email.
        </p>
      </div>
      
      <div style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 30px;">
        <p>© 2025 ProcessedOrNot Scanner. All rights reserved.</p>
      </div>
    </div>
  `;

  await sendEmail(email, 'Verify Your Email - ProcessedOrNot Scanner', html);
}

// Session utilities
export function isValidSession(lastLoginAt: Date | null): boolean {
  if (!lastLoginAt) return false;
  
  const sessionTimeout = 7 * 24 * 60 * 60 * 1000; // 7 days
  const now = new Date();
  const sessionExpiry = new Date(lastLoginAt.getTime() + sessionTimeout);
  
  return now < sessionExpiry;
}

export function sanitizeUser(user: any): any {
  const { passwordHash, passwordResetToken, emailVerificationToken, ...sanitizedUser } = user;
  return sanitizedUser;
}