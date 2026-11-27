# Asset Field

The **Asset** field type stores a reference to a file uploaded to the project's asset library.

## Overview

An Asset field does not store the file itself — it stores a **reference** (by ID) to an asset that has been uploaded separately. This means:
- The same asset can be referenced by multiple items
- Deleting or updating an asset affects all items that reference it
- The asset must belong to the same project as the item

**API key:** `asset`

**Editor:** A file picker that opens the project's asset library, with search and preview.

**API value type:** Asset ID (string) — the API response includes the full asset object (URL, filename, size, preview type)

## Configuration Options

In the field configuration modal:

| Option | Description |
|---|---|
| **Name** | Display label |
| **Key** | API key |
| **Required** | Whether an asset must be selected |
| **Multiple** | Allow multiple asset references |
| **Default Value** | Not applicable (asset references cannot have a static default) |

## Multiple Assets

When `multiple: true`, the field stores an array of asset IDs. The editor shows a list of selected assets and allows adding or removing entries.

## Uploading Within the Editor

When editing an item, you can upload a new asset directly from the Asset field picker:
1. Click the picker to open the asset library.
2. Click **Upload** in the library.
3. Select a file — it is uploaded and immediately available for selection.
4. Select the newly uploaded asset.

## API Response

When fetching an item via the API, an Asset field value is returned as a full asset object:

```json
{
  "fields": [
    {
      "schemaFieldId": "cover-image",
      "value": {
        "id": "asset-id-here",
        "url": "https://storage.example.com/assets/ab/cdef.../image.jpg",
        "fileName": "image.jpg",
        "size": 204800,
        "previewType": "image",
        "contentType": "image/jpeg"
      }
    }
  ]
}
```

## Example Use Cases

- Cover image for an article
- Attachment file for a document
- GeoJSON data file referenced by a geographic feature
- 3D Tiles tileset folder for a building model
- Audio or video file for a media item

## Supported File Types

Any file type is accepted. The CMS automatically detects the preview type based on file extension and MIME type. See [Assets](../03-concepts/assets.md#preview-types) for the full list of detected preview types.

## Notes

- If an item references an asset and that asset is later deleted, the field value becomes a dangling reference (the asset ID no longer resolves). Check for orphaned references before bulk-deleting assets.
- For the public API, asset URLs are only accessible if both the project and the asset are set to public.
