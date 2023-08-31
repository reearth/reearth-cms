package gql

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/adapter/gql/gqldataloader"
	"github.com/reearth/reearth-cms/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
)

type SchemaFieldLoader struct {
	usecase interfaces.Schema
}

func NewSchemaFieldLoader(usecase interfaces.Schema) *SchemaFieldLoader {
	return &SchemaFieldLoader{usecase: usecase}
}

func (c *SchemaFieldLoader) Fetch(ctx context.Context, keys []gqlmodel.ID) ([]*gqlmodel.SchemaField, []error) {
	ff, err := util.TryMap(keys, gqlmodel.ToID[id.Field])
	if err != nil {
		return nil, []error{err}
	}

	res, err := c.usecase.FindFields(ctx, ff, getOperator(ctx))
	if err != nil {
		return nil, []error{err}
	}

	return lo.Map(res, func(f *schema.Field, _ int) *gqlmodel.SchemaField {
		return gqlmodel.ToSchemaField(f)
	}), nil
}

// data loaders

type SchemaFieldDataLoader interface {
	Load(gqlmodel.ID) (*gqlmodel.SchemaField, error)
	LoadAll([]gqlmodel.ID) ([]*gqlmodel.SchemaField, []error)
}

func (c *SchemaFieldLoader) DataLoader(ctx context.Context) SchemaFieldDataLoader {
	return gqldataloader.NewFieldLoader(gqldataloader.FieldLoaderConfig{
		Wait:     dataLoaderWait,
		MaxBatch: dataLoaderMaxBatch,
		Fetch: func(keys []gqlmodel.ID) ([]*gqlmodel.SchemaField, []error) {
			return c.Fetch(ctx, keys)
		},
	})
}

func (c *SchemaFieldLoader) OrdinaryDataLoader(ctx context.Context) SchemaFieldDataLoader {
	return &ordinarySchemaFieldLoader{
		fetch: func(keys []gqlmodel.ID) ([]*gqlmodel.SchemaField, []error) {
			return c.Fetch(ctx, keys)
		},
	}
}

type ordinarySchemaFieldLoader struct {
	fetch func(keys []gqlmodel.ID) ([]*gqlmodel.SchemaField, []error)
}

func (l *ordinarySchemaFieldLoader) Load(key gqlmodel.ID) (*gqlmodel.SchemaField, error) {
	res, errs := l.fetch([]gqlmodel.ID{key})
	if len(errs) > 0 {
		return nil, errs[0]
	}
	if len(res) > 0 {
		return res[0], nil
	}
	return nil, nil
}

func (l *ordinarySchemaFieldLoader) LoadAll(keys []gqlmodel.ID) ([]*gqlmodel.SchemaField, []error) {
	return l.fetch(keys)
}
