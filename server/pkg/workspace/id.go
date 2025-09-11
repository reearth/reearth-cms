package workspace

import (
	"github.com/reearth/reearth-cms/server/pkg/id"
)

type ID = id.WorkspaceID
type IDList = id.WorkspaceIDList
type IDSet = id.WorkspaceIDSet
type UserID = id.UserID
type UserIDList = id.UserIDList
type UserIDSet = id.UserIDSet
type ProjectID = id.ProjectID
type ProjectIDList = id.ProjectIDList
type IntegrationID = id.IntegrationID
type IntegrationIDList = id.IntegrationIDList

var NewID = id.NewWorkspaceID
var NewIDSet = id.NewWorkspaceIDSet
var NewUserID = id.NewUserID
var NewUserIDSet = id.NewUserIDSet
var NewProjectID = id.NewProjectID
var NewIntegrationID = id.NewIntegrationID

var MustID = id.MustWorkspaceID
var MustUserID = id.MustUserID
var MustProjectID = id.MustProjectID
var MustIntegrationID = id.MustIntegrationID

var IDFrom = id.WorkspaceIDFrom
var UserIDFrom = id.UserIDFrom
var ProjectIDFrom = id.ProjectIDFrom
var IDListFrom = id.WorkspaceIDListFrom
var UserIDListFrom = id.UserIDListFrom
var ProjectIDListFrom = id.ProjectIDListFrom
var IntegrationIDFrom = id.IntegrationIDFrom
var IntegrationIDListFrom = id.IntegrationIDListFrom

var IDFromRef = id.WorkspaceIDFromRef
var UserIDFromRef = id.UserIDFromRef
var ProjectIDFromRef = id.ProjectIDFromRef

var ErrInvalidID = id.ErrInvalidID
