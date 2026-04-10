# Tech Stack

This page lists all major technologies, frameworks, and libraries used in Re:Earth CMS.

## Backend

| Category | Technology | Version | Purpose |
|---|---|---|---|
| Language | Go | 1.26+ | Backend server and worker |
| Web framework | Echo | 4.15 | HTTP routing, middleware |
| GraphQL server | gqlgen | 0.17 | Type-safe GraphQL code generation |
| Database driver | mongo-driver | 1.17 | MongoDB access |
| OpenAPI codegen | oapi-codegen | — | REST API handler generation from OpenAPI spec |
| Mock generation | gomock / mockgen | — | Test doubles for interfaces |
| Cloud SDK | AWS SDK v2 | — | S3 file storage |
| Cloud SDK | Google Cloud Go | — | GCS file storage |
| Observability | OpenTelemetry | — | Tracing and metrics |
| Auth | Auth0 SDK | — | JWT validation |

### Key Go Libraries

| Library | Purpose |
|---|---|
| `samber/lo` | Generic slice/map utilities |
| `golang.org/x/exp/slices` | Experimental generic slices |
| `go.uber.org/zap` | Structured logging |
| `google.golang.org/grpc` | gRPC (internal API) |
| `google.golang.org/protobuf` | Protocol Buffers |

---

## Frontend

| Category | Technology | Version | Purpose |
|---|---|---|---|
| Language | TypeScript | 5.7 | Type-safe JavaScript |
| UI framework | React | 18.3 | Component-based UI |
| Build tool | Vite | 7.3 | Fast development server and bundler |
| GraphQL client | Apollo Client | 4 | GraphQL queries, mutations, subscriptions, caching |
| UI components | Ant Design | 5 | Design system and component library |
| 3D mapping | Cesium / Resium | 1.129 | 3D geospatial visualization |
| 2D mapping | OpenLayers | 10 | 2D mapping and geometry editing |
| Code editor | Monaco Editor | — | JSON / GeoJSON editing |
| Form state | Formik | 2 | Form state management and validation |
| Global state | Jotai | — | Atomic state management |
| Routing | React Router | 6 | Client-side routing |
| i18n | i18next / react-i18next | — | Internationalization |
| HTTP (file upload) | graphql-upload | — | Multipart file uploads via GraphQL |

### Frontend Tooling

| Tool | Purpose |
|---|---|
| Storybook | Component documentation and visual testing |
| Vitest | Unit and component testing |
| Playwright | End-to-end browser testing |
| ESLint | Code linting |
| Prettier | Code formatting |

---

## Infrastructure

| Component | Technology | Purpose |
|---|---|---|
| Database | MongoDB | Primary data store for all CMS entities |
| File storage (local) | Local filesystem | Development / self-hosted deployments |
| File storage (cloud) | AWS S3 | File storage for AWS deployments |
| File storage (cloud) | Google Cloud Storage | File storage for GCP deployments |
| Message queue (GCP) | Cloud Pub/Sub | Webhook delivery and task dispatch |
| Heavy task execution (GCP) | Cloud Build | Archive decompression, large imports |
| Container platform (GCP) | Cloud Run | Serverless container hosting |
| Secret management (GCP) | GCP Secret Manager | Runtime secrets injection |
| Auth providers | Auth0 / Firebase / AWS Cognito | User authentication |

---

## Authentication Providers

Re:Earth CMS supports three pluggable authentication providers:

| Provider | Use Case |
|---|---|
| **Auth0** | Default / recommended for most deployments |
| **Firebase Authentication** | Google ecosystem deployments |
| **AWS Cognito** | AWS ecosystem deployments |

All providers issue JWTs that the backend validates. The provider is selected at deployment time via environment variables.

---

## API Standards

| API | Standard | Tooling |
|---|---|---|
| GraphQL API | GraphQL spec | gqlgen (server), Apollo Client (client) |
| Public REST API | OpenAPI 3.0 | oapi-codegen |
| Internal API | gRPC / Protocol Buffers | google.golang.org/grpc |

---

## Docker Images

| Image | Base | Notes |
|---|---|---|
| `cms-api` / `cms-worker` | `scratch` (multi-stage Go build) | Minimal attack surface |
| `cms-web` | Node.js 24.14.0 (build) + Nginx 1.29 Alpine (serve) | Uses `envsubst` for runtime config injection |

---

## Code Generation Pipeline

The project relies heavily on code generation to reduce boilerplate and maintain type safety:

```
go generate ./...
```

This triggers:
1. **gqlgen** — generates Go types and resolver stubs from GraphQL schema files (`schemas/gql/*.graphql`)
2. **oapi-codegen** — generates Go HTTP handler interfaces from `schemas/integration/integration.yml`
3. **mockgen** — generates mock implementations for all repository and gateway interfaces

Always re-run `go generate ./...` after modifying any `.graphql` or `.yml` schema file.
