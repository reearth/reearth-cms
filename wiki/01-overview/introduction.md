# Introduction to Re:Earth CMS

Re:Earth CMS is an open-source, headless content management system (CMS) purpose-built for GIS (Geographic Information Systems) data and general structured content. It is developed by [Eukarya Inc.](https://eukarya.io) as part of the Re:Earth platform ecosystem.

## What is Re:Earth CMS?

Re:Earth CMS provides a flexible, API-first platform for managing structured data. Unlike traditional CMS platforms, it delivers content via API rather than rendering web pages directly — making it suitable for any frontend framework, mobile application, GIS viewer, or data pipeline.

Its distinguishing characteristic is **native GIS support**: geometry fields, spatial data preview (GeoJSON, 3D Tiles, Mapbox Vector Tiles), and tight integration with the Re:Earth visualization platform.

## Key Features

### Content Modeling
Define the exact structure of your data using schemas. A schema is composed of **fields** — Re:Earth CMS supports 19 distinct field types ranging from plain text and numbers to file assets, geometry objects, and cross-item references.

### Collaborative Workflows
Teams can collaborate through a built-in **request and review system**. A writer proposes changes via a request; reviewers discuss in threaded comments and approve or reject the change before it is published.

### Content Versioning
Every change to a content item is tracked with a Git-like versioning system. Items have a **latest** version (the current draft) and a **published** version (the public snapshot). The history of all previous versions is preserved and queryable.

### Asset Management
Upload any file type. The system automatically detects the preview type (image, GeoJSON, 3D Tiles, CSV, etc.) and stores assets in pluggable backends (local filesystem, AWS S3, or Google Cloud Storage). ZIP archives are automatically decompressed.

### Saved Views
Users can create named, saved views on any model — pre-configured with filters, sort orders, and visible column selections. Views make it easy for different team members to see only the data they need.

### Import and Export
Bulk import data from JSON, CSV, or GeoJSON. Export in the same formats. A schema import/export feature lets you migrate model definitions between projects.

### Integrations and Webhooks
Register third-party integrations and configure webhooks to receive HTTP notifications on item or asset events (create, update, delete, publish, decompress).

### Role-Based Access Control
Four roles — **Owner**, **Maintainer**, **Writer**, and **Reader** — with fine-grained permission logic at both workspace and project level.

### Multilingual Interface
The web UI supports internationalization (i18n) for multiple languages.

## Core Concepts at a Glance

| Concept | Description |
|---|---|
| **Workspace** | The top-level organizational unit. A workspace contains projects and has members with roles. |
| **Project** | A container for models and assets. Projects have visibility settings and can issue API keys. |
| **Model** | Defines the structure of a type of content. Contains a schema. |
| **Schema** | The set of fields that define the structure of a model. |
| **Field** | A single typed data attribute within a schema. |
| **Item** | A single record (instance) of a model, holding actual data. |
| **Asset** | A file upload associated with a project. |
| **Request** | A change proposal for one or more items, going through a review workflow. |
| **View** | A saved, filtered/sorted presentation of items in a model. |
| **Integration** | A third-party application connected to the CMS via API and webhooks. |
| **Thread** | A comment thread attached to an item, asset, or request. |

## Use Cases

- **GIS data management** — Store, version, and publish geographic datasets used by Re:Earth or other mapping applications.
- **Digital content publishing** — Manage articles, pages, and media files delivered to websites or mobile apps.
- **Data pipeline staging** — Import, validate, enrich, and export structured data as part of a larger processing pipeline.
- **Multi-team content governance** — Use request workflows, role-based permissions, and comment threads for editorial control across large teams.
- **3D visualization data** — Manage 3D Tiles, GeoJSON, and MVT assets used for city modeling, infrastructure, or environmental datasets.

## Relationship to Re:Earth

Re:Earth CMS is one component of the Re:Earth open platform. The Re:Earth visualization application can consume content and assets managed in Re:Earth CMS via its public API, enabling an end-to-end workflow from data authoring to interactive 3D visualization.

## License and Source

Re:Earth CMS is open source. The source code is available at [github.com/reearth/reearth-cms](https://github.com/reearth/reearth-cms).
