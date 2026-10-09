# Installation

This guide explains how to run Re:Earth CMS locally using Docker Compose, and how to set up the development environment for contributing.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/)
- For development: [Go 1.26+](https://go.dev/dl/) and [Node.js 20.11+](https://nodejs.org/) with [Yarn](https://yarnpkg.com/)

---

## Quick Start (Docker Compose)

The fastest way to run Re:Earth CMS is with the provided `docker-compose.yml`.

### 1. Clone the repository

```bash
git clone https://github.com/reearth/reearth-cms.git
cd reearth-cms
```

### 2. Start the services

```bash
docker compose up
```

This starts:
- `reearth-cms-server` — the backend API server on port `8080`
- `reearth-cms-mongo` — MongoDB on port `27017`

Data is persisted in `./mongo` (MongoDB data) and `./data` (uploaded assets).

### 3. Access the CMS

Once running, the API is available at:
- GraphQL API: `http://localhost:8080/api/graphql`
- Health check: `http://localhost:8080/api/health`

> **Note:** The `docker-compose.yml` runs the backend only. To use the web UI, you need to run the frontend separately (see Development Setup below) or use a pre-built web container.

### 4. Configure environment (optional)

To customize the server, uncomment the `env_file` line in `docker-compose.yml` and create a `.env` file:

```yaml
# docker-compose.yml
services:
  reearth-cms-server:
    env_file:
      - ./.env
```

See [Configuration](./configuration.md) for all available environment variables.

---

## Development Setup

To run the full stack locally for development:

### Backend (Go server)

```bash
cd server

# Copy and edit the example env file
cp .env.example .env
# Edit .env with your settings (at minimum, set REEARTH_CMS_DB and auth settings)

# Start MongoDB (required)
docker compose up reearth-cms-mongo -d

# Run the server
go run ./cmd/reearth-cms
```

The server starts on port `8080` by default.

#### Code generation

After modifying any GraphQL schema (`.graphql` files) or OpenAPI spec, regenerate the code:

```bash
go generate ./...
```

Or using make targets:

```bash
make gql    # GraphQL code generation only
make oapi   # OpenAPI code generation only
```

#### Run server tests

```bash
# All tests (with race detector)
make test

# Specific package
go test ./pkg/item/...

# E2E tests (requires running MongoDB)
go test ./e2e/...
```

---

### Frontend (React app)

```bash
cd web

# Copy and edit the example env file
cp .env.example .env
# Edit .env: set REEARTH_CMS_API=http://localhost:8080/api
# Set auth provider variables (Auth0, Firebase, or Cognito)

# Install dependencies
yarn install

# Start the development server
yarn start
```

The frontend runs on `http://localhost:3000` by default.

#### Run frontend tests

```bash
# Unit tests
yarn test

# E2E tests (requires running backend)
yarn e2e
```

#### Build for production

```bash
yarn build
```

The output is in `web/dist/`.

---

## Running with Docker (production-like)

To run all services including the web frontend:

```bash
# Pull the latest nightly images
docker pull reearth/reearth-cms:nightly
docker pull reearth/reearth-cms-web:nightly

# Or build locally
docker build -t reearth-cms ./server
docker build -t reearth-cms-web ./web
```

See [Docker Deployment](../08-deployment/docker.md) for a full production Docker Compose setup.

---

## Makefile Targets

From the `server/` directory:

| Target | Description |
|---|---|
| `make test` | Run all tests with race detector |
| `make gql` | Regenerate GraphQL code |
| `make oapi` | Regenerate OpenAPI code |
| `make run-app` | Run the server locally |

---

## Troubleshooting

**MongoDB connection refused**
Make sure MongoDB is running before starting the server:
```bash
docker compose up reearth-cms-mongo -d
```

**GraphQL codegen errors after schema changes**
Run `go generate ./...` to regenerate Go types from the updated schema.

**Frontend can't reach the API**
Ensure `REEARTH_CMS_API` in `web/.env` points to the running backend (default: `http://localhost:8080/api`).

**Port conflict on 8080**
Change the port by setting `PORT=9090` in `server/.env` and updating the `docker-compose.yml` port mapping.
