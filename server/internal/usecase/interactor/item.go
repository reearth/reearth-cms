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
	"github.com/reearth/reearth-cms/server/pkg/request"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/thread"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/usecasex"
	"github.com/reearth/reearthx/util"
	"golang.org/x/exp/slices"
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

func (i Item) FindByID(ctx context.Context, itemID id.ItemID, _ *usecase.Operator) (item.Versioned, error) {
	return i.repos.Item.FindByID(ctx, itemID, nil)
}

func (i Item) FindPublicByID(ctx context.Context, itemID id.ItemID, _ *usecase.Operator) (item.Versioned, error) {
	return i.repos.Item.FindByID(ctx, itemID, version.Public.Ref())
}

func (i Item) FindByIDs(ctx context.Context, ids id.ItemIDList, _ *usecase.Operator) (item.VersionedList, error) {
	return i.repos.Item.FindByIDs(ctx, ids, nil)
}

func (i Item) ItemStatus(ctx context.Context, list id.ItemIDList, _ *usecase.Operator) (map[id.ItemID][]item.Status, error) {
	requests, err := i.repos.Request.FindByItems(ctx, list)
	if err != nil {
		return nil, err
	}
	res := map[id.ItemID][]item.Status{}
	for _, itm := range list {
		var sl []item.Status
		for _, req := range requests {
			if req.Items().IDs().Has(itm) {
				switch req.State() {
				case request.StateWaiting:
					if !slices.Contains(sl, item.StatusReview) {
						sl = append(sl, item.StatusReview)
					}
				case request.StateApproved:
					if !slices.Contains(sl, item.StatusPublic) {
						sl = append(sl, item.StatusPublic)
					}
				}
			}
		}
		if len(sl) == 0 {
			sl = []item.Status{item.StatusDraft}
		}
		res[itm] = sl
	}
	return res, nil
}

func (i Item) FindByProject(ctx context.Context, projectID id.ProjectID, p *usecasex.Pagination, operator *usecase.Operator) (item.VersionedList, *usecasex.PageInfo, error) {
	if !operator.IsReadableProject(projectID) {
		return nil, nil, rerror.ErrNotFound
	}
	// TODO: check operation for projects that publication type is limited
	return i.repos.Item.FindByProject(ctx, projectID, nil, p)
}

func (i Item) FindByModel(ctx context.Context, modelID id.ModelID, p *usecasex.Pagination, operator *usecase.Operator) (item.VersionedList, *usecasex.PageInfo, error) {
	m, err := i.repos.Model.FindByID(ctx, modelID)
	if err != nil {
		return nil, nil, err
	}
	if !operator.IsReadableProject(m.Project()) {
		return nil, nil, rerror.ErrNotFound
	}
	return i.repos.Item.FindByModel(ctx, m.ID(), nil, p)
}

func (i Item) FindPublicByModel(ctx context.Context, modelID id.ModelID, p *usecasex.Pagination, _ *usecase.Operator) (item.VersionedList, *usecasex.PageInfo, error) {
	m, err := i.repos.Model.FindByID(ctx, modelID)
	if err != nil {
		return nil, nil, err
	}
	// TODO: check operation for projects that publication type is limited
	return i.repos.Item.FindByModel(ctx, m.ID(), version.Public.Ref(), p)
}

func (i Item) FindBySchema(ctx context.Context, schemaID id.SchemaID, sort *item.Sort, p *usecasex.Pagination, _ *usecase.Operator) (item.VersionedList, *usecasex.PageInfo, error) {
	s, err := i.repos.Schema.FindByID(ctx, schemaID)
	if err != nil {
		return nil, nil, err
	}

	sfIds := s.Fields().IDs()
	res, page, err := i.repos.Item.FindBySchema(ctx, schemaID, nil, sort, p)
	return res.FilterFields(sfIds), page, err
}

func (i Item) FindAllVersionsByID(ctx context.Context, itemID id.ItemID, _ *usecase.Operator) (item.VersionedList, error) {
	return i.repos.Item.FindAllVersionsByID(ctx, itemID)
}

func (i Item) Search(ctx context.Context, q *item.Query, sort *item.Sort, p *usecasex.Pagination, _ *usecase.Operator) (item.VersionedList, *usecasex.PageInfo, error) {
	return i.repos.Item.Search(ctx, q, sort, p)
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

		m, err := i.repos.Model.FindByID(ctx, param.ModelID)
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

		if err := i.checkUnique(ctx, fields, s, m.ID(), nil); err != nil {
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
			Schema(s.ID()).
			Project(s.Project()).
			Model(m.ID()).
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

		vi, err := i.repos.Item.FindByID(ctx, it.ID(), nil)
		if err != nil {
			return nil, err
		}

		if err := i.event(ctx, Event{
			Workspace: s.Workspace(),
			Type:      event.ItemCreate,
			Object:    vi,
			WebhookObject: item.ItemModelSchema{
				Item:   vi.Value(),
				Model:  m,
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
		itm, err := i.repos.Item.FindByID(ctx, param.ItemID, nil)
		if err != nil {
			return nil, err
		}

		itv := itm.Value()
		if !operator.CanUpdate(itv) {
			return nil, interfaces.ErrOperationDenied
		}

		m, err := i.repos.Model.FindByID(ctx, itv.Model())
		if err != nil {
			return nil, err
		}

		s, err := i.repos.Schema.FindByID(ctx, itv.Schema())
		if err != nil {
			return nil, err
		}

		fields, err := itemFieldsFromParams(param.Fields, s)
		if err != nil {
			return nil, err
		}

		if err := i.checkUnique(ctx, fields, s, itv.Model(), itv); err != nil {
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
			WebhookObject: item.ItemModelSchema{
				Item:   itv,
				Model:  m,
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
		itm, err := i.repos.Item.FindByID(ctx, itemID, nil)
		if err != nil {
			return err
		}

		if !operator.CanUpdate(itm.Value()) {
			return interfaces.ErrOperationDenied
		}

		return i.repos.Item.Remove(ctx, itemID)
	})
}

func (i Item) checkUnique(ctx context.Context, itemFields []*item.Field, s *schema.Schema, mid id.ModelID, itm *item.Item) error {
	var fieldsArg []repo.FieldAndValue
	for _, f := range itemFields {
		if itm != nil {
			oldF := itm.Field(f.FieldID())
			if oldF != nil && f.Value().Equal(oldF.Value()) {
				continue
			}
		}

		sf := s.Field(f.FieldID())
		if sf == nil {
			return interfaces.ErrInvalidField
		}

		newV := f.Value()
		if !sf.Unique() || newV.IsEmpty() {
			continue
		}

		fieldsArg = append(fieldsArg, repo.FieldAndValue{
			Field: f.FieldID(),
			Value: newV,
		})
	}

	exists, err := i.repos.Item.FindByModelAndValue(ctx, mid, fieldsArg, nil)
	if err != nil {
		return err
	}

	if len(exists) > 0 && (itm == nil || len(exists) != 1 || exists[0].Value().ID() != itm.ID()) {
		return interfaces.ErrDuplicatedItemValue
	}

	return nil
}

func itemFieldsFromParams(fields []interfaces.ItemFieldParam, s *schema.Schema) ([]*item.Field, error) {
	return util.TryMap(fields, func(f interfaces.ItemFieldParam) (*item.Field, error) {
		sf := s.FieldByIDOrKey(f.Field, f.Key)
		if sf == nil {
			return nil, interfaces.ErrFieldNotFound
		}

		if !sf.Multiple() {
			f.Value = []any{f.Value}
		}

		as, ok := f.Value.([]any)
		if !ok {
			return nil, interfaces.ErrInvalidValue
		}

		m := value.NewMultiple(sf.Type(), as)
		if err := sf.Validate(m); err != nil {
			return nil, fmt.Errorf("field %s: %w", sf.Name(), err)
		}

		return item.NewField(sf.ID(), m), nil
	})
}

func (i Item) event(ctx context.Context, e Event) error {
	if i.ignoreEvent {
		return nil
	}

	_, err := createEvent(ctx, i.repos, i.gateways, e)
	return err
}
