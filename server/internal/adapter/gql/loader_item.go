package gql

import (
	"context"
	"errors"
	"time"

	"github.com/reearth/reearthx/log"
	"go.opencensus.io/trace"

	"github.com/reearth/reearth-cms/server/internal/adapter/gql/gqldataloader"
	"github.com/reearth/reearth-cms/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/usecasex"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
)

type ItemLoader struct {
	usecase       interfaces.Item
	schemaUsecase interfaces.Schema
	modelUsecase  interfaces.Model
}

func NewItemLoader(usecase interfaces.Item, schemaUsecase interfaces.Schema, modelUsecase interfaces.Model) *ItemLoader {
	return &ItemLoader{usecase: usecase, schemaUsecase: schemaUsecase, modelUsecase: modelUsecase}
}

func (c *ItemLoader) Fetch(ctx context.Context, ids []gqlmodel.ID) ([]*gqlmodel.Item, []error) {
	op := getOperator(ctx)
	if len(ids) == 0 {
		return nil, nil
	}
	iIds, err := util.TryMap(ids, gqlmodel.ToID[id.Item])
	if err != nil {
		return nil, []error{err}
	}

	items, err := c.usecase.FindByIDs(ctx, iIds, op)
	if err != nil {
		return nil, []error{err}
	}

	if len(items) == 0 || items[0] == nil || items[0].Value() == nil {
		return []*gqlmodel.Item{}, nil
	}

	sp, err := c.schemaUsecase.FindByModel(ctx, items[0].Value().Model(), op)
	if err != nil {
		return nil, []error{err}
	}

	return lo.Map(items, func(vi item.Versioned, i int) *gqlmodel.Item {
		return gqlmodel.ToItem(vi, sp)
	}), nil
}

func (c *ItemLoader) FindVersionedItem(ctx context.Context, itemID gqlmodel.ID) (*gqlmodel.VersionedItem, error) {
	op := getOperator(ctx)
	iId, err := gqlmodel.ToID[id.Item](itemID)
	if err != nil {
		return nil, err
	}

	itm, err := c.usecase.FindByID(ctx, iId, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return nil, nil
		}
		return nil, err
	}

	sp, err := c.schemaUsecase.FindByModel(ctx, itm.Value().Model(), op)

	return gqlmodel.ToVersionedItem(itm, sp), nil
}

func (c *ItemLoader) FindVersionedItems(ctx context.Context, itemID gqlmodel.ID) ([]*gqlmodel.VersionedItem, error) {
	op := getOperator(ctx)
	iId, err := gqlmodel.ToID[id.Item](itemID)
	if err != nil {
		return nil, err
	}

	itemVersions, err := c.usecase.FindAllVersionsByID(ctx, iId, op)
	if err != nil {
		return nil, err
	}

	if len(itemVersions) == 0 || itemVersions[0] == nil || itemVersions[0].Value() == nil {
		return []*gqlmodel.VersionedItem{}, nil
	}

	sp, err := c.schemaUsecase.FindByModel(ctx, itemVersions[0].Value().Model(), op)
	if err != nil {
		return nil, err
	}

	return lo.Map(itemVersions, func(vi item.Versioned, i int) *gqlmodel.VersionedItem {
		return gqlmodel.ToVersionedItem(vi, sp)
	}), nil
}

func (c *ItemLoader) Search(ctx context.Context, query gqlmodel.SearchItemInput) (*gqlmodel.ItemConnection, error) {
	_, span := trace.StartSpan(ctx, "loader/item/search")
	t := time.Now()
	defer func() { span.End(); log.Infof("trace: loader/item/search %s", time.Since(t)) }()

	op := getOperator(ctx)
	q := gqlmodel.ToItemQuery(query)

	sp, err := c.schemaUsecase.FindByModel(ctx, q.Model(), op)
	if err != nil {
		return nil, err
	}

	res, pi, err := c.usecase.Search(ctx, *sp, q, query.Pagination.Into(), op)
	if err != nil {
		return nil, err
	}

	edges := make([]*gqlmodel.ItemEdge, 0, len(res))
	nodes := make([]*gqlmodel.Item, 0, len(res))
	for _, i := range res {
		itm := gqlmodel.ToItem(i, sp)
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
		TotalCount: int(pi.TotalCount),
	}, nil
}

func (c *ItemLoader) IsItemReferenced(ctx context.Context, itemID gqlmodel.ID, correspondingFieldID gqlmodel.ID) (bool, error) {
	op := getOperator(ctx)
	iid, err := gqlmodel.ToID[id.Item](itemID)
	if err != nil {
		return false, err
	}
	fid, err := gqlmodel.ToID[id.Field](correspondingFieldID)
	if err != nil {
		return false, err
	}

	return c.usecase.IsItemReferenced(ctx, iid, fid, op)
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
