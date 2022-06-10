package id

import "github.com/reearth/reearth-cms/server/pkg/id/idx"

type Workspace struct{}
type Project struct{}
type User struct{}
type Asset struct{}

func (Workspace) Type() string { return "workspace" }
func (Project) Type() string   { return "project" }
func (User) Type() string      { return "user" }
func (Asset) Type() string     { return "asset" }

type WorkspaceID = idx.ID[Workspace]
type ProjectID = idx.ID[Project]
type UserID = idx.ID[User]
type AssetID = idx.ID[Asset]

var NewWorkspaceID = idx.New[Workspace]
var NewProjectID = idx.New[Project]
var NewUserID = idx.New[User]
var NewAssetID = idx.New[Asset]

var MustWorkspaceID = idx.Must[Workspace]
var MustProjectID = idx.Must[Project]
var MustUserID = idx.Must[User]
var MustAssetID = idx.Must[Asset]

var WorkspaceIDFrom = idx.From[Workspace]
var ProjectIDFrom = idx.From[Project]
var UserIDFrom = idx.From[User]
var AssetIDFrom = idx.From[Asset]

var WorkspaceIDFromRef = idx.FromRef[Workspace]
var ProjectIDFromRef = idx.FromRef[Project]
var UserIDFromRef = idx.FromRef[User]
var AssetIDFromRef = idx.FromRef[Asset]

type WorkspaceIDList = idx.List[Workspace]
type ProjectIDList = idx.List[Project]
type UserIDList = idx.List[User]
type AssetIDList = idx.List[Asset]

var WorkspaceIDListFrom = idx.ListFrom[Workspace]
var ProjectIDListFrom = idx.ListFrom[Project]
var UserIDListFrom = idx.ListFrom[User]
var AssetIDListFrom = idx.ListFrom[Asset]

type WorkspaceIDSet = idx.Set[Workspace]
type ProjectIDSet = idx.Set[Project]
type UserIDSet = idx.Set[User]
type AssetIDSet = idx.Set[Asset]

var NewWorkspaceIDSet = idx.NewSet[Workspace]
var NewProjectIDSet = idx.NewSet[Project]
var NewUserIDSet = idx.NewSet[User]
var NewAssetIDSet = idx.NewSet[Asset]
