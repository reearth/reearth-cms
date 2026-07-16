# FOSSA Issue Fix Plan (Frontend / npm only)

## Context

FOSSA is flagging licensing violations and security vulnerabilities in the `reearth-cms` project's npm packages. Three report types were reviewed: `licensing.csv`, `vulnerability.csv`, and `quality.csv`. The branch `chore-web/fix-fossa-issue-2` targets the web (npm) side. The goal is to upgrade direct npm deps which will transitively fix the flagged child packages.

---

## Status (2026-07-16, per `report-3.csv`)

All items below are **resolved** — `codemirror-graphql`, `signedsource`, `highlight.js`, `@inquirer/prompts`, and `neverpanic` no longer appear in the latest FOSSA export, and all npm rows have a non-empty declared license. Vuln-flagged direct deps (`axios`, `storybook`, `vite`, `react-router-dom`, `@scalar/api-reference-react`) are all past the versions listed below.

**Remaining: `ol` — `gpl-2.0-plus-geoserver`.** Now at `10.9.0` (bumped past the `10.x` target below), but the FOSSA scan (still showing `10.8.0`, pre-dating the bump) continues to classify it as `gpl-2.0-plus-geoserver` despite the package being BSD-2-Clause. This is a scanner classification tied to source content inside the package, not a version issue — upgrading will not clear it. **No further code change is possible here.** Resolution is a FOSSA dashboard action: mark as false positive / add a policy exception, the same path already used for the server-side Go exceptions in `.fossa.yml` (commit `c8a6c695`). Confirm on the next rescan whether `10.9.0` clears the flag on its own before filing the exception.

---

## Issues to Fix (historical — all resolved except `ol`, see Status above)

### Licensing Violations — Denied (must fix)

| Flagged Transitive Package | License                  | Root Cause Chain                                          | Fix                                   |
| -------------------------- | ------------------------ | --------------------------------------------------------- | ------------------------------------- |
| `codemirror-graphql@2.2.4` | facebook-patent-rights-2 | `graphiql` → `@graphiql/react`                            | Upgrade `graphiql`                    |
| `signedsource@1.0.0`       | facebook-patent-rights-2 | `@graphql-codegen/visitor-plugin-common` → relay-compiler | Upgrade `@graphql-codegen/*` devDeps  |
| `highlight.js@11.11.1`     | CC-BY-SA-4.0             | `@scalar/api-reference-react` → `@scalar/code-highlight`  | Upgrade `@scalar/api-reference-react` |
| `@inquirer/prompts@7.9.0`  | Unlicensed               | `@graphql-codegen/cli` (devDep)                           | Upgrade `@graphql-codegen/cli`        |
| `neverpanic@0.0.5`         | Unlicensed               | `@scalar/api-reference-react` → `@scalar/agent-chat`      | Upgrade `@scalar/api-reference-react` |

### Vulnerability Issues — High/Critical (direct deps)

| Package                       | Current | Severity                        | Fix                     |
| ----------------------------- | ------- | ------------------------------- | ----------------------- |
| `axios`                       | 1.13.5  | HIGH                            | Upgrade to latest `1.x` |
| `storybook`                   | 8.6.15  | HIGH                            | Upgrade to latest `8.x` |
| `vite`                        | 7.3.1   | HIGH                            | Upgrade to latest `7.x` |
| `react-router-dom`            | 6.26.1  | HIGH (via `@remix-run/router`)  | Upgrade to latest `6.x` |
| `@scalar/api-reference-react` | 0.8.57  | — (also fixes transitive vulns) | Upgrade to latest       |

Key transitive vulns resolved as side effects:

- `@remix-run/router` 1.19.1 (XSS) → fixed by `react-router-dom` upgrade
- `rollup` 4.57.1 (path traversal) → fixed by `vite` upgrade
- `undici` 7.21.0 (data amplification) → fixed by `storybook` upgrade
- `path-to-regexp` 2.4.0 (ReDoS) → comes from `@ant-design/pro-layout`; also upgrade `@ant-design/pro-layout` and related `@ant-design/pro-*` packages

### `ol@10.8.0` — Flagged (gpl-2.0-plus-geoserver)

OpenLayers is BSD-licensed at the top level. FOSSA's `gpl-2.0-plus-geoserver` tag is a custom classification. Upgrading `ol` to the latest `10.x` is recommended to see if the flag disappears. If not, a FOSSA policy exception is the correct resolution (not a code change).

---

## Execution Steps

### Step 1 — Write this plan as fix_fossa_issue_plan.md at repo root ✅

### Step 2 — Edit web/package.json

Bump the following to their latest compatible versions:

**Dependencies:**

- `@scalar/api-reference-react` → latest
- `axios` → latest `1.x`
- `graphiql` → latest `3.x`
- `ol` → latest
- `react-router-dom` → latest `6.x`
- `@ant-design/pro-components` → latest
- `@ant-design/pro-layout` → latest
- `@ant-design/pro-provider` → latest
- `@ant-design/pro-table` → latest

**DevDependencies:**

- `vite` → latest `7.x`
- `storybook` → latest `8.x`
- All `@storybook/*` packages → same version as `storybook`
- `@graphql-codegen/cli` → latest `6.x`
- All other `@graphql-codegen/*` packages → latest compatible

### Step 3 — Install and verify

```bash
cd web && yarn install
yarn build
yarn type
```

### Step 4 — Run tests

```bash
cd web && yarn test
```

---

## Verification

- `yarn build` and `yarn type` pass with no errors
- `yarn test` passes
- After merging and FOSSA rescanning, the Denied licensing flags should clear
- Confirm `codemirror-graphql`, `signedsource`, `highlight.js`, `@inquirer/prompts`, `neverpanic` are no longer in the FOSSA report
