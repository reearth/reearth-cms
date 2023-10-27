package integration

import (
	"context"
	"errors"
	"github.com/reearth/reearth-cms/server/pkg/schema"

	"github.com/reearth/reearth-cms/server/internal/adapter"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/integrationapi"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/reearth/reearthx/i18n"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
)

func (s Server) ItemFilter(ctx context.Context, request ItemFilterRequestObject) (ItemFilterResponseObject, error) {
	op := adapter.Operator(ctx)
	uc := adapter.Usecases(ctx)
	m, err := uc.Model.FindByID(ctx, request.ModelId, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return ItemFilter404Response{}, err
		}
		return ItemFilter400Response{}, err
	}

	ss, err := uc.Schema.FindByID(ctx, m.Schema(), op)
	if err != nil {
		return ItemFilter400Response{}, err
	}

	p := fromPagination(request.Params.Page, request.Params.PerPage)
	items, pi, err := adapter.Usecases(ctx).Item.FindBySchema(ctx, ss.ID(), nil, p, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return ItemFilter404Response{}, err
		}
		return ItemFilter400Response{}, err
	}

	assets, err := getAssetsFromItems(ctx, items, request.Params.Asset)
	if err != nil {
		return ItemFilter500Response{}, err
	}
	metaSchemas, metaItems := getMetaSchemasAndItems(ctx, items)
	if err != nil {
		return ItemFilter400Response{}, err
	}

	return ItemFilter200JSONResponse{
		Items: lo.ToPtr(util.Map(items, func(i item.Versioned) integrationapi.VersionedItem {
			metaItem, _ := lo.Find(metaItems, func(itm item.Versioned) bool {
				return itm.Value().ID() == lo.FromPtr(i.Value().MetadataItem())
			})
			var metaSchema *schema.Schema
			if metaItem != nil {
				metaSchema, _ = lo.Find(metaSchemas, func(s *schema.Schema) bool {
					return metaItem.Value().Schema() == s.ID()
				})
			}

			return integrationapi.NewVersionedItem(i, ss, assetContext(ctx, assets, request.Params.Asset), getReferencedItems(ctx, i), metaSchema, metaItem)
		})),
		Page:       request.Params.Page,
		PerPage:    request.Params.PerPage,
		TotalCount: lo.ToPtr(int(pi.TotalCount)),
	}, nil
}

func (s Server) ItemFilterWithProject(ctx context.Context, request ItemFilterWithProjectRequestObject) (ItemFilterWithProjectResponseObject, error) {
	op := adapter.Operator(ctx)
	uc := adapter.Usecases(ctx)

	prj, err := uc.Project.FindByIDOrAlias(ctx, request.ProjectIdOrAlias, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return ItemFilterWithProject400Response{}, err
		}
		return nil, err
	}

	m, err := uc.Model.FindByIDOrKey(ctx, prj.ID(), request.ModelIdOrKey, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return ItemFilterWithProject404Response{}, err
		}
		return ItemFilterWithProject400Response{}, err
	}

	ss, err := uc.Schema.FindByID(ctx, m.Schema(), op)
	if err != nil {
		return ItemFilterWithProject400Response{}, err
	}

	p := fromPagination(request.Params.Page, request.Params.PerPage)
	// TODO: support sort
	items, pi, err := adapter.Usecases(ctx).Item.FindBySchema(ctx, ss.ID(), nil, p, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return ItemFilterWithProject404Response{}, err
		}
		return ItemFilterWithProject400Response{}, err
	}

	assets, err := getAssetsFromItems(ctx, items, request.Params.Asset)
	if err != nil {
		return ItemFilterWithProject500Response{}, err
	}

	metaSchemas, metaItems := getMetaSchemasAndItems(ctx, items)
	if err != nil {
		return ItemFilterWithProject400Response{}, err
	}

	return ItemFilterWithProject200JSONResponse{
		Items: lo.ToPtr(util.Map(items, func(i item.Versioned) integrationapi.VersionedItem {
			metaItem, _ := lo.Find(metaItems, func(itm item.Versioned) bool {
				return itm.Value().ID() == lo.FromPtr(i.Value().MetadataItem())
			})
			var metaSchema *schema.Schema
			if metaItem != nil {
				metaSchema, _ = lo.Find(metaSchemas, func(s *schema.Schema) bool {
					return metaItem.Value().Schema() == s.ID()
				})
			}

			return integrationapi.NewVersionedItem(i, ss, assetContext(ctx, assets, request.Params.Asset), getReferencedItems(ctx, i), metaSchema, metaItem)
		})),
		Page:       request.Params.Page,
		PerPage:    request.Params.PerPage,
		TotalCount: lo.ToPtr(int(pi.TotalCount)),
	}, nil
}

func (s Server) ItemCreate(ctx context.Context, request ItemCreateRequestObject) (ItemCreateResponseObject, error) {
	op := adapter.Operator(ctx)
	uc := adapter.Usecases(ctx)

	if request.Body.Fields == nil {
		return ItemCreate400Response{}, rerror.NewE(i18n.T("missing fields"))
	}

	m, err := uc.Model.FindByID(ctx, request.ModelId, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return ItemCreate400Response{}, err
		}
		return nil, err
	}

	var metaSchema *schema.Schema
	var metaItem item.Versioned
	var metaItemID id.ItemID
	if request.Body.MetadataFields != nil && m.Metadata() != nil {
		metaSchema, err = uc.Schema.FindByID(ctx, *m.Metadata(), op)
		if err != nil {
			return ItemCreate400Response{}, err
		}
		metaFields := make([]interfaces.ItemFieldParam, 0, len(*request.Body.MetadataFields))
		for _, f := range *request.Body.MetadataFields {
			metaFields = append(metaFields, fromItemFieldParam(f))
		}

		cpMeta := interfaces.CreateItemParam{
			SchemaID: metaSchema.ID(),
			Fields:   metaFields,
			ModelID:  m.ID(),
		}

		metaItem, err = uc.Item.Create(ctx, cpMeta, op)
		if err != nil {
			return ItemCreate400Response{}, err
		}
		metaItemID = metaItem.Value().ID()
	}
	ss, err := uc.Schema.FindByID(ctx, m.Schema(), op)
	if err != nil {
		return ItemCreate400Response{}, err
	}

	fields := make([]interfaces.ItemFieldParam, 0, len(*request.Body.Fields))
	for _, f := range *request.Body.Fields {
		fields = append(fields, fromItemFieldParam(f))
	}

	cp := interfaces.CreateItemParam{
		SchemaID:   ss.ID(),
		Fields:     fields,
		MetadataID: lo.ToPtr(metaItemID),
		ModelID:    m.ID(),
	}

	i, err := uc.Item.Create(ctx, cp, op)
	if err != nil {
		return ItemCreate400Response{}, err
	}

	return ItemCreate200JSONResponse(integrationapi.NewVersionedItem(i, ss, nil, getReferencedItems(ctx, i), metaSchema, metaItem)), nil
}

func (s Server) ItemCreateWithProject(ctx context.Context, request ItemCreateWithProjectRequestObject) (ItemCreateWithProjectResponseObject, error) {
	op := adapter.Operator(ctx)
	uc := adapter.Usecases(ctx)

	if request.Body.Fields == nil {
		return ItemCreateWithProject400Response{}, rerror.NewE(i18n.T("missing fields"))
	}

	prj, err := uc.Project.FindByIDOrAlias(ctx, request.ProjectIdOrAlias, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return ItemCreateWithProject400Response{}, err
		}
		return nil, err
	}

	m, err := uc.Model.FindByIDOrKey(ctx, prj.ID(), request.ModelIdOrKey, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return ItemCreateWithProject400Response{}, err
		}
		return nil, err
	}

	var metaSchema *schema.Schema
	var metaItem item.Versioned
	var metaItemID id.ItemID
	if request.Body.MetadataFields != nil && m.Metadata() != nil {
		metaSchema, err = uc.Schema.FindByID(ctx, *m.Metadata(), op)
		if err != nil {
			return ItemCreateWithProject400Response{}, err
		}
		metaFields := make([]interfaces.ItemFieldParam, 0, len(*request.Body.MetadataFields))
		for _, f := range *request.Body.MetadataFields {
			metaFields = append(metaFields, fromItemFieldParam(f))
		}

		cpMeta := interfaces.CreateItemParam{
			SchemaID: metaSchema.ID(),
			Fields:   metaFields,
			ModelID:  m.ID(),
		}

		metaItem, err = uc.Item.Create(ctx, cpMeta, op)
		if err != nil {
			return ItemCreateWithProject400Response{}, err
		}
		metaItemID = metaItem.Value().ID()
	}
	ss, err := uc.Schema.FindByID(ctx, m.Schema(), op)
	if err != nil {
		return ItemCreateWithProject400Response{}, err
	}

	fields := make([]interfaces.ItemFieldParam, 0, len(*request.Body.Fields))
	for _, f := range *request.Body.Fields {
		fields = append(fields, fromItemFieldParam(f))
	}

	cp := interfaces.CreateItemParam{
		SchemaID:   ss.ID(),
		Fields:     fields,
		MetadataID: lo.ToPtr(metaItemID),
		ModelID:    m.ID(),
	}

	i, err := uc.Item.Create(ctx, cp, op)
	if err != nil {
		return ItemCreateWithProject400Response{}, err
	}

	return ItemCreateWithProject200JSONResponse(integrationapi.NewVersionedItem(i, ss, nil, getReferencedItems(ctx, i), metaSchema, metaItem)), nil
}

func (s Server) ItemUpdate(ctx context.Context, request ItemUpdateRequestObject) (ItemUpdateResponseObject, error) {
	op := adapter.Operator(ctx)
	uc := adapter.Usecases(ctx)

	if request.Body.Fields == nil {
		return ItemUpdate400Response{}, rerror.NewE(i18n.T("missing fields"))
	}

	i, err := uc.Item.FindByID(ctx, request.ItemId, op)
	if err != nil {
		return ItemUpdate400Response{}, err
	}
	var metaSchema *schema.Schema
	var metaItem item.Versioned
	var metaItemID id.ItemID
	if request.Body.MetadataFields != nil {
		metaFields := make([]interfaces.ItemFieldParam, 0, len(*request.Body.MetadataFields))
		for _, f := range *request.Body.MetadataFields {
			metaFields = append(metaFields, fromItemFieldParam(f))
		}
		if i.Value().MetadataItem() == nil {
			m, err := uc.Model.FindByID(ctx, i.Value().Model(), op)
			if err != nil {
				if errors.Is(err, rerror.ErrNotFound) {
					return ItemUpdate400Response{}, err
				}
				return nil, err
			}
			metaSchema, err = uc.Schema.FindByID(ctx, *m.Metadata(), op)
			if err != nil {
				return ItemUpdate400Response{}, err
			}

			cpMeta := interfaces.CreateItemParam{
				SchemaID: metaSchema.ID(),
				Fields:   metaFields,
				ModelID:  m.ID(),
			}

			metaItem, err = uc.Item.Create(ctx, cpMeta, op)
			if err != nil {
				return ItemUpdate400Response{}, err
			}
		} else {
			metaItem, err = uc.Item.FindByID(ctx, *i.Value().MetadataItem(), op)
			if err != nil {
				return ItemUpdate400Response{}, err
			}
			metaSchema, err = uc.Schema.FindByID(ctx, metaItem.Value().Schema(), op)
			if err != nil {
				return ItemUpdate400Response{}, err
			}
			upMeta := interfaces.UpdateItemParam{
				ItemID: metaItem.Value().ID(),
				Fields: metaFields,
			}
			metaItem, err = uc.Item.Update(ctx, upMeta, op)
			if err != nil {
				if errors.Is(err, rerror.ErrNotFound) {
					return ItemUpdate400Response{}, err
				}
				return ItemUpdate400Response{}, err
			}
		}
		metaItemID = metaItem.Value().ID()

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
		MetadataID: lo.ToPtr(metaItemID),
	}

	i, err = uc.Item.Update(ctx, up, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return ItemUpdate400Response{}, err
		}
		return ItemUpdate400Response{}, err
	}

	assets, err := getAssetsFromItems(ctx, item.VersionedList{i}, request.Body.Asset)
	if err != nil {
		return ItemUpdate500Response{}, err
	}

	return ItemUpdate200JSONResponse(integrationapi.NewVersionedItem(i, ss, assetContext(ctx, assets, request.Body.Asset), getReferencedItems(ctx, i), metaSchema, metaItem)), nil
}

func (s Server) ItemDelete(ctx context.Context, request ItemDeleteRequestObject) (ItemDeleteResponseObject, error) {
	op := adapter.Operator(ctx)
	uc := adapter.Usecases(ctx)

	err := uc.Item.Delete(ctx, request.ItemId, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return ItemDelete400Response{}, err
		}
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
		if errors.Is(err, rerror.ErrNotFound) {
			return ItemGet404Response{}, err
		}
		return nil, err
	}

	ss, err := uc.Schema.FindByID(ctx, i.Value().Schema(), op)
	if err != nil {
		return ItemGet400Response{}, err
	}

	assets, err := getAssetsFromItems(ctx, item.VersionedList{i}, request.Params.Asset)
	if err != nil {
		return ItemGet500Response{}, err
	}

	msList, miList := getMetaSchemasAndItems(ctx, item.VersionedList{i})
	if err != nil {
		return ItemGet400Response{}, err
	}

	var mi item.Versioned
	var ms *schema.Schema
	if miList != nil && len(miList) > 0 {
		mi = miList[0]
	}
	if msList != nil && len(msList) > 0 {
		ms = msList[0]
	}

	return ItemGet200JSONResponse(integrationapi.NewVersionedItem(i, ss, assetContext(ctx, assets, request.Params.Asset), getReferencedItems(ctx, i), ms, mi)), nil
}

func assetContext(ctx context.Context, m asset.Map, asset *integrationapi.AssetEmbedding) *integrationapi.AssetContext {
	uc := adapter.Usecases(ctx)

	return &integrationapi.AssetContext{
		Map:     m,
		BaseURL: uc.Asset.GetURL,
		All:     asset != nil && *asset == integrationapi.AssetEmbedding("all"),
	}
}

func getAssetsFromItems(ctx context.Context, items item.VersionedList, ap *integrationapi.AssetEmbedding) (asset.Map, error) {
	if ap == nil || *ap == "false" {
		return nil, nil
	}

	op := adapter.Operator(ctx)
	uc := adapter.Usecases(ctx)

	assets := lo.Uniq(lo.FlatMap(items, func(v item.Versioned, _ int) []id.AssetID {
		return v.Value().AssetIDs()
	}))

	res, err := uc.Asset.FindByIDs(ctx, assets, op)
	return res.Map(), err
}

func getReferencedItems(ctx context.Context, i *version.Value[*item.Item]) *[]integrationapi.VersionedItem {
	op := adapter.Operator(ctx)
	uc := adapter.Usecases(ctx)

	if i == nil {
		return nil
	}

	var vi []integrationapi.VersionedItem
	for _, f := range i.Value().Fields() {
		if f.Type() != value.TypeReference {
			continue
		}
		for _, v := range f.Value().Values() {
			iid, ok := v.Value().(id.ItemID)
			if !ok {
				continue
			}
			ii, err := uc.Item.FindByID(ctx, iid, op)
			if err != nil {
				continue
			}
			vi = append(vi, integrationapi.NewVersionedItem(ii, nil, nil, nil, nil, nil))
		}
	}

	return &vi
}

func getMetaSchemasAndItems(ctx context.Context, itemList item.VersionedList) (schema.List, item.VersionedList) {
	op := adapter.Operator(ctx)
	uc := adapter.Usecases(ctx)

	miIDs := util.Map(itemList, func(itm item.Versioned) id.ItemID {
		return lo.FromPtr(itm.Value().MetadataItem())
	})

	mi, err := uc.Item.FindByIDs(ctx, miIDs, op)
	if err != nil {
		return nil, nil
	}

	msIDs := util.Map(mi, func(i item.Versioned) id.SchemaID {
		return i.Value().Schema()
	})

	ms, err := uc.Schema.FindByIDs(ctx, msIDs, op)
	if err != nil {
		return nil, nil
	}

	return ms, mi
}
