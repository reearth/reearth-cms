package workspacesettings

import (
	"github.com/reearth/reearth-cms/server/pkg/id"
)

type ID = id.WorkspaceSettingsID
type ResourceID = id.ResourceID

var NewID = id.NewWorkspaceSettingsID
var NewResourceID = id.NewResourceID

var MustID = id.MustWorkspaceSettingsID
var MustResourceID = id.MustResourceID

var IDFrom = id.WorkspaceSettingsIDFrom
var ResourceIDFrom = id.ResourceIDFrom

var IDFromRef = id.WorkspaceSettingsIDFromRef
var ResourceIDFromRef = id.ResourceIDFromRef

var ErrInvalidID = id.ErrInvalidID
