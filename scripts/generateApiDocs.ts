import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from '../src/app.module';
import * as fs from 'node:fs';
import * as path from 'node:path';

async function generateApiDocs() {
  // Create a temporary app instance to generate the OpenAPI document
  const app = await NestFactory.create(AppModule, { logger: false });

  const config = new DocumentBuilder()
    .setTitle('Dougs Bank Validation API')
    .setDescription(
      'Bank transaction validation API for Dougs, accounting firm. Allows validation of bank synchronization integrity by comparing transactions with control points (balances).',
    )
    .setVersion('1.0')
    .addTag('movements', 'Bank movement validation')
    .addTag('health', 'Application status check')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Map request examples to their corresponding response examples
  // This helps Postman associate request examples with response examples
  if (document.paths && document.paths['/movements/validation']?.post) {
    const operation = document.paths['/movements/validation'].post;

    // Map: request example name -> response example name
    const exampleMapping: Record<string, { status: string; example: string }> =
      {
        valid: { status: '200', example: 'valid' },
        withBalanceError: { status: '400', example: 'withBalanceError' },
        withDuplicates: { status: '400', example: 'withDuplicates' },
        withMissingTransaction: {
          status: '400',
          example: 'withMissingTransaction',
        },
        withInvalidDateOrder: {
          status: '400',
          example: 'withInvalidDateOrder',
        },
      };

    // Rename response examples to match request example names
    Object.entries(exampleMapping).forEach(
      ([requestExample, { status, example }]) => {
        const response = operation.responses?.[status];
        if (
          response &&
          'content' in response &&
          response.content?.['application/json']?.examples
        ) {
          const examples = response.content['application/json'].examples;

          // If the response example doesn't exist with the same name, create/rename it
          if (!examples[requestExample] && examples[example]) {
            // Rename the existing example
            examples[requestExample] = examples[example];
            delete examples[example];
          } else if (!examples[requestExample]) {
            // Create a new example with the matching name
            if (status === '200' && examples.valid) {
              examples[requestExample] = examples.valid;
            } else if (status === '400') {
              if (
                requestExample === 'withBalanceError' &&
                examples.withBalanceError
              ) {
                // Already correct
              } else if (
                requestExample === 'withDuplicates' &&
                examples.withDuplicates
              ) {
                // Already correct
              }
            }
          }
        }
      },
    );

    // Remove 429 and 500 responses from this operation to prevent Postman from auto-generating associations
    // These are system errors that shouldn't be associated with specific request examples
    // They are still documented in the API but won't create duplicate examples in Postman
    if (operation.responses) {
      delete operation.responses['429'];
      delete operation.responses['500'];
    }
  }

  // Ensure documentation/api directory exists
  const apiDocsDir = path.join(__dirname, '..', 'documentation', 'api');
  if (!fs.existsSync(apiDocsDir)) {
    fs.mkdirSync(apiDocsDir, { recursive: true });
  }

  // Write JSON format
  const jsonPath = path.join(apiDocsDir, 'openapi.json');
  fs.writeFileSync(jsonPath, JSON.stringify(document, null, 2), 'utf-8');
  console.log(`✅ OpenAPI JSON generated: ${jsonPath}`);

  // Write YAML format
  try {
    const yaml = require('js-yaml');
    const yamlPath = path.join(apiDocsDir, 'openapi.yaml');
    fs.writeFileSync(yamlPath, yaml.dump(document), 'utf-8');
    console.log(`✅ OpenAPI YAML generated: ${yamlPath}`);
  } catch (error) {
    console.log('⚠️  YAML generation skipped (js-yaml not installed)');
  }

  // Generate static HTML documentation with Redocly
  try {
    const { execSync } = require('child_process');
    const htmlPath = path.join(apiDocsDir, 'api-documentation.html');
    execSync(
      `npx @redocly/cli build-docs ${path.join(
        apiDocsDir,
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
