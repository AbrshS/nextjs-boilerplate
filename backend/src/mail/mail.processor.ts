import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { MailService } from './mail.service';
import { Logger } from '@nestjs/common';

@Processor('mail')
export class MailProcessor extends WorkerHost {
  private readonly logger = new Logger(MailProcessor.name);

  constructor(private readonly mailService: MailService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    if (job.name === 'send') {
      const { to, subject, text, html, templateString, context } = job.data;
      this.logger.log(`Processing asynchronous email job #${job.id} to: ${to}`);

      try {
        const result = await this.mailService.sendMail({
          to,
          subject,
          text,
          html,
          templateString,
          context,
        });
        this.logger.log(`Successfully completed email job #${job.id} for ${to}`);
        return result;
      } catch (error: any) {
        this.logger.error(
          `Failed processing email job #${job.id} for ${to}: ${error?.message}`,
          error?.stack,
        );
        throw error;
      }
    }
  }
}
