# Frontend Test Refactoring

## Purpose

To make E2E test more solid and fast, eliminate duplicate code. And reconsider relationship between E2E test (with Playwright) and component test (with Vitest)

## Direction

- E2E test will keep following the rule in "e2e/claude.md", but change some rule and structure
- Define when and where should we write E2E test, or maybe component test can fully cover it

## Playwright

### Issues

- Duplicate element query: Find duplicate element after testing package upgrade
- Element not found: Cannot find element any more (text, element structure change)
- Query behavior changed: Query become invalid due to upgrade (ex. "plus New Project" → "plusNew Project")
- Find unexpected element: Accidentally find unexpected element (find the “ok” button behind the modal layer, but not inside layer)
- Flaky parallel: Flaky test that prone to fail when running in parallel
- Ant design class query: Element query failed after package upgrade by using specific CSS class from package (ex. “ant-table” in ant design)
- Change locales, language will break tests

### Solutions

- Using `getByTestId` to precisely query the right element
- Element injected attribute `data-testid` will be abstract into enum `DATA_TEST_ID` under `src/test/utils.ts`. Naming convention will be
  - `Component__Element`
  - `Page__FirstComponent__FirstElement`
  - `Page__SubPage__FirstComponent__FirstElement`
  - Style is inspired by BEM with PascalCase
- For Ant Design and other 3rd party library components, try to inject `data-testid` attribute for precise query if applicable. If not, wrap it and using `data-testid` attribute

## POM Structure

### Issues

- Duplicate code block across page objects, and not easy to detect it (static code check)
- Some pages contain complex modal (ex. field-editor page is inside schema page), but they are "sibling" class for now
- Test cases import several POM at the same time, which became messy
- All properties and methods are public for now, due to query elements inside test cases

### Solutions

- Use "strict override control inheritance structure" to refactor these POM classes (please refer to file "class-override-control.ts")
- Setup `"noImplicitOverride": true` in `tsconfig.json` (already added)

#### POM Class Rules

- `private` properties and methods by default, only expose those will be used in test files (*.spec.ts)
- Class hierarchy:
  - First layer: base class (abstract class, might have "placeholder" methods meant to be overridden)
  - Second layer: common class (like base class), stored common properties and methods used by third layer classes
  - Third layer: the classes will be use in test files, has public methods
- class will be split into two parts:
  - Element Queries: use getter function (no params) and normal function (with params), query `data-testid` if possible. Params type might use enum `DATA_TEST_ID` but not `string`
  - Actions: public function for test files. Which contains but limited to:
    - Check current url is valid to query elements ("check if I'm at the right place"), if not, throw error
    - Query elements ONLY using the methods inside the class
    - Check element existence (or visibility)
    - Do action (ex. click, hover ...etc)

## Relationship Frontend Tests

Definition in short:

- E2E tests focus on system function with **real world data**
- Component tests focus on data rendering correctly (no matter is fake or real data)
- Visual tests (no implemented) focus on what user will see (UI changes)

### E2E Test

- E2E test is not visual test, so don't query element by "visible things" (ex. button text)
- If testing i18n text is unavoidable, please use (`t("i18n-key")`) instead of hard-coded string
- Test "interaction correctness with REAL WORLD data"

### Component Test

- If right data will can ensure component works correct, use it
- Validate rendering logic
- Fully trust the input data, no matter is fake or real

### Misc

- Responsibility can be overlapped between E2E and component tests if necessary
