package item

import "github.com/reearth/reearth-cms/server/pkg/id"

type ID = id.ItemID
type ProjectID = id.ProjectID
type SchemaID = id.SchemaID
type FieldID = id.FieldID
type ModelID = id.ModelID
type UserID = id.UserID
type IntegrationID = id.IntegrationID

var NewID = id.NewItemID

var MustID = id.MustItemID
var IDFrom = id.ItemIDFrom
var IDFromRef = id.ItemIDFromRef
var ErrInvalidID = id.ErrInvalidID
