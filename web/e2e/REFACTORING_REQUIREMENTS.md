# Assets Page E2E Refactoring - Required data-testid Attributes

This document lists the `data-testid` attributes that need to be added to the UI components to support the refactored E2E tests following Playwright best practices.

## Required data-testid Attributes

### Upload Modal
- `data-testid="asset-upload-file-input"` - The file input element within `.ant-upload input[type='file']`

### Asset Table/Grid
- `data-testid="asset-table-row"` - Each row in the assets table (previously `.ant-table-tbody .ant-table-row`)

### Asset Details
- `data-testid="asset-edit-button"` - The edit icon button for assets (previously `getByLabel("edit").locator("svg")`)
- `data-testid="asset-type-select"` - The asset type dropdown selector (previously complex filter with `nth(1)`)

### Asset Preview
- `data-testid="asset-preview-canvas"` - The canvas element used for previewing assets

### Notifications
- `data-testid="notification"` - Each notification notice element (previously `.ant-notification-notice`)

## Summary of Changes

The refactoring follows these Playwright locator best practices:

1. **Prefer `getByRole`** - Already used for buttons, tabs, checkboxes (maintained)
2. **Use `getByTestId` for complex/dynamic UI** - Replaced brittle CSS selectors
3. **Use label-based selectors** - Already used for forms (maintained)
4. **Avoid brittle CSS/XPath** - Removed all `.ant-*` class-based selectors
5. **Scope locators with chaining** - Used `.filter({ hasText })` for row targeting
6. **Ensure locators match one element** - All selectors are now more specific

## Implementation Locations

To implement these changes, you'll need to find and update the following UI components:

1. **Upload modal component** - Add testid to file input
2. **Asset table component** - Add testid to each table row
3. **Asset list/grid component** - Add testid to edit button
4. **Asset details component** - Add testid to type selector
5. **Asset preview component** - Add testid to canvas element
6. **Notification component** - Add testid to notification wrapper

## Next Steps

1. Add the required `data-testid` attributes to the UI components
2. Verify the refactored tests still pass
3. Consider applying the same pattern to other page objects in the E2E suite
