package gql

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/adapter/gql/gqldataloader"
	"github.com/reearth/reearth-cms/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/thread"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
)

type ThreadLoader struct {
	usecase interfaces.Thread
}

func NewThreadLoader(usecase interfaces.Thread) *ThreadLoader {
	return &ThreadLoader{usecase: usecase}
}

type ThreadDataLoader interface {
	Load(gqlmodel.ID) (*gqlmodel.Thread, error)
	LoadAll([]gqlmodel.ID) ([]*gqlmodel.Thread, []error)
}

func (c *ThreadLoader) DataLoader(ctx context.Context) ThreadDataLoader {
	return gqldataloader.NewThreadLoader(gqldataloader.ThreadLoaderConfig{
		Wait:     dataLoaderWait,
		MaxBatch: dataLoaderMaxBatch,
		Fetch: func(keys []gqlmodel.ID) ([]*gqlmodel.Thread, []error) {
			return c.FindByIDs(ctx, keys)
		},
	})
}

func (c *ThreadLoader) OrdinaryDataLoader(ctx context.Context) ThreadDataLoader {
	return &ordinaryThreadLoader{ctx: ctx, c: c}
}

type ordinaryThreadLoader struct {
	ctx context.Context
	c   *ThreadLoader
}

func (l *ordinaryThreadLoader) Load(key gqlmodel.ID) (*gqlmodel.Thread, error) {
	res, errs := l.c.FindByIDs(l.ctx, []gqlmodel.ID{key})
	if len(errs) > 0 {
		return nil, errs[0]
	}
	if len(res) > 0 {
		return res[0], nil
	}
	return nil, nil
}

func (l *ordinaryThreadLoader) LoadAll(keys []gqlmodel.ID) ([]*gqlmodel.Thread, []error) {
	return l.c.FindByIDs(l.ctx, keys)
}

func (c *ThreadLoader) FindByIDs(ctx context.Context, ids []gqlmodel.ID) ([]*gqlmodel.Thread, []error) {
	tIDs, err := util.TryMap(ids, gqlmodel.ToID[id.Thread])
	if err != nil {
		return nil, []error{err}
	}

	res, err := c.usecase.FindByIDs(ctx, tIDs, getOperator(ctx))
	if err != nil {
		return nil, []error{err}
	}

	return lo.Map(tIDs, func(id thread.ID, _ int) *gqlmodel.Thread {
		th, ok := lo.Find(res, func(t *thread.Thread) bool {
			return t != nil && t.ID() == id
		})
		if !ok {
			return nil
		}
		return gqlmodel.ToThread(th)
	}), nil
}
