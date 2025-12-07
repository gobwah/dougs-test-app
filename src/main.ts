import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Dougs Bank Validation API')
    .setDescription(
      "API de validation des opérations bancaires pour Dougs, cabinet d'expertise-comptable. Permet de valider l'intégrité des synchronisations bancaires en comparant les opérations avec les points de contrôle (soldes).",
    )
    .setVersion('1.0')
    .addTag('movements', 'Validation des mouvements bancaires')
    .addTag('health', "Vérification de l'état de l'application")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    customSiteTitle: 'Dougs Bank Validation API',
    customfavIcon: '/favicon.ico',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(
    `Swagger documentation available at: http://localhost:${port}/api`,
  );
}
bootstrap();
