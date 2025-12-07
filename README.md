# Dougs Bank Validation System

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

## API

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
      "amount": 100.50
    },
    {
      "id": 2,
      "date": "2024-01-20",
      "label": "WITHDRAWAL",
      "amount": -50.00
    }
  ],
  "balances": [
    {
      "date": "2024-01-31",
      "balance": 50.50
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
        "expectedBalance": 50.50,
        "actualBalance": 100.50,
        "difference": 50.00
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
            "amount": 100.50,
            "label": "PAYMENT REF 12345"
          },
          {
            "id": 3,
            "date": "2024-01-15T00:00:00.000Z",
            "amount": 100.50,
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
# Exécuter les tests
npm test

# Tests avec couverture
npm run test:cov

# Tests en mode watch
npm run test:watch
```

## Structure du projet

```
src/
├── main.ts                    # Point d'entrée de l'application
├── app.module.ts             # Module principal
└── movements/
    ├── movements.controller.ts    # Contrôleur API
    ├── movements.service.ts        # Service de validation
    └── dto/
        ├── validation-request.dto.ts   # DTO de requête
        └── validation-response.dto.ts  # DTO de réponse

test/
└── movements/
    ├── movements.controller.spec.ts    # Tests du contrôleur
    └── movements.service.spec.ts        # Tests du service
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

