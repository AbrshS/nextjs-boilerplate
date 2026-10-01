import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrapWorker() {
  const logger = new Logger('WorkerBootstrap');
  logger.log('Starting MODRN BullMQ Background Worker Process...');

  // Create standalone NestJS application context without starting HTTP server
  const app = await NestFactory.createApplicationContext(AppModule);
  app.enableShutdownHooks();

  logger.log('MODRN BullMQ Background Worker is running and processing jobs.');

  process.on('SIGTERM', async () => {
    logger.log('SIGTERM received — closing worker process gracefully...');
    await app.close();
    process.exit(0);
  });
}

void bootstrapWorker();
