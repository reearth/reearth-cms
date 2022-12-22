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
	m, err := uc.Model.FindByIDs(ctx, []id.ModelID{request.ModelId}, op)
	if err != nil {
		return ItemFilter400Response{}, err
	}
	if len(m) == 0 {
		return ItemFilter400Response{}, rerror.ErrNotFound
	}

	ss, err := uc.Schema.FindByID(ctx, m[0].Schema(), op)
	if err != nil {
		return ItemFilter400Response{}, err
	}

	p := fromPagination(request.Params.Page, request.Params.PerPage)
	items, pi, err := adapter.Usecases(ctx).Item.FindBySchema(ctx, ss.ID(), nil, p, op)
	if err != nil {
		return ItemFilter400Response{}, err
	}

	return ItemFilter200JSONResponse{
		Items:      lo.ToPtr(util.Map(items, func(i item.Versioned) integrationapi.VersionedItem { return integrationapi.NewVersionedItem(i, ss) })),
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

	m, err := uc.Model.FindByIDs(ctx, []id.ModelID{request.ModelId}, op)
	if err != nil {
		return nil, err
	}
	if len(m) == 0 {
		return ItemCreate400Response{}, rerror.ErrNotFound
	}

	ss, err := uc.Schema.FindByID(ctx, m[0].Schema(), op)
	if err != nil {
		return ItemCreate400Response{}, err
	}

	fields := make([]interfaces.ItemFieldParam, 0, len(*request.Body.Fields))
	for _, f := range *request.Body.Fields {
		var v any
		if f.Value != nil {
			v = *f.Value
		}

		fields = append(fields, interfaces.ItemFieldParam{
			Field: *f.Id,
			Type:  integrationapi.FromValueType(f.Type),
			Value: v,
		})
	}

	cp := interfaces.CreateItemParam{
		SchemaID: ss.ID(),
		Fields:   fields,
		ModelID:  request.ModelId,
	}

	i, err := uc.Item.Create(ctx, cp, op)
	if err != nil {
		return ItemCreate400Response{}, err
	}

	return ItemCreate200JSONResponse(integrationapi.NewVersionedItem(i, ss)), nil
}

func (s Server) ItemUpdate(ctx context.Context, request ItemUpdateRequestObject) (ItemUpdateResponseObject, error) {
	op := adapter.Operator(ctx)
	uc := adapter.Usecases(ctx)

	if request.Body.Fields == nil {
		return ItemUpdate400Response{}, errors.New("missing fields")
	}

	i, err := uc.Item.FindByID(ctx, request.ItemId, op)
	if err != nil {
		return ItemUpdate400Response{}, err
	}

	ss, err := uc.Schema.FindByID(ctx, i.Value().Schema(), op)
	if err != nil {
		return ItemUpdate400Response{}, err
	}

	up := interfaces.UpdateItemParam{
		ItemID: request.ItemId,
		Fields: lo.Map(*request.Body.Fields, func(f integrationapi.Field, _ int) interfaces.ItemFieldParam {
			return fromItemFieldParam(f)
		}),
	}

	i, err = uc.Item.Update(ctx, up, op)
	if err != nil {
		return ItemUpdate400Response{}, err
	}

	return ItemUpdate200JSONResponse(integrationapi.NewVersionedItem(i, ss)), nil
}

func (s Server) ItemDelete(ctx context.Context, request ItemDeleteRequestObject) (ItemDeleteResponseObject, error) {
	op := adapter.Operator(ctx)
	uc := adapter.Usecases(ctx)

	err := uc.Item.Delete(ctx, request.ItemId, op)
	if err != nil {
		return ItemDelete400Response{}, err
	}
	return ItemDelete200JSONResponse{
		Id: request.ItemId.Ref(),
	}, nil
}

func (s Server) ItemGet(ctx context.Context, request ItemGetRequestObject) (ItemGetResponseObject, error) {
	op := adapter.Operator(ctx)
	uc := adapter.Usecases(ctx)

	i, err := uc.Item.FindByID(ctx, request.ItemId, op)
	if err != nil {
		return nil, err
	}

	ss, err := uc.Schema.FindByID(ctx, i.Value().Schema(), op)
	if err != nil {
		return ItemGet400Response{}, err
	}

	return ItemGet200JSONResponse(integrationapi.NewVersionedItem(i, ss)), nil
}
