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

### metadata-item-threads

Deletes comment threads attached to metadata items and unsets the `thread` reference on every version of those metadata items. Metadata items are not meant to have threads, and item deletion does not remove them.

The dry run logs, per metadata item, each thread with its workspace and comment count (comment contents are never logged). Threads that a non-metadata item, an asset, or a request also points to are skipped.

```bash
./db-migrations --cmd=metadata-item-threads           # dry run
./db-migrations --cmd=metadata-item-threads --wet-run # apply
```
