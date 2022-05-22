package interactor

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/user"
)

type Workspace struct {
	common
	workspaceRepo repo.Workspace
	userRepo      repo.User
	transaction   repo.Transaction
}

func NewWorkspace(r *repo.Container) interfaces.Workspace {
	return &Workspace{
		workspaceRepo: r.Workspace,
		userRepo:      r.User,
		transaction:   r.Transaction,
	}
}

func (i *Workspace) Fetch(ctx context.Context, ids []id.WorkspaceID, operator *usecase.Operator) ([]*user.Workspace, error) {
	if err := i.OnlyOperator(operator); err != nil {
		return nil, err
	}
	res, err := i.workspaceRepo.FindByIDs(ctx, ids)
	res2, err := i.filterWorkspaces(res, operator, err)
	return res2, err
}

func (i *Workspace) FindByUser(ctx context.Context, id id.UserID, operator *usecase.Operator) ([]*user.Workspace, error) {
	if err := i.OnlyOperator(operator); err != nil {
		return nil, err
	}
	res, err := i.workspaceRepo.FindByUser(ctx, id)
	res2, err := i.filterWorkspaces(res, operator, err)
	return res2, err
}

func (i *Workspace) Create(ctx context.Context, name string, firstUser id.UserID, operator *usecase.Operator) (_ *user.Workspace, err error) {
	tx, err := i.transaction.Begin()
	if err != nil {
		return
	}
	defer func() {
		if err2 := tx.End(ctx); err == nil && err2 != nil {
			err = err2
		}
	}()

	workspace, err := user.NewWorkspace().
		NewID().
		Name(name).
		Build()
	if err != nil {
		return nil, err
	}

	if err := workspace.Members().Join(firstUser, user.RoleOwner); err != nil {
		return nil, err
	}

	if err := i.workspaceRepo.Save(ctx, workspace); err != nil {
		return nil, err
	}

	operator.AddNewWorkspace(workspace.ID())
	tx.Commit()
	return workspace, nil
}

func (i *Workspace) Update(ctx context.Context, id id.WorkspaceID, name string, operator *usecase.Operator) (_ *user.Workspace, err error) {
	tx, err := i.transaction.Begin()
	if err != nil {
		return
	}
	defer func() {
		if err2 := tx.End(ctx); err == nil && err2 != nil {
			err = err2
		}
	}()

	if operator == nil {
		return nil, interfaces.ErrOperationDenied
	}

	workspace, err := i.workspaceRepo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if workspace.IsPersonal() {
		return nil, user.ErrCannotModifyPersonalWorkspace
	}
	if workspace.Members().GetRole(operator.User) != user.RoleOwner {
		return nil, interfaces.ErrOperationDenied
	}

	workspace.Rename(name)

	err = i.workspaceRepo.Save(ctx, workspace)
	if err != nil {
		return nil, err
	}

	tx.Commit()
	return workspace, nil
}

func (i *Workspace) AddMember(ctx context.Context, id id.WorkspaceID, u id.UserID, role user.Role, operator *usecase.Operator) (_ *user.Workspace, err error) {
	tx, err := i.transaction.Begin()
	if err != nil {
		return
	}
	defer func() {
		if err2 := tx.End(ctx); err == nil && err2 != nil {
			err = err2
		}
	}()

	if operator == nil {
		return nil, interfaces.ErrOperationDenied
	}

	workspace, err := i.workspaceRepo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if workspace.IsPersonal() {
		return nil, user.ErrCannotModifyPersonalWorkspace
	}
	if workspace.Members().GetRole(operator.User) != user.RoleOwner {
		return nil, interfaces.ErrOperationDenied
	}

	_, err = i.userRepo.FindByID(ctx, u)
	if err != nil {
		return nil, err
	}

	err = workspace.Members().Join(u, role)
	if err != nil {
		return nil, err
	}

	err = i.workspaceRepo.Save(ctx, workspace)
	if err != nil {
		return nil, err
	}

	tx.Commit()
	return workspace, nil
}

func (i *Workspace) RemoveMember(ctx context.Context, id id.WorkspaceID, u id.UserID, operator *usecase.Operator) (_ *user.Workspace, err error) {
	tx, err := i.transaction.Begin()
	if err != nil {
		return
	}
	defer func() {
		if err2 := tx.End(ctx); err == nil && err2 != nil {
			err = err2
		}
	}()

	if operator == nil {
		return nil, interfaces.ErrOperationDenied
	}

	workspace, err := i.workspaceRepo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if workspace.IsPersonal() {
		return nil, user.ErrCannotModifyPersonalWorkspace
	}
	if workspace.Members().GetRole(operator.User) != user.RoleOwner {
		return nil, interfaces.ErrOperationDenied
	}

	if u.Equal(operator.User) {
		return nil, interfaces.ErrOwnerCannotLeaveTheWorkspace
	}

	err = workspace.Members().Leave(u)
	if err != nil {
		return nil, err
	}

	err = i.workspaceRepo.Save(ctx, workspace)
	if err != nil {
		return nil, err
	}

	tx.Commit()
	return workspace, nil
}

func (i *Workspace) UpdateMember(ctx context.Context, id id.WorkspaceID, u id.UserID, role user.Role, operator *usecase.Operator) (_ *user.Workspace, err error) {
	tx, err := i.transaction.Begin()
	if err != nil {
		return
	}
	defer func() {
		if err2 := tx.End(ctx); err == nil && err2 != nil {
			err = err2
		}
	}()

	if operator == nil {
		return nil, interfaces.ErrOperationDenied
	}

	workspace, err := i.workspaceRepo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if workspace.IsPersonal() {
		return nil, user.ErrCannotModifyPersonalWorkspace
	}
	if workspace.Members().GetRole(operator.User) != user.RoleOwner {
		return nil, interfaces.ErrOperationDenied
	}

	if u.Equal(operator.User) {
		return nil, interfaces.ErrCannotChangeOwnerRole
	}

	err = workspace.Members().UpdateRole(u, role)
	if err != nil {
		return nil, err
	}

	err = i.workspaceRepo.Save(ctx, workspace)
	if err != nil {
		return nil, err
	}

	tx.Commit()
	return workspace, nil
}

func (i *Workspace) Remove(ctx context.Context, id id.WorkspaceID, operator *usecase.Operator) (err error) {
	tx, err := i.transaction.Begin()
	if err != nil {
		return
	}
	defer func() {
		if err2 := tx.End(ctx); err == nil && err2 != nil {
			err = err2
		}
	}()

	if operator == nil {
		return interfaces.ErrOperationDenied
	}

	workspace, err := i.workspaceRepo.FindByID(ctx, id)
	if err != nil {
		return err
	}
	if workspace.IsPersonal() {
		return user.ErrCannotModifyPersonalWorkspace
	}
	if workspace.Members().GetRole(operator.User) != user.RoleOwner {
		return interfaces.ErrOperationDenied
	}

	err = i.workspaceRepo.Remove(ctx, id)
	if err != nil {
		return err
	}

	tx.Commit()
	return
}

func (i *Workspace) filterWorkspaces(workspaces []*user.Workspace, operator *usecase.Operator, err error) ([]*user.Workspace, error) {
	if err != nil {
		return nil, err
	}
	if operator == nil {
		return make([]*user.Workspace, len(workspaces)), nil
	}
	for i, t := range workspaces {
		if t == nil || !operator.IsReadableWorkspace(t.ID()) {
			workspaces[i] = nil
		}
	}
	return workspaces, nil
}
