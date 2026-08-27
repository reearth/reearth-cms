# Docker Deployment

Re:Earth CMS provides official Docker images for all components. This page covers both development and production deployment with Docker.

## Docker Images

| Image | Description |
|---|---|
| `reearth/reearth-cms` | Backend API server |
| `reearth/reearth-cms-web` | Web frontend (Nginx) |
| `reearth/reearth-cms-worker` | Asynchronous task worker |

Tags:
- `nightly` — latest build from the `main` branch
- `vX.Y.Z` — specific release version

---

## Quick Start (Development)

The repository includes a `docker-compose.yml` for local development:

```yaml
version: '3'
services:
  reearth-cms-server:
    image: reearth/reearth-cms:nightly
    environment:
      REEARTH_CMS_DB: mongodb://reearth-cms-mongo
    ports:
      - '8080:8080'
    links:
      - reearth-cms-mongo
    depends_on:
      - reearth-cms-mongo
    volumes:
      - ./data:/reearth/data

  reearth-cms-mongo:
    image: mongo:6-focal
    ports:
      - 27017:27017
    volumes:
      - ./mongo:/data/db
```

Start with:
```bash
docker compose up
```

---

## Production Docker Compose

A more complete production setup includes the web frontend, worker, and environment configuration:

```yaml
version: '3.8'
services:
  reearth-cms-server:
    image: reearth/reearth-cms:v1.0.0
    env_file: .env
    ports:
      - '8080:8080'
    depends_on:
      - mongo
    volumes:
      - assets:/reearth/data
    restart: always

  reearth-cms-web:
    image: reearth/reearth-cms-web:v1.0.0
    env_file: .env.web
    ports:
      - '80:80'
    restart: always

  reearth-cms-worker:
    image: reearth/reearth-cms-worker:v1.0.0
    env_file: .env
    depends_on:
      - mongo
    volumes:
      - assets:/reearth/data
    restart: always

  mongo:
    image: mongo:6
    volumes:
      - mongo_data:/data/db
    restart: always

volumes:
  mongo_data:
  assets:
```

---

## Image Build Details

### Server / Worker Image

Built using a **multi-stage Go build** with a `scratch` base image for minimal size and attack surface:

```dockerfile
# Build stage
FROM golang:1.26.1-alpine AS builder
WORKDIR /app
COPY . .
RUN go build -o reearth-cms ./cmd/reearth-cms

# Final stage
FROM scratch
COPY --from=builder /app/reearth-cms /reearth-cms
ENTRYPOINT ["/reearth-cms"]
```

### Web Image

Built with **Node.js 24.14.1** for the React build, then served by **Nginx 1.29 Alpine**:

```dockerfile
# Build stage
FROM node:24.14.1-slim AS builder
WORKDIR /app
COPY web/ .
RUN yarn install && yarn build

# Serve stage
FROM nginx:1.29-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
```

---

## Runtime Configuration Injection (Web)

The web container supports runtime environment variable injection without rebuilding the image, using `envsubst`. This is the recommended approach for Docker/Kubernetes deployments.

Environment variables prefixed with `REEARTH_CMS_` are injected into the app's config at container start time:

```bash
# Set in docker-compose.yml or as container env vars:
REEARTH_CMS_API=https://api.example.com
REEARTH_CMS_AUTH0_DOMAIN=example.auth0.com
REEARTH_CMS_AUTH0_AUDIENCE=https://api.example.com
REEARTH_CMS_AUTH0_CLIENT_ID=your-client-id
```

---

## MongoDB Setup

Re:Earth CMS uses **two MongoDB databases**:

| Database | Purpose |
|---|---|
| `reearth_account` | User accounts and workspace membership (shared with Re:Earth account service) |
| `reearth_cms` | All CMS-specific data (projects, models, items, assets, etc.) |

Configure them with:
```bash
REEARTH_CMS_DB=mongodb://mongo:27017
REEARTH_CMS_DB_ACCOUNT=reearth_account
REEARTH_CMS_DB_CMS=reearth_cms
```

### MongoDB Authentication

For production, enable MongoDB authentication:
```bash
REEARTH_CMS_DB=mongodb://username:password@mongo:27017/reearth_cms?authSource=admin
```

---

## File Storage

### Local Filesystem (default)

Assets are stored in the `./data` directory. Mount it as a volume to persist across container restarts:

```yaml
volumes:
  - ./data:/reearth/data
```

### AWS S3

```bash
REEARTH_CMS_S3_BUCKETNAME=my-cms-assets
# AWS credentials via environment or IAM role
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=ap-northeast-1
```

### Google Cloud Storage

```bash
REEARTH_CMS_GCS_BUCKETNAME=my-cms-assets
# GCP credentials via GOOGLE_APPLICATION_CREDENTIALS or Workload Identity
```

---

## Health Check

The server exposes a health check endpoint:
```
GET /api/health
```

Docker health check:
```yaml
healthcheck:
  test: ["CMD", "wget", "-q", "--spider", "http://localhost:8080/api/health"]
  interval: 30s
  timeout: 10s
  retries: 3
```

---

## Multi-Architecture

Official images are built for both `linux/amd64` and `linux/arm64` (Apple Silicon, AWS Graviton).

```bash
# Pull for your architecture (auto-selected by Docker)
docker pull reearth/reearth-cms:nightly
```

---

## Reverse Proxy (Nginx)

In production, run an Nginx or Caddy reverse proxy in front of both the API and web containers:

```nginx
server {
    listen 443 ssl;
    server_name cms.example.com;

    location /api/ {
        proxy_pass http://reearth-cms-server:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location / {
        proxy_pass http://reearth-cms-web:80;
        proxy_set_header Host $host;
    }
}
```
