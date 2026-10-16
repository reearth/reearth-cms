# CMS UI Redesign Plan

> Status: Draft · Scope: frontend only (`web/`) · Created: 2026-10-07

## 0. Background and decisions

**Why**

- antd is heavy (antd + pro-components + compatible + cssinjs), and the upgrade to antd 6 is blocked by pro-components and `@ant-design/compatible` (see `web/CLAUDE.md`).
- antd animations make CI E2E flaky. The suite never disables motion; it compensates with `retries: 10`, `slowMo: 300`, about 409 `networkidle` waits and 47 `.ant-*` selectors.
- We need a CMS that is **easy to use**, not just good-looking.

**Decisions**

- UI: Tailwind v4 + shadcn-style components owned in the repo.
- Routing: TanStack Router, migrated in a dedicated early phase.
- State: XState (machines for complex flows, `@xstate/store` for small global state).
- Rollout: incremental.
- Emotion: dropped together with antd, so two styling systems never coexist permanently.
- Design: the first draft exists but management has not reviewed it yet.

## 1. Goals and non-goals

- **Goals:**
  - Usability first.
  - Accessible (WCAG 2.2 AA), keyboard- and hotkey-friendly, and touch/mobile friendly.
  - Smaller bundle.
  - Deterministic E2E.
  - Type-safe routing and state.
  - Unblock dependency upgrades.
- **Non-goals:**
  - Backend or GraphQL schema changes.
  - Replacing Apollo, Cesium/Resium or Monaco. These stay and are lazy-loaded.

## 2. Current state (baseline facts)

**Stack:** React 19, Vite 8, react-router-dom 6.30 (`web/src/App.tsx`), jotai (`web/src/state/index.ts`), Apollo 4, Emotion (160 files), antd 5.29 + pro-components/pro-table/pro-layout + `@ant-design/compatible`.

**Wrapper seam:**

- `web/src/components/atoms/*`: 56 atoms wrap antd.
- Only 12 files bypass them: 3 runtime imports, the rest are type-only.
- Top usage: Button 94, Icon 92, Form 81, Modal 36, Notification 34, Tooltip 27, Input 27, Upload 25, Select 23.

**Heavy screens:**

| Screen                  | File                                            | Lines     |
| ----------------------- | ----------------------------------------------- | --------- |
| Item editor             | `molecules/Content/Form/index.tsx`              | 972       |
| Content list (ProTable) | `molecules/Content/Table/index.tsx`             | 952       |
| Geometry editor         | `molecules/Common/Form/GeometryItem`            | 744       |
| Field creation modal    | `Schema/FieldModal/FieldCreationModalWithSteps` | 652       |
| Content import modal    | `ContentImportModal`                            | 503       |
| Uploader                | `Uploader`                                      | 389 + 278 |

**Bundle:**

- No `manualChunks`.
- No lazy routes.
- `main.tsx` imports all of Monaco eagerly.

**Theme:**

- No tokens and no dark mode.
- `web/src/index.css` overrides `.ant-*` classes.
- Colors come from `utils/style.ts` (`AntdColor`).

**E2E:**

- Config: `web/playwright.config.ts`.
- Page objects: `web/e2e/pages/*`.
- `e2e/helpers/notification.helper.ts` is coupled to `.ant-notification-notice`.

**Unit tests:**

- `web/src/test/setup.ts` fakes rc-motion `animationend` and calls `Modal.destroyAll()`.
- 6 test files assert on `.ant-*` classes.

**Storybook:** installed, but has only 1 story.

## 3. Target architecture

| Concern         | Choice                                                                           | Notes / tradeoff                                                                        |
| --------------- | -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Styling         | Tailwind v4 + CSS variables (design tokens)                                      | Replaces Emotion and antd cssinjs. Dynamic styles use CSS vars and `data-*` attributes. |
| Components      | shadcn-style, owned in `src/components/ui` (Radix or Base UI primitives) + `cva` | Full control and a small bundle. We own Table, Tree, Upload and DatePicker.             |
| Table           | TanStack Table (+ TanStack Virtual where needed)                                 | Replaces ProTable and ResizableProTable.                                                |
| Forms           | react-hook-form + zod                                                            | Replaces antd Form; formik is dropped.                                                  |
| Notifications   | sonner                                                                           |                                                                                         |
| Icons           | lucide-react + existing custom SVGs                                              |                                                                                         |
| Routing         | TanStack Router (file-based, zod-validated search params, lazy routes)           |                                                                                         |
| Server state    | Apollo (unchanged)                                                               |                                                                                         |
| URL state       | Router search params                                                             | Filters, sort, pagination and selected item.                                            |
| Global UI state | `@xstate/store`                                                                  | Replaces jotai.                                                                         |
| Complex flows   | XState v5 machines (`setup()`), colocated with the feature                       | Uploader, multi-step modals, item edit/publish, request workflow, auth bootstrap.       |
| Dates           | dayjs (keep)                                                                     |                                                                                         |

**Motion policy:**

- CSS-only transitions.
- All motion is wrapped in `motion-safe:` or a `prefers-reduced-motion` check.
- E2E runs with Playwright `reducedMotion: "reduce"`, which gives zero animation in tests.

## 4. Usability principles ("easy to use, not only fancy")

- **Task-first IA.** Audit the top tasks (create model/field, edit/publish item, upload asset, review request), then minimize clicks and page hops.
- **Predictable layout.** Primary actions sit in the same place on every screen. The pattern is consistent: list → detail → edit.
- **Clear system states.** Every screen has explicit empty, loading (skeleton), error and success states. Validation is inline, not just shown in toasts.
- **Undo over confirm** wherever it is safe.
- **Information density.** Tables offer a density toggle, column persistence and sticky headers.
- **i18n.** Every screen is checked in both en and ja for text length and line wrapping.

## 4a. Accessibility, hotkeys and touch

**A11y (target WCAG 2.2 AA)**

- **Semantics.** Semantic landmarks (`header`/`nav`/`main`) and a "skip to content" link.
- **Labels.** Every control has an accessible name. Icon-only buttons get `aria-label`.
- **Focus.**
  - Focus is always visible (`focus-visible` ring token).
  - Focus moves into dialogs and drawers and returns to the trigger on close.
  - Route changes move focus to the page heading.
- **Announcements.** Async results (save, publish, upload) are announced through live regions; sonner toasts use `role="status"` or `"alert"`.
- **Color.** Contrast is ≥ 4.5:1 for text and ≥ 3:1 for UI. State is never conveyed by color alone (status badges carry icon + text).
- **Complex widgets.** Table, Tree, Select, DatePicker and Tabs follow the WAI-ARIA APG patterns (roving tabindex, arrow keys).
- **Reduced motion.** Honored app-wide; this is the same mechanism that makes E2E deterministic.
- **Language.** `lang` attribute and screen-reader text are correct for both en and ja.

**Hotkeys**

- **Registry.** A central hotkey registry (thin wrapper, e.g. `react-hotkeys-hook`) with scopes (global, page, dialog), so shortcuts never collide and are disabled while typing in inputs.
- **Global shortcuts:**
  - `?` opens a shortcut help dialog.
  - `⌘/Ctrl+K` opens a command palette (shadcn `Command` / cmdk) for navigation (models, items, assets, settings) and common actions.
  - `/` focuses search.
- **Page shortcuts:**
  - `⌘/Ctrl+S` saves an item.
  - `j`/`k` or arrow keys move through list rows.
  - `Enter` opens the selected row.
  - `Esc` closes the topmost layer.
  - `n` creates a new item.
- **Discoverability.** Shortcuts are shown in tooltips and menus. Labels adapt to the OS (⌘ vs Ctrl).

**Mobile / touch**

- **Scope.** Responsive down to 360px. All read, review and light-edit tasks work on phone and tablet; heavy authoring stays desktop-first (see Open decisions).
- **Touch targets.** ≥ 24×24px minimum (WCAG 2.5.8), 44px for primary actions.
- **No hover-only UI.** Row actions and tooltips that hold essential information also have a tap or overflow-menu path.
- **Layout.**
  - The sidebar collapses into an off-canvas drawer.
  - Dialogs become full-screen sheets on small screens.
  - Tables switch to a card or list view, or scroll horizontally with a sticky first column.
- **Input.** Correct `inputmode`/`type` for the on-screen keyboard; safe-area insets respected.
- **Gestures.** Every drag interaction (column reorder, field reorder, upload) has a non-drag alternative, per WCAG 2.5.7.

## 5. Phases

Every phase ships independently and keeps `main` releasable. Each phase is split into small PRs, each reviewed and committed before moving on.

**Phase 0 – Foundations and guardrails (no visual change, can run before design approval)**

- **Tailwind v4.** Set it up alongside antd and resolve the reset conflict with CSS `@layer` ordering (antd `StyleProvider layer`).
- **Baselines.** Add a bundle analyzer and record baselines: initial JS size, E2E first-attempt pass rate, CI duration.
- **E2E hardening:**
  - Set `reducedMotion: "reduce"`.
  - Replace the 47 `.ant-*` selectors with role, label or test-id selectors.
  - Rewrite `notification.helper.ts` to use `getByRole("alert"/"status")`.
- **Lint guardrails.**
  - Add ESLint `no-restricted-imports`: no new `antd`, `@ant-design/*` or `@emotion/*` imports outside the legacy atoms.
  - Add `eslint-plugin-jsx-a11y`.
- **A11y baseline.** Add `@axe-core/playwright` scans on the key pages and record the violation count.
- **Mobile E2E project.** Add a Playwright mobile project (`devices["Pixel 7"]`, `hasTouch`). It is smoke-only at first.
- **Lazy-load heavy modules.** Load Monaco and Cesium viewers with `React.lazy`.

**Phase 1 – Routing and global state**

- **TanStack Router:**
  - Migrate all routes into file-based routes under `src/routes`.
  - Add zod search-param schemas for the content, asset, request and schema lists.
  - Use route-level code splitting.
- **Global state.** Replace jotai (`web/src/state/index.ts`) with `@xstate/store`.
- **UI.** No UI changes; the existing E2E suite must pass unchanged.

**Phase 2 – Design system (depends on management sign-off of the design)**

- **Design review gate.** Management review of the first design draft, plus a usability check against the principles in §4.
- **Tokens.** Turn the design tokens (color, spacing, radius, typography, elevation) into Tailwind theme CSS variables, with dark mode ready.
- **Tokens for a11y and touch.** Include focus ring, touch-target size and breakpoint tokens. Check contrast at the token level.
- **Primitives.** Build them in `src/components/ui`, each with a Storybook story (`@storybook/addon-a11y`), unit tests and keyboard behavior tests.
- **App shell.** Responsive layout (sidebar ↔ drawer), skip link, focus-on-route-change.
- **Interaction infrastructure.** Hotkey registry, the `?` help dialog and the `⌘K` command palette.

**Phase 3 – Atom swap (by usage, smallest API delta first)**

- **Order:**
  1. Button, Icon, Tooltip, Tag, Badge, Switch, Checkbox, Input/TextArea.
  2. Notification (sonner), Modal (Dialog), Dropdown, Select, Tabs.
  3. Remaining atoms.
- **API compatibility.** Keep each atom's public API where reasonable. Where it diverges, migrate the callers in the same PR.
- **Leave Form and Table alone.** Atoms for these stay on antd until Phase 4, because they are redone per screen.

**Phase 4 – Screen redesign (one screen per PR series)**

- **Order:**
  1. Account/Settings (low risk).
  2. Workspace and project list.
  3. Members and integrations.
  4. Schema editor (XState for the field-creation steps and import schema).
  5. Assets and uploader (XState).
  6. Content list (TanStack Table).
  7. Item editor (react-hook-form + XState for dirty/save/publish/version).
  8. Requests (XState workflow).
  9. Public API / API docs.
- **Definition of done for each screen:**
  - New layout per design.
  - No Emotion and no antd imports.
  - Page object updated.
  - Unit and E2E green with no added waits.
  - en/ja checked.
  - Zero axe violations (serious or critical).
  - Keyboard-only walkthrough of the screen's main task passes.
  - Page shortcuts registered.
  - Usable at 360px and 768px, verified with the mobile E2E project.

**Phase 5 – Removal and cleanup**

- **Dependencies.** Remove antd, `@ant-design/*`, `rc-*`, pro-components, `@emotion/*`, less, formik and jotai.
- **Leftovers.** Delete the `index.css` antd overrides, `utils/style.ts` `AntdColor`, and the antd hacks in `src/test/setup.ts`.
- **E2E config.** Lower E2E `retries` from 10 to ≤2, set `slowMo` to 0, and remove most `networkidle` waits.

## 6. Testing strategy

- **Selectors.** Prefer `getByRole` and `getByLabel`; use `data-testid` only for non-semantic targets. Ban class-based selectors with lint or review.
- **Page objects.** Updated in the same PR as their screen.
- **Unit tests.** RTL with no reliance on animation shims; behavior tests for XState machines use the actor test pattern.
- **Visual review.** Storybook for primitives; optionally Playwright screenshots for key screens.
- **A11y checks.**
  - axe scans in E2E (`@axe-core/playwright`) and Storybook (`addon-a11y`).
  - `jsx-a11y` lint.
  - A manual screen-reader pass (VoiceOver) per redesigned screen.
- **Keyboard E2E.** Keyboard-only specs for the top tasks, driven by `page.keyboard`. These include the hotkeys and the command palette.
- **Touch E2E.** A mobile project running the smoke suite with `hasTouch`, using `tap()` for touch-specific paths.

## 7. Success metrics (compare against the Phase 0 baseline)

- Initial JS (gzip) reduced by X% (set the target after the baseline is measured).
- E2E first-attempt pass rate ≥ 98%, with retries ≤ 2.
- Zero `.ant-*` selectors and zero `waitForTimeout` in `e2e/`.
- Time-on-task for the top tasks is measured before and after (an informal usability test with 3–5 internal users).
- Zero serious or critical axe violations on all redesigned screens.
- Top tasks can be completed keyboard-only, and on a 360px touch viewport within the mobile scope.

## 8. Risks and mitigations

| Risk                                                        | Mitigation                                                                                          |
| ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| antd and Tailwind CSS conflicts during coexistence          | `@layer` ordering; disable Tailwind preflight on legacy areas if needed                             |
| Design not yet approved                                     | Phases 0–1 don't depend on visuals; Phase 2 is gated on sign-off                                    |
| Owning complex components (Table, Tree, DatePicker, Upload) | Build them on TanStack and Radix primitives; budget time explicitly                                 |
| XState learning curve and over-use                          | Machines only for multi-step or async flows; simple state stays in local `useState`                 |
| Scope creep / long tail                                     | Strict per-screen definition of done; lint blocks new legacy imports                                |
| Cesium and Monaco integration                               | Keep them as-is, behind lazy boundaries                                                             |
| Cesium and Monaco have weak a11y and touch support          | Provide non-visual alternatives (coordinate/JSON form input for geometry); document known gaps      |
| Hotkeys clash with the browser, OS or IME (ja input)        | Scoped registry; ignore while composing (`isComposing`) or in inputs; avoid browser-reserved combos |
| Dense tables on small screens                               | Card or list view variant per table; define the columns kept on mobile in the design phase          |

## 9. Open decisions

- Radix vs Base UI as the primitive layer (decide in Phase 2 with a short spike on Select and Dialog).
- Dark mode: in scope for v1, or tokens-ready only?
- Timing and owners of the management design review.
- Whether to replace `@ant-design/compatible` `Comment` early (Phase 3) to unblock dependency hygiene.
- Mobile scope: which tasks must be fully supported on phones. Proposal: browse/view, review/approve requests, edit simple fields, upload assets. Schema editing and geometry editing stay desktop-first.
- Final hotkey map, to be agreed with the designer and documented in the help dialog.
