# E2E Refactoring: Content Page - Summary of Changes

## Overview

Refactored content.page.ts to follow Playwright locator best practices, replacing 20+ brittle CSS selectors with stable `data-testid` attributes.

## Files Changed

### [web/e2e/pages/content.page.ts](web/e2e/pages/content.page.ts)

Refactored selectors:

1. **Line 36**: `editButton` - Changed from `.getByRole("cell").getByLabel("edit").locator("svg")` to `getByTestId("content-edit-button")`
2. **Line 90**: `cellEditButton` - Changed to `getByTestId("content-edit-button")`
3. **Line 93**: `cellEditButtonByIndex` - Changed to `getByTestId("content-edit-button").nth(index)`
4. **Line 103**: `tooltipEditButton` - Changed to `getByTestId("content-tooltip-edit-button")`
5. **Line 108**: `tableBodyElement` - Changed from `.locator(".ant-table-body")` to `getByTestId("content-table-body")`
6. **Line 125**: `moreButton` - Changed from `.getByLabel("more").locator("svg")` to `getByTestId("content-more-button")`
7. **Line 148**: `sortUpIcon` - Changed from `.locator(".anticon-caret-up")` to `getByTestId("sort-up-icon")`
8. **Line 151**: `sortDownIcon` - Changed from `.locator(".anticon-caret-down")` to `getByTestId("sort-down-icon")`
9. **Line 154**: `tableRow` - Changed from `.locator(".ant-table-row").nth(index)` to `getByTestId("content-table-row").nth(index)`
10. **Line 188**: `settingsButton` - Changed from `.getByRole("main").getByLabel("setting").locator("svg")` to `getByTestId("content-settings-button")`
11. **Line 191**: `statusCheckbox` - Changed from `.locator(".ant-tree-checkbox").first()` to `getByTestId("status-tree-checkbox").first()`
12. **Line 212**: `tableBodyRows` - Changed from `.locator("tbody > tr.ant-table-row")` to `getByTestId("content-table-row")`
13. **Line 286**: `cssAssetByIndex` - Changed from `.locator(".css-7g0azd").nth(index)` to `getByTestId("asset-field-item").nth(index)`
14. **Line 299**: `antTableRowTd` - Changed from `.locator(".ant-table-row > td")` to `getByTestId("content-table-row").locator("td")`
15. **Line 323**: `antTableBody` - Changed to `getByTestId("content-table-body")`
16. **Line 386**: `tableColumnButton` - Changed from `.locator(".ant-table-row > td:nth-child(...)")` to use `getByTestId("content-table-row")`
17. **Line 391**: `firstTextContainer` - Changed from `.locator(".css-1ago99h")` to `getByTestId("multi-value-text-container").first()`
18. **Line 395**: `secondTextContainer` - Changed to `getByTestId("multi-value-text-container").nth(1)`
19. **Line 463**: `viewLinesEditor` - Changed from `.locator(".view-lines")` to `getByTestId("geometry-editor-view-lines")`
20. **Line 472**: `nthTableColumnButton` - Changed to use `getByTestId("content-table-row")`
21. **Line 477**: `antRowButton` - Changed from `.locator(".ant-row")` to `getByTestId("form-row")`
22. **Line 562-564**: `createRequest` method - Changed from `.page.click(".ant-select-selector")` and `.page.locator(".ant-select-item")` to use `getByTestId("select-reviewer")` and `getByTestId("select-item")`
23. **Line 571-572**: `createComment` method - Changed from `.page.locator("#content")` to `getByTestId("comment-content-input")`

## Required data-testid Attributes for UI Components

The following `data-testid` attributes need to be added to the UI components:

### Content Table
- `data-testid="content-table-row"` - Each table row
- `data-testid="content-table-body"` - Table body element
- `data-testid="content-edit-button"` - Edit button in table cells

### Settings & Controls
- `data-testid="content-settings-button"` - Settings button
- `data-testid="content-more-button"` - More actions button
- `data-testid="status-tree-checkbox"` - Tree checkbox elements

### Sorting Icons
- `data-testid="sort-up-icon"` - Sort ascending icon
- `data-testid="sort-down-icon"` - Sort descending icon

### Tooltips
- `data-testid="content-tooltip-edit-button"` - Edit button in tooltips

### Field Components
- `data-testid="asset-field-item"` - Asset field items
- `data-testid="multi-value-text-container"` - Multi-value text containers
- `data-testid="geometry-editor-view-lines"` - Geometry editor lines
- `data-testid="form-row"` - Form row elements

### Comments
- `data-testid="comment-content-input"` - Comment textarea input

### Request Creation
- `data-testid="select-reviewer"` - Reviewer select dropdown
- `data-testid="select-item"` - Dropdown menu items

## Benefits

- Eliminated 20+ brittle CSS selectors dependent on Ant Design internals
- Removed hardcoded CSS class names like `.css-7g0azd`, `.css-1ago99h`
- Replaced complex chained selectors with simple, readable test IDs
- Made tests resilient to UI library updates

## Next Steps

1. Add the required `data-testid` attributes to UI components
2. Run tests to verify the refactoring
3. Consider applying the same pattern to remaining page objects (schema, field editor, project, settings)
