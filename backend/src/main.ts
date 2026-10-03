import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { RedisIoAdapter } from './notifications/redis-io.adapter';
import { requestDeviceContext } from './session/request-device.context';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  const port = process.env.APP_PORT || 4000;
  const prefix = process.env.APP_API_PREFIX || 'api';

  // Capture BFF-forwarded client device metadata for multi-device auditing
  app.use((req: any, _res: any, next: () => void) => {
    const rawDevice = req.headers?.['x-device-id'];
    const deviceId = Array.isArray(rawDevice) ? rawDevice[0] : rawDevice;
    const rawUa = req.headers?.['user-agent'];
    const userAgent = Array.isArray(rawUa) ? rawUa[0] : rawUa;
    const ipAddress = (req.headers?.['x-forwarded-for'] as string) || req.socket?.remoteAddress;
    requestDeviceContext.run({ deviceId, userAgent, ipAddress }, () => next());
  });

  // Attach Socket.IO clustered Redis adapter
  const redisIoAdapter = new RedisIoAdapter(app);
  redisIoAdapter.connectToRedis();
  app.useWebSocketAdapter(redisIoAdapter);

  app.enableShutdownHooks();
  app.setGlobalPrefix(prefix, { exclude: ['/'] });
  app.enableVersioning({ type: VersioningType.URI });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const config = new DocumentBuilder()
    .setTitle('Fanaye Technologies API')
    .setDescription('Enterprise Full-Stack Boilerplate API Specification (2026 Edition)')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(port, '0.0.0.0');
  console.log(`[Fanaye API] Server running on http://localhost:${port}/${prefix}`);
  console.log(`[Fanaye API] Swagger documentation on http://localhost:${port}/docs`);
}

void bootstrap();
