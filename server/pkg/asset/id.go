package asset

import (
	"github.com/reearth/reearth-cms/server/pkg/id"
)

type ID = id.AssetID
type WorkspaceID = id.WorkspaceID
type UserID = id.UserID
type AssetFileID = id.AssetFileID
type ProjectID = id.ProjectID

var NewID = id.NewAssetID
var NewWorkspaceID = id.NewWorkspaceID
var NewUserID = id.NewWorkspaceID
var NewAssetFileID = id.NewAssetFileID

var MustID = id.MustAssetID
var MustWorkspaceID = id.MustWorkspaceID
var MustUserID = id.MustUserID
var MustAssetFileID = id.MustAssetFileID

var IDFrom = id.AssetIDFrom
var WorkspaceIDFrom = id.WorkspaceIDFrom
var UserIDFrom = id.UserIDFrom
var AssetFileIDFrom = id.AssetFileIDFrom

var IDFromRef = id.AssetIDFromRef
var WorkspaceIDFromRef = id.WorkspaceIDFromRef
var UserIDFromRef = id.UserIDFromRef
var AssetFileIDFromRef = id.AssetFileIDFromRef

var ErrInvalidID = id.ErrInvalidID
