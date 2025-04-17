package integration

import (
	"context"
	"errors"

	"github.com/reearth/reearth-cms/server/internal/adapter"
	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/integrationapi"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/model"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
)

func (s *Server) ItemFilter(ctx context.Context, request ItemFilterRequestObject) (ItemFilterResponseObject, error) {
	op := adapter.Operator(ctx)
	uc := adapter.Usecases(ctx)

	sp, err := uc.Schema.FindByModel(ctx, request.ModelId, op)
	if err != nil {
		return ItemFilter400Response{}, err
	}

	p := fromPagination(request.Params.Page, request.Params.PerPage)
	q := fromQuery(*sp, request)
	items, pi, err := uc.Item.Search(ctx, *sp, q, p, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return ItemFilter404Response{}, err
		}
		return ItemFilter400Response{}, err
	}

	a, af := shouldEmbedAsset(request.Params.Asset)
	cc, err := integrationapi.NewCC(items, a, af, loaders(ctx))
	if err != nil {
		return ItemFilter500Response{}, err
	}

	res, err := util.TryMap(items, func(i item.Versioned) (integrationapi.VersionedItem, error) {
		return integrationapi.NewVersionedItem(i, sp, cc), nil
	})
	if err != nil {
		return ItemFilter400Response{}, err
	}
	return ItemFilter200JSONResponse{
		Items:      &res,
		Page:       lo.ToPtr(Page(*p.Offset)),
		PerPage:    lo.ToPtr(int(p.Offset.Limit)),
		TotalCount: lo.ToPtr(int(pi.TotalCount)),
	}, nil
}

func (s *Server) ItemsAsGeoJSON(ctx context.Context, request ItemsAsGeoJSONRequestObject) (ItemsAsGeoJSONResponseObject, error) {
	op := adapter.Operator(ctx)
	uc := adapter.Usecases(ctx)

	schemaPackage, err := uc.Schema.FindByModel(ctx, request.ModelId, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return ItemsAsGeoJSON404Response{}, err
		}
		return ItemsAsGeoJSON400Response{}, err
	}

	featureCollections, err := uc.Item.ItemsAsGeoJSON(ctx, schemaPackage, request.Params.Page, request.Params.PerPage, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return ItemsAsGeoJSON404Response{}, err
		}
		return ItemsAsGeoJSON400Response{}, err
	}

	return ItemsAsGeoJSON200JSONResponse{
		Features: featureCollections.FeatureCollections.Features,
		Type:     featureCollections.FeatureCollections.Type,
	}, nil
}

func (s *Server) ItemsAsCSV(ctx context.Context, request ItemsAsCSVRequestObject) (ItemsAsCSVResponseObject, error) {
	op := adapter.Operator(ctx)
	uc := adapter.Usecases(ctx)

	schemaPackage, err := uc.Schema.FindByModel(ctx, request.ModelId, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return ItemsAsCSV404Response{}, err
		}
		return ItemsAsCSV400Response{}, err
	}

	pr, err := uc.Item.ItemsAsCSV(ctx, schemaPackage, request.Params.Page, request.Params.PerPage, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return ItemsAsCSV404Response{}, err
		}
		return ItemsAsCSV400Response{}, err
	}

	return ItemsAsCSV200TextcsvResponse{
		Body: pr.PipeReader,
	}, nil
}

func (s *Server) ItemFilterWithProject(ctx context.Context, request ItemFilterWithProjectRequestObject) (ItemFilterWithProjectResponseObject, error) {
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

	sp, err := uc.Schema.FindByModel(ctx, m.ID(), op)
	if err != nil {
		return ItemFilterWithProject400Response{}, err
	}

	p := fromPagination(request.Params.Page, request.Params.PerPage)
	// TODO: support sort
	items, pi, err := uc.Item.FindBySchema(ctx, sp.Schema().ID(), nil, p, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return ItemFilterWithProject404Response{}, err
		}
		return ItemFilterWithProject400Response{}, err
	}

	a, af := shouldEmbedAsset(request.Params.Asset)
	cc, err := integrationapi.NewCC(items, a, af, loaders(ctx))
	if err != nil {
		return ItemFilterWithProject500Response{}, err
	}

	res, err := util.TryMap(items, func(i item.Versioned) (integrationapi.VersionedItem, error) {
		return integrationapi.NewVersionedItem(i, sp, cc), nil
	})
	if err != nil {
		return ItemFilterWithProject400Response{}, err
	}
	return ItemFilterWithProject200JSONResponse{
		Items:      &res,
		Page:       request.Params.Page,
		PerPage:    request.Params.PerPage,
		TotalCount: lo.ToPtr(int(pi.TotalCount)),
	}, nil
}

func (s *Server) ItemsWithProjectAsGeoJSON(ctx context.Context, request ItemsWithProjectAsGeoJSONRequestObject) (ItemsWithProjectAsGeoJSONResponseObject, error) {
	op := adapter.Operator(ctx)
	uc := adapter.Usecases(ctx)

	prj, err := uc.Project.FindByIDOrAlias(ctx, request.ProjectIdOrAlias, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return ItemsWithProjectAsGeoJSON404Response{}, err
		}
		return ItemsWithProjectAsGeoJSON400Response{}, err
	}

	m, err := uc.Model.FindByIDOrKey(ctx, prj.ID(), request.ModelIdOrKey, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return ItemsWithProjectAsGeoJSON404Response{}, err
		}
		return ItemsWithProjectAsGeoJSON400Response{}, err
	}

	schemaPackage, err := uc.Schema.FindByModel(ctx, m.ID(), op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return ItemsWithProjectAsGeoJSON404Response{}, err
		}
		return ItemsWithProjectAsGeoJSON400Response{}, err
	}

	featureCollections, err := uc.Item.ItemsAsGeoJSON(ctx, schemaPackage, request.Params.Page, request.Params.PerPage, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return ItemsWithProjectAsGeoJSON404Response{}, err
		}
		return ItemsWithProjectAsGeoJSON400Response{}, err
	}

	return ItemsWithProjectAsGeoJSON200JSONResponse{
		Features: featureCollections.FeatureCollections.Features,
		Type:     featureCollections.FeatureCollections.Type,
	}, nil
}

func (s *Server) ItemsWithProjectAsCSV(ctx context.Context, request ItemsWithProjectAsCSVRequestObject) (ItemsWithProjectAsCSVResponseObject, error) {
	op := adapter.Operator(ctx)
	uc := adapter.Usecases(ctx)

	prj, err := uc.Project.FindByIDOrAlias(ctx, request.ProjectIdOrAlias, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return ItemsWithProjectAsCSV404Response{}, err
		}
		return ItemsWithProjectAsCSV400Response{}, err
	}

	m, err := uc.Model.FindByIDOrKey(ctx, prj.ID(), request.ModelIdOrKey, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return ItemsWithProjectAsCSV404Response{}, err
		}
		return ItemsWithProjectAsCSV400Response{}, err
	}

	schemaPackage, err := uc.Schema.FindByModel(ctx, m.ID(), op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return ItemsWithProjectAsCSV404Response{}, err
		}
		return ItemsWithProjectAsCSV400Response{}, err
	}

	pr, err := uc.Item.ItemsAsCSV(ctx, schemaPackage, request.Params.Page, request.Params.PerPage, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return ItemsWithProjectAsCSV404Response{}, err
		}
		return ItemsWithProjectAsCSV400Response{}, err
	}

	return ItemsWithProjectAsCSV200TextcsvResponse{
		Body: pr.PipeReader,
	}, nil
}

func (s *Server) ItemCreate(ctx context.Context, request ItemCreateRequestObject) (ItemCreateResponseObject, error) {
	op := adapter.Operator(ctx)
	uc := adapter.Usecases(ctx)

	m, err := uc.Model.FindByID(ctx, request.ModelId, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return ItemCreate400Response{}, err
		}
		return nil, err
	}

	res, err := createItem(ctx, uc, m, request.Body.Fields, request.Body.MetadataFields, op)
	if err != nil {
		return ItemCreate400Response{}, err
	}
	return ItemCreate200JSONResponse(*res), nil
}

func (s *Server) ItemCreateWithProject(ctx context.Context, request ItemCreateWithProjectRequestObject) (ItemCreateWithProjectResponseObject, error) {
	op := adapter.Operator(ctx)
	uc := adapter.Usecases(ctx)

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

	res, err := createItem(ctx, uc, m, request.Body.Fields, request.Body.MetadataFields, op)
	if err != nil {
		return ItemCreateWithProject400Response{}, err
	}
	return ItemCreateWithProject200JSONResponse(*res), nil
}

func (s *Server) ItemUpdate(ctx context.Context, request ItemUpdateRequestObject) (ItemUpdateResponseObject, error) {
	op := adapter.Operator(ctx)
	uc := adapter.Usecases(ctx)

	i, err := uc.Item.FindByID(ctx, request.ItemId, op)
	if err != nil {
		return ItemUpdate400Response{}, err
	}

	sp, err := uc.Schema.FindByModel(ctx, i.Value().Model(), op)
	if err != nil {
		return ItemUpdate400Response{}, err
	}

	var metaItem item.Versioned
	var metaItemID *id.ItemID
	if sp.MetaSchema() != nil && request.Body.MetadataFields != nil {
		metaFields := convertFields(request.Body.MetadataFields, sp, false, true)
		if i.Value().MetadataItem() == nil {

			cpMeta := interfaces.CreateItemParam{
				SchemaID: sp.MetaSchema().ID(),
				Fields:   metaFields,
				ModelID:  i.Value().Model(),
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
		metaItemID = metaItem.Value().ID().Ref()
	}

	if request.Body.Fields != nil {
		input := interfaces.UpdateItemParam{
			ItemID:     request.ItemId,
			Fields:     convertFields(request.Body.Fields, sp, false, false),
			MetadataID: metaItemID,
		}
		i, err = uc.Item.Update(ctx, input, op)
		if err != nil {
			if errors.Is(err, rerror.ErrNotFound) {
				return ItemUpdate400Response{}, err
			}
			return ItemUpdate400Response{}, err
		}
	}

	a, af := shouldEmbedAsset(request.Body.Asset)
	cc, err := integrationapi.NewCC(item.VersionedList{i}, a, af, loaders(ctx))
	if err != nil {
		return ItemUpdate500Response{}, err
	}

	return ItemUpdate200JSONResponse(integrationapi.NewVersionedItem(i, sp, cc)), nil
}

func (s *Server) ItemDelete(ctx context.Context, request ItemDeleteRequestObject) (ItemDeleteResponseObject, error) {
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

func (s *Server) ItemGet(ctx context.Context, request ItemGetRequestObject) (ItemGetResponseObject, error) {
	op := adapter.Operator(ctx)
	uc := adapter.Usecases(ctx)

	i, err := uc.Item.FindByID(ctx, request.ItemId, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return ItemGet404Response{}, err
		}
		return nil, err
	}

	sp, err := uc.Schema.FindByModel(ctx, i.Value().Model(), op)
	if err != nil {
		return ItemGet400Response{}, err
	}

	a, af := shouldEmbedAsset(request.Params.Asset)
	cc, err := integrationapi.NewCC(item.VersionedList{i}, a, af, loaders(ctx))
	if err != nil {
		return ItemGet500Response{}, err
	}

	return ItemGet200JSONResponse(integrationapi.NewVersionedItem(i, sp, cc)), nil
}

func createItem(ctx context.Context, uc *interfaces.Container, m *model.Model, fields, metaFields *[]integrationapi.Field, op *usecase.Operator) (*integrationapi.VersionedItem, error) {
	sp, err := uc.Schema.FindByModel(ctx, m.ID(), op)
	if err != nil {
		return nil, err
	}

	var metaItem item.Versioned
	var metaItemID *id.ItemID
	if m.Metadata() != nil {
		metaFields := convertFields(metaFields, sp, true, true)
		cpMeta := interfaces.CreateItemParam{
			SchemaID: sp.MetaSchema().ID(),
			Fields:   metaFields,
			ModelID:  m.ID(),
		}

		metaItem, err = uc.Item.Create(ctx, cpMeta, op)
		if err != nil {
			return nil, err
		}
		metaItemID = metaItem.Value().ID().Ref()
	}

	cp := interfaces.CreateItemParam{
		SchemaID:   sp.Schema().ID(),
		Fields:     convertFields(fields, sp, true, false),
		MetadataID: metaItemID,
		ModelID:    m.ID(),
	}

	i, err := uc.Item.Create(ctx, cp, op)
	if err != nil {
		return nil, err
	}

	cc, err := integrationapi.NewCC(item.VersionedList{i}, true, false, loaders(ctx))
	if err != nil {
		return nil, err
	}

	return lo.ToPtr(integrationapi.NewVersionedItem(i, sp, cc)), nil
}

func shouldEmbedAsset(p *integrationapi.AssetParam) (bool, bool) {
	a := p != nil && (*p == integrationapi.All || *p == integrationapi.True)
	af := p != nil && (*p == integrationapi.All)
	return a, af
}

func loaders(ctx context.Context) integrationapi.Loaders {
	uc := adapter.Usecases(ctx)
	op := adapter.Operator(ctx)
	return integrationapi.Loaders{
		Asset: func(ids []id.AssetID) (asset.List, error) {
			return uc.Asset.FindByIDs(ctx, ids, op)
		},
		AssetURL: uc.Asset.GetURL,
		Item: func(ids []id.ItemID) (item.VersionedList, error) {
			return uc.Item.FindByIDs(ctx, ids, op)
		},
	}
}
