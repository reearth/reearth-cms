package interactor

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/reearth/reearthx/usecasex"
	"github.com/samber/lo"
)

type Item struct {
	repos *repo.Container
}

func NewItem(r *repo.Container) interfaces.Item {
	return &Item{
		repos: r,
	}
}

func (i Item) FindByIDs(ctx context.Context, ids id.ItemIDList, operator *usecase.Operator) (item.List, error) {
	return Run1(ctx, operator, i.repos, Usecase().Transaction(), func() (item.List, error) {
		return i.repos.Item.FindByIDs(ctx, ids)
	})
}

func (i Item) FindByID(ctx context.Context, itemID id.ItemID, operator *usecase.Operator) (*item.Item, error) {
	return Run1(ctx, operator, i.repos, Usecase().Transaction(), func() (*item.Item, error) {
		return i.repos.Item.FindByID(ctx, itemID)
	})
}

func (i Item) FindBySchema(ctx context.Context, schemaID id.SchemaID, p *usecasex.Pagination, operator *usecase.Operator) (item.List, *usecasex.PageInfo, error) {
	return Run2(ctx, operator, i.repos, Usecase().Transaction(), func() (item.List, *usecasex.PageInfo, error) {
		s, err := i.repos.Schema.FindByID(ctx, schemaID)
		if err != nil {
			return nil, nil, err
		}
		sfl := s.Fields()
		sfids := id.FieldIDList{}
		for _, sf := range sfl {
			sfids.Add(sf.ID())
		}
		res, page, err := i.repos.Item.FindBySchema(ctx, schemaID, p)
		return res.Filtered(sfids), page, err
	})
}

func (i Item) FindAllVersionsByID(ctx context.Context, itemID id.ItemID, operator *usecase.Operator) ([]*version.Value[*item.Item], error) {
	return Run1(ctx, operator, i.repos, Usecase().Transaction(), func() ([]*version.Value[*item.Item], error) {
		return i.repos.Item.FindAllVersionsByID(ctx, itemID)
	})
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

		it, err := item.New().
			NewID().
			Schema(param.SchemaID).
			Project(s.Project()).
			Fields(itemFieldsFromParams(param.Fields)).
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
		item, err := i.repos.Item.FindByID(ctx, param.ItemID)
		if err != nil {
			return nil, err
		}

		if !operator.IsWritableProject(item.Project()) {
			return nil, interfaces.ErrOperationDenied
		}

		item.UpdateFields(itemFieldsFromParams(param.Fields))

		if err := i.repos.Item.Save(ctx, item); err != nil {
			return nil, err
		}

		return item, nil
	})
}

func (i Item) Delete(ctx context.Context, itemID id.ItemID, operator *usecase.Operator) error {
	return Run0(ctx, operator, i.repos, Usecase().Transaction(), func() error {
		return i.repos.Item.Remove(ctx, itemID)
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

func itemFieldsFromParams(Fields []interfaces.ItemFieldParam) []*item.Field {
	return lo.Map(Fields, func(f interfaces.ItemFieldParam, _ int) *item.Field {
		return item.NewField(
			f.SchemaFieldID,
			f.ValueType,
			f.Value,
		)
	})
}
