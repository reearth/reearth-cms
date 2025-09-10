package user

import (
	"github.com/reearth/reearth-cms/server/pkg/id"
)

type ID = id.UserID
type IDList = id.UserIDList
type IDSet = id.UserIDSet
type WorkspaceID = id.WorkspaceID
type WorkspaceIDList = id.WorkspaceIDList
type WorkspaceIDSet = id.WorkspaceIDSet

var NewID = id.NewUserID
var NewWorkspaceID = id.NewWorkspaceID
var NewIDSet = id.NewUserIDSet
var NewWorkspaceIDSet = id.NewWorkspaceIDSet

var MustID = id.MustUserID
var MustWorkspaceID = id.MustWorkspaceID

var IDFrom = id.UserIDFrom
var WorkspaceIDFrom = id.WorkspaceIDFrom
var IDListFrom = id.UserIDListFrom
var WorkspaceIDListFrom = id.WorkspaceIDListFrom

var IDFromRef = id.UserIDFromRef
var WorkspaceIDFromRef = id.WorkspaceIDFromRef

var ErrInvalidID = id.ErrInvalidID
