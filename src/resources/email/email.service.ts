import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  async sendVerificationCode(email: string, code: string): Promise<void> {
    await this.transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Your Fyndly verification code',
      text: `Your Fyndly verification code is ${code}. It is valid for 10 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #182235;">
          <h2>Verify your email</h2>
          <p>Your Fyndly verification code is:</p>
          <div style="font-size: 28px; font-weight: 700; letter-spacing: 6px; margin: 20px 0;">
            ${code}
          </div>
          <p>This code is valid for 10 minutes.</p>
          <p>If you did not request this, you can ignore this email.</p>
        </div>
      `,
    });
  }

  async sendResetPasswordCode(email: string, code: string): Promise<void> {
    await this.transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Your Fyndly password reset code',
      text: `Your Fyndly password reset code is ${code}. It is valid for 10 minutes.`,
      html: `
      <div style="font-family: Arial, sans-serif; color: #182235;">
        <h2>Reset your password</h2>
        <p>Your Fyndly password reset code is:</p>
        <div style="font-size: 28px; font-weight: 700; letter-spacing: 6px; margin: 20px 0;">
          ${code}
        </div>
        <p>This code is valid for 10 minutes.</p>
        <p>If you did not request a password reset, you can ignore this email.</p>
      </div>
    `,
    });
  }
}
