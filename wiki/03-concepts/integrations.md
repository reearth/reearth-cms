# Integrations

**Integrations** are third-party applications or services connected to Re:Earth CMS. They can read and write content via the API and receive real-time notifications via **webhooks**.

## Overview

Re:Earth CMS supports two types of integrations:

| Type | Description |
|---|---|
| **Public** | Shared integrations available to multiple workspaces. Managed by Eukarya or third-party developers. |
| **Private** | Workspace-specific integrations created and managed by workspace Owners/Maintainers. |

Integrations authenticate using a **secret token** — a long-lived credential issued when the integration is created.

The workspace navigation bar has two integration-related tabs:

| Tab | Available in | Purpose |
|---|---|---|
| **Integration** | Personal and team workspaces | Connect integrations to the workspace and its projects |
| **My Integration** | Personal workspace only | Create and manage integrations you own |

## Creating an Integration

To create a private integration:

1. Go to **Settings** → **Integrations** (workspace-level).
2. Click **New Integration**.
3. Enter a **name** (e.g. `Data Pipeline`, `Publishing Bot`).
4. Optionally add a **description** and **logo URL**.
5. Click **Create**.
6. Copy the **secret token** — it is shown only once.

> Keep the secret token secure. If it is leaked, regenerate it immediately.

## Connecting an Integration to a Project

Integrations must be explicitly connected to a project before they can access it:

1. Go to **Project Settings** → **Integrations**.
2. Click **Add Integration**.
3. Select the integration from the list.
4. Assign a **role** (Reader, Writer, Maintainer, or Owner).
5. Click **Add**.

The integration's access to the project is limited to the assigned role, just like a human member.

## Integration Token Usage

Use the integration secret token in the `Authorization` header for all API requests:

```
Authorization: Bearer <integration-secret-token>
```

The token identifies the integration as the operator. All items created or modified by the integration are attributed to it.

## Webhooks

A webhook is an HTTP callback that the CMS sends to an external URL when a specific event occurs.

### Configuring Webhooks

1. Go to **Integration Settings** → **Webhooks** for the integration.
2. Click **New Webhook**.
3. Enter:
   - **Name** — a label for the webhook
   - **URL** — the endpoint to POST events to
   - **Secret** — an optional HMAC secret for payload verification
   - **Trigger events** — select which events activate the webhook

### Webhook Events (Triggers)

| Event | Trigger |
|---|---|
| `onItemCreate` | An item is created |
| `onItemUpdate` | An item is updated |
| `onItemDelete` | An item is deleted |
| `onItemPublish` | An item is published |
| `onItemUnPublish` | An item is unpublished |
| `onAssetUpload` | An asset is uploaded |
| `onAssetDecompress` | An asset archive is decompressed |
| `onAssetDelete` | An asset is deleted |

### Webhook Payload

Webhook events are delivered as HTTP POST requests with a JSON body. The payload includes:
- Event type
- Timestamp
- The relevant entity data (item or asset)
- The project and workspace identifiers

### Webhook Delivery

Webhooks are delivered asynchronously via the worker system:
- On GCP: dispatched via Cloud Pub/Sub
- On AWS: dispatched via SNS

Delivery is best-effort. Failed deliveries are not automatically retried — configure retry logic in your receiving endpoint.

### Verifying Webhook Signatures

If a **secret** is set on the webhook, the CMS includes an HMAC-SHA256 signature in the `X-Reearth-Signature` header. Verify this in your endpoint to confirm the payload came from Re:Earth CMS:

```python
import hmac, hashlib

expected = hmac.new(secret.encode(), payload_body, hashlib.sha256).hexdigest()
assert request.headers['X-Reearth-Signature'] == expected
```

## Integration as a Workspace Member

When an integration is added to a workspace (or project), it appears in the members list alongside human members. Its role can be changed or revoked at any time.

## Developer Portal

Re:Earth CMS includes a **Developer Portal** in project settings that shows:
- The project's API endpoint
- Example `curl` commands for common operations using the project's API key

This makes it easy to get started with the API quickly.

## API Access

| GraphQL Operation | Description |
|---|---|
| `integrations(workspaceId: ...)` | List integrations in a workspace |
| `integration(id: ...)` | Get an integration |
| `createIntegration(input: ...)` | Create a new integration |
| `updateIntegration(input: ...)` | Update integration details |
| `deleteIntegration(input: ...)` | Delete an integration |
| `createWebhook(input: ...)` | Add a webhook to an integration |
| `updateWebhook(input: ...)` | Update a webhook |
| `deleteWebhook(input: ...)` | Remove a webhook |
