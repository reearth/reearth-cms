# Testing

Re:Earth CMS has a three-layer testing strategy: server unit tests, server integration/E2E tests, and frontend E2E tests.

## Backend Testing

### Unit Tests

Unit tests test domain logic in isolation. They live alongside the code they test (e.g. `item_test.go` next to `item.go`).

**Conventions:**
- Always call `t.Parallel()` at the start of every test function and subtest
- Use table-driven tests for multiple test cases
- Capture loop variables with `tt := tt` before spawning subtests

```go
func TestItem_UpdateFields(t *testing.T) {
    t.Parallel()

    tests := []struct {
        name    string
        fields  []*item.Field
        wantErr bool
    }{
        { name: "valid update", fields: []*item.Field{...}, wantErr: false },
        { name: "nil fields", fields: nil, wantErr: false },
    }

    for _, tt := range tests {
        tt := tt // capture
        t.Run(tt.name, func(t *testing.T) {
            t.Parallel()

            i := buildTestItem()
            err := i.UpdateFields(tt.fields)

            if tt.wantErr {
                assert.Error(t, err)
            } else {
                assert.NoError(t, err)
            }
        })
    }
}
```

**Running unit tests:**
```bash
cd server
go test ./pkg/...
go test ./internal/usecase/...
```

### Integration Tests (E2E)

Full-stack tests that exercise the HTTP API with a real MongoDB database. Located in `server/e2e/`.

**Setup:**
```go
// e2e/setup.go
func StartServer(t *testing.T) *httpexpect.Expect {
    // Starts a full Echo server with all middleware
    // Uses a real MongoDB test database
    // Returns an httpexpect client for fluent assertions
}
```

**Example:**
```go
// e2e/gql_item_test.go
func TestCreateItem(t *testing.T) {
    e := StartGQLServer(t)

    e.POST("/api/graphql").
        WithJSON(map[string]any{
            "query": `mutation { createItem(input: { ... }) { item { id } } }`,
        }).
        Expect().
        Status(http.StatusOK).
        JSON().Object().
        Path("$.data.createItem.item.id").NotNull()
}
```

**Test helpers:**
- `baseSeeder` — creates consistent test data (workspace, project, model, schema) before each test
- `util.MockNow` — deterministic timestamps for time-sensitive tests
- In-memory repository implementations for fast unit tests without MongoDB

**Running E2E tests:**
```bash
cd server
go test ./e2e/...
# Requires: MongoDB running (docker compose up reearth-cms-mongo -d)
```

**Full test suite with race detector:**
```bash
make test
```

### Public API Tests

The public API tests specifically verify that:
- Unauthenticated requests to private resources return `404` (not `401`)
- Authenticated requests work correctly
- Published items are accessible; draft items are not

```go
func TestPublicAPIPrivateResource(t *testing.T) {
    e := StartPublicAPIServer(t)
    // Private project: expect 404, not 401
    e.GET("/{ws}/projects/{proj}/models/{model}/items").
        Expect().Status(http.StatusNotFound)
}
```

---

## Frontend Testing

### Unit Tests (Vitest)

Component and utility tests using Vitest + React Testing Library.

```bash
cd web
yarn test              # Run all tests
yarn test --watch      # Watch mode
yarn test --coverage   # With coverage report
```

### E2E Tests (Playwright)

Full browser tests exercising the complete UI flow.

```bash
cd web
yarn e2e               # Run all E2E tests
yarn e2e --headed     # Run with visible browser
yarn e2e --project=chromium  # Specific browser
```

**Required environment variables:**
```bash
REEARTH_CMS_E2E_BASEURL=http://localhost:3000
REEARTH_CMS_E2E_USERNAME=test@example.com
REEARTH_CMS_E2E_PASSWORD=password
```

**Page Object Model (POM):**

Tests use POM for maintainable selectors:

```typescript
// e2e/pages/ItemsPage.ts
export class ItemsPage {
    constructor(private page: Page) {}

    async createItem() {
        await this.page.click('[data-testid="new-item-button"]');
    }

    async getItemCount() {
        return await this.page.locator('[data-testid="item-row"]').count();
    }
}
```

**Auth State Reuse:**

A `setup` project saves the auth state to `.auth/user.json` once. All other tests load this session, avoiding repeated logins:

```typescript
// playwright.config.ts
{
    name: 'setup',
    testMatch: /auth.setup.ts/,
},
{
    name: 'chromium',
    use: { storageState: '.auth/user.json' },
    dependencies: ['setup'],
}
```

**Smoke Tests:**

Tests tagged with `@smoke` are the critical path subset that runs on every CI build:

```typescript
test("@smoke create and publish an item", async ({ page }) => {
    // ...
});
```

**IAP Authentication (for CI):**

When running against a Cloud Run service protected by Identity-Aware Proxy (IAP), the test setup generates an OIDC token automatically using the configured `IAP_AUTH_METHOD`.

---

## Test Coverage

```bash
# Backend coverage
cd server
go test -cover ./...
go test -coverprofile=coverage.out ./...
go tool cover -html=coverage.out

# Frontend coverage
cd web
yarn test --coverage
```

Coverage reports are uploaded to Codecov on every CI run.

---

## Testing Best Practices

### Backend

1. **Always parallel** — `t.Parallel()` in every test and subtest
2. **Table-driven** — multiple cases in a single test function
3. **Isolated data** — each test creates its own test fixtures
4. **Use in-memory repos for unit tests** — avoid MongoDB for pure unit tests
5. **Use E2E for integration concerns** — test full API flows with real MongoDB

### Frontend

1. **Test behavior, not implementation** — test what users see and do, not internal state
2. **Use `data-testid` attributes** — stable selectors that don't break on CSS changes
3. **Mock external dependencies** — mock API calls in unit tests; use real API in E2E
4. **@smoke for CI** — keep the smoke suite fast (under 2 minutes)
