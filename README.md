# Dougs Bank Validation System

[![CI](https://github.com/gobwah/dougs-test-app/workflows/CI/badge.svg)](https://github.com/YOUR_USERNAME/YOUR_REPO_NAME/actions)
[![codecov](https://codecov.io/gh/gobwah/dougs-test-app/branch/main/graph/badge.svg)](https://codecov.io/gh/gobwah/dougs-test-app)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.x-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.1-blue)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11.0-red)](https://nestjs.com/)

Bank transaction validation system for Dougs, accounting firm.

## 🚀 Quick Start

```bash
# Installation
npm install

# Start in development mode
npm run start:dev

# The application will be accessible at http://localhost:3000
# Swagger UI available at http://localhost:3000/api
```

## 📚 Documentation

All documentation is available in the [`documentation/`](./documentation/) folder:

- **[📖 Documentation Index](./documentation/index.md)** : Choose your language (FR/EN)
- **[🇫🇷 French Documentation](./documentation/fr/)** : Documentation en français
- **[🇬🇧 English Documentation](./documentation/en/)** : Documentation in English
- **[📡 API Documentation](./documentation/api/)** : OpenAPI documentation (JSON, YAML, HTML)

## 🎯 Features

- ✅ **Balance validation** : Verifies that balances at control points match calculated sums
- ✅ **Duplicate detection** : Identifies duplicate transactions (same date, same amount, similar labels)
- ✅ **Missing transaction detection** : Reports potential inconsistencies
- ✅ **Chronological order validation** : Verifies that control points are in order

## 🔌 API

### Main Endpoints

- **GET /health** : Application health check
- **POST /movements/validation** : Validate bank transactions against control points

### Interactive Documentation

- **Swagger UI** : `http://localhost:3000/api` (when the application is running)

## 🧪 Tests

```bash
# Unit tests (default)
npm test

# Tests with coverage (minimum threshold: 80%)
npm run test:cov

# Integration tests
npm run test:integration

# E2E tests (real server)
npm run test:e2e

# All tests
npm run test:all
```

### Test Types

- **Unit tests** : Fast tests of isolated components (`test/unit/`)
- **Integration tests** : In-memory API tests (`test/integration/`)
- **E2E tests** : Tests with real HTTP server (`test/e2e/`)

## 📁 Project Structure

```
src/
├── models/
│   ├── movements/          # Movement management
│   ├── balances/            # Balance management
│   └── duplicates/          # Duplicate detection
├── health/                  # Health check
└── main.ts                  # Entry point

test/
├── unit/                    # Unit tests
├── integration/             # Integration tests
└── e2e/                    # End-to-end tests

documentation/
├── index.md                # Documentation index
├── analyse.md               # Detailed analysis (main document)
├── installation_mermaid.md  # Mermaid guide
├── api/                     # OpenAPI API documentation
└── images/                  # Mermaid diagram images
```

## 📝 Examples

Request examples are available in the [`examples/`](./examples/) folder:

- `example-valid.json` : Valid case
- `example-balance-mismatch.json` : Case with balance mismatch
- `example-with-duplicates.json` : Case with duplicates
- `example-multiple-balances.json` : Case with multiple control points

## 🔧 Available Scripts

```bash
npm run build              # Build the project
npm run start:dev          # Start in development mode
npm run start:prod        # Start in production mode
npm run lint              # Lint the code
npm run format            # Format the code
npm run test:performance  # Performance tests
npm run benchmark         # Performance benchmarks
npm run generate:diagrams # Generate Mermaid diagram images
npm run generate:api-docs # Generate OpenAPI documentation
```

## 🐳 Deployment

### With Docker

```bash
# Quick start
docker-compose up -d

# Build the image
docker build -t dougs-bank-validation:latest .
```

### Manual Deployment

See the [Deployment Guide](./documentation/deployment.md) for detailed instructions.

## 📖 For More Information

- **Detailed Analysis** : [documentation/ANALYSE.md](./documentation/ANALYSE.md)
- **API Documentation** : [documentation/api/index.md](./documentation/api/index.md)
- **Deployment Guide** : [documentation/deployment.md](./documentation/deployment.md)
- **Mermaid Guide** : [documentation/installation_mermaid.md](./documentation/installation_mermaid.md)
