package id

import "github.com/reearth/reearth-cms/server/pkg/id/idx"

type Team struct{}
type User struct{}

func (Team) Type() string { return "team" }
func (User) Type() string { return "user" }

type TeamID = idx.ID[Team]
type UserID = idx.ID[User]

var NewTeamID = idx.New[Team]
var NewUserID = idx.New[User]

var MustTeamID = idx.Must[Team]
var MustUserID = idx.Must[User]

var TeamIDFrom = idx.From[Team]
var UserIDFrom = idx.From[User]

var TeamIDFromRef = idx.FromRef[Team]
var UserIDFromRef = idx.FromRef[User]

type TeamIDList = idx.List[Team]
type UserIDList = idx.List[User]

var TeamIDListFrom = idx.ListFrom[Team]
var UserIDListFrom = idx.ListFrom[User]

type TeamIDSet = idx.Set[Team]
type UserIDSet = idx.Set[User]

var NewTeamIDSet = idx.NewSet[Team]
var NewUserIDSet = idx.NewSet[User]
