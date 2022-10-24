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
	return Run1(ctx, operator, i.repos, Usecase().Transaction(),
		func() (item.List, error) {
			return i.repos.Item.FindByIDs(ctx, ids)
		})
}

func (i Item) FindByID(ctx context.Context, itemID id.ItemID, operator *usecase.Operator) (*item.Item, error) {
	it, err := i.repos.Item.FindByID(ctx, itemID)
	if err != nil {
		return nil, err
	}
	return Run1(ctx, operator, i.repos, Usecase().Transaction(),
		func() (*item.Item, error) {
			return it, nil
		})
}

func (i Item) FindBySchema(ctx context.Context, schemaID id.SchemaID, p *usecasex.Pagination, operator *usecase.Operator) (item.List, *usecasex.PageInfo, error) {
	_, err := i.repos.Schema.FindByID(ctx, schemaID)
	if err != nil {
		return nil, nil, err
	}
	return Run2(ctx, operator, i.repos, Usecase().Transaction(),
		func() (item.List, *usecasex.PageInfo, error) {
			return i.repos.Item.FindBySchema(ctx, schemaID, p)
		})
}

func (i Item) Create(ctx context.Context, param interfaces.CreateItemParam, operator *usecase.Operator) (*item.Item, error) {
	s, err := i.repos.Schema.FindByID(ctx, param.SchemaID)
	if err != nil {
		return nil, err
	}

	return Run1(ctx, operator, i.repos, Usecase().Transaction(),
		func() (_ *item.Item, err error) {
			ib := item.New().
				NewID().
				Schema(param.SchemaID).
				Project(s.Project())

			if len(param.Fields) > 0 {
				var fs []*item.Field
				for _, f := range param.Fields {
					fs = append(fs, item.NewField(
						f.SchemaFieldID,
						f.ValueType,
						f.Value,
					))
				}
				ib.Fields(fs)
			}

			it, err := ib.Build()
			if err != nil {
				return nil, err
			}

			err = i.repos.Item.Save(ctx, it)
			if err != nil {
				return nil, err
			}
			return it, nil
		})
}

func (i Item) FindAllVersionsByID(ctx context.Context, itemID id.ItemID, operator *usecase.Operator) ([]*version.Value[*item.Item], error) {
	return Run1(ctx, operator, i.repos, Usecase().Transaction(),
		func() ([]*version.Value[*item.Item], error) {
			return i.repos.Item.FindAllVersionsByID(ctx, itemID)
		})
}

func (i Item) Update(ctx context.Context, param interfaces.UpdateItemParam, operator *usecase.Operator) (*item.Item, error) {
	return Run1(ctx, operator, i.repos, Usecase().Transaction(), func() (*item.Item, error) {
		obj, err := i.repos.Item.FindByID(ctx, param.ItemID)
		if err != nil {
			return nil, err
		}
		var fs []*item.Field
		for _, f := range param.Fields {
			fs = append(fs, item.NewField(
				f.SchemaFieldID,
				f.ValueType,
				f.Value,
			))
		}
		obj.UpdateFields(fs)

		err = i.repos.Item.Save(ctx, obj)
		if err != nil {
			return nil, err
		}

		return obj, nil
	})
}

func (i Item) Delete(ctx context.Context, itemID id.ItemID, operator *usecase.Operator) error {
	_, err := i.repos.Item.FindByID(ctx, itemID)
	if err != nil {
		return err
	}
	return Run0(ctx, operator, i.repos, Usecase().Transaction(),
		func() error {
			if err := i.repos.Item.Remove(ctx, itemID); err != nil {
				return err
			}
			return nil
		})
}

func (i Item) FindByProject(ctx context.Context, projectID id.ProjectID, p *usecasex.Pagination, operator *usecase.Operator) (item.List, *usecasex.PageInfo, error) {
	_, err := i.repos.Project.FindByID(ctx, projectID)
	if err != nil {
		return nil, nil, err
	}
	return Run2(ctx, operator, i.repos, Usecase().Transaction(),
		func() (item.List, *usecasex.PageInfo, error) {
			return i.repos.Item.FindByProject(ctx, projectID, p)
		})
}

func (i Item) Search(ctx context.Context, q *item.Query, p *usecasex.Pagination, operator *usecase.Operator) (item.List, *usecasex.PageInfo, error) {
	return Run2(ctx, operator, i.repos, Usecase().Transaction(),
		func() (item.List, *usecasex.PageInfo, error) {
			return i.repos.Item.Search(ctx, q, p)
		})
}
