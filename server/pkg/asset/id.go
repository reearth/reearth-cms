package asset

import (
	"github.com/reearth/reearth-cms/server/pkg/id"
)

type ID = id.AssetID
type ProjectID = id.ProjectID
type UserID = id.UserID

var NewID = id.NewAssetID
var NewProjectID = id.NewProjectID
var NewUserID = id.NewUserID

var MustID = id.MustAssetID
var MustProjectID = id.MustProjectID
var MustUserID = id.MustUserID

var IDFrom = id.AssetIDFrom
var ProjectIDFrom = id.ProjectIDFrom
var UserIDFrom = id.UserIDFrom

var IDFromRef = id.AssetIDFromRef
var ProjectIDFromRef = id.ProjectIDFromRef
var UserIDFromRef = id.UserIDFromRef

var ErrInvalidID = id.ErrInvalidID
