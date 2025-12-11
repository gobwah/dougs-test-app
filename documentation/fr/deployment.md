# 🚀 Guide de Déploiement - Dougs Bank Validation System

Ce guide explique comment déployer l'application Dougs Bank Validation System avec Docker.

## 📋 Table des Matières

- [Prérequis](#-prérequis)
- [Déploiement avec Docker](#-déploiement-avec-docker)
- [Configuration](#-configuration)
- [Dépannage](#-dépannage)

---

## 📦 Prérequis

- Docker >= 20.10
- Docker Compose >= 2.0

---

## 🐳 Déploiement avec Docker

### Déploiement rapide

```bash
# Cloner le repository
git clone <repository-url>
cd dougs-test-app

# Démarrer avec Docker Compose
docker-compose up -d

# Vérifier les logs
docker-compose logs -f app

# Vérifier le statut
curl http://localhost:3000/health
```

### Build de l'image Docker

```bash
# Build l'image
docker build -t dougs-bank-validation:latest .

# Run le container
docker run -d \
  --name dougs-bank-validation \
  --publish 3000:3000 \
  --env NODE_ENV=production \
  --env PORT=3000 \
  dougs-bank-validation:latest
```

### Docker Compose avec configuration personnalisée

Créez un fichier `docker-compose.override.yml` pour personnaliser la configuration :

```yaml
services:
  app:
    environment:
      - CORS_ORIGIN=https://app.dougs.com
      - THROTTLE_LIMIT=200
      - LOG_LEVEL=warn
    ports:
      - '8080:3000'
```

Puis démarrez avec :

```bash
docker-compose up -d
```

---

## ⚙️ Configuration

### Variables d'environnement

| Variable         | Description                                     | Défaut        | Exemple                  |
| ---------------- | ----------------------------------------------- | ------------- | ------------------------ |
| `PORT`           | Port d'écoute de l'application                  | `3000`        | `8080`                   |
| `NODE_ENV`       | Environnement d'exécution                       | `development` | `production`             |
| `API_PREFIX`     | Préfixe de l'API                                | `api`         | `api/v1`                 |
| `LOG_LEVEL`      | Niveau de log                                   | `info`        | `debug`, `warn`, `error` |
| `CORS_ORIGIN`    | Origines CORS autorisées (séparées par virgule) | `*`           | `https://app.dougs.com`  |
| `THROTTLE_TTL`   | Fenêtre de temps pour rate limiting (secondes)  | `60`          | `120`                    |
| `THROTTLE_LIMIT` | Nombre max de requêtes par fenêtre              | `100`         | `200`                    |

### Exemple de fichier `.env`

```env
NODE_ENV=production
PORT=3000
API_PREFIX=api
LOG_LEVEL=info
CORS_ORIGIN=*
THROTTLE_TTL=60
THROTTLE_LIMIT=100
```

---

## 📊 Health Check

L'application expose un endpoint de health check :

```bash
# Vérifier le statut
curl http://localhost:3000/health

# Réponse attendue
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 123.456
}
```

### Docker Health Check

Le Dockerfile inclut un health check automatique :

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"
```

Vérifier le statut :

```bash
docker ps
# La colonne STATUS affichera "healthy" ou "unhealthy"
```

---

## 🔧 Dépannage

### Problèmes courants

#### 1. Port déjà utilisé

```bash
# Vérifier quel processus utilise le port
lsof -i :3000

# Changer le port dans docker-compose.yml
ports:
  - '8080:3000'
```

#### 2. Erreurs de build

```bash
# Rebuild sans cache
docker-compose build --no-cache

# Vérifier les logs de build
docker-compose build 2>&1 | tail -50
```

#### 3. Container ne démarre pas

```bash
# Voir les logs
docker-compose logs -f app

# Logs des 100 dernières lignes
docker-compose logs --tail=100 app

# Vérifier le statut du container
docker-compose ps
```

#### 4. Rate Limiting trop restrictif

Ajuster dans `docker-compose.yml` :

```yaml
environment:
  - THROTTLE_TTL=120
  - THROTTLE_LIMIT=500
```

---

## 🔗 Ressources

- [Documentation NestJS](https://docs.nestjs.com/)
- [Docker Documentation](https://docs.docker.com/)

---

**Dernière mise à jour** : Décembre 2025
