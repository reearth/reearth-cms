package interactor

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearthx/usecasex"
)

type Item struct {
	repos       *repo.Container
	transaction usecasex.Transaction
}

func (i Item) RemoveField(ctx context.Context, param interfaces.ItemFieldParam, operator *usecase.Operator) (*item.Item, error) {
	panic("implement me")
}

func NewItem(r *repo.Container) interfaces.Item {
	return &Item{
		repos:       r,
		transaction: r.Transaction,
	}
}

func (i Item) FindByIDs(ctx context.Context, ids []id.ItemID, operator *usecase.Operator) (item.List, error) {
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
		func() (*schema.Schema, error) {
			return it, nil
		})
}

func (i Item) Create(ctx context.Context, param interfaces.CreateItemParam, operator *usecase.Operator) (*item.Item, error) {
	return Run1(ctx, operator, i.repos, Usecase().Transaction(),
		func() (_ *item.Item, err error) {
			ib := item.New().
				NewID().
				Schema(param.SchemaID)

			if param.Fields != nil && len(param.Fields) > 0 {
				ib.Fields(param.Fields)
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

func (i Item) AddField(ctx context.Context, param interfaces.ItemFieldParam, operator *usecase.Operator) (*item.Item, error) {
	return Run1(ctx, operator, i.repos, Usecase().Transaction(), func() (*item.Item, error) {
		obj, err := i.repos.Item.FindByID(ctx, param.ItemID)
		if err != nil {
			return nil, err
		}
		obj.AddField(item.NewField(param.SchemaFieldID, param.ValueType, param.Value))

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
