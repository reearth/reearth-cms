# i18n Follow-up Tasks

## English Key Fixes

- **line.111**: `"Could not display svg"` — `"svg"` should be `"SVG"` (capitalization)
- **line.183**: `"End point"` — should be `"Endpoint"` (one word)
- **line.407**: `"No Integration yet"` — `"yet"` should be `"Yet"` (title case)
- **line.416**: `"Not supported"` — too generic; should be more specific e.g. `"File format not supported for preview"`
- **line.427**: `"One of the items already exists in the request."` — unnatural; should be `"One of the items has already been added to the request."`
- **line.563 / line.564**: `"search models"` and `"search projects"` — lowercase "search" inconsistent with `"Search Location"` (L562) and `"Search user"` (L565)
- **line.572**: `"select role"` — lowercase "select" inconsistent with other "Select X" keys
- **line.728**: `"...items that not been published yet"` — should be `"...items that have not been published yet"`
- **line.729**: `"...items that not published yet"` — should be `"...items that have not been published yet"`
- **line.593 / line.594**: `"State"` and `"Status"` — both translate to `"ステータス"`; near-duplicate, one should be removed
- **line.602 / line.603**: `"Successfully created field!"` and `"Successfully created fields!"` — both translate to `"フィールドの作成に成功しました。"`; near-duplicate, one should be removed
- **line.652 / line.653 / line.654**: `"Support Type"`, `"Supported type"`, `"Supported types"` — all translate to `"対応タイプ"`; consolidate into one key
- **line.598-649**: `"Successfully ..."` messages — consider simplifying `"〜に成功しました。"` pattern to `"〜しました。"` for more natural toast notification style

## Duplicate / Near-duplicate Key Cleanup

- **line.122 / line.124**: `"Created At"` and `"Created Time"` — both translate to `"作成日時"`
- **line.123 / line.125**: `"Created By"` and `"Creator"` — both translate to `"作成者"`
- **line.185 / line.186**: `"Ensures that a multiple entries..."` (grammatically incorrect) and `"Ensures that multiple entries..."` — near-duplicate; one should be removed
- **line.192 / line.194**: `"Export as CSV"` and `"Export CSV"` — near-duplicate; one should be removed
- **line.278 / line.281**: `"Float"` and `"Fractional"` — both translate to `"小数"`
- **line.325 / line.326**: `"Int"` and `"Integer"` — both translate to `"整数"`
- **line.514 / line.515**: `"Publish State"` and `"Publish Status"` — near-duplicate; remove `"Publish State"`, keep `"Publish Status"`

## Call Site Verification

- **line.118 / line.700**: `"Create Field"` / `"Update Field"` — Japanese uses `{{field}}` interpolation but English key does not; verify the variable is always passed at the call site
