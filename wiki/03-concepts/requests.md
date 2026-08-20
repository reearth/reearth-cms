# Requests

A **request** is a proposal to publish (or change) one or more content items. Requests support a structured review and approval workflow before content goes live.

## Overview

Requests are the mechanism for content governance in Re:Earth CMS. When the request feature is enabled for a role, members of that role **cannot publish items directly** — they must go through the request workflow:
1. Create a request containing one or more items
2. Assign reviewers
3. Discuss changes in a thread
4. Have a reviewer approve or reject the request

This ensures that content from those roles is always reviewed before going live, providing a clear separation between content authors and publishers.

> **The request feature is opt-in and disabled by default.** A workspace Owner or Maintainer must enable it per role in the project settings (**Settings → Roles**). Once enabled for a role, members of that role must submit a request to publish — direct publishing is no longer available to them.

## Request States

| State | Description |
|---|---|
| **DRAFT** | The request has been created but not yet submitted for review. Only the creator can see and edit it. |
| **WAITING** | The request has been submitted and is awaiting reviewer action. |
| **APPROVED** | A reviewer has approved the request. The items are published. |
| **CLOSED** | The request was rejected or withdrawn by the creator. Items return to DRAFT status. |

> **Note:** In the API and database, state values are lowercase strings: `"draft"`, `"waiting"`, `"approved"`, `"closed"`.

### State Transitions

```
DRAFT ──► WAITING ──► APPROVED
                 └──► CLOSED
```

- A DRAFT request can be submitted (→ WAITING) or deleted.
- A WAITING request can be approved (→ APPROVED) or closed (→ CLOSED).
- APPROVED and CLOSED are terminal states.

## Creating a Request

### From the Item Editor

1. Open an item in the editor.
2. Click **New Request** (or **Add to Request** if a request already exists).
3. Enter a **title** for the request.
4. Optionally add a **description**.
5. Assign one or more **reviewers** (workspace members).
6. Click **Create** — the request is created in **DRAFT** state.

### From the Content List (Bulk)

1. Select multiple items in the content list using checkboxes.
2. Click **Add to Request** in the bulk action bar.
3. Choose an existing DRAFT request or create a new one.

## Submitting a Request

Once a request is ready for review:
1. Open the request.
2. Click **Submit** — the state changes to **WAITING**.
3. Reviewers are notified.

## Reviewing a Request

Reviewers can:
- View all items included in the request with their current values
- Comment in the request's thread
- **Approve** the request (→ APPROVED, items are published)
- **Close** the request (→ CLOSED, items remain in DRAFT)

> Only users assigned as reviewers — or workspace Owners and Maintainers — can approve a request.

## Approving a Request

1. Open the request (must be in WAITING state).
2. Review the items and any discussion in the thread.
3. Click **Approve**.
4. All items in the request are published (status → PUBLIC).
5. The request state changes to APPROVED.

## Closing a Request

To reject or withdraw a request:
1. Open the request.
2. Click **Close**.
3. The request state changes to CLOSED.
4. Items return to DRAFT status if they were not previously published.

## Request Items

A request can contain multiple items from the same project (even from different models). Each item in the request is tracked with:
- The item ID
- The version of the item at the time of the request

## Discussion Thread

Every request has a linked **comment thread**. All assigned reviewers, the request creator, and any workspace Owner/Maintainer can post comments. Comments support Markdown formatting.

See [Threads and Comments](./threads-and-comments.md) for more details.

## Item Status During Review

When an item is included in a WAITING request:
- If the item was in DRAFT: its status becomes **REVIEW**
- If the item was already PUBLIC: its status becomes **PUBLIC_REVIEW**

This lets editors see at a glance which items are currently under review.

## Permissions

| Action | Required Role |
|---|---|
| Create a request | Writer, Maintainer, or Owner |
| Submit a request | Creator of the request, Maintainer, or Owner |
| Approve a request | Assigned reviewer, Maintainer, or Owner |
| Close a request | Creator, Maintainer, or Owner |
| View all requests | Maintainer or Owner |
| View own requests | Writer |

## API Access

| GraphQL Operation | Description |
|---|---|
| `requests(projectId: ...)` | List requests in a project |
| `request(id: ...)` | Get a single request |
| `createRequest(input: ...)` | Create a new request |
| `updateRequest(input: ...)` | Update title, description, reviewers, items |
| `approveRequest(requestId: ...)` | Approve a request |
| `deleteRequest(requestId: ...)` | Delete a DRAFT request |
