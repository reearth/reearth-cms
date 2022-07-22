package model

import (
	"github.com/reearth/reearth-cms/server/pkg/id"
)

type ID = id.ModelID

var NewID = id.NewModelID
var MustID = id.MustModelID
var IDFrom = id.ModelIDFrom
var IDFromRef = id.ModelIDFromRef
var ErrInvalidID = id.ErrInvalidID
