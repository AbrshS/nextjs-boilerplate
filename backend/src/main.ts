import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  const port = process.env.APP_PORT || 4000;
  const prefix = process.env.APP_API_PREFIX || 'api';

  app.enableShutdownHooks();
  app.setGlobalPrefix(prefix, { exclude: ['/'] });
  app.enableVersioning({ type: VersioningType.URI });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const config = new DocumentBuilder()
    .setTitle('Fanaye Technologies API')
    .setDescription('Enterprise Full-Stack Boilerplate API Specification')
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
