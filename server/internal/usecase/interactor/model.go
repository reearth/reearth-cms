package interactor

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/event"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/model"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearth-cms/server/pkg/task"
	"github.com/reearth/reearthx/i18n"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/usecasex"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
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
	return m, p, nil
}

func (i Model) FindByProjectAndKeyword(ctx context.Context, params interfaces.FindByProjectAndKeywordParam, _ *usecase.Operator) (model.List, *usecasex.PageInfo, error) {
	m, p, err := i.repos.Model.FindByProjectAndKeyword(ctx, params.ProjectID, params.Keyword, params.Sort, params.Pagination)
	if err != nil {
		return nil, nil, err
	}
	return m, p, nil
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
			if !operator.IsWritableProject(param.ProjectId) {
				return nil, interfaces.ErrOperationDenied
			}

			return i.create(ctx, param)
		})
}

func (i Model) create(ctx context.Context, param interfaces.CreateModelParam) (*model.Model, error) {
	p, err := i.repos.Project.FindByID(ctx, param.ProjectId)
	if err != nil {
		return nil, err
	}

	currentModelNumber, err := i.repos.Model.CountByProject(ctx, p.ID())
	if err != nil {
		return nil, err
	}

	if i.gateways != nil && i.gateways.PolicyChecker != nil {
		policyResp, err := i.gateways.PolicyChecker.CheckPolicy(ctx, gateway.PolicyCheckRequest{
			WorkspaceID: p.Workspace(),
			CheckType:   gateway.PolicyCheckModelCountPerProject,
			Value:       int64(currentModelNumber),
		})
		if err != nil {
			return nil, err
		}
		if !policyResp.Allowed {
			return nil, interfaces.ErrModelCountPerProjectExceeded
		}
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
		Project(param.ProjectId)

	if param.Name != nil {
		mb = mb.Name(*param.Name)
	}
	if param.Description != nil {
		mb = mb.Description(*param.Description)
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
}

func (i Model) Update(ctx context.Context, param interfaces.UpdateModelParam, operator *usecase.Operator) (*model.Model, error) {
	return Run1(ctx, operator, i.repos, Usecase().Transaction(),
		func(ctx context.Context) (_ *model.Model, err error) {
			m, err := i.repos.Model.FindByID(ctx, param.ModelID)
			if err != nil {
				return nil, err
			}

			if !operator.IsWritableProject(m.Project()) {
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

func (i Model) Delete(ctx context.Context, modelID id.ModelID, sp schema.Package, operator *usecase.Operator) error {
	return Run0(ctx, operator, i.repos, Usecase().Transaction(),
		func(ctx context.Context) error {
			m, err := i.repos.Model.FindByID(ctx, modelID)
			if err != nil {
				return err
			}
			if !operator.IsWritableProject(m.Project()) {
				return interfaces.ErrOperationDenied
			}

			// delete all views for this model
			if err := i.repos.View.RemoveByModel(ctx, modelID); err != nil {
				return err
			}

			prj, err := i.repos.Project.FindByID(ctx, m.Project())
			if err != nil {
				return err
			}

			// delete all items for this model
			if err := i.deleteItemsByModel(ctx, prj, m, sp, operator); err != nil {
				return err
			}

			// remove reference fields in sibling schemas that point to this model's schema
			if err := i.removeReferenceFieldsPointingToSchema(ctx, m); err != nil {
				return err
			}

			// delete the model's schema
			if err := i.repos.Schema.Remove(ctx, m.Schema()); err != nil {
				return err
			}

			// delete the metadata schema if present
			if m.Metadata() != nil {
				if err := i.repos.Schema.Remove(ctx, *m.Metadata()); err != nil {
					return err
				}
			}

			// delete the model and reorder siblings
			models, _, err := i.repos.Model.FindByProject(ctx, m.Project(), usecasex.CursorPagination{First: lo.ToPtr(int64(1000))}.Wrap())
			if err != nil {
				return err
			}
			res := models.Remove(modelID)
			if err := i.repos.Model.Remove(ctx, modelID); err != nil {
				return err
			}
			return i.repos.Model.SaveAll(ctx, res)
		})
}

func (i Model) removeReferenceFieldsPointingToSchema(ctx context.Context, m *model.Model) error {
	deletedSchemaID := m.Schema()

	siblings, _, err := i.repos.Model.FindByProject(ctx, m.Project(), usecasex.CursorPagination{First: lo.ToPtr(int64(1000))}.Wrap())
	if err != nil {
		return err
	}

	// Only collect main schema IDs — metadata schemas never hold reference fields.
	var siblingSchemaIDs id.SchemaIDList
	for _, sib := range siblings {
		if sib.ID() == m.ID() {
			continue
		}
		siblingSchemaIDs = append(siblingSchemaIDs, sib.Schema())
	}
	if len(siblingSchemaIDs) == 0 {
		return nil
	}

	schemas, err := i.repos.Schema.FindByIDs(ctx, siblingSchemaIDs)
	if err != nil {
		return err
	}

	for _, s := range schemas {
		if s == nil {
			continue
		}
		var toRemove id.FieldIDList
		for _, f := range s.FieldsByType(value.TypeReference) {
			fr, ok := schema.FieldReferenceFromTypeProperty(f.TypeProperty())
			if !ok || fr.Schema() != deletedSchemaID {
				continue
			}
			toRemove = append(toRemove, f.ID())
		}
		if len(toRemove) == 0 {
			continue
		}
		for _, fid := range toRemove {
			s.RemoveField(fid)
		}
		if err := i.repos.Schema.Save(ctx, s); err != nil {
			return err
		}
	}

	return nil
}

func (i Model) deleteItemsByModel(ctx context.Context, prj *project.Project, m *model.Model, sp schema.Package, operator *usecase.Operator) error {
	const pageSize = int64(100)
	var cursor *usecasex.Cursor

	itemInteractor := NewItem(i.repos, i.gateways)

	var allThreadIDs id.ThreadIDList
	var allEvents []Event

	// collect thread IDs, events, and clean up cross-model references
	for {
		vList, pageInfo, err := i.repos.Item.FindByModel(ctx, m.ID(), nil, nil,
			usecasex.CursorPagination{First: lo.ToPtr(pageSize), After: cursor}.Wrap())
		if err != nil {
			return err
		}

		items := vList.Unwrap()
		if len(items) > 0 {
			for idx, itm := range items {
				if itm.Thread() != nil {
					allThreadIDs = append(allThreadIDs, *itm.Thread())
				}
				allEvents = append(allEvents, Event{
					Project:   prj,
					Workspace: sp.Schema().Workspace(),
					Type:      event.ItemDelete,
					Object:    vList[idx],
					WebhookObject: item.ItemModelSchema{
						Item:   itm,
						Model:  m,
						Schema: sp.Schema(),
					},
					Operator: operator.Operator(),
				})
			}

			if err := itemInteractor.handleRelatedReferenceFields(ctx, items.IDs(), sp); err != nil {
				return err
			}
		}

		if pageInfo == nil || !pageInfo.HasNextPage {
			break
		}
		cursor = pageInfo.EndCursor
	}

	// delete all items and metadata items for this model in one query
	if err := i.repos.Item.RemoveByModel(ctx, m.ID()); err != nil {
		return err
	}

	// delete threads that belonged to the deleted items
	if len(allThreadIDs) > 0 {
		if err := i.repos.Thread.RemoveByIDs(ctx, allThreadIDs); err != nil {
			return err
		}
	}

	// publish item.delete events
	if len(allEvents) > 0 {
		if _, err := createEvents(ctx, i.repos, i.gateways, allEvents); err != nil {
			return err
		}
	}

	return nil
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
						if !operator.IsWritableProject(p.ID()) {
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

			if !operator.IsWritableProject(models.Projects()...) {
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
			// Copy the model
			oldModel, err := i.repos.Model.FindByID(ctx, params.ModelId)
			if err != nil {
				return nil, err
			}
			if !operator.IsWritableProject(oldModel.Project()) {
				return nil, interfaces.ErrOperationDenied
			}

			name := lo.ToPtr(oldModel.Name() + " Copy")
			if params.Name != nil {
				name = params.Name
			}
			key := id.RandomKey().Ref().StringRef()
			if params.Key != nil {
				key = params.Key
			}

			newModel, err := i.create(ctx, interfaces.CreateModelParam{
				ProjectId:   oldModel.Project(),
				Name:        name,
				Description: lo.ToPtr(oldModel.Description()),
				Key:         key,
			})
			if err != nil {
				return nil, err
			}

			// Copy the schema
			oldSchema, err := i.repos.Schema.FindByID(ctx, oldModel.Schema())
			if err != nil {
				return nil, err
			}

			newSchema, err := i.repos.Schema.FindByID(ctx, newModel.Schema())
			if err != nil {
				return nil, err
			}

			newSchema.CopyFrom(oldSchema)
			if err := i.repos.Schema.Save(ctx, newSchema); err != nil {
				return nil, err
			}

			// Copy items
			timestamp := util.Now()
			if err := i.copyItems(ctx, oldModel.Schema(), newModel.Schema(), newModel.ID(), timestamp, operator); err != nil {
				return nil, err
			}

			// Copy metadata (if present)
			if oldModel.Metadata() != nil {
				oldMetaSchema, err := i.repos.Schema.FindByID(ctx, *oldModel.Metadata())
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

				if err := i.copyItems(ctx, *oldModel.Metadata(), newMetaSchema.ID(), newModel.ID(), timestamp, operator); err != nil {
					return nil, err
				}
			}

			// Return the new model
			return newModel, nil
		})
}

func (i Model) copyItems(ctx context.Context, oldSchemaID, newSchemaID id.SchemaID, newModelID id.ModelID, timestamp time.Time, operator *usecase.Operator) error {
	collection := "item"
	filter, changes, err := i.repos.Item.Copy(ctx, repo.CopyParams{
		OldSchema:   oldSchemaID,
		NewSchema:   newSchemaID,
		NewModel:    newModelID,
		Timestamp:   timestamp,
		User:        operator.AcOperator.User.StringRef(),
		Integration: operator.Integration.StringRef(),
	})
	if err != nil {
		return err
	}
	return i.triggerCopyEvent(ctx, collection, string(*filter), string(*changes))
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

	log.Infof("model: successfully triggered copy event for collection %s, filter: %s, changes: %s", collection, filter, changes)
	return nil
}
