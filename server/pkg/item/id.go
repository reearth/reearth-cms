package item

import (
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearthx/account/accountdomain"
)

type ID = id.ItemID
type IDList = id.ItemIDList
type ProjectID = id.ProjectID
type SchemaID = id.SchemaID
type FieldID = id.FieldID
type FieldIDList = id.FieldIDList
type ModelID = id.ModelID
type ThreadID = id.ThreadID
type UserID = accountdomain.UserID
type IntegrationID = id.IntegrationID
type AssetID = id.AssetID
type AssetIDList = id.AssetIDList
type ItemGroupID = id.ItemGroupID

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
