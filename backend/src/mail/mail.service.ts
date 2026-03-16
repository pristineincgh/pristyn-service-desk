import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Mailjet from 'node-mailjet';
import {
  EmailVerificationProps,
  ForgotPasswordEmailProps,
  PasswordChangedEmailProps,
  PasswordResetEmailProps,
} from './mail-types';
import { emailVerificationHTML } from './email-templates/email-verification';
import { forgotPasswordHTML } from './email-templates/forgot-password';
import { passwordChangedHTML } from './email-templates/password-changed';
import { passwordResetHTML } from './email-templates/password-reset';

@Injectable()
export class MailService {
  private mailjet: Mailjet;
  private readonly senderEmail: string;
  private readonly senderName: string;

  constructor(private configService: ConfigService) {
    this.mailjet = new Mailjet({
      apiKey: this.configService.get<string>('mailjet.apiKey'),
      apiSecret: this.configService.get<string>('mailjet.apiSecret'),
    });

    this.senderEmail = this.configService.get<string>('mailjet.from', '');
    this.senderName = this.configService.get<string>('mailjet.senderName', '');
  }

  async sendEmailVerification(data: EmailVerificationProps) {
    await this.mailjet.post('send', { version: 'v3.1' }).request({
      Messages: [
        {
          From: {
            Email: this.senderEmail,
            Name: this.senderName,
          },
          To: [
            {
              Email: data.receiverEmail,
            },
          ],
          Subject: 'One More Step — Verify Your Email',
          TextPart: 'Click the button in this email to verify your address.',
          HTMLPart: emailVerificationHTML(data),
        },
      ],
    });
  }

  async sendPasswordChangedConfirmation(data: PasswordChangedEmailProps) {
    await this.mailjet.post('send', { version: 'v3.1' }).request({
      Messages: [
        {
          From: {
            Email: this.senderEmail,
            Name: this.senderName,
          },
          To: [
            {
              Email: data.receiverEmail,
            },
          ],
          Subject: 'Your password was changed successfully',
          TextPart:
            'This email confirms that your Pristyn Service Desk password was changed.',
          HTMLPart: passwordChangedHTML(data),
        },
      ],
    });
  }

  async sendForgotPasswordEmail(data: ForgotPasswordEmailProps) {
    await this.mailjet.post('send', { version: 'v3.1' }).request({
      Messages: [
        {
          From: {
            Email: this.senderEmail,
            Name: this.senderName,
          },
          To: [
            {
              Email: data.receiverEmail,
            },
          ],
          Subject: 'Reset your password',
          TextPart:
            'Use the link in this email to reset your Pristyn Service Desk password.',
          HTMLPart: forgotPasswordHTML(data),
        },
      ],
    });
  }

  async sendPasswordResetNotification(data: PasswordResetEmailProps) {
    await this.mailjet.post('send', { version: 'v3.1' }).request({
      Messages: [
        {
          From: {
            Email: this.senderEmail,
            Name: this.senderName,
          },
          To: [
            {
              Email: data.receiverEmail,
            },
          ],
          Subject: 'Your password has been reset',
          TextPart:
            'A moderator reset your Pristyn Service Desk password. Check this email for your temporary password.',
          HTMLPart: passwordResetHTML(data),
        },
      ],
    });
  }
}
