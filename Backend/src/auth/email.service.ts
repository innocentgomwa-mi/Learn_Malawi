import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly configService: ConfigService) {}

  private async sendMessage(email: string, subject: string, message: string) {
    const from = this.configService.get<string>('EMAIL_FROM') || `no-reply@${this.configService.get<string>('APP_DOMAIN') || 'example.com'}`;
    const host = this.configService.get<string>('EMAIL_HOST');
    const port = this.configService.get<number>('EMAIL_PORT');
    const user = this.configService.get<string>('EMAIL_USER');
    const pass = this.configService.get<string>('EMAIL_PASS');
    const secure = this.configService.get<string>('EMAIL_SECURE') === 'true';

    if (host && port && user && pass) {
      try {
        const transporter = nodemailer.createTransport({
          host,
          port,
          secure,
          auth: {
            user,
            pass,
          },
        });

        await transporter.sendMail({
          from,
          to: email,
          subject,
          text: message,
        });

        this.logger.log(`Email sent to ${email}`);
        return;
      } catch (error) {
        this.logger.error(`Failed to send email to ${email}`, error as Error);
        throw new InternalServerErrorException('Unable to send email notification.');
      }
    }

    this.logger.warn('SMTP email credentials are not configured. Logging outgoing message instead of sending an email.');
    this.logger.log(`Sending email to ${email}`);
    this.logger.log(`From: ${from}`);
    this.logger.log(`Subject: ${subject}`);
    this.logger.log(message);
  }

  async sendVerificationCode(email: string, code: string) {
    const appName = this.configService.get<string>('APP_NAME') || 'Learn Malawi';
    const subject = `${appName} verification code`;
    const message = `Hello,\n\nYour ${appName} verification code is ${code}. It will expire in 60 seconds.\n\nIf you did not request this code, please ignore this email.\n\nThank you,\n${appName} team`;

    await this.sendMessage(email, subject, message);
  }

  async sendEmail(email: string, subject: string, message: string) {
    await this.sendMessage(email, subject, message);
  }

  async sendPasswordResetCode(email: string, code: string) {
    const appName = this.configService.get<string>('APP_NAME') || 'Learn Malawi';
    const subject = `${appName} password reset code`;
    const message = `Hello,\n\nYour ${appName} password reset code is ${code}. It will expire in 2 minutes.\n\nIf you did not request this code, please ignore this email or contact support.\n\nThank you,\n${appName} team`;

    await this.sendMessage(email, subject, message);
  }

  async sendPasswordUpdateReminder(email: string, message: string, subject?: string) {
    const appName = this.configService.get<string>('APP_NAME') || 'Learn Malawi';
    const emailSubject = subject || `${appName} password security reminder`;
    const body = `${message}\n\nIf you need to reset your password, please use the account settings page or contact support.`;

    await this.sendMessage(email, emailSubject, body);
  }
}
