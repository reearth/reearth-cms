package asset

import (
	"github.com/reearth/reearth-cms/server/pkg/id"
)

type ID = id.AssetID
type ProjectID = id.ProjectID
type UserID = id.UserID
type AssetFileID = id.AssetFileID

var NewID = id.NewAssetID
var NewProjectID = id.NewProjectID
var NewUserID = id.NewUserID
var NewAssetFileID = id.NewAssetFileID

var MustID = id.MustAssetID
var MustProjectID = id.MustProjectID
var MustUserID = id.MustUserID
var MustAssetFileID = id.MustAssetFileID

var IDFrom = id.AssetIDFrom
var ProjectIDFrom = id.ProjectIDFrom
var UserIDFrom = id.UserIDFrom
var AssetFileIDFrom = id.AssetFileIDFrom

var IDFromRef = id.AssetIDFromRef
var ProjectIDFromRef = id.ProjectIDFromRef
var UserIDFromRef = id.UserIDFromRef
var AssetFileIDFromRef = id.AssetFileIDFromRef

var ErrInvalidID = id.ErrInvalidID
