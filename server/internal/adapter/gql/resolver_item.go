package gql

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/adapter/gql/gqlmodel"
	"golang.org/x/exp/slices"
)

func (r *Resolver) Item() ItemResolver {
	return &itemResolver{r}
}

type itemResolver struct{ *Resolver }

func (i itemResolver) Project(ctx context.Context, obj *gqlmodel.Item) (*gqlmodel.Project, error) {
	return dataloaders(ctx).Project.Load(obj.ProjectID)
}

func (i itemResolver) Schema(ctx context.Context, obj *gqlmodel.Item) (*gqlmodel.Schema, error) {
	return dataloaders(ctx).Schema.Load(obj.SchemaID)
}

func (i itemResolver) Thread(ctx context.Context, obj *gqlmodel.Item) (*gqlmodel.Thread, error) {
	return dataloaders(ctx).Thread.Load(obj.ThreadID)
}

func (i itemResolver) Model(ctx context.Context, obj *gqlmodel.Item) (*gqlmodel.Model, error) {
	return dataloaders(ctx).Model.Load(obj.ModelID)
}

func (i itemResolver) User(ctx context.Context, obj *gqlmodel.Item) (*gqlmodel.User, error) {
	if obj.UserID != nil {
		return dataloaders(ctx).User.Load(*obj.UserID)
	}
	return nil, nil
}

func (i itemResolver) Integration(ctx context.Context, obj *gqlmodel.Item) (*gqlmodel.Integration, error) {
	if obj.IntegrationID != nil {
		return dataloaders(ctx).Integration.Load(*obj.IntegrationID)
	}
	return nil, nil
}

func (i itemResolver) Status(ctx context.Context, obj *gqlmodel.Item) ([]gqlmodel.ItemStatus, error) {
	requests, err := loaders(ctx).Request.FindByItem(ctx, obj.ID)
	if err != nil {
		return nil, err
	}
	var res []gqlmodel.ItemStatus
	for _, request := range requests {
		switch request.State {
		case gqlmodel.RequestStateWaiting:
			if !slices.Contains(res, gqlmodel.ItemStatusReview) {
				res = append(res, gqlmodel.ItemStatusReview)
			}
		case gqlmodel.RequestStateApproved:
			if !slices.Contains(res, gqlmodel.ItemStatusPublic) {
				res = append(res, gqlmodel.ItemStatusPublic)
			}
		}
	}
	if len(res) == 0 {
		res = append(res, gqlmodel.ItemStatusDraft)
	}
	return res, nil
}
