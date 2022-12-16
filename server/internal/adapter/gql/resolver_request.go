package gql

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/adapter/gql/gqlmodel"
)

func (r *Resolver) Request() RequestResolver {
	return &requestResolver{r}
}

type requestResolver struct{ *Resolver }

func (r requestResolver) Thread(ctx context.Context, obj *gqlmodel.Request) (*gqlmodel.Thread, error) {
	return dataloaders(ctx).Thread.Load(obj.ThreadID)
}

func (r requestResolver) Workspace(ctx context.Context, obj *gqlmodel.Request) (*gqlmodel.Workspace, error) {
	return dataloaders(ctx).Workspace.Load(obj.WorkspaceID)
}

func (r requestResolver) Project(ctx context.Context, obj *gqlmodel.Request) (*gqlmodel.Project, error) {
	return dataloaders(ctx).Project.Load(obj.ProjectID)
}

func (r requestResolver) Reviewers(ctx context.Context, obj *gqlmodel.Request) ([]*gqlmodel.User, error) {
	res, errors := dataloaders(ctx).User.LoadAll(obj.ReviewersID)
	return res, errors[0]
}

func (r requestResolver) CreatedBy(ctx context.Context, obj *gqlmodel.Request) (*gqlmodel.User, error) {
	return dataloaders(ctx).User.Load(obj.CreatedByID)
}
func (r *Resolver) RequestItem() RequestItemResolver {
	return &requestItemResolver{r}
}

type requestItemResolver struct{ *Resolver }

func (r requestItemResolver) Schema(ctx context.Context, obj *gqlmodel.RequestItem) (*gqlmodel.Schema, error) {
	itm, err := dataloaders(ctx).Item.Load(obj.ItemID)
	if err != nil {
		return nil, err
	}
	return dataloaders(ctx).Schema.Load(itm.SchemaID)
}

func (r requestItemResolver) Item(ctx context.Context, obj *gqlmodel.RequestItem) (*gqlmodel.VersionedItem, error) {
	return loaders(ctx).Item.FindVersionedItem(ctx, obj.ItemID)
}

func (r requestItemResolver) Model(ctx context.Context, obj *gqlmodel.RequestItem) (*gqlmodel.Model, error) {
	itm, err := dataloaders(ctx).Item.Load(obj.ItemID)
	if err != nil {
		return nil, err
	}
	return dataloaders(ctx).Model.Load(itm.ModelID)
}
