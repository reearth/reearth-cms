package repo

import (
	"context"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/thread"
)

type Thread interface {
	Filtered(filter WorkspaceFilter) Thread
	AddComment(context.Context, id.ThreadID, *thread.Comment) error
	UpdateComment(context.Context, id.ThreadID, *thread.Comment) error
	DeleteComment(context.Context, id.ThreadID, id.CommentID) error
}
