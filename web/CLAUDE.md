# Frontend Test Refactoring Guide

> For existing E2E conventions (directory structure, fixtures, running tests, etc.), see `e2e/claude.md`.
> This document covers **what is changing** in the refactoring effort.

## Goal

Make E2E tests more solid and fast by:

1. Eliminating fragile selectors that break on package upgrades or locale changes
2. Removing duplicate locators/actions across POM classes
3. Enforcing encapsulation so spec files use a clean public API
4. Clarifying the boundary between E2E and component tests

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

### `data-testid` Rules

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

## POM Hierarchy

### Override Control Pattern

Follow the pattern in `class-override-control.ts` with `noImplicitOverride: true` (already in `tsconfig.json`):

- **`protected readonly` arrow functions**: Non-overridable (sealed) — used for shared locator getters in Layer 1/2
- **`protected abstract` methods**: Hooks for subclasses to implement
- **`override` keyword**: Required for all overrides (enforced by compiler)

### Visibility Rules

- `private`: Default for members used only within the same class (internal locators consumed by action methods, helper functions)
- `protected`: Only for `page` property in BasePage (used by all subclasses)
- `public`: For all members called from spec files or other external callers
- **All visibility modifiers must be explicit** — never rely on TypeScript's implicit `public`

### Class Split: Element Queries vs Actions

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

### One POM Per Spec File (Composition Pattern)

**Goal**: Each spec file uses ONE POM only. The POM internally composes sibling POMs for cross-page workflows.

**Before** (messy multi-POM imports):

```typescript
// text.spec.ts — uses 3+ POMs
test.beforeEach(async ({ reearth, projectPage }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await projectPage.createProject(projectName);
  await projectPage.gotoProject(projectName);
});
test.afterEach(async ({ projectPage }) => {
  await projectPage.deleteProject();
});
test("Text field", async ({ schemaPage, fieldEditorPage, contentPage }) => {
  await schemaPage.createModelFromSidebar(modelName);
  await fieldEditorPage.fieldTypeButton("Text").click();
  await fieldEditorPage.handleFieldForm(name);
  await schemaPage.contentText.click();
  await contentPage.createItem();
});
```

**After** (one POM — SchemaPage composes FieldEditorPage + ContentPage):

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
│   ├── ProjectOverviewPage     — (split from ProjectPage) model cards, overview
│   │                             Composes: SchemaPage (for create-model-then-navigate flows)
│   └── ProjectSettingsPage     — (merge current ProjectPage settings + existing ProjectSettingsPage)
│
├── SettingsScopedPage (abstract) — Layer 2
│   Sealed: workspaceSettingsNav, memberNav, integrationsNav
│   │
│   ├── WorkspaceSettingsPage   — (split from SettingsPage) tiles, terrain
│   ├── MemberPage              — member management
│   ├── IntegrationsPage        — integrations + webhooks
│   └── AccountPage             — (split from SettingsPage) account, language
│
├── WorkspacePage               — project list, workspace CRUD (no Layer 2 needed)
└── LoginPage                   — authentication (standalone, own base)
```

### Before/After: Common Locator Deduplication

**Before** (duplicated in 7+ POMs):

```typescript
// schema.page.ts
get okButton(): Locator { return this.getByRole("button", { name: "OK" }); }

// project.page.ts
get okButton(): Locator { return this.getByRole("button", { name: "OK" }); }

// content.page.ts
get okButton(): Locator { return this.getByRole("button", { name: "OK" }); }
```

**After** (once in BasePage, sealed):

```typescript
// base.page.ts — Layer 1
protected readonly okButton = (): Locator => {
  return this.page.getByTestId(DATA_TEST_ID.Modal__OkButton);
};
```

### Before/After: Fragile Selector

**Before** (breaks on Ant Design upgrade):

```typescript
// project.page.ts
async gotoProject(name: string): Promise<void> {
  await this.getByText(name, { exact: true }).click();
  const projectName = this.locator(".ant-layout-header p").nth(2);
  await expect(projectName).toHaveText(name);
}
```

**After** (stable):

```typescript
// project-overview.page.ts
public async gotoProject(name: string): Promise<void> {
  await this.getByText(name, { exact: true }).click();
  await expect(this.getByTestId(DATA_TEST_ID.ProjectHeader__Name)).toHaveText(name);
}
```

### Before/After: Modal Workaround

**Before** (40-line CSS selector workaround in `deleteProject()`):

```typescript
const modalWrap = this.page.locator(".ant-modal-wrap");
// ... 30+ lines of .ant-modal-close, computed style checks, fallbacks
```

**After** (clean with data-testid):

```typescript
protected readonly dismissOpenModal = async (): Promise<void> => {
  const modal = this.getByTestId(DATA_TEST_ID.Modal__CloseButton);
  if (await modal.isVisible({ timeout: 500 }).catch(() => false)) {
    await modal.click();
  }
};
```

## POM Splitting Strategy

### ProjectPage → 2 classes

- **ProjectOverviewPage**: model cards, create/delete model from overview, import/export modals
- **ProjectSettingsPage**: project name/description editing, danger zone, accessibility — absorbs the existing `project-settings.page.ts`

### SettingsPage → 2 classes

- **WorkspaceSettingsPage**: tiles, terrain management
- **AccountPage**: account settings, language preferences

### ContentPage stays as one class

At 783 lines it's large, but the concerns (item CRUD, table, views, filters) are tightly coupled via the same URL context. If it grows further, extract `ContentViewPage`.

## Migration Order

Each phase: (a) add `data-testid` to React components → (b) update/create POM class → (c) update spec files → (d) run affected tests

All 10 phases are complete. The table below records the commit that landed each phase.

| Phase | Status | Target                                                                                  | Commit     |
| ----- | ------ | --------------------------------------------------------------------------------------- | ---------- |
| 0     | Done   | Create `ProjectScopedPage` + `SettingsScopedPage` abstract classes, refactor `BasePage` | `6631abf8` |
| 1     | Done   | `ProjectSettingsPage`                                                                   | `b68f5383` |
| 2     | Done   | `MemberPage` + `SettingsScopedPage`                                                     | `b5537aca` |
| 3     | Done   | `AssetsPage`                                                                            | `d0b5896b` |
| 4     | Done   | `RequestPage`                                                                           | `92f40347` |
| 5     | Done   | `SchemaPage`                                                                            | `3b9e9ecd` |
| 6     | Done   | Split `ProjectPage` → `ProjectOverviewPage` + merge into `ProjectSettingsPage`          | `742709c4` |
| 7     | Done   | `FieldEditorPage`                                                                       | `e436e841` |
| 8     | Done   | `ContentPage`                                                                           | `f709e949` |
| 9     | Done   | `SettingsPage` split + `IntegrationsPage` + `WorkspacePage`                             | `bbc81f71` |

### Completed Post-Phase Work

Additional refactoring done after the original 10 phases:

| Work                                          | Commit(s)               | Notes                                                                       |
| --------------------------------------------- | ----------------------- | --------------------------------------------------------------------------- |
| Field creation consolidation                  | `8c352ee6`              | Unified field creation flow across POMs                                     |
| Explicit visibility modifiers                 | `6140baeb`              | All POM members now have explicit `private`/`protected`/`public`            |
| Parallel-safety (timing + isolation)          | `f979ff2d` — `d4e5389f` | Removed trailing `waitForTimeout`, switched to `getId()` everywhere         |
| LoginPage refactor                            | `7a0be9bb`              | Standalone page, no hierarchy change                                        |
| `@smoke`/`@redundant` → Playwright `{ tag }`  | `9da6d187`              | Tags now use Playwright's native `{ tag }` option instead of title prefixes |
| `BasePage.goto()` default `domcontentloaded`  | `c6973fa0`              | All `goto()` calls default to `waitUntil: "domcontentloaded"`               |
| `editField()` abstraction in FieldEditorPage  | `5b876dea`, `ffe01127`  | Single method handles conditional tab navigation for all field types        |
| FieldModal `data-testid` injection            | `9e579fed`              | Added `data-testid` to React FieldModal components                          |
| `:visible` pseudo-selector on `plusNewButton` | `c7113f67`              | Resolves duplicate element matches from Ant Design `forceRender` tabs       |
| URL context validation in action methods      | *(uncommitted)*         | 44 action methods now call `assertProjectContext()`/`assertWorkspaceContext()` as first line |

## Known Patterns

Patterns that emerged during implementation and are now established conventions:

- **`:visible` pseudo-selector**: Use on locators that match duplicate elements across Ant Design `forceRender` tabs (e.g. `plusNewButton`). The `:visible` filter ensures only the currently-rendered element is matched.
- **`editField(options)` pattern**: A single `FieldEditorPage.editField()` method handles conditional tab navigation (General / Validation / Default Value) for all field types. Spec files pass an options object instead of manually clicking tabs.
- **Auto-tracked project base URL**: `ProjectScopedPage` uses a `WeakMap` + `framenavigated` event listener to automatically capture the project base URL after `createProject()`. Subclasses access it via `this.projectBaseUrl` without manual tracking.
- **Playwright `{ tag }` option**: Tags like `@smoke`, `@toAbandon`, and `@fieldVariant` use Playwright's native `test("name", { tag: TAG.SMOKE }, ...)` syntax, not title prefixes. `@toAbandon` tests also include an `annotation` with `type: "consolidate"` pointing to the kept test or component test.
- **URL context validation**: Every public action method calls `this.assertProjectContext()` (or `this.assertWorkspaceContext()` for `WorkspacePage`) as its first line. This produces a clear error ("Expected page to be on a project URL") instead of cryptic element-not-found timeouts when navigation fails silently. **Excluded**: context-establishing/teardown methods (`createProject`, `gotoProject`, `deleteProject` in `ProjectScopedPage`; `createWorkspace`, `deleteWorkspace` in `WorkspacePage`) and `LoginPage`. `WorkspacePage` has its own `private assertWorkspaceContext()` that checks for `/workspace/` without `/project/`.

## E2E vs Component Test Responsibility Boundary

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

### E2E Test Tags

The TAG enum (`e2e/fixtures/test.ts`) defines these tags:

| Tag             | Purpose                                    | Usage                    |
| --------------- | ------------------------------------------ | ------------------------ |
| `@smoke`        | Critical path tests (~27)                  | `yarn e2e-smoke`         |
| `@toAbandon`    | Tests redundant with component tests (~16) | Excluded from `e2e-fast` |
| `@fieldVariant` | Repetitive field/metadata type tests (~30) | Excluded from `e2e-fast` |

**`@toAbandon` pattern** — always include a Playwright `annotation` pointing to the consolidation target:

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

**`@fieldVariant` pattern** — for identical workflows differing only by field type:

```typescript
test("Float field editing has succeeded", { tag: TAG.FIELD_VARIANT }, async (...) => {
```

**3-tier CI strategy**:

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

## Notes

1. **`DATA_TEST_ID` stays in `src/test/utils.ts`**: Both E2E and component tests use it. This is the canonical location.
2. **BasePage getByX wrappers**: Keep during refactoring, deprecate in a later pass (removing would touch every POM).
3. **LoginPage stays standalone**: It operates on external auth provider pages, no hierarchy needed.
4. **Fixtures will be simplified**: Since Layer 2 provides setup/teardown, fixtures can remove `projectPage` from most tests. Each spec fixture maps 1:1 with the primary POM.
5. **Notification helper**: `e2e/helpers/notification.helper.ts` uses ARIA-scoped selectors (`getByRole("alert")`, `getByRole("button", { name: "Close" })`).
6. **Circular composition**: Composition is one-directional. SchemaPage composes ContentPage, but ContentPage does NOT compose SchemaPage. If a content test needs schema setup, it uses inherited Layer 2 methods or its own `beforeEach`.

## Verification

After each migration phase:

1. Run affected spec files: `yarn playwright test <spec-file>`
2. Run smoke tests: `yarn e2e-smoke`
3. Run fast suite: `yarn e2e-fast` (excludes `@toAbandon` + `@fieldVariant`)
4. After all phases: run full suite locally `yarn e2e` (CI-only tests auto-skip via `test.skip(!isCI)` when `process.env.CI` is unset)
5. TypeScript check: `yarn tsc --noEmit` (verify `noImplicitOverride` enforcement)
6. Component tests: `yarn test` (vitest)
