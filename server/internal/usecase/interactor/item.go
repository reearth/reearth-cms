package interactor

import (
	"context"
	"errors"
	"fmt"
	"strconv"

	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/reearth/reearthx/usecasex"
	"github.com/samber/lo"
)

type Item struct {
	repos    *repo.Container
	gateways *gateway.Container
}

func NewItem(r *repo.Container, g *gateway.Container) interfaces.Item {
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
	return filterFields(res, sfids), page, err
}

func (i Item) FindAllVersionsByID(ctx context.Context, itemID id.ItemID, operator *usecase.Operator) (item.VersionedList, error) {
	return i.repos.Item.FindAllVersionsByID(ctx, itemID)
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

		fields, err := itemFieldsFromParams(param.Fields)
		if err != nil {
			return nil, err
		}

		if param.Fields != nil {
			err = validateFields(ctx, fields, s, param.ModelID, i.repos)
			if err != nil {
				return nil, err
			}
		}

		it, err := item.New().
			NewID().
			Schema(param.SchemaID).
			Project(s.Project()).
			Model(param.ModelID).
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

		return vi, nil
	})
}

func (i Item) Search(ctx context.Context, q *item.Query, p *usecasex.Pagination, operator *usecase.Operator) (item.VersionedList, *usecasex.PageInfo, error) {
	return i.repos.Item.Search(ctx, q, p)
}

func (i Item) Update(ctx context.Context, param interfaces.UpdateItemParam, operator *usecase.Operator) (item.Versioned, error) {
	if len(param.Fields) == 0 {
		return nil, interfaces.ErrItemFieldRequired
	}

	return Run1(ctx, operator, i.repos, Usecase().Transaction(), func() (item.Versioned, error) {
		itemv, err := i.repos.Item.FindByID(ctx, param.ItemID)
		if err != nil {
			return nil, err
		}

		item := itemv.Value()
		s, err := i.repos.Schema.FindByID(ctx, item.Schema())
		if err != nil {
			return nil, err
		}

		if !operator.IsWritableProject(item.Project()) {
			return nil, interfaces.ErrOperationDenied
		}

		fields, err := itemFieldsFromParams(param.Fields)
		if err != nil {
			return nil, err
		}

		//TODO: create item.FieldList model and move this check there
		changedFields := filterChangedFields(item.Fields(), fields)
		if len(changedFields) == 0 {
			return itemv, nil
		}

		if param.Fields != nil {
			err = validateFields(ctx, changedFields, s, item.Model(), i.repos)
			if err != nil {
				return nil, err
			}
		}

		item.UpdateFields(fields)
		if err := i.repos.Item.Save(ctx, item); err != nil {
			return nil, err
		}

		return itemv, nil
	})
}

func (i Item) Delete(ctx context.Context, itemID id.ItemID, operator *usecase.Operator) error {
	return i.repos.Item.Remove(ctx, itemID)
}

func itemFieldsFromParams(Fields []interfaces.ItemFieldParam) ([]*item.Field, error) {
	var err error
	res := lo.Map(Fields, func(f interfaces.ItemFieldParam, _ int) *item.Field {
		v := f.Value
		if f.ValueType == schema.TypeInteger && f.Value != "" {
			v, err = strconv.ParseInt(fmt.Sprintf("%v", f.Value), 10, 64)
		}
		return item.NewField(
			f.SchemaFieldID,
			f.ValueType,
			v,
		)
	})
	if err != nil {
		return nil, err
	}
	return res, nil
}

func filterChangedFields(oldFields []*item.Field, newFields []*item.Field) []*item.Field {
	return lo.FlatMap(oldFields, func(of *item.Field, _ int) []*item.Field {
		return lo.Filter(newFields, func(nf *item.Field, _ int) bool {
			return of.SchemaFieldID() == nf.SchemaFieldID() && of.Value() != nf.Value()
		})
	})
}

func validateFields(ctx context.Context, fields []*item.Field, s *schema.Schema, mid id.ModelID, repos *repo.Container) error {
	var fieldsArg []repo.FieldAndValue
	for _, f := range fields {
		fieldsArg = append(fieldsArg, repo.FieldAndValue{
			SchemaFieldID: f.SchemaFieldID(),
			Value:         f.Value(),
		})
	}

	exists, err := repos.Item.FindByModelAndValue(ctx, mid, fieldsArg)
	if err != nil {
		return err
	}

	for _, field := range fields {
		sf := s.Field(field.SchemaFieldID())
		if sf == nil {
			return interfaces.ErrFieldNotFound
		}

		if sf.Required() && field.Value() == nil {
			return errors.New("field is required")
		}

		items := item.List(version.UnwrapValues(exists))
		if sf.Unique() && field.Value() != nil {
			if len(exists) > 0 && len(items.ItemsBySchemaField(field.SchemaFieldID(), field.Value())) > 0 {
				return interfaces.ErrFieldValueExist
			}
		}

		err1 := errors.New("invalid field value")
		errFlag := false
		sf.TypeProperty().Match(schema.TypePropertyMatch{
			Text: func(f *schema.FieldText) {
				errFlag = f.MaxLength() != nil && len(fmt.Sprintf("%v", field.Value())) > *f.MaxLength()
			},
			TextArea: func(f *schema.FieldTextArea) {
				errFlag = f.MaxLength() != nil && len(fmt.Sprintf("%v", field.Value())) > *f.MaxLength()
			},
			RichText: func(f *schema.FieldRichText) {
				errFlag = f.MaxLength() != nil && len(fmt.Sprintf("%v", field.Value())) > *f.MaxLength()
			},
			Markdown: func(f *schema.FieldMarkdown) {
				errFlag = f.MaxLength() != nil && len(fmt.Sprintf("%v", field.Value())) > *f.MaxLength()
			},
			Integer: func(f *schema.FieldInteger) {
				if f.Max() != nil && int(field.Value().(int64)) > *f.Max() {
					errFlag = true
					return
				}
				if f.Min() != nil && int(field.Value().(int64)) < *f.Min() {
					errFlag = true
					return
				}
			},
			URL: func(f *schema.FieldURL) {
				errFlag = !schema.IsUrl(field.Value().(string))
			},
		})
		if errFlag {
			return err1
		}
	}
	return nil
}

func filterFields(l item.VersionedList, lids id.FieldIDList) item.VersionedList {
	return lo.Map(l, func(i item.Versioned, _ int) item.Versioned {
		return version.NewValue(
			i.Version(),
			i.Parents(),
			i.Refs(),
			i.Value().FilterFields(lids),
		)
	})
}
