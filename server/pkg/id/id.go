package id

import "github.com/reearth/reearth-cms/server/pkg/id/idx"

type Workspace struct{}
type User struct{}
type Asset struct{}

func (Workspace) Type() string { return "workspace" }
func (User) Type() string      { return "user" }
func (Asset) Type() string     { return "asset" }

type WorkspaceID = idx.ID[Workspace]
type UserID = idx.ID[User]
type AssetID = idx.ID[Asset]

var NewWorkspaceID = idx.New[Workspace]
var NewUserID = idx.New[User]
var NewAssetID = idx.New[Asset]

var MustWorkspaceID = idx.Must[Workspace]
var MustUserID = idx.Must[User]
var MustAssetID = idx.Must[Asset]

var WorkspaceIDFrom = idx.From[Workspace]
var UserIDFrom = idx.From[User]
var AssetIDFrom = idx.From[Asset]

var WorkspaceIDFromRef = idx.FromRef[Workspace]
var UserIDFromRef = idx.FromRef[User]
var AssetIDFromRef = idx.FromRef[Asset]

type WorkspaceIDList = idx.List[Workspace]
type UserIDList = idx.List[User]
type AssetIDList = idx.List[Asset]

var WorkspaceIDListFrom = idx.ListFrom[Workspace]
var UserIDListFrom = idx.ListFrom[User]
var AssetIDListFrom = idx.ListFrom[Asset]

type WorkspaceIDSet = idx.Set[Workspace]
type UserIDSet = idx.Set[User]
type AssetIDSet = idx.Set[Asset]

var NewWorkspaceIDSet = idx.NewSet[Workspace]
var NewUserIDSet = idx.NewSet[User]
var NewAssetIDSet = idx.NewSet[Asset]

type Project struct{}

func (Project) Type() string { return "project" }

type ProjectID = idx.ID[Project]
type ProjectIDList = idx.List[Project]

var MustProjectID = idx.Must[Project]
var NewProjectID = idx.New[Project]
var ProjectIDFrom = idx.From[Project]
var ProjectIDFromRef = idx.FromRef[Project]
var ProjectIDListFrom = idx.ListFrom[Project]
