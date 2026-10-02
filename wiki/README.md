# Re:Earth CMS Documentation

Welcome to the Re:Earth CMS wiki. Re:Earth CMS is an open-source headless CMS purpose-built for GIS data and general structured content, developed by [Eukarya Inc.](https://eukarya.io).

---

## Table of Contents

### 01 — Overview
- [Introduction](01-overview/introduction.md) — What Re:Earth CMS is and what it does
- [Architecture](01-overview/architecture.md) — High-level system architecture
- [Tech Stack](01-overview/tech-stack.md) — Technologies, frameworks, and libraries used

### 02 — Getting Started
- [Installation](02-getting-started/installation.md) — Local setup with Docker Compose
- [Configuration](02-getting-started/configuration.md) — Environment variables reference
- [First Steps](02-getting-started/first-steps.md) — Create your first workspace, project, model, and item

### 03 — Core Concepts
- [Workspaces](03-concepts/workspaces.md) — Workspaces, members, and roles
- [Projects](03-concepts/projects.md) — Projects, accessibility settings, and API keys
- [Models and Schemas](03-concepts/models-and-schemas.md) — Models, schemas, and field definitions
- [Items](03-concepts/items.md) — Content items, statuses, and versioning
- [Assets](03-concepts/assets.md) — File assets, preview types, and archive handling
- [Requests](03-concepts/requests.md) — Content review and approval workflow
- [Views](03-concepts/views.md) — Saved views, filtering, and sorting
- [Integrations](03-concepts/integrations.md) — Third-party integrations and webhooks
- [Threads and Comments](03-concepts/threads-and-comments.md) — Comments on items, assets, and requests

### 04 — Field Types
- [Overview](04-field-types/overview.md) — All field types at a glance
- [Text Fields](04-field-types/text-fields.md) — Text, TextArea, RichText, Markdown
- [Number Fields](04-field-types/number-fields.md) — Integer, Number
- [Asset Field](04-field-types/media-fields.md) — File reference fields
- [Date Field](04-field-types/date-fields.md) — Date and datetime fields
- [Boolean Fields](04-field-types/boolean-fields.md) — Bool and Checkbox
- [Select and Tag](04-field-types/select-and-tag.md) — Select, Tag (multi-select)
- [Reference Fields](04-field-types/reference-fields.md) — Cross-item references
- [Geometry Fields](04-field-types/geometry-fields.md) — GeometryObject, GeometryEditor (GIS)
- [Group Fields](04-field-types/group-fields.md) — Nested field groups
- [URL Field](04-field-types/url-fields.md) — URL fields

### 05 — API
- [API Overview](05-api/overview.md) — GraphQL and REST API capabilities
- [GraphQL API](05-api/graphql-api.md) — GraphQL operations reference
- [REST APIs](05-api/public-rest-api.md) — Integration and public REST APIs
- [Authentication](05-api/authentication.md) — Auth methods, API keys, and tokens
- [Webhooks](05-api/webhooks.md) — Webhook events and payloads

### 06 — Import & Export
- [Import Items](06-import-export/import-items.md) — Importing content (JSON, CSV, GeoJSON)
- [Export Items](06-import-export/export-items.md) — Exporting content
- [Schema Import/Export](06-import-export/import-schema.md) — Schema portability
- [Import Strategies](06-import-export/import-strategies.md) — Replace, Skip, and Insert strategies

### 07 — Roles and Permissions
- [Overview](07-roles-and-permissions/overview.md) — Permission model overview
- [Workspace Roles](07-roles-and-permissions/workspace-roles.md) — OWNER, MAINTAINER, WRITER, READER
- [Project Permissions](07-roles-and-permissions/project-permissions.md) — Per-resource permission matrix

### 08 — Deployment
- [Docker](08-deployment/docker.md) — Docker and Docker Compose deployment
- [Cloud Deployment](08-deployment/cloud-deployment.md) — GCP Cloud Run deployment
- [CI/CD](08-deployment/ci-cd.md) — CI/CD pipeline overview
- [Database Migrations](08-deployment/database-migrations.md) — Migration tool usage

### 09 — Development
- [Contributing](09-development/contributing.md) — How to contribute
- [Backend Architecture](09-development/backend-architecture.md) — Clean architecture deep-dive
- [Frontend Architecture](09-development/frontend-architecture.md) — React frontend architecture
- [Code Generation](09-development/code-generation.md) — GraphQL and OpenAPI codegen
- [Testing](09-development/testing.md) — Testing strategies and running tests
- [Worker System](09-development/worker-system.md) — Asynchronous task workers

### 10 — Reference
- [Glossary](10-reference/glossary.md) — Key terms and definitions
- [Environment Variables](10-reference/environment-variables.md) — All environment variables
- [GraphQL Schema Reference](10-reference/graphql-schema.md) — Schema types and operations

---

## Quick Links

| I want to... | Go to |
|---|---|
| Run Re:Earth CMS locally | [Installation](02-getting-started/installation.md) |
| Understand what Re:Earth CMS does | [Introduction](01-overview/introduction.md) |
| Create my first content model | [First Steps](02-getting-started/first-steps.md) |
| Learn about field types | [Field Types Overview](04-field-types/overview.md) |
| Use the API | [API Overview](05-api/overview.md) |
| Set up webhooks | [Webhooks](05-api/webhooks.md) |
| Understand roles | [Workspace Roles](07-roles-and-permissions/workspace-roles.md) |
| Import data | [Import Items](06-import-export/import-items.md) |
| Deploy to production | [Docker](08-deployment/docker.md) |
| Contribute to the project | [Contributing](09-development/contributing.md) |

---

## About Re:Earth CMS

Re:Earth CMS is developed by [Eukarya Inc.](https://eukarya.io) as part of the Re:Earth platform ecosystem. It is open source and available on [GitHub](https://github.com/reearth/reearth-cms).
