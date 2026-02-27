# E2E Testing Guide

This document describes the conventions, architecture, and patterns used in the E2E testing framework for Reearth CMS.

## Directory Structure

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
│   ├── base.page.ts              # Abstract base — Layer 1
│   ├── project-scoped.page.ts    # Abstract project-scoped base — Layer 2
│   ├── settings-scoped.page.ts   # Abstract settings-scoped base — Layer 2
│   ├── assets.page.ts            # Assets page (extends ProjectScopedPage)
│   ├── content.page.ts           # Content management (extends ProjectScopedPage)
│   ├── field-editor.page.ts      # Field creation/editing (extends ProjectScopedPage)
│   ├── integrations.page.ts      # Integrations + webhooks (extends SettingsScopedPage)
│   ├── login.page.ts             # Authentication (standalone)
│   ├── member.page.ts            # Member management (extends SettingsScopedPage)
│   ├── project.page.ts           # Project overview (extends ProjectScopedPage)
│   ├── project-settings.page.ts  # Project settings (extends ProjectScopedPage)
│   ├── request.page.ts           # Request workflow (extends ProjectScopedPage)
│   ├── schema.page.ts            # Schema management (extends ProjectScopedPage)
│   ├── settings.page.ts          # Workspace settings (extends SettingsScopedPage)
│   └── workspace.page.ts         # Workspace CRUD (extends BasePage)
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

## POM Architecture

### 3-Layer Hierarchy

```
BasePage (abstract) — Layer 1
│  Sealed: okButton, cancelButton, saveButton, backButton,
│          searchInput, searchButton, rootElement
│  Kept:   goto(), url(), closeNotification(), keypress(), getCurrentItemId()
│  Kept:   getByRole(), getByText(), getByTestId(), etc. (Playwright wrappers)
│
├── ProjectScopedPage (abstract) — Layer 2
│   Sealed: schemaMenuItem, contentMenuItem, assetMenuItem,
│           settingsMenuItem, accessibilityMenuItem
│   Sealed: createProject(), gotoProject(), deleteProject()
│   Sealed: navigateToContent(), navigateToSchema(), navigateToAsset()
│   Method: assertProjectContext() — validates URL has project ID
│   │
│   ├── SchemaPage              — model/group/field CRUD
│   │                             Composes: FieldEditorPage, ContentPage
│   ├── ContentPage             — item CRUD, table, views, filters, publishing
│   ├── FieldEditorPage         — field creation/editing forms
│   ├── RequestPage             — request workflow
│   │                             Composes: ContentPage (for request-from-content flows)
│   ├── AssetsPage              — asset upload/management
│   ├── ProjectPage             — model cards, overview
│   │                             Composes: SchemaPage (for create-model-then-navigate flows)
│   └── ProjectSettingsPage     — project settings, danger zone, accessibility
│
├── SettingsScopedPage (abstract) — Layer 2
│   Sealed: workspaceSettingsNav, memberNav, integrationsNav
│   │
│   ├── SettingsPage            — tiles, terrain, account, language
│   ├── MemberPage              — member management
│   └── IntegrationsPage        — integrations + webhooks
│
├── WorkspacePage               — project list, workspace CRUD (no Layer 2 needed)
└── LoginPage                   — authentication (standalone, own base)
```

### Override Control Pattern

Follow the pattern with `noImplicitOverride: true` (in `tsconfig.json`):

- **`protected readonly` arrow functions**: Non-overridable (sealed) — used for shared locator getters in Layer 1/2
- **`protected abstract` methods**: Hooks for subclasses to implement
- **`override` keyword**: Required for all overrides (enforced by compiler)

### Visibility Rules

- `private`: Default for members used only within the same class (internal locators consumed by action methods, helper functions)
- `protected`: Only for `page` property in BasePage (used by all subclasses)
- `public`: For all members called from spec files or other external callers
- **All visibility modifiers must be explicit** — never rely on TypeScript's implicit `public`

### Class Organization

Each POM class should be organized into two sections:

```typescript
class SchemaPage extends ProjectScopedPage {
  // ── Composed POMs (private) ──
  private fieldEditor: FieldEditorPage;
  private content: ContentPage;

  constructor(page: Page) {
    super(page);
    this.fieldEditor = new FieldEditorPage(page);
    this.content = new ContentPage(page);
  }

  // ── Element Queries (private) ──
  // Getters (no params) and functions (with params)
  // Query by data-testid when possible
  // Params use DATA_TEST_ID enum, not raw strings
  private get fieldDisplayNameInput(): Locator { ... }
  private fieldTypeByTestId(id: DATA_TEST_ID): Locator { ... }

  // ── Actions (public) ──
  // Public methods for spec files
  // Each action: validate URL → query elements → assert → interact
  // Can delegate to composed POMs for cross-page workflows
  public async createModel(name: string, key?: string): Promise<void> { ... }
  public async createFieldAndVerifyInContent(type: DATA_TEST_ID, name: string): Promise<void> {
    // Delegates to this.fieldEditor and this.content internally
  }
}
```

### Composition Pattern

Each spec file uses ONE POM only. The POM internally composes sibling POMs for cross-page workflows.

```typescript
// text.spec.ts — uses only schemaPage
test.beforeEach(async ({ schemaPage }) => {
  await schemaPage.goto("/", { waitUntil: "domcontentloaded" });
  await schemaPage.createProject(projectName); // inherited from Layer 2
  await schemaPage.gotoProject(projectName); // inherited from Layer 2
});
test.afterEach(async ({ schemaPage }) => {
  await schemaPage.deleteProject(); // inherited from Layer 2
});
test("Text field", async ({ schemaPage }) => {
  await schemaPage.createModelFromSidebar(modelName);
  await schemaPage.createFieldAndVerifyInContent(DATA_TEST_ID.FieldList__Text, "text1", "hello");
});
```

### Setup/Teardown via Layer 2

`ProjectScopedPage` provides project lifecycle methods so NO separate `projectPage` fixture is needed:

```typescript
// project-scoped.page.ts — Layer 2
abstract class ProjectScopedPage extends BasePage {
  // Project lifecycle (inherited by all project-scoped Layer 3 POMs)
  protected readonly createProject = async (name: string): Promise<void> => {
    await this.goto("/", { waitUntil: "domcontentloaded" });
    // ... create project via UI
  };

  protected readonly gotoProject = async (name: string): Promise<void> => {
    // ... navigate to project
  };

  protected readonly deleteProject = async (): Promise<void> => {
    // ... navigate to settings, delete project
  };

  // Shared navigation (sealed, non-overridable)
  protected readonly schemaMenuItem = (): Locator => { ... };
  protected readonly contentMenuItem = (): Locator => { ... };
  protected readonly navigateToContent = async (): Promise<void> => {
    await this.contentMenuItem().click();
  };
  protected readonly navigateToSchema = async (): Promise<void> => {
    await this.schemaMenuItem().click();
  };

  // URL validation
  protected readonly assertProjectContext = (): void => { ... };
}
```

## Selector Strategy

### Decision Rules

| Current Selector                                                   | Action                                  | Why                                                                |
| ------------------------------------------------------------------ | --------------------------------------- | ------------------------------------------------------------------ |
| `.ant-*` (e.g. `.ant-modal-wrap`, `.ant-table-row`)                | Replace with `data-testid`              | Breaks on Ant Design upgrades                                      |
| `.css-*` hash classes (e.g. `.css-7g0azd`)                         | Replace with `data-testid`              | Breaks on any style change                                         |
| `getByText("Settings")`, `getByText("Content")` for navigation     | Replace with `data-testid`              | Matches multiple elements; breaks on locale change                 |
| `getByRole("button", { name: "plus New Model" })` with icon prefix | Replace with `data-testid`              | Icon text prefix changes on upgrade                                |
| `getByRole("button", { name: "OK" })`                              | Replace with `data-testid`              | Multiple buttons may share the name; text may change (e.g. "Save") |
| `getByLabel("Model name")`                                         | Replace with `data-testid`              | Label text may change or conflict across forms                     |
| `getByPlaceholder("search")`                                       | Replace with `data-testid`              | Placeholder text may change or conflict                            |
| `.nth(N)` without scoped parent                                    | Add `data-testid` to parent, then scope | Positional selectors are fragile                                   |

### data-testid Rules

- Attribute injected via `data-testid` on React components
- Values centralized in `DATA_TEST_ID` enum at `src/test/utils.ts`
- Naming convention: `Component__Element` (BEM-inspired, PascalCase)
  - `ModelCard__UtilDropdownIcon`
  - `Schema__ImportSchemaButton`
  - `Content__List__ImportContentButton`
- For nested page context: `Page__Component__Element`
- For 3rd party components (Ant Design): wrap with a `<div data-testid="...">` if `data-testid` prop is not supported
- E2E locators use `getByTestId(DATA_TEST_ID.X)`, never raw strings

### Querying i18n Text

- E2E tests should NOT query by visible text (button labels, menu text)
- If testing i18n text is unavoidable, use `t("i18n-key")` from `e2e/support/i18n.ts`
- Prefer `data-testid` for element targeting, `toHaveText(t("key"))` for assertions

## Parallel-Safety Rules

### Timing Strategy

| Pattern                                                                               | Action                                  | Why                                                                 |
| ------------------------------------------------------------------------------------- | --------------------------------------- | ------------------------------------------------------------------- |
| `waitForTimeout(300)` as last statement before `});`                                  | Remove                                  | No-op; nothing follows that needs the delay                         |
| `waitForTimeout(300)` after `closeNotification()`                                     | Remove                                  | `closeNotification()` already waits for hidden + `domcontentloaded` |
| `waitForTimeout(300)` before auto-retry assertion (`toHaveText`, `toBeVisible`, etc.) | Remove                                  | Playwright auto-retries; the wait adds latency with no benefit      |
| `waitForTimeout(300)` before `.click()` on potentially unstable element               | Replace with `el.waitFor()`             | Event-driven wait is deterministic                                  |
| `waitForTimeout(*)` after drag-drop with no completion event                          | Keep with `// drag-drop settle` comment | No reliable signal exists                                           |
| `waitForTimeout(*)` in `viewer.helper.ts` (Cesium poll loop)                          | Keep                                    | Intentional polling interval                                        |

### Test Data Isolation

- `getId()` returns `${Date.now()}-${random}` — collision-safe across parallel workers
- Every spec file must use `getId()` for project names, model names, workspace names
- No hardcoded shared names (e.g. `"e2e workspace name"`) — use `getId()`-based variables
- Each `test.describe` block gets its own unique names via `const xxxName = getId()` at the top

### Notification Helper

- `closeNotification()` must NOT use `.ant-notification-notice` CSS selectors
- Use ARIA-scoped selectors: `getByRole("alert")` for the notification, `getByRole("button", { name: "Close" })` for the close button
- Always assert notification type before closing (check-circle / close-circle)

## E2E Test Tags

The TAG enum (`e2e/fixtures/test.ts`) defines these tags:

| Tag             | Purpose                                    | Usage                    |
| --------------- | ------------------------------------------ | ------------------------ |
| `@smoke`        | Critical path tests (~27)                  | `yarn e2e-smoke`         |
| `@toAbandon`    | Tests redundant with component tests (~16) | Excluded from `e2e-fast` |
| `@fieldVariant` | Repetitive field/metadata type tests (~30) | Excluded from `e2e-fast` |

`@toAbandon` pattern — always include a Playwright `annotation` pointing to the consolidation target:

```typescript
test("Comment CRUD on edit page", {
  tag: TAG.TO_ABANDON,
  annotation: {
    type: "consolidate",
    description: '"Comment CRUD on Content page" in content.spec.ts (@smoke)',
  },
}, async (...) => {
```

The annotation is machine-readable (Playwright reporter API) and renders in the HTML test report.

`@fieldVariant` pattern — for identical workflows differing only by field type:

```typescript
test("Float field editing has succeeded", { tag: TAG.FIELD_VARIANT }, async (...) => {
```

3-tier CI strategy:

```bash
yarn e2e-smoke   # ~27 tests — fast CI gate
yarn e2e-fast    # ~74 tests — default CI (excludes @toAbandon + @fieldVariant)
yarn e2e         # ~120 tests — nightly/full validation
```

```bash
# List tagged tests
yarn playwright test --list --grep @toAbandon
yarn playwright test --list --grep @fieldVariant
```

## E2E vs Component Test Boundary

> All frontend tests are not responsible for testing data correctness (e.g., calculation logic, query filtering, validation rules) — that belongs to backend tests. Frontend tests verify that the UI correctly displays and interacts with whatever data the backend provides.

| Write E2E test when...                                     | Write component test when...                                |
| ---------------------------------------------------------- | ----------------------------------------------------------- |
| Testing a multi-page workflow (create → navigate → verify) | Testing rendering logic with different props/states         |
| Testing data persistence (create, reload, still exists)    | Testing form validation display                             |
| Testing real API integration (GraphQL mutations/queries)   | Testing component behavior with mocked data                 |
| Testing cross-component interactions on the same page      | Testing individual component states (loading, error, empty) |
| Testing authentication/authorization flows                 | Testing i18n text rendering                                 |

**Overlap is OK** when:

- A component test covers rendering correctness and an E2E test covers the same feature's integration with real data
- Example: Component test verifies ModelCard renders dropdown menu items → E2E test verifies clicking "Delete" actually deletes the model

**Don't duplicate** when:

- A component test already verifies pure UI logic (hover states, disabled states, tooltip content) — no need for E2E
- An E2E test already covers a simple CRUD flow — no need for a component test that mocks the same API calls

## Known Patterns

- **`:visible` pseudo-selector**: Use on locators that match duplicate elements across Ant Design `forceRender` tabs (e.g. `plusNewButton`). The `:visible` filter ensures only the currently-rendered element is matched.
- **`editField(options)` pattern**: A single `FieldEditorPage.editField()` method handles conditional tab navigation (General / Validation / Default Value) for all field types. Spec files pass an options object instead of manually clicking tabs.
- **Auto-tracked project base URL**: `ProjectScopedPage` uses a `WeakMap` + `framenavigated` event listener to automatically capture the project base URL after `createProject()`. Subclasses access it via `this.projectBaseUrl` without manual tracking.
- **Playwright `{ tag }` option**: Tags like `@smoke`, `@toAbandon`, and `@fieldVariant` use Playwright's native `test("name", { tag: TAG.SMOKE }, ...)` syntax, not title prefixes. `@toAbandon` tests also include an `annotation` with `type: "consolidate"` pointing to the kept test or component test.
- **URL context validation**: Every public action method calls `this.assertProjectContext()` (or `this.assertWorkspaceContext()` for `WorkspacePage`) as its first line. This produces a clear error ("Expected page to be on a project URL") instead of cryptic element-not-found timeouts when navigation fails silently. **Excluded**: context-establishing/teardown methods (`createProject`, `gotoProject`, `deleteProject` in `ProjectScopedPage`; `createWorkspace`, `deleteWorkspace` in `WorkspacePage`) and `LoginPage`. `WorkspacePage` has its own `private assertWorkspaceContext()` that checks for `/workspace/` without `/project/`.

## Key Components

### Authentication Setup (`support/auth.setup.ts`)

Playwright "setup" project that runs before all test projects. Configured in `playwright.config.ts` as `projects[0]` with the `chromium` project depending on it.

- Supports both custom login and Auth0 login flows (auto-detected)
- Uses `createIAPContext()` for GCP Identity-Aware Proxy environments
- Saves storage state to `support/.auth/user.json` for reuse by all tests
- Tagged `@smoke` so it runs in smoke test suites too
- Skips login if already authenticated (checks for "New Project" button)

### Fixtures (`fixtures/test.ts`)

Custom Playwright fixtures that automatically initialize page objects:

```typescript
export const test = base.extend<Fixtures>({
  schemaPage: async ({ page }, use) => {
    await use(new SchemaPage(page));
  },
  contentPage: async ({ page }, use) => {
    await use(new ContentPage(page));
  },
  // ... other page objects
});

export const TAG = {
  SMOKE: "@smoke",
  TO_ABANDON: "@toAbandon",
  FIELD_VARIANT: "@fieldVariant",
} as const;
```

Each spec fixture maps 1:1 with the primary POM.

### Helpers (`helpers/`)

- **format.helper.ts**: Format and parse utilities
- **mock.helper.ts**: Test data generation (`getId()`)
- **notification.helper.ts**: Notification handling (ARIA-scoped selectors)
- **viewer.helper.ts**: Viewer-specific utilities (Cesium ready checks)

### IAP Authentication (`utils/iap/`)

Utilities for authenticating through GCP Identity-Aware Proxy in staging/dev environments. Auto-detected based on the target URL: skipped for `localhost` and production (`reearth.io`), enabled for other environments. Can be explicitly controlled via `USE_IAP_AUTH` env var.

### Internationalization (`support/i18n.ts`)

Configures i18next with English and Japanese translations for tests that verify localized content. Imports from `@reearth-cms/i18n/translations/` (intentional exception to the separation of concerns rule — shares translation resources to validate the same strings displayed to users).

### Configuration (`config/config.ts`)

Required environment variables (in `web/.env`):

```env
REEARTH_CMS_E2E_USERNAME=your-email@example.com
REEARTH_CMS_E2E_PASSWORD=your-password
REEARTH_CMS_E2E_BASEURL=http://localhost:3000/
```

## Writing Tests

### Best Practices

1. **Use Page Objects** — never interact with `page` directly in spec files

   ```typescript
   // Good
   await schemaPage.createModel("My Model", "my-model");

   // Bad
   await page.getByLabel("Model name").fill("My Model");
   await page.getByRole("button", { name: "OK" }).click();
   ```

2. **One POM per spec file** — use the composition pattern

   ```typescript
   test("My test", async ({ schemaPage }) => {
     // schemaPage internally composes FieldEditorPage + ContentPage
   });
   ```

3. **Generate unique test data** with `getId()`

   ```typescript
   const projectName = getId();
   await schemaPage.createProject(projectName);
   ```

4. **Setup/teardown via Layer 2 inheritance**

   ```typescript
   test.beforeEach(async ({ schemaPage }) => {
     await schemaPage.createProject(projectName);
     await schemaPage.gotoProject(projectName);
   });
   test.afterEach(async ({ schemaPage }) => {
     await schemaPage.deleteProject();
   });
   ```

## Adding New Tests

### 1. Create or Update Page Object

New project-scoped pages extend `ProjectScopedPage`; new settings-scoped pages extend `SettingsScopedPage`:

```typescript
// pages/my-feature.page.ts
import { ProjectScopedPage } from "./project-scoped.page";
import { type Locator, type Page } from "@playwright/test";
import { DATA_TEST_ID } from "@reearth-cms/test/utils";

export class MyFeaturePage extends ProjectScopedPage {
  // ── Element Queries (private) ──
  private get myButton(): Locator {
    return this.page.getByTestId(DATA_TEST_ID.MyFeature__Button);
  }

  // ── Actions (public) ──
  public async doSomething(): Promise<void> {
    this.assertProjectContext();
    await this.myButton.click();
    await this.closeNotification();
  }
}
```

### 2. Register in Fixtures

Add to `fixtures/test.ts`:

```typescript
import { MyFeaturePage } from "../pages/my-feature.page";

myFeaturePage: async ({ page }, use) => {
  await use(new MyFeaturePage(page));
},
```

### 3. Write Test Spec

```typescript
// tests/my-domain/my-feature.spec.ts
import { expect, test } from "@reearth-cms/e2e/fixtures/test";
import { getId } from "@reearth-cms/e2e/helpers/mock.helper";

const projectName = getId();

test.beforeEach(async ({ myFeaturePage }) => {
  await myFeaturePage.createProject(projectName);
  await myFeaturePage.gotoProject(projectName);
});

test.afterEach(async ({ myFeaturePage }) => {
  await myFeaturePage.deleteProject();
});

test("My feature works correctly", async ({ myFeaturePage }) => {
  await myFeaturePage.doSomething();
});
```

## Running Tests

```bash
yarn e2e-smoke   # ~27 tests — fast CI gate
yarn e2e-fast    # ~74 tests — default CI (excludes @toAbandon + @fieldVariant)
yarn e2e         # ~120 tests — nightly/full validation
```

```bash
yarn playwright test tests/project/schema.spec.ts   # Run specific file
yarn playwright test --ui                            # UI mode
yarn playwright test --debug                         # Debug mode
yarn playwright test --list                          # List all tests
yarn playwright test --list --grep @smoke            # List smoke tests
```

## Playwright Configuration

The Playwright config (at the `web/` root) uses a two-project setup:

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

Key settings:

- `globalSetup`: `./e2e/global-setup.ts` (env var validation)
- `testDir`: `./e2e/tests`
- `workers`: 1 in CI, default locally
- `retries`: 2
- `timeout`: 150 seconds per test
- `actionTimeout` / `navigationTimeout`: 60 seconds
- `video`: `on-first-retry` in CI, `retain-on-failure` locally

## Import Paths and Separation of Concerns

Always use the `@reearth-cms/e2e/*` alias for imports:

```typescript
// Correct
import { test } from "@reearth-cms/e2e/fixtures/test";
import { SchemaPage } from "@reearth-cms/e2e/pages/schema.page";
import { getId } from "@reearth-cms/e2e/helpers/mock.helper";

// Incorrect
import { test } from "../fixtures/test";
import { SchemaPage } from "./pages/schema.page";
```

E2E tests should NOT import from the main application code:

```typescript
// Bad
import { parseConfigBoolean } from "@reearth-cms/utils/format";

// Good
import { parseConfigBoolean } from "@reearth-cms/e2e/helpers/format.helper";
```

**Exception:** `support/i18n.ts` imports from `@reearth-cms/i18n/translations/` and `src/test/utils.ts` is shared for `DATA_TEST_ID`.

## Rules Quick Reference

- [ ] Each spec file uses ONE POM only (composition pattern)
- [ ] All new/modified locators use `data-testid` for elements with fragile selectors
- [ ] `DATA_TEST_ID` enum values follow `Component__Element` naming
- [ ] POM members are `private` by default; `public` only for spec-facing actions
- [ ] Common locators live in Layer 1 (BasePage) or Layer 2 (scoped pages), not duplicated
- [ ] Layer 3 POMs compose sibling POMs as `private` members for cross-page workflows
- [ ] Setup/teardown uses inherited Layer 2 methods, not separate `projectPage` fixture
- [ ] No `.ant-*` or `.css-*` selectors in POM classes
- [ ] No hardcoded locale strings — use `data-testid` for targeting, `t()` for assertions
- [ ] Each action method validates URL context before querying elements
- [ ] E2E tests import from `@reearth-cms/e2e/*`, never from `@reearth-cms/*` (except `test/utils` for DATA_TEST_ID)
- [ ] `override` keyword on all overridden methods (enforced by `noImplicitOverride: true`)
- [ ] Sealed methods use `protected readonly` arrow function pattern (non-overridable)
- [ ] No `waitForTimeout(300)` as trailing statements or after `closeNotification()`
- [ ] All test names use `getId()` — no hardcoded shared names across parallel workers
- [ ] Notification helper uses ARIA selectors, not `.ant-notification-*` classes

## Test Statistics

- **Total Tests**: ~120 (119 in spec files + 1 auth setup)
- **Smoke Tests**: ~27 (marked with `@smoke` tag)
- **Page Objects**: 15 (including 2 abstract Layer 2 classes)
- **Helper Files**: 4
- **Test Spec Files**: 39

## Notes

1. **`DATA_TEST_ID` stays in `src/test/utils.ts`**: Both E2E and component tests use it. This is the canonical location.
2. **BasePage getByX wrappers**: Kept for now, deprecate in a later pass (removing would touch every POM).
3. **LoginPage stays standalone**: It operates on external auth provider pages, no hierarchy needed.
4. **Fixtures map 1:1 with POMs**: Since Layer 2 provides setup/teardown, fixtures can remove `projectPage` from most tests.
5. **Notification helper**: `e2e/helpers/notification.helper.ts` uses ARIA-scoped selectors (`getByRole("alert")`, `getByRole("button", { name: "Close" })`).
6. **Circular composition**: Composition is one-directional. SchemaPage composes ContentPage, but ContentPage does NOT compose SchemaPage. If a content test needs schema setup, it uses inherited Layer 2 methods or its own `beforeEach`.
