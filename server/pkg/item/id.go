package item

import "github.com/reearth/reearth-cms/server/pkg/id"

type ID = id.ItemID
type ProjectID = id.ProjectID
type SchemaID = id.SchemaID
type FieldID = id.FieldID
type ModelID = id.ModelID
type ThreadID = id.ThreadID

var NewID = id.NewItemID
var NewThreadID = id.NewThreadID

var MustID = id.MustItemID
var MustThreadID = id.MustThreadID

var IDFrom = id.ItemIDFrom
var IDFromRef = id.ItemIDFromRef
var ThreadIDFrom = id.ThreadIDFrom
var ThreadIDFromRef = id.ThreadIDFromRef

var NewFieldID = id.NewFieldID
var MustFieldID = id.MustFieldID
var FieldIDFrom = id.FieldIDFrom
var FieldIDFromRef = id.FieldIDFromRef

var ErrInvalidID = id.ErrInvalidID
