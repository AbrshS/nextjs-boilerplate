import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrapWorker() {
  const logger = new Logger('WorkerBootstrap');
  logger.log('Starting Fanaye BullMQ Background Worker Process...');

  const app = await NestFactory.createApplicationContext(AppModule);
  app.enableShutdownHooks();

  logger.log('Fanaye BullMQ Worker process initialized.');

  process.on('SIGTERM', async () => {
    logger.log('SIGTERM received — closing worker process gracefully...');
    await app.close();
    process.exit(0);
  });
}

void bootstrapWorker();
