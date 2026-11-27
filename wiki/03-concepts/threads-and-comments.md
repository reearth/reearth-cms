# Threads and Comments

Re:Earth CMS supports threaded comments on content items, assets, and review requests. Comments enable team communication directly alongside the content being discussed.

## Overview

A **thread** is a collection of ordered comments attached to a specific resource. Threads are created automatically when:
- A new **item** is created (each item has a thread)
- A new **asset** is uploaded (each asset has a thread)
- A new **request** is created (each request has a thread)

## Comment Structure

Each comment includes:
- **Author** — the user or integration that posted the comment
- **Content** — the text of the comment (Markdown supported)
- **Created At** — timestamp of when the comment was posted

Comments are ordered chronologically within a thread.

## Posting a Comment

### On an Item

1. Open the item editor.
2. Find the **Comments** panel (usually in the right sidebar).
3. Type your comment in the input field.
4. Press **Enter** or click **Post**.

### On an Asset

1. Open the asset detail view.
2. Find the **Comments** panel.
3. Post your comment.

### On a Request

1. Open the request detail view.
2. The request thread is displayed below the request details.
3. Type your comment and post it.

## Markdown Support

Comment content supports Markdown formatting:

```markdown
**Bold text**
*Italic text*
`inline code`
[Link text](https://example.com)
- List item
```

## Editing and Deleting Comments

- Users can edit their own comments.
- Users can delete their own comments.
- Workspace Owners and Maintainers can delete any comment.

## Threads in the API

Threads and comments are managed via the GraphQL API:

| Operation | Description |
|---|---|
| `thread(id: ...)` | Get a thread and its comments |
| `addComment(input: ...)` | Post a new comment to a thread |
| `updateComment(input: ...)` | Edit an existing comment |
| `deleteComment(input: ...)` | Delete a comment |

### Accessing Threads on Resources

Threads are returned as part of their parent resource:

```graphql
query {
  item(id: "...") {
    id
    thread {
      id
      comments {
        id
        content
        createdAt
        author {
          ... on User { name }
          ... on Integration { name }
        }
      }
    }
  }
}
```

## Notifications

When a comment is posted on a request, assigned reviewers and the request creator may be notified depending on the notification settings configured for the workspace.

## Integration Comments

Integrations can also post comments via the API. Integration comments show the integration's name as the author. This is useful for automated bots that comment on items during a data pipeline (e.g. validation results, processing status updates).
