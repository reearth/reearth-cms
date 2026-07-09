# npm Upgrade Plan

**Generated:** 2026-07-08  
**Source:** `yarn outdated` in `web/`  
**Stats:** 65 outdated packages found out of ~120 total  
**File:** `web/package.json`

---

## Strategy

| Group   | Risk   | Approach                                                                 |
| ------- | ------ | ------------------------------------------------------------------------ |
| Group 1 | Low    | Batch upgrade all at once; same-major minor/patch only                   |
| Group 2 | Medium | Upgrade individually, one package at a time, test each                   |
| Group 3 | High   | Coordinated groups; read migration guide first; separate PR per subgroup |

---

## Group 1: Low Risk (31 packages)

All same-major minor/patch bumps — safe to batch.

| Package                  | Current | Latest  |
| ------------------------ | ------- | ------- |
| @ant-design/compatible   | 5.1.3   | 5.1.5   |
| @apollo/client           | 4.1.0   | 4.2.6   |
| @auth0/auth0-react       | 2.2.4   | 2.20.0  |
| @emotion/react           | 11.13.3 | 11.14.0 |
| @emotion/styled          | 11.13.0 | 11.14.1 |
| @monaco-editor/react     | 4.6.0   | 4.7.0   |
| @playwright/test         | 1.60.0  | 1.61.1  |
| @types/js-md5            | 0.7.2   | 0.8.0   |
| @vitest/coverage-v8      | 4.0.18  | 4.1.10  |
| ajv                      | 8.17.1  | 8.20.0  |
| cesium                   | 1.129.0 | 1.143.0 |
| dayjs                    | 1.11.13 | 1.11.21 |
| eslint-config-reearth    | 0.3.8   | 0.4.0   |
| eslint-plugin-playwright | 2.10.4  | 2.10.5  |
| google-auth-library      | 10.5.0  | 10.9.0  |
| i18next-cli              | 1.34.1  | 1.65.0  |
| jest                     | 30.2.0  | 30.4.2  |
| jotai                    | 2.17.1  | 2.20.1  |
| less                     | 4.5.1   | 4.6.7   |
| memfs                    | 4.56.10 | 4.63.0  |
| monaco-editor            | 0.51.0  | 0.55.1  |
| motion                   | 12.34.0 | 12.42.2 |
| msw                      | 2.12.10 | 2.14.7  |
| papaparse                | 5.5.3   | 5.5.4   |
| prettier                 | 3.8.1   | 3.9.4   |
| react-json-tree          | 0.19.0  | 0.20.0  |
| resium                   | 1.18.3  | 1.23.0  |
| vitest                   | 4.0.18  | 4.1.10  |
| yaml                     | 2.8.2   | 2.9.0   |
| zod                      | 4.3.6   | 4.4.3   |
| zod-geojson              | 1.6.2   | 1.7.0   |

**Batch command (run from `web/`):**

```sh
yarn upgrade \
  @ant-design/compatible@5.1.5 \
  @apollo/client@4.2.6 \
  @auth0/auth0-react@2.20.0 \
  @emotion/react@11.14.0 \
  @emotion/styled@11.14.1 \
  @monaco-editor/react@4.7.0 \
  @playwright/test@1.61.1 \
  @types/js-md5@0.8.0 \
  @vitest/coverage-v8@4.1.10 \
  ajv@8.20.0 \
  cesium@1.143.0 \
  dayjs@1.11.21 \
  eslint-config-reearth@0.4.0 \
  eslint-plugin-playwright@2.10.5 \
  google-auth-library@10.9.0 \
  i18next-cli@1.65.0 \
  jest@30.4.2 \
  jotai@2.20.1 \
  less@4.6.7 \
  memfs@4.63.0 \
  monaco-editor@0.55.1 \
  motion@12.42.2 \
  msw@2.14.7 \
  papaparse@5.5.4 \
  prettier@3.9.4 \
  react-json-tree@0.20.0 \
  resium@1.23.0 \
  vitest@4.1.10 \
  yaml@2.9.0 \
  zod@4.4.3 \
  zod-geojson@1.7.0
```

**Verify:** `yarn type && yarn test && yarn build`

---

## Group 2: Medium Risk (15 packages)

Upgrade individually; run tests after each.

| Package                    | Current | Latest | Notes                                             |
| -------------------------- | ------- | ------ | ------------------------------------------------- |
| @mapbox/vector-tile        | 2.0.4   | 3.0.0  | check API compat with cesium-mvt-imagery-provider |
| @rollup/plugin-yaml        | 4.1.2   | 5.0.0  | check vite.config.ts                              |
| @types/mapbox__vector-tile | 1.3.4   | 2.0.0  | pair with @mapbox/vector-tile                     |
| @types/node                | 25.2.3  | 26.1.0 | node type changes                                 |
| @types/react-resizable     | 3.0.8   | 4.0.0  | pair with react-resizable upgrade                 |
| dotenv                     | 16.6.1  | 17.4.2 | check dotenv API usage in scripts                 |
| eslint                     | 9.39.2  | 10.6.0 | check eslint.config.ts for removed rules          |
| eslint-plugin-storybook    | 10.2.8  | 10.4.6 | upgrade together with storybook group             |
| graphql-ws                 | 5.16.1  | 6.0.8  | check WebSocket client instantiation              |
| html-react-parser          | 5.2.17  | 6.1.4  | check transform option API                        |
| jsdom                      | 28.0.0  | 29.1.1 | test env only; low blast radius                   |
| npm-run-all2               | 5.0.0   | 9.0.2  | check script aliases in package.json              |
| react-resizable            | 3.0.5   | 4.0.2  | check ResizableBox prop API                       |
| react-svg                  | 16.1.34 | 17.2.4 | check render prop API                             |
| ulid                       | 2.4.0   | 3.0.2  | check monotonicFactory / ulid() call sites        |

**Suggested order:** jsdom → dotenv → npm-run-all2 → @types/node → graphql-ws → ulid → react-svg → html-react-parser → react-resizable + @types/react-resizable → @mapbox/vector-tile + @types/mapbox__vector-tile → @rollup/plugin-yaml → eslint → (eslint-plugin-storybook with Group 3j)

---

## Group 3: High Risk (coordinated framework upgrades)

Each subgroup = its own PR + thorough testing. Read the migration guide before starting.

### 3a. Vite 8

| Package              | Current | Latest |
| -------------------- | ------- | ------ |
| vite                 | 7.3.6   | 8.1.3  |
| @vitejs/plugin-react | 5.1.4   | 6.0.3  |

Migration guide: https://vitejs.dev/guide/migration  
Check: `vite.config.ts` for any removed/renamed APIs.

### 3b. TypeScript 6

| Package    | Current | Latest |
| ---------- | ------- | ------ |
| typescript | 5.7.3   | 6.0.3  |

TS6 removes some implicit `any` escape hatches. Run `yarn type` after upgrade and fix all new errors.

### 3c. React 19

| Package          | Current | Latest  |
| ---------------- | ------- | ------- |
| react            | 18.3.1  | 19.2.7  |
| react-dom        | 18.3.1  | 19.2.7  |
| @types/react     | 18.3.28 | 19.2.17 |
| @types/react-dom | 18.3.7  | 19.2.3  |

**Prerequisite:** Confirm antd and @ant-design/pro-components are React 19-compatible before upgrading.  
React 19 removes: `findDOMNode`, `createFactory`, `ReactDOM.render`, class component `defaultProps` from the types.

### 3d. React Router v7

| Package          | Current | Latest |
| ---------------- | ------- | ------ |
| react-router-dom | 6.30.4  | 7.18.1 |

v7 has breaking changes to the data router API and route configuration. High codebase impact — audit all `<Route>`, `useNavigate`, `loader`, `action` usages.

### 3e. antd 6 ecosystem

| Package             | Current | Latest |
| ------------------- | ------- | ------ |
| antd                | 5.24.3  | 6.5.0  |
| @ant-design/cssinjs | 1.21.1  | 2.1.2  |
| @ant-design/icons   | 5.4.0   | 6.3.2  |

**Prerequisite:** Check @ant-design/pro-components for antd v6 support — pro-components may lag behind.

### 3f. Firebase 12

| Package  | Current | Latest  |
| -------- | ------- | ------- |
| firebase | 10.14.1 | 12.15.0 |

Two major versions ahead. Review both v11 and v12 changelogs before upgrading.

### 3g. AWS Amplify 6

| Package     | Current | Latest |
| ----------- | ------- | ------ |
| aws-amplify | 5.3.29  | 6.18.0 |

v6 uses modular imports (`import { signIn } from 'aws-amplify/auth'`) instead of v5's top-level pattern. High migration effort.

### 3h. GraphQL 17 ecosystem

| Package  | Current | Latest |
| -------- | ------- | ------ |
| graphql  | 16.12.0 | 17.0.2 |
| graphiql | 3.7.2   | 5.2.4  |

Upgrade graphql-js and graphiql together. Verify that @graphql-codegen plugins and @apollo/client support graphql v17 before upgrading.

### 3i. i18next 26

| Package       | Current | Latest |
| ------------- | ------- | ------ |
| i18next       | 25.8.6  | 26.3.4 |
| react-i18next | 15.0.1  | 17.0.8 |

Must upgrade both together. Check `i18n.init()` config and `<Trans>` component props.

### 3j. Storybook 10

| Package                       | Current | Latest |
| ----------------------------- | ------- | ------ |
| storybook                     | 8.6.15  | 10.4.6 |
| @storybook/addon-essentials   | 8.6.15  | 10.4.6 |
| @storybook/addon-interactions | 8.6.15  | 10.4.6 |
| @storybook/addon-links        | 8.6.15  | 10.4.6 |
| @storybook/blocks             | 8.6.15  | 10.4.6 |
| @storybook/react              | 8.6.15  | 10.4.6 |
| @storybook/react-vite         | 8.6.15  | 10.4.6 |
| eslint-plugin-storybook       | 10.2.8  | 10.4.6 |

Use the guided migration CLI: `npx storybook@latest upgrade`

### 3k. react-markdown 10

| Package        | Current | Latest |
| -------------- | ------- | ------ |
| react-markdown | 9.0.1   | 10.1.0 |

Check `rehype`/`remark` plugin API changes. Relatively low blast radius.

---

## Up-to-date (no action needed)

The following packages are already at their latest version:

`@ant-design/colors`, `@ant-design/pro-components`, `@ant-design/pro-layout`, `@ant-design/pro-provider`, `@ant-design/pro-table`, `@emotion/jest`, `@graphql-codegen/cli`, `@graphql-codegen/fragment-matcher`, `@graphql-codegen/introspection`, `@graphql-codegen/near-operation-file-preset`, `@graphql-codegen/typed-document-node`, `@graphql-codegen/typescript`, `@graphql-codegen/typescript-operations`, `@placemarkio/check-geojson`, `@scalar/api-reference-react`, `@storybook/testing-library`, `@testing-library/jest-dom`, `@testing-library/react`, `@testing-library/react-hooks`, `@testing-library/user-event`, `@types/file-saver`, `@types/object-hash`, `@types/papaparse`, `@types/react-router-dom`, `apollo-upload-client`, `axios`, `cesium-mvt-imagery-provider`, `firebaseui`, `formik`, `graphql-sse`, `i18next-browser-languagedetector`, `js-file-download`, `js-md5`, `mini-svg-data-uri`, `object-hash`, `ol`, `prop-types`, `rc-field-form`, `rc-menu`, `rc-table`, `read-env`, `remark-gfm`, `runes2`, `rxjs`, `ts-node`, `vite-plugin-cesium`, `vite-tsconfig-paths`
