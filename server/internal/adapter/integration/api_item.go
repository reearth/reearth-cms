package integration

import (
	"context"
	"errors"

	"github.com/deepmap/oapi-codegen/pkg/types"
	"github.com/reearth/reearth-cms/server/internal/adapter"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/integrationapi"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/model"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/version"
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

	items, pi, err := adapter.Usecases(ctx).Item.FindBySchema(ctx, m[0].Schema(), p, op)
	if err != nil {
		return ItemFilter400Response{}, err
	}

	itemList := lo.Map(items, func(i *item.Item, _ int) integrationapi.Item {
		ver, err := uc.Item.FindAllVersionsByID(ctx, i.ID(), op)
		if err != nil {
			return integrationapi.Item{}
		}

		return toItem2(i, ver[len(ver)-1], m[0].ID())
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
		Fields: lo.Map(*request.Body.Fields, func(f integrationapi.Field, _ int) interfaces.ItemFieldParam {
			return toItemFieldParam(f)
		}),
	}

	i, err := uc.Item.Create(ctx, cp, op)
	if err != nil {
		return ItemCreate400Response{}, err
	}

	ver, err := uc.Item.FindAllVersionsByID(ctx, i.ID(), op)
	if err != nil {
		return nil, err
	}

	return ItemCreate200JSONResponse(toItem2(i, ver[len(ver)-1], id.NewModelID())), nil
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

	return ItemGet200JSONResponse(toItem2(itm, ver[len(ver)-1], id.NewModelID())), nil
}

func (s Server) ItemPublish(ctx context.Context, request ItemPublishRequestObject) (ItemPublishResponseObject, error) {
	// TODO implement me
	panic("implement me")
}

func toItem2(i *item.Item, ver *version.Value[*item.Item], mId model.ID) integrationapi.Item {
	fs := lo.Map(i.Fields(), func(f *item.Field, _ int) integrationapi.Field {
		return integrationapi.Field{
			Id:    f.SchemaFieldID().Ref(),
			Type:  lo.ToPtr(integrationapi.FieldType(f.ValueType())),
			Value: lo.ToPtr(f.Value()),
		}
	})
	ps := lo.Map(ver.Parents().Values(), func(v version.Version, _ int) types.UUID {
		return types.UUID(v)
	})
	rs := lo.Map(ver.Refs().Values(), func(r version.Ref, _ int) string {
		return string(r)
	})
	return integrationapi.Item{
		Id:        lo.ToPtr(i.ID()),
		ModelId:   lo.ToPtr(mId),
		Archived:  lo.ToPtr(ver.Value() == nil),
		Fields:    &fs,
		CreatedAt: &types.Date{Time: i.Timestamp()},
		UpdatedAt: &types.Date{Time: ver.Value().Timestamp()},
		Parents:   &ps,
		Refs:      &rs,
		Version:   lo.ToPtr(types.UUID(ver.Version())),
	}
}

func toItemFieldParam(f integrationapi.Field) interfaces.ItemFieldParam {
	return interfaces.ItemFieldParam{
		SchemaFieldID: *f.Id,
		ValueType:     FromSchemaFieldType(f.Type),
		Value:         f.Value,
	}
}

func FromSchemaFieldType(t *integrationapi.FieldType) schema.Type {
	switch *t {
	case integrationapi.FieldTypeText:
		return schema.TypeText
	case integrationapi.FieldTypeTextArea:
		return schema.TypeTextArea
	case integrationapi.FieldTypeRichText:
		return schema.TypeRichText
	case integrationapi.FieldTypeMarkdown:
		return schema.TypeMarkdown
	case integrationapi.FieldTypeAsset:
		return schema.TypeAsset
	case integrationapi.FieldTypeDate:
		return schema.TypeDate
	case integrationapi.FieldTypeBool:
		return schema.TypeBool
	case integrationapi.FieldTypeSelect:
		return schema.TypeSelect
	case integrationapi.FieldTypeTag:
		return schema.TypeTag
	case integrationapi.FieldTypeInteger:
		return schema.TypeInteger
	case integrationapi.FieldTypeReference:
		return schema.TypeReference
	case integrationapi.FieldTypeUrl:
		return schema.TypeURL
	default:
		return ""
	}
}
