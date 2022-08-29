package thread

import (
	"github.com/reearth/reearth-cms/server/pkg/id"
)

type ID = id.ThreadID
type UserID = id.UserID

var NewID = id.NewThreadID
var NewUserID = id.NewUserID

var MustID = id.MustThreadID
var MustUserID = id.MustUserID

var IDFrom = id.ThreadIDFrom
var UserIDFrom = id.UserIDFrom

var IDFromRef = id.ThreadIDFromRef
var UserIDFromRef = id.UserIDFromRef

var ErrInvalidID = id.ErrInvalidID
