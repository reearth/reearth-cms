# Environment Variables Reference

Complete reference for all environment variables used by Re:Earth CMS. All server variables use the `REEARTH_CMS_` prefix.

## Server Variables

### Core

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | No | `8080` | HTTP port |
| `REEARTH_CMS_DB` | Yes | `mongodb://localhost` | MongoDB connection string |
| `REEARTH_CMS_HOST` | Yes | `http://localhost:8080` | Public URL of the API server |
| `REEARTH_CMS_SERVERHOST` | No | `localhost` | Hostname of the API server |
| `REEARTH_CMS_HOST_WEB` | No | `http://localhost:3000` | Public URL of the web frontend |
| `REEARTH_CMS_DEV` | No | `false` | Enable development mode (GraphQL Playground, verbose errors) |
| `REEARTH_CMS_SIGNUPSECRET` | No | — | Secret required for new user registration |

### Database

| Variable | Default | Description |
|---|---|---|
| `REEARTH_CMS_DB` | `mongodb://localhost` | Primary MongoDB connection string |
| `REEARTH_CMS_DB_ACCOUNT` | `reearth_account` | Database name for account data |
| `REEARTH_CMS_DB_CMS` | `reearth_cms` | Database name for CMS data |
| `REEARTH_CMS_DB_USERS` | — | Per-user MongoDB overrides (`Name1=uri1,Name2=uri2`) |

### CORS

| Variable | Default | Description |
|---|---|---|
| `REEARTH_CMS_ORIGINS` | — | Allowed origins for the GraphQL API (comma-separated) |
| `REEARTH_CMS_INTEGRATION_ORIGINS` | — | Allowed origins for the integration REST API (empty = block all cross-origin) |
| `REEARTH_CMS_PUBLIC_ORIGINS` | — | Allowed origins for the public API (empty = block all cross-origin) |

### GraphQL

| Variable | Default | Description |
|---|---|---|
| `REEARTH_CMS_GRAPHQL_COMPLEXITYLIMIT` | `6000` | Maximum query complexity |

### HTTP Server

| Variable | Default | Description |
|---|---|---|
| `REEARTH_CMS_SERVER_ACTIVE` | `true` | Enable the HTTP server |

### Internal gRPC API

| Variable | Default | Description |
|---|---|---|
| `REEARTH_CMS_INTERNALAPI_ACTIVE` | `false` | Enable the gRPC internal API |
| `REEARTH_CMS_INTERNALAPI_PORT` | `50051` | gRPC port |
| `REEARTH_CMS_INTERNALAPI_TOKEN` | — | Bearer token for M2M auth |

---

## Authentication Variables

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
| `REEARTH_CMS_COGNITO_REGION` | AWS region |
| `REEARTH_CMS_COGNITO_CLIENTID` | Cognito app client ID |

### Generic JWT

| Variable | Description |
|---|---|
| `REEARTH_CMS_AUTH_ISS` | JWT issuer URL |
| `REEARTH_CMS_AUTH_AUD` | JWT audience |
| `REEARTH_CMS_AUTH_ALG` | JWT algorithm (e.g. `RS256`) |
| `REEARTH_CMS_AUTH_TTL` | Token TTL in seconds |
| `REEARTH_CMS_AUTH_CLIENTID` | OAuth client ID |
| `REEARTH_CMS_AUTH_JWKSURI` | JWKS endpoint URL |
| `REEARTH_AUTH` | JSON array of multiple auth configs (intentionally no `_CMS_` prefix) |

### Machine-to-Machine (M2M)

| Variable | Description |
|---|---|
| `REEARTH_CMS_AUTHM2M_ISS` | M2M JWT issuer |
| `REEARTH_CMS_AUTHM2M_AUD` | M2M JWT audience |
| `REEARTH_CMS_AUTHM2M_EMAIL` | M2M service account email |
| `REEARTH_CMS_AUTHM2M_ALG` | M2M JWT algorithm |
| `REEARTH_CMS_AUTHM2M_TTL` | M2M token TTL |
| `REEARTH_CMS_AUTHM2M_JWKSURI` | M2M JWKS endpoint |

---

## File Storage Variables

### Asset Base URL

| Variable | Default | Description |
|---|---|---|
| `REEARTH_CMS_ASSETBASEURL` | `http://localhost:8080` | Base URL for asset URLs |
| `REEARTH_CMS_ASSET_PUBLIC` | `true` | Serve public assets directly from bucket |

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

---

## Email Variables

### SMTP

| Variable | Description |
|---|---|
| `REEARTH_CMS_SMTP_HOST` | SMTP server hostname |
| `REEARTH_CMS_SMTP_PORT` | SMTP port |
| `REEARTH_CMS_SMTP_SMTPUSERNAME` | SMTP username |
| `REEARTH_CMS_SMTP_EMAIL` | Sender email address |
| `REEARTH_CMS_SMTP_PASSWORD` | SMTP password |

### SendGrid

| Variable | Description |
|---|---|
| `REEARTH_CMS_SENDGRID_EMAIL` | Sender email address |
| `REEARTH_CMS_SENDGRID_NAME` | Sender display name |
| `REEARTH_CMS_SENDGRID_API` | SendGrid API key |

---

## Task Runner Variables

### GCP

| Variable | Description |
|---|---|
| `REEARTH_CMS_TASK_GCPPROJECT` | GCP project ID |
| `REEARTH_CMS_TASK_GCPREGION` | GCP region |
| `REEARTH_CMS_TASK_TOPIC` | Cloud Pub/Sub topic for task dispatch |
| `REEARTH_CMS_TASK_GCSHOST` | GCS host URL |
| `REEARTH_CMS_TASK_GCSBUCKET` | GCS bucket for worker |
| `REEARTH_CMS_TASK_DECOMPRESSORIMAGE` | Docker image for decompressor |
| `REEARTH_CMS_TASK_DECOMPRESSORTOPIC` | Pub/Sub topic for decompression |
| `REEARTH_CMS_TASK_DECOMPRESSORGZIPEXT` | Gzip file extension |
| `REEARTH_CMS_TASK_DECOMPRESSORMACHINETYPE` | Cloud Build machine type |
| `REEARTH_CMS_TASK_COPIERIMAGE` | Docker image for copier |
| `REEARTH_CMS_TASK_DBSECRETNAME` | GCP Secret Manager secret for DB |
| `REEARTH_CMS_TASK_CMSIMAGE` | Docker image for CMS/import worker |
| `REEARTH_CMS_TASK_BUILDSERVICEACCOUNT` | Cloud Build service account |

### AWS

| Variable | Description |
|---|---|
| `REEARTH_CMS_AWSTASK_TOPICARN` | SNS topic ARN for task dispatch |
| `REEARTH_CMS_AWSTASK_WEBHOOKARN` | SNS topic ARN for webhooks |

---

## Observability Variables

| Variable | Default | Description |
|---|---|---|
| `REEARTH_CMS_OTEL_ENABLED` | `true` | Enable OpenTelemetry tracing |
| `REEARTH_CMS_OTEL_ENDPOINT` | — | OTLP HTTP endpoint |
| `REEARTH_CMS_OTEL_SAMPLINGRATIO` | `1.0` | Sampling ratio (0.0–1.0) |
| `REEARTH_CMS_OTEL_MAXEXPORTBATCHSIZE` | — | Max spans per batch |
| `REEARTH_CMS_OTEL_BATCHTIMEOUT` | — | Batch flush timeout (e.g. `5s`) |
| `REEARTH_CMS_OTEL_MAXQUEUESIZE` | — | Max spans in export queue |

---

## Service Variables

### Policy Checker

| Variable | Default | Description |
|---|---|---|
| `REEARTH_CMS_POLICY_CHECKER_TYPE` | `permissive` | `permissive` or `http` |
| `REEARTH_CMS_POLICY_CHECKER_ENDPOINT` | — | External policy checker URL |
| `REEARTH_CMS_POLICY_CHECKER_TOKEN` | — | Auth token for policy checker |
| `REEARTH_CMS_POLICY_CHECKER_TIMEOUT` | `30` | Request timeout (seconds) |

### Accounts API

| Variable | Default | Description |
|---|---|---|
| `REEARTH_CMS_ACCOUNT_API_ENABLED` | `false` | Enable Accounts API integration |
| `REEARTH_CMS_ACCOUNT_API_HOST` | — | Accounts API URL |
| `REEARTH_CMS_ACCOUNT_API_TIMEOUT` | `30` | Request timeout (seconds) |

### Health Check

| Variable | Description |
|---|---|
| `REEARTH_CMS_HEALTHCHECK_USERNAME` | Basic auth username for `/api/health` |
| `REEARTH_CMS_HEALTHCHECK_PASSWORD` | Basic auth password |
| `REEARTH_CMS_HEALTHCHECK_RUNONINIT` | Run health check on startup |

### Web Config Passthrough

| Variable | Description |
|---|---|
| `REEARTH_CMS_WEB` | JSON string of config values passed to the web frontend |
| `REEARTH_CMS_WEB_DISABLED` | Disable the web UI |

---

## Frontend Variables (web/.env)

| Variable | Description |
|---|---|
| `REEARTH_CMS_API` | Backend API base URL (e.g. `http://localhost:8080/api`) |
| `REEARTH_CMS_AUTH0_DOMAIN` | Auth0 domain |
| `REEARTH_CMS_AUTH0_AUDIENCE` | Auth0 audience |
| `REEARTH_CMS_AUTH0_CLIENT_ID` | Auth0 client ID |
| `REEARTH_CMS_FIREBASE_API_KEY` | Firebase API key |
| `REEARTH_CMS_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `REEARTH_CMS_FIREBASE_PROJECT_ID` | Firebase project ID |
| `REEARTH_CMS_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `REEARTH_CMS_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `REEARTH_CMS_FIREBASE_APP_ID` | Firebase app ID |
| `REEARTH_CMS_AUTH_PROVIDER` | Active auth provider: `auth0` or `firebase` |
| `REEARTH_CESIUM_ION_ACCESS_TOKEN` | Cesium Ion access token for 3D mapping |
| `REEARTH_CMS_DISABLE_WORKSPACE_UI` | Disable workspace management UI |
| `REEARTH_CMS_DASHBOARD_BASE_URL` | Re:Earth dashboard URL |
| `REEARTH_CMS_EDITOR_URL` | Re:Earth editor URL |
| `REEARTH_CMS_E2E_USERNAME` | E2E test username |
| `REEARTH_CMS_E2E_PASSWORD` | E2E test password |
| `REEARTH_CMS_E2E_BASEURL` | E2E test base URL |
