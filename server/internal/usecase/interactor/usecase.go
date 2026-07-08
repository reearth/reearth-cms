package interactor

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/rbac"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/usecasex"
)

const transactionRetry = 2

type authzCheck struct {
	resource    rbac.Resource
	action      rbac.Action
	workspaceID accountdomain.WorkspaceIDList
}

type uc struct {
	tx                     bool
	readableWorkspaces     accountdomain.WorkspaceIDList
	writableWorkspaces     accountdomain.WorkspaceIDList
	maintainableWorkspaces accountdomain.WorkspaceIDList
	ownableWorkspaces      accountdomain.WorkspaceIDList
	authz                  gateway.Authorization
	authzChecks            []authzCheck
}

func Usecase() *uc {
	return &uc{}
}

func (u *uc) WithReadableWorkspaces(ids ...accountdomain.WorkspaceID) *uc {
	u.readableWorkspaces = accountdomain.WorkspaceIDList(ids).Clone()
	return u
}

func (u *uc) WithWritableWorkspaces(ids ...accountdomain.WorkspaceID) *uc {
	u.writableWorkspaces = accountdomain.WorkspaceIDList(ids).Clone()
	return u
}

func (u *uc) WithMaintainableWorkspaces(ids ...accountdomain.WorkspaceID) *uc {
	u.maintainableWorkspaces = accountdomain.WorkspaceIDList(ids).Clone()
	return u
}

func (u *uc) WithOwnableWorkspaces(ids ...accountdomain.WorkspaceID) *uc {
	u.ownableWorkspaces = accountdomain.WorkspaceIDList(ids).Clone()
	return u
}

func (u *uc) Transaction() *uc {
	u.tx = true
	return u
}

// WithPermission registers a Cerbos permission check to be enforced before the use case runs.
// authz must be non-nil; workspaceID may be nil for workspace-agnostic resources.
func (u *uc) WithPermission(authz gateway.Authorization, resource rbac.Resource, action rbac.Action, workspaceID ...accountdomain.WorkspaceID) *uc {
	u.authz = authz
	u.authzChecks = append(u.authzChecks, authzCheck{resource, action, workspaceID})
	return u
}

func Run0(ctx context.Context, op *usecase.Operator, r *repo.Container, e *uc, f func(context.Context) error) (err error) {
	_, _, _, err = Run3(
		ctx, op, r, e,
		func(ctx context.Context) (_, _, _ any, err error) {
			err = f(ctx)
			return
		})
	return
}

func Run1[A any](ctx context.Context, op *usecase.Operator, r *repo.Container, e *uc, f func(context.Context) (A, error)) (a A, err error) {
	a, _, _, err = Run3(
		ctx, op, r, e,
		func(ctx context.Context) (a A, _, _ any, err error) {
			a, err = f(ctx)
			return
		})
	return
}

func Run2[A, B any](ctx context.Context, op *usecase.Operator, r *repo.Container, e *uc, f func(context.Context) (A, B, error)) (a A, b B, err error) {
	a, b, _, err = Run3(
		ctx, op, r, e,
		func(ctx context.Context) (a A, b B, _ any, err error) {
			a, b, err = f(ctx)
			return
		})
	return
}

func Run3[A, B, C any](ctx context.Context, op *usecase.Operator, r *repo.Container, e *uc, f func(context.Context) (A, B, C, error)) (a A, b B, c C, err error) {
	if err = e.checkPermission(op); err != nil {
		return
	}
	if err = e.checkPermissions2(ctx); err != nil {
		return
	}

	var tr usecasex.Transaction
	if e.tx && r.Transaction != nil {
		tr = r.Transaction
	}

	err = usecasex.DoTransaction(ctx, tr, transactionRetry, func(ctx context.Context) error {
		a, b, c, err = f(ctx)
		return err
	})

	return
}

func (u *uc) checkPermissions2(ctx context.Context) error {
	if u.authz == nil || len(u.authzChecks) == 0 {
		return nil
	}
	for _, c := range u.authzChecks {
		allowed, err := u.authz.CheckPermission(ctx, c.resource, c.action, c.workspaceID...)
		if err != nil {
			return err
		}
		if !allowed {
			return interfaces.ErrOperationDenied
		}
	}
	return nil
}

func (u *uc) checkPermission(op *usecase.Operator) error {
	if op == nil {
		return nil
	}

	ok := true
	if u.readableWorkspaces != nil {
		ok = op.IsReadableWorkspace(u.readableWorkspaces...)
	}
	if ok && u.writableWorkspaces != nil {
		ok = op.IsWritableWorkspace(u.writableWorkspaces...)
	}
	if ok && u.maintainableWorkspaces != nil {
		ok = op.IsMaintainingWorkspace(u.maintainableWorkspaces...)
	}
	if ok && u.ownableWorkspaces != nil {
		ok = op.IsOwningWorkspace(u.ownableWorkspaces...)
	}
	if !ok {
		return interfaces.ErrOperationDenied
	}
	return nil
}
