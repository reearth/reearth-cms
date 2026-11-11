# CMS UI Redesign Plan

> Status: Draft v2 · Scope: frontend only (`web/`) · Updated: 2026-10-16

## 0. Background and decisions
**Why we are doing this**
- **antd is heavy.** We ship antd, pro-components, `@ant-design/compatible` and cssinjs. The upgrade to antd 6 is also blocked by pro-components and `@ant-design/compatible` (see `web/CLAUDE.md`).
- **antd animations make CI E2E flaky.** The suite never disables motion. It compensates with `retries: 10`, `slowMo: 300`, about 409 `networkidle` waits and 47 `.ant-*` selectors.
- **We need a CMS that is easy to use**, not just good-looking.

**Decisions**
- UI: Tailwind v4 + shadcn-style components owned in the repo. The primitive layer (Radix or Base UI) is still open, see Appendix A.
- Styling: Emotion is dropped together with antd.
- Routing: TanStack Router, migrated in a dedicated early phase.
- State: each kind of state has exactly one owner (§3a). XState machines are used only where impossible states must be eliminated.
- Rollout: incremental, on an integration branch with small stacked PRs (§7).
- Design: the first draft exists but management has not reviewed it yet.

## 1. Goals and non-goals
**Goals (official)**
- Usability first.
- A smaller bundle.
- Deterministic E2E.
- Type-safe routing and state.
- Unblock dependency upgrades.

**Stretch goals.** These are unofficial and tracked in §11: a11y, hotkeys, RWD and dark mode.

**Non-goals**
- Backend or GraphQL schema changes.
- Replacing Apollo, Cesium/Resium or Monaco. These stay and are lazy-loaded.

## 2. Current state (baseline facts)

**Stack**
- React 19, Vite 8.
- react-router-dom 6.30 (`web/src/App.tsx`).
- jotai (`web/src/state/index.ts`).
- Apollo 4.
- Emotion (160 files).
- antd 5.29 + pro-components/pro-table/pro-layout + `@ant-design/compatible`.

**Wrapper seam**
- 56 atoms in `web/src/components/atoms/*` wrap antd.
- Only 12 files import antd directly instead: 3 runtime imports, the rest type-only.
- Top usage: Button 94, Icon 92, Form 81, Modal 36, Notification 34, Tooltip 27, Input 27, Upload 25, Select 23.

**Heavy screens**

| Screen | File | Lines |
|---|---|---|
| Item editor | `molecules/Content/Form/index.tsx` | 972 |
| Content list (ProTable) | `molecules/Content/Table/index.tsx` | 952 |
| Geometry editor | `molecules/Common/Form/GeometryItem` | 744 |
| Field creation | `Schema/FieldModal/FieldCreationModalWithSteps` | 652 |
| Content import | `ContentImportModal` | 503 |
| Uploader | `Uploader` | 389 + 278 |

**Bundle**
- No `manualChunks`.
- No lazy routes.
- `main.tsx` imports all of Monaco eagerly.

**Theme**
- No tokens and no ConfigProvider theme.
- `web/src/index.css` overrides `.ant-*` classes.
- Colors come from `utils/style.ts` (`AntdColor`), plus hard-coded hex values in Emotion styles.

**E2E**
- Config: `web/playwright.config.ts`.
- Page objects: `web/e2e/pages/*`.
- `e2e/helpers/notification.helper.ts` is coupled to `.ant-notification-notice`.

**Unit tests**
- `web/src/test/setup.ts` fakes rc-motion `animationend` and calls `Modal.destroyAll()`.
- 6 test files assert on `.ant-*` classes.

**Lint**
- `web/eslint.config.js` is a flat config on ESLint 10.

## 3. Target architecture

| Concern | Choice | Notes / tradeoff |
|---|---|---|
| Styling | Tailwind v4 + design tokens as CSS variables | Replaces Emotion and antd cssinjs. Dynamic styles use CSS vars and `data-*` attributes. |
| Components | shadcn-style, owned in `src/components/ui` + `cva` | Full control and a small bundle. We own Table, Tree, Upload and DatePicker. |
| Primitives | Radix or Base UI (Appendix A) | |
| Table | TanStack Table (+ Virtual where needed) | Replaces ProTable and ResizableProTable. |
| Forms | react-hook-form + zod | Replaces antd Form. |
| Notifications | sonner | |
| Icons | lucide-react + existing custom SVGs | |
| Routing | TanStack Router | File-based routes, zod-validated search params, lazy routes. |
| Dates | dayjs (keep) | |

**Motion policy**
- Transitions are CSS-only.
- All motion is gated by `prefers-reduced-motion`.
- E2E runs with Playwright `reducedMotion: "reduce"`, so there is zero animation in tests.

### 3a. State ownership
Each piece of state has exactly one owner, and nothing is mirrored between owners.

| Owner | Holds | Example |
|---|---|---|
| `useState` / `useReducer` | Local, ephemeral UI state | Popover open, hover, a local toggle |
| react-hook-form (+ zod) | Form values, validation, dirty state | Item fields, field settings |
| Apollo Client | Server data and its cache | Models, items, assets, requests |
| TanStack Router | State that should be shareable through the URL | Filters, sort, page, selected item or version |
| `@xstate/store` (replaces jotai) | Small, cross-cutting client state | Current workspace or project, UI preferences |
| XState machine | Flows whose flag combinations can be invalid | Upload lifecycle, multi-step modals, publish and request workflow, auth bootstrap |

**Rules for machines**
- **Reason to exist.** The purpose of a machine is to make impossible states unrepresentable. A typical signal is two or more interdependent flags such as `isUploading && isDone`, or an async flow with cancel and retry.
- **Shape.**
  - Keep machines small and flat.
  - Prefer explicit states over boolean flags in context.
  - Avoid nested or parallel states unless they are truly required.
- **Data.** Machines never copy server data. They hold IDs and talk to Apollo through actors.

## 4. Design tokens and the antd ↔ Tailwind mapping
Yes, we need a mapping, and not only for colors. During coexistence, old atoms (antd) and new components (Tailwind) appear on the same screen, so both must read from the same tokens.

**Token model**
1. **Primitive tokens** are the raw scales, e.g. `--blue-6` and `--space-4`.
2. **Semantic tokens** describe purpose, e.g. `--color-bg-surface`, `--color-text-primary`, `--color-border`, `--color-primary` and `--color-danger`. Components only use semantic tokens; raw hex values are forbidden in components.
3. **Consumers.** There are two:
   - Tailwind v4 `@theme`, which produces utilities such as `bg-surface` and `text-danger`.
   - antd `ConfigProvider theme.token`. antd needs concrete values, not `var()`, because it derives colors from them.

**No `tailwind.config.js` (Tailwind v4 is CSS-first)**
- Theme values live in CSS under `@theme { … }`, which replaces `theme.extend`.
- Content detection is automatic, so there is no `content` array.
- Vite integration is `@tailwindcss/vite`; PostCSS and autoprefixer are no longer needed.
- A JS config still loads through `@config "./tailwind.config.js"`, but only as a migration aid for v3 projects. We don't use one.

```css
/* src/styles/index.css */
@import "tailwindcss";
@import "./tokens.css"; /* generated: :root { --blue-6: …; } */

@theme {
  --color-primary: var(--blue-6);
  --spacing: 4px;
  --radius-md: 6px;
}
```

**Single source of truth.** Keep one token definition and generate both `tokens.css` (for Tailwind) and `tokens.ts` (for antd) from it, so the two can never drift. The preferred route is to export Figma variables as JSON in DTCG format and run them through Style Dictionary. Until the design is final, a hand-written source plus a small generator script is enough.

**Mapping table** (antd defaults verified in `antd/lib/theme/themes/seed.js`)

| Category | antd today | Tailwind v4 `@theme` | Notes |
|---|---|---|---|
| Color | `colorPrimary` / `Error` / `Success` / `Warning`, `colorText*`, `colorBg*`, `colorBorder*`, `AntdColor` in `utils/style.ts`, hex values in Emotion | `--color-*` | Audit the hex values, map each to the nearest semantic token, and merge near-duplicates. |
| Spacing | 4px grid (`sizeUnit` 4): `sizeXXS`…`sizeXXL`, `margin*`, `padding*` | `--spacing` (4px base, so `p-1` = 4px) | Same grid. Ad-hoc px values in Emotion snap to the scale. |
| Radius | `borderRadius` 6 (SM 4, LG 8) | `--radius-*` | |
| Typography | `fontSize` 14, Roboto loaded in `index.css`, `fontSizeHeading*`, `lineHeight` | `--font-*`, `--text-*` (with paired line-heights) | Tailwind's `text-base` is 16px; redefine the scale to match the design. |
| Control size | `controlHeight` 32 (SM 24, LG 40) | Custom `--size-control-*` | Keeps old and new inputs aligned inside the same form. |
| Shadow | `boxShadow`, `boxShadowSecondary` | `--shadow-*` | |
| z-index | `zIndexPopupBase` 1000; popups add offsets (+50, +70, notification/message higher) | `--z-*` | Critical while both libraries coexist, e.g. a new Dialog opened over an old Select dropdown. |
| Breakpoints | `screenXS` 480 … `XXL` 1600 | Default `sm` 640 … `2xl` 1536 | Pick one set (the designer's) and redefine `--breakpoint-*`. |
| Motion | `motionUnit` 0.1s, ease curves, `motion: true` | `--ease-*`, durations | Set `motion: false` under reduced-motion (Phase 0). |

## 5. Usability principles ("easy to use, not only fancy")
- **Task-first IA.** Audit the top tasks (create model/field, edit/publish item, upload asset, review request), then cut clicks and page hops.
- **Predictable layout.** Primary actions sit in the same place on every screen. The pattern is consistent: list → detail → edit.
- **Explicit states.** Every screen has explicit empty, loading (skeleton), error and success states. Validation is inline, not just shown in toasts.
- **Undo over confirm** wherever it is safe.
- **Information density.** Tables offer a density toggle, column persistence and sticky headers.
- **i18n.** Every screen is checked in en and ja for text length and line wrapping.

## 6. Coexistence of old and new components
**Layout: separate folders, not an `N` prefix**

| | `N` prefix (`atoms/NButton.tsx`) | Separate folder (`components/ui/Button`) |
|---|---|---|
| ESLint | Needs filename-based patterns; awkward | Path-based; trivial |
| End state | Rename each `NButton` → `Button` (file, export and every import) | Delete the old `atoms/`, then rename the folder `ui/` → `atoms/` (one mechanical PR) |
| Tests | Mixed with legacy tests | Move together with the component |
| Comparing old vs new | Side by side | One folder hop |

**Decision**
- **New layer during migration:** `src/components/ui/<Component>/`, with `index.tsx`, `<Component>.test.tsx` and `<Component>.stories.tsx`.
- **Import path during migration:** `@reearth-cms/components/ui`.
- **Legacy layer:** `src/components/atoms/` stays legacy and receives bug fixes only. Each legacy atom is deleted when its last caller is gone.
- **Final name.** After the old atoms are deleted, Phase 5 renames `ui/` back to `atoms/`, which keeps the atomic-design naming (`atoms` / `molecules` / `organisms`). The rename is one mechanical PR:
  - Move the folder with `git mv`.
  - Rewrite imports from `components/ui` to `components/atoms`.
  - Remove the `LEGACY_ATOMS` lint pattern before the rename.
- **Molecules and organisms:**
  - Screen-specific ones are rewritten in place in their screen's PRs.
  - Shared ones (`molecules/Common/*`) are migrated by the first screen that needs them. The other screens' E2E tests must stay green.

**ESLint (`web/eslint.config.js`)**
```js
const LEGACY_UI = ["antd", "antd/*", "@ant-design/*", "@emotion/*", "rc-*"];
const LEGACY_ATOMS = ["@reearth-cms/components/atoms", "@reearth-cms/components/atoms/*"];

// appended to the exported array
{
  files: ["src/**/*.{ts,tsx}"],
  rules: {
    "no-restricted-imports": ["error", {
      patterns: [
        { group: LEGACY_UI, message: "Legacy UI. Use @reearth-cms/components/ui." },
        // enable from Phase 3 on
        { group: LEGACY_ATOMS, message: "Legacy atom. Use @reearth-cms/components/ui." },
      ],
    }],
  },
},
{
  // the legacy wrapper layer is the only place allowed to touch antd
  files: ["src/components/atoms/**"],
  rules: { "no-restricted-imports": "off" },
},
```
- **Existing violations** (160 Emotion files, the antd bypass files, `src/test/setup.ts`):
  - Run `eslint . --suppress-rule no-restricted-imports` to baseline them into `eslint-suppressions.json`. Commit that file.
  - New violations fail CI. When a file gets cleaned up, run `eslint . --prune-suppressions`.
  - An empty suppressions file is Phase 5's exit check.
- **No override for `ui/`.** `src/components/ui/**` already gets the global rule, so it can never import antd, Emotion or legacy atoms.
- **Config gotcha.** Rule options in flat config don't merge across blocks. Any extra override must repeat the full pattern list.

## 7. Git flow and PR strategy
- **Integration branch.** `feat-web/cms-ui-redesign` has a long-lived draft PR to `main`, the "main PR". It starts with Phase 0.
- **Sub-PRs:**
  - Branch from the integration branch and target it.
  - Keep each one small: about 400 changed lines or fewer, excluding generated files, the lockfile and snapshots.
  - Title them `[Phase N] …`.
  - Squash-merge them into the integration branch.
- **Syncing with main.** Merge `main` into the integration branch regularly: weekly, or whenever `main` touches `web/`. Use merge, not rebase, because other branches are based on it. Sub-PR branches then merge the integration branch in.
- **Checkpoint merges (recommended).** Merge the integration branch into `main` at stable, user-invisible checkpoints, e.g. after Phase 0 and after Phase 1. This limits drift and keeps the final main PR reviewable; the pieces were already reviewed in sub-PRs.
- **CI:**
  - `ci.yml` runs on every `pull_request`, so lint, unit tests and build cover sub-PRs.
  - E2E needs a deployed environment. Run it locally or via `e2e_web.yml` `workflow_dispatch` against a preview before each checkpoint merge (see Open decisions).
- **Team agreement.** `web/` changes that land on `main` during the migration must be ported to the new components. Avoid parallel large refactors in `web/`.

## 8. Phases
Each sub-PR goes through review and commit before the next one starts.

**Phase 0 – Foundations and guardrails (no visual change; can run before design approval)**
- **Tailwind v4.** Set it up alongside antd and resolve the reset conflict with CSS `@layer` ordering (antd `StyleProvider layer`).
- **Token audit.**
  - Inventory the hex values, px values and `AntdColor` usages.
  - Write the token source and generator (`tokens.css` + `tokens.ts`) using today's values.
  - Feed `tokens.ts` into antd `ConfigProvider`. There should be no visual change.
- **Kill animation in E2E.**
  - Set Playwright `reducedMotion: "reduce"`.
  - Set antd `theme.token.motion = false` when `prefers-reduced-motion: reduce` matches.
- **E2E selectors.**
  - Replace the 47 `.ant-*` selectors with `data-testid` selectors (§9). This means adding test IDs to the legacy atoms and molecules.
  - Give notifications test IDs and make `notification.helper.ts` query by test ID.
- **Lint guardrails.** Add `no-restricted-imports` with a suppression baseline (§6).
- **Baselines.** Add a bundle analyzer and record initial JS size, E2E first-attempt pass rate and CI duration.
- **Lazy loading.** Load Monaco and the Cesium viewers with `React.lazy`.

**Phase 1 – Routing and global state**
- **TanStack Router:**
  - Use file-based routes under `src/routes`.
  - Add zod search params for the content, asset, request and schema lists.
  - Use route-level code splitting.
- **Global state.** Replace jotai (`web/src/state/index.ts`) with `@xstate/store`.
- **UI.** No UI change. The existing E2E suite must pass unchanged.

**Phase 2 – Design system (gated on management sign-off of the design)**
- **Design review gate.** Management review of the first draft, plus a usability check against §5.
- **Tokens.** Replace the token values with the approved design and regenerate both outputs. The legacy antd screens pick up the new look through ConfigProvider.
- **Primitives.** Build them in `src/components/ui`, each with a Storybook story, unit tests and keyboard behavior tests.
- **App shell.** Build the new layout and navigation.

**Phase 3 – Swap low-level components app-wide**
- **Order (by usage):**
  1. Button, Icon, Tooltip, Tag, Badge, Switch, Checkbox, Input/TextArea.
  2. Notification (sonner), Modal (Dialog), Dropdown, Select, Tabs.
  3. Remaining atoms.
- **Per-component flow.** Build the `ui/` component, migrate its callers (import path plus API adjustments) in small PRs, then delete the legacy atom once it has no callers.
- **Lint.** Enable the `LEGACY_ATOMS` pattern and re-baseline the suppressions.
- **Leave Form and Table alone.** They are redone per screen in Phase 4.

**Phase 4 – Screen redesign (one screen per PR series)**
- **Order:**
  1. Account/Settings.
  2. Workspace and project list.
  3. Members and integrations.
  4. Schema editor (XState for field-creation steps and import schema).
  5. Assets and uploader (XState).
  6. Content list (TanStack Table).
  7. Item editor (react-hook-form + XState for save/publish/version).
  8. Requests (XState).
  9. Public API / API docs.
- **Definition of done for each screen:**
  - New layout per design.
  - No Emotion, antd or legacy-atom imports, and the screen's files are pruned from the suppressions.
  - Page object updated.
  - Unit and E2E green with no added waits.
  - en/ja checked.

**Phase 5 – Removal and cleanup**
- **Dependencies.** Remove antd, `@ant-design/*`, `rc-*`, pro-components, `@emotion/*`, less and jotai.
- **Full unused-dependency scan.**
  - Run `knip`, which finds unused dependencies, devDependencies, files and exports.
  - Remove everything that is unused, e.g. formik.
  - Reconfirm the team's decision to keep `graphiql`.
- **Leftovers.** Delete the `index.css` antd overrides, `AntdColor` in `utils/style.ts`, `src/components/atoms/`, and the antd hacks in `src/test/setup.ts`.
- **Lint.** `eslint-suppressions.json` must be empty; then delete it.
- **Rename.** Rename `src/components/ui/` → `src/components/atoms/` and update its imports (§6).
- **E2E config.** Lower E2E `retries` from 10 to ≤ 2 and set `slowMo` to 0.

**Phase 6 – E2E tuning (optional; once the suite passes reliably after Phase 5)**
- **Test isolation.**
  - Each spec creates its own workspace and project through fixtures, with unique names, and cleans up after itself.
  - Remove ordering dependencies, e.g. `describe.configure({ mode: "default" })` in `project.spec.ts`.
- **Parallelism:**
  - Enable `fullyParallel: true` and raise the CI `workers` count step by step.
  - Consider CI sharding (`--shard`). The existing `blob` reporter supports `merge-reports`.
  - Check that the deployed test environment can handle the load.
- **Waits and timeouts.**
  - Replace `networkidle` waits with web-first assertions or the existing `waitForGraphQL` helper.
  - Revisit the 150s/60s timeouts and `test.slow()` on CI.
- **Measurement.** Track flaky rate and duration with the existing Allure history.

**Phase 7 – Visual regression testing (optional; TODO, to be discussed)**
- [ ] Choose a tool, e.g. Playwright `toHaveScreenshot` or a Storybook-based option.
- [ ] Decide the scope: primitives in Storybook, key screens, or both.
- [ ] Decide where baselines are stored and the approval flow for updates.
- [ ] Make rendering deterministic: fonts, reduced motion, fixed data and time, masking of Cesium/Monaco.
- [ ] CI integration and cost.

## 9. Testing strategy
- **Selectors: `data-testid` first.**
  - Query with `getByTestId` wherever possible. It is precise and it doesn't break when en/ja copy or the DOM structure changes.
  - Use `getByRole` / `getByText` only where a test ID can't be attached, such as third-party DOM, or where the visible text itself is what's under test.
  - No class-based selectors.
- **Test ID conventions:**
  - Every `ui/` component forwards `data-testid` (spread rest props onto the root, or onto the meaningful inner part for composite components such as `Select`'s trigger and options).
  - IDs live in the existing `DATA_TEST_ID` enum in `web/src/test/data.ts` (as-is). Components and page objects both import from it, so a rename can't silently break the E2E tests, and the enum catches duplicate keys and values.
  - Follow its naming convention: `Component__Element` (BEM-inspired PascalCase), e.g. `ContentTable__Row`, `ItemForm__SaveButton`.
  - Repeated elements use a stable qualifier (an ID or index) rather than text.
- **Page objects.** Update them in the same PR as their screen.
- **Unit tests:**
  - Use RTL without animation shims.
  - Test XState machines as pure actors.
  - Colocate tests with their component in `ui/`.
- **Storybook.** Every `ui/` primitive has a story.

## 10. Success metrics (compare against the Phase 0 baseline)
- **Bundle.** Initial JS (gzip) shrinks by X%. Set the target after the baseline is measured.
- **E2E reliability.**
  - First-attempt pass rate ≥ 98%, with retries ≤ 2.
  - Zero `.ant-*` selectors and zero `waitForTimeout` in `e2e/`.
- **E2E speed (only if Phase 6 is done).** After Phase 6, CI E2E duration drops by Y% with workers > 1 and `fullyParallel`, and the flaky rate (from Allure history) is ≤ Z%.
- **Lint.** Zero `no-restricted-imports` suppressions.
- **Usability.** Time-on-task for the top tasks, measured before and after with an informal test of 3–5 internal users.

## 11. Stretch goals (unofficial, TODO)
These are nice-to-haves and not official requirements.

**Cheap to keep possible now, expensive to retrofit later**
- Components use semantic color tokens only, so dark mode later is just a token swap.
- Avoid fixed-width layouts.
- Icon-only buttons get an `aria-label`.
- Primitives (Radix or Base UI) already provide keyboard and ARIA basics.

**TODOs**
- [ ] **A11y (WCAG 2.2 AA):**
  - Landmarks and a skip link.
  - Focus management.
  - Live regions.
  - Contrast.
  - APG patterns for Table, Tree and Select.
  - axe in E2E and Storybook, plus `jsx-a11y`.
- [ ] **Hotkeys:**
  - A scoped registry that is IME-safe (`isComposing`).
  - A `?` help dialog.
  - A `⌘/Ctrl+K` command palette.
  - Page shortcuts such as save, row navigation and new item.
- [ ] **RWD (phone/tablet):**
  - Down to 360px.
  - Touch targets ≥ 24px, no hover-only UI.
  - Sidebar → drawer, dialogs → sheets, tables → card view.
  - A mobile Playwright project.
- [ ] **Dark mode:** a second semantic token set.
- [ ] **Cesium and Monaco a11y:** non-visual alternatives, such as coordinate/JSON input for geometry.

## 12. Risks and mitigations

| Risk | Mitigation |
|---|---|
| antd and Tailwind CSS conflicts | `@layer` ordering; shared tokens; aligned z-index scale |
| Token drift between CSS and antd | Generate both outputs from one source |
| Design not yet approved | Phases 0–1 don't depend on visuals; Phase 2 is gated |
| Integration branch drifts from `main` | Regular merges from `main`; checkpoint merges into `main`; team agreement on `web/` changes |
| Owning complex components (Table, Tree, DatePicker, Upload) | Build on TanStack and primitives; budget time explicitly |
| XState over-use | §3a rules; machines only for impossible-state problems |
| Scope creep | Per-screen definition of done; lint suppressions only shrink |
| Cesium and Monaco | Keep them as-is, behind lazy boundaries |

## 13. Open decisions
- Primitive layer: Radix or Base UI (Appendix A). The user will review the docs.
- Token pipeline: Figma variables export + Style Dictionary, or a hand-written source + script.
- Timing and owners of the management design review.
- Checkpoint merges into `main`: yes or no, and the merge strategy for the main PR (merge commit or squash).
- A preview deploy of the integration branch for E2E.
- Whether to replace `@ant-design/compatible` `Comment` early (Phase 3).

## Appendix A. Radix vs Base UI (brief; as of mid-2026, verify against the docs)

| | Radix Primitives | Base UI |
|---|---|---|
| Maintainers and momentum | WorkOS. Many original authors moved to Base UI, and releases have slowed. | MUI team together with Radix and Floating UI authors. v1 stable since late 2025, actively developed. |
| Maturity | Very mature (since 2020), huge adoption and many community answers | Newer, with a smaller ecosystem |
| Composition API | `asChild` (Slot) | `render` prop (element or function) |
| CMS-relevant coverage | Dialog, Popover, DropdownMenu, Select, Tabs, Tooltip, Checkbox, Switch, Toast… No Combobox or NumberField | The same core set, plus Combobox, Autocomplete, NumberField and Field/Fieldset/Form helpers |
| Not in either | DatePicker, Table, Tree, Upload | DatePicker, Table, Tree, Upload |
| Animation hooks | `data-state` + Presence (keyframe-oriented) | `data-starting-style` / `data-ending-style` (made for CSS transitions) |
| shadcn/ui | The original default; most examples and blocks use it | Supported as an alternative base (check current status) |
| Docs | radix-ui.com/primitives | base-ui.com |

**Lean: Base UI.** The CMS has many searchable selects (references, tags, members) and number inputs, and native Combobox and NumberField avoid gluing together cmdk and Popover. Tradeoff: it is younger, with fewer community examples. Final call after the user reads the docs.
