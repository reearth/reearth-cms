# Select and Tag Fields

Re:Earth CMS provides two option-based field types: **Select** for single-choice and **Tag** for multi-choice selections.

## Select (`select`)

A dropdown field that allows the user to choose exactly **one** option from a predefined list.

**API key:** `select`

**Editor:** Dropdown selector.

**API value type:** `string` (the selected option value)

### Configuring Options

In the field configuration, under **Settings**:
1. Click **Add Option**.
2. Enter the option label/value.
3. Repeat for each option.
4. Optionally set a **default value**.

Options are stored as strings. The same string is used as both the display label and the stored value.

### Example Use Cases

- Article category (e.g. `news`, `tutorial`, `announcement`)
- Status label (e.g. `draft`, `review`, `published`)
- Content language (e.g. `en`, `ja`, `fr`)
- Difficulty level (e.g. `beginner`, `intermediate`, `advanced`)

### Multiple Values

Select supports `multiple: true`, which effectively makes it behave like a Tag field — multiple options can be chosen. The API returns an array of strings.

---

## Tag (`tag`)

A multi-select field that allows the user to choose **one or more** options from a predefined list. Similar to a tag or label picker.

**API key:** `tag`

**Editor:** Tag picker (searchable, allows adding multiple selections).

**API value type:** `string[]` (array of selected option values)

### Configuring Options

Same as Select — define the allowed options in the field configuration. Users can select any combination of these options.

### Example Use Cases

- Article tags (e.g. `gis`, `3d-tiles`, `japan`, `urban-planning`)
- Feature flags
- Content topics
- Product attributes (color, size, material)
- Location categories

---

## Comparison

| | Select | Tag |
|---|---|---|
| API key | `select` | `tag` |
| Max selections | 1 (or many if `multiple: true`) | Many |
| API value | `string` | `string[]` |
| Typical use | One-of categories | Many-of labels |

## Filtering

Both types support filtering in views:

| Operator | Description |
|---|---|
| `includes_any` | Value includes any of the specified options |
| `includes_all` | Value includes all of the specified options (Tag only) |
| `not_includes` | Value does not include any of the specified options |
| `empty` | No option selected |
| `not_empty` | At least one option selected |

## Managing Options

Options can be added, renamed, or removed in the field configuration modal.

> **Warning:** Renaming an option does **not** update existing item values. Stored values reference the original option string. If you rename an option, items with the old value will not match the new option name in the UI.
>
> To safely rename an option:
> 1. Add the new option
> 2. Update all affected items to use the new option
> 3. Remove the old option

## Notes

- Options are defined at schema/field level and are shared across all items in the model.
- The options list is stored as part of the field's `typeProperty`.
- Empty option lists are allowed (useful for fields that will have options added later).
