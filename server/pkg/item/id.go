package item

import "github.com/reearth/reearth-cms/server/pkg/id"

type ID = id.ItemID
type ModelID = id.ModelID

var NewID = id.NewItemID
var NewModelID = id.NewModelID

var MustID = id.MustItemID
var IDFrom = id.ItemIDFrom
var IDFromRef = id.ItemIDFromRef
var ErrInvalidID = id.ErrInvalidID
