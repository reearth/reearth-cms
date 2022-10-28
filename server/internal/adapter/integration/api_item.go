package integration

import (
	"context"
	"errors"

	"github.com/deepmap/oapi-codegen/pkg/types"
	"github.com/reearth/reearth-cms/server/internal/adapter"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/model"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearthx/usecasex"
	"github.com/samber/lo"
)

func (s Server) ItemFilter(ctx context.Context, request ItemFilterRequestObject) (ItemFilterResponseObject, error) {
	op := adapter.Operator(ctx)
	uc := adapter.Usecases(ctx)
	m, err := uc.Model.FindByIDs(ctx, []id.ModelID{id.ModelID(request.ModelId)}, op)
	if err != nil {
		return nil, err
	}

	p := &usecasex.Pagination{
		Before: nil,
		After:  nil,
		First:  lo.ToPtr(1000),
		Last:   nil,
	}

	items, pi, err := adapter.Usecases(ctx).Item.FindByProject(ctx, m[0].Project(), p, op)
	if err != nil {
		return ItemFilter400Response{}, err
	}

	itemList := lo.Map(items, func(i *item.Item, _ int) Item {
		return toItem(i, m[0].ID())
	})
	return ItemFilter200JSONResponse{
		Items:      &itemList,
		Page:       lo.ToPtr(1),
		PerPage:    lo.ToPtr(1000),
		TotalCount: lo.ToPtr(pi.TotalCount),
	}, nil
}

func (s Server) ItemCreate(ctx context.Context, request ItemCreateRequestObject) (ItemCreateResponseObject, error) {
	op := adapter.Operator(ctx)
	uc := adapter.Usecases(ctx)

	if request.Body.Fields == nil {
		return ItemCreate400Response{}, errors.New("missing fields")
	}

	m, err := uc.Model.FindByIDs(ctx, []id.ModelID{id.ModelID(request.ModelId)}, op)
	if err != nil {
		return nil, err
	}

	cp := interfaces.CreateItemParam{
		SchemaID: m[0].Schema(),
		Fields: lo.Map(*request.Body.Fields, func(f Field, _ int) interfaces.ItemFieldParam {
			return toItemFieldParam(f)
		}),
	}

	i, err := uc.Item.Create(ctx, cp, op)
	if err != nil {
		return ItemCreate400Response{}, err
	}

	return ItemCreate200JSONResponse(toItem(i, id.NewModelID())), nil
}

func (s Server) ItemDelete(ctx context.Context, request ItemDeleteRequestObject) (ItemDeleteResponseObject, error) {
	op := adapter.Operator(ctx)
	uc := adapter.Usecases(ctx)
	iId := id.ItemID(request.ItemId)

	err := uc.Item.Delete(ctx, iId, op)
	if err != nil {
		return ItemDelete400Response{}, err
	}
	return ItemDelete200JSONResponse{
		Id: &iId,
	}, nil
}

func (s Server) ItemGet(ctx context.Context, request ItemGetRequestObject) (ItemGetResponseObject, error) {
	op := adapter.Operator(ctx)
	uc := adapter.Usecases(ctx)
	iId := id.ItemID(request.ItemId)

	item, err := uc.Item.FindByID(ctx, iId, op)
	if err != nil {
		return ItemGet400Response{}, err
	}
	return ItemGet200JSONResponse(toItem(item, id.NewModelID())), nil
}

func (s Server) ItemPublish(ctx context.Context, request ItemPublishRequestObject) (ItemPublishResponseObject, error) {
	// TODO implement me
	panic("implement me")
}

func toItem(i *item.Item, mId model.ID) Item {
	return Item{
		Archived:  lo.ToPtr(false),
		CreatedAt: &types.Date{Time: i.ID().Timestamp()},
		Fields:    nil,
		Id:        lo.ToPtr(i.ID()),
		ModelId:   lo.ToPtr(mId),
		Parents:   nil,
		Refs:      nil,
		UpdatedAt: nil,
		Version:   nil,
	}
}

func toItemFieldParam(f Field) interfaces.ItemFieldParam {
	return interfaces.ItemFieldParam{
		SchemaFieldID: schema.FieldID{},
		ValueType:     "",
		Value:         nil,
	}
}
