package interactor

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/rbac"
	"github.com/reearth/reearth-cms/server/pkg/thread"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/samber/lo"
)

type Thread struct {
	repos    *repo.Container
	gateways *gateway.Container
}

func NewThread(r *repo.Container, g *gateway.Container) interfaces.Thread {
	return &Thread{
		repos:    r,
		gateways: g,
	}
}

// checkPermissions enforces a Cerbos check on the thread resource for the given
// workspaces. When no workspace is supplied there is nothing to authorize
// (e.g. an empty result set), so the check is skipped.
func (i *Thread) checkPermissions(ctx context.Context, action rbac.Action, workspaceIDs ...accountdomain.WorkspaceID) error {
	if len(workspaceIDs) == 0 {
		return nil
	}
	return doCheckPermission(ctx, i.gateways, rbac.ResourceThread, action, lo.Uniq(workspaceIDs)...)
}

func (i *Thread) FindByID(ctx context.Context, aid id.ThreadID, op *usecase.Operator) (*thread.Thread, error) {
	return Run1(
		ctx, op, i.repos,
		Usecase().Transaction(),
		func(ctx context.Context) (*thread.Thread, error) {
			th, err := i.repos.Thread.FindByID(ctx, aid)
			if err != nil {
				return nil, err
			}
			if err := i.checkPermissions(ctx, rbac.ActionRead, th.Workspace()); err != nil {
				return nil, err
			}
			return th, nil
		},
	)
}

func (i *Thread) FindByIDs(ctx context.Context, threads []id.ThreadID, operator *usecase.Operator) (thread.List, error) {
	th, err := i.repos.Thread.FindByIDs(ctx, threads)
	if err != nil {
		return nil, err
	}
	if err := i.checkPermissions(ctx, rbac.ActionRead, thread.List(th).Workspaces()...); err != nil {
		return nil, err
	}
	return th, nil
}

func (i *Thread) CreateThreadWithComment(ctx context.Context, input interfaces.CreateThreadWithCommentInput, op *usecase.Operator) (*thread.Thread, *thread.Comment, error) {
	return Run2(
		ctx, op, i.repos,
		Usecase().WithWritableWorkspaces(input.WorkspaceID).Transaction(),
		func(ctx context.Context) (*thread.Thread, *thread.Comment, error) {
			if err := i.checkPermissions(ctx, rbac.ActionCreate, input.WorkspaceID); err != nil {
				return nil, nil, err
			}
			th, err := thread.New().NewID().Workspace(input.WorkspaceID).Build()
			if err != nil {
				return nil, nil, err
			}
			if err := i.repos.Thread.Save(ctx, th); err != nil {
				return nil, nil, err
			}
			if err := i.linkThreadToResource(ctx, th.ID(), input.ResourceType, input.ResourceID); err != nil {
				return nil, nil, err
			}
			_, c, err := i.addComment(ctx, th.ID(), input.Content, op)
			if err != nil {
				return nil, nil, err
			}
			return th, c, nil
		},
	)
}

func (i *Thread) linkThreadToResource(ctx context.Context, thID thread.ID, resourceType interfaces.ResourceType, resourceID string) error {
	switch resourceType {
	case interfaces.ResourceTypeItem:
		iid, err := id.ItemIDFrom(resourceID)
		if err != nil {
			return err
		}
		itm, err := i.repos.Item.FindByID(ctx, iid, nil)
		if err != nil {
			return err
		}
		if itm != nil {
			itm.Value().SetThread(thID)
			return i.repos.Item.Save(ctx, itm.Value())
		}

	case interfaces.ResourceTypeAsset:
		aid, err := id.AssetIDFrom(resourceID)
		if err != nil {
			return err
		}
		a, err := i.repos.Asset.FindByID(ctx, aid)
		if err != nil {
			return err
		}
		if a != nil {
			a.SetThread(thID)
			return i.repos.Asset.Save(ctx, a)
		}

	case interfaces.ResourceTypeRequest:
		rid, err := id.RequestIDFrom(resourceID)
		if err != nil {
			return err
		}
		req, err := i.repos.Request.FindByID(ctx, rid)
		if err != nil {
			return err
		}
		if req != nil {
			req.SetThread(thID)
			return i.repos.Request.Save(ctx, req)
		}
	}

	return nil
}

func (i *Thread) AddComment(ctx context.Context, thid id.ThreadID, content string, op *usecase.Operator) (*thread.Thread, *thread.Comment, error) {
	if op.AcOperator.User == nil && op.Integration == nil {
		return nil, nil, interfaces.ErrInvalidOperator
	}
	return Run2(
		ctx, op, i.repos,
		Usecase().Transaction(),
		func(ctx context.Context) (*thread.Thread, *thread.Comment, error) {
			return i.addComment(ctx, thid, content, op)
		},
	)
}

func (i *Thread) addComment(ctx context.Context, thid id.ThreadID, content string, op *usecase.Operator) (*thread.Thread, *thread.Comment, error) {
	th, err := i.repos.Thread.FindByID(ctx, thid)
	if err != nil {
		return nil, nil, err
	}

	if !op.IsWritableWorkspace(th.Workspace()) {
		return nil, nil, interfaces.ErrOperationDenied
	}

	if err := i.checkPermissions(ctx, rbac.ActionComment, th.Workspace()); err != nil {
		return nil, nil, err
	}

	comment := thread.NewComment(thread.NewCommentID(), op.Operator(), content)
	if err := th.AddComment(comment); err != nil {
		return nil, nil, err
	}

	if err := i.repos.Thread.Save(ctx, th); err != nil {
		return nil, nil, err
	}

	return th, comment, nil
}

func (i *Thread) UpdateComment(ctx context.Context, thid id.ThreadID, cid id.CommentID, content string, op *usecase.Operator) (*thread.Thread, *thread.Comment, error) {
	if op.AcOperator.User == nil && op.Integration == nil {
		return nil, nil, interfaces.ErrInvalidOperator
	}
	return Run2(
		ctx, op, i.repos,
		Usecase().Transaction(),
		func(ctx context.Context) (*thread.Thread, *thread.Comment, error) {
			th, err := i.repos.Thread.FindByID(ctx, thid)
			if err != nil {
				return nil, nil, err
			}

			if !op.IsWritableWorkspace(th.Workspace()) {
				return nil, nil, interfaces.ErrOperationDenied
			}

			if err := i.checkPermissions(ctx, rbac.ActionComment, th.Workspace()); err != nil {
				return nil, nil, err
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

func (i *Thread) DeleteComment(ctx context.Context, thid id.ThreadID, cid id.CommentID, op *usecase.Operator) (*thread.Thread, error) {
	if op.AcOperator.User == nil && op.Integration == nil {
		return nil, interfaces.ErrInvalidOperator
	}
	return Run1(
		ctx, op, i.repos,
		Usecase().Transaction(),
		func(ctx context.Context) (*thread.Thread, error) {
			th, err := i.repos.Thread.FindByID(ctx, thid)
			if err != nil {
				return nil, err
			}

			if !op.IsWritableWorkspace(th.Workspace()) {
				return nil, interfaces.ErrOperationDenied
			}

			if err := i.checkPermissions(ctx, rbac.ActionComment, th.Workspace()); err != nil {
				return nil, err
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
