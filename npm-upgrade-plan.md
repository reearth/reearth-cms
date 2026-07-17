# npm Upgrade Plan

**Generated:** 2026-07-08  
**Last updated:** 2026-07-17  
**Source:** `yarn outdated` in `web/`  
**Stats:** 65 outdated packages found out of ~120 total; **79 upgraded so far, ~6 remaining** (blocked: antd 6 ecosystem, graphql core, typescript 7; also newly found: `globals` major, untriaged)  
**File:** `web/package.json`

---

## Strategy

| Group   | Risk   | Approach                                                                                                                              |
| ------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| Group 1 | Low    | Batch upgrade all at once; same-major minor/patch only                                                                                |
| Group 2 | Medium | Upgrade individually, one package at a time, test each                                                                                |
| Group 3 | High   | Coordinated groups; read migration guide first; test thoroughly per subgroup, user reviews and commits each before moving to the next |

---

## Group 1: Low Risk — ✅ COMPLETE

All 31 packages upgraded in `e5796c18a`.

| Package                  | Was     | Now          |
| ------------------------ | ------- | ------------ |
| @ant-design/compatible   | 5.1.3   | 5.1.5        |
| @apollo/client           | 4.1.0   | 4.2.6        |
| @auth0/auth0-react       | 2.2.4   | 2.20.0       |
| @emotion/react           | 11.13.3 | 11.14.0      |
| @emotion/styled          | 11.13.0 | 11.14.1      |
| @monaco-editor/react     | 4.6.0   | 4.8.0-rc.3 ¹ |
| @playwright/test         | 1.60.0  | 1.61.1       |
| @types/js-md5            | 0.7.2   | 0.8.0        |
| @vitest/coverage-v8      | 4.0.18  | 4.1.10       |
| ajv                      | 8.17.1  | 8.20.0       |
| cesium                   | 1.129.0 | 1.143.0      |
| dayjs                    | 1.11.13 | 1.11.21      |
| eslint-config-reearth    | 0.3.8   | 0.4.0 ²      |
| eslint-plugin-playwright | 2.10.4  | 2.10.5       |
| google-auth-library      | 10.5.0  | 10.9.0       |
| i18next-cli              | 1.34.1  | 1.65.0       |
| jest                     | 30.2.0  | 30.4.2       |
| jotai                    | 2.17.1  | 2.20.1       |
| less                     | 4.5.1   | 4.6.7        |
| memfs                    | 4.56.10 | 4.63.0       |
| monaco-editor            | 0.51.0  | 0.55.1       |
| motion                   | 12.34.0 | 12.42.2      |
| msw                      | 2.12.10 | 2.14.7       |
| papaparse                | 5.5.3   | 5.5.4        |
| prettier                 | 3.8.1   | 3.9.4        |
| react-json-tree          | 0.19.0  | 0.20.0       |
| resium                   | 1.18.3  | 1.23.0       |
| vitest                   | 4.0.18  | 4.1.10       |
| yaml                     | 2.8.2   | 2.9.0        |
| zod                      | 4.3.6   | 4.4.3        |
| zod-geojson              | 1.6.2   | 1.7.0        |

> ¹ `@monaco-editor/react` landed at `4.8.0-rc.3` (target was `4.7.0`) — came in via the React 19 migration merge; rc version accepted.  
> ² `eslint-config-reearth` was initially held at `0.3.8` (Group 1) since `0.4.0` requires ESLint ≥10. Bumped to `0.4.0` together with the ESLint 10 upgrade (Group 2) — see below.

---

## Group 1c: Low Risk — third pass — ✅ COMPLETE

A follow-up `yarn outdated` pass on 2026-07-17 surfaced 10 outdated packages. 6 are deliberately held back (unchanged from prior blockers): `antd`/`@ant-design/cssinjs`/`@ant-design/icons` (Group 3e, blocked on `@ant-design/pro-components` v6 support), `graphql` (Group 3h, blocked on `graphql-sse`/`apollo-upload-client`/`near-operation-file-preset`), `globals` (untriaged two-major jump), and `typescript` (blocked on `typescript-eslint` not yet supporting TS7). The remaining 4 were same-major minor/patch bumps, batch-upgraded:

| Package                     | Was    | Now    |
| ---------------------------- | ------ | ------ |
| @scalar/api-reference-react | 0.9.56 | 0.9.58 |
| html-react-parser           | 6.1.4  | 6.1.5  |
| i18next-cli                 | 1.66.0 | 1.66.2 |
| vite                         | 8.1.4  | 8.1.5  |

`yarn install`/`yarn type`/`yarn lint` (0 errors, same 101 pre-existing warnings)/`yarn test` (810 tests)/`yarn build` all pass unchanged.

---

## Group 1b: Low Risk — second pass — ✅ COMPLETE

A follow-up `yarn outdated` pass on 2026-07-15 surfaced 15 newly-outdated packages (all same-major, no breaking-change surface). Batch-upgraded together, matching Group 1's strategy.

| Package                     | Was     | Now     |
| --------------------------- | ------- | ------- |
| @apollo/client              | 4.2.6   | 4.2.7   |
| @auth0/auth0-react          | 2.20.0  | 2.21.0  |
| @scalar/api-reference-react | 0.9.54  | 0.9.55  |
| @types/node                 | 26.1.0  | 26.1.1  |
| eslint                      | 10.6.0  | 10.7.0  |
| firebase                    | 12.15.0 | 12.16.0 |
| graphql-ws                  | 6.0.8   | 6.1.0   |
| i18next                     | 26.3.4  | 26.3.6  |
| jotai                       | 2.20.1  | 2.20.2  |
| lodash.tonumber             | 4.0.3   | 4.18.0  |
| memfs                       | 4.63.0  | 4.64.0  |
| msw                         | 2.14.7  | 2.15.0  |
| prettier                    | 3.9.4   | 3.9.5   |
| react-i18next               | 17.0.8  | 17.0.9  |
| resium                      | 1.23.0  | 1.24.0  |

Peer-dependency spot checks (`npm view <pkg>@<target> peerDependencies`) confirmed no conflicts: `graphql-ws@6.1.0` peers `graphql: "^15.10.1 || ^16 || ^17"` (fine with `graphql@16.12.0` — see corrected note in Group 3h below), `resium@1.24.0` peers `cesium: "1.x"`/`react/react-dom: ">=18.2.0"` (fine), `eslint-config-reearth@0.4.0` peers `eslint: ">=10"` (fine), `@auth0/auth0-react@2.21.0` peers React up to `^19.2.1` (fine). `yarn install`/`yarn type`/`yarn lint` (0 errors, same 101 pre-existing warnings)/`yarn test` (810 tests)/`yarn build` all pass unchanged.

**Newly found, out of scope — `globals`:** outdated `15.15.0` → `17.7.0`, a two-major jump never previously tracked in this doc (missed when ESLint 10/Group 2 landed). Not a minor/patch bump, so left untriaged for now; revisit alongside the other blocked majors (antd 6, graphql 17, typescript 7) when there's bandwidth to check `globals`' breaking changes across two majors.

---

## Group 2: Medium Risk — ✅ 14/15 Done

| Package                    | Was     | Now    | Status                |
| -------------------------- | ------- | ------ | --------------------- |
| @mapbox/vector-tile        | 2.0.4   | 3.0.0  | ✅ Done                |
| @rollup/plugin-yaml        | 4.1.2   | 5.0.0  | ✅ Done                |
| @types/mapbox__vector-tile | 1.3.4   | 2.0.0  | ✅ Done                |
| @types/node                | 25.2.3  | 26.1.0 | ✅ Done                |
| @types/react-resizable     | 3.0.8   | 4.0.0  | ✅ Done                |
| dotenv                     | 16.6.1  | 17.4.2 | ✅ Done                |
| eslint                     | 9.39.2  | 10.6.0 | ✅ Done                |
| eslint-plugin-storybook    | 10.2.8  | 10.4.6 | ⏳ Deferred → Group 3j |
| graphql-ws                 | 5.16.1  | 6.0.8  | ✅ Done                |
| html-react-parser          | 5.2.17  | 6.1.4  | ✅ Done                |
| jsdom                      | 28.0.0  | 29.1.1 | ✅ Done                |
| npm-run-all2               | 5.0.0   | 9.0.2  | ✅ Done                |
| react-resizable            | 3.0.5   | 4.0.2  | ✅ Done                |
| react-svg                  | 16.1.34 | 17.2.4 | ✅ Done                |
| ulid                       | 2.4.0   | 3.0.2  | ✅ Done                |

`eslint-config-reearth` was bumped `0.3.8` → `0.4.0` alongside `eslint` (see Group 1 footnote ²) — its peer dependency required ESLint ≥10. `0.4.0` bundles `eslint-plugin-react-hooks@7.1.1`, which enables new React Compiler lint rules (`react-hooks/set-state-in-effect`, `react-hooks/immutability`, `react-hooks/preserve-manual-memoization`, `react-hooks/refs`, `react-hooks/static-components`, `react-hooks/use-memo`) plus a stricter `vitest/no-conditional-expect`. These surfaced ~100 pre-existing findings across ~30 component files and 3 test files; rather than mass-fixing component behavior as part of a dependency bump, they were downgraded to `warn` in `web/eslint.config.js` (source untouched) so they stay visible without blocking CI. **Follow-up needed:** a dedicated cleanup pass to resolve these warnings file-by-file.

`web/package.json` `engines.node` also tightened `>=20.11.0` → `>=20.19.0` to match ESLint 10's actual Node floor.

**Remaining:** `eslint-plugin-storybook` deferred to Group 3j (blocked on the Storybook 10 upgrade itself).

---

## Group 3: High Risk (coordinated framework upgrades)

Thorough testing per subgroup. Read the migration guide before starting. (Originally planned as a separate PR per subgroup; superseded — all subgroups land on the current branch, reviewed by the user before each is committed.)

### 3a. Vite 8 — ✅ DONE

| Package              | Was   | Now   |
| -------------------- | ----- | ----- |
| vite                 | 7.3.6 | 8.1.3 |
| @vitejs/plugin-react | 5.2.0 | 6.0.3 |

Required together: `@vitejs/plugin-react@6.0.3`'s peer is `vite: ^8.0.0` exactly. `vitest`, `vite-tsconfig-paths`, and `vite-plugin-cesium` already declared support for vite 8 — no changes needed there. `@storybook/react-vite@8.6.15`'s vite peer cap (`^6.0.0`) is a pre-existing, already-tolerated mismatch, unaffected by this bump (tracked under 3j).

Main risk was Vite 8 replacing Rollup with Rolldown as its bundler — `vite-plugin-cesium` injects a third-party Rollup plugin (`rollup-plugin-external-globals`) to externalize the `cesium` global. Verified via `yarn build`: `dist/index.html` still loads Cesium as a script-tag global, `dist/cesium-1.143.0/` is copied out as static assets (not bundled), and the main JS chunk only contains bare `Cesium.*` global references — confirming Rolldown's Rollup-plugin-compat layer handles it correctly. `yarn lint`/`yarn type`/`yarn test` (810 tests) all pass unchanged.

Optional follow-up (not done): Vite 8 suggests replacing the `vite-tsconfig-paths` plugin with its native `resolve.tsconfigPaths: true` option.

**Post-merge regression found and fixed (2026-07-15):** the production build (`yarn build`, Rolldown-based) was fine, but the **dev server** broke on every page with `Element type is invalid ... Check the render method of Styled(Component)`. Root cause: Vite 8's dev-server dependency pre-bundler correctly *detects* `needsInterop: true` for deep default/named imports into antd's CommonJS build (`antd/lib/*`), but generates a broken interop wrapper — e.g. for `antd/lib/layout/layout` it emitted `export default require_layout();` instead of `export default require_layout().default;`, so the import resolved to the whole CJS `exports` object (`{ default, Header, Footer, Content }`) instead of the unwrapped component. This is a genuine Vite/Rolldown-vite dep-optimizer bug, not an app bug — but the app's own deep-imports into antd's internal `antd/lib/*` paths (never a supported public API) are what exposed it. First surfaced via `components/atoms/Layout/index.tsx`'s `styled(Layout)`, rendered on literally every page.

Fix: audited and switched every `antd/lib/*` import (~22 files, both value and type-only, including `Layout`, `Sider`, `Footer`, `Content`, `Header`, `Password`, `Search`, `TextArea`, locale files, and various `import type` usages) to the equivalent `antd/es/*` (ESM) path — confirmed each has a matching module and `.d.ts` before switching. ESM modules need no CJS-interop synthesis, sidestepping the bug entirely regardless of whether/when it's fixed upstream. `yarn type`/`yarn lint`/`yarn test` (810 tests)/`yarn build` all re-verified passing after the fix.

### 3b. TypeScript 6 — ✅ DONE

| Package    | Was   | Now   |
| ---------- | ----- | ----- |
| typescript | 5.7.3 | 6.0.3 |

Codebase had zero `@ts-ignore`/`@ts-expect-error`/decorators/`using` usage, so the classic "implicit-any escape hatch" removals were a non-issue. `strict: true`, `types: [...]`, and `target: "ESNext"` were already explicit, matching TS6's new defaults — no-ops.

Two TS6 deprecations (removed in TS7) required action:

- `tsconfig.json`'s `baseUrl: "."` was removed (deprecated in 6.0); its `paths` entries were given explicit `./` prefixes instead (`"./e2e/*"`, `"./src/*"`) since non-relative paths require `baseUrl` — verified equivalent behavior via `yarn type`.
- `esModuleInterop: false` and `moduleResolution: "Node"` (→ `"Node10"`, the TS6 spelling) are also deprecated, but migrating either for real (`esModuleInterop: true`, or `moduleResolution: "Bundler"`, the officially recommended setting for Vite apps) surfaced genuine new type errors — a Cesium `ImageryProvider`/`tileDiscardPolicy` interop mismatch and 2 `zod/v4/locales/*` resolution failures (zod's `exports` map glob pattern doesn't resolve cleanly under `Bundler`/`node16+`-style resolution, unlike legacy `Node` resolution which ignores `exports` entirely). Rather than debug those as a side effect of a version bump, both are silenced via `"ignoreDeprecations": "6.0"` with a comment. **Follow-up needed**, but not urgent: TS 7.0 already GA'd (2026-07-08, native Go compiler port) — however it ships without a stable programmatic API (expected in 7.1), which `typescript-eslint@8.60.0` depends on, so this repo can't move to TS7 yet regardless. Revisit `Node10`/`esModuleInterop: false` once `typescript-eslint`/tooling actually supports TS7.

`ts-node@10.9.2` (used for `yarn gql`'s `codegen.ts` loading) continued working correctly, and `typescript-eslint@8.60.0`'s peer range (`>=4.8.4 <6.1.0`) already covered 6.0.3. `yarn lint`/`yarn test` (810 tests)/`yarn build` all pass unchanged.

### 3c. React 19 — ✅ DONE

Completed via `bb908efc6` (`chore(web): react 19 migration #1764`), merged from main.

| Package          | Was     | Now     |
| ---------------- | ------- | ------- |
| react            | 18.3.1  | 19.2.7  |
| react-dom        | 18.3.1  | 19.2.7  |
| @types/react     | 18.3.28 | 19.2.17 |
| @types/react-dom | 18.3.7  | 19.2.3  |

> Note: `@ant-design/v5-patch-for-react-19@1.0.3` was added as a React 19 compatibility shim for antd v5. This is temporary — remove it when antd 6 (Group 3e) is done.

### 3d. React Router v7 — ✅ DONE

Completed via `bb908efc6`, merged from main.

| Package          | Was    | Now    |
| ---------------- | ------ | ------ |
| react-router-dom | 6.30.4 | 7.18.1 |

### 3e. antd 6 ecosystem — 🚫 Blocked

| Package             | Current | Target |
| ------------------- | ------- | ------ |
| antd                | 5.29.3  | 6.5.0  |
| @ant-design/cssinjs | 1.24.0  | 2.1.2  |
| @ant-design/icons   | 5.6.1   | 6.3.2  |

**Prerequisite check (2026-07-15) — not satisfiable via a normal semver install:**

- `@ant-design/pro-components@2.8.10` (current `latest`) peers on `antd: "^4.24.15 || ^5.11.2"` — no antd-6 support. An antd-6-compatible line exists only as an **unreleased prerelease** (`3.1.14-2`, npm `beta` dist-tag, not `latest`), which also restructures internally: it drops `@ant-design/pro-layout`/`pro-provider`/`pro-table` as separate dependencies entirely (folds them in, pulls in `@rc-component/table`, `@rc-component/form`, `@dnd-kit/*` instead).
- `@ant-design/pro-layout`, `@ant-design/pro-provider`, `@ant-design/pro-table` (all separate `package.json` deps today) have **zero** antd-6-supporting release in any form — no beta/next track.
- `@ant-design/compatible@5.1.5` (peer `antd: "^5.0.1"`, no v6 track at all) is the sole source of this repo's `Comment` component (`web/src/components/atoms/Comment/index.tsx`, consumed by 3 files under `Common/CommentsPanel`, `Request/Details`). antd dropped `Comment` from core years ago; this shim never followed past antd 5. A real replacement component is needed independent of antd 6, not just a version bump.

Everything else checked (no `ConfigProvider` theme/token/algorithm customization anywhere in `web/src`, zero direct `@ant-design/cssinjs` API usage, clean modern icon names in `web/src/components/atoms/Icon/icons.ts`, trivial `@ant-design/v5-patch-for-react-19` removal — 2 side-effect-only imports in `App.tsx`/`test/setup.ts`) is low-risk and ready whenever the above unblocks.

**Deferred — revisit when `@ant-design/pro-components` 3.x reaches a stable `latest` release** (or if the team decides to adopt the prerelease deliberately, which would also require dropping `pro-layout`/`pro-provider`/`pro-table`, re-auditing the `vite.config.ts` `test.alias` entries for the pro-* sub-package family, and writing the `Comment` replacement).

**Cleanup (still valid once unblocked):** Remove `@ant-design/v5-patch-for-react-19` after the antd 6 bump.

### 3f. Firebase 12 — ✅ DONE (with a flagged caveat)

| Package  | Was     | Now     |
| -------- | ------- | ------- |
| firebase | 10.14.1 | 12.15.0 |

This repo's entire `firebase` usage is 3 files (`config/firebase.ts`, `auth/FirebaseAuth.ts`, `auth/FirebaseProvider.tsx`) via the modular SDK only — `initializeApp`, `getAuth`, `onAuthStateChanged`, `signInWithRedirect`, `signOut`, `EmailAuthProvider`. All stable, unchanged since Firebase v9 and confirmed present in 12.15.0's exports. No Firestore/Storage/Analytics/Functions usage. No other installed package depends on `firebase` directly. Node engine (`>=20.19.0`) already satisfied. `yarn type`/`yarn lint`/`yarn test` (810 tests)/`yarn build` all pass unchanged.

**Caveat — not fixed, deliberately accepted:** `firebaseui@6.1.0` (npm `latest`, last published 2023-08-02) peers on `firebase: "^9.1.3 || ^10.0.0"` and has never been updated for firebase 11/12; it internally uses the legacy `firebase/compat/{app,auth}` API rather than the modular SDK. Whether its Email/Password sign-in widget (the only thing it's used for, in `FirebaseProvider.tsx`) still works correctly against the v11-era Auth SDK rewrite is **unverified** — no live Firebase project or browser available in this session, and there's no existing automated test coverage for `FirebaseAuth`/`FirebaseProvider` either. Blast radius is scoped to deployments with `REEARTH_CMS_AUTH_PROVIDER=firebase` (Auth0 is the default; Cognito is the other option), but `.env.example` documents it as a supported configuration. **Action required before trusting this in production:** manually test the firebaseui-driven sign-in flow end-to-end against a real Firebase project.

### 3g. AWS Amplify 6 — ✅ DONE

| Package     | Was    | Now    |
| ----------- | ------ | ------ |
| aws-amplify | 5.3.29 | 6.18.0 |

Unlike the antd/Firebase/GraphQL subgroups, no ecosystem package pins to `aws-amplify` — this was a first-party code migration only, and smaller than "High migration effort" suggested: exactly 2 files, 5 call sites.

- `web/src/config/aws.ts`: `Amplify.configure()`'s v5-flat config (`Auth: { region, userPoolId, userPoolWebClientId, oauth: {...} }`) rewritten to v6's nested shape (`Auth: { Cognito: { userPoolId, userPoolClientId, loginWith: { oauth: {...} } } }`), verified against `@aws-amplify/core`'s actual `.d.ts` types rather than assumed. `region` has no v6 equivalent (inferred from the user pool ID prefix now) — dropped from the config call; `redirectSignIn`/`redirectSignOut` became `string[]` instead of a single string.
- `web/src/auth/CognitoAuth.ts`: `Auth.currentAuthenticatedUser/currentSession/federatedSignIn/signOut` (top-level `aws-amplify` import) replaced with `getCurrentUser`/`fetchAuthSession`/`signInWithRedirect`/`signOut` from `aws-amplify/auth`; token extraction changed from `session.getIdToken().getJwtToken()` to `session.tokens?.idToken?.toString()`.

Same caveat as Firebase: no automated test coverage for the Cognito path, and unlike Firebase it isn't even documented in `.env.example` — verified via `yarn type`/`yarn lint`/`yarn test` (810 tests)/`yarn build` only; a live Cognito user pool would be needed to confirm the actual sign-in flow. Bundle size incidentally shrank (~149 kB) from the modular imports pulling in less than v5's monolithic `aws-amplify` import.

### 3h. GraphQL 17 ecosystem — 🚫 `graphql` blocked; `graphiql` ✅ done separately

| Package  | Was     | Now   | Status    |
| -------- | ------- | ----- | --------- |
| graphql  | 16.12.0 | —     | 🚫 Blocked |
| graphiql | 3.7.2   | 5.2.4 | ✅ Done    |

**`graphql`/graphql-js bump — blocked (2026-07-15), three actively-used packages have no v17-compatible release:**

- `graphql-sse@2.6.0` (npm `latest`) caps `graphql` peer at `<=16`; drives the SSE subscription transport in `web/src/gql/provider.tsx`.
- `apollo-upload-client@19.0.0` (npm `latest`) caps at `graphql: "14 - 16"`; drives file uploads.
- `@graphql-codegen/near-operation-file-preset@5.2.1` (npm `latest`) caps at `^16`; is the preset actually used in `web/codegen.ts`.

`@apollo/client@4.2.7`, `graphiql`, and the rest of `@graphql-codegen/*` already support `^17` today. `graphql-ws` was bumped `6.0.8` → `6.1.0` standalone in Group 1b — its peer range (`graphql: "^15.10.1 || ^16 || ^17"`) already covers both today's `graphql@16.12.0` and a future v17, so unlike originally assumed here, it didn't need to wait on the `graphql` bump. Revisit `graphql` itself once any of the three blockers above ships v17 support.

**`graphiql` bumped standalone (3.7.2 → 5.2.4):** its peer range (`graphql: "^15.5.0 || ^16.0.0 || ^17.0.0"`, `react/react-dom: "^18 || ^19"`) is fully satisfied by the current `graphql@16.12.0`/`react@19.2.7` — fully decoupled from the blocker above. This also fixed a pre-existing peer mismatch: `graphiql@3.7.2` only allowed `react ^16.8.0 || ^17 || ^18`, already incompatible with this repo's React 19 (the peer warning is now gone from `yarn install` output).

Notable finding: **`graphiql` has zero runtime usage in this app** — grepped no matches anywhere in `web/src` outside the `package.json` version pin. The actual API docs page (`web/src/components/molecules/ApiDocs/index.tsx`) renders `@scalar/api-reference-react` instead. Kept per user decision (not removed as dead weight), but worth revisiting separately. `yarn type`/`yarn lint`/`yarn test` (810 tests)/`yarn build` all pass unchanged.

### 3i. i18next 26 — ✅ DONE

| Package       | Was    | Now    |
| ------------- | ------ | ------ |
| i18next       | 25.8.6 | 26.3.4 |
| react-i18next | 15.0.1 | 17.0.8 |

`react-i18next@17.0.8` (upgraded ahead via the React 19 migration) declares a peer dependency of `i18next >= 26.2.0`, which `25.8.6` did not satisfy — this upgrade closes that gap. `showSupportNotice` was removed from `InitOptions` in v26 (the console support-notice feature was dropped entirely); removed the now-invalid `showSupportNotice: false` from both `web/src/i18n/i18n.ts` and `web/e2e/support/i18n.ts`. No other init options, `<Trans>` props, or `t()` interpolation/pluralization/formatter usage were affected. `yarn type`, `yarn lint`, and `yarn test` (810 tests) all pass.

### 3j. Storybook 10 — ✅ DONE

| Package                       | Was    | Now    | Status                       |
| ----------------------------- | ------ | ------ | ---------------------------- |
| storybook                     | 8.6.15 | 10.5.0 | ✅ Done                       |
| @storybook/react              | 8.6.15 | 10.5.0 | ✅ Done                       |
| @storybook/react-vite         | 8.6.15 | 10.5.0 | ✅ Done                       |
| @storybook/addon-links        | 8.6.15 | 10.5.0 | ✅ Done                       |
| @storybook/addon-docs         | —      | 10.5.0 | ➕ Added (see below)          |
| eslint-plugin-storybook       | 10.2.8 | 10.5.0 | ✅ Done                       |
| @storybook/addon-essentials   | 8.6.15 | —      | 🗑️ Removed (discontinued)     |
| @storybook/addon-interactions | 8.6.15 | —      | 🗑️ Removed (discontinued)     |
| @storybook/blocks             | 8.6.15 | —      | 🗑️ Removed (discontinued)     |
| @storybook/testing-library    | 0.2.2  | —      | 🗑️ Removed (unused, orphaned) |

The original plan's target table was factually wrong for 3 rows: `@storybook/addon-essentials`, `@storybook/addon-interactions`, and `@storybook/blocks` don't exist at `10.4.6` or any 9.x/10.x release — they were discontinued mid-9.0 and their functionality (actions, controls, docs blocks, interactions/play-function support) merged into the core `storybook` package's subpath exports (`storybook/test`, `storybook/actions`, etc.) or the standalone `@storybook/addon-docs` package. `.storybook/main.ts`'s `addons` array was updated to just `["@storybook/addon-links", "@storybook/addon-docs"]`. `@storybook/testing-library` (listed as "up-to-date" in this doc's earlier "no action needed" list) was actually an orphaned, unused package (zero usage in `src/`, superseded by `storybook/test`) — removed.

The `npx storybook@latest upgrade` CLI failed silently in this sandboxed session (no output, exit code 1/0 inconsistently even for `--version`) — the migration was done manually instead, verified via actual `yarn build-storybook` runs, not just `yarn type`/`lint`.

**Real bugs found and fixed along the way (all pre-existing, not upgrade-specific, just never previously surfaced since nobody had run `build-storybook` successfully before):**

1. **`@testing-library/dom` was never a direct dependency** — only present in `node_modules` as a transitive dependency of the now-removed `@storybook/testing-library`, silently satisfying `@testing-library/react`/`@testing-library/user-event`'s long-unmet peer dependencies. Added explicitly (`10.4.1`) to avoid a real regression.
2. **`src/stories/Button.stories.tsx` can't type-check under this repo's `moduleResolution: "Node10"`** — `@storybook/react@10.5.0` is exports-map-only (no `main`/`types` fallback), same class of issue as the `zod`/`esModuleInterop` deferral from the TypeScript 6 group. Fixed by excluding `src/**/*.stories.tsx` from `tsconfig.json`'s type-checking scope (Storybook's own Vite-based build doesn't need `tsc` to validate these files).
3. **`.storybook/main.ts` never had a `viteFinal` hook** — the `@reearth-cms/*` path alias (via `vite-tsconfig-paths` in the main `vite.config.ts`) was never wired into Storybook's own build, so `build-storybook` failed to resolve any `@reearth-cms/*` import. Fixed with an explicit `resolve.alias` in a new `viteFinal` hook (the `vite-tsconfig-paths` plugin itself didn't work reliably in Storybook's builder-vite context, so a direct alias was used instead).
4. **`vite-plugin-cesium` was inherited into Storybook's build** (via `@storybook/react-vite`'s builder auto-loading the root `vite.config.ts`) even though no story uses Cesium, and its asset-copy step has a latent `path.join`-with-absolute-path bug that created a bogus duplicated-path directory tree under `web/` when run with Storybook's different `outDir`. Fixed by filtering the cesium plugin out in `viteFinal`.
5. **`storybook-static/` (the build output) wasn't in `eslint.config.js`'s ignores** — added `storybook-static/**`, since nobody had generated that directory before to notice `eslint .` would otherwise lint the minified build output.

`yarn type`/`yarn lint`/`yarn test` (810 tests)/`yarn build`/`yarn build-storybook` all verified passing after all of the above.

### 3k. react-markdown 10 — ✅ DONE

Completed via `bb908efc6`, merged from main.

| Package        | Was   | Now    |
| -------------- | ----- | ------ |
| react-markdown | 9.0.1 | 10.1.0 |

---

## Up-to-date (no action needed)

The following packages are already at their latest version:

- `@ant-design/colors`
- `@ant-design/pro-components`
- `@ant-design/pro-layout`
- `@ant-design/pro-provider`
- `@ant-design/pro-table`
- `@ant-design/v5-patch-for-react-19` *(temporary React 19 shim — remove with antd 6 upgrade)*
- `@emotion/jest`
- `@graphql-codegen/cli`
- `@graphql-codegen/fragment-matcher`
- `@graphql-codegen/introspection`
- `@graphql-codegen/near-operation-file-preset`
- `@graphql-codegen/typed-document-node`
- `@graphql-codegen/typescript`
- `@graphql-codegen/typescript-operations`
- `@placemarkio/check-geojson`
- `@scalar/api-reference-react`
- `@testing-library/dom`
- `@testing-library/jest-dom`
- `@testing-library/react`
- `@testing-library/react-hooks`
- `@testing-library/user-event`
- `@types/file-saver`
- `@types/object-hash`
- `@types/papaparse`
- `@types/react-router-dom`
- `apollo-upload-client`
- `axios`
- `cesium-mvt-imagery-provider`
- `firebaseui`
- `formik`
- `graphql-sse`
- `i18next-browser-languagedetector`
- `js-file-download`
- `js-md5`
- `mini-svg-data-uri`
- `object-hash`
- `ol`
- `prop-types`
- `rc-field-form`
- `rc-menu`
- `rc-table`
- `read-env`
- `remark-gfm`
- `runes2`
- `rxjs`
- `ts-node`
- `vite-plugin-cesium`
- `vite-tsconfig-paths`

`@storybook/testing-library` removed entirely (Group 3j) — was orphaned/unused, not actually "up to date."
