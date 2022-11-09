package interactor

import (
	"context"
	"fmt"

	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/reearth/reearthx/usecasex"
	"github.com/reearth/reearthx/util"
)

type Item struct {
	repos *repo.Container
}

func NewItem(r *repo.Container) interfaces.Item {
	return &Item{
		repos: r,
	}
}

func (i Item) FindByID(ctx context.Context, itemID id.ItemID, operator *usecase.Operator) (*item.Item, error) {
	return i.repos.Item.FindByID(ctx, itemID)
}

func (i Item) FindByIDs(ctx context.Context, ids id.ItemIDList, operator *usecase.Operator) (item.List, error) {
	return i.repos.Item.FindByIDs(ctx, ids)
}

func (i Item) FindPublicByID(ctx context.Context, itemID id.ItemID, operator *usecase.Operator) (*item.Item, error) {
	return i.repos.Item.FindPublicByID(ctx, itemID)
}

func (i Item) FindPublicByModel(ctx context.Context, modelID id.ModelID, p *usecasex.Pagination, operator *usecase.Operator) (item.List, *usecasex.PageInfo, error) {
	return Run2(ctx, operator, i.repos, Usecase().Transaction(), func() (item.List, *usecasex.PageInfo, error) {
		m, err := i.repos.Model.FindByID(ctx, modelID)
		if err != nil {
			return nil, nil, err
		}

		s, err := i.repos.Schema.FindByID(ctx, m.Schema())
		if err != nil {
			return nil, nil, err
		}

		sfids := s.Fields().IDs()
		res, page, err := i.repos.Item.FindPublicByModel(ctx, modelID, p)
		return res.FilterFields(sfids), page, err
	})
}

func (i Item) FindByModel(ctx context.Context, modelID id.ModelID, p *usecasex.Pagination, operator *usecase.Operator) (item.List, *usecasex.PageInfo, error) {
	return Run2(ctx, operator, i.repos, Usecase().Transaction(), func() (item.List, *usecasex.PageInfo, error) {
		m, err := i.repos.Model.FindByID(ctx, modelID)
		if err != nil {
			return nil, nil, err
		}

		s, err := i.repos.Schema.FindByID(ctx, m.Schema())
		if err != nil {
			return nil, nil, err
		}

		sfids := s.Fields().IDs()
		res, page, err := i.repos.Item.FindByModel(ctx, modelID, p)
		return res.FilterFields(sfids), page, err
	})
}

func (i Item) FindBySchema(ctx context.Context, schemaID id.SchemaID, p *usecasex.Pagination, operator *usecase.Operator) (item.List, *usecasex.PageInfo, error) {
	return Run2(ctx, operator, i.repos, Usecase().Transaction(), func() (item.List, *usecasex.PageInfo, error) {
		s, err := i.repos.Schema.FindByID(ctx, schemaID)
		if err != nil {
			return nil, nil, err
		}

		sfids := s.Fields().IDs()
		res, page, err := i.repos.Item.FindBySchema(ctx, schemaID, p)
		return res.FilterFields(sfids), page, err
	})
}

func (i Item) FindByProject(ctx context.Context, projectID id.ProjectID, p *usecasex.Pagination, operator *usecase.Operator) (item.List, *usecasex.PageInfo, error) {
	return Run2(ctx, operator, i.repos, Usecase().Transaction(), func() (item.List, *usecasex.PageInfo, error) {
		if _, err := i.repos.Project.FindByID(ctx, projectID); err != nil {
			return nil, nil, err
		}

		return i.repos.Item.FindByProject(ctx, projectID, p)
	})
}

func (i Item) FindAllVersionsByID(ctx context.Context, itemID id.ItemID, operator *usecase.Operator) ([]*version.Value[*item.Item], error) {
	return i.repos.Item.FindAllVersionsByID(ctx, itemID)
}

func (i Item) Search(ctx context.Context, q *item.Query, p *usecasex.Pagination, operator *usecase.Operator) (item.List, *usecasex.PageInfo, error) {
	return i.repos.Item.Search(ctx, q, p)
}

func (i Item) Create(ctx context.Context, param interfaces.CreateItemParam, operator *usecase.Operator) (*item.Item, error) {
	return Run1(ctx, operator, i.repos, Usecase().Transaction(), func() (_ *item.Item, err error) {
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

		return it, nil
	})
}

func (i Item) Update(ctx context.Context, param interfaces.UpdateItemParam, operator *usecase.Operator) (*item.Item, error) {
	if len(param.Fields) == 0 {
		return nil, interfaces.ErrItemFieldRequired
	}

	return Run1(ctx, operator, i.repos, Usecase().Transaction(), func() (*item.Item, error) {
		it, err := i.repos.Item.FindByID(ctx, param.ItemID)
		if err != nil {
			return nil, err
		}

		if !operator.IsWritableProject(it.Project()) {
			return nil, interfaces.ErrOperationDenied
		}

		s, err := i.repos.Schema.FindByID(ctx, it.Schema())
		if err != nil {
			return nil, err
		}

		fields, err := itemFieldsFromParams(param.Fields, s)
		if err != nil {
			return nil, err
		}

		it.UpdateFields(fields)
		if err := i.repos.Item.Save(ctx, it); err != nil {
			return nil, err
		}

		return it, nil
	})
}

func (i Item) Delete(ctx context.Context, itemID id.ItemID, operator *usecase.Operator) error {
	return i.repos.Item.Remove(ctx, itemID)
}

func itemFieldsFromParams(fields []interfaces.ItemFieldParam, s *schema.Schema) ([]*item.Field, error) {
	return util.TryMap(fields, func(f interfaces.ItemFieldParam) (*item.Field, error) {
		sf := s.Field(f.SchemaFieldID)
		if sf == nil {
			return nil, nil
		}

		if err := sf.Validate(f.Value); err != nil {
			return nil, fmt.Errorf("field %s: %w", sf.Name(), err)
		}

		return item.NewField(f.SchemaFieldID, f.Value), nil
	})
}
