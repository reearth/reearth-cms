# Database Migrations

This directory contains database migration scripts for Re:Earth CMS.

## Available Migrations

### asset-filename-normalization

Normalizes asset filenames using Unicode NFKC normalization to ensure consistent storage and retrieval across different Unicode representations.

#### Usage

**1. Build the migration tool:**

```bash
cd server
go build ./cmd/db-migrations
```

**2. Run dry run first (preview changes):**

```bash
./db-migrations --cmd=asset-filename-normalization
```

**3. Apply changes (wet run):**

```bash
./db-migrations --cmd=asset-filename-normalization --wet-run
```
