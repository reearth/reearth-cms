package id

import "github.com/reearth/reearthx/idx"

type Workspace struct{}
type User struct{}
type Asset struct{}
type Thread struct{}

func (Workspace) Type() string { return "workspace" }
func (User) Type() string      { return "user" }
func (Asset) Type() string     { return "asset" }
func (Thread) Type() string    { return "thread" }

type WorkspaceID = idx.ID[Workspace]
type UserID = idx.ID[User]
type AssetID = idx.ID[Asset]
type ThreadID = idx.ID[Thread]

var NewWorkspaceID = idx.New[Workspace]
var NewUserID = idx.New[User]
var NewAssetID = idx.New[Asset]
var NewThreadID = idx.New[Thread]

var MustWorkspaceID = idx.Must[Workspace]
var MustUserID = idx.Must[User]
var MustAssetID = idx.Must[Asset]
var MustThreadID = idx.Must[Thread]

var WorkspaceIDFrom = idx.From[Workspace]
var UserIDFrom = idx.From[User]
var AssetIDFrom = idx.From[Asset]
var ThreadIDFrom = idx.From[Thread]

var WorkspaceIDFromRef = idx.FromRef[Workspace]
var UserIDFromRef = idx.FromRef[User]
var AssetIDFromRef = idx.FromRef[Asset]
var ThreadIDFromRef = idx.FromRef[Thread]

type WorkspaceIDList = idx.List[Workspace]
type UserIDList = idx.List[User]
type AssetIDList = idx.List[Asset]
type ThreadIDList = idx.List[Thread]

var WorkspaceIDListFrom = idx.ListFrom[Workspace]
var UserIDListFrom = idx.ListFrom[User]
var AssetIDListFrom = idx.ListFrom[Asset]
var ThreadIDListFrom = idx.ListFrom[Thread]

type WorkspaceIDSet = idx.Set[Workspace]
type UserIDSet = idx.Set[User]
type AssetIDSet = idx.Set[Asset]
type ThreadIDSet = idx.Set[Thread]

var NewWorkspaceIDSet = idx.NewSet[Workspace]
var NewUserIDSet = idx.NewSet[User]
var NewAssetIDSet = idx.NewSet[Asset]
var NewThreadIDSet = idx.NewSet[Thread]

type Project struct{}

func (Project) Type() string { return "project" }

type ProjectID = idx.ID[Project]
type ProjectIDList = idx.List[Project]

var MustProjectID = idx.Must[Project]
var NewProjectID = idx.New[Project]
var ProjectIDFrom = idx.From[Project]
var ProjectIDFromRef = idx.FromRef[Project]
var ProjectIDListFrom = idx.ListFrom[Project]

type Model struct{}

func (Model) Type() string { return "model" }

type ModelID = idx.ID[Model]
type ModelIDList = idx.List[Model]

var MustModelID = idx.Must[Model]
var NewModelID = idx.New[Model]
var ModelIDFrom = idx.From[Model]
var ModelIDFromRef = idx.FromRef[Model]
var ModelIDListFrom = idx.ListFrom[Model]

type Field struct{}

func (Field) Type() string { return "field" }

type FieldID = idx.ID[Field]
type FieldIDList = idx.List[Field]

var MustFieldID = idx.Must[Field]
var NewFieldID = idx.New[Field]
var FieldIDFrom = idx.From[Field]
var FieldIDFromRef = idx.FromRef[Field]
var FieldIDListFrom = idx.ListFrom[Field]

type Schema struct{}

func (Schema) Type() string { return "schema" }

type SchemaID = idx.ID[Schema]
type SchemaIDList = idx.List[Schema]

var MustSchemaID = idx.Must[Schema]
var NewSchemaID = idx.New[Schema]
var SchemaIDFrom = idx.From[Schema]
var SchemaIDFromRef = idx.FromRef[Schema]
var SchemaIDListFrom = idx.ListFrom[Schema]
