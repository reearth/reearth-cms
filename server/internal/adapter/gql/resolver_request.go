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
	//TODO implement me
	panic("implement me")
}

func (r requestResolver) Workspace(ctx context.Context, obj *gqlmodel.Request) (*gqlmodel.Workspace, error) {
	//TODO implement me
	panic("implement me")
}

func (r requestResolver) Project(ctx context.Context, obj *gqlmodel.Request) (*gqlmodel.Project, error) {
	//TODO implement me
	panic("implement me")
}

func (r requestResolver) Reviewers(ctx context.Context, obj *gqlmodel.Request) ([]*gqlmodel.User, error) {
	//TODO implement me
	panic("implement me")
}
