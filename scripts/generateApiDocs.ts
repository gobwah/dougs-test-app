import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from '../src/app';
import * as fs from 'node:fs';
import * as path from 'node:path';

async function generateApiDocs() {
  // Create a temporary app instance to generate the OpenAPI document
  const app = await NestFactory.create(AppModule, { logger: false });

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

  // Ensure documentation directory exists
  const docsDir = path.join(__dirname, '..', 'documentation');
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  // Write JSON format
  const jsonPath = path.join(docsDir, 'openapi.json');
  fs.writeFileSync(jsonPath, JSON.stringify(document, null, 2), 'utf-8');
  console.log(`✅ OpenAPI JSON generated: ${jsonPath}`);

  // Write YAML format
  try {
    const yaml = require('js-yaml');
    const yamlPath = path.join(docsDir, 'openapi.yaml');
    fs.writeFileSync(yamlPath, yaml.dump(document), 'utf-8');
    console.log(`✅ OpenAPI YAML generated: ${yamlPath}`);
  } catch (error) {
    console.log('⚠️  YAML generation skipped (js-yaml not installed)');
  }

  // Generate static HTML documentation with Redocly
  try {
    const { execSync } = require('child_process');
    const htmlPath = path.join(docsDir, 'api-documentation.html');
    execSync(
      `npx @redocly/cli build-docs ${path.join(
        docsDir,
        'openapi.yaml',
      )} -o ${htmlPath}`,
      { stdio: 'inherit' },
    );
    console.log(`✅ HTML documentation generated: ${htmlPath}`);
  } catch (error) {
    console.log(
      '⚠️  HTML generation skipped (Redocly CLI not available or error occurred)',
    );
  }

  await app.close();
}

generateApiDocs().catch((error) => {
  console.error('❌ Error generating API documentation:', error);
  process.exit(1);
});
