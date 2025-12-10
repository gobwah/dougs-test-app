# 🚀 Guide de Déploiement - Dougs Bank Validation System

Ce guide explique comment déployer l'application Dougs Bank Validation System dans différents environnements.

## 📋 Table des Matières

- [Prérequis](#-prérequis)
- [Déploiement avec Docker](#-déploiement-avec-docker)
- [Déploiement manuel](#-déploiement-manuel)
- [Configuration](#-configuration)
- [Environnements](#-environnements)
- [Monitoring et Health Checks](#-monitoring-et-health-checks)
- [Dépannage](#-dépannage)

---

## 📦 Prérequis

### Pour Docker

- Docker >= 20.10
- Docker Compose >= 2.0

### Pour déploiement manuel

- Node.js >= 20.x
- npm >= 9.x

---

## 🐳 Déploiement avec Docker

### Déploiement rapide

```bash
# Cloner le repository
git clone <repository-url>
cd dougs-test-app

# Copier et configurer les variables d'environnement
cp .env.example .env
# Éditer .env selon vos besoins

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
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e PORT=3000 \
  dougs-bank-validation:latest
```

### Docker Compose avec configuration personnalisée

Créez un fichier `docker-compose.override.yml` pour personnaliser la configuration :

```yaml
version: '3.8'

services:
  app:
    environment:
      - CORS_ORIGIN=https://app.dougs.com,https://admin.dougs.com
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

## 🛠️ Déploiement manuel

### 1. Installation des dépendances

```bash
# Installer les dépendances
npm ci --only=production

# Ou pour inclure les dépendances de développement
npm ci
```

### 2. Build de l'application

```bash
# Compiler TypeScript
npm run build

# Vérifier que le build a réussi
ls -la dist/
```

### 3. Configuration

```bash
# Créer le fichier .env
cp .env.example .env

# Éditer .env avec vos valeurs
nano .env
```

### 4. Démarrage

```bash
# Mode production
npm run start:prod

# Ou directement avec Node.js
NODE_ENV=production node dist/src/main.js
```

### 5. Utilisation avec PM2 (recommandé pour production)

```bash
# Installer PM2 globalement
npm install -g pm2

# Démarrer l'application
pm2 start dist/src/main.js --name dougs-bank-validation

# Sauvegarder la configuration PM2
pm2 save

# Configurer PM2 pour démarrer au boot
pm2 startup
```

**Fichier `ecosystem.config.js` pour PM2 :**

```javascript
module.exports = {
  apps: [
    {
      name: 'dougs-bank-validation',
      script: './dist/src/main.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '1G',
    },
  ],
};
```

Utilisation :

```bash
pm2 start ecosystem.config.js
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

### Exemple de fichier `.env` pour production

```env
NODE_ENV=production
PORT=3000
API_PREFIX=api
LOG_LEVEL=warn
CORS_ORIGIN=https://app.dougs.com,https://admin.dougs.com
THROTTLE_TTL=60
THROTTLE_LIMIT=200
```

---

## 🌍 Environnements

### Développement

```bash
# Démarrer en mode développement avec hot-reload
npm run start:dev

# L'application sera accessible sur http://localhost:3000
# Swagger UI sur http://localhost:3000/api
```

### Staging

```bash
# Build et démarrage
npm run build
NODE_ENV=staging npm run start:prod
```

### Production

```bash
# Avec Docker (recommandé)
docker-compose -f docker-compose.yml up -d

# Ou manuellement avec PM2
pm2 start ecosystem.config.js
```

---

## 📊 Monitoring et Health Checks

### Health Check Endpoint

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

### Intégration avec des outils de monitoring

#### Prometheus (futur)

```yaml
# Exemple de configuration Prometheus
scrape_configs:
  - job_name: 'dougs-bank-validation'
    static_configs:
      - targets: ['localhost:3000']
    metrics_path: '/metrics'
```

#### Docker Health Check

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

# Changer le port dans .env
PORT=8080
```

#### 2. Erreurs de build

```bash
# Nettoyer et rebuilder
rm -rf dist node_modules
npm ci
npm run build
```

#### 3. Problèmes de mémoire

```bash
# Augmenter la limite de mémoire Node.js
NODE_OPTIONS="--max-old-space-size=2048" npm run start:prod
```

#### 4. Logs Docker

```bash
# Voir les logs
docker-compose logs -f app

# Logs des 100 dernières lignes
docker-compose logs --tail=100 app
```

#### 5. Rate Limiting trop restrictif

Ajuster dans `.env` :

```env
THROTTLE_TTL=120
THROTTLE_LIMIT=500
```

---

## 📈 Performance et Scaling

### Optimisations recommandées

1. **Utiliser PM2 en mode cluster** pour utiliser tous les CPU cores
2. **Configurer un reverse proxy** (Nginx, Traefik) pour le load balancing
3. **Utiliser un cache** (Redis) pour les validations répétées (futur)
4. **Monitoring** avec Prometheus/Grafana (futur)

### Exemple avec Nginx

```nginx
upstream dougs_api {
    least_conn;
    server localhost:3000;
    server localhost:3001;
    server localhost:3002;
}

server {
    listen 80;
    server_name api.dougs.com;

    location / {
        proxy_pass http://dougs_api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 🔐 Sécurité

### Recommandations

1. **Ne jamais commiter `.env`** dans le repository
2. **Utiliser HTTPS** en production (via reverse proxy)
3. **Configurer CORS** avec des origines spécifiques en production
4. **Limiter le rate limiting** selon vos besoins
5. **Mettre à jour régulièrement** les dépendances (`npm audit`)

### Variables sensibles

Les variables suivantes doivent être sécurisées :

- `CORS_ORIGIN` : Limiter aux domaines autorisés en production
- `THROTTLE_LIMIT` : Ajuster selon la capacité du serveur

---

## 📝 Checklist de déploiement

- [ ] Variables d'environnement configurées (`.env`)
- [ ] Build de l'application réussi (`npm run build`)
- [ ] Tests passent (`npm run test:all`)
- [ ] Health check fonctionne (`curl http://localhost:3000/health`)
- [ ] CORS configuré correctement
- [ ] Rate limiting configuré
- [ ] Logs accessibles et configurés
- [ ] Monitoring en place (si applicable)
- [ ] Backup de la configuration
- [ ] Documentation à jour

---

## 🔗 Ressources

- [Documentation NestJS](https://docs.nestjs.com/)
- [Docker Documentation](https://docs.docker.com/)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)

---

**Dernière mise à jour** : Décembre 2025
