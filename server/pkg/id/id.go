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
