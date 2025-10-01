# E2E Testing - Page Object Model (POM) Structure

This document describes the structure and patterns used in the E2E testing framework for Reearth CMS.

## 📁 Directory Structure

```
web/e2e/
├── config/              # Configuration files
│   └── config.ts        # Environment config, API settings, access token management
├── fixtures/            # Playwright test fixtures
│   └── test.ts          # Custom fixtures extending Playwright's test with page objects
├── helpers/             # Reusable helper utilities
│   ├── format.helper.ts       # Format utilities (parseConfigBoolean, stateColors)
│   ├── mock.helper.ts         # Mock data generation (getId)
│   ├── notification.helper.ts # Notification handling utilities
│   └── viewer.helper.ts       # Viewer utilities (Cesium ready checks)
├── pages/               # Page Object Models (POM)
│   ├── base.page.ts           # Base page class with common methods
│   ├── assets.page.ts         # Assets page interactions
│   ├── auth.page.ts           # Authentication page interactions
│   ├── content.page.ts        # Content management page interactions
│   ├── field-editor.page.ts   # Field editor page interactions
│   ├── integrations.page.ts   # Integrations page interactions
│   ├── member.page.ts         # Member management page interactions
│   ├── project.page.ts        # Project page interactions
│   ├── request.page.ts        # Request page interactions
│   ├── schema.page.ts         # Schema management page interactions
│   ├── settings.page.ts       # Settings page interactions
│   └── workspace.page.ts      # Workspace page interactions
├── support/             # Support files
│   ├── .auth/                 # Authentication state storage
│   │   └── user.json          # Stored auth state
│   └── auth.setup.ts          # Authentication setup for tests
└── tests/               # Test specifications (organized by domain)
    ├── auth/                  # Authentication tests
    │   └── auth.spec.ts
    ├── project/               # Project-related tests
    │   ├── assets/            # Asset management tests
    │   ├── content/           # Content management tests
    │   ├── items/
    │   │   ├── fields/        # Field type tests (13 specs)
    │   │   └── metadata/      # Metadata tests (7 specs)
    │   ├── accessibility.spec.ts
    │   ├── overview.spec.ts
    │   ├── request.spec.ts
    │   └── schema.spec.ts
    ├── settings/              # Settings tests
    │   ├── account/
    │   ├── integrations.spec.ts
    │   ├── member.spec.ts
    │   ├── myIntegrations.spec.ts
    │   └── settings.spec.ts
    └── workspace/             # Workspace tests
        └── workspace.spec.ts
```

## 🎯 Page Object Model (POM) Pattern

### What is POM?

The Page Object Model is a design pattern that:
- **Separates** test logic from UI interaction code
- **Encapsulates** page elements and actions in reusable classes
- **Improves** test maintainability and readability
- **Reduces** code duplication

### POM Structure in This Project

#### 1. **Base Page** (`base.page.ts`)

All page objects extend `BasePage`, which provides:
- Common locator methods (`getByRole`, `getByText`, `getByLabel`, etc.)
- Navigation methods (`goto`)
- Utility methods (`closeNotification`)

```typescript
export abstract class BasePage {
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // Common methods available to all page objects
}
```

#### 2. **Page Objects** (`pages/*.page.ts`)

Each page object contains:

**Locator Getters** - For accessing page elements:
```typescript
get newItemButton(): Locator {
  return this.getByRole("button", { name: "plus New Item" });
}
```

**Action Methods** - For performing operations:
```typescript
async createItem(): Promise<void> {
  await this.getByText("Content").click();
  await this.getByRole("button", { name: "plus New Item" }).click();
  await this.getByRole("button", { name: "Save" }).click();
  await this.closeNotification();
}
```

#### 3. **Test Specs** (`tests/**/*.spec.ts`)

Tests use page objects to interact with the UI:

```typescript
test("Item CRUD has succeeded", async ({ contentPage, projectPage }) => {
  await projectPage.createProject(getId());
  await contentPage.createItem();
  // Test assertions...
});
```

## 🔧 Key Components

### Fixtures (`fixtures/test.ts`)

Custom Playwright fixtures that automatically initialize page objects:

```typescript
export const test = base.extend<Fixtures>({
  contentPage: async ({ page }, use) => {
    await use(new ContentPage(page));
  },
  // ... other page objects
});
```

This allows tests to receive page objects as parameters without manual instantiation.

### Helpers (`helpers/`)

Utility functions that don't belong to any specific page:

- **format.helper.ts**: Format and parse utilities
- **mock.helper.ts**: Test data generation
- **notification.helper.ts**: Notification handling
- **viewer.helper.ts**: Viewer-specific utilities

### Configuration (`config/config.ts`)

Centralized configuration for:
- API endpoints
- User credentials (from environment variables)
- Access token management
- Feature flags

## 📝 Writing Tests

### Best Practices

1. **Use Page Objects for UI Interactions**
   ```typescript
   // ✅ Good
   await schemaPage.createModel("My Model", "my-model");

   // ❌ Bad
   await page.getByLabel("Model name").fill("My Model");
   await page.getByRole("button", { name: "OK" }).click();
   ```

2. **Keep Test Logic in Test Files**
   - Page objects handle "how" to interact with the UI
   - Test specs define "what" to test

3. **Use Fixtures for Page Objects**
   ```typescript
   test("My test", async ({ schemaPage, contentPage }) => {
     // Page objects are automatically available
   });
   ```

4. **Generate Unique Test Data**
   ```typescript
   import { getId } from "@reearth-cms/e2e/helpers/mock.helper";

   const projectName = getId(); // Generates unique ID
   await projectPage.createProject(projectName);
   ```

5. **Follow beforeEach/afterEach Pattern for Setup/Teardown**
   ```typescript
   test.beforeEach(async ({ projectPage }) => {
     await projectPage.createProject(getId());
   });

   test.afterEach(async ({ projectPage }) => {
     await projectPage.deleteProject();
   });
   ```

## 🏗️ Adding New Tests

### 1. Create or Update Page Object

If the page doesn't have a page object, create one:

```typescript
// pages/my-feature.page.ts
import { BasePage } from "./base.page";
import { type Locator } from "@reearth-cms/e2e/fixtures/test";

export class MyFeaturePage extends BasePage {
  // Locators
  get myButton(): Locator {
    return this.getByRole("button", { name: "My Button" });
  }

  // Actions
  async doSomething(): Promise<void> {
    await this.myButton.click();
    await this.closeNotification();
  }
}
```

### 2. Register Page Object in Fixtures

Add to `fixtures/test.ts`:

```typescript
import { MyFeaturePage } from "../pages/my-feature.page";

export type PageObjects = {
  // ... existing page objects
  myFeaturePage: MyFeaturePage;
};

export const test = base.extend<Fixtures>({
  // ... existing fixtures
  myFeaturePage: async ({ page }, use) => {
    await use(new MyFeaturePage(page));
  },
});
```

### 3. Write Test Spec

Create test file in appropriate domain folder:

```typescript
// tests/my-domain/my-feature.spec.ts
import { expect, test } from "@reearth-cms/e2e/fixtures/test";
import { getId } from "@reearth-cms/e2e/helpers/mock.helper";

test.beforeEach(async ({ myFeaturePage }) => {
  // Setup
});

test("My feature works correctly", async ({ myFeaturePage }) => {
  await myFeaturePage.doSomething();
  await expect(myFeaturePage.myButton).toBeVisible();
});
```

## 🚀 Running Tests

### Run All Tests
```bash
yarn e2e
```

### Run Specific Test File
```bash
yarn playwright test tests/project/schema.spec.ts
```

### Run Tests in UI Mode
```bash
yarn playwright test --ui
```

### Run Tests in Debug Mode
```bash
yarn playwright test --debug
```

### List All Tests
```bash
yarn playwright test --list
```

## 📊 Test Statistics

- **Total Tests**: 87
- **Page Objects**: 12
- **Helper Files**: 4
- **Test Spec Files**: 38

## 🔗 Import Paths

Always use the `@reearth-cms/e2e/*` alias for imports:

```typescript
// ✅ Correct
import { test } from "@reearth-cms/e2e/fixtures/test";
import { SchemaPage } from "@reearth-cms/e2e/pages/schema.page";
import { getId } from "@reearth-cms/e2e/helpers/mock.helper";

// ❌ Incorrect
import { test } from "../fixtures/test";
import { SchemaPage } from "./pages/schema.page";
```

## 🛡️ Separation of Concerns

**Important**: E2E tests should NOT import from the main application code:

```typescript
// ❌ Bad - Don't import from main app
import { parseConfigBoolean } from "@reearth-cms/utils/format";
import { SomeEnum } from "@reearth-cms/types";

// ✅ Good - Use e2e helpers
import { parseConfigBoolean } from "@reearth-cms/e2e/helpers/format.helper";
```

This ensures:
- E2E tests remain independent of application internals
- Tests don't break due to application refactoring
- TypeScript compilation issues are avoided

## 📚 Additional Resources

- [Playwright Documentation](https://playwright.dev/)
- [Page Object Model Pattern](https://playwright.dev/docs/pom)
- [Best Practices](https://playwright.dev/docs/best-practices)

## 🔄 Recent Refactoring (2025-10-01)

The E2E structure was refactored to follow POM standards:

### Changes Made:
1. ✅ Moved utility functions from `project/utils/` into page object methods
2. ✅ Reorganized test files into domain-based structure under `tests/`
3. ✅ Created centralized helpers directory
4. ✅ Updated all imports to use `@reearth-cms/e2e/*` pattern
5. ✅ Separated e2e code from main application code
6. ✅ Fixed TypeScript compilation issues
7. ✅ Updated Playwright configuration for new structure

### Migration Guide:
- `createProject(page)` → `projectPage.createProject(name)`
- `createModel(page, name, key)` → `schemaPage.createModelFromSidebar(name, key)`
- `createWorkspace(page)` → `workspacePage.createWorkspace(name)`
- `createItem(page)` → `contentPage.createItem()`
- All utility constants moved to test files as local constants

---

**Maintained by**: Development Team
**Last Updated**: October 1, 2025
