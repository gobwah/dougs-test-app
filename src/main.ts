import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { AppConfig } from './config/configuration';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('port', 3000);
  const nodeEnv = configService.get<string>('nodeEnv', 'development');
  const apiPrefix = configService.get<string>('apiPrefix', 'api');
  const corsOrigin = configService.get<string | string[]>('corsOrigin', '*');

  // CORS configuration
  app.enableCors({
    origin: corsOrigin,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: nodeEnv !== 'production', // Allow credentials in dev/staging
  });

  // Global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global validation pipe with better configuration
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger configuration
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Dougs Bank Validation API')
    .setDescription(
      'Bank transaction validation API for Dougs, accounting firm. Allows validation of bank synchronization integrity by comparing transactions with control points (balances).',
    )
    .setVersion('1.0')
    .addTag('movements', 'Bank movement validation')
    .addTag('health', 'Application status check')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(apiPrefix, app, document, {
    customSiteTitle: 'Dougs Bank Validation API',
    customfavIcon: '/favicon.ico',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  await app.listen(port);

  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`Environment: ${nodeEnv}`);
  logger.log(
    `Swagger documentation available at: http://localhost:${port}/${apiPrefix}`,
  );
}
bootstrap();
