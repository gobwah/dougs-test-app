# OpenAPI API Documentation

This folder contains the OpenAPI documentation for the bank validation API.

## 📄 Available Files

- **`openapi.json`** : OpenAPI documentation in JSON format
- **`openapi.yaml`** : OpenAPI documentation in YAML format
- **`api-documentation.html`** : Static HTML documentation generated with Redoc (can be opened directly in a browser)

## 🔄 Generation

### Automatic Generation

The API documentation is **automatically generated** by a GitHub Actions workflow on each push to the `main` branch if API files have been modified (controllers, DTOs, services, modules).

### Manual Generation

To generate the documentation manually:

```bash
npm run generate:api-docs
```

## 📖 Usage

### Static HTML Documentation

Open `api-documentation.html` directly in your browser for an interactive and elegant documentation with Redoc.

### Swagger UI

Import the JSON or YAML file into [Swagger Editor](https://editor.swagger.io/) for an interactive interface.

### Postman

Import the file to automatically generate a collection:

1. Open Postman
2. File → Import
3. Select `openapi.json` or `openapi.yaml`
4. A complete collection will be created with all endpoints

### Client Generation

Use tools like `openapi-generator` to generate clients in different languages:

#### Example: TypeScript Client

```bash
# Install openapi-generator
npm install -g @openapitools/openapi-generator-cli

# Generate a TypeScript client
openapi-generator-cli generate \
  -i documentation/api/openapi.yaml \
  -g typescript-axios \
  -o generated-client
```

#### Example: Python Client

```bash
openapi-generator-cli generate \
  -i documentation/api/openapi.yaml \
  -g python \
  -o generated-client-python
```

## 🔗 Local Access

When the application is started in development mode, Swagger documentation is accessible at:

**http://localhost:3000/api**
