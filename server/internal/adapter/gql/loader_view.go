package gql

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item/view"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
)

type ViewLoader struct {
	usecase interfaces.View
}

func NewViewLoader(usecase interfaces.View) *ViewLoader {
	return &ViewLoader{usecase: usecase}
}

func (c *ViewLoader) Fetch(ctx context.Context, ids []gqlmodel.ID) ([]*gqlmodel.View, []error) {
	vIDs, err := util.TryMap(ids, gqlmodel.ToID[id.View])
	if err != nil {
		return nil, []error{err}
	}

	op := getOperator(ctx)

	res, err := c.usecase.FindByIDs(ctx, vIDs, op)
	if err != nil {
		return nil, []error{err}
	}

	return lo.Map(vIDs, func(id view.ID, _ int) *gqlmodel.View {
		v, ok := lo.Find(res, func(v *view.View) bool {
			return v != nil && v.ID() == id
		})
		if !ok {
			return nil
		}
		return gqlmodel.ToView(v)
	}), nil
}

func (c *ViewLoader) FindByModel(ctx context.Context, modelID gqlmodel.ID) ([]*gqlmodel.View, error) {
	mID, err := gqlmodel.ToID[id.Model](modelID)
	if err != nil {
		return nil, err
	}

	op := getOperator(ctx)

	res, err := c.usecase.FindByModel(ctx, mID, op)
	if err != nil {
		return nil, err
	}
	views := make([]*gqlmodel.View, 0, len(res))
	for _, v := range res {
		views = append(views, gqlmodel.ToView(v))
	}
	return views, nil
}
