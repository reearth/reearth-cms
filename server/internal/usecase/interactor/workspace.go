package interactor

import (
	"context"
	"strings"

	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/user"
	"github.com/reearth/reearthx/usecasex"
)

type Workspace struct {
	repos       *repo.Container
	transaction usecasex.Transaction
}

func NewWorkspace(r *repo.Container) interfaces.Workspace {
	return &Workspace{
		repos:       r,
		transaction: r.Transaction,
	}
}

func (i *Workspace) Fetch(ctx context.Context, ids []id.WorkspaceID, operator *usecase.Operator) ([]*user.Workspace, error) {
	return Run1(ctx, operator, i.repos, Usecase().Transaction(), func() ([]*user.Workspace, error) {
		res, err := i.repos.Workspace.FindByIDs(ctx, ids)
		res2, err := i.filterWorkspaces(res, operator, err)
		return res2, err
	})
}

func (i *Workspace) FindByUser(ctx context.Context, id id.UserID, operator *usecase.Operator) ([]*user.Workspace, error) {
	return Run1(ctx, operator, i.repos, Usecase().Transaction(), func() ([]*user.Workspace, error) {
		res, err := i.repos.Workspace.FindByUser(ctx, id)
		res2, err := i.filterWorkspaces(res, operator, err)
		return res2, err
	})
}

func (i *Workspace) Create(ctx context.Context, name string, firstUser id.UserID, operator *usecase.Operator) (_ *user.Workspace, err error) {
	return Run1(ctx, operator, i.repos, Usecase().Transaction(), func() (*user.Workspace, error) {
		if len(strings.TrimSpace(name)) == 0 {
			return nil, user.ErrInvalidName
		}

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

		if err := i.repos.Workspace.Save(ctx, workspace); err != nil {
			return nil, err
		}

		operator.AddNewWorkspace(workspace.ID())
		return workspace, nil
	})
}

func (i *Workspace) Update(ctx context.Context, id id.WorkspaceID, name string, operator *usecase.Operator) (_ *user.Workspace, err error) {
	return Run1(ctx, operator, i.repos, Usecase().Transaction(), func() (*user.Workspace, error) {
		workspace, err := i.repos.Workspace.FindByID(ctx, id)
		if err != nil {
			return nil, err
		}
		if workspace.IsPersonal() {
			return nil, user.ErrCannotModifyPersonalWorkspace
		}
		if workspace.Members().GetRole(operator.User) != user.RoleOwner {
			return nil, interfaces.ErrOperationDenied
		}

		if len(strings.TrimSpace(name)) == 0 {
			return nil, user.ErrInvalidName
		}

		workspace.Rename(name)

		err = i.repos.Workspace.Save(ctx, workspace)
		if err != nil {
			return nil, err
		}

		return workspace, nil
	})
}

func (i *Workspace) AddMember(ctx context.Context, id id.WorkspaceID, u id.UserID, role user.Role, operator *usecase.Operator) (_ *user.Workspace, err error) {
	return Run1(ctx, operator, i.repos, Usecase().Transaction(), func() (*user.Workspace, error) {
		workspace, err := i.repos.Workspace.FindByID(ctx, id)
		if err != nil {
			return nil, err
		}
		if workspace.IsPersonal() {
			return nil, user.ErrCannotModifyPersonalWorkspace
		}
		if workspace.Members().GetRole(operator.User) != user.RoleOwner {
			return nil, interfaces.ErrOperationDenied
		}

		_, err = i.repos.User.FindByID(ctx, u)
		if err != nil {
			return nil, err
		}

		err = workspace.Members().Join(u, role)
		if err != nil {
			return nil, err
		}

		err = i.repos.Workspace.Save(ctx, workspace)
		if err != nil {
			return nil, err
		}

		return workspace, nil
	})
}

func (i *Workspace) RemoveMember(ctx context.Context, id id.WorkspaceID, u id.UserID, operator *usecase.Operator) (_ *user.Workspace, err error) {
	return Run1(ctx, operator, i.repos, Usecase().Transaction(), func() (*user.Workspace, error) {
		workspace, err := i.repos.Workspace.FindByID(ctx, id)
		if err != nil {
			return nil, err
		}
		if workspace.IsPersonal() {
			return nil, user.ErrCannotModifyPersonalWorkspace
		}
		if workspace.Members().GetRole(operator.User) != user.RoleOwner {
			return nil, interfaces.ErrOperationDenied
		}

		if u == operator.User {
			return nil, interfaces.ErrOwnerCannotLeaveTheWorkspace
		}

		err = workspace.Members().Leave(u)
		if err != nil {
			return nil, err
		}

		err = i.repos.Workspace.Save(ctx, workspace)
		if err != nil {
			return nil, err
		}

		return workspace, nil
	})
}

func (i *Workspace) UpdateMember(ctx context.Context, id id.WorkspaceID, u id.UserID, role user.Role, operator *usecase.Operator) (_ *user.Workspace, err error) {
	return Run1(ctx, operator, i.repos, Usecase().Transaction(), func() (*user.Workspace, error) {
		workspace, err := i.repos.Workspace.FindByID(ctx, id)
		if err != nil {
			return nil, err
		}
		if workspace.IsPersonal() {
			return nil, user.ErrCannotModifyPersonalWorkspace
		}
		if workspace.Members().GetRole(operator.User) != user.RoleOwner {
			return nil, interfaces.ErrOperationDenied
		}

		if u == operator.User {
			return nil, interfaces.ErrCannotChangeOwnerRole
		}

		err = workspace.Members().UpdateRole(u, role)
		if err != nil {
			return nil, err
		}

		err = i.repos.Workspace.Save(ctx, workspace)
		if err != nil {
			return nil, err
		}

		return workspace, nil
	})
}

func (i *Workspace) Remove(ctx context.Context, id id.WorkspaceID, operator *usecase.Operator) error {
	return Run0(ctx, operator, i.repos, Usecase().Transaction(), func() error {
		workspace, err := i.repos.Workspace.FindByID(ctx, id)
		if err != nil {
			return err
		}
		if workspace.IsPersonal() {
			return user.ErrCannotModifyPersonalWorkspace
		}
		if workspace.Members().GetRole(operator.User) != user.RoleOwner {
			return interfaces.ErrOperationDenied
		}

		projectCount, err := i.repos.Project.CountByWorkspace(ctx, id)
		if err != nil {
			return err
		}
		if projectCount > 0 {
			return interfaces.ErrWorkspaceWithProjects
		}

		err = i.repos.Workspace.Remove(ctx, id)
		if err != nil {
			return err
		}

		return nil
	})
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
