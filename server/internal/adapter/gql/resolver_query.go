package gql

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth-cms/server/internal/usecase"
)

func (r *Resolver) Query() QueryResolver {
	return &queryResolver{r}
}

type queryResolver struct{ *Resolver }

func (r *queryResolver) Models(ctx context.Context, projectID gqlmodel.ID, first *int, last *int, after *usecase.Cursor, before *usecase.Cursor) (*gqlmodel.ModelConnection, error) {
	// TODO implement me
	panic("implement me")
}

func (r *queryResolver) CheckModelKeyAvailability(ctx context.Context, key string) (*gqlmodel.KeyAvailability, error) {
	// TODO implement me
	panic("implement me")
}

func (r *queryResolver) GetModelFields(ctx context.Context, modelID gqlmodel.ID) ([]*gqlmodel.SchemaField, error) {
	// TODO implement me
	panic("implement me")
}

func (r *queryResolver) CheckFieldKeyAvailability(ctx context.Context, key string) (*gqlmodel.KeyAvailability, error) {
	// TODO implement me
	panic("implement me")
}

func (r *queryResolver) Me(ctx context.Context) (*gqlmodel.Me, error) {
	u := getUser(ctx)
	if u == nil {
		return nil, nil
	}
	return gqlmodel.ToMe(u), nil
}

func (r *queryResolver) Node(ctx context.Context, i gqlmodel.ID, typeArg gqlmodel.NodeType) (gqlmodel.Node, error) {
	dataloaders := dataloaders(ctx)
	switch typeArg {
	case gqlmodel.NodeTypeWorkspace:
		result, err := dataloaders.Workspace.Load(i)
		if result == nil {
			return nil, nil
		}
		return result, err
	case gqlmodel.NodeTypeUser:
		result, err := dataloaders.User.Load(i)
		if result == nil {
			return nil, nil
		}
		return result, err
	}
	return nil, nil
}

func (r *queryResolver) Nodes(ctx context.Context, ids []gqlmodel.ID, typeArg gqlmodel.NodeType) ([]gqlmodel.Node, error) {
	dataloaders := dataloaders(ctx)
	switch typeArg {
	case gqlmodel.NodeTypeWorkspace:
		data, err := dataloaders.Workspace.LoadAll(ids)
		if len(err) > 0 && err[0] != nil {
			return nil, err[0]
		}
		nodes := make([]gqlmodel.Node, len(data))
		for i := range data {
			nodes[i] = data[i]
		}
		return nodes, nil
	case gqlmodel.NodeTypeUser:
		data, err := dataloaders.User.LoadAll(ids)
		if len(err) > 0 && err[0] != nil {
			return nil, err[0]
		}
		nodes := make([]gqlmodel.Node, len(data))
		for i := range data {
			nodes[i] = data[i]
		}
		return nodes, nil
	default:
		return nil, nil
	}
}

func (r *queryResolver) SearchUser(ctx context.Context, nameOrEmail string) (*gqlmodel.User, error) {
	return loaders(ctx).User.SearchUser(ctx, nameOrEmail)
}

func (r *queryResolver) Projects(ctx context.Context, workspaceID gqlmodel.ID, first *int, last *int, after *usecase.Cursor, before *usecase.Cursor) (*gqlmodel.ProjectConnection, error) {
	return loaders(ctx).Project.FindByWorkspace(ctx, workspaceID, first, last, before, after)
}

func (r *queryResolver) CheckProjectAlias(ctx context.Context, alias string) (*gqlmodel.ProjectAliasAvailability, error) {
	return loaders(ctx).Project.CheckAlias(ctx, alias)
}

func (r *queryResolver) GetAsset(ctx context.Context, assetID gqlmodel.ID) (*gqlmodel.Asset, error) {
	// TODO implement me
	panic("implement me")
}