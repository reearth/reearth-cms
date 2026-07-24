# Date Field

The **Date** field stores a date and time value.

## Overview

**API key:** `datetime`

**Editor:** A date/time picker with calendar and time input.

**API value type:** ISO 8601 datetime string (e.g. `"2024-03-15T09:30:00Z"`)

## Configuration Options

| Option | Description |
|---|---|
| **Name** | Display label |
| **Key** | API key |
| **Required** | Whether a date must be provided |
| **Multiple** | Allow multiple date values |
| **Default Value** | A pre-filled date when a new item is created |

## Validation Options

| Validation | Description |
|---|---|
| **Min Date** | Earliest allowed date |
| **Max Date** | Latest allowed date |

## Display Format

In the UI, the date is displayed using the user's locale. In the API, dates are always serialized as UTC ISO 8601 strings.

## Multiple Values

When `multiple: true`, the field stores an array of datetime strings.

## Filtering on Date Fields

Date fields support time-based filter operators in saved views:

| Operator | Description |
|---|---|
| `after` | Date is after the specified date |
| `before` | Date is before the specified date |
| `of_this_week` | Date falls within the current calendar week |
| `of_this_month` | Date falls within the current month |
| `of_this_year` | Date falls within the current year |
| `empty` | No date set |
| `not_empty` | A date is set |

## Example Use Cases

- Publication date of an article
- Event start/end time
- Data collection date for a survey
- Expiry date for a license
- Last inspection date for an asset

## Notes

- All dates are stored and returned in UTC.
- The UI date picker shows times in the user's local timezone but converts to UTC on save.
- When importing data from CSV, dates should be in ISO 8601 format (`YYYY-MM-DDTHH:MM:SSZ`) for reliable parsing.
