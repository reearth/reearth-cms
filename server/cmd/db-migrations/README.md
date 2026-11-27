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

### geometry-unification

Converts Geometry Object and Geometry Editor fields into Geometry fields:

- Field types become `geometry`, and their supported types are removed (Geometry accepts every geometry type).
- Item values (every version) and default values stored as GeoJSON strings become GeoJSON objects.
- Members other than `type`, `coordinates` (`geometries` for a GeometryCollection) and `bbox`, such as `properties` or `id`, are removed, including in the members of a GeometryCollection. Geometry Object values were stored without checking for them, and the Geometry field rejects them.
- A valid `bbox` is kept; an invalid one is removed.
- Every Geometry value, including those of existing Geometry fields, is saved with sorted keys, so equal geometries are stored identically and unique fields find them.

Nothing is rejected. The run reports, for the latest item versions and the default values:

- values that do not pass the Geometry validation, including empty geometries and values over the limits of a field (they are converted, and must be fixed before the item can be saved again),
- values that are not GeoJSON objects (they are removed),
- the members removed from each value, and invalid bboxes,
- duplicate values in unique fields (they are kept).

Run it before deploying the server version that removes the Geometry Object and Geometry Editor fields, and again after the deploy to convert anything saved in between (it is safe to run again):

1. dry run, and check the report
2. wet run
3. deploy the server and the web app together (the web app must no longer query the removed GraphQL types)
4. wet run again

```bash
cd server
go build ./cmd/db-migrations
./db-migrations --cmd=geometry-unification            # dry run: report only
./db-migrations --cmd=geometry-unification --wet-run  # apply
```
