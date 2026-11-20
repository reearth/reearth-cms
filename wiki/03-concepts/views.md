# Views

A **view** is a saved, named configuration of how the content list for a model is displayed. Views let different team members quickly access the items most relevant to them without manually re-applying filters and sort settings every time.

## Overview

Every model in Re:Earth CMS has a content list — a table showing all items. By default, all items are shown with a default set of columns. Views allow you to:
- **Filter** items by any field value
- **Sort** by any field
- **Show/hide columns** to focus on relevant fields
- **Save** the configuration with a name for later access

Views are per-model and are shared across all members with access to the project.

## Creating a View

1. Navigate to a model's content list.
2. Configure the desired filters, sort, and columns.
3. Click **Save View** (or the save icon near the view selector).
4. Enter a name for the view.
5. Click **Save**.

The view is now available in the view selector at the top of the content list.

## Filtering

Filters let you show only items matching specific conditions.

### Filter Structure

A filter consists of one or more **conditions**, combined with AND or OR logic:

```
Condition: <field> <operator> <value>
```

### Supported Fields for Filtering

- Any schema field (text, number, date, boolean, select, tag, reference, asset)
- System fields: **ID**, **Creation Date**, **Modification Date**, **Status**

### Operators by Type

**Text fields:**
| Operator | Description |
|---|---|
| `equals` | Exact match |
| `not_equals` | Does not match |
| `contains` | Contains substring |
| `not_contains` | Does not contain substring |
| `starts_with` | Starts with string |
| `ends_with` | Ends with string |
| `empty` | No value set |
| `not_empty` | Has a value |

**Number / Integer fields:**
| Operator | Description |
|---|---|
| `equals` | Equal to |
| `not_equals` | Not equal to |
| `greater_than` | Greater than |
| `less_than` | Less than |
| `greater_than_or_equals` | ≥ |
| `less_than_or_equals` | ≤ |
| `empty` | No value set |
| `not_empty` | Has a value |

**Date fields:**
| Operator | Description |
|---|---|
| `after` | After a date |
| `before` | Before a date |
| `of_this_week` | Within the current week |
| `of_this_month` | Within the current month |
| `of_this_year` | Within the current year |
| `empty` | No date set |
| `not_empty` | Has a date |

**Boolean / Checkbox:**
| Operator | Description |
|---|---|
| `equals` | `true` or `false` |

**Select / Tag fields:**
| Operator | Description |
|---|---|
| `includes_any` | Value is any of the selected options |
| `includes_all` | Value includes all of the selected options |
| `not_includes` | Value does not include any of the selected options |
| `empty` | No option selected |
| `not_empty` | At least one option selected |

**Reference fields:**
| Operator | Description |
|---|---|
| `equals` | References a specific item |
| `not_equals` | Does not reference a specific item |
| `empty` | No reference set |
| `not_empty` | Has a reference |

### Combining Conditions

Multiple conditions can be combined with:
- **AND** — all conditions must match
- **OR** — at least one condition must match

## Sorting

Items can be sorted by any field in ascending or descending order. Multiple sort criteria can be applied (primary sort, then secondary, etc.).

## Column Configuration

You can show or hide any field column in the content list. The column configuration is saved as part of the view.

## Default View

The default view (no saved configuration applied) shows all items with a standard set of system columns. This cannot be deleted.

## Managing Views

- To **switch** views: use the view selector dropdown at the top of the content list.
- To **edit** a view: switch to it, modify filters/sort/columns, then save.
- To **delete** a view: open the view menu and choose **Delete View**.
- To **rename** a view: open the view menu and choose **Rename**.

## API Access

| GraphQL Operation | Description |
|---|---|
| `views(modelId: ...)` | List saved views for a model |
| `createView(input: ...)` | Create a new view |
| `updateView(input: ...)` | Update view configuration |
| `deleteView(input: ...)` | Delete a view |
