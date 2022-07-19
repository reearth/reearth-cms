package id

import "github.com/reearth/reearth-cms/server/pkg/id/idx"

type Workspace struct{}
type User struct{}
type Task struct{}

func (Workspace) Type() string { return "workspace" }
func (User) Type() string      { return "user" }
func (Task) Type() string      { return "task" }

type WorkspaceID = idx.ID[Workspace]
type UserID = idx.ID[User]
type TaskID = idx.ID[Task]

var NewWorkspaceID = idx.New[Workspace]
var NewUserID = idx.New[User]
var NewTaskID = idx.New[Task]

var MustWorkspaceID = idx.Must[Workspace]
var MustUserID = idx.Must[User]
var MustTaskID = idx.Must[Task]

var WorkspaceIDFrom = idx.From[Workspace]
var UserIDFrom = idx.From[User]
var TaskIDFrom = idx.From[Task]

var WorkspaceIDFromRef = idx.FromRef[Workspace]
var UserIDFromRef = idx.FromRef[User]
var TaskIDFromRef = idx.FromRef[Task]

type WorkspaceIDList = idx.List[Workspace]
type UserIDList = idx.List[User]
type TaskIDList = idx.List[Task]

var WorkspaceIDListFrom = idx.ListFrom[Workspace]
var UserIDListFrom = idx.ListFrom[User]
var TaskIDListFrom = idx.ListFrom[Task]

type WorkspaceIDSet = idx.Set[Workspace]
type UserIDSet = idx.Set[User]
type TaskIDSet = idx.Set[Task]

var NewWorkspaceIDSet = idx.NewSet[Workspace]
var NewUserIDSet = idx.NewSet[User]
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
