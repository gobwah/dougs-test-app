# Dougs Bank Validation System

[![CI](https://github.com/YOUR_USERNAME/YOUR_REPO_NAME/workflows/CI/badge.svg)](https://github.com/YOUR_USERNAME/YOUR_REPO_NAME/actions)
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

## Documentation API

### Documentation interactive (Swagger UI)

La documentation interactive de l'API est disponible via Swagger UI à l'adresse :

- **Swagger UI** : `http://localhost:3000/api`

Vous pouvez tester les endpoints directement depuis l'interface Swagger.

### Documentation OpenAPI

La documentation OpenAPI est générée automatiquement et disponible dans le dossier `documentation/` :

- **`documentation/openapi.json`** : Format JSON
- **`documentation/openapi.yaml`** : Format YAML

#### Génération automatique

La documentation est générée automatiquement **avant chaque commit** via un hook Git pre-commit (Husky) si des fichiers API ont été modifiés. Les fichiers générés sont automatiquement ajoutés au commit.

**Fichiers déclencheurs** :

- `src/**/*.ts` (fichiers TypeScript)
- `src/**/*.dto.ts` (DTOs)
- `src/**/*.controller.ts` (controllers)
- `src/**/*.service.ts` (services)
- `src/**/*.module.ts` (modules)
- `package.json` (dépendances)

Un workflow GitHub Actions est également configuré comme backup pour les cas où des commits sont faits directement sur GitHub.

#### Génération manuelle

Pour générer la documentation manuellement :

```bash
npm run generate:api-docs
```

## API

### GET /health

Endpoint de santé pour vérifier que l'application est en cours d'exécution.

#### Response (200)

```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 123.456
}
```

### POST /movements/validation

Valide une liste d'opérations bancaires contre des points de contrôle.

#### Request Body

```json
{
  "movements": [
    {
      "id": 1,
      "date": "2024-01-15",
      "label": "PAYMENT REF 12345",
      "amount": 100.5
    },
    {
      "id": 2,
      "date": "2024-01-20",
      "label": "WITHDRAWAL",
      "amount": -50.0
    }
  ],
  "balances": [
    {
      "date": "2024-01-31",
      "balance": 50.5
    }
  ]
}
```

#### Response Success (200)

```json
{
  "message": "Accepted"
}
```

#### Response Error (400)

```json
{
  "message": "Validation failed",
  "reasons": [
    {
      "type": "BALANCE_MISMATCH",
      "message": "Balance mismatch at control point 2024-01-31T00:00:00.000Z",
      "details": {
        "balanceDate": "2024-01-31T00:00:00.000Z",
        "expectedBalance": 50.5,
        "actualBalance": 100.5,
        "difference": 50.0
      }
    },
    {
      "type": "DUPLICATE_TRANSACTION",
      "message": "Found 2 duplicate transaction(s)",
      "details": {
        "duplicateMovements": [
          {
            "id": 1,
            "date": "2024-01-15T00:00:00.000Z",
            "amount": 100.5,
            "label": "PAYMENT REF 12345"
          },
          {
            "id": 3,
            "date": "2024-01-15T00:00:00.000Z",
            "amount": 100.5,
            "label": "PAYMENT REF 12345"
          }
        ]
      }
    }
  ]
}
```

### Types de raisons de validation

- **BALANCE_MISMATCH** : Le solde calculé ne correspond pas au solde du point de contrôle
- **DUPLICATE_TRANSACTION** : Transactions dupliquées détectées
- **MISSING_TRANSACTION** : Opérations après le dernier point de contrôle ou incohérences suggérant des transactions manquantes
- **INVALID_DATE_ORDER** : Les points de contrôle ne sont pas dans l'ordre chronologique

## Algorithme de validation

1. **Tri chronologique** : Les opérations et points de contrôle sont triés par date
2. **Inférence du solde initial** : Le solde initial est inféré à partir du premier point de contrôle
3. **Validation des soldes** : Pour chaque point de contrôle, le solde est calculé et comparé avec le solde attendu
4. **Détection de doublons** : Les transactions avec la même date, le même montant et des libellés similaires sont identifiées comme doublons potentiels
5. **Vérification des périodes** : Les opérations avant le premier point de contrôle et après le dernier sont signalées

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

- La détection de doublons utilise une comparaison de similarité des libellés basée sur la distance de Levenshtein (seuil de 80%)
- Une tolérance de 0.01 est appliquée pour les comparaisons de soldes afin de gérer les erreurs d'arrondi en virgule flottante
- Les dates sont comparées avec une précision au jour pour la détection de doublons
- L'algorithme infère le solde initial à partir du premier point de contrôle

## Exemples d'utilisation

Voir le fichier `examples/` pour des exemples de requêtes.
