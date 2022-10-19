package interactor

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/thread"
)

type Thread struct {
	repos *repo.Container
}

func NewThread(r *repo.Container) interfaces.Thread {
	return &Thread{
		repos: r,
	}
}

func (i *Thread) FindByID(ctx context.Context, aid id.ThreadID, op *usecase.Operator) (*thread.Thread, error) {
	return Run1(
		ctx, op, i.repos,
		Usecase().Transaction(),
		func() (*thread.Thread, error) {
			return i.repos.Thread.FindByID(ctx, aid)
		},
	)
}

func (i *Thread) FindByIDs(ctx context.Context, threads []id.ThreadID, operator *usecase.Operator) (thread.List, error) {
	return i.repos.Thread.FindByIDs(ctx, threads)
}

func (i *Thread) CreateThread(ctx context.Context, wid id.WorkspaceID, op *usecase.Operator) (*thread.Thread, error) {
	return Run1(
		ctx, op, i.repos,
		Usecase().WithWritableWorkspaces(wid).Transaction(),
		func() (*thread.Thread, error) {
			return i.repos.Thread.CreateThread(ctx, wid)
		},
	)
}

func (i *Thread) AddComment(ctx context.Context, thid id.ThreadID, c *thread.Comment, op *usecase.Operator) (*thread.Comment, error) {
	th, err := i.repos.Thread.FindByID(ctx, thid)
	if err != nil {
		return nil, err
	}
	if th.HasComment(c.ID()) {
		return nil, interfaces.ErrCommentAlreadyExist
	}

	return Run1(
		ctx, op, i.repos,
		Usecase().WithWritableWorkspaces(th.Workspace()).Transaction(),
		func() (*thread.Comment, error) {
			return i.repos.Thread.AddComment(ctx, th, c)
		},
	)
}

func (i *Thread) UpdateComment(ctx context.Context, thid id.ThreadID, cid id.CommentID, content string, op *usecase.Operator) (*thread.Comment, error) {
	th, err := i.repos.Thread.FindByID(ctx, thid)
	if err != nil {
		return nil, err
	}
	if !th.HasComment(cid) {
		return nil, interfaces.ErrCommentDoesNotExist
	}

	return Run1(
		ctx, op, i.repos,
		Usecase().WithWritableWorkspaces(th.Workspace()).Transaction(),
		func() (*thread.Comment, error) {
			return i.repos.Thread.UpdateComment(ctx, th, cid, content)
		},
	)
}

func (i *Thread) DeleteComment(ctx context.Context, thid id.ThreadID, cid id.CommentID, op *usecase.Operator) error {
	thread, err := i.repos.Thread.FindByID(ctx, thid)
	if err != nil {
		return err
	}
	if !thread.HasComment(cid) {
		return interfaces.ErrCommentDoesNotExist
	}

	return Run0(
		ctx, op, i.repos,
		Usecase().WithWritableWorkspaces(thread.Workspace()).Transaction(),
		func() error {
			return i.repos.Thread.DeleteComment(ctx, thread, cid)
		},
	)
}
