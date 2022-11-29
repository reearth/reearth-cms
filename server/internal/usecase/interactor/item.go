package interactor

import (
	"context"
	"fmt"

	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/event"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/thread"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/usecasex"
	"github.com/reearth/reearthx/util"
)

type Item struct {
	repos       *repo.Container
	gateways    *gateway.Container
	ignoreEvent bool
}

func NewItem(r *repo.Container, g *gateway.Container) *Item {
	return &Item{
		repos:    r,
		gateways: g,
	}
}

func (i Item) FindByID(ctx context.Context, itemID id.ItemID, operator *usecase.Operator) (item.Versioned, error) {
	return i.repos.Item.FindByID(ctx, itemID)
}

func (i Item) FindByIDs(ctx context.Context, ids id.ItemIDList, operator *usecase.Operator) (item.VersionedList, error) {
	return i.repos.Item.FindByIDs(ctx, ids)
}

func (i Item) FindByProject(ctx context.Context, projectID id.ProjectID, p *usecasex.Pagination, operator *usecase.Operator) (item.VersionedList, *usecasex.PageInfo, error) {
	if !operator.IsReadableProject(projectID) {
		return nil, nil, rerror.ErrNotFound
	}
	return i.repos.Item.FindByProject(ctx, projectID, p)
}

func (i Item) FindBySchema(ctx context.Context, schemaID id.SchemaID, p *usecasex.Pagination, operator *usecase.Operator) (item.VersionedList, *usecasex.PageInfo, error) {
	s, err := i.repos.Schema.FindByID(ctx, schemaID)
	if err != nil {
		return nil, nil, err
	}

	sfids := s.Fields().IDs()
	res, page, err := i.repos.Item.FindBySchema(ctx, schemaID, p)
	return res.FilterFields(sfids), page, err
}

func (i Item) FindAllVersionsByID(ctx context.Context, itemID id.ItemID, operator *usecase.Operator) (item.VersionedList, error) {
	return i.repos.Item.FindAllVersionsByID(ctx, itemID)
}

func (i Item) Search(ctx context.Context, q *item.Query, p *usecasex.Pagination, operator *usecase.Operator) (item.VersionedList, *usecasex.PageInfo, error) {
	return i.repos.Item.Search(ctx, q, p)
}

func (i Item) Create(ctx context.Context, param interfaces.CreateItemParam, operator *usecase.Operator) (item.Versioned, error) {
	if operator.User == nil && operator.Integration == nil {
		return nil, interfaces.ErrInvalidOperator
	}

	return Run1(ctx, operator, i.repos, Usecase().Transaction(), func() (item.Versioned, error) {
		s, err := i.repos.Schema.FindByID(ctx, param.SchemaID)
		if err != nil {
			return nil, err
		}

		if !operator.IsWritableWorkspace(s.Workspace()) {
			return nil, interfaces.ErrOperationDenied
		}

		fields, err := itemFieldsFromParams(param.Fields, s)
		if err != nil {
			return nil, err
		}

		if err := i.checkUnique(ctx, fields, s, param.ModelID); err != nil {
			return nil, err
		}

		th, err := thread.New().NewID().Workspace(s.Workspace()).Build()

		if err != nil {
			return nil, err
		}
		if err := i.repos.Thread.Save(ctx, th); err != nil {
			return nil, err
		}

		ib := item.New().
			NewID().
			Schema(param.SchemaID).
			Project(s.Project()).
			Model(param.ModelID).
			Thread(th.ID()).
			Fields(fields)

		if operator.User != nil {
			ib = ib.User(*operator.User)
		}
		if operator.Integration != nil {
			ib = ib.Integration(*operator.Integration)
		}

		it, err := ib.Build()
		if err != nil {
			return nil, err
		}

		if err := i.repos.Item.Save(ctx, it); err != nil {
			return nil, err
		}

		vi, err := i.repos.Item.FindByID(ctx, it.ID())
		if err != nil {
			return nil, err
		}

		if err := i.event(ctx, Event{
			Workspace: s.Workspace(),
			Type:      event.ItemCreate,
			Object:    vi,
			WebhookObject: item.ItemAndSchema{
				Item:   vi.Value(),
				Schema: s,
			},
			Operator: operator.Operator(),
		}); err != nil {
			return nil, err
		}

		return vi, nil
	})
}

func (i Item) Update(ctx context.Context, param interfaces.UpdateItemParam, operator *usecase.Operator) (item.Versioned, error) {
	if operator.User == nil && operator.Integration == nil {
		return nil, interfaces.ErrInvalidOperator
	}
	if len(param.Fields) == 0 {
		return nil, interfaces.ErrItemFieldRequired
	}

	return Run1(ctx, operator, i.repos, Usecase().Transaction(), func() (item.Versioned, error) {
		itm, err := i.repos.Item.FindByID(ctx, param.ItemID)
		if err != nil {
			return nil, err
		}

		itv := itm.Value()
		if !operator.CanUpdate(itv) {
			return nil, interfaces.ErrOperationDenied
		}

		s, err := i.repos.Schema.FindByID(ctx, itv.Schema())
		if err != nil {
			return nil, err
		}

		fields, err := itemFieldsFromParams(param.Fields, s)
		if err != nil {
			return nil, err
		}

		if err := i.checkUnique(ctx, fields, s, itv.Model()); err != nil {
			return nil, err
		}

		itv.UpdateFields(fields)
		if err := i.repos.Item.Save(ctx, itv); err != nil {
			return nil, err
		}

		if err := i.event(ctx, Event{
			Workspace: s.Workspace(),
			Type:      event.ItemUpdate,
			Object:    itm,
			WebhookObject: item.ItemAndSchema{
				Item:   itv,
				Schema: s,
			},
			Operator: operator.Operator(),
		}); err != nil {
			return nil, err
		}

		return itm, nil
	})
}

func (i Item) Delete(ctx context.Context, itemID id.ItemID, operator *usecase.Operator) error {
	if operator.User == nil && operator.Integration == nil {
		return interfaces.ErrInvalidOperator
	}

	return Run0(ctx, operator, i.repos, Usecase().Transaction(), func() error {
		itm, err := i.repos.Item.FindByID(ctx, itemID)
		if err != nil {
			return err
		}

		if !operator.CanUpdate(itm.Value()) {
			return interfaces.ErrOperationDenied
		}

		return i.repos.Item.Remove(ctx, itemID)
	})
}

func (i Item) checkUnique(ctx context.Context, itemFields []*item.Field, s *schema.Schema, mid id.ModelID) error {
	var fieldsArg []repo.FieldAndValue
	for _, f := range itemFields {
		sf := s.Field(f.FieldID())
		if sf == nil {
			return interfaces.ErrInvalidField
		}

		vv := f.Value().Value()
		if !sf.Unique() || vv.IsEmpty() {
			continue
		}

		fieldsArg = append(fieldsArg, repo.FieldAndValue{
			Field: f.FieldID(),
			Value: vv,
		})
	}

	exists, err := i.repos.Item.FindByModelAndValue(ctx, mid, fieldsArg)
	if err != nil {
		return err
	}

	if len(exists) > 0 {
		return interfaces.ErrDuplicatedItemValue
	}

	return nil
}

func itemFieldsFromParams(fields []interfaces.ItemFieldParam, s *schema.Schema) ([]*item.Field, error) {
	return util.TryMap(fields, func(f interfaces.ItemFieldParam) (*item.Field, error) {
		sf := s.Field(f.Field)
		if sf == nil {
			return nil, interfaces.ErrFieldNotFound
		}

		v := sf.Type().Value(f.Value)
		if v == nil {
			return nil, interfaces.ErrInvalidValue
		}

		if err := sf.Validate(v); err != nil {
			return nil, fmt.Errorf("field %s: %w", sf.Name(), err)
		}

		return item.NewField(
			f.Field,
			v.Some(),
		), nil
	})
}

func (i Item) event(ctx context.Context, e Event) error {
	if i.ignoreEvent {
		return nil
	}

	_, err := createEvent(ctx, i.repos, i.gateways, e)
	return err
}
