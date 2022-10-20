package integration

import (
	"context"

	"github.com/deepmap/oapi-codegen/pkg/types"
	"github.com/reearth/reearth-cms/server/internal/adapter"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/samber/lo"
)

func (s Server) ItemFilter(ctx context.Context, request ItemFilterRequestObject) (ItemFilterResponseObject, error) {
	op := adapter.Operator(ctx)
	uc := adapter.Usecases(ctx)
	m, err := uc.Model.FindByIDs(ctx, []id.ModelID{id.ModelID(request.ModelId)}, op)
	if err != nil {
		return nil, err
	}
	items, pi, err := adapter.Usecases(ctx).Item.FindByProject(ctx, m[0].Project(), nil, op)
	if err != nil {

	}
	itemList := lo.Map(items, func(i *item.Item, _ int) Item {
		return Item{
			Archived:  lo.ToPtr(false),
			CreatedAt: &types.Date{Time: i.ID().Timestamp()},
			Fields:    nil,
			Id:        lo.ToPtr(i.ID()),
			ModelId:   lo.ToPtr(m[0].ID()),
			Parents:   nil,
			Refs:      nil,
			UpdatedAt: nil,
			Version:   nil,
		}
	})
	return ItemFilter200JSONResponse{
		Items:      &itemList,
		Page:       lo.ToPtr(1),
		PerPage:    lo.ToPtr(1000),
		TotalCount: lo.ToPtr(pi.TotalCount),
	}, nil
}

func (s Server) ItemCreate(ctx context.Context, request ItemCreateRequestObject) (ItemCreateResponseObject, error) {
	// TODO implement me
	panic("implement me")
}

func (s Server) ItemDelete(ctx context.Context, request ItemDeleteRequestObject) (ItemDeleteResponseObject, error) {
	// TODO implement me
	panic("implement me")
}

func (s Server) ItemGet(ctx context.Context, request ItemGetRequestObject) (ItemGetResponseObject, error) {
	// TODO implement me
	panic("implement me")
}

func (s Server) ItemPublish(ctx context.Context, request ItemPublishRequestObject) (ItemPublishResponseObject, error) {
	// TODO implement me
	panic("implement me")
}
