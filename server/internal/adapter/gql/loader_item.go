package gql

import (
	"context"
	"errors"
	"time"

	"github.com/reearth/reearth-cms/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/usecasex"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
	"go.opencensus.io/trace"
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

func (c *ItemLoader) FindVersionedItem(ctx context.Context, itemID gqlmodel.ID, ver *string) (*gqlmodel.VersionedItem, error) {
	op := getOperator(ctx)
	iId, err := gqlmodel.ToID[id.Item](itemID)
	if err != nil {
		return nil, err
	}

	ptr := version.ToVersionOrLatestRef(ver)
	itm, err := c.usecase.FindVersionByID(ctx, iId, ptr, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return nil, nil
		}
		return nil, err
	}

	sp, err := c.schemaUsecase.FindByModel(ctx, itm.Value().Model(), op)
	if err != nil {
		return nil, err
	}

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
