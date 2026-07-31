# Contributing to Re:Earth CMS

Thank you for your interest in contributing to Re:Earth CMS! This guide explains how to set up a development environment and submit contributions.

## Before You Start

Please read the [Re:Earth Front-End Style Guide](https://github.com/reearth/guides/blob/main/frontend/style.md) before contributing to the frontend.

For backend contributions, familiarize yourself with the [Clean Architecture pattern](./backend-architecture.md) used throughout the server code.

---

## Development Setup

### Prerequisites

- **Go 1.26+** — [download](https://go.dev/dl/)
- **Node.js 20.11+** with **Yarn** — [download](https://nodejs.org/)
- **Docker + Docker Compose** — [download](https://docs.docker.com/get-docker/)
- **Git**

### 1. Fork and Clone

```bash
git clone https://github.com/<your-username>/reearth-cms.git
cd reearth-cms
```

### 2. Start MongoDB

```bash
docker compose up reearth-cms-mongo -d
```

### 3. Run the Backend

```bash
cd server
cp .env.example .env
# Edit .env — at minimum set auth provider settings

go run ./cmd/reearth-cms
# Server starts on http://localhost:8080
```

### 4. Run the Frontend

```bash
cd web
cp .env.example .env
# Edit .env — set REEARTH_CMS_API=http://localhost:8080/api and auth settings

yarn install
yarn start
# Frontend starts on http://localhost:3000
```

---

## Code Generation

After modifying schema files, always regenerate code:

```bash
# Backend: regenerate GraphQL types, OpenAPI handlers, mocks
cd server
go generate ./...

# Frontend: regenerate GraphQL types from schema
cd web
yarn gql
```

---

## Running Tests

### Backend

```bash
cd server

# All tests with race detector
make test

# Specific package
go test ./pkg/item/...

# E2E tests (requires MongoDB)
go test ./e2e/...

# Coverage report
go test -cover ./...
```

### Frontend

```bash
cd web

# Unit tests
yarn test

# E2E tests (requires running backend)
yarn e2e
```

---

## Making Changes

### Backend Changes

Follow the [Clean Architecture layer order](./backend-architecture.md#adding-a-new-feature):

1. **Domain** (`pkg/`) — define entities and business rules
2. **Repository interface** (`internal/usecase/repo/`) — define the data contract
3. **Use case** (`internal/usecase/interactor/`) — implement the business logic
4. **Infrastructure** (`internal/infrastructure/mongo/`) — implement the repository
5. **GraphQL schema** (`schemas/gql/`) — add types and operations
6. **Resolver** (`internal/adapter/gql/`) — implement the GraphQL handler
7. Run `go generate ./...` to regenerate code

### Frontend Changes

- Components follow **Atomic Design**: atoms → molecules → organisms → pages
- Use Apollo Client for GraphQL — add new queries/mutations in `web/src/gql/`
- Run `yarn gql` after modifying GraphQL operations to regenerate TypeScript types
- Use Ant Design components for UI consistency

---

## Commit Convention

Re:Earth CMS uses **Conventional Commits**:

```
<type>(<scope>): <description>

[optional body]
```

Types:
- `feat` — new feature
- `fix` — bug fix
- `refactor` — code change that neither adds a feature nor fixes a bug
- `test` — adding or fixing tests
- `docs` — documentation changes
- `chore` — maintenance tasks
- `ci` — CI/CD changes

Examples:
```
feat(item): add bulk delete operation
fix(asset): handle decompression progress tracking
refactor(schema): extract field type validation
```

---

## Pull Request Process

1. **Create a branch** from `main`:
   ```bash
   git checkout -b feat/my-feature
   ```

2. **Write tests** for your changes.

3. **Run the test suite** and ensure all tests pass.

4. **Push** your branch and open a PR against `main`.

5. **Fill in the PR description** with:
   - What the change does
   - Why it is needed
   - How to test it

6. **Address review comments** and update the PR.

7. Once approved, a maintainer will merge it.

---

## Issue Reporting

Report bugs or request features at [github.com/reearth/reearth-cms/issues](https://github.com/reearth/reearth-cms/issues).

When reporting a bug, include:
- Re:Earth CMS version
- Steps to reproduce
- Expected vs actual behavior
- Relevant logs or screenshots
