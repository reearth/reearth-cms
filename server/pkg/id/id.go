package id

import "github.com/reearth/reearth-cms/server/pkg/id/idx"

type Workspace struct{}
type User struct{}

func (Workspace) Type() string { return "workspace" }
func (User) Type() string      { return "user" }

type WorkspaceID = idx.ID[Workspace]
type UserID = idx.ID[User]

var NewWorkspaceID = idx.New[Workspace]
var NewUserID = idx.New[User]

var MustWorkspaceID = idx.Must[Workspace]
var MustUserID = idx.Must[User]

var WorkspaceIDFrom = idx.From[Workspace]
var UserIDFrom = idx.From[User]

var WorkspaceIDFromRef = idx.FromRef[Workspace]
var UserIDFromRef = idx.FromRef[User]

type WorkspaceIDList = idx.List[Workspace]
type UserIDList = idx.List[User]

var WorkspaceIDListFrom = idx.ListFrom[Workspace]
var UserIDListFrom = idx.ListFrom[User]

type WorkspaceIDSet = idx.Set[Workspace]
type UserIDSet = idx.Set[User]

var NewWorkspaceIDSet = idx.NewSet[Workspace]
var NewUserIDSet = idx.NewSet[User]

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
