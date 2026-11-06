# Boolean Fields

Re:Earth CMS provides two boolean field types: **Bool** and **Checkbox**. Both store a true/false value but differ in their editor appearance.

## Bool (`bool`)

A toggle switch field. Visually presented as an on/off toggle in the item editor.

**API key:** `bool`

**Editor:** Toggle switch.

**API value type:** `boolean` (`true` or `false`)

**Example use cases:**
- Is featured (yes/no)
- Published (yes/no)
- Available (yes/no)
- Is verified

---

## Checkbox (`checkbox`)

A checkbox field. Visually presented as a checkbox in the item editor.

**API key:** `checkbox`

**Editor:** Checkbox.

**API value type:** `boolean` (`true` or `false`)

**Example use cases:**
- Terms accepted
- Review completed
- Has attachments
- Is archived

---

## Comparison

Both types store and return the same value (`true`/`false`). The only difference is the visual representation in the editor:

| | Bool | Checkbox |
|---|---|---|
| API key | `bool` | `checkbox` |
| Editor | Toggle switch | Checkbox |
| API value | `boolean` | `boolean` |

Choose based on the UI metaphor that best fits your data. Use **Bool** for on/off states; use **Checkbox** for confirmations or selections.

## Configuration

| Option | Description |
|---|---|
| **Name** | Display label |
| **Key** | API key |
| **Required** | If true, the field must be explicitly set (default is `false`) |
| **Multiple** | Allow multiple boolean values (uncommon, but supported) |
| **Default Value** | `true` or `false` (defaults to `false` if not set) |

## Filtering

Boolean fields support the `equals` operator in views:
- `equals: true` — shows only items where the field is true
- `equals: false` — shows only items where the field is false

## Notes

- A boolean field with no value set is treated as `false` in the API response.
- Setting **Required** on a boolean field means the user must explicitly set it to either `true` or `false` (they cannot leave it unset).
