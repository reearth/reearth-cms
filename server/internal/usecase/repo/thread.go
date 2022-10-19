package repo

import (
	"context"
	"errors"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/thread"
)

var (
	ErrCommentNotFound error = errors.New("comment not found")
)

type Thread interface {
	Save(context.Context, *thread.Thread) error
	Filtered(filter WorkspaceFilter) Thread
	FindByID(ctx context.Context, id id.ThreadID) (*thread.Thread, error)
	FindByIDs(context.Context, id.ThreadIDList) ([]*thread.Thread, error)
	CreateThread(context.Context, id.WorkspaceID) error
	AddComment(context.Context, *thread.Thread, *thread.Comment) error
	UpdateComment(context.Context, *thread.Thread, id.CommentID, string) error
	DeleteComment(context.Context, *thread.Thread, id.CommentID) error
}
