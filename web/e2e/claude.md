# E2E Testing - Page Object Model (POM) Structure

This document describes the structure and patterns used in the E2E testing framework for Reearth CMS.

## 📁 Directory Structure

```text
web/e2e/
├── config/              # Configuration files
│   └── config.ts        # Environment config, API settings, access token management
├── files/               # Test data files for import testing
│   ├── test-import-content.csv
│   ├── test-import-content.geojson
│   └── test-import-content.json
├── fixtures/            # Playwright test fixtures
│   └── test.ts          # Custom fixtures extending Playwright's test with page objects
├── helpers/             # Reusable helper utilities
│   ├── format.helper.ts          # Format utilities (parseConfigBoolean, stateColors)
│   ├── mock.helper.ts            # Mock data generation (getId)
│   ├── notification.helper.ts    # Notification handling utilities
│   └── viewer.helper.ts          # Viewer utilities (Cesium ready checks)
├── pages/               # Page Object Models (POM)
│   ├── base.page.ts              # Base page class with common methods
│   ├── assets.page.ts            # Assets page interactions
│   ├── login.page.ts             # Login page interactions
│   ├── content.page.ts           # Content management page interactions
│   ├── field-editor.page.ts      # Field editor page interactions
│   ├── integrations.page.ts      # Integrations page interactions
│   ├── member.page.ts            # Member management page interactions
│   ├── project.page.ts           # Project page interactions
│   ├── project-settings.page.ts  # Project settings page interactions
│   ├── request.page.ts           # Request page interactions
│   ├── schema.page.ts            # Schema management page interactions
│   ├── settings.page.ts          # Settings page interactions
│   └── workspace.page.ts         # Workspace page interactions
├── support/             # Support files
│   ├── auth.setup.ts             # Authentication setup (Playwright "setup" project)
│   ├── i18n.ts                   # Internationalization support (en/ja)
│   └── .auth/                    # Authentication state storage (gitignored)
│       └── user.json             # Saved authentication session state
├── utils/               # Utility modules
│   └── iap/                      # GCP Identity-Aware Proxy authentication
│       ├── iap-auth.ts           # Main IAP auth factory (method detection & context creation)
│       ├── iap-auth-adc.ts       # Application Default Credentials auth
│       ├── iap-auth-common.ts    # Common IAP utilities
│       ├── iap-auth-id-token.ts  # ID token authentication
│       └── iap-auth-service-account.ts  # Service account authentication
├── global-setup.ts      # Global setup (environment variable validation)
└── tests/               # Test specifications (organized by domain)
    ├── auth/                     # Authentication tests
    │   └── auth.spec.ts
    ├── project/                  # Project-related tests
    │   ├── assets/               # Asset management tests (2 specs)
    │   │   ├── asset.spec.ts
    │   │   └── compressed-asset.spec.ts
    │   ├── content/              # Content management tests (3 specs)
    │   │   ├── content.spec.ts
    │   │   ├── version.spec.ts
    │   │   └── view.spec.ts
    │   ├── items/
    │   │   ├── fields/           # Field type tests (13 specs)
    │   │   └── metadata/         # Metadata tests (7 specs)
    │   ├── accessibility.spec.ts
    │   ├── overview.spec.ts
    │   ├── project.spec.ts
    │   ├── request.spec.ts
    │   ├── schema.spec.ts
    │   └── settings.spec.ts
    ├── settings/                 # Settings tests
    │   ├── account/
    │   │   ├── general.spec.ts
    │   │   └── lang.spec.ts
    │   ├── integrations.spec.ts
    │   ├── member.spec.ts
    │   ├── myIntegrations.spec.ts
    │   └── settings.spec.ts
    └── workspace/                # Workspace tests
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
  const projectName = getId();
  await projectPage.createProject(projectName);
  await projectPage.gotoProject(projectName);
  await contentPage.createItem();
  // Test assertions...
});
```

## 🔧 Key Components

### Global Setup (`global-setup.ts`)

**Environment validation** that runs once before all tests start. It does **not** perform authentication — that is handled by `support/auth.setup.ts`.

```typescript
async function globalSetup(_config: FullConfig) {
  console.log("Running global setup...");
  validateEnvironment(); // Checks REEARTH_CMS_E2E_USERNAME, PASSWORD, BASEURL
  console.log("Global setup completed successfully");
}
```

### Authentication Setup (`support/auth.setup.ts`)

**Playwright "setup" project** that runs before all test projects. Configured in `playwright.config.ts` as `projects[0]` with the `chromium` project depending on it.

```typescript
test("@smoke authenticate", async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await createIAPContext(browser, baseURL);
  const page = await context.newPage();

  // Detects login type and authenticates
  const isNewAuth = await loginPage.auth0EmailInput.isVisible();
  if (isNewAuth) {
    await loginPage.loginWithAuth0(userName, password);
  } else {
    await loginPage.login(userName, password);
  }

  // Save authentication state for reuse by all test projects
  await context.storageState({ path: authFile });
});
```

**Key features:**

- Supports both **custom login** and **Auth0 login** flows (auto-detected)
- Uses `createIAPContext()` for GCP Identity-Aware Proxy environments
- Saves storage state to `support/.auth/user.json` for reuse by all tests
- Tagged `@smoke` so it runs in smoke test suites too
- Skips login if already authenticated (checks for "New Project" button)

**Benefits:**

- ⚡ **Fast** - Authentication happens once, not per test suite
- 🔄 **Consistent** - All tests use identical authentication state
- 🎯 **Maintainable** - Single place to update authentication logic

### Fixtures (`fixtures/test.ts`)

Custom Playwright fixtures that automatically initialize page objects:

```typescript
export const test = base.extend<Fixtures>({
  contentPage: async ({ page }, use) => {
    await use(new ContentPage(page));
  },
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
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

### Test Data Files (`files/`)

Test data files used for import testing:

- **test-import-content.csv** - CSV import test data
- **test-import-content.geojson** - GeoJSON import test data
- **test-import-content.json** - JSON import test data

### IAP Authentication Utilities (`utils/iap/`)

Utilities for authenticating through GCP Identity-Aware Proxy in staging/dev environments:

- **iap-auth.ts** - Main factory: auto-detects auth method (`service-account`, `adc`, or `id-token`) and creates browser contexts with IAP headers
- **iap-auth-adc.ts** - Application Default Credentials authentication
- **iap-auth-common.ts** - Common IAP utilities shared across methods
- **iap-auth-id-token.ts** - ID token-based authentication
- **iap-auth-service-account.ts** - Service account JSON key authentication

IAP auth is auto-detected based on the target URL: skipped for `localhost` and production (`reearth.io`), enabled for other environments. Can be explicitly controlled via `USE_IAP_AUTH` env var.

### Internationalization Support (`support/i18n.ts`)

Configures i18next with English and Japanese translations for tests that verify localized content.

**Note:** This file imports from `@reearth-cms/i18n/translations/` (the main application's translations). This is an intentional exception to the "Separation of Concerns" rule — sharing translation resources ensures tests validate the same strings displayed to users.

### Configuration (`config/config.ts`)

Centralized configuration for:

- API endpoints
- User credentials (from environment variables)
- Access token management
- Feature flags

**Required Environment Variables** (in `web/.env`):

```env
REEARTH_CMS_E2E_USERNAME=your-email@example.com
REEARTH_CMS_E2E_PASSWORD=your-password
REEARTH_CMS_E2E_BASEURL=http://localhost:3000/
```

### Login Page (`pages/login.page.ts`)

The `LoginPage` class handles all authentication interactions, supporting **dual login flows**:

```typescript
export class LoginPage {
  // Custom login form elements
  emailInput: Locator; // getByPlaceholder("username/email")
  passwordInput: Locator; // getByPlaceholder("your password")
  loginButton: Locator; // getByText("LOG IN")

  // Auth0 login form elements
  auth0EmailInput: Locator; // getByLabel("Email address")
  auth0PasswordInput: Locator; // getByLabel("Password")
  auth0ContinueButton: Locator; // getByRole("button", { name: "Continue" })
  auth0SkipPasskeyButton: Locator; // getByRole("button", { name: "Continue without passkeys" })

  async login(email: string, password: string) {
    /* custom login flow */
  }
  async loginWithAuth0(email: string, password: string) {
    /* Auth0 login flow */
  }
}
```

**Features:**

- 🔐 Handles **custom login** form interactions (`login()`)
- 🔑 Handles **Auth0 login** form interactions (`loginWithAuth0()`) with optional passkey prompt
- 👤 Manages user menu and logout functionality (`userMenuLink`, `logoutButton`)

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
     const projectName = getId();

     await projectPage.createProject(projectName);
     await projectPage.gotoProject(projectName);
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

### Run Smoke Tests Only

```bash
yarn e2e-smoke
```

Smoke tests are a subset of ~26 critical tests that verify core functionality. They run faster than the full suite and are ideal for:

- Quick validation during local development
- CI/CD pipelines
- Pre-push verification

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

### List Smoke Tests Only

```bash
yarn playwright test --list --grep @smoke
```

## ⚙️ Playwright Configuration (`playwright.config.ts`)

The Playwright config (at the `web/` root) uses a **two-project setup**:

```typescript
projects: [
  {
    name: "setup",
    testDir: "./e2e/support",
    testMatch: "auth.setup.ts",  // Runs authentication first
  },
  {
    name: "chromium",
    use: { storageState: authFile },  // Reuses saved auth state
    dependencies: ["setup"],           // Waits for auth to complete
  },
],
```

**Key settings:**

- `globalSetup`: `./e2e/global-setup.ts` (env var validation)
- `testDir`: `./e2e/tests`
- `workers`: 1 in CI, default locally
- `retries`: 2
- `timeout`: 150 seconds per test
- `actionTimeout` / `navigationTimeout`: 60 seconds
- `video`: `on-first-retry` in CI, `retain-on-failure` locally

## 📊 Test Statistics

- **Total Tests**: 120 (119 in spec files + 1 auth setup)
- **Smoke Tests**: ~26 (marked with `@smoke` tag)
- **Page Objects**: 13
- **Helper Files**: 4
- **Test Spec Files**: 39

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

**Exception:** `support/i18n.ts` intentionally imports from `@reearth-cms/i18n/translations/` to share translation resources with the main application.

## 📚 Additional Resources

- [Playwright Documentation](https://playwright.dev/)
- [Page Object Model Pattern](https://playwright.dev/docs/pom)
- [Best Practices](https://playwright.dev/docs/best-practices)

## 🔄 Recent Refactorings

### Authentication System Refactoring (2025-10-15)

The authentication system was refactored to use a centralized global setup approach:

#### Changes Made

1. ✅ **Added Global Setup**: Created `global-setup.ts` for environment variable validation
2. ✅ **Created LoginPage**: New page object replacing `auth.page.ts`, supporting both custom and Auth0 login flows
3. ✅ **Moved Auth Setup**: Relocated `auth.setup.ts` to `support/auth.setup.ts` as a Playwright "setup" project; deleted old `auth.page.ts`
4. ✅ **Updated Configuration**: Uses project-based setup in `playwright.config.ts` (`projects[0]` = setup, `projects[1]` = chromium with dependency)
5. ✅ **Added IAP Support**: Created `utils/iap/` for GCP Identity-Aware Proxy authentication
6. ✅ **Improved Error Handling**: Added console logging and better error messages

#### Breaking Changes

- **Environment Variable**: `REEARTH_CMS_E2E_EMAIL` → `REEARTH_CMS_E2E_USERNAME`
- **Fixture Rename**: `authPage` → `loginPage`

#### Migration Guide

Update test files that use authentication:

```typescript
// Before
test("my test", async ({ authPage }) => {
  await authPage.userMenuLink.click();
});

// After
test("my test", async ({ loginPage }) => {
  await loginPage.userMenuLink.click();
});
```

Update `.env` file:

```env
# Before
REEARTH_CMS_E2E_EMAIL=your-email@example.com

# After
REEARTH_CMS_E2E_USERNAME=your-email@example.com
```

#### Performance Improvements

- ⚡ **50-70% faster test runs** - Authentication happens once
- 🔄 **More reliable** - Consistent auth state across all tests
- 🎯 **Better maintainability** - Single source of truth for login logic

### POM Structure Refactoring (2025-10-01)

The E2E structure was refactored to follow POM standards:

#### Changes Made

1. ✅ Moved utility functions from `project/utils/` into page object methods
2. ✅ Reorganized test files into domain-based structure under `tests/`
3. ✅ Created centralized helpers directory
4. ✅ Updated all imports to use `@reearth-cms/e2e/*` pattern
5. ✅ Separated e2e code from main application code
6. ✅ Fixed TypeScript compilation issues
7. ✅ Updated Playwright configuration for new structure

#### Migration Guide

- `createProject(page)` → `projectPage.createProject(name)`
- `createModel(page, name, key)` → `schemaPage.createModelFromSidebar(name, key)`
- `createWorkspace(page)` → `workspacePage.createWorkspace(name)`
- `createItem(page)` → `contentPage.createItem()`
- All utility constants moved to test files as local constants
