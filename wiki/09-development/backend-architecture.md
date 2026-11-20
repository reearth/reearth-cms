# Backend Architecture

The Re:Earth CMS backend (`server/`) follows **Clean Architecture** principles. This page provides a deep-dive into the structure, patterns, and conventions used.

## Directory Structure

```
server/
├── cmd/
│   └── reearth-cms/          # Application entry point (main.go)
├── internal/
│   ├── adapter/              # Interface adapters (GraphQL, REST, gRPC)
│   │   ├── gql/             # GraphQL resolvers and model converters
│   │   ├── publicapi/       # REST API handlers (from OpenAPI spec)
│   │   ├── internalapi/     # gRPC internal API handlers
│   │   └── http/            # HTTP middleware, auth
│   ├── app/                 # Application bootstrap and configuration
│   ├── infrastructure/       # External service implementations
│   │   ├── mongo/           # MongoDB repository implementations
│   │   ├── fs/              # Local filesystem storage
│   │   ├── gcs/             # Google Cloud Storage
│   │   ├── s3/              # AWS S3 storage
│   │   └── memory/          # In-memory (for tests)
│   └── usecase/
│       ├── interactor/      # Use case implementations
│       ├── interfaces/      # Use case port definitions
│       ├── repo/            # Repository interfaces
│       └── gateway/         # External service interfaces
├── pkg/                     # Domain layer (business entities)
│   ├── item/               # Content item domain
│   ├── schema/             # Schema/field domain
│   ├── asset/              # Asset domain
│   ├── model/              # Model domain
│   ├── project/            # Project domain
│   ├── request/            # Request/review domain
│   ├── integration/        # Integration domain
│   ├── thread/             # Comment thread domain
│   ├── value/              # Field value types
│   ├── version/            # Versioning domain
│   ├── id/                 # Type-safe ID generation
│   ├── operator/           # Operator type
│   └── ...                 # Other domain packages
├── schemas/
│   ├── gql/               # GraphQL schema definitions (*.graphql)
│   └── integration/       # OpenAPI spec (integration.yml)
└── e2e/                   # End-to-end tests
```

---

## Dependency Rule

Dependencies point **inward only**:

```
adapter → usecase → domain (pkg)
infrastructure → usecase → domain (pkg)
```

**Never:**
- `pkg` depending on `internal/`
- `usecase` depending on `adapter`
- `domain` depending on infrastructure

---

## Domain Layer (`pkg/`)

The innermost layer. Contains pure Go structs and methods with no external dependencies.

### Entity Pattern

```go
// pkg/item/item.go
type Item struct {
    id      ID
    schema  SchemaID
    model   ModelID
    project ProjectID
    fields  []*Field
    // ...
}

// Access via methods only — no public fields
func (i *Item) ID() ID       { return i.id }
func (i *Item) Fields() Fields { return slices.Clone(i.fields) }

// Business logic lives here
func (i *Item) UpdateFields(fields []*Field) {
    // validation and logic
    i.fields = merge(i.fields, fields)
    i.timestamp = util.Now()
}
```

### Builder Pattern

Domain objects are created via builders to enforce validation:

```go
// pkg/item/builder.go
type Builder struct { /* ... */ }

func New() *Builder { return &Builder{} }

func (b *Builder) ID(id ID) *Builder       { b.i.id = id; return b }
func (b *Builder) Schema(s SchemaID) *Builder { b.i.schema = s; return b }
// ...

func (b *Builder) Build() (*Item, error) {
    if b.i.id.IsNil() {
        return nil, errors.New("id is required")
    }
    // more validation...
    return b.i, nil
}
```

### Value Types (`pkg/value/`)

All field values are type-safe:

```go
const TypeText Type = "text"
const TypeInteger Type = "integer"
const TypeGeometryObject Type = "geometryObject"
// ... 19 types total

type Value struct {
    t Type
    v any
}

// Type-safe access
func (v *Value) ValueText() (string, bool)    { ... }
func (v *Value) ValueInteger() (int64, bool)  { ... }
```

---

## Use Case Layer (`internal/usecase/`)

### Interactors

Interactors implement use cases by orchestrating domain objects and repositories:

```go
// internal/usecase/interactor/item.go
type Item struct {
    repos    *repo.Container
    gateways *gateway.Container
    event    *eventPublisher
}

func (i *Item) Create(ctx context.Context, param interfaces.CreateItemParam, op *usecase.Operator) (item.Versioned, error) {
    return Run1(ctx, op, i.repos, Usecase().Transaction(), func(ctx context.Context) (item.Versioned, error) {
        // 1. Check permissions (via Usecase builder or explicit check)
        if !op.IsWritableProject(param.ProjectID) {
            return nil, rerror.ErrPermissionDenied
        }

        // 2. Load dependencies
        m, err := i.repos.Model.FindByID(ctx, param.ModelID)
        s, err := i.repos.Schema.FindByID(ctx, m.Schema())

        // 3. Build domain object
        it, err := item.New().
            NewID().
            Schema(s.ID()).
            Model(m.ID()).
            Project(param.ProjectID).
            Fields(fields).
            Build()

        // 4. Save via repository (within transaction)
        if err := i.repos.Item.Save(ctx, it); err != nil {
            return nil, err
        }

        // 5. Return (all within same transaction)
        return i.repos.Item.FindByID(ctx, it.ID(), nil)
    })
}
```

### Transaction Helpers

The `Run1`, `Run2`, `Run3` helper functions provide:
- Type-safe return values (using Go generics)
- Automatic transaction management (commit on success, rollback on error)
- Permission checks before execution
- Configurable retry logic (default: 2 retries)

```go
// Returns 1 value
Run1[A](ctx, op, repos, Usecase().Transaction(), func(ctx) (A, error))

// Returns 2 values
Run2[A, B](ctx, op, repos, Usecase().Transaction(), func(ctx) (A, B, error))

// With permission check
Run1(ctx, op, repos, Usecase().WithWritableWorkspaces(wsID).Transaction(), func(ctx) ...)
```

### Repository Interfaces

```go
// internal/usecase/repo/item.go
type Item interface {
    FindByID(ctx context.Context, id item.ID, ref *version.Ref) (item.Versioned, error)
    FindByIDs(ctx context.Context, ids item.IDList) (item.VersionedList, error)
    FindByModel(ctx context.Context, modelID model.ID, sort *usecasex.Sort, filter *repo.ItemFilter, pagination *usecasex.Pagination) (item.VersionedList, *usecasex.PageBasedInfo, error)
    Save(ctx context.Context, item *item.Item) error
    Remove(ctx context.Context, id item.ID) error
    // ...
}
```

---

## Adapter Layer (`internal/adapter/gql/`)

### GraphQL Resolvers

Each GraphQL type gets a resolver file:

```go
// internal/adapter/gql/resolver_item.go
func (r *mutationResolver) CreateItem(ctx context.Context, input gqlmodel.CreateItemInput) (*gqlmodel.ItemPayload, error) {
    // 1. Convert GraphQL input to use case param
    param, err := gqlmodel.ToCreateItemParam(input)

    // 2. Call use case
    item, err := r.usecases.Item.Create(ctx, *param, getOperator(ctx))

    // 3. Convert domain result to GraphQL model
    return &gqlmodel.ItemPayload{
        Item: gqlmodel.ToVersionedItem(item),
    }, nil
}
```

### Model Conversion

Conversion between domain and GraphQL models lives in `gqlmodel/convert_*.go`:

```go
// internal/adapter/gql/gqlmodel/convert_item.go
func ToVersionedItem(v item.Versioned) *Item {
    return &Item{
        ID:        IDFrom(v.Value().ID()),
        Fields:    ToItemFields(v.Value().Fields()),
        Status:    ToItemStatus(v),
        CreatedAt: v.Value().Timestamp(),
    }
}
```

### DataLoader

N+1 query prevention uses DataLoader for batch loading related entities:

```go
// When fetching 100 items with references, DataLoader batches the reference lookups
// into a single query instead of 100 individual queries
```

---

## Infrastructure Layer (`internal/infrastructure/mongo/`)

MongoDB repositories implement the repo interfaces:

```go
// internal/infrastructure/mongo/item.go
type Item struct {
    client *mongox.Client
}

func (r *Item) FindByID(ctx context.Context, id item.ID, ref *version.Ref) (item.Versioned, error) {
    c := mongogit.New(r.client.WithCollection("item"), r.options)
    var doc itemDocument
    if err := c.FindOne(ctx, bson.M{"id": id.String()}, ref, &doc); err != nil {
        return nil, rerror.ErrNotFound
    }
    return doc.Model(), nil
}
```

### Versioning with mongogit

The `mongogit` package provides Git-like versioning on top of MongoDB:

```
Document in MongoDB:
{
    "id": "item-id",
    "version": "v2",
    "parents": ["v1"],
    "refs": ["latest", "public"],  // "public" = published version
    "fields": [...]
}
```

---

## Adding a New Feature (Step-by-Step)

### 1. Define the domain entity (`pkg/`)

```go
// pkg/myfeature/myfeature.go
package myfeature
type MyFeature struct { id ID; name string }
```

### 2. Define repository interface (`internal/usecase/repo/`)

```go
type MyFeature interface {
    FindByID(ctx context.Context, id myfeature.ID) (*myfeature.MyFeature, error)
    Save(ctx context.Context, f *myfeature.MyFeature) error
}
```

### 3. Implement use case (`internal/usecase/interactor/`)

```go
func (i *MyFeature) Create(ctx context.Context, name string, op *usecase.Operator) (*myfeature.MyFeature, error) {
    return Run1(ctx, op, i.repos, Usecase().Transaction(), func(ctx context.Context) (*myfeature.MyFeature, error) {
        f, err := myfeature.New(myfeature.NewID(), name)
        if err != nil { return nil, err }
        return f, i.repos.MyFeature.Save(ctx, f)
    })
}
```

### 4. Implement MongoDB repository (`internal/infrastructure/mongo/`)

### 5. Add GraphQL schema (`schemas/gql/myfeature.graphql`)

### 6. Implement resolver (`internal/adapter/gql/resolver_myfeature.go`)

### 7. Run `go generate ./...`
