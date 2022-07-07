package model

import (
	"github.com/reearth/reearth-cms/server/pkg/id"
)

type ID = id.FieldID

var NewID = id.NewFieldID
var MustID = id.MustFieldID
var IDFrom = id.FieldIDFrom
var IDFromRef = id.FieldIDFromRef
var ErrInvalidID = id.ErrInvalidID
