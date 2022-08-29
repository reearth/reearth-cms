package thread

import (
	"github.com/reearth/reearth-cms/server/pkg/id"
)

type ID = id.ThreadID
type CommentID = id.CommentID
type UserID = id.UserID

var NewID = id.NewThreadID
var NewCommentID = id.NewCommentID
var NewUserID = id.NewUserID

var MustID = id.MustThreadID
var MustCommentID = id.MustCommentID
var MustUserID = id.MustUserID

var IDFrom = id.ThreadIDFrom
var CommentIDFrom = id.CommentIDFrom
var UserIDFrom = id.UserIDFrom

var IDFromRef = id.ThreadIDFromRef
var CommentIDFromRef = id.CommentIDFromRef
var UserIDFromRef = id.UserIDFromRef

var ErrInvalidID = id.ErrInvalidID
