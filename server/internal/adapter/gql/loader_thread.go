package gql

import (
	"context"

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
