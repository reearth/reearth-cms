# Number Fields

Re:Earth CMS provides two numeric field types: **Integer** for whole numbers and **Number** for floating-point values.

## Integer (`integer`)

Stores a whole number (no decimal component). Suitable for counts, ordering values, years, or any data that is naturally an integer.

**Editor:** Numeric input (integer step).

**API value type:** `number` (JSON integer)

**Validation options:**
- **Min value** — minimum allowed value
- **Max value** — maximum allowed value

**Example use cases:**
- Population count
- Year (e.g. 2024)
- Priority level (1, 2, 3)
- Sort order
- Floor number in a building

---

## Number (`number`)

Stores a floating-point number. Use this for measurements, coordinates, ratios, or any data with decimal precision.

**Editor:** Numeric input (allows decimals).

**API value type:** `number` (JSON number)

**Validation options:**
- **Min value** — minimum allowed value
- **Max value** — maximum allowed value

**Example use cases:**
- Temperature (e.g. 36.6)
- Price (e.g. 1999.99)
- Elevation (e.g. 234.5 meters)
- Percentage (e.g. 87.3)
- Latitude/longitude coordinate

---

## Comparison

| | Integer | Number |
|---|---|---|
| Decimal values | No | Yes |
| API type | JSON integer | JSON number |
| Min/Max validation | Yes | Yes |

## Multiple Values

Both types support `multiple: true`, which stores an array of numbers. In the editor, additional number inputs can be added.

## Default Values

Both Integer and Number fields support a default value. The default is applied when a new item is created if no value is explicitly set.

## Notes

- Integer fields store values as 64-bit integers internally.
- Number fields store values as 64-bit IEEE 754 floats.
- Very large integers (beyond JavaScript's safe integer range) may lose precision when serialized to JSON. For such cases, consider using a Text field and storing the number as a string.
