package interactor

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/thread"
	"github.com/reearth/reearthx/rerror"
)

type Thread struct {
	repos *repo.Container
}

func NewThread(r *repo.Container) interfaces.Thread {
	return &Thread{
		repos: r,
	}
}

func (i *Thread) FindByID(ctx context.Context, aid thread.ID, op *usecase.Operator) (*thread.Thread, error) {
	return Run1(
		ctx, op, i.repos,
		Usecase().Transaction(),
		func() (*thread.Thread, error) {
			return i.repos.Thread.FindByID(ctx, aid)
		},
	)
}

func (i *Thread) FindByIDs(ctx context.Context, threads []thread.ID, operator *usecase.Operator) (thread.List, error) {
	return i.repos.Thread.FindByIDs(ctx, threads)
}

func (i *Thread) CreateThread(ctx context.Context, wid thread.WorkspaceID, op *usecase.Operator) (*thread.Thread, error) {
	return Run1(
		ctx, op, i.repos,
		Usecase().WithWritableWorkspaces(wid).Transaction(),
		func() (*thread.Thread, error) {
			thread, err := thread.New().NewID().Workspace(wid).Build()
			if err != nil {
				return nil, err
			}

			if err := i.repos.Thread.Save(ctx, thread); err != nil {
				return nil, err
			}

			return thread, nil
		},
	)
}

func (i *Thread) AddComment(ctx context.Context, thid thread.ID, content string, op *usecase.Operator) (*thread.Thread, *thread.Comment, error) {
	if op.User == nil {
		return nil, nil, interfaces.ErrInvalidOperator
	}
	return Run2(
		ctx, op, i.repos,
		Usecase().Transaction(),
		func() (*thread.Thread, *thread.Comment, error) {
			th, err := i.repos.Thread.FindByID(ctx, thid)
			if err != nil {
				return nil, nil, err
			}

			if !op.IsWritableWorkspace(th.Workspace()) {
				return nil, nil, interfaces.ErrOperationDenied
			}

			comment := thread.NewComment(thread.NewCommentID(), *op.User, content)
			if err := th.AddComment(comment); err != nil {
				return nil, nil, err
			}

			if err := i.repos.Thread.Save(ctx, th); err != nil {
				return nil, nil, err
			}

			return th, comment, nil
		},
	)
}

func (i *Thread) UpdateComment(ctx context.Context, thid thread.ID, cid thread.CommentID, content string, op *usecase.Operator) (*thread.Thread, *thread.Comment, error) {
	if op.User == nil {
		return nil, nil, interfaces.ErrInvalidOperator
	}
	return Run2(
		ctx, op, i.repos,
		Usecase().Transaction(),
		func() (*thread.Thread, *thread.Comment, error) {
			th, err := i.repos.Thread.FindByID(ctx, thid)
			if err != nil {
				return nil, nil, err
			}

			if !op.IsWritableWorkspace(th.Workspace()) {
				return nil, nil, interfaces.ErrOperationDenied
			}

			c := th.Comment(cid)
			if c == nil {
				return nil, nil, rerror.ErrNotFound
			}
			if c.Author() != *op.User {
				return nil, nil, interfaces.ErrOperationDenied
			}

			if err := th.UpdateComment(cid, content); err != nil {
				return nil, nil, err
			}

			if err := i.repos.Thread.Save(ctx, th); err != nil {
				return nil, nil, err
			}

			return th, th.Comment(cid), nil
		},
	)
}

func (i *Thread) DeleteComment(ctx context.Context, thid thread.ID, cid thread.CommentID, op *usecase.Operator) (*thread.Thread, error) {
	if op.User == nil {
		return nil, interfaces.ErrInvalidOperator
	}
	return Run1(
		ctx, op, i.repos,
		Usecase().Transaction(),
		func() (*thread.Thread, error) {
			th, err := i.repos.Thread.FindByID(ctx, thid)
			if err != nil {
				return nil, err
			}

			if !op.IsWritableWorkspace(th.Workspace()) {
				return nil, interfaces.ErrOperationDenied
			}

			c := th.Comment(cid)
			if c == nil {
				return nil, rerror.ErrNotFound
			}
			if c.Author() != *op.User {
				return nil, interfaces.ErrOperationDenied
			}

			if err := th.DeleteComment(cid); err != nil {
				return nil, err
			}

			if err := i.repos.Thread.Save(ctx, th); err != nil {
				return nil, err
			}

			return th, nil
		},
	)
}
