# Server Architecture - Clean Architecture Pattern

This document describes the structure and patterns used in the Reearth CMS backend server implementation.

## 📁 Directory Structure

```
server/
├── cmd/                    # Application entry points
│   └── reearth-cms/       # Main application binary
├── internal/              # Private application code
│   ├── adapter/           # Interface adapters (Controllers, Presenters)
│   │   ├── gql/          # GraphQL API layer (99designs/gqlgen)
│   │   ├── http/         # HTTP handlers
│   │   ├── integration/  # External integration adapters
│   │   ├── internalapi/  # Internal API endpoints
│   │   └── publicapi/    # Public API endpoints
│   ├── app/              # Application configuration and setup
│   ├── infrastructure/   # External interfaces implementation
│   │   ├── mongo/        # MongoDB repositories
│   │   ├── fs/           # File system operations
│   │   ├── gcs/          # Google Cloud Storage
│   │   ├── s3/           # AWS S3
│   │   └── memory/       # In-memory implementations (testing)
│   └── usecase/          # Business logic layer
│       ├── gateway/      # External service interfaces
│       ├── interactor/   # Use case implementations
│       ├── interfaces/   # Port definitions
│       └── repo/         # Repository interfaces
├── pkg/                   # Public packages (Domain layer)
│   ├── asset/            # Asset management domain
│   ├── event/            # Event system
│   ├── group/            # Group management
│   ├── id/               # ID generation and validation
│   ├── integration/      # Integration domain
│   ├── item/             # Content item domain
│   ├── model/            # Data model domain
│   ├── project/          # Project domain
│   ├── request/          # Request domain
│   ├── schema/           # Schema definition domain
│   ├── thread/           # Comment thread domain
│   ├── value/            # Value objects
│   ├── version/          # Versioning domain
│   └── workspacesettings/ # Workspace settings domain
├── schemas/              # GraphQL schema definitions
├── e2e/                  # End-to-end tests
├── go.mod                # Go module definition
├── gqlgen.yml            # GraphQL code generation config
└── tools.go              # Development tool dependencies
```

## 🏗️ Clean Architecture Pattern

This project follows **Clean Architecture** principles, organizing code into distinct layers with clear dependency rules.

### Architecture Layers

```
┌─────────────────────────────────────────────────────────┐
│                    Frameworks & Drivers                  │
│  (GraphQL, HTTP, MongoDB, S3, GCS)                      │
│                  internal/adapter/                       │
│                  internal/infrastructure/                │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│              Interface Adapters (Controllers)            │
│  (Convert data between use cases and external format)   │
│                  internal/adapter/gql/                   │
│                  internal/adapter/publicapi/             │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                 Application Business Rules               │
│  (Use cases, application-specific logic)                │
│                  internal/usecase/                       │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│              Enterprise Business Rules (Entities)        │
│  (Domain models, business logic)                        │
│                       pkg/                               │
└─────────────────────────────────────────────────────────┘
```

### Dependency Rule

**Dependencies point inward**: Outer layers depend on inner layers, never the reverse.

- ✅ `internal/adapter` → `internal/usecase` → `pkg`
- ❌ `pkg` → `internal/usecase` (NEVER)
- ❌ `internal/usecase` → `internal/adapter` (NEVER)

## 🎯 Layer Responsibilities

### 1. **Domain Layer** (`pkg/`)

The innermost layer containing enterprise business rules and domain models.

**Characteristics:**
- Pure Go code with minimal external dependencies
- Contains entities, value objects, and domain services
- No knowledge of databases, APIs, or frameworks
- Highly testable and reusable

**Example Structure:**

```go
// pkg/item/item.go
package item

type Item struct {
    id          ID
    schemaID    schema.ID
    fields      []*Field
    metadata    *Metadata
    version     version.Version
    // ... domain logic methods
}

func (i *Item) UpdateField(fieldID FieldID, value *value.Value) error {
    // Business rule validation
    // Domain logic
}
```

**Key Packages:**
- `pkg/id` - Type-safe ID generation
- `pkg/value` - Value objects for different field types
- `pkg/schema` - Schema definition and validation
- `pkg/item` - Content item domain model
- `pkg/asset` - Asset management domain

### 2. **Use Case Layer** (`internal/usecase/`)

Application-specific business rules and orchestration.

**Components:**

#### **Interactors** (`internal/usecase/interactor/`)

Implement use cases by orchestrating domain objects and repositories.

```go
// internal/usecase/interactor/item.go
type Item struct {
    repos    *repo.Container
    gateways *gateway.Container
}

func (i *Item) Create(ctx context.Context, input CreateInput, operator *usecase.Operator) (*item.Item, error) {
    // 1. Validate permissions
    // 2. Fetch dependencies (schema, project)
    // 3. Create domain object
    // 4. Persist via repository
    // 5. Publish events
}
```

#### **Repository Interfaces** (`internal/usecase/repo/`)

Define contracts for data persistence (ports).

```go
// internal/usecase/repo/item.go
type Item interface {
    FindByID(context.Context, item.ID) (*item.Item, error)
    Save(context.Context, *item.Item) error
    Remove(context.Context, item.ID) error
    FindBySchema(context.Context, schema.ID, *Pagination) ([]*item.Item, error)
}
```

#### **Gateway Interfaces** (`internal/usecase/gateway/`)

Define contracts for external services.

```go
// internal/usecase/gateway/file.go
type File interface {
    UploadAsset(context.Context, *UploadAssetInput) (*asset.Asset, error)
    DeleteAsset(context.Context, asset.ID) error
}
```

### 3. **Adapter Layer** (`internal/adapter/`)

Converts data between external formats and use case formats.

#### **GraphQL Adapter** (`internal/adapter/gql/`)

Implements GraphQL API using [gqlgen](https://gqlgen.com/).

**Structure:**
```
internal/adapter/gql/
├── gqlmodel/              # GraphQL model definitions
│   ├── convert_*.go      # Conversion between domain and GraphQL models
│   └── models_gen.go     # Generated GraphQL types
├── resolver/             # GraphQL resolvers
│   ├── item.go          # Item queries and mutations
│   ├── schema.go        # Schema queries and mutations
│   └── ...
├── loader/              # DataLoader for N+1 query prevention
└── schema.graphql       # GraphQL schema definition
```

**Example Resolver:**

```go
// internal/adapter/gql/resolver/item.go
func (r *mutationResolver) CreateItem(ctx context.Context, input gqlmodel.CreateItemInput) (*gqlmodel.ItemPayload, error) {
    // 1. Convert GraphQL input to use case input
    usecaseInput := gqlmodel.ToCreateItemInput(input)
    
    // 2. Call use case
    item, err := r.usecases.Item.Create(ctx, usecaseInput, getOperator(ctx))
    if err != nil {
        return nil, err
    }
    
    // 3. Convert domain model to GraphQL model
    return &gqlmodel.ItemPayload{
        Item: gqlmodel.ToItem(item),
    }, nil
}
```

#### **Public API Adapter** (`internal/adapter/publicapi/`)

RESTful API using OpenAPI specification and [oapi-codegen](https://github.com/oapi-codegen/oapi-codegen).

### 4. **Infrastructure Layer** (`internal/infrastructure/`)

Implements repository and gateway interfaces with concrete technologies.

#### **MongoDB Repository** (`internal/infrastructure/mongo/`)

```go
// internal/infrastructure/mongo/item.go
type Item struct {
    client *mongox.Client
}

func (r *Item) FindByID(ctx context.Context, id item.ID) (*item.Item, error) {
    // MongoDB-specific implementation
    var doc itemDocument
    if err := r.client.FindOne(ctx, bson.M{"id": id.String()}).Decode(&doc); err != nil {
        return nil, err
    }
    return doc.Model()
}
```

#### **File Storage** (`internal/infrastructure/fs/`, `gcs/`, `s3/`)

Implements file upload/download for different storage backends.

## 🔧 Key Components

### GraphQL Code Generation

Uses [gqlgen](https://gqlgen.com/) for type-safe GraphQL server implementation.

**Configuration:** `gqlgen.yml`

```yaml
schema:
  - schemas/*.graphql
exec:
  filename: internal/adapter/gql/generated.go
model:
  filename: internal/adapter/gql/gqlmodel/models_gen.go
resolver:
  filename: internal/adapter/gql/resolver/resolver.go
```

**Generate Code:**

```bash
go generate ./...
# or
make gql
```

### Dependency Injection

Uses manual dependency injection through container structs.

```go
// internal/app/app.go
type App struct {
    usecases  *UsecaseContainer
    repos     *RepoContainer
    gateways  *GatewayContainer
}

func NewApp(config *Config) (*App, error) {
    // Initialize infrastructure
    repos := initRepos(config)
    gateways := initGateways(config)
    
    // Initialize use cases
    usecases := initUsecases(repos, gateways)
    
    return &App{
        usecases:  usecases,
        repos:     repos,
        gateways:  gateways,
    }
}
```

### Testing Strategy

#### **Unit Tests**

Test domain logic in isolation using **table-driven tests** and **`t.Parallel()`** for efficiency.

**Best Practices:**
- ✅ Use table-driven tests for multiple test cases
- ✅ Always call `t.Parallel()` to run tests concurrently
- ✅ Use subtests with `t.Run()` for better organization
- ✅ Isolate test data to avoid race conditions

**Example: Table-Driven Test with Parallel Execution**

```go
// pkg/item/item_test.go
func TestItem_UpdateField(t *testing.T) {
    t.Parallel() // Enable parallel execution for this test

    tests := []struct {
        name      string
        fieldID   FieldID
        value     *value.Value
        wantErr   bool
        errMsg    string
    }{
        {
            name:    "valid text field update",
            fieldID: NewFieldID(),
            value:   value.TypeText.Value("test value"),
            wantErr: false,
        },
        {
            name:    "valid number field update",
            fieldID: NewFieldID(),
            value:   value.TypeNumber.Value(42),
            wantErr: false,
        },
        {
            name:    "nil value should fail",
            fieldID: NewFieldID(),
            value:   nil,
            wantErr: true,
            errMsg:  "value cannot be nil",
        },
        {
            name:    "invalid field ID should fail",
            fieldID: FieldID{},
            value:   value.TypeText.Value("test"),
            wantErr: true,
            errMsg:  "field not found",
        },
    }

    for _, tt := range tests {
        tt := tt // Capture range variable for parallel execution
        t.Run(tt.name, func(t *testing.T) {
            t.Parallel() // Run each subtest in parallel

            // Arrange: Create fresh test data for each subtest
            item := NewItem(NewID(), NewSchemaID())
            if tt.fieldID.IsValid() {
                item.AddField(tt.fieldID, value.TypeText)
            }

            // Act
            err := item.UpdateField(tt.fieldID, tt.value)

            // Assert
            if tt.wantErr {
                assert.Error(t, err)
                if tt.errMsg != "" {
                    assert.Contains(t, err.Error(), tt.errMsg)
                }
            } else {
                assert.NoError(t, err)
                assert.Equal(t, tt.value, item.Field(tt.fieldID).Value())
            }
        })
    }
}
```

**Example: Testing Multiple Methods**

```go
// pkg/schema/field_test.go
func TestField_Validate(t *testing.T) {
    t.Parallel()

    tests := []struct {
        name    string
        field   *Field
        value   *value.Value
        wantErr bool
    }{
        {
            name:    "required field with value",
            field:   NewField(NewFieldID(), "name", value.TypeText, true),
            value:   value.TypeText.Value("John"),
            wantErr: false,
        },
        {
            name:    "required field without value",
            field:   NewField(NewFieldID(), "name", value.TypeText, true),
            value:   nil,
            wantErr: true,
        },
        {
            name:    "optional field without value",
            field:   NewField(NewFieldID(), "nickname", value.TypeText, false),
            value:   nil,
            wantErr: false,
        },
        {
            name:    "number field with text value",
            field:   NewField(NewFieldID(), "age", value.TypeNumber, true),
            value:   value.TypeText.Value("not a number"),
            wantErr: true,
        },
    }

    for _, tt := range tests {
        tt := tt
        t.Run(tt.name, func(t *testing.T) {
            t.Parallel()

            err := tt.field.Validate(tt.value)

            if tt.wantErr {
                assert.Error(t, err)
            } else {
                assert.NoError(t, err)
            }
        })
    }
}
```

#### **Integration Tests**

Test use cases with mock repositories.

```go
// internal/usecase/interactor/item_test.go
func TestItem_Create(t *testing.T) {
    repos := &repo.Container{
        Item: &mockItemRepo{},
        Schema: &mockSchemaRepo{},
    }
    
    interactor := NewItem(repos, nil)
    item, err := interactor.Create(ctx, input, operator)
    
    assert.NoError(t, err)
    assert.NotNil(t, item)
}
```

#### **E2E Tests**

Test complete flows through GraphQL API.

```go
// e2e/gql_item_test.go
func TestCreateItem(t *testing.T) {
    e := StartGQLServer(t)
    
    e.POST("/graphql").
        WithJSON(map[string]interface{}{
            "query": `mutation { createItem(...) { id } }`,
        }).
        Expect().
        Status(http.StatusOK).
        JSON().Object().
        Value("data").Object().
        Value("createItem").Object().
        Value("id").NotNull()
}
```

### Mock Generation

Uses [gomock](https://github.com/golang/mock/mockgen) for generating mocks.

```bash
go generate ./...
# Generates mocks for interfaces in internal/usecase/repo/
```

## 📝 Development Workflow

### 1. **Adding a New Feature**

Follow this order to maintain clean architecture:

#### Step 1: Define Domain Model (`pkg/`)

```go
// pkg/myfeature/myfeature.go
package myfeature

type MyFeature struct {
    id   ID
    name string
}

func New(id ID, name string) (*MyFeature, error) {
    // Validation and business rules
    if name == "" {
        return nil, errors.New("name is required")
    }
    return &MyFeature{id: id, name: name}, nil
}
```

#### Step 2: Define Repository Interface (`internal/usecase/repo/`)

```go
// internal/usecase/repo/myfeature.go
package repo

type MyFeature interface {
    FindByID(context.Context, myfeature.ID) (*myfeature.MyFeature, error)
    Save(context.Context, *myfeature.MyFeature) error
}
```

#### Step 3: Implement Use Case (`internal/usecase/interactor/`)

```go
// internal/usecase/interactor/myfeature.go
package interactor

type MyFeature struct {
    repos *repo.Container
}

func (i *MyFeature) Create(ctx context.Context, name string) (*myfeature.MyFeature, error) {
    // Use case logic
    feature, err := myfeature.New(myfeature.NewID(), name)
    if err != nil {
        return nil, err
    }
    
    if err := i.repos.MyFeature.Save(ctx, feature); err != nil {
        return nil, err
    }
    
    return feature, nil
}
```

#### Step 4: Implement Repository (`internal/infrastructure/mongo/`)

```go
// internal/infrastructure/mongo/myfeature.go
package mongo

type MyFeature struct {
    client *mongox.Client
}

func (r *MyFeature) Save(ctx context.Context, feature *myfeature.MyFeature) error {
    doc := toMyFeatureDocument(feature)
    _, err := r.client.Collection("myfeatures").InsertOne(ctx, doc)
    return err
}
```

#### Step 5: Add GraphQL Schema (`schemas/`)

```graphql
# schemas/myfeature.graphql
type MyFeature {
  id: ID!
  name: String!
}

extend type Mutation {
  createMyFeature(name: String!): MyFeaturePayload
}

type MyFeaturePayload {
  myFeature: MyFeature!
}
```

#### Step 6: Implement GraphQL Resolver (`internal/adapter/gql/`)

```go
// internal/adapter/gql/resolver/myfeature.go
func (r *mutationResolver) CreateMyFeature(ctx context.Context, name string) (*gqlmodel.MyFeaturePayload, error) {
    feature, err := r.usecases.MyFeature.Create(ctx, name)
    if err != nil {
        return nil, err
    }
    
    return &gqlmodel.MyFeaturePayload{
        MyFeature: gqlmodel.ToMyFeature(feature),
    }, nil
}
```

#### Step 7: Generate Code

```bash
go generate ./...
```

### 2. **Running the Server**

#### Development Mode

```bash
# Set environment variables
cp .env.example .env
# Edit .env with your configuration

# Run server
make run-app
```

#### Using Docker

```bash
docker-compose up
```

### 3. **Running Tests**

```bash
# with make including race test
make test

# All tests
go test ./...

# Specific package
go test ./pkg/item/...

# With coverage
go test -cover ./...

# E2E tests
go test ./e2e/...
```

## 🔗 Import Paths

Always use full import paths from the module root:

```go
// ✅ Correct
import (
    "github.com/reearth/reearth-cms/server/pkg/item"
    "github.com/reearth/reearth-cms/server/internal/usecase/repo"
    "github.com/reearth/reearth-cms/server/internal/adapter/gql/gqlmodel"
)

// ❌ Incorrect (relative imports)
import (
    "../pkg/item"
    "../../usecase/repo"
)
```

## 🛡️ Best Practices

### 1. **Respect Layer Boundaries**

```go
// ❌ Bad - Domain depends on infrastructure
package item
import "go.mongodb.org/mongo-driver/bson"

// ✅ Good - Domain is independent
package item
// No infrastructure imports
```

### 2. **Use Interfaces for Dependencies**

```go
// ✅ Good - Depend on abstractions
type ItemInteractor struct {
    repo repo.Item  // Interface
}

// ❌ Bad - Depend on concrete implementations
type ItemInteractor struct {
    repo *mongo.ItemRepo  // Concrete type
}
```

### 3. **Keep Domain Logic in Domain Layer**

```go
// ❌ Bad - Business logic in use case
func (i *Item) Create(ctx context.Context, name string) error {
    if name == "" {
        return errors.New("name required")
    }
    // ...
}

// ✅ Good - Business logic in domain
func (i *Item) Create(ctx context.Context, name string) error {
    item, err := item.New(name)  // Validation in domain
    if err != nil {
        return err
    }
    // ...
}
```

### 4. **Use Value Objects**

```go
// ✅ Good - Type-safe IDs
type ID struct {
    value string
}

func (id ID) String() string {
    return id.value
}

// ❌ Bad - Primitive obsession
type Item struct {
    ID string  // Easy to mix up with other string IDs
}
```

### 5. **Error Handling**

Use custom error types for domain errors:

```go
// pkg/item/error.go
type ErrNotFound struct {
    ID ID
}

func (e *ErrNotFound) Error() string {
    return fmt.Sprintf("item not found: %s", e.ID)
}

// Usage
if item == nil {
    return nil, &item.ErrNotFound{ID: id}
}
```

## 📚 Key Technologies

- **Language:** Go 1.25+
- **GraphQL:** [gqlgen](https://gqlgen.com/) - Type-safe GraphQL server
- **Database:** MongoDB with [mongo-driver](https://github.com/mongodb/mongo-go-driver)
- **HTTP Framework:** [Echo](https://echo.labstack.com/)
- **OpenAPI:** [oapi-codegen](https://github.com/oapi-codegen/oapi-codegen)
- **Testing:** [testify](https://github.com/stretchr/testify), [gomock](https://github.com/golang/mock)
- **Storage:** AWS S3, Google Cloud Storage
- **Observability:** OpenTelemetry

## 🔄 Code Generation

The project uses code generation for:

1. **GraphQL** (`gqlgen`)
   - Generates resolvers, models, and type-safe API

2. **OpenAPI** (`oapi-codegen`)
   - Generates HTTP handlers from OpenAPI specs

3. **Mocks** (`mockgen`)
   - Generates test mocks for interfaces

**Trigger generation:**

```bash
go generate ./...
```

Or use the Makefile:

```bash
make generate
```

## 📊 Project Statistics

- **Domain Packages:** 21 (in `pkg/`)
- **Use Case Interactors:** ~15 (in `internal/usecase/interactor/`)
- **GraphQL Resolvers:** ~30 (in `internal/adapter/gql/resolver/`)
- **Repository Implementations:** MongoDB, In-Memory
- **Storage Backends:** S3, GCS, Local Filesystem

## 🔍 Common Patterns

### Repository Pattern

Abstracts data access behind interfaces.

```go
// Interface (port)
type ItemRepo interface {
    FindByID(context.Context, item.ID) (*item.Item, error)
}

// Implementation (adapter)
type mongoItemRepo struct {
    client *mongo.Client
}
```

### Unit of Work Pattern

Transactions across multiple repositories using the `Run1`, `Run2`, `Run3` helper functions.

**Transaction Helpers** (`internal/usecase/interactor/usecase.go`):

```go
// Run1 executes a use case function that returns 1 value
func Run1[A any](ctx context.Context, op *usecase.Operator, r *repo.Container, e *uc, f func(context.Context) (A, error)) (a A, err error)

// Run2 executes a use case function that returns 2 values
func Run2[A, B any](ctx context.Context, op *usecase.Operator, r *repo.Container, e *uc, f func(context.Context) (A, B, error)) (a A, b B, err error)

// Run3 executes a use case function that returns 3 values
func Run3[A, B, C any](ctx context.Context, op *usecase.Operator, r *repo.Container, e *uc, f func(context.Context) (A, B, C, error)) (a A, b B, c C, err error)
```

**Usage Pattern:**

```go
// internal/usecase/interactor/item.go
func (i *Item) Create(ctx context.Context, param interfaces.CreateItemParam, operator *usecase.Operator) (item.Versioned, error) {
    return Run1(ctx, operator, i.repos, Usecase().Transaction(), func(ctx context.Context) (item.Versioned, error) {
        // 1. Fetch dependencies
        m, err := i.repos.Model.FindByID(ctx, param.ModelID)
        if err != nil {
            return nil, err
        }

        s, err := i.repos.Schema.FindByID(ctx, param.SchemaID)
        if err != nil {
            return nil, err
        }

        // 2. Create domain object
        it, err := item.New().
            NewID().
            Schema(s.ID()).
            Model(m.ID()).
            Fields(fields).
            Build()
        if err != nil {
            return nil, err
        }

        // 3. Save to repository (within transaction)
        if err := i.repos.Item.Save(ctx, it); err != nil {
            return nil, err
        }

        // 4. Update related entities (all within same transaction)
        if mi != nil {
            mi.Value().SetOriginalItem(it.ID())
            if err := i.repos.Item.Save(ctx, mi.Value()); err != nil {
                return nil, err
            }
        }

        // All operations committed atomically
        return i.repos.Item.FindByID(ctx, it.ID(), nil)
    })
}
```

**With Permission Checks:**

```go
// Usecase builder pattern for permission checks + transaction
return Run1(
    ctx,
    operator,
    i.repos,
    Usecase().
        WithWritableWorkspaces(workspaceID).  // Check write permission
        Transaction(),                         // Enable transaction
    func(ctx context.Context) (*project.Project, error) {
        // Use case logic here
        // Permission is checked before transaction starts
        // Transaction is automatically committed on success or rolled back on error
    },
)
```

**Features:**

- ✅ **Automatic transaction management** - Commits on success, rolls back on error
- ✅ **Permission checks** - Validates operator permissions before executing
- ✅ **Retry logic** - Automatically retries on transient failures (configurable)
- ✅ **Type-safe** - Uses Go generics for return values
- ✅ **Composable** - Chain permission checks with `.WithWritableWorkspaces()`, `.WithMaintainableWorkspaces()`, etc.

**Transaction Retry:**

```go
// internal/usecase/interactor/usecase.go
const transactionRetry = 2  // Retry up to 2 times on failure

// Automatically handled by Run1/Run2/Run3
err = usecasex.DoTransaction(ctx, tr, transactionRetry, func(ctx context.Context) error {
    a, b, c, err = f(ctx)
    return err
})
```

### Event Publishing

Domain events for decoupling.

```go
// Publish event after item creation
event := &event.ItemCreated{
    ItemID:    item.ID(),
    SchemaID:  item.SchemaID(),
    Timestamp: time.Now(),
}
i.eventPublisher.Publish(ctx, event)
```

## 📚 Additional Resources

- [Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Domain-Driven Design](https://martinfowler.com/tags/domain%20driven%20design.html)
- [Go Project Layout](https://github.com/golang-standards/project-layout)
- [gqlgen Documentation](https://gqlgen.com/)
