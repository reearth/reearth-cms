package interactor

import (
	"context"
	"errors"

	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/event"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/thread"
	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/reearth/reearthx/usecasex"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
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
	if _, err := i.repos.Project.FindByID(ctx, projectID); err != nil {
		return nil, nil, err
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
	return Run1(ctx, operator, i.repos, Usecase().Transaction(), func() (item.Versioned, error) {
		s, err := i.repos.Schema.FindByID(ctx, param.SchemaID)
		if err != nil {
			return nil, err
		}

		if !operator.IsWritableProject(s.Project()) {
			return nil, interfaces.ErrOperationDenied
		}

		fields, err := itemFieldsFromParams(param.Fields, s)
		if err != nil {
			return nil, err
		}

		if param.Fields != nil {
			if err := validateFields(ctx, fields, s, param.ModelID, i.repos); err != nil {
				return nil, err
			}
		}

		th, err := thread.New().NewID().Workspace(s.Workspace()).Build()

		if err != nil {
			return nil, err
		}
		if err := i.repos.Thread.Save(ctx, th); err != nil {
			return nil, err
		}

		it, err := item.New().
			NewID().
			Schema(param.SchemaID).
			Project(s.Project()).
			Model(param.ModelID).
			Thread(th.ID()).
			Fields(fields).
			Build()
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
	if len(param.Fields) == 0 {
		return nil, interfaces.ErrItemFieldRequired
	}

	return Run1(ctx, operator, i.repos, Usecase().Transaction(), func() (item.Versioned, error) {
		it, err := i.repos.Item.FindByID(ctx, param.ItemID)
		if err != nil {
			return nil, err
		}

		itv := it.Value()
		s, err := i.repos.Schema.FindByID(ctx, itv.Schema())
		if err != nil {
			return nil, err
		}

		if !operator.IsWritableProject(itv.Project()) {
			return nil, interfaces.ErrOperationDenied
		}

		fields, err := itemFieldsFromParams(param.Fields, s)
		if err != nil {
			return nil, err
		}

		//TODO: create item.FieldList model and move this check there
		changedFields := filterChangedFields(itv.Fields(), fields)
		if len(changedFields) == 0 {
			return it, nil
		}

		if param.Fields != nil {
			err = validateFields(ctx, changedFields, s, itv.Model(), i.repos)
			if err != nil {
				return nil, err
			}
		}

		itv.UpdateFields(fields)
		if err := i.repos.Item.Save(ctx, itv); err != nil {
			return nil, err
		}

		if err := i.event(ctx, Event{
			Workspace: s.Workspace(),
			Type:      event.ItemUpdate,
			Object:    it,
			WebhookObject: item.ItemAndSchema{
				Item:   itv,
				Schema: s,
			},
			Operator: operator.Operator(),
		}); err != nil {
			return nil, err
		}

		return it, nil
	})
}

func (i Item) Delete(ctx context.Context, itemID id.ItemID, operator *usecase.Operator) error {
	return i.repos.Item.Remove(ctx, itemID)
}

func filterChangedFields(oldFields []*item.Field, newFields []*item.Field) []*item.Field {
	return lo.FlatMap(oldFields, func(of *item.Field, _ int) []*item.Field {
		return lo.Filter(newFields, func(nf *item.Field, _ int) bool {
			return of.FieldID() == nf.FieldID() && of.Value() != nf.Value()
		})
	})
}

func validateFields(ctx context.Context, fields []*item.Field, s *schema.Schema, mid id.ModelID, repos *repo.Container) error {
	var fieldsArg []repo.FieldAndValue
	for _, f := range fields {
		fieldsArg = append(fieldsArg, repo.FieldAndValue{
			Field: f.FieldID(),
			Value: f.Value().Value(),
		})
	}

	exists, err := repos.Item.FindByModelAndValue(ctx, mid, fieldsArg)
	if err != nil {
		return err
	}

	for _, field := range fields {
		sf := s.Field(field.FieldID())
		if sf == nil {
			return interfaces.ErrFieldNotFound
		}

		if sf.Required() && field.Value() == nil {
			return errors.New("field is required")
		}

		items := item.List(version.UnwrapValues(exists))
		if sf.Unique() && field.Value() != nil {
			if len(exists) > 0 && len(items.ItemsByField(field.FieldID(), field.Value())) > 0 {
				return interfaces.ErrFieldValueExist
			}
		}

		errFlag := false

		sf.TypeProperty().Match(schema.TypePropertyMatch{
			Text: func(f *schema.FieldText) {
				if f.MaxLength() == nil {
					return
				}
				vv, ok := field.Value().Value().ValueString()
				errFlag = !ok || len([]rune(vv)) > *f.MaxLength()
			},
			TextArea: func(f *schema.FieldTextArea) {
				if f.MaxLength() == nil {
					return
				}
				vv, ok := field.Value().Value().ValueString()
				errFlag = !ok || len([]rune(vv)) > *f.MaxLength()
			},
			RichText: func(f *schema.FieldRichText) {
				if f.MaxLength() == nil {
					return
				}
				vv, ok := field.Value().Value().ValueString()
				errFlag = !ok || len([]rune(vv)) > *f.MaxLength()
			},
			Markdown: func(f *schema.FieldMarkdown) {
				if f.MaxLength() == nil {
					return
				}
				vv, ok := field.Value().Value().ValueString()
				errFlag = !ok || len([]rune(vv)) > *f.MaxLength()
			},
			Integer: func(f *schema.FieldInteger) {
				v, _ := field.Value().Value().ValueInteger()
				if f.Max() != nil && int(v) > *f.Max() {
					errFlag = true
					return
				}
				if f.Min() != nil && int(v) < *f.Min() {
					errFlag = true
					return
				}
			},
		})

		if errFlag {
			return errors.New("invalid field value")
		}
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

		return item.NewField(
			f.Field,
			v.Some(),
		), nil
	})
}

func (i *Item) event(ctx context.Context, e Event) error {
	if i.ignoreEvent {
		return nil
	}

	_, err := createEvent(ctx, i.repos, i.gateways, e)
	return err
}
