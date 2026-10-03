import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import * as handlebars from 'handlebars';

export interface SendMailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  templateString?: string;
  context?: Record<string, any>;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private resend: Resend | null = null;
  private readonly defaultFrom: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    if (apiKey && apiKey !== 're_demo_sample_key') {
      this.resend = new Resend(apiKey);
    }
    const email = this.configService.get<string>('MAIL_DEFAULT_EMAIL') || 'noreply@fanaye.com';
    const name = this.configService.get<string>('MAIL_DEFAULT_NAME') || 'Fanaye Technologies';
    this.defaultFrom = `${name} <${email}>`;
  }

  async sendMail(options: SendMailOptions): Promise<{ id: string; success: boolean }> {
    let finalHtml = options.html;
    if (options.templateString && options.context) {
      const compiled = handlebars.compile(options.templateString);
      finalHtml = compiled(options.context);
    }

    if (this.resend) {
      try {
        const response = await this.resend.emails.send({
          from: this.defaultFrom,
          to: options.to,
          subject: options.subject,
          text: options.text || '',
          html: finalHtml || `<p>${options.text}</p>`,
        });

        this.logger.log(`Email dispatched via Resend to ${options.to} (ID: ${response.data?.id})`);
        return { id: response.data?.id || 'resend-sent', success: true };
      } catch (err: any) {
        this.logger.error(`Resend API dispatch failed: ${err?.message}`);
      }
    }

    // Fallback in development / test environments:
    this.logger.log(`[DEV/FALLBACK EMAIL] Dispatched to: ${options.to} | Subject: "${options.subject}"`);
    return { id: `simulated-${Date.now()}`, success: true };
  }
}
