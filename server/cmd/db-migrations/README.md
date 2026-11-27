# Database Migrations

This directory contains database migration scripts for Re:Earth CMS.

## Available Migrations

### orphaned-data

Audits data left behind by deleted projects (models, schemas, groups, views, items, assets, asset uploads, requests, jobs) and counts projects whose workspace no longer exists. Read-only: only dry run is supported for now; deletion will reuse the project cascade deletion.

```bash
cd server
go build ./cmd/db-migrations
./db-migrations --cmd=orphaned-data
```

- `item` counts all item versions.
- `size` of `asset` is the sum of the asset file sizes recorded in the DB (GCS is not scanned).
- The workspace check reads the account DB set by `REEARTH_CMS_DB_ACCOUNT` (default `reearth_account`).
- Aggregations scan whole collections; run it against a secondary or off-peak.

### text-normalization

Normalizes both asset filenames and item text fields in a single run. This is the recommended way to apply all text normalization.

#### Usage

**1. Build the migration tool:**

```bash
cd server
go build ./cmd/db-migrations
```

**2. Run dry run first (preview changes):**

```bash
./db-migrations --cmd=text-normalization
```

**3. Apply changes (wet run):**

```bash
./db-migrations --cmd=text-normalization --wet-run
```
