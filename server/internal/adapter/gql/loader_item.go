package gql

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/adapter/gql/gqldataloader"
	"github.com/reearth/reearth-cms/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearthx/usecasex"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
)

type ItemLoader struct {
	usecase interfaces.Item
}

func NewItemLoader(usecase interfaces.Item) *ItemLoader {
	return &ItemLoader{usecase: usecase}
}
func (c *ItemLoader) Fetch(ctx context.Context, ids []gqlmodel.ID) ([]*gqlmodel.Item, []error) {
	iIds, err := util.TryMap(ids, gqlmodel.ToID[id.Item])
	if err != nil {
		return nil, []error{err}
	}

	res, err := c.usecase.FindByIDs(ctx, iIds, getOperator(ctx))
	if err != nil {
		return nil, []error{err}
	}

	return lo.Map(res, func(m *item.Item, i int) *gqlmodel.Item {
		return gqlmodel.ToItem(m)
	}), nil
}

func (c *ItemLoader) FindVersionedItems(ctx context.Context, itemID gqlmodel.ID) ([]*gqlmodel.VersionedItem, error) {
	iId, err := gqlmodel.ToID[id.Item](itemID)
	if err != nil {
		return nil, err
	}

	res, err := c.usecase.FindAllVersionsByID(ctx, iId, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	vis := make([]*gqlmodel.VersionedItem, 0, len(res))
	for _, t := range res {
		vis = append(vis, gqlmodel.ToVersionedItem(t))
	}
	return vis, nil
}

func (c *ItemLoader) FindBySchema(ctx context.Context, schemaID gqlmodel.ID, first *int, last *int, before *usecasex.Cursor, after *usecasex.Cursor) (*gqlmodel.ItemConnection, error) {
	wid, err := gqlmodel.ToID[id.Schema](schemaID)
	if err != nil {
		return nil, err
	}

	res, pi, err := c.usecase.FindBySchema(ctx, wid, usecasex.NewPagination(first, last, before, after), getOperator(ctx))
	if err != nil {
		return nil, err
	}

	edges := make([]*gqlmodel.ItemEdge, 0, len(res))
	nodes := make([]*gqlmodel.Item, 0, len(res))
	for _, i := range res {
		itm := gqlmodel.ToItem(i)
		edges = append(edges, &gqlmodel.ItemEdge{
			Node:   itm,
			Cursor: usecasex.Cursor(itm.ID),
		})
		nodes = append(nodes, itm)
	}

	return &gqlmodel.ItemConnection{
		Edges:      edges,
		Nodes:      nodes,
		PageInfo:   gqlmodel.ToPageInfo(pi),
		TotalCount: pi.TotalCount,
	}, nil
}

func (c *ItemLoader) FindByProject(ctx context.Context, projectID gqlmodel.ID, first *int, last *int, before *usecasex.Cursor, after *usecasex.Cursor) (*gqlmodel.ItemConnection, error) {
	pid, err := gqlmodel.ToID[id.Project](projectID)
	if err != nil {
		return nil, err
	}

	res, pi, err := c.usecase.FindByProject(ctx, pid, usecasex.NewPagination(first, last, before, after), getOperator(ctx))
	if err != nil {
		return nil, err
	}

	edges := make([]*gqlmodel.ItemEdge, 0, len(res))
	nodes := make([]*gqlmodel.Item, 0, len(res))
	for _, i := range res {
		itm := gqlmodel.ToItem(i)
		edges = append(edges, &gqlmodel.ItemEdge{
			Node:   itm,
			Cursor: usecasex.Cursor(itm.ID),
		})
		nodes = append(nodes, itm)
	}

	return &gqlmodel.ItemConnection{
		Edges:      edges,
		Nodes:      nodes,
		PageInfo:   gqlmodel.ToPageInfo(pi),
		TotalCount: pi.TotalCount,
	}, nil
}

func (c *ItemLoader) Search(ctx context.Context, key string, first *int, last *int, before *usecasex.Cursor, after *usecasex.Cursor) (*gqlmodel.ItemConnection, error) {
	res, pi, err := c.usecase.FindByFieldValue(ctx, key, usecasex.NewPagination(first, last, before, after), getOperator(ctx))
	if err != nil {
		return nil, err
	}

	edges := make([]*gqlmodel.ItemEdge, 0, len(res))
	nodes := make([]*gqlmodel.Item, 0, len(res))
	for _, i := range res {
		itm := gqlmodel.ToItem(i)
		edges = append(edges, &gqlmodel.ItemEdge{
			Node:   itm,
			Cursor: usecasex.Cursor(itm.ID),
		})
		nodes = append(nodes, itm)
	}

	return &gqlmodel.ItemConnection{
		Edges:      edges,
		Nodes:      nodes,
		PageInfo:   gqlmodel.ToPageInfo(pi),
		TotalCount: pi.TotalCount,
	}, nil
}

// data loader

type ItemDataLoader interface {
	Load(gqlmodel.ID) (*gqlmodel.Item, error)
	LoadAll([]gqlmodel.ID) ([]*gqlmodel.Item, []error)
}

func (c *ItemLoader) DataLoader(ctx context.Context) ItemDataLoader {
	return gqldataloader.NewItemLoader(gqldataloader.ItemLoaderConfig{
		Wait:     dataLoaderWait,
		MaxBatch: dataLoaderMaxBatch,
		Fetch: func(keys []gqlmodel.ID) ([]*gqlmodel.Item, []error) {
			return c.Fetch(ctx, keys)
		},
	})
}

func (c *ItemLoader) OrdinaryDataLoader(ctx context.Context) ItemDataLoader {
	return &ordinaryItemLoader{
		fetch: func(keys []gqlmodel.ID) ([]*gqlmodel.Item, []error) {
			return c.Fetch(ctx, keys)
		},
	}
}

type ordinaryItemLoader struct {
	fetch func(keys []gqlmodel.ID) ([]*gqlmodel.Item, []error)
}

func (l *ordinaryItemLoader) Load(key gqlmodel.ID) (*gqlmodel.Item, error) {
	res, errs := l.fetch([]gqlmodel.ID{key})
	if len(errs) > 0 {
		return nil, errs[0]
	}
	if len(res) > 0 {
		return res[0], nil
	}
	return nil, nil
}

func (l *ordinaryItemLoader) LoadAll(keys []gqlmodel.ID) ([]*gqlmodel.Item, []error) {
	return l.fetch(keys)
}
