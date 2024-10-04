package gql

import (
	"context"
	"errors"
	"time"

	"github.com/reearth/reearthx/log"
	"go.opencensus.io/trace"

	"github.com/reearth/reearth-cms/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/version"
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

	res, err := c.usecase.FindByIDs(ctx, iIds, op)
	if err != nil {
		return nil, []error{err}
	}

	sIds := lo.SliceToMap(res, func(v item.Versioned) (id.ItemID, id.SchemaID) {
		return v.Value().ID(), v.Value().Schema()
	})
	ss, gs, err := c.schemaUsecase.GetSchemasAndGroupSchemasByIDs(ctx, lo.Uniq(lo.Values(sIds)), op)
	if err != nil {
		return nil, []error{err}
	}

	return lo.Map(iIds, func(iId item.ID, _ int) *gqlmodel.Item {
		i, ok := lo.Find(res, func(v item.Versioned) bool {
			return v != nil && v.Value() != nil && v.Value().ID() == iId
		})
		if !ok {
			return nil
		}
		s, ok := lo.Find(ss, func(s *schema.Schema) bool {
			return s != nil && s.ID() == i.Value().Schema()
		})
		if !ok {
			return nil
		}
		return gqlmodel.ToItem(i, s, gs)
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
	ss, gs, err := c.schemaUsecase.GetSchemasAndGroupSchemasByIDs(ctx, id.SchemaIDList{itm.Value().Schema()}, op)
	if err != nil {
		return nil, err
	}

	return gqlmodel.ToVersionedItem(itm, ss[0], gs), nil
}

func (c *ItemLoader) FindVersionedItems(ctx context.Context, itemID gqlmodel.ID) ([]*gqlmodel.VersionedItem, error) {
	op := getOperator(ctx)
	iId, err := gqlmodel.ToID[id.Item](itemID)
	if err != nil {
		return nil, err
	}

	res, err := c.usecase.FindAllVersionsByID(ctx, iId, op)
	if err != nil {
		return nil, err
	}

	ss, gs, err := c.schemaUsecase.GetSchemasAndGroupSchemasByIDs(ctx, id.SchemaIDList{res[0].Value().Schema()}, op)
	if err != nil {
		return nil, err
	}
	vis := make([]*gqlmodel.VersionedItem, 0, len(res))
	for _, t := range res {
		vis = append(vis, gqlmodel.ToVersionedItem(t, ss[0], gs))
	}
	return vis, nil
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

	sIds := lo.SliceToMap(res, func(v item.Versioned) (id.ItemID, id.SchemaID) {
		return v.Value().ID(), v.Value().Schema()
	})

	ss, gs, err := c.schemaUsecase.GetSchemasAndGroupSchemasByIDs(ctx, lo.Uniq(lo.Values(sIds)), op)
	if err != nil {
		return nil, err
	}
	edges := make([]*gqlmodel.ItemEdge, 0, len(res))
	nodes := make([]*gqlmodel.Item, 0, len(res))
	for _, i := range res {
		s, _ := lo.Find(ss, func(s *schema.Schema) bool {
			return s.ID() == sIds[i.Value().ID()]
		})
		itm := gqlmodel.ToItem(i, s, gs)
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
