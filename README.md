# Dougs Bank Validation System

[![CI](https://github.com/gobwah/dougs-test-app/workflows/CI/badge.svg)](https://github.com/YOUR_USERNAME/YOUR_REPO_NAME/actions)
[![codecov](https://codecov.io/gh/gobwah/dougs-test-app/branch/main/graph/badge.svg)](https://codecov.io/gh/gobwah/dougs-test-app)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.x-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.1-blue)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11.0-red)](https://nestjs.com/)

Système de validation des opérations bancaires pour Dougs, cabinet d'expertise-comptable.

## 🚀 Démarrage Rapide

```bash
# Installation
npm install

# Démarrage en mode développement
npm run start:dev

# L'application sera accessible sur http://localhost:3000
# Swagger UI disponible sur http://localhost:3000/api
```

## 📚 Documentation

Toute la documentation est disponible dans le dossier [`documentation/`](./documentation/) :

- **[📖 Documentation Complète](./documentation/index.md)** : Index de toute la documentation
- **[🔍 Analyse Détaillée](./documentation/analyse.md)** : Approche méthodique du problème avec diagrammes
- **[📡 Documentation API](./documentation/api/)** : Documentation OpenAPI (JSON, YAML, HTML)

## 🎯 Fonctionnalités

- ✅ **Validation des soldes** : Vérifie que les soldes aux points de contrôle correspondent aux sommes calculées
- ✅ **Détection de doublons** : Identifie les transactions dupliquées (même date, même montant, libellés similaires)
- ✅ **Détection d'opérations manquantes** : Signale les incohérences potentielles
- ✅ **Validation de l'ordre chronologique** : Vérifie que les points de contrôle sont dans l'ordre

## 🔌 API

### Endpoints Principaux

- **GET /health** : Vérification de santé de l'application
- **POST /movements/validation** : Validation d'opérations bancaires contre des points de contrôle

### Documentation Interactive

- **Swagger UI** : `http://localhost:3000/api` (quand l'application est démarrée)

## 🧪 Tests

```bash
# Tests unitaires (par défaut)
npm test

# Tests avec couverture (seuil minimum: 80%)
npm run test:cov

# Tests d'intégration
npm run test:integration

# Tests e2e (serveur réel)
npm run test:e2e

# Tous les tests
npm run test:all
```

### Types de tests

- **Tests unitaires** : Tests rapides des composants isolés (`test/unit/`)
- **Tests d'intégration** : Tests de l'API en mémoire (`test/integration/`)
- **Tests e2e** : Tests avec serveur HTTP réel (`test/e2e/`)

## 📁 Structure du Projet

```
src/
├── models/
│   ├── movements/          # Gestion des mouvements
│   ├── balances/            # Gestion des balances
│   └── duplicates/          # Détection de doublons
├── health/                  # Health check
└── main.ts                  # Point d'entrée

test/
├── unit/                    # Tests unitaires
├── integration/             # Tests d'intégration
└── e2e/                    # Tests end-to-end

documentation/
├── index.md                # Index de la documentation
├── analyse.md               # Analyse détaillée (document principal)
├── installation_mermaid.md  # Guide Mermaid
├── api/                     # Documentation API OpenAPI
└── images/                  # Images des diagrammes Mermaid
```

## 📝 Exemples

Des exemples de requêtes sont disponibles dans le dossier [`examples/`](./examples/) :

- `example-valid.json` : Cas valide
- `example-balance-mismatch.json` : Cas avec déséquilibre de solde
- `example-with-duplicates.json` : Cas avec doublons
- `example-multiple-balances.json` : Cas avec plusieurs points de contrôle

## 🔧 Scripts Disponibles

```bash
npm run build              # Compiler le projet
npm run start:dev          # Démarrage en mode développement
npm run start:prod        # Démarrage en mode production
npm run lint              # Linter le code
npm run format            # Formater le code
npm run generate:diagrams # Générer les images des diagrammes Mermaid
npm run generate:api-docs # Générer la documentation OpenAPI
```

## 📖 Pour Plus d'Informations

- **Analyse détaillée** : [documentation/analyse.md](./documentation/analyse.md)
- **Documentation API** : [documentation/api/index.md](./documentation/api/index.md)
- **Guide Mermaid** : [documentation/installation_mermaid.md](./documentation/installation_mermaid.md)
