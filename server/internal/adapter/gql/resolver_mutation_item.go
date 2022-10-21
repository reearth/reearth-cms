package gql

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearthx/util"
)

func (r *mutationResolver) CreateItem(ctx context.Context, input gqlmodel.CreateItemInput) (*gqlmodel.ItemPayload, error) {
	sid, err := gqlmodel.ToID[id.Schema](input.SchemaID)
	if err != nil {
		return nil, err
	}
	res, err := usecases(ctx).Item.Create(ctx, interfaces.CreateItemParam{
		SchemaID: sid,
		Fields:   util.DerefSlice(util.Map(input.Fields, gqlmodel.ToItemParam)),
	}, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.ItemPayload{
		Item: gqlmodel.ToItem(res),
	}, nil
}

func (r *mutationResolver) UpdateItem(ctx context.Context, input gqlmodel.UpdateItemInput) (*gqlmodel.ItemPayload, error) {
	iid, err := gqlmodel.ToID[id.Item](input.ItemID)
	if err != nil {
		return nil, err
	}
	res, err := usecases(ctx).Item.Update(ctx, interfaces.UpdateItemParam{
		ItemID: iid,
		Fields: util.DerefSlice(util.Map(input.Fields, gqlmodel.ToItemParam)),
	}, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.ItemPayload{
		Item: gqlmodel.ToItem(res),
	}, nil
}

func (r *mutationResolver) DeleteItem(ctx context.Context, input gqlmodel.DeleteItemInput) (*gqlmodel.DeleteItemPayload, error) {
	iid, err := gqlmodel.ToID[id.Item](input.ItemID)
	if err != nil {
		return nil, err
	}

	if err := usecases(ctx).Item.Delete(ctx, iid, getOperator(ctx)); err != nil {
		return nil, err
	}

	return &gqlmodel.DeleteItemPayload{ItemID: input.ItemID}, nil
}
