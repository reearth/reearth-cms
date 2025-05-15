package gql

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearthx/usecasex"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
)

type AssetLoader struct {
	usecase interfaces.Asset
}

func NewAssetLoader(usecase interfaces.Asset) *AssetLoader {
	return &AssetLoader{usecase: usecase}
}

func (c *AssetLoader) FindByID(ctx context.Context, assetId gqlmodel.ID) (*gqlmodel.Asset, error) {
	aid, err := gqlmodel.ToID[id.Asset](assetId)
	if err != nil {
		return nil, err
	}

	a, err := c.usecase.FindByID(ctx, aid, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return gqlmodel.ToAsset(a), nil
}

func (c *AssetLoader) FindByIDs(ctx context.Context, ids []gqlmodel.ID) ([]*gqlmodel.Asset, []error) {
	aIDs, err := util.TryMap(ids, gqlmodel.ToID[id.Asset])
	if err != nil {
		return nil, []error{err}
	}

	res, err := c.usecase.FindByIDs(ctx, aIDs, getOperator(ctx))
	if err != nil {
		return nil, []error{err}
	}

	return util.Map(aIDs, func(id asset.ID) *gqlmodel.Asset {
		a, ok := lo.Find(res, func(a *asset.Asset) bool {
			return a != nil && a.ID() == id
		})
		if !ok {
			return nil
		}
		return gqlmodel.ToAsset(a)
	}), nil
}

func (c *AssetLoader) FindByProject(ctx context.Context, projectId gqlmodel.ID, keyword *string, sort *gqlmodel.AssetSort, p *gqlmodel.Pagination) (*gqlmodel.AssetConnection, error) {
	pid, err := gqlmodel.ToID[id.Project](projectId)
	if err != nil {
		return nil, err
	}

	f := interfaces.AssetFilter{
		Keyword:    keyword,
		Sort:       sort.Into(),
		Pagination: p.Into(),
	}

	assets, pi, err := c.usecase.FindByProject(ctx, pid, f, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	edges := make([]*gqlmodel.AssetEdge, 0, len(assets))
	nodes := make([]*gqlmodel.Asset, 0, len(assets))
	for _, a := range assets {
		asset := gqlmodel.ToAsset(a)
		edges = append(edges, &gqlmodel.AssetEdge{
			Node:   asset,
			Cursor: usecasex.Cursor(asset.ID),
		})
		nodes = append(nodes, asset)
	}

	return &gqlmodel.AssetConnection{
		Edges:      edges,
		Nodes:      nodes,
		PageInfo:   gqlmodel.ToPageInfo(pi),
		TotalCount: int(pi.TotalCount),
	}, nil
}

func (c *AssetLoader) Search(ctx context.Context, query gqlmodel.AssetQueryInput, sort *gqlmodel.AssetSort, pagination *gqlmodel.Pagination) (*gqlmodel.AssetConnection, error) {
	projectID, err := gqlmodel.ToID[id.Project](query.Project)
	if err != nil {
		return nil, err
	}

	var contentTypesFilter []string
	var ok bool
	// convert ContentTypes to string slice
	if query.ContentTypes != nil {
		contentTypesFilter = make([]string, len(query.ContentTypes))
		for i, ct := range query.ContentTypes {
			contentTypesFilter[i], ok = MapContentTypeEnum(ct.String())
			if !ok {
				return nil, gqlmodel.ErrInvalidContentTypes
			}
		}
	}
	filter := interfaces.AssetFilter{
		Keyword:      query.Q,
		Sort:         sort.Into(),
		Pagination:   pagination.Into(),
		ContentTypes: contentTypesFilter,
	}

	assets, pi, err := c.usecase.Search(ctx, projectID, filter, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	edges := make([]*gqlmodel.AssetEdge, 0, len(assets))
	nodes := make([]*gqlmodel.Asset, 0, len(assets))
	for _, a := range assets {
		asset := gqlmodel.ToAsset(a)
		edges = append(edges, &gqlmodel.AssetEdge{
			Node:   asset,
			Cursor: usecasex.Cursor(asset.ID),
		})
		nodes = append(nodes, asset)
	}

	totalCount := 0
	if pi.TotalCount == 0 {
		totalCount = int(pi.TotalCount)
	} else {
		totalCount = len(assets)
	}

	return &gqlmodel.AssetConnection{
		Edges:      edges,
		Nodes:      nodes,
		PageInfo:   gqlmodel.ToPageInfo(pi),
		TotalCount: totalCount,
	}, nil
}

func MapContentTypeEnum(enum string) (string, bool) {
	enumToMime := map[string]string{
		"JSON":    "application/json",
		"GEOJSON": "application/geo+json",
		"CSV":     "text/csv",
		"HTML":    "text/html",
		"XML":     "application/xml",
		"PDF":     "application/pdf",
		"PLAIN":   "text/plain",
	}

	mime, ok := enumToMime[enum]
	return mime, ok
}
