package id

import "github.com/reearth/reearthx/idx"

type Workspace struct{}
type User struct{}
type Asset struct{}
type Task struct{}

func (Workspace) Type() string { return "workspace" }
func (User) Type() string      { return "user" }
func (Asset) Type() string     { return "asset" }
func (Task) Type() string      { return "task" }

type WorkspaceID = idx.ID[Workspace]
type UserID = idx.ID[User]
type AssetID = idx.ID[Asset]
type TaskID = idx.ID[Task]

var NewWorkspaceID = idx.New[Workspace]
var NewUserID = idx.New[User]
var NewAssetID = idx.New[Asset]
var NewTaskID = idx.New[Task]

var MustWorkspaceID = idx.Must[Workspace]
var MustUserID = idx.Must[User]
var MustAssetID = idx.Must[Asset]
var MustTaskID = idx.Must[Task]

var WorkspaceIDFrom = idx.From[Workspace]
var UserIDFrom = idx.From[User]
var AssetIDFrom = idx.From[Asset]
var TaskIDFrom = idx.From[Task]

var WorkspaceIDFromRef = idx.FromRef[Workspace]
var UserIDFromRef = idx.FromRef[User]
var AssetIDFromRef = idx.FromRef[Asset]
var TaskIDFromRef = idx.FromRef[Task]

type WorkspaceIDList = idx.List[Workspace]
type UserIDList = idx.List[User]
type AssetIDList = idx.List[Asset]
type TaskIDList = idx.List[Task]

var WorkspaceIDListFrom = idx.ListFrom[Workspace]
var UserIDListFrom = idx.ListFrom[User]
var AssetIDListFrom = idx.ListFrom[Asset]
var TaskIDListFrom = idx.ListFrom[Task]

type WorkspaceIDSet = idx.Set[Workspace]
type UserIDSet = idx.Set[User]
type AssetIDSet = idx.Set[Asset]
type TaskIDSet = idx.Set[Task]

var NewWorkspaceIDSet = idx.NewSet[Workspace]
var NewUserIDSet = idx.NewSet[User]
var NewAssetIDSet = idx.NewSet[Asset]
var NewTaskIDSet = idx.NewSet[Task]

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

type Item struct{}

func (Item) Type() string { return "item" }

type ItemID = idx.ID[Item]
type ItemIDList = idx.List[Item]

var MustItemID = idx.Must[Item]
var NewItemID = idx.New[Item]
var ItemIDFrom = idx.From[Item]
var ItemIDFromRef = idx.FromRef[Item]
var ItemIDListFrom = idx.ListFrom[Item]

type Integration struct{}

func (Integration) Type() string { return "integration" }

type IntegrationID = idx.ID[Integration]
type IntegrationIDList = idx.List[Integration]

var MustIntegrationID = idx.Must[Integration]
var NewIntegrationID = idx.New[Integration]
var IntegrationIDFrom = idx.From[Integration]
var IntegrationIDFromRef = idx.FromRef[Integration]
var IntegrationIDListFrom = idx.ListFrom[Integration]

type Webhook struct{}

func (Webhook) Type() string { return "webhook" }

type WebhookID = idx.ID[Webhook]
type WebhookIDList = idx.List[Webhook]

var MustWebhookID = idx.Must[Webhook]
var NewWebhookID = idx.New[Webhook]
var WebhookIDFrom = idx.From[Webhook]
var WebhookIDFromRef = idx.FromRef[Webhook]
var WebhookIDListFrom = idx.ListFrom[Webhook]
