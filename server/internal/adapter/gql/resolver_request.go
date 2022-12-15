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
	res, err := dataloaders(ctx).User.LoadAll(obj.ReviewersID)
	return res, err[0]
}

func (r requestResolver) CreatedBy(ctx context.Context, obj *gqlmodel.Request) (*gqlmodel.User, error) {
	return dataloaders(ctx).User.Load(obj.CreatedByID)
}
