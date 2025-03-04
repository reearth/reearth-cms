package interactor

import (
	"context"
	"time"

	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/account/accountdomain/workspace"
	"github.com/reearth/reearthx/usecasex"
)

type Project struct {
	repos    *repo.Container
	gateways *gateway.Container
}

func NewProject(r *repo.Container, g *gateway.Container) interfaces.Project {
	return &Project{
		repos:    r,
		gateways: g,
	}
}

func (i *Project) Fetch(ctx context.Context, ids []id.ProjectID, operator *usecase.Operator) (project.List, error) {
	return i.repos.Project.FindByIDs(ctx, ids)
}

func (i *Project) FindByWorkspace(ctx context.Context, wid accountdomain.WorkspaceID, p *usecasex.Pagination, operator *usecase.Operator) (project.List, *usecasex.PageInfo, error) {
	return i.repos.Project.FindByWorkspaces(ctx, accountdomain.WorkspaceIDList{wid}, p)
}

func (i *Project) FindByIDOrAlias(ctx context.Context, id project.IDOrAlias, operator *usecase.Operator) (*project.Project, error) {
	return i.repos.Project.FindByIDOrAlias(ctx, id)
}

func (i *Project) Create(ctx context.Context, p interfaces.CreateProjectParam, operator *usecase.Operator) (_ *project.Project, err error) {
	return Run1(ctx, operator, i.repos, Usecase().WithMaintainableWorkspaces(p.WorkspaceID).Transaction(),
		func(ctx context.Context) (_ *project.Project, err error) {
			pb := project.New().
				NewID().
				Workspace(p.WorkspaceID)
			if p.Name != nil {
				pb = pb.Name(*p.Name)
			}
			if p.Description != nil {
				pb = pb.Description(*p.Description)
			}
			if p.Alias != nil {
				if ok, _ := i.repos.Project.IsAliasAvailable(ctx, *p.Alias); !ok {
					return nil, interfaces.ErrProjectAliasAlreadyUsed
				}
				pb = pb.Alias(*p.Alias)
			}
			if len(p.RequestRoles) > 0 {
				pb = pb.RequestRoles(p.RequestRoles)
			} else {
				pb = pb.RequestRoles([]workspace.Role{})
			}

			proj, err := pb.Build()
			if err != nil {
				return nil, err
			}

			err = i.repos.Project.Save(ctx, proj)
			if err != nil {
				return nil, err
			}
			return proj, nil
		})
}

func (i *Project) Update(ctx context.Context, p interfaces.UpdateProjectParam, operator *usecase.Operator) (_ *project.Project, err error) {
	proj, err := i.repos.Project.FindByID(ctx, p.ID)
	if err != nil {
		return nil, err
	}
	return Run1(ctx, operator, i.repos, Usecase().WithMaintainableWorkspaces(proj.Workspace()).Transaction(),
		func(ctx context.Context) (_ *project.Project, err error) {
			if p.Name != nil {
				proj.UpdateName(*p.Name)
			}

			if p.Description != nil {
				proj.UpdateDescription(*p.Description)
			}

			if p.Alias != nil && *p.Alias != proj.Alias() {
				if ok, _ := i.repos.Project.IsAliasAvailable(ctx, *p.Alias); !ok {
					return nil, interfaces.ErrProjectAliasAlreadyUsed
				}

				if err := proj.UpdateAlias(*p.Alias); err != nil {
					return nil, err
				}
			}

			if p.Publication != nil {
				pub := proj.Publication()
				if pub == nil {
					pub = project.NewPublication(project.PublicationScopePrivate, false)
				}
				if p.Publication.Scope != nil {
					pub.SetScope(*p.Publication.Scope)
				}
				if p.Publication.AssetPublic != nil {
					pub.SetAssetPublic(*p.Publication.AssetPublic)
				}
				proj.SetPublication(pub)
			}

			if p.RequestRoles != nil {
				proj.SetRequestRoles(p.RequestRoles)
			}

			if err := i.repos.Project.Save(ctx, proj); err != nil {
				return nil, err
			}

			return proj, nil
		})
}

func (i *Project) CheckAlias(ctx context.Context, alias string) (bool, error) {
	return Run1(ctx, nil, i.repos, Usecase().Transaction(),
		func(ctx context.Context) (bool, error) {
			if !project.CheckAliasPattern(alias) {
				return false, project.ErrInvalidAlias
			}

			return i.repos.Project.IsAliasAvailable(ctx, alias)
		})
}

func (i *Project) Delete(ctx context.Context, projectID id.ProjectID, operator *usecase.Operator) (err error) {
	proj, err := i.repos.Project.FindByID(ctx, projectID)
	if err != nil {
		return err
	}
	return Run0(ctx, operator, i.repos, Usecase().WithMaintainableWorkspaces(proj.Workspace()).Transaction(),
		func(ctx context.Context) error {
			if !operator.IsOwningWorkspace(proj.Workspace()) {
				return interfaces.ErrOperationDenied
			}
			if err := i.repos.Project.Remove(ctx, projectID); err != nil {
				return err
			}
			return nil
		})
}

func (i *Project) RegenerateToken(ctx context.Context, pId id.ProjectID, operator *usecase.Operator) (*project.Project, error) {
	if operator.AcOperator.User == nil {
		return nil, interfaces.ErrInvalidOperator
	}
	return Run1(ctx, operator, i.repos, Usecase().Transaction(),
		func(ctx context.Context) (*project.Project, error) {
			p, err := i.repos.Project.FindByID(ctx, pId)
			if err != nil {
				return nil, err
			}

			// check if the user is the owner of the project
			if !operator.IsOwningProject(p.ID()) {
				return nil, interfaces.ErrOperationDenied
			}

			if p.Publication() == nil || p.Publication().Scope() != project.PublicationScopeLimited {
				return nil, interfaces.ErrInvalidProject
			}

			p.Publication().GenerateToken()
			p.SetUpdatedAt(time.Now())
			if err := i.repos.Project.Save(ctx, p); err != nil {
				return nil, err
			}

			return p, nil
		})
}
