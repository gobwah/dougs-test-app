# Dougs Bank Validation System - Minimal Version

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.x-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.1-blue)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11.0-red)](https://nestjs.com/)

Version minimale du système de validation de transactions bancaires pour Dougs, cabinet comptable. Cette version se concentre sur l'algorithme de validation et fournit une structure de base (contrôleur et service) pour permettre au recruteur de se focaliser sur l'implémentation de l'algorithme.

## 🚀 Quick Start

```bash
# Installation
npm install

# Start in development mode
npm run start:dev

# The application will be accessible at http://localhost:3000
```

## 🎯 Features

- ✅ **Balance validation** : Verifies that balances at control points match calculated sums
- ✅ **Duplicate detection** : Identifies duplicate transactions (same date, same amount, similar labels)
- ✅ **Missing transaction detection** : Reports potential inconsistencies
- ✅ **Chronological order validation** : Verifies that control points are in order

## 🔌 API

### Main Endpoint

- **POST /movements/validation** : Validate bank transactions against control points

Request body:

```json
{
  "movements": [
    {
      "id": 1,
      "date": "2024-01-05",
      "label": "SALARY PAYMENT",
      "amount": 3000
    }
  ],
  "balances": [
    {
      "date": "2024-01-31",
      "balance": 1929.5
    }
  ]
}
```

## 🧪 Tests

```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# E2E tests (real server)
npm run test:e2e

# Performance tests
npm run test:performance

# All tests
npm run test:all

# Performance benchmarks
npm run benchmark
```

### Test Types

- **Unit tests** : Fast tests of isolated components (`test/unit/`)
- **Integration tests** : In-memory API tests (`test/integration/`)
- **E2E tests** : Tests with real HTTP server (`test/e2e/`)
- **Performance tests** : Performance validation tests (`test/performance/`)
- **Benchmarks** : Performance benchmarks (`scripts/benchmark.ts`)

## 📁 Project Structure

```
src/
├── models/
│   ├── movements/          # Movement management (controller + service)
│   ├── balances/           # Balance management (service)
│   └── duplicates/         # Duplicate detection (service)
└── main.ts                 # Entry point

test/
├── unit/                   # Unit tests
├── integration/            # Integration tests
├── e2e/                    # End-to-end tests
└── performance/            # Performance tests

scripts/
└── benchmark.ts            # Performance benchmarks
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
npm run start:prod         # Start in production mode
npm test                   # Run unit tests
npm run test:integration    # Run integration tests
npm run test:e2e           # Run E2E tests
npm run test:performance   # Run performance tests
npm run test:all           # Run all tests
npm run benchmark          # Run performance benchmarks
```

## 📖 Documentation

All documentation is available in the [`documentation/`](./documentation/) folder:

- **[📖 Documentation Index](./documentation/index.md)** : Choose your language (FR/EN)
- **[🇫🇷 French Documentation](./documentation/fr/)** : Documentation en français
- **[🇬🇧 English Documentation](./documentation/en/)** : Documentation in English
