# Configuration

Re:Earth CMS is configured via environment variables. All server variables are prefixed with `REEARTH_CMS_`.

## Server Configuration

### General

| Variable | Default | Description |
|---|---|---|
| `PORT` | `8080` | HTTP port the server listens on |
| `REEARTH_CMS_DB` | `mongodb://localhost` | MongoDB connection string |
| `REEARTH_CMS_HOST` | `http://localhost:8080` | Public URL of the API server |
| `REEARTH_CMS_SERVERHOST` | `localhost` | Hostname of the API server |
| `REEARTH_CMS_HOST_WEB` | `http://localhost:3000` | Public URL of the web frontend |
| `REEARTH_CMS_DEV` | `false` | Enable development mode |
| `REEARTH_CMS_SIGNUPSECRET` | — | Optional secret required for new user registration |

### Database

| Variable | Default | Description |
|---|---|---|
| `REEARTH_CMS_DB` | `mongodb://localhost` | Primary MongoDB connection string |
| `REEARTH_CMS_DB_ACCOUNT` | `reearth_account` | MongoDB database name for account data |
| `REEARTH_CMS_DB_CMS` | `reearth_cms` | MongoDB database name for CMS data |
| `REEARTH_CMS_DB_USERS` | — | Per-user MongoDB overrides (format: `Name1=uri1,Name2=uri2`) |

### CORS

| Variable | Default | Description |
|---|---|---|
| `REEARTH_CMS_ORIGINS` | — | Allowed origins for the main GraphQL API (comma-separated) |
| `REEARTH_CMS_INTEGRATION_ORIGINS` | — | Allowed origins for the integration REST API (empty = block all cross-origin) |
| `REEARTH_CMS_PUBLIC_ORIGINS` | — | Allowed origins for the public API (empty = block all cross-origin) |

### GraphQL

| Variable | Default | Description |
|---|---|---|
| `REEARTH_CMS_GRAPHQL_COMPLEXITYLIMIT` | `6000` | Maximum GraphQL query complexity allowed |

---

## Authentication

### Auth0

| Variable | Description |
|---|---|
| `REEARTH_CMS_DOMAIN` | Auth0 domain (e.g. `example.auth0.com`) |
| `REEARTH_CMS_AUDIENCE` | Auth0 API audience |
| `REEARTH_CMS_CLIENTID` | Auth0 management client ID |
| `REEARTH_CMS_CLIENTSECRET` | Auth0 management client secret |
| `REEARTH_CMS_WEBCLIENTID` | Auth0 web application client ID |

### Firebase

| Variable | Description |
|---|---|
| `REEARTH_CMS_FIREBASE_PROJECTID` | Firebase project ID |
| `REEARTH_CMS_FIREBASE_CLIENTID` | Firebase OAuth client ID |

### AWS Cognito

| Variable | Description |
|---|---|
| `REEARTH_CMS_COGNITO_USERPOOLID` | Cognito user pool ID |
| `REEARTH_CMS_COGNITO_REGION` | AWS region of the Cognito pool |
| `REEARTH_CMS_COGNITO_CLIENTID` | Cognito app client ID |

### Generic JWT (advanced)

For custom or multiple auth providers, use the generic JWT settings:

| Variable | Description |
|---|---|
| `REEARTH_CMS_AUTH_ISS` | JWT issuer URL |
| `REEARTH_CMS_AUTH_AUD` | JWT audience |
| `REEARTH_CMS_AUTH_ALG` | JWT signing algorithm (e.g. `RS256`) |
| `REEARTH_CMS_AUTH_TTL` | Token TTL in seconds |
| `REEARTH_CMS_AUTH_CLIENTID` | OAuth client ID |
| `REEARTH_CMS_AUTH_JWKSURI` | JWKS endpoint URL |

For multiple providers, use the JSON array format:

```bash
REEARTH_AUTH='[{"ISS":"https://...","AUD":["..."],"ALG":"RS256","JWKSURI":"..."}]'
```

### Machine-to-Machine (M2M)

| Variable | Description |
|---|---|
| `REEARTH_CMS_AUTHM2M_ISS` | M2M JWT issuer |
| `REEARTH_CMS_AUTHM2M_AUD` | M2M JWT audience |
| `REEARTH_CMS_AUTHM2M_EMAIL` | M2M service account email |
| `REEARTH_CMS_AUTHM2M_ALG` | M2M JWT algorithm |
| `REEARTH_CMS_AUTHM2M_JWKSURI` | M2M JWKS endpoint |

---

## File Storage

Set exactly **one** of S3, GCS, or neither (defaults to local filesystem).

### Local Filesystem (default)

No extra variables needed. Assets are stored in `./data` (mapped via Docker volume).

Asset base URL:

| Variable | Default | Description |
|---|---|---|
| `REEARTH_CMS_ASSETBASEURL` | `http://localhost:8080` | Base URL for asset file URLs |

### Google Cloud Storage

| Variable | Description |
|---|---|
| `REEARTH_CMS_GCS_BUCKETNAME` | GCS bucket name |
| `REEARTH_CMS_GCS_PUBLICATIONCACHECONTROL` | Cache-Control header for public assets |

### AWS S3

| Variable | Description |
|---|---|
| `REEARTH_CMS_S3_BUCKETNAME` | S3 bucket name |
| `REEARTH_CMS_S3_PUBLICATIONCACHECONTROL` | Cache-Control header for public assets |

### Asset Access Control

| Variable | Default | Description |
|---|---|---|
| `REEARTH_CMS_ASSET_PUBLIC` | `true` | If `true`, public assets are served directly from the bucket URL. If `false`, the CMS controls ACL and proxies private asset access. |

---

## Internal API (gRPC)

| Variable | Default | Description |
|---|---|---|
| `REEARTH_CMS_INTERNALAPI_ACTIVE` | `false` | Enable the gRPC internal API |
| `REEARTH_CMS_INTERNALAPI_PORT` | `50051` | gRPC port |
| `REEARTH_CMS_INTERNALAPI_TOKEN` | — | Bearer token for M2M auth to the internal API |

---

## Email (for notifications)

Three mailer backends are supported: `log` (default), `smtp`, `sendgrid`.

### SMTP

| Variable | Description |
|---|---|
| `REEARTH_CMS_SMTP_HOST` | SMTP server hostname |
| `REEARTH_CMS_SMTP_PORT` | SMTP port (typically `587`) |
| `REEARTH_CMS_SMTP_SMTPUSERNAME` | SMTP username |
| `REEARTH_CMS_SMTP_EMAIL` | From email address |
| `REEARTH_CMS_SMTP_PASSWORD` | SMTP password |

### SendGrid

| Variable | Description |
|---|---|
| `REEARTH_CMS_SENDGRID_EMAIL` | From email address |
| `REEARTH_CMS_SENDGRID_NAME` | Sender display name |
| `REEARTH_CMS_SENDGRID_API` | SendGrid API key |

---

## Task Runner (Async Workers)

### GCP

| Variable | Description |
|---|---|
| `REEARTH_CMS_TASK_GCPPROJECT` | GCP project ID |
| `REEARTH_CMS_TASK_GCPREGION` | GCP region |
| `REEARTH_CMS_TASK_TOPIC` | Cloud Pub/Sub topic for task dispatch |
| `REEARTH_CMS_TASK_GCSBUCKET` | GCS bucket used by the worker |
| `REEARTH_CMS_TASK_DECOMPRESSORIMAGE` | Docker image for the decompressor worker |
| `REEARTH_CMS_TASK_DECOMPRESSORTOPIC` | Pub/Sub topic for decompression tasks |
| `REEARTH_CMS_TASK_DECOMPRESSORMACHINETYPE` | Cloud Build machine type (e.g. `E2_HIGHCPU_8`) |
| `REEARTH_CMS_TASK_COPIERIMAGE` | Docker image for the copy worker |
| `REEARTH_CMS_TASK_CMSIMAGE` | Docker image for the import worker |
| `REEARTH_CMS_TASK_BUILDSERVICEACCOUNT` | Service account for Cloud Build jobs |
| `REEARTH_CMS_TASK_DBSECRETNAME` | GCP Secret Manager secret name for DB credentials |

### AWS

| Variable | Description |
|---|---|
| `REEARTH_CMS_AWSTASK_TOPICARN` | SNS topic ARN for task dispatch |
| `REEARTH_CMS_AWSTASK_WEBHOOKARN` | SNS topic ARN for webhook delivery |

---

## Observability (OpenTelemetry)

| Variable | Default | Description |
|---|---|---|
| `REEARTH_CMS_OTEL_ENABLED` | `true` | Enable OpenTelemetry tracing |
| `REEARTH_CMS_OTEL_ENDPOINT` | — | OTLP HTTP endpoint (e.g. `http://localhost:4318` for Jaeger) |
| `REEARTH_CMS_OTEL_SAMPLINGRATIO` | `1.0` | Fraction of requests to sample (0.0–1.0) |
| `REEARTH_CMS_OTEL_MAXEXPORTBATCHSIZE` | — | Max spans per export batch |
| `REEARTH_CMS_OTEL_BATCHTIMEOUT` | — | Max wait time before flushing a batch (e.g. `5s`) |
| `REEARTH_CMS_OTEL_MAXQUEUESIZE` | — | Max spans in the export queue |

On GCP, Cloud Trace is used automatically when `GOOGLE_CLOUD_PROJECT` is set.

---

## Policy Checker

Controls whether certain operations are allowed (used for SaaS rate-limiting / quota enforcement).

| Variable | Default | Description |
|---|---|---|
| `REEARTH_CMS_POLICY_CHECKER_TYPE` | `permissive` | `permissive` (allow all, OSS mode) or `http` (external service) |
| `REEARTH_CMS_POLICY_CHECKER_ENDPOINT` | — | URL of the external policy checker service |
| `REEARTH_CMS_POLICY_CHECKER_TOKEN` | — | Auth token for the policy checker |
| `REEARTH_CMS_POLICY_CHECKER_TIMEOUT` | `30` | Request timeout in seconds |

---

## Health Check

| Variable | Description |
|---|---|
| `REEARTH_CMS_HEALTHCHECK_USERNAME` | Basic auth username for the health check endpoint |
| `REEARTH_CMS_HEALTHCHECK_PASSWORD` | Basic auth password for the health check endpoint |
| `REEARTH_CMS_HEALTHCHECK_RUNONINIT` | Run health check on startup |

---

## Accounts API

| Variable | Default | Description |
|---|---|---|
| `REEARTH_CMS_ACCOUNT_API_ENABLED` | `false` | Enable integration with the Re:Earth Accounts API |
| `REEARTH_CMS_ACCOUNT_API_HOST` | — | URL of the Accounts API |
| `REEARTH_CMS_ACCOUNT_API_TIMEOUT` | `30` | Request timeout in seconds |

---

## Frontend Environment Variables

These are set in `web/.env`:

| Variable | Description |
|---|---|
| `REEARTH_CMS_API` | Backend API base URL (e.g. `http://localhost:8080/api`) |
| `REEARTH_CMS_AUTH0_DOMAIN` | Auth0 domain |
| `REEARTH_CMS_AUTH0_AUDIENCE` | Auth0 audience |
| `REEARTH_CMS_AUTH0_CLIENT_ID` | Auth0 client ID |
| `REEARTH_CMS_FIREBASE_API_KEY` | Firebase API key |
| `REEARTH_CMS_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `REEARTH_CMS_FIREBASE_PROJECT_ID` | Firebase project ID |
| `REEARTH_CMS_AUTH_PROVIDER` | Auth provider to use: `auth0`, `firebase` |
| `REEARTH_CESIUM_ION_ACCESS_TOKEN` | Cesium Ion access token (for 3D mapping) |
| `REEARTH_CMS_DISABLE_WORKSPACE_UI` | Disable workspace management UI (SaaS mode) |
| `REEARTH_CMS_DASHBOARD_BASE_URL` | URL to the Re:Earth dashboard |
| `REEARTH_CMS_EDITOR_URL` | URL to the Re:Earth editor |

### Runtime Config Injection

The web container supports runtime config injection via `envsubst` — environment variables can be injected at container start time without rebuilding the image. This is the recommended approach for Docker/Kubernetes deployments.
