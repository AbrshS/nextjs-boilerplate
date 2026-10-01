import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { MailerService } from '../mailer/mailer.service';
import { Logger } from '@nestjs/common';

@Processor('mail')
export class MailProcessor extends WorkerHost {
  private readonly logger = new Logger(MailProcessor.name);

  constructor(private readonly mailerService: MailerService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    if (job.name === 'send') {
      const { to, subject, text, templatePath, context, attachments } =
        job.data;
      this.logger.log(`Processing background email job ${job.id} to: ${to}`);
      try {
        await this.mailerService.sendMail({
          to,
          subject,
          text,
          templatePath,
          context,
          attachments,
        });
        this.logger.log(`Successfully sent email to ${to} (Job ID: ${job.id})`);
      } catch (error) {
        this.logger.error(
          `Failed to send email to ${to} (Job ID: ${job.id}): ${error.message}`,
          error.stack,
        );
        throw error;
      }
    }
  }
}
