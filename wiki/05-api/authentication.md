# Authentication

Re:Earth CMS supports multiple authentication methods depending on the use case and deployment configuration.

## Bearer Token

All APIs authenticate via the HTTP `Authorization` header with a Bearer token:

```
Authorization: Bearer <token>
```

---

## Authentication Methods

### 1. User JWT (for human users)

When a user logs in via the web UI, the auth provider (Auth0, Firebase, or Cognito) issues a **JSON Web Token (JWT)**. This JWT is sent with every API request.

The backend validates the JWT against the configured JWKS endpoint and resolves the user's identity and permissions.

**Provider configuration:**

| Provider | Environment Variables |
|---|---|
| Auth0 | `REEARTH_CMS_DOMAIN`, `REEARTH_CMS_AUDIENCE`, `REEARTH_CMS_CLIENTID` |
| Firebase | `REEARTH_CMS_FIREBASE_PROJECTID` |
| AWS Cognito | `REEARTH_CMS_COGNITO_USERPOOLID`, `REEARTH_CMS_COGNITO_REGION` |

**Token lifetime:** Determined by the auth provider (typically 1–24 hours). Tokens are automatically refreshed by the web frontend.

---

### 2. Integration Token (for integrations)

When you create an integration in Re:Earth CMS, a **secret token** is issued. Use this token to authenticate API requests from your integration.

The token is:
- Tied to the integration identity
- Long-lived (does not expire unless regenerated)
- Used for server-to-server requests

**To get a token:**
1. Create an integration under **Workspace Settings** → **Integrations**.
2. Copy the secret token shown after creation (displayed only once).

**Usage:**
```
Authorization: Bearer <integration-secret-token>
```

**Permissions:** The integration's access level is determined by the role assigned when it was added to a workspace/project.

**Regenerating a token:**
1. Go to **Workspace Settings** → **Integrations**.
2. Select the integration.
3. Click **Regenerate Token**.
4. Update all consumers with the new token.

---

### 3. API Key (for project-level access)

API keys are issued per-project and provide access to that project's resources.

**To create an API key:**
1. Go to **Project Settings** → **API Keys** (or Accessibility).
2. Click **Create Key**.
3. Copy the token.

**Usage:**
```
Authorization: Bearer <api-key-token>
```

**Permissions:** API keys act with Writer-level access to the project they were created for.

---

### 4. Machine-to-Machine (M2M)

Used for internal service communication (e.g., worker → server). Configured via `REEARTH_CMS_AUTHM2M_*` environment variables.

Not intended for external use.

---

## Public API Access (No Auth)

If a project has **Public** visibility and **public publication** settings, certain resources can be accessed **without any authentication**:

```
GET /api/p/{workspaceIdOrAlias}/{projectIdOrAlias}/{modelIdOrKey}
```

Resources that are not public return `404` (not `401`) to avoid leaking the existence of private resources.

---

## Permission Resolution

When an authenticated request arrives, the backend resolves the caller into an **Operator** — an internal object that contains:
- The user's or integration's identity
- The list of workspaces they can read/write/maintain/own
- The list of projects they can read/write/maintain/own

All use case functions receive this Operator and check permissions before performing any operation.

### Role Hierarchy

Roles are cumulative — higher roles include all lower role permissions:

```
READER ⊂ WRITER ⊂ MAINTAINER ⊂ OWNER
```

An OWNER can do everything a MAINTAINER, WRITER, and READER can do.

See [Roles and Permissions](../07-roles-and-permissions/overview.md) for the full permission matrix.

---

## Security Best Practices

1. **Never commit tokens** to source control. Use environment variables or secret managers.
2. **Use the minimum required role** — don't give an integration OWNER access if WRITER suffices.
3. **Regenerate tokens** immediately if a token is leaked.
4. **Use HTTPS** — all production deployments must use TLS to prevent token interception.
5. **Rotate API keys** periodically as a security hygiene measure.
6. **Scope integrations per project** — connect an integration only to the projects it needs access to.
