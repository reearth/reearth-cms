package gql

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/adapter/gql/gqldataloader"
	"github.com/reearth/reearth-cms/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearthx/util"
)

type SchemaFieldLoader struct {
	usecase interfaces.Schema
}

func NewSchemaFieldLoader(usecase interfaces.Schema) *SchemaFieldLoader {
	return &SchemaFieldLoader{usecase: usecase}
}

type SchemaFieldDataLoader interface {
	Load(gqlmodel.ID) (*gqlmodel.SchemaField, error)
	LoadAll([]gqlmodel.ID) ([]*gqlmodel.SchemaField, []error)
}

func (c *SchemaFieldLoader) DataLoader(ctx context.Context) SchemaFieldDataLoader {
	return gqldataloader.NewSchemaFieldLoader(gqldataloader.SchemaFieldLoaderConfig{
		Wait:     dataLoaderWait,
		MaxBatch: dataLoaderMaxBatch,
		Fetch: func(keys []gqlmodel.ID) ([]*gqlmodel.SchemaField, []error) {
			return c.FindByIDs(ctx, keys)
		},
	})
}

func (c *SchemaFieldLoader) OrdinaryDataLoader(ctx context.Context) SchemaFieldDataLoader {
	return &ordinarySchemaFieldLoader{ctx: ctx, c: c}
}

type ordinarySchemaFieldLoader struct {
	ctx context.Context
	c   *SchemaFieldLoader
}

func (l *ordinarySchemaFieldLoader) Load(id gqlmodel.ID) (*gqlmodel.SchemaField, error) {
	res, errs := l.c.FindByIDs(l.ctx, []gqlmodel.ID{id})
	if len(errs) > 0 {
		return nil, errs[0]
	}
	if len(res) > 0 {
		return res[0], nil
	}
	return nil, nil
}

func (l *ordinarySchemaFieldLoader) LoadAll(keys []gqlmodel.ID) ([]*gqlmodel.SchemaField, []error) {
	return l.c.FindByIDs(l.ctx, keys)
}

func (c *SchemaFieldLoader) FindByIDs(ctx context.Context, ids []gqlmodel.ID) ([]*gqlmodel.SchemaField, []error) {
	ids2, err := util.TryMap(ids, gqlmodel.ToID[id.Field])
	if err != nil {
		return nil, []error{err}
	}

	res, err := c.usecase.FindFieldByIDs(ctx, ids2, getOperator(ctx))
	if err != nil {
		return nil, []error{err}
	}

	return util.Map(res, func(a *schema.Field) *gqlmodel.SchemaField {
		return gqlmodel.ToSchemaField(a)
	}), nil
}
