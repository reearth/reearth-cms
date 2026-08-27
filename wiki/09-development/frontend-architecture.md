# Frontend Architecture

The Re:Earth CMS frontend (`web/`) is a React 18 + TypeScript single-page application (SPA) built with Vite.

## Directory Structure

```
web/src/
├── auth/                    # Authentication providers (Auth0, Firebase, Cognito)
├── components/
│   ├── atoms/              # Primitive UI components (buttons, inputs, icons)
│   ├── molecules/          # Composite components (form fields, list items)
│   ├── organisms/          # Feature-level components (organized by domain)
│   │   ├── Account/        # User account settings
│   │   ├── CMSWrapper/     # Main app layout, auth, permissions
│   │   ├── Project/        # All project features
│   │   │   ├── Content/   # Item list and editor
│   │   │   ├── Asset/     # Asset management
│   │   │   ├── Schema/    # Schema/field editor
│   │   │   ├── Request/   # Request/review UI
│   │   │   └── ...
│   │   ├── Workspace/      # Workspace management
│   │   └── Settings/       # Settings pages
│   └── pages/              # Route-level page components
├── gql/                    # GraphQL operations
│   ├── queries/           # Query files (*.graphql)
│   ├── fragments/         # Reusable fragments
│   └── __generated__/     # Generated TypeScript types (do not edit)
├── i18n/                  # Translation files
├── state/                 # Global state (Jotai atoms)
└── utils/                 # Utility functions
```

---

## Component Architecture (Atomic Design)

Components follow the **Atomic Design** methodology:

| Level | Location | Description |
|---|---|---|
| **Atoms** | `components/atoms/` | Smallest UI units: Button, Input, Icon, Badge |
| **Molecules** | `components/molecules/` | Composed of atoms: FieldInput, ItemCard, SearchBar |
| **Organisms** | `components/organisms/` | Full feature sections: ContentList, SchemaEditor, AssetViewer |
| **Pages** | `components/pages/` | Route-level components that compose organisms |

---

## GraphQL Client (Apollo)

### Link Chain

The Apollo Client uses a custom link chain:

```
Request
    │
    ▼
ErrorLink         ← catches and formats errors
    │
    ▼
AuthLink          ← attaches Authorization: Bearer <token>
    │
    ▼
Split
    ├── WebSocket (subscriptions)
    └── UploadHttpLink (queries, mutations, file uploads)
```

### Code Generation

GraphQL types are generated from the schema:

```bash
yarn gql
# Reads: server/schemas/gql/*.graphql + web/src/gql/**/*.graphql
# Writes: web/src/gql/__generated__/
```

Always run `yarn gql` after:
- Adding or modifying a `.graphql` operation file
- After the backend schema changes (pull latest and regenerate)

### Usage Pattern

```typescript
// Define the operation in a .graphql file
// web/src/gql/queries/items.graphql
query GetItems($modelId: ID!) {
  items(modelId: $modelId) {
    nodes { id fields { schemaFieldId value } }
  }
}

// Use the generated hook in a component
import { useGetItemsQuery } from "@reearth-cms/gql/__generated__/graphql";

function ItemList({ modelId }: { modelId: string }) {
  const { data, loading } = useGetItemsQuery({ variables: { modelId } });
  // ...
}
```

---

## Authentication

The app supports three auth providers, selected at build/runtime:

```typescript
// web/src/auth/index.ts
const provider = import.meta.env.REEARTH_CMS_AUTH_PROVIDER; // "auth0" | "firebase"

// Auth0 flow:
// 1. User visits app → redirected to Auth0 login page
// 2. Auth0 issues JWT → stored in memory (not localStorage for security)
// 3. JWT attached to every Apollo request via AuthLink
// 4. JWT refreshed automatically before expiry
```

---

## Permission System

Permissions are derived from the user's workspace role and applied in components:

```typescript
// web/src/components/organisms/CMSWrapper/utils.ts
const userRights = userRightsGet(currentRole); // "OWNER" | "MAINTAINER" | "WRITER" | "READER"

// In a component:
{userRights?.content.create && (
  <Button onClick={onCreateItem}>New Item</Button>
)}
```

`null` permission values (WRITER's ownership-dependent permissions) are handled by checking if the current user is the resource creator.

---

## State Management

### Apollo Client Cache

Server data is managed by Apollo Client's normalized cache:
- Entities are normalized by `__typename + id`
- Cache is automatically updated after mutations
- Optimistic updates are used for immediate UI feedback

### Jotai (Global State)

Lightweight global state for UI state that doesn't belong in Apollo:

```typescript
// web/src/state/index.ts
export const currentProjectAtom = atom<string | null>(null);
export const sidebarCollapsedAtom = atom(false);
```

---

## Content Management UI

### Content List (`organisms/Project/Content/`)

- Paginated table with configurable columns
- Bulk operations: Publish, Unpublish, Add to Request, Delete
- View selector (saved views)
- Filter and sort controls
- Search

### Content Editor (`organisms/Project/Content/ContentDetails/`)

- Form with field components mapped by type via `FIELD_TYPE_COMPONENT_MAP`
- Unsaved change detection using `useBlocker` (React Router)
- Version history sidebar
- Comment thread panel
- Publish/unpublish/request actions

---

## Asset Management UI

### Upload Modes

1. **Multipart upload** — for large files, uses presigned S3/GCS URLs for direct browser-to-storage upload
2. **URL import** — enter a URL, server fetches the file

### Viewers

Asset preview uses specialized viewers based on `previewType`:

| Preview Type | Viewer Component |
|---|---|
| `image` | `<img>` tag |
| `image_svg` | SVG renderer |
| `geo` (GeoJSON/KML/CZML) | Cesium 3D globe |
| `geo_3d_tiles` | Cesium with 3D Tiles |
| `geo_mvt` | MVT viewer |
| `model_3d` | glTF viewer |
| `csv` | CSV table |

---

## Build System (Vite)

### Custom Plugins

- **Service worker headers** — adds required headers for service worker registration
- **Runtime config injection** — allows environment variables to be injected at container start time without rebuilding (used by the Docker image with `envsubst`)

### Build Output

```bash
yarn build       # Production build → web/dist/
yarn start       # Development server with HMR
yarn storybook   # Component documentation
```

---

## Testing

### Unit Tests (Vitest)

```bash
yarn test
```

Tests live alongside the components they test (`Component.test.tsx`).

### E2E Tests (Playwright)

```bash
yarn e2e

# Environment variables:
REEARTH_CMS_E2E_BASEURL=http://localhost:3000
REEARTH_CMS_E2E_USERNAME=test@example.com
REEARTH_CMS_E2E_PASSWORD=password
```

E2E tests use the Page Object Model (POM) pattern. Auth state is saved to `.auth/user.json` and reused across tests to avoid re-logging in.

The `@smoke` tag marks critical-path tests for CI.

---

## Internationalization (i18n)

The app uses `i18next` / `react-i18next` for translations:

```typescript
import { useTranslation } from "react-i18next";

function Component() {
  const { t } = useTranslation();
  return <Button>{t("actions.save")}</Button>;
}
```

Translation files are in `web/src/i18n/`. Currently, English and Japanese are supported.
