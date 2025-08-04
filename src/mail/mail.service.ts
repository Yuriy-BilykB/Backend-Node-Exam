import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import {ConfigService} from "@nestjs/config";
@Injectable()
export class MailService {
    private readonly logger = new Logger(MailService.name);
    
    constructor(private readonly configService: ConfigService) {}
    emailTransport(){
        const transporter = nodemailer.createTransport({
            host: this.configService.get<string>('EMAIL_HOST'),
            port: this.configService.get<number>('EMAIL_PORT'),
            secure: true,
            auth: {
                user: this.configService.get<string>('EMAIL_USER'),
                pass: this.configService.get<string>('EMAIL_PASSWORD'),
            }
        });
        return transporter;
    }

    async sendEmail(to: string, token: string) {
        if (!to || !token) {
            throw new InternalServerErrorException('Email and token are required');
        }
        
        const resetUrl = `http://localhost:3000/reset-password?token=${token}`;
        const transport = this.emailTransport();
        const mailOptions = {
            from: `"Support" <${process.env.EMAIL_USER}>`,
            to,
            subject: 'Password recovery',
            html: `
        <h2>Reset your password</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>This link will expire soon.</p>
      `,
        };
        try {
            await transport.sendMail(mailOptions);
            this.logger.log(`Password recovery email sent to ${to}`);
        } catch (error) {
            this.logger.error(`Failed to send email to ${to}:`, error);
            throw new InternalServerErrorException('Failed to send email');
        }
    }
}
