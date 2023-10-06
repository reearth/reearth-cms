package interactor

import (
	"context"
	"errors"
	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/group"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/key"
	"github.com/reearth/reearth-cms/server/pkg/model"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearthx/rerror"
)

type Group struct {
	repos    *repo.Container
	gateways *gateway.Container
}

func NewGroup(r *repo.Container, g *gateway.Container) interfaces.Group {
	return &Group{
		repos:    r,
		gateways: g,
	}
}

func (i Group) FindByID(ctx context.Context, id id.GroupID, operator *usecase.Operator) (*group.Group, error) {
	return i.repos.Group.FindByID(ctx, id)
}

func (i Group) FindByIDs(ctx context.Context, ids id.GroupIDList, operator *usecase.Operator) (group.List, error) {
	return i.repos.Group.FindByIDs(ctx, ids)
}

func (i Group) FindByProject(ctx context.Context, projectID id.ProjectID, operator *usecase.Operator) (group.List, error) {
	return i.repos.Group.FindByProject(ctx, projectID)
}

func (i Group) FindByKey(ctx context.Context, pid id.ProjectID, group string, operator *usecase.Operator) (*group.Group, error) {
	return i.repos.Group.FindByKey(ctx, pid, group)
}

func (i Group) Create(ctx context.Context, param interfaces.CreateGroupParam, operator *usecase.Operator) (*group.Group, error) {
	return Run1(ctx, operator, i.repos, Usecase().Transaction(),
		func(ctx context.Context) (_ *group.Group, err error) {
			if !operator.IsMaintainingProject(param.ProjectId) {
				return nil, interfaces.ErrOperationDenied
			}
			p, err := i.repos.Project.FindByID(ctx, param.ProjectId)
			if err != nil {
				return nil, err
			}
			g, err := i.repos.Group.FindByKey(ctx, param.ProjectId, param.Key)
			if err != nil && !errors.Is(err, rerror.ErrNotFound) {
				return nil, err
			}
			if g != nil {
				return nil, id.ErrDuplicatedKey
			}
			s, err := schema.New().NewID().Workspace(p.Workspace()).Project(p.ID()).TitleField(nil).Build()
			if err != nil {
				return nil, err
			}

			if err := i.repos.Schema.Save(ctx, s); err != nil {
				return nil, err
			}

			mb := group.
				New().
				NewID().
				Schema(s.ID()).
				Key(key.New(param.Key)).
				Project(param.ProjectId)

			if param.Description != nil {
				mb = mb.Description(*param.Description)
			}

			g, err = mb.Build()
			if err != nil {
				return nil, err
			}

			err = i.repos.Group.Save(ctx, g)
			if err != nil {
				return nil, err
			}
			return g, nil
		})
}

func (i Group) Update(ctx context.Context, param interfaces.UpdateGroupParam, operator *usecase.Operator) (*group.Group, error) {
	return Run1(ctx, operator, i.repos, Usecase().Transaction(),
		func(ctx context.Context) (_ *group.Group, err error) {
			g, err := i.repos.Group.FindByID(ctx, param.GroupID)
			if err != nil {
				return nil, err
			}

			if !operator.IsMaintainingProject(g.Project()) {
				return nil, interfaces.ErrOperationDenied
			}

			if param.Name != nil {
				g.SetName(*param.Name)
			}
			if param.Description != nil {
				g.SetDescription(*param.Description)
			}
			if param.Key != nil && g.Key().String() != *param.Key {
				gg, err := i.repos.Group.FindByKey(ctx, g.Project(), *param.Key)
				if err != nil && !errors.Is(err, rerror.ErrNotFound) {
					return nil, err
				}
				if gg != nil {
					return nil, id.ErrDuplicatedKey
				}
				if err := g.SetKey(key.New(*param.Key)); err != nil {
					return nil, err
				}
			}

			if err := i.repos.Group.Save(ctx, g); err != nil {
				return nil, err
			}
			return g, nil
		})
}

func (i Group) CheckKey(ctx context.Context, pId id.ProjectID, s string) (bool, error) {
	return Run1(ctx, nil, i.repos, Usecase().Transaction(),
		func(ctx context.Context) (bool, error) {
			if k := key.New(s); !k.IsValid() {
				return false, id.ErrInvalidKey
			}

			g, err := i.repos.Group.FindByKey(ctx, pId, s)
			if g == nil && err == nil || err != nil && errors.Is(err, rerror.ErrNotFound) {
				return true, nil
			}

			return false, err
		})
}

func (i Group) Delete(ctx context.Context, groupID id.GroupID, operator *usecase.Operator) error {
	return Run0(ctx, operator, i.repos, Usecase().Transaction(),
		func(ctx context.Context) error {
			g, err := i.repos.Group.FindByID(ctx, groupID)
			if err != nil {
				return err
			}
			if !operator.IsMaintainingProject(g.Project()) {
				return interfaces.ErrOperationDenied
			}
			ml, err := i.getModelsByGroup(ctx, g)
			if err != nil {
				return err
			}
			if len(ml) != 0 {
				return interfaces.ErrDelGroupUsed
			}
			if err := i.repos.Group.Remove(ctx, groupID); err != nil {
				return err
			}
			return nil
		})
}

func (i Group) getModelsByGroup(ctx context.Context, g *group.Group) (res model.List, err error) {
	models, _, err := i.repos.Model.FindByProject(ctx, g.Project(), nil)
	if err != nil && !errors.Is(err, rerror.ErrNotFound) {
		return nil, err
	}
	msMap := make(map[id.SchemaID]*model.Model)
	var schemas id.SchemaIDList
	for _, m := range models {
		msMap[m.Schema()] = m
		schemas.Add(m.Schema())
	}

	sl, err := i.repos.Schema.FindByIDs(ctx, schemas)
	if err != nil {
		return nil, err
	}
	for _, s := range sl {
		for _, field := range s.Fields() {
			if field.Type() == value.TypeGroup {
				field.TypeProperty().Match(schema.TypePropertyMatch{
					Group: func(f *schema.FieldGroup) {
						if f.Group() == g.ID() {
							res = append(res, msMap[s.ID()])
						}
					},
				})
			}
		}

	}
	return
}
