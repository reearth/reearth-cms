package repo

import (
	"context"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/thread"
)

type Thread interface {
	Filtered(filter WorkspaceFilter) Thread
	AddComment(context.Context, *thread.Thread, *thread.Comment) error
	UpdateComment(context.Context, *thread.Thread, *thread.Comment) error
	DeleteComment(context.Context, *thread.Thread, id.CommentID) error
}
