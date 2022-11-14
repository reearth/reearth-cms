package integration

import (
	"context"
	"errors"

	"github.com/reearth/reearth-cms/server/internal/adapter"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/integrationapi"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
)

func (s Server) ItemFilter(ctx context.Context, request ItemFilterRequestObject) (ItemFilterResponseObject, error) {
	op := adapter.Operator(ctx)
	uc := adapter.Usecases(ctx)
	m, err := uc.Model.FindByIDs(ctx, []id.ModelID{id.ModelID(request.ModelId)}, op)
	if err != nil {
		return ItemFilter400Response{}, err
	}
	if len(m) == 0 {
		return ItemFilter400Response{}, rerror.ErrNotFound
	}

	p := toPagination(request.Params.Page, request.Params.PerPage)

	items, pi, err := adapter.Usecases(ctx).Item.FindBySchema(ctx, m[0].Schema(), p, op)
	if err != nil {
		return ItemFilter400Response{}, err
	}

	itemList, err := util.TryMap(items, func(i *item.Item) (integrationapi.Item, error) {
		ver, err := uc.Item.FindAllVersionsByID(ctx, i.ID(), op)
		if err != nil {
			return integrationapi.Item{}, err
		}

		return toItem(i, ver[len(ver)-1]), nil
	})
	if err != nil {
		return ItemFilter400Response{}, err
	}

	return ItemFilter200JSONResponse{
		Items:      &itemList,
		Page:       request.Params.Page,
		PerPage:    request.Params.PerPage,
		TotalCount: lo.ToPtr(int(pi.TotalCount)),
	}, nil
}

func (s Server) ItemCreate(ctx context.Context, request ItemCreateRequestObject) (ItemCreateResponseObject, error) {
	op := adapter.Operator(ctx)
	uc := adapter.Usecases(ctx)

	if request.Body.Fields == nil {
		return ItemCreate400Response{}, errors.New("missing fields")
	}

	mId := id.ModelID(request.ModelId)
	m, err := uc.Model.FindByIDs(ctx, []id.ModelID{mId}, op)
	if err != nil {
		return nil, err
	}
	if len(m) == 0 {
		return ItemCreate400Response{}, rerror.ErrNotFound
	}

	cp := interfaces.CreateItemParam{
		SchemaID: m[0].Schema(),
		Fields: lo.Map(*request.Body.Fields, func(f integrationapi.Field, _ int) interfaces.ItemFieldParam {
			return toItemFieldParam(f)
		}),
		ModelID: mId,
	}

	i, err := uc.Item.Create(ctx, cp, op)
	if err != nil {
		return ItemCreate400Response{}, err
	}

	ver, err := uc.Item.FindAllVersionsByID(ctx, i.ID(), op)
	if err != nil {
		return nil, err
	}

	return ItemCreate200JSONResponse(toItem(i, ver[len(ver)-1])), nil
}

func (s Server) ItemUpdate(ctx context.Context, request ItemUpdateRequestObject) (ItemUpdateResponseObject, error) {
	op := adapter.Operator(ctx)
	uc := adapter.Usecases(ctx)

	if request.Body.Fields == nil {
		return ItemUpdate400Response{}, errors.New("missing fields")
	}

	up := interfaces.UpdateItemParam{
		ItemID: id.ItemID(request.ItemId),
		Fields: lo.Map(*request.Body.Fields, func(f integrationapi.Field, _ int) interfaces.ItemFieldParam {
			return toItemFieldParam(f)
		}),
	}
	i, err := uc.Item.Update(ctx, up, op)
	if err != nil {
		return ItemUpdate400Response{}, err
	}

	ver, err := uc.Item.FindAllVersionsByID(ctx, i.ID(), op)
	if err != nil {
		return ItemUpdate400Response{}, err
	}

	return ItemUpdate200JSONResponse(toItem(i, ver[len(ver)-1])), nil
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

	itm, err := uc.Item.FindByID(ctx, iId, op)
	if err != nil {
		return ItemGet400Response{}, err
	}

	ver, err := uc.Item.FindAllVersionsByID(ctx, iId, op)
	if err != nil {
		return nil, err
	}

	return ItemGet200JSONResponse(toItem(itm, ver[len(ver)-1])), nil
}

func (s Server) ItemPublish(ctx context.Context, request ItemPublishRequestObject) (ItemPublishResponseObject, error) {
	// TODO implement me
	panic("implement me")
}
