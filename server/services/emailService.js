import crypto from 'crypto';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

class EmailService {
  constructor() {
    // Initialize transporter only if email credentials are provided
    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      console.log('✅ Email service initialized with NodeMailer');
    } else {
      console.log('⚠️  Email credentials not found. OTP emails will fail until SMTP is configured.');
      this.transporter = null;
    }
  }

  // Generate 6-digit OTP
  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Send OTP email
  async sendOTPEmail(email, otp, username) {
    if (this.transporter) {
      // Send actual email using NodeMailer
      try {
        await this.transporter.sendMail({
          from: `"Educational Platform" <${process.env.SENDER_EMAIL}>`,
          to: email,
          subject: 'Verify Your Email - Educational Platform',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #0ea5e9;">Email Verification</h2>
              <p>Hello <strong>${username}</strong>,</p>
              <p>Thank you for registering! Please use the following OTP to verify your email:</p>
              <div style="background: linear-gradient(135deg, #0ea5e9, #d946ef); padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0;">
                <h1 style="color: white; letter-spacing: 10px; margin: 0;">${otp}</h1>
              </div>
              <p>This OTP will expire in <strong>10 minutes</strong>.</p>
              <p>If you didn't request this, please ignore this email.</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
              <p style="color: #666; font-size: 12px;">Educational Platform - Learning Made Easy</p>
            </div>
          `,
        });
        console.log(`✅ OTP email sent to ${email}`);
      } catch (error) {
        console.error('❌ Failed to send OTP email:', error.message);
      }
    } else {
      console.error('❌ Cannot send OTP email: SMTP transporter not initialized');
    }

    return true;
  }

  // Send welcome email after verification
  async sendWelcomeEmail(email, username) {
    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from: `"Educational Platform" <${process.env.SENDER_EMAIL}>`,
          to: email,
          subject: 'Welcome to Educational Platform!',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #10b981;">🎉 Welcome to Educational Platform!</h2>
              <p>Hello <strong>${username}</strong>,</p>
              <p>Your email has been verified successfully!</p>
              <p>You can now access all features of the platform:</p>
              <ul>
                <li>📚 Browse and upload notes</li>
                <li>✏️ Take quizzes and track your progress</li>
                <li>💬 Join discussions</li>
                <li>🏆 Earn XP and badges</li>
                <li>And much more!</li>
              </ul>
              <p>Happy Learning! 🚀</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
              <p style="color: #666; font-size: 12px;">Educational Platform - Learning Made Easy</p>
            </div>
          `,
        });
        console.log(`✅ Welcome email sent to ${email}`);
      } catch (error) {
        console.error('❌ Failed to send welcome email:', error.message);
      }
    } else {
      console.log('\n🎉 ===== WELCOME EMAIL =====');
      console.log(`To: ${email}`);
      console.log(`Subject: Welcome to Educational Platform!`);
      console.log(`\nWelcome ${username}!`);
      console.log(`Your email has been verified successfully.`);
      console.log(`You can now access all features of the platform.`);
      console.log('===========================\n');
    }

    return true;
  }
}

export default new EmailService();
