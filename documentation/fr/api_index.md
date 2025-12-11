# Documentation API OpenAPI

Ce dossier contient la documentation OpenAPI de l'API de validation bancaire.

## 📄 Fichiers Disponibles

- **`openapi.json`** : Documentation OpenAPI au format JSON
- **`openapi.yaml`** : Documentation OpenAPI au format YAML
- **`api-documentation.html`** : Documentation statique HTML générée avec Redoc (peut être ouverte directement dans un navigateur)

## 🔄 Génération

### Génération Automatique

La documentation API est **générée automatiquement** par un workflow GitHub Actions lors de chaque push sur la branche `main` si des fichiers de l'API ont été modifiés (controllers, DTOs, services, modules).

### Génération Manuelle

Pour générer la documentation manuellement :

```bash
npm run generate:api-docs
```

## 📖 Utilisation

### Documentation Statique HTML

Ouvrez directement `api-documentation.html` dans votre navigateur pour une documentation interactive et élégante avec Redoc.

### Swagger UI

Importez le fichier JSON ou YAML dans [Swagger Editor](https://editor.swagger.io/) pour une interface interactive.

### Postman

Importez le fichier pour générer une collection automatiquement :

1. Ouvrez Postman
2. File → Import
3. Sélectionnez `openapi.json` ou `openapi.yaml`
4. Une collection complète sera créée avec tous les endpoints

### Génération de Clients

Utilisez des outils comme `openapi-generator` pour générer des clients dans différents langages :

#### Exemple : Client TypeScript

```bash
# Installer openapi-generator
npm install -g @openapitools/openapi-generator-cli

# Générer un client TypeScript
openapi-generator-cli generate \
  -i documentation/api/openapi.yaml \
  -g typescript-axios \
  -o generated-client
```

#### Exemple : Client Python

```bash
openapi-generator-cli generate \
  -i documentation/api/openapi.yaml \
  -g python \
  -o generated-client-python
```

## 🔗 Accès Local

Quand l'application est démarrée en mode développement, la documentation Swagger est accessible sur :

**http://localhost:3000/api**
