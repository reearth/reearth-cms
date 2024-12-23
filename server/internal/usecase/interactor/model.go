package interactor

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"

	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/model"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/task"
	"github.com/reearth/reearthx/i18n"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/usecasex"
	"github.com/samber/lo"
	"go.mongodb.org/mongo-driver/bson"
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

func (i Model) FindByID(ctx context.Context, id id.ModelID, _ *usecase.Operator) (*model.Model, error) {
	return i.repos.Model.FindByID(ctx, id)
}

func (i Model) FindBySchema(ctx context.Context, id id.SchemaID, _ *usecase.Operator) (*model.Model, error) {
	return i.repos.Model.FindBySchema(ctx, id)
}

func (i Model) FindByIDs(ctx context.Context, ids []id.ModelID, _ *usecase.Operator) (model.List, error) {
	return i.repos.Model.FindByIDs(ctx, ids)
}

func (i Model) FindByProject(ctx context.Context, projectID id.ProjectID, pagination *usecasex.Pagination, _ *usecase.Operator) (model.List, *usecasex.PageInfo, error) {
	m, p, err := i.repos.Model.FindByProject(ctx, projectID, pagination)
	if err != nil {
		return nil, nil, err
	}
	return m.Ordered(), p, nil
}

func (i Model) FindByProjectAndKeyword(ctx context.Context, projectID id.ProjectID, k string, pagination *usecasex.Pagination, _ *usecase.Operator) (model.List, *usecasex.PageInfo, error) {
	m, p, err := i.repos.Model.FindByProjectAndKeyword(ctx, projectID, k, pagination)
	if err != nil {
		return nil, nil, err
	}
	return m.Ordered(), p, nil
}

func (i Model) FindByKey(ctx context.Context, pid id.ProjectID, model string, _ *usecase.Operator) (*model.Model, error) {
	return i.repos.Model.FindByKey(ctx, pid, model)
}

func (i Model) FindByIDOrKey(ctx context.Context, p id.ProjectID, q model.IDOrKey, _ *usecase.Operator) (*model.Model, error) {
	return i.repos.Model.FindByIDOrKey(ctx, p, q)
}

func (i Model) Create(ctx context.Context, param interfaces.CreateModelParam, operator *usecase.Operator) (*model.Model, error) {
	return Run1(ctx, operator, i.repos, Usecase().Transaction(),
		func(ctx context.Context) (_ *model.Model, err error) {
			if !operator.IsMaintainingProject(param.ProjectId) {
				return nil, interfaces.ErrOperationDenied
			}
			p, err := i.repos.Project.FindByID(ctx, param.ProjectId)
			if err != nil {
				return nil, err
			}
			m, err := i.repos.Model.FindByKey(ctx, param.ProjectId, *param.Key)
			if err != nil && !errors.Is(err, rerror.ErrNotFound) {
				return nil, err
			}
			if m != nil {
				return nil, id.ErrDuplicatedKey
			}
			s, err := schema.New().NewID().Workspace(p.Workspace()).Project(p.ID()).TitleField(nil).Build()
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
				mb = mb.Key(id.NewKey(*param.Key))
			} else {
				mb = mb.Key(id.RandomKey())
			}
			models, _, err := i.repos.Model.FindByProject(ctx, param.ProjectId, usecasex.CursorPagination{First: lo.ToPtr(int64(1000))}.Wrap())
			if err != nil {
				return nil, err
			}

			if len(models) > 0 {
				mb = mb.Order(len(models))
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
	return Run1(ctx, operator, i.repos, Usecase().Transaction(),
		func(ctx context.Context) (_ *model.Model, err error) {
			m, err := i.repos.Model.FindByID(ctx, param.ModelID)
			if err != nil {
				return nil, err
			}

			if !operator.IsMaintainingProject(m.Project()) {
				return nil, interfaces.ErrOperationDenied
			}

			if param.Name != nil {
				m.SetName(*param.Name)
			}
			if param.Description != nil {
				m.SetDescription(*param.Description)
			}
			if param.Key != nil {
				if err := m.SetKey(id.NewKey(*param.Key)); err != nil {
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
		func(ctx context.Context) (bool, error) {
			if k := id.NewKey(s); !k.IsValid() {
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
	return Run0(ctx, operator, i.repos, Usecase().Transaction(),
		func(ctx context.Context) error {
			m, err := i.repos.Model.FindByID(ctx, modelID)
			if err != nil {
				return err
			}
			if !operator.IsMaintainingProject(m.Project()) {
				return interfaces.ErrOperationDenied
			}

			models, _, err := i.repos.Model.FindByProject(ctx, m.Project(), usecasex.CursorPagination{First: lo.ToPtr(int64(1000))}.Wrap())
			if err != nil {
				return err
			}
			res := models.Remove(modelID)
			if err := i.repos.Model.Remove(ctx, modelID); err != nil {
				return err
			}
			if err := i.repos.Model.SaveAll(ctx, res); err != nil {
				return err
			}
			return nil
		})
}

func (i Model) Publish(ctx context.Context, modelID id.ModelID, b bool, operator *usecase.Operator) (bool, error) {
	return Run1(ctx, operator, i.repos, Usecase().Transaction(),
		func(ctx context.Context) (_ bool, err error) {
			m, err := i.repos.Model.FindByID(ctx, modelID)
			if err != nil {
				return false, err
			}
			if !operator.IsMaintainingProject(m.Project()) {
				return m.Public(), interfaces.ErrOperationDenied
			}

			m.SetPublic(b)

			if err := i.repos.Model.Save(ctx, m); err != nil {
				return false, err
			}
			return b, nil
		})
}

func (i Model) FindOrCreateSchema(ctx context.Context, param interfaces.FindOrCreateSchemaParam, operator *usecase.Operator) (*schema.Schema, error) {
	return Run1(ctx, operator, i.repos, Usecase().Transaction(),
		func(ctx context.Context) (_ *schema.Schema, err error) {
			var sid id.SchemaID
			if param.ModelID != nil {
				m, err := i.repos.Model.FindByID(ctx, *param.ModelID)
				if err != nil {
					return nil, err
				}
				sid = m.Schema()
				// check if the finding a metadata schema
				if param.Metadata != nil && *param.Metadata {
					if m.Metadata() != nil {
						return i.repos.Schema.FindByID(ctx, *m.Metadata())
					}
					// check if allowing creation
					if param.Create {
						p, err := i.repos.Project.FindByID(ctx, m.Project())
						if err != nil {
							return nil, err
						}
						if !operator.IsMaintainingProject(p.ID()) {
							return nil, interfaces.ErrOperationDenied
						}

						s, err := schema.New().NewID().Workspace(p.Workspace()).Project(p.ID()).TitleField(nil).Build()
						if err != nil {
							return nil, err
						}

						m.SetMetadata(s.ID())

						if err := i.repos.Schema.Save(ctx, s); err != nil {
							return nil, err
						}

						if err := i.repos.Model.Save(ctx, m); err != nil {
							return nil, err
						}
						return s, nil
					}
					// otherwise return error
					return nil, rerror.NewE(i18n.T("metadata schema not found"))
				}
			} else if param.GroupID != nil {
				g, err := i.repos.Group.FindByID(ctx, *param.GroupID)
				if err != nil {
					return nil, err
				}
				sid = g.Schema()
			} else {
				return nil, interfaces.ErrEitherModelOrGroup
			}

			// otherwise return standard schema
			return i.repos.Schema.FindByID(ctx, sid)
		})
}

func (i Model) UpdateOrder(ctx context.Context, ids id.ModelIDList, operator *usecase.Operator) (model.List, error) {
	return Run1(ctx, operator, i.repos, Usecase().Transaction(),
		func(ctx context.Context) (_ model.List, err error) {
			if len(ids) == 0 {
				return nil, nil
			}
			models, err := i.repos.Model.FindByIDs(ctx, ids)
			if err != nil {
				return nil, err
			}
			if len(models) != len(ids) {
				return nil, rerror.ErrNotFound
			}

			if !operator.IsMaintainingProject(models.Projects()...) {
				return nil, interfaces.ErrOperationDenied
			}
			ordered := models.OrderByIDs(ids)
			if err := i.repos.Model.SaveAll(ctx, ordered); err != nil {
				return nil, err
			}
			return ordered, nil
		})
}

func (i Model) Copy(ctx context.Context, params interfaces.CopyModelParam, operator *usecase.Operator) (*model.Model, error) {
	return Run1(ctx, operator, i.repos, Usecase().Transaction(),
		func(ctx context.Context) (*model.Model, error) {
			// copy model
			oldModel, newModel, err := i.copyModel(ctx, params, operator)
			if err != nil {
				return nil, err
			}
			// copy schema
			if err := i.copySchema(ctx, oldModel.Schema(), newModel.Schema()); err != nil {
				return nil, err
			}
			// copy items
			if err := i.copyItems(ctx, oldModel.Schema(), newModel.Schema(), newModel.ID()); err != nil {
				return nil, err
			}
			// copy metadata
			if oldModel.Metadata() != nil {
				// copy meta schema
				newMetaSchema, err := i.copyMetaSchema(ctx, *oldModel.Metadata(), newModel)
				if err != nil {
					return nil, err
				}
				// copy meta items
				if err := i.copyItems(ctx, *oldModel.Metadata(), newMetaSchema.ID(), newModel.ID()); err != nil {
					return nil, err
				}
			}
			// return the new model
			return newModel, nil
		})
}

func (i Model) copyModel(ctx context.Context, params interfaces.CopyModelParam, operator *usecase.Operator) (*model.Model, *model.Model, error) {
	oldModel, err := i.repos.Model.FindByID(ctx, params.ModelId)
	if err != nil {
		return nil, nil, err
	}
	name := lo.ToPtr(oldModel.Name() + " Copy")
	if params.Name != nil {
		name = params.Name
	}
	newModel, err := i.Create(ctx, interfaces.CreateModelParam{
		ProjectId:   oldModel.Project(),
		Name:        name,
		Description: lo.ToPtr(oldModel.Description()),
		Key:         id.RandomKey().Ref().StringRef(),
		Public:      lo.ToPtr(oldModel.Public()),
	}, operator)
	if err != nil {
		return nil, nil, err
	}
	return oldModel, newModel, nil
}

func (i Model) copySchema(ctx context.Context, oldSchemaId, newSchemaId id.SchemaID) error {
	oldSchema, err := i.repos.Schema.FindByID(ctx, oldSchemaId)
	if err != nil {
		return err
	}
	newSchema, err := i.repos.Schema.FindByID(ctx, newSchemaId)
	if err != nil {
		return err
	}
	newSchema.CopyFrom(oldSchema)
	return i.repos.Schema.Save(ctx, newSchema)
}

func (i Model) copyMetaSchema(ctx context.Context, oldMetaSchemaId id.SchemaID, newModel *model.Model) (*schema.Schema, error) {
	oldMetaSchema, err := i.repos.Schema.FindByID(ctx, oldMetaSchemaId)
	if err != nil {
		return nil, err
	}
	newMetaSchema, err := schema.New().
		NewID().
		Workspace(oldMetaSchema.Workspace()).
		Project(oldMetaSchema.Project()).
		TitleField(nil).
		Build()
	if err != nil {
		return nil, err
	}
	newMetaSchema.CopyFrom(oldMetaSchema)
	newModel.SetMetadata(newMetaSchema.ID())
	if err := i.repos.Model.Save(ctx, newModel); err != nil {
		return nil, err
	}
	if err := i.repos.Schema.Save(ctx, newMetaSchema); err != nil {
		return nil, err
	}
	return newMetaSchema, nil
}

func (i Model) copyItems(ctx context.Context, oldSchemaID, newSchemaID id.SchemaID, newModelID id.ModelID) error {
	collection := "item"
	filter, err := json.Marshal(bson.M{"schema": oldSchemaID.String()})
	if err != nil {
		return err
	}
	changes, err := json.Marshal(task.Changes{
		"id": {
			Type:  task.ChangeTypeNew,
			Value: "item",
		},
		"schema": {
			Type:  task.ChangeTypeSet,
			Value: newSchemaID.String(),
		},
		"model": {
			Type:  task.ChangeTypeSet,
			Value: newModelID.String(),
		},
	})
	if err != nil {
		return err
	}
	return i.triggerCopyEvent(ctx, collection, string(filter), string(changes))
}

func (i Model) triggerCopyEvent(ctx context.Context, collection, filter, changes string) error {
	if i.gateways.TaskRunner == nil {
		log.Infof("model: copy of %s skipped because task runner is not configured", collection)
		return nil
	}

	taskPayload := task.CopyPayload{
		Collection: collection,
		Filter:     filter,
		Changes:    changes,
	}

	if err := i.gateways.TaskRunner.Run(ctx, taskPayload.Payload()); err != nil {
		return fmt.Errorf("failed to trigger copy event: %w", err)
	}

	log.Infof("model: successfully triggered copy event for %s", collection)
	return nil
}
