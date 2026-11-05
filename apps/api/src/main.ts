import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  // rawBody is required to verify Stripe webhook signatures
  const app = await NestFactory.create(AppModule, { rawBody: true });
  const config = app.get(ConfigService);

  app.use(helmet());
  app.enableCors({
    origin: config.get<string>('CORS_ORIGINS', '').split(',').map((s) => s.trim()).filter(Boolean),
    credentials: true,
  });
  app.enableShutdownHooks();

  const doc = new DocumentBuilder()
    .setTitle('Ridean API')
    .setDescription('Bookings, supplier integrations, payments, supplier accounting and reports')
    .setVersion('2.0.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, doc));

  const port = config.get<number>('PORT') ?? 4000;
  await app.listen(port, '0.0.0.0');
  Logger.log(`Ridean API listening on :${port} — docs at /docs`, 'Bootstrap');
}

bootstrap();
