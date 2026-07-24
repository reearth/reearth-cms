# Web

## npm Upgrade — Outstanding Work

Most of `web/`'s outdated packages have been upgraded. What remains:

### Blocked

- **antd 6 ecosystem** (`antd`, `@ant-design/cssinjs`, `@ant-design/icons`, `@ant-design/compatible`, `@ant-design/pro-*`): `@ant-design/pro-components` has no antd-6-compatible `latest` release (only an unreleased `3.1.14-2` beta that restructures its deps). `@ant-design/pro-layout`/`-provider`/`-table` have zero antd-6 track at all. `@ant-design/compatible` (source of the `Comment` component, used in `Common/CommentsPanel`/`Request/Details`) also has no v6 track — needs a real replacement component. Revisit when `@ant-design/pro-components` 3.x reaches a stable `latest`. Once unblocked, also remove `@ant-design/v5-patch-for-react-19` (temporary React 19 shim for antd v5).
- **graphql 17**: `graphql-sse` (caps peer at `<=16`), `apollo-upload-client` (caps at `14-16`), `@graphql-codegen/near-operation-file-preset` (caps at `^16`) all lack v17 support. Revisit once any ships it.
- **typescript 7**: GA'd but has no stable programmatic API until 7.1; `typescript-eslint@8.60.0` depends on that API. Revisit once `typescript-eslint` supports TS7 — this also unblocks reverting `tsconfig.json`'s `ignoreDeprecations: "6.0"` escape hatch for `esModuleInterop: false`/`moduleResolution: "Node10"` (switching either surfaces a genuine Cesium `ImageryProvider` interop mismatch plus 2 `zod/v4/locales/*` resolution failures).
- **`globals`**: `15.15.0` → `17.7.0`, a two-major jump, untriaged.

### Needs verification before trusting in production

- **Firebase** (`firebaseui@6.1.0`, unmaintained since 2023, uses the legacy compat API internally): whether its Email/Password sign-in widget still works correctly against firebase 12's Auth SDK is unverified — no live Firebase project/browser available to test. Scoped to `REEARTH_CMS_AUTH_PROVIDER=firebase` deployments (Auth0 is the default).
- **AWS Amplify 6** (`web/src/config/aws.ts`, `web/src/auth/CognitoAuth.ts`): rewritten to the v6 API, but no automated test coverage and no live Cognito user pool tested against.

### Other follow-ups

- ~100 React Compiler lint findings (`react-hooks/*` rules pulled in by `eslint-config-reearth@0.4.0`) across ~30 component files were downgraded to `warn` rather than fixed — needs a dedicated cleanup pass.
- `graphiql` has zero runtime usage anywhere in `web/src` (the API docs page uses `@scalar/api-reference-react` instead) — kept per user decision, worth revisiting.

test