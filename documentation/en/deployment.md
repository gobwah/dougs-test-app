# 🚀 Deployment Guide - Dougs Bank Validation System

This guide explains how to deploy the Dougs Bank Validation System application using Docker.

## 📋 Table of Contents

- [Prerequisites](#-prerequisites)
- [Docker Deployment](#-docker-deployment)
- [Configuration](#-configuration)
- [Troubleshooting](#-troubleshooting)

---

## 📦 Prerequisites

- Docker >= 20.10
- Docker Compose >= 2.0

---

## 🐳 Docker Deployment

### Quick deployment

```bash
# Clone the repository
git clone <repository-url>
cd dougs-test-app

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
  --publish 3000:3000 \
  --env NODE_ENV=production \
  --env PORT=3000 \
  dougs-bank-validation:latest
```

### Docker Compose with custom configuration

Create a `docker-compose.override.yml` file to customize the configuration:

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

Then start with:

```bash
docker-compose up -d
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

### Example `.env` file

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

### Docker Health Check

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

# Change the port in docker-compose.yml
ports:
  - '8080:3000'
```

#### 2. Build errors

```bash
# Rebuild without cache
docker-compose build --no-cache

# Check build logs
docker-compose build 2>&1 | tail -50
```

#### 3. Container not starting

```bash
# View logs
docker-compose logs -f app

# Last 100 lines of logs
docker-compose logs --tail=100 app

# Check container status
docker-compose ps
```

#### 4. Rate limiting too restrictive

Adjust in `docker-compose.yml`:

```yaml
environment:
  - THROTTLE_TTL=120
  - THROTTLE_LIMIT=500
```

---

## 🔗 Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [Docker Documentation](https://docs.docker.com/)

---

**Last updated**: December 2025
