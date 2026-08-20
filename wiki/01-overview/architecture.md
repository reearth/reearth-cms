# System Architecture

Re:Earth CMS follows a **Clean Architecture** pattern, with a clear separation between the frontend React application, the backend Go server, and supporting infrastructure services.

## High-Level Overview

```
┌──────────────────────────────────────────────────┐
│                    Browser                        │
│            React + TypeScript (Vite)             │
└──────────────────────┬───────────────────────────┘
                       │ GraphQL (HTTP / WebSocket)
┌──────────────────────▼───────────────────────────┐
│               Go Backend Server                   │
│  ┌─────────────────────────────────────────────┐ │
│  │          Adapter Layer (GraphQL / REST)      │ │
│  ├─────────────────────────────────────────────┤ │
│  │          Use Case Layer (Business Logic)     │ │
│  ├─────────────────────────────────────────────┤ │
│  │          Domain Layer (Entities)             │ │
│  ├─────────────────────────────────────────────┤ │
│  │      Infrastructure Layer (MongoDB / S3)     │ │
│  └─────────────────────────────────────────────┘ │
└──────────────────────┬───────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
┌───────▼──────┐             ┌────────▼───────┐
│   MongoDB    │             │  File Storage  │
│  (primary DB)│             │  S3 / GCS / FS │
└──────────────┘             └────────────────┘
```

## Components

### Frontend (Web)

The web application is a single-page application (SPA) built with React 18 and TypeScript, bundled with Vite.

- Communicates with the backend exclusively over **GraphQL** (queries and mutations via HTTP, subscriptions via WebSocket).
- Uses **Apollo Client** for GraphQL state management and caching.
- Authentication is handled by Auth0, Firebase, or AWS Cognito depending on deployment configuration.
- The UI is built on **Ant Design** components.
- GIS-specific features (geometry preview, 3D visualization) use **Cesium** (3D) and **OpenLayers** (2D).

### Backend Server

The Go server exposes three distinct APIs:

| API | Protocol | Purpose |
|---|---|---|
| **GraphQL API** | HTTP + WebSocket | Primary API used by the web frontend |
| **Public REST API** | HTTP (OpenAPI) | Used by external integrations and programmatic access |
| **Internal gRPC API** | gRPC | Machine-to-machine communication (e.g., worker → server notifications) |

A health check endpoint is available at `GET /api/health`.

### Worker

Asynchronous, CPU-intensive tasks (archive decompression, bulk import, export, webhook delivery) are executed in separate worker processes. On GCP, heavy tasks use Cloud Build (high-CPU machines); on AWS/local, they use a standalone worker binary.

The worker communicates back to the main server via the internal API (`/api/notify`).

### MongoDB

All structured data (workspaces, projects, models, schemas, items, assets, requests, threads, integrations) is persisted in MongoDB.

The CMS uses two databases:
- `reearth_account` — user account and workspace membership data (shared with the Re:Earth account service)
- `reearth_cms` — all CMS-specific data

A custom `mongogit` layer provides Git-like versioning on top of standard MongoDB documents.

### File Storage

File assets are stored in a pluggable backend:
- **Local filesystem** — for development
- **AWS S3** — for AWS deployments
- **Google Cloud Storage (GCS)** — for GCP deployments

Asset paths follow the pattern: `assets/{first-2-chars-of-id}/{remaining-id}/{filename}`

---

## Backend: Clean Architecture

The backend strictly follows Clean Architecture principles. Dependencies only point **inward** — outer layers depend on inner layers, never the reverse.

```
┌─────────────────────────────────────────────────────────┐
│  Frameworks & Drivers                                   │
│  internal/adapter/   internal/infrastructure/           │
└──────────────────────────┬──────────────────────────────┘
                           ↓ depends on
┌─────────────────────────────────────────────────────────┐
│  Interface Adapters (Controllers / Presenters)          │
│  internal/adapter/gql/    internal/adapter/publicapi/   │
└──────────────────────────┬──────────────────────────────┘
                           ↓ depends on
┌─────────────────────────────────────────────────────────┐
│  Application Business Rules (Use Cases)                 │
│  internal/usecase/interactor/                           │
└──────────────────────────┬──────────────────────────────┘
                           ↓ depends on
┌─────────────────────────────────────────────────────────┐
│  Enterprise Business Rules (Domain)                     │
│  pkg/item/  pkg/schema/  pkg/asset/  pkg/model/  ...   │
└─────────────────────────────────────────────────────────┘
```

### Layer Responsibilities

#### Domain Layer (`pkg/`)
The innermost layer. Contains pure Go structs, value objects, and domain logic with no external dependencies (no database drivers, no HTTP libraries). Every core business concept — `Item`, `Schema`, `Field`, `Asset`, `Request`, etc. — is defined here.

#### Use Case Layer (`internal/usecase/`)
Orchestrates domain objects and repositories to fulfill application-specific operations (create an item, publish a request, import a CSV). Contains:
- **Interactors** — implementations of use cases
- **Repository interfaces** — abstract contracts for data persistence
- **Gateway interfaces** — abstract contracts for external services

#### Adapter Layer (`internal/adapter/`)
Translates between the external world (GraphQL requests, REST requests) and the use case layer. Contains:
- `gql/` — GraphQL resolvers using `gqlgen`
- `publicapi/` — REST handlers from OpenAPI spec via `oapi-codegen`
- `internalapi/` — gRPC handlers
- `http/` — HTTP middleware, auth

#### Infrastructure Layer (`internal/infrastructure/`)
Concrete implementations of repository and gateway interfaces:
- `mongo/` — MongoDB repository implementations
- `fs/`, `gcs/`, `s3/` — file storage backends
- `auth0/` — Auth0 authentication adapter
- `memory/` — in-memory implementations (for testing)

---

## Authentication Flow

Three authentication modes are supported:

1. **User JWT** — a signed JWT from Auth0/Firebase/Cognito, passed as `Authorization: Bearer <token>` by the web frontend.
2. **Integration Token** — a secret token issued to a registered integration, passed as `Authorization: Bearer <token>` from external systems.
3. **Machine-to-Machine (M2M)** — used for internal service communication (worker → server).

The server applies auth middleware in this order: user JWT → integration token → M2M.

---

## Request Lifecycle (GraphQL)

1. Browser sends a GraphQL operation to `POST /api/graphql`.
2. Echo HTTP framework applies middleware: logger → recover → gzip → OpenTelemetry tracing → auth.
3. The auth middleware resolves the caller into an `Operator` struct (contains resolved workspace and project permissions).
4. The GraphQL resolver converts the input into a use case input struct.
5. The use case interactor validates permissions, loads dependencies from repositories, applies domain logic, and saves results.
6. Domain events are published (triggering webhooks asynchronously via the worker).
7. The resolver converts the domain result into a GraphQL response.

---

## Scalability and Deployment

Re:Earth CMS is designed to run as a set of stateless containers:

| Container | Role |
|---|---|
| `cms-api` | Main backend server (Cloud Run or Docker) |
| `cms-internal-api` | Internal gRPC API server |
| `cms-web` | Nginx serving the React SPA |
| `cms-worker` | Asynchronous task worker |

Horizontal scaling is possible for `cms-api` and `cms-web`. The worker can be scaled per task type.

See [Cloud Deployment](../08-deployment/cloud-deployment.md) for GCP-specific details.
