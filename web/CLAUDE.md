# Web

## npm Upgrade — Outstanding Work

Most of `web/`'s outdated packages have been upgraded. What remains:

### Blocked

- **`@ant-design/pro-*` on antd 6** (`@ant-design/pro-components`, `-layout`, `-provider`, `-table`): `antd` itself was bumped to 6.2.2 (2026-07-27), but these packages still declare a peer of `antd: "^4.24.15 || ^5.11.2"` — only an unreleased `pro-components@3.1.14-2`-ish beta targets antd 6. Yarn installs with peer-dependency warnings (not hard failures); in practice `PageHeader` (`pro-layout`) and `ProTable` (`pro-table`/`pro-provider`) both render and behave correctly against antd 6 at runtime — verified via the full unit-test suite (Member/Integration/Content table tests) and a Storybook visual smoke test. Revisit the version pin once `@ant-design/pro-components` 3.x reaches a stable `latest`, but there's no active breakage to fix.
- **graphql 17**: `graphql-sse` (caps peer at `<=16`), `apollo-upload-client` (caps at `14-16`), `@graphql-codegen/near-operation-file-preset` (caps at `^16`) all lack v17 support. Revisit once any ships it.
- **typescript 7**: GA'd but has no stable programmatic API until 7.1; `typescript-eslint@8.60.0` depends on that API. Revisit once `typescript-eslint` supports TS7 — this also unblocks reverting `tsconfig.json`'s `ignoreDeprecations: "6.0"` escape hatch for `esModuleInterop: false`/`moduleResolution: "Node10"` (switching either surfaces a genuine Cesium `ImageryProvider` interop mismatch plus 2 `zod/v4/locales/*` resolution failures).
- **`globals`**: `15.15.0` → `17.7.0`, a two-major jump, untriaged.

### Recently completed

- **antd 5 → 6 upgrade** (2026-07-27): `antd` 5.29.3 → 6.2.2, `@ant-design/icons` 5.6.1 → 6.1.0. Removed `@ant-design/compatible` (no antd-6 track existed for its `Comment` component — replaced `web/src/components/atoms/Comment` with a plain-div/CSS reimplementation matching the same DOM structure and class names, so all consumer `styled(AntDComment)` overrides in `Common/CommentsPanel`/`Request/Details` kept working unchanged) and `@ant-design/v5-patch-for-react-19` (no longer needed — antd 6 supports React 18+/19 natively). Converted all `Tabs.TabPane`/`Steps.Step` usages to the `items` array API (both were removed in v6). Renamed deprecated props: `direction`→`orientation` (Space/Steps), `bordered`→`variant` (Tag/Card), `tabPosition`→`tabPlacement` (Tabs), `Alert`'s `message`→`title`. Added a `ResizeObserver` mock to `src/test/setup.ts` — antd 6's components need it in jsdom and its absence was failing ~150 unrelated-looking tests app-wide (Table/Select/Modal-heavy suites) with `ResizeObserver is not defined`.

### Needs verification before trusting in production

- **Firebase** (`firebaseui@6.1.0`, unmaintained since 2023, uses the legacy compat API internally): whether its Email/Password sign-in widget still works correctly against firebase 12's Auth SDK is unverified — no live Firebase project/browser available to test. Scoped to `REEARTH_CMS_AUTH_PROVIDER=firebase` deployments (Auth0 is the default).
- **AWS Amplify 6** (`web/src/config/aws.ts`, `web/src/auth/CognitoAuth.ts`): rewritten to the v6 API, but no automated test coverage and no live Cognito user pool tested against.

### Other follow-ups

- ~100 React Compiler lint findings (`react-hooks/*` rules pulled in by `eslint-config-reearth@0.4.0`) across ~30 component files were downgraded to `warn` rather than fixed — needs a dedicated cleanup pass.
- `graphiql` has zero runtime usage anywhere in `web/src` (the API docs page uses `@scalar/api-reference-react` instead) — kept per user decision, worth revisiting.
