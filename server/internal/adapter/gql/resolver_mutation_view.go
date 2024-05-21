package gql

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item/view"
	"github.com/samber/lo"
)

func (r *mutationResolver) CreateView(ctx context.Context, input gqlmodel.CreateViewInput) (*gqlmodel.ViewPayload, error) {
	pID, mID, err := gqlmodel.ToID2[id.Project, id.Model](input.ProjectID, input.ModelID)
	if err != nil {
		return nil, err
	}

	var columns *view.ColumnList = nil
	if input.Columns != nil {
		l := lo.Map(input.Columns, func(fs *gqlmodel.ColumnSelectionInput, _ int) view.Column {
			return fs.Into()
		})
		columns = (*view.ColumnList)(&l)
	}
	res, err := usecases(ctx).View.Create(ctx, interfaces.CreateViewParam{
		Name:    input.Name,
		Project: pID,
		Model:   mID,
		Filter:  input.Filter.Into(),
		Sort:    input.Sort.Into(),
		Columns: columns,
	}, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.ViewPayload{View: gqlmodel.ToView(res)}, nil
}

func (r *mutationResolver) UpdateView(ctx context.Context, input gqlmodel.UpdateViewInput) (*gqlmodel.ViewPayload, error) {
	vID, err := gqlmodel.ToID[id.View](input.ViewID)
	if err != nil {
		return nil, err
	}

	var columns *view.ColumnList = nil
	if input.Columns != nil {
		l := lo.Map(input.Columns, func(fs *gqlmodel.ColumnSelectionInput, _ int) view.Column {
			return fs.Into()
		})
		columns = (*view.ColumnList)(&l)
	}
	res, err := usecases(ctx).View.Update(ctx, vID, interfaces.UpdateViewParam{
		ID:      vID,
		Name:    input.Name,
		Filter:  input.Filter.Into(),
		Sort:    input.Sort.Into(),
		Columns: columns,
	}, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.ViewPayload{View: gqlmodel.ToView(res)}, nil
}

func (r *mutationResolver) UpdateViewsOrder(ctx context.Context, input gqlmodel.UpdateViewsOrderInput) (*gqlmodel.ViewsPayload, error) {
	vIds, err := gqlmodel.ToIDs[id.View](input.ViewIds)
	if err != nil {
		return nil, err
	}
	views, err := usecases(ctx).View.UpdateOrder(ctx, vIds, getOperator(ctx))
	if err != nil {
		return nil, err
	}
	return &gqlmodel.ViewsPayload{
		Views: lo.Map(views, func(mod *view.View, _ int) *gqlmodel.View {
			return gqlmodel.ToView(mod)
		}),
	}, nil
}

func (r *mutationResolver) DeleteView(ctx context.Context, input gqlmodel.DeleteViewInput) (*gqlmodel.DeleteViewPayload, error) {
	vID, err := gqlmodel.ToID[id.View](input.ViewID)
	if err != nil {
		return nil, err
	}

	err = usecases(ctx).View.Delete(ctx, vID, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.DeleteViewPayload{ViewID: input.ViewID}, nil
}
