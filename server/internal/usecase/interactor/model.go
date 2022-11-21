package interactor

import (
	"context"
	"errors"

	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/key"
	"github.com/reearth/reearth-cms/server/pkg/model"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/usecasex"
	"github.com/reearth/reearthx/util"
)

type Model struct {
	repos    *repo.Container
	gateways *gateway.Container
}

func NewModel(r *repo.Container, g *gateway.Container) interfaces.Model {
	return &Model{
		repos:    r,
		gateways: g,
	}
}

func (i Model) FindByIDs(ctx context.Context, ids []id.ModelID, operator *usecase.Operator) (model.List, error) {
	models, err := i.repos.Model.FindByIDs(ctx, ids)
	if err != nil {
		return nil, err
	}
	pIds := util.Map(models, func(m *model.Model) id.ProjectID { return m.Project() })
	projects, err := i.repos.Project.FindByIDs(ctx, pIds)
	if err != nil {
		return nil, err
	}
	wIDs := util.Map(projects, func(p *project.Project) id.WorkspaceID { return p.Workspace() })
	return Run1(ctx, operator, i.repos, Usecase().WithReadableWorkspaces(wIDs...).Transaction(),
		func() (model.List, error) {
			return i.repos.Model.FindByIDs(ctx, ids)
		})
}

func (i Model) FindByProject(ctx context.Context, projectID id.ProjectID, pagination *usecasex.Pagination, operator *usecase.Operator) (model.List, *usecasex.PageInfo, error) {
	p, err := i.repos.Project.FindByID(ctx, projectID)
	if err != nil {
		return nil, nil, err
	}
	return Run2(ctx, operator, i.repos, Usecase().WithReadableWorkspaces(p.Workspace()).Transaction(),
		func() (model.List, *usecasex.PageInfo, error) {
			return i.repos.Model.FindByProject(ctx, projectID, pagination)
		})
}

func (i Model) Create(ctx context.Context, param interfaces.CreateModelParam, operator *usecase.Operator) (*model.Model, error) {
	p, err := i.repos.Project.FindByID(ctx, param.ProjectId)
	if err != nil {
		return nil, err
	}
	return Run1(ctx, operator, i.repos, Usecase().WithWritableWorkspaces(p.Workspace()).Transaction(),
		func() (_ *model.Model, err error) {
			m, err := i.repos.Model.FindByKey(ctx, param.ProjectId, *param.Key)
			if err != nil && !errors.Is(err, rerror.ErrNotFound) {
				return nil, err
			}
			if m != nil {
				return nil, interfaces.ErrDuplicatedKey
			}
			s, err := schema.New().NewID().Workspace(p.Workspace()).Project(p.ID()).Build()
			if err != nil {
				return nil, err
			}
			if err := i.repos.Schema.Save(ctx, s); err != nil {
				return nil, err
			}

			mb := model.
				New().
				NewID().
				Schema(s.ID()).
				Public(false).
				Project(param.ProjectId)

			if param.Name != nil {
				mb = mb.Name(*param.Name)
			}
			if param.Description != nil {
				mb = mb.Description(*param.Description)
			}
			if param.Public != nil {
				mb = mb.Public(*param.Public)
			}
			if param.Key != nil {
				k := key.New(*param.Key)
				if !k.IsValid() {
					return nil, interfaces.ErrInvalidKey
				}
				mb = mb.Key(k)
			} else {
				mb = mb.Key(key.Random())
			}

			m, err = mb.Build()
			if err != nil {
				return nil, err
			}

			err = i.repos.Model.Save(ctx, m)
			if err != nil {
				return nil, err
			}
			return m, nil
		})
}

func (i Model) Update(ctx context.Context, param interfaces.UpdateModelParam, operator *usecase.Operator) (*model.Model, error) {
	m, err := i.repos.Model.FindByID(ctx, param.ModelId)
	if err != nil {
		return nil, err
	}
	p, err := i.repos.Project.FindByID(ctx, m.Project())
	if err != nil {
		return nil, err
	}

	return Run1(ctx, operator, i.repos, Usecase().WithWritableWorkspaces(p.Workspace()).Transaction(),
		func() (_ *model.Model, err error) {
			if param.Name != nil {
				m.SetName(*param.Name)
			}
			if param.Description != nil {
				m.SetDescription(*param.Description)
			}
			if param.Key != nil {
				if err := m.SetKey(key.New(*param.Key)); err != nil {
					return nil, err
				}
			}
			if param.Public != nil {
				m.SetPublic(*param.Public)
			}

			if err := i.repos.Model.Save(ctx, m); err != nil {
				return nil, err
			}
			return m, nil
		})
}

func (i Model) CheckKey(ctx context.Context, pId id.ProjectID, s string) (bool, error) {
	return Run1(ctx, nil, i.repos, Usecase().Transaction(),
		func() (bool, error) {
			if k := key.New(s); !k.IsValid() {
				return false, model.ErrInvalidKey
			}

			m, err := i.repos.Model.FindByKey(ctx, pId, s)
			if m == nil && err == nil || err != nil && errors.Is(err, rerror.ErrNotFound) {
				return true, nil
			}

			return false, err
		})
}

func (i Model) Delete(ctx context.Context, modelID id.ModelID, operator *usecase.Operator) error {
	m, err := i.repos.Model.FindByID(ctx, modelID)
	if err != nil {
		return err
	}
	p, err := i.repos.Project.FindByID(ctx, m.Project())
	if err != nil {
		return err
	}

	return Run0(ctx, operator, i.repos, Usecase().WithWritableWorkspaces(p.Workspace()).Transaction(),
		func() error {
			if err := i.repos.Model.Remove(ctx, modelID); err != nil {
				return err
			}
			return nil
		})
}

func (i Model) Publish(ctx context.Context, modelID id.ModelID, b bool, operator *usecase.Operator) (bool, error) {
	m, err := i.repos.Model.FindByID(ctx, modelID)
	if err != nil {
		return false, err
	}
	p, err := i.repos.Project.FindByID(ctx, m.Project())
	if err != nil {
		return false, err
	}

	return Run1(ctx, operator, i.repos, Usecase().WithWritableWorkspaces(p.Workspace()).Transaction(),
		func() (_ bool, err error) {
			m.SetPublic(b)

			if err := i.repos.Model.Save(ctx, m); err != nil {
				return false, err
			}
			return b, nil
		})
}
