package model

import (
	"github.com/reearth/reearth-cms/server/pkg/id"
)

type ID = id.ModelID
type ProjectID = id.ProjectID
type SchemaID = id.SchemaID

var NewID = id.NewModelID
var MustID = id.MustModelID
var IDFrom = id.ModelIDFrom
var IDFromRef = id.ModelIDFromRef
var ErrInvalidID = id.ErrInvalidID
