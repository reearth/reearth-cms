# Database Migrations

This directory contains database migration scripts for Re:Earth CMS.

## Available Migrations

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
