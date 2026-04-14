# Assets

An **asset** is a file uploaded to a project. Assets can be images, GeoJSON files, 3D tiles, CSV files, ZIP archives, or any other file type.

## Overview

Assets in Re:Earth CMS are:
- Stored in the configured file storage backend (local filesystem, AWS S3, or Google Cloud Storage)
- Associated with a project
- Optionally referenced from item fields (via the Asset field type)
- Accessible via a unique URL
- Independently manageable from a project-level asset library

## Uploading Assets

### Via the Web UI

1. Navigate to **Assets** in the left sidebar.
2. Click **Upload**.
3. Select a file from your computer — or enter a **URL** to import a remote file.
4. The upload begins immediately. Large files use multipart presigned URL upload for efficiency.

### Via the API

Assets can be uploaded via the GraphQL mutation:
```graphql
mutation {
  createAsset(input: { projectId: "...", file: <upload> }) {
    asset { id url fileName size }
  }
}
```

Or via URL ingestion (the server fetches the file):
```graphql
mutation {
  createAssetUpload(input: { projectId: "...", filename: "data.geojson" }) {
    url  # presigned upload URL
    token
  }
}
```

## Asset Metadata

Each asset stores:

| Field | Description |
|---|---|
| **ID** | Unique identifier |
| **File Name** | Original file name |
| **Size** | File size in bytes |
| **Preview Type** | Detected content type category (see below) |
| **Created At** | Upload timestamp |
| **Created By** | User or integration that uploaded the file |
| **Thread** | Linked comment thread |
| **Archive Extraction Status** | Status of ZIP decompression (if applicable) |
| **Public** | Whether the asset is accessible without authentication |

## Preview Types

The CMS automatically detects the preview type from the file's MIME type and extension:

| Preview Type | Value | Description |
|---|---|---|
| **Image** | `image` | Raster images (JPEG, PNG, GIF, WebP, etc.) |
| **Image SVG** | `image_svg` | SVG vector images |
| **GeoJSON / Geo** | `geo` | GeoJSON, KML, CZML geographic data |
| **3D Tiles** | `geo_3d_tiles` | Cesium 3D Tiles tilesets |
| **MVT** | `geo_mvt` | Mapbox Vector Tiles |
| **3D Model** | `model_3d` | glTF / glb 3D models |
| **CSV** | `csv` | Comma-separated value files |
| **Unknown** | `unknown` | Any unrecognized file type |

> **CSV preview note:** CSV files can only be previewed if they contain columns named `lat` and `lng` (latitude and longitude). Files without these columns will show as Unknown.

Detection is performed in this order:
1. MIME type (Content-Type header)
2. File extension

The detected preview type drives the in-browser viewer displayed when you click an asset.

## In-Browser Viewers

Depending on the preview type, different viewers are used:

| Preview Type | Viewer |
|---|---|
| `image` | Image viewer |
| `image_svg` | SVG viewer |
| `geo` (GeoJSON / KML / CZML) | Cesium 3D globe |
| `geo_3d_tiles` | Cesium 3D globe with 3D Tiles |
| `geo_mvt` | Mapbox Vector Tiles viewer |
| `model_3d` | glTF/glb 3D model viewer |
| `csv` | CSV table viewer |

## Archive Decompression

ZIP files uploaded to Re:Earth CMS are automatically decompressed asynchronously. The decompressed files are stored alongside the archive and become individually accessible assets.

### Archive Extraction Status

| Status | Description |
|---|---|
| **PENDING** | Decompression queued |
| **IN_PROGRESS** | Decompression running |
| **DONE** | Successfully decompressed |
| **FAILED** | Decompression failed |
| **SKIPPED** | File is not an archive |

### Flat Files Option

When uploading a ZIP, you can enable **Flat Files** mode — all files inside the archive are placed in a flat directory structure (no subdirectory nesting is preserved). This is useful for tilesets and other formats that expect a flat layout.

### Performance

The decompressor worker uses:
- 192 parallel workers
- 5000 GC threshold
- 1 MB chunk size
- 20 GB disk limit

Progress is tracked in GCS metadata, enabling resumable decompression of very large archives.

## Asset Access Control

### Public vs Private

Each asset has a `public` flag:
- **Public** — the asset URL works without authentication
- **Private** — the asset URL requires a valid auth token

This is controlled at the project level via **Publication Settings** and can be overridden per-asset.

When `REEARTH_CMS_ASSET_PUBLIC=true` (default), public assets are served directly from the storage bucket URL. When `false`, the CMS proxies all asset access and enforces auth.

## Asset URL Structure

Assets are stored with the path:
```
assets/{first-2-chars-of-uuid}/{remaining-uuid}/{filename}
```

Example:
```
assets/ab/cd1234-5678-abcd-ef01/my-file.geojson
```

## Deleting Assets

Assets can be deleted from the asset list or from the asset detail view. Deletion is permanent and removes the file from storage.

> **Note:** Deleting an asset that is referenced by items will leave those item fields pointing to a non-existent asset. Check references before deleting.

## API Access

| GraphQL Operation | Description |
|---|---|
| `assets(projectId: ...)` | List assets in a project |
| `asset(id: ...)` | Get a single asset by ID |
| `createAsset(input: ...)` | Upload a new asset |
| `createAssetUpload(input: ...)` | Get a presigned upload URL |
| `updateAsset(input: ...)` | Update asset metadata |
| `deleteAsset(input: ...)` | Delete an asset |

Public REST API (read-only, public assets only):
```
GET /api/p/{workspaceIdOrAlias}/{projectIdOrAlias}/assets/{assetId}
```
