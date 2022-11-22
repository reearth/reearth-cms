package request

import "github.com/reearth/reearth-cms/server/pkg/id"

type ID = id.RequestID
type ItemID = id.ItemID
type UserID = id.UserID

var NewID = id.NewRequestID

var MustID = id.MustRequestID
var IDFrom = id.RequestIDFrom
var IDFromRef = id.RequestIDFromRef

var ErrInvalidID = id.ErrInvalidID
