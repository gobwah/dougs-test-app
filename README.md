# Dougs Bank Validation System

[![CI](https://github.com/gobwah/dougs-test-app/workflows/CI/badge.svg)](https://github.com/YOUR_USERNAME/YOUR_REPO_NAME/actions)
[![codecov](https://codecov.io/gh/gobwah/dougs-test-app/branch/main/graph/badge.svg)](https://codecov.io/gh/gobwah/dougs-test-app)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.x-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.1-blue)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10.0-red)](https://nestjs.com/)

Système de validation des opérations bancaires pour Dougs, cabinet d'expertise-comptable.

## Description

Cette application NestJS permet de valider l'intégrité des synchronisations bancaires en comparant les opérations bancaires remontées par les prestataires externes avec les points de contrôle (soldes) fournis par les clients via leurs relevés bancaires.

## Fonctionnalités

- **Validation des soldes** : Vérifie que les soldes aux points de contrôle correspondent aux sommes calculées à partir des opérations
- **Détection de doublons** : Identifie les transactions dupliquées (même date, même montant, libellés similaires)
- **Détection d'opérations manquantes** : Signale les incohérences qui pourraient indiquer des transactions manquantes
- **Validation de l'ordre chronologique** : Vérifie que les points de contrôle sont dans l'ordre chronologique

## Installation

```bash
npm install
```

## Démarrage

```bash
# Mode développement
npm run start:dev

# Mode production
npm run build
npm run start:prod
```

L'application sera accessible sur `http://localhost:3000`

## Documentation

📚 **Documentation complète disponible dans le dossier [`documentation/`](./documentation/)**

- **[Documentation API](./documentation/README.md#-documentation-api-openapi)** : Documentation OpenAPI (JSON, YAML, HTML)
- **[Analyse détaillée](./documentation/ANALYSE.md)** : Approche méthodique, algorithmes, diagrammes
- **Swagger UI** : `http://localhost:3000/api` (quand l'application est démarrée)

## API

### Endpoints

- **GET /health** : Vérification de santé de l'application
- **POST /movements/validation** : Validation d'opérations bancaires contre des points de contrôle

Pour la documentation complète de l'API (schémas, exemples, types d'erreurs), consultez :

- **Swagger UI** : `http://localhost:3000/api` (quand l'application est démarrée)
- **Documentation OpenAPI** : Voir [documentation/README.md](./documentation/README.md#-documentation-api-openapi)

## Algorithme de validation

Pour une description détaillée de l'algorithme avec diagrammes, consultez [documentation/ANALYSE.md](./documentation/ANALYSE.md#-étape-4--algorithme-de-validation).

## Tests

```bash
# Exécuter les tests unitaires (par défaut)
npm test
# ou
npm run test:unit

# Tests avec couverture (seuil minimum: 80%)
npm run test:cov

# Tests d'intégration uniquement
npm run test:integration

# Tests e2e (serveur réel)
npm run test:e2e

# Tous les tests (unitaires + intégration)
npm run test:all

# Tests en mode watch (uniquement unitaires)
npm run test:watch
```

### Types de tests

- **Tests unitaires** : Tests rapides des composants isolés
- **Tests d'intégration** : Tests de l'API en mémoire (utilisent les fichiers JSON d'exemples)
- **Tests e2e** : Tests avec serveur HTTP réel (vérifient le build complet)

## Structure du projet

```
src/
├── main.ts                    # Point d'entrée de l'application
├── app.module.ts             # Module principal
├── health/
│   └── health.controller.ts   # Contrôleur health check
└── movements/
    ├── movements.controller.ts    # Contrôleur API
    ├── movements.service.ts        # Service de validation
    └── dto/
        ├── validation-request.dto.ts   # DTO de requête
        └── validation-response.dto.ts  # DTO de réponse

test/
├── unit/                          # Tests unitaires (composants isolés)
│   ├── controllers/
│   │   ├── health.controller.spec.ts
│   │   └── movements.controller.spec.ts
│   └── services/
│       └── movements.service.spec.ts
├── integration/                   # Tests d'intégration (API en mémoire)
│   └── movements.integration.spec.ts
└── e2e/                           # Tests end-to-end (serveur réel)
    ├── movements.e2e-spec.ts
    ├── jest-e2e.json
    ├── jest-e2e.global-setup.ts
    ├── jest-e2e.setup.ts
    └── jest-e2e.teardown.ts
```

## Technologies utilisées

- **NestJS** : Framework Node.js pour applications serveur
- **TypeScript** : Langage de programmation
- **class-validator** : Validation des données
- **Jest** : Framework de tests

## Notes d'implémentation

Pour les détails sur les décisions de design et les choix techniques, consultez [documentation/ANALYSE.md](./documentation/ANALYSE.md#-étape-5--décisions-de-design).

## Exemples d'utilisation

Voir le dossier `examples/` pour des exemples de requêtes, ou utilisez Swagger UI (`http://localhost:3000/api`) pour tester l'API interactivement.
