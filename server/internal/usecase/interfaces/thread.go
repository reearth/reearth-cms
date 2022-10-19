package interfaces

import (
	"context"
	"errors"

	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/thread"
)

var (
	ErrCommentAlreadyExist = errors.New("Comment already exist in this thread")
	ErrCommentDoesNotExist = errors.New("Comment does not exist in this thread")
)

type Thread interface {
	FindByID(context.Context, id.ThreadID, *usecase.Operator) (*thread.Thread, error)
	FindByIDs(context.Context, []id.ThreadID, *usecase.Operator) (thread.List, error)
	CreateThread(context.Context, id.WorkspaceID, *usecase.Operator) (*thread.Thread, error)
	AddComment(context.Context, id.ThreadID, *thread.Comment, *usecase.Operator) (*thread.Comment, error)
	UpdateComment(context.Context, id.ThreadID, id.CommentID, string, *usecase.Operator) (*thread.Comment, error)
	DeleteComment(context.Context, id.ThreadID, id.CommentID, *usecase.Operator) error
}
