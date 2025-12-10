# 🚀 Deployment Guide - Dougs Bank Validation System

This guide explains how to deploy the Dougs Bank Validation System application in different environments.

## 📋 Table of Contents

- [Prerequisites](#-prerequisites)
- [Docker Deployment](#-docker-deployment)
- [Manual Deployment](#-manual-deployment)
- [Configuration](#-configuration)
- [Environments](#-environments)
- [Monitoring and Health Checks](#-monitoring-and-health-checks)
- [Troubleshooting](#-troubleshooting)

---

## 📦 Prerequisites

### For Docker

- Docker >= 20.10
- Docker Compose >= 2.0

### For manual deployment

- Node.js >= 20.x
- npm >= 9.x

---

## 🐳 Docker Deployment

### Quick deployment

```bash
# Clone the repository
git clone <repository-url>
cd dougs-test-app

# Copy and configure environment variables
cp .env.example .env
# Edit .env according to your needs

# Start with Docker Compose
docker-compose up -d

# Check logs
docker-compose logs -f app

# Check status
curl http://localhost:3000/health
```

### Docker image build

```bash
# Build the image
docker build -t dougs-bank-validation:latest .

# Run the container
docker run -d \
  --name dougs-bank-validation \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e PORT=3000 \
  dougs-bank-validation:latest
```

### Docker Compose with custom configuration

Create a `docker-compose.override.yml` file to customize the configuration:

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

Then start with:

```bash
docker-compose up -d
```

---

## 🛠️ Manual Deployment

### 1. Install dependencies

```bash
# Install dependencies
npm ci --only=production

# Or to include development dependencies
npm ci
```

### 2. Build the application

```bash
# Compile TypeScript
npm run build

# Verify the build succeeded
ls -la dist/
```

### 3. Configuration

```bash
# Create the .env file
cp .env.example .env

# Edit .env with your values
nano .env
```

### 4. Start

```bash
# Production mode
npm run start:prod

# Or directly with Node.js
NODE_ENV=production node dist/src/main.js
```

### 5. Using PM2 (recommended for production)

```bash
# Install PM2 globally
npm install -g pm2

# Start the application
pm2 start dist/src/main.js --name dougs-bank-validation

# Save PM2 configuration
pm2 save

# Configure PM2 to start on boot
pm2 startup
```

**PM2 `ecosystem.config.js` file:**

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

Usage:

```bash
pm2 start ecosystem.config.js
```

---

## ⚙️ Configuration

### Environment Variables

| Variable         | Description                             | Default       | Example                  |
| ---------------- | --------------------------------------- | ------------- | ------------------------ |
| `PORT`           | Application listening port              | `3000`        | `8080`                   |
| `NODE_ENV`       | Execution environment                   | `development` | `production`             |
| `API_PREFIX`     | API prefix                              | `api`         | `api/v1`                 |
| `LOG_LEVEL`      | Log level                               | `info`        | `debug`, `warn`, `error` |
| `CORS_ORIGIN`    | Allowed CORS origins (comma-separated)  | `*`           | `https://app.dougs.com`  |
| `THROTTLE_TTL`   | Time window for rate limiting (seconds) | `60`          | `120`                    |
| `THROTTLE_LIMIT` | Maximum number of requests per window   | `100`         | `200`                    |

### Example `.env` file for production

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

## 🌍 Environments

### Development

```bash
# Start in development mode with hot-reload
npm run start:dev

# The application will be accessible at http://localhost:3000
# Swagger UI at http://localhost:3000/api
```

### Staging

```bash
# Build and start
npm run build
NODE_ENV=staging npm run start:prod
```

### Production

```bash
# With Docker (recommended)
docker-compose -f docker-compose.yml up -d

# Or manually with PM2
pm2 start ecosystem.config.js
```

---

## 📊 Monitoring and Health Checks

### Health Check Endpoint

The application exposes a health check endpoint:

```bash
# Check status
curl http://localhost:3000/health

# Expected response
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 123.456
}
```

### Integration with monitoring tools

#### Prometheus (future)

```yaml
# Prometheus configuration example
scrape_configs:
  - job_name: 'dougs-bank-validation'
    static_configs:
      - targets: ['localhost:3000']
    metrics_path: '/metrics'
```

#### Docker Health Check

The Dockerfile includes an automatic health check:

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"
```

Check status:

```bash
docker ps
# The STATUS column will show "healthy" or "unhealthy"
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. Port already in use

```bash
# Check which process is using the port
lsof -i :3000

# Change the port in .env
PORT=8080
```

#### 2. Build errors

```bash
# Clean and rebuild
rm -rf dist node_modules
npm ci
npm run build
```

#### 3. Memory issues

```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=2048" npm run start:prod
```

#### 4. Docker logs

```bash
# View logs
docker-compose logs -f app

# Last 100 lines of logs
docker-compose logs --tail=100 app
```

#### 5. Rate limiting too restrictive

Adjust in `.env`:

```env
THROTTLE_TTL=120
THROTTLE_LIMIT=500
```

---

## 📈 Performance and Scaling

### Recommended optimizations

1. **Use PM2 in cluster mode** to use all CPU cores
2. **Configure a reverse proxy** (Nginx, Traefik) for load balancing
3. **Use caching** (Redis) for repeated validations (future)
4. **Monitoring** with Prometheus/Grafana (future)

### Example with Nginx

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

## 🔐 Security

### Recommendations

1. **Never commit `.env`** to the repository
2. **Use HTTPS** in production (via reverse proxy)
3. **Configure CORS** with specific origins in production
4. **Limit rate limiting** according to your needs
5. **Regularly update** dependencies (`npm audit`)

### Sensitive variables

The following variables must be secured:

- `CORS_ORIGIN` : Limit to authorized domains in production
- `THROTTLE_LIMIT` : Adjust according to server capacity

---

## 📝 Deployment Checklist

- [ ] Environment variables configured (`.env`)
- [ ] Application build successful (`npm run build`)
- [ ] Tests pass (`npm run test:all`)
- [ ] Health check works (`curl http://localhost:3000/health`)
- [ ] CORS configured correctly
- [ ] Rate limiting configured
- [ ] Logs accessible and configured
- [ ] Monitoring in place (if applicable)
- [ ] Configuration backup
- [ ] Documentation up to date

---

## 🔗 Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [Docker Documentation](https://docs.docker.com/)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)

---

**Last updated**: December 2025
