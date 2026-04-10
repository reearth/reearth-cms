# Projects

A **project** is a container for content models and assets within a workspace. It represents a distinct content domain — for example, a website, an application, or a GIS dataset collection.

## Overview

Each project belongs to exactly one workspace. Within a project you can:
- Define **models** (content types) with custom schemas
- Create and manage **items** (content records)
- Upload and manage **assets** (files)
- Configure **visibility** and **API keys**
- Manage **integrations**

## Creating a Project

1. From the workspace dashboard, click **New Project**.
2. Enter a **name** (displayed in the UI).
3. Optionally enter a **description**.
4. Choose a **visibility** setting (see below).
5. Click **Create Project**.

## Project Visibility

A project's visibility controls how its content can be accessed via the public API:

| Setting | Description |
|---|---|
| **Private** | Content is not publicly accessible. All API access requires authentication. (default) |
| **Public** | Content marked as published can be accessed without authentication via the public API. |

> Changing visibility to **Public** does not automatically make all content visible. Only **published** items (status `PUBLIC`) are returned by the public API.

### Publication Settings

Within a public project, you can further control which models and assets are publicly accessible:
- **Public models** — select which models appear in the public API
- **Public assets** — choose whether uploaded files can be accessed without a token

## API Keys

Projects support API keys for programmatic access from external systems (integrations, scripts, pipelines).

### Creating an API Key

1. Go to **Settings** → **Accessibility** (or API Keys)
2. Click **Create New Key**
3. Give it a name (e.g. `Production Integration`)
4. Copy the generated token — it is shown only once

### Using an API Key

Include the token in the `Authorization` header:

```
Authorization: Bearer <your-api-key>
```

API keys have the same access level as a **Writer** role by default within the project.

### Regenerating an API Key

If a key is compromised:
1. Go to **Settings** → **API Keys**
2. Click **Regenerate** next to the key
3. Update all consumers with the new token

## Project Settings

| Setting | Description |
|---|---|
| **Name** | Display name of the project |
| **Description** | Optional description |
| **Alias** | URL-safe identifier used in API paths (auto-generated from name) |
| **Visibility** | Public or Private |
| **Publication** | Controls which models/assets are publicly accessible |

## README and License

Each project can have:
- A **README** — markdown content describing the project (accessible via API)
- A **License** — the data license for the project's content

These are accessible via the public API and useful for open data projects.

## Deleting a Project

Only workspace **Owners** and **Maintainers** can delete a project. Deletion is permanent and removes all models, items, and assets in the project.

To delete:
1. Go to **Settings** → **General**
2. Scroll to the **Danger Zone**
3. Click **Delete Project** and confirm

## API Access

Key GraphQL operations:

| Operation | Description |
|---|---|
| `projects(workspaceId: ...)` | List all projects in a workspace |
| `node(id: ..., type: Project)` | Get a project by ID |
| `createProject(input: ...)` | Create a new project |
| `updateProject(input: ...)` | Update project settings |
| `deleteProject(input: ...)` | Delete a project |
| `publishProject(input: ...)` | Change publication settings |

The public REST API path structure uses the project alias:
```
/api/projects/{projectAlias}/...
```
