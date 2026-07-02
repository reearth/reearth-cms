# Webhooks

Webhooks allow external services to receive real-time HTTP notifications when events occur in Re:Earth CMS.

## Overview

A webhook is an HTTP POST request sent to a configured URL when a specific event (trigger) occurs. Webhooks are configured on **integrations**.

**Delivery mechanism:**
- On GCP: dispatched via Cloud Pub/Sub
- On AWS: dispatched via SNS
- Local/self-hosted: dispatched directly by the worker

---

## Available Triggers

| Event | Trigger Key | Description |
|---|---|---|
| Item created | `onItemCreate` | An item is created in any model |
| Item updated | `onItemUpdate` | An item's fields are modified |
| Item deleted | `onItemDelete` | An item is deleted |
| Item published | `onItemPublish` | An item is published |
| Item unpublished | `onItemUnPublish` | An item is unpublished |
| Asset uploaded | `onAssetUpload` | A file is uploaded |
| Asset decompressed | `onAssetDecompress` | A ZIP archive is decompressed |
| Asset deleted | `onAssetDelete` | An asset is deleted |

---

## Configuring a Webhook

1. Go to **Workspace Settings** → **Integrations**.
2. Select an integration (or create one).
3. Go to the **Webhooks** tab.
4. Click **New Webhook**.
5. Fill in:
   - **Name** — a label for the webhook (e.g. `Notify Pipeline`)
   - **URL** — the HTTPS endpoint to POST to
   - **Secret** — an optional string for HMAC signature verification
   - **Active** — toggle to enable/disable without deleting
   - **Triggers** — check the events you want to receive
6. Click **Save**.

---

## Webhook Payload

Webhooks are delivered as `POST` requests with `Content-Type: application/json`.

### Common Fields

All webhook payloads share this top-level structure:

```json
{
  "id": "event-id",
  "type": "item.create",
  "timestamp": "2024-03-15T09:30:00Z",
  "operator": {
    "user": "user-id"
  },
  "data": { ... }
}
```

The `operator` field indicates who triggered the event. It contains one of:
- `"user": "<user-id>"` — a human user
- `"integration": "<integration-id>"` — an integration token
- `"machine": true` — an internal worker

Note: `workspaceId` and `projectId` are **not** top-level fields. Project context is available inside `data` depending on the event type.

### Event Type Values

The `type` field uses dot-notation strings (not the GraphQL webhook trigger key names):

| Trigger | `type` value in payload |
|---|---|
| Item created | `item.create` |
| Item updated | `item.update` |
| Item deleted | `item.delete` |
| Item published | `item.publish` |
| Item unpublished | `item.unpublish` |
| Asset uploaded | `asset.upload` |
| Asset decompressed | `asset.decompress` |
| Asset deleted | `asset.delete` |

### Item Event Payload

```json
{
  "id": "event-id",
  "type": "item.create",
  "timestamp": "2024-03-15T09:30:00Z",
  "operator": { "user": "user-id" },
  "data": {
    "item": {
      "id": "item-id",
      "modelId": "model-id",
      "schemaId": "schema-id",
      "fields": [
        { "schemaFieldId": "title", "type": "text", "value": "My Article" }
      ],
      "createdAt": "2024-03-15T09:30:00Z",
      "updatedAt": "2024-03-15T09:30:00Z"
    }
  }
}
```

### Asset Event Payload

```json
{
  "id": "event-id",
  "type": "asset.upload",
  "timestamp": "2024-03-15T09:30:00Z",
  "operator": { "user": "user-id" },
  "data": {
    "asset": {
      "id": "asset-id",
      "fileName": "data.geojson",
      "size": 102400,
      "previewType": "geo",
      "url": "https://storage.example.com/assets/ab/cd.../data.geojson",
      "createdAt": "2024-03-15T09:30:00Z"
    }
  }
}
```

---

## Signature Verification

If a **secret** is configured on the webhook, the CMS signs each payload and includes the signature in the `Reearth-Signature` HTTP header (note: no `X-` prefix).

### Signature Format

The header value has the format:

```
v1,t=<unix_timestamp>,<hex_digest>
```

Example:
```
Reearth-Signature: v1,t=1710495000,a3f8c2...
```

The HMAC-SHA256 is computed over the string `v1:<unix_timestamp>:` concatenated with the raw request body bytes. The secret is the webhook secret you configured.

### Verifying in Node.js

```javascript
const crypto = require('crypto');

function verifyWebhook(rawBody, secret, signatureHeader) {
  // Parse header: "v1,t=<timestamp>,<hex>"
  const parts = signatureHeader.split(',');
  const version = parts[0];           // "v1"
  const timestamp = parts[1].slice(2); // strip "t="
  const receivedHex = parts[2];

  // Reconstruct the signed string
  const mac = crypto.createHmac('sha256', secret);
  mac.update(`${version}:${timestamp}:`);
  mac.update(rawBody);
  const expected = mac.digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(expected, 'hex'),
    Buffer.from(receivedHex, 'hex')
  );
}

// In your webhook handler:
const sigHeader = req.headers['reearth-signature'];
const isValid = verifyWebhook(req.rawBody, WEBHOOK_SECRET, sigHeader);
if (!isValid) {
  return res.status(401).send('Invalid signature');
}
```

### Verifying in Go

```go
import (
    "crypto/hmac"
    "crypto/sha256"
    "encoding/hex"
    "fmt"
    "strconv"
    "strings"
)

func verifyWebhook(payload []byte, secret, signatureHeader string) bool {
    // Parse "v1,t=<timestamp>,<hex>"
    parts := strings.SplitN(signatureHeader, ",", 3)
    if len(parts) != 3 {
        return false
    }
    version := parts[0]
    timestamp := strings.TrimPrefix(parts[1], "t=")
    received := parts[2]

    mac := hmac.New(sha256.New, []byte(secret))
    fmt.Fprintf(mac, "%s:%s:", version, timestamp)
    mac.Write(payload)
    expected := hex.EncodeToString(mac.Sum(nil))

    return hmac.Equal([]byte(expected), []byte(received))
}
```

---

## Responding to Webhooks

Your webhook endpoint should:
1. Return HTTP `200` (or `2xx`) within **5 seconds** to acknowledge receipt.
2. Process the event asynchronously if it takes longer.
3. Return `4xx` only if the payload is invalid; do not return `4xx` for processing errors.

**If your endpoint is slow or returns errors**, consider queuing the events immediately and processing them in a background job.

---

## Delivery Guarantees

Webhooks are delivered **at least once**. In rare cases (network errors, timeouts), the same event may be delivered more than once. Your endpoint should be **idempotent** — processing the same event twice should have the same effect as processing it once.

Use the combination of `type` + `item.id` (or `asset.id`) + `timestamp` to detect duplicates.

---

## Enabling/Disabling Webhooks

Webhooks can be toggled on/off without deleting them:
1. Go to the integration's webhook list.
2. Click the **Active** toggle.

Disabled webhooks do not receive events until re-enabled.

---

## Testing Webhooks Locally

Use a tool like [ngrok](https://ngrok.com/) to expose a local server for testing:

```bash
ngrok http 3000
# Returns: https://abc123.ngrok.io -> http://localhost:3000
# Use the ngrok URL as your webhook URL in Re:Earth CMS
```
