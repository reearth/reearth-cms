# Glossary

Key terms and concepts used in Re:Earth CMS.

---

## A

**Asset**
A file uploaded to a project. Assets are stored in the configured file storage backend and can be referenced by items via Asset fields. Each asset has a detected preview type (image, geo, 3D tiles, CSV, etc.).

**Archive Extraction Status**
The processing state of a ZIP asset: PENDING, IN_PROGRESS, DONE, FAILED, or SKIPPED.

---

## C

**Checkpoint / Version Ref**
A named reference to a specific item version. Two standard refs exist: `latest` (most recently saved) and `public` (most recently published).

**Comment**
A message posted in a thread attached to an item, asset, or request. Supports Markdown.

**Content Item** — see *Item*

**CMS** (Content Management System)
Re:Earth CMS is a headless CMS — it manages and delivers content via API rather than rendering web pages directly.

---

## D

**Domain Layer**
The innermost layer of the backend architecture (`pkg/`). Contains pure business entities and logic with no external dependencies.

**Draft**
An item saved but not yet published. The item's status is `DRAFT` and it is not accessible via the public API.

---

## F

**Field**
A typed data attribute in a schema. Fields define what data items can store (text, number, date, asset, geometry, reference, etc.).

**Field Key**
The machine-readable API identifier for a field. Used in API responses and import/export files.

**Field Type**
The data type of a field. Re:Earth CMS supports 19 field types: Text, TextArea, RichText, Markdown, Integer, Number, Bool, Checkbox, Date, Select, Tag, Asset, Reference, URL, GeometryObject, GeometryEditor, Group, (plus Json and DateTime internally).

---

## G

**GeoJSON**
An open standard format for encoding geographic data structures using JSON. Re:Earth CMS supports GeoJSON as a field value type, asset preview type, and import/export format.

**Geometry Field**
A field type that stores a GeoJSON geometry value. Two variants: `GeometryObject` (JSON input) and `GeometryEditor` (interactive map drawing).

**GQL** (GraphQL)
The primary API protocol used between the web frontend and backend server.

**Group Field**
A field type that contains a set of sub-fields, allowing repeatable structured data within a single item.

---

## I

**Integration**
A third-party application connected to Re:Earth CMS. Integrations authenticate via a secret token and can receive webhook notifications. Can be Public (shared) or Private (workspace-specific).

**Interactor**
A Go struct in the use case layer that implements one or more use cases by orchestrating domain objects, repositories, and gateways.

**Item**
A single content record — an instance of a model. Items hold field values and have a status (DRAFT, PUBLIC, REVIEW, PUBLIC_REVIEW, PUBLIC_DRAFT).

**Item Group**
A set of field values within a Group field. Multiple item groups can exist for a single Group field instance.

**Item Status**
One of five states: DRAFT, PUBLIC, REVIEW, PUBLIC_REVIEW, PUBLIC_DRAFT.

---

## J

**Job**
An asynchronous task tracked in the database. Jobs are created for long-running operations (import, decompression). Status: RUNNING, COMPLETED, or FAILED.

---

## L

**Latest Version**
The most recently saved version of an item. Always reflects the most recent edits, even if unpublished.

---

## M

**M2M** (Machine-to-Machine)
Authentication method used for internal service communication (worker → main server). Uses a dedicated JWT issuer.

**Maintainer**
A workspace role with administrative permissions. Can manage projects, models, schemas, members, and approve requests. Cannot delete the workspace.

**Metadata Item**
A secondary content item linked to a main item, using a separate metadata schema. Used for administrative or operational fields separate from main content.

**Metadata Schema**
A secondary schema attached to a model. Used for metadata items.

**Model**
Defines the structure of a content type. Has a schema (field definitions). Items are instances of a model.

**MutateSchema**
An import option that automatically extends the model schema with new fields inferred from the imported data.

---

## O

**Operator**
The resolved identity and permission set for an API request. Contains the caller's user or integration ID, and lists of workspace/project IDs they can access at each permission level.

**Owner**
The highest workspace role. Has full control including deleting the workspace.

---

## P

**POM** (Page Object Model)
A design pattern used in Playwright E2E tests that encapsulates page interactions into reusable classes.

**Project**
A container for models and assets within a workspace. Has visibility settings (public/private) and can issue API keys.

**Public Version**
The published snapshot of an item. Accessible via the public API. Created when an item is published.

---

## R

**Reader**
A workspace role with read-only access. Cannot create, edit, or delete any content.

**Reference Field**
A field type that stores a reference (by ID) to another item in the same project.

**Request**
A change proposal containing one or more items, going through a review workflow. States: DRAFT, WAITING, APPROVED, CLOSED.

**Role**
A permission level assigned to workspace members: OWNER, MAINTAINER, WRITER, READER.

---

## S

**Schema**
The set of fields attached to a model. Defines the structure of items in that model.

**Select Field**
A field type allowing selection of one option from a predefined list.

---

## T

**Tag Field**
A field type allowing selection of multiple options from a predefined list.

**Thread**
A comment discussion attached to an item, asset, or request.

**3D Tiles**
A Cesium open standard for streaming massive 3D geospatial datasets. Supported as an asset preview type in Re:Earth CMS.

---

## V

**Version**
A snapshot of an item at a specific point in time. The version chain forms an immutable history of all changes.

**View**
A saved, named configuration of the content list for a model, including filters, sort order, and visible columns.

---

## W

**Webhook**
An HTTP callback sent to an external URL when a specific event occurs in Re:Earth CMS (item created, published, asset uploaded, etc.).

**Worker**
A separate process that handles asynchronous tasks (decompression, import, webhook delivery).

**Workspace**
The top-level organizational unit. Contains projects and has members with roles.

**Writer**
A workspace role for content contributors. Can create and edit their own items and assets. Can publish. Cannot manage workspace settings.

---

## Abbreviations

| Abbreviation | Meaning |
|---|---|
| CMS | Content Management System |
| GQL | GraphQL |
| GCS | Google Cloud Storage |
| S3 | Amazon Simple Storage Service |
| M2M | Machine-to-Machine |
| IAP | Identity-Aware Proxy (GCP) |
| POM | Page Object Model |
| SPA | Single-Page Application |
| RBAC | Role-Based Access Control |
| MVT | Mapbox Vector Tiles |
| ULID | Universally Unique Lexicographically Sortable Identifier |
