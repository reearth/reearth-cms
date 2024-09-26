package gql

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.
// Code generated by github.com/99designs/gqlgen version v0.17.54

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/adapter/gql/gqlmodel"
)

// Node is the resolver for the node field.
func (r *queryResolver) Node(ctx context.Context, id gqlmodel.ID, typeArg gqlmodel.NodeType) (gqlmodel.Node, error) {
	dataloaders := dataloaders(ctx)
	switch typeArg {
	case gqlmodel.NodeTypeUser:
		result, err := dataloaders.User.Load(id)
		if result == nil {
			return nil, nil
		}
		return result, err
	case gqlmodel.NodeTypeWorkspace:
		result, err := dataloaders.Workspace.Load(id)
		if result == nil {
			return nil, nil
		}
		return result, err
	case gqlmodel.NodeTypeProject:
		result, err := dataloaders.Project.Load(id)
		if result == nil {
			return nil, nil
		}
		return result, err
	case gqlmodel.NodeTypeAsset:
		result, err := dataloaders.Asset.Load(id)
		if result == nil {
			return nil, nil
		}
		return result, err
	case gqlmodel.NodeTypeModel:
		result, err := dataloaders.Model.Load(id)
		if result == nil {
			return nil, nil
		}
		return result, err
	case gqlmodel.NodeTypeSchema:
		result, err := dataloaders.Schema.Load(id)
		if result == nil {
			return nil, nil
		}
		return result, err
	case gqlmodel.NodeTypeItem:
		result, err := dataloaders.Item.Load(id)
		if result == nil {
			return nil, nil
		}
		return result, err
	case gqlmodel.NodeTypeView:
		result, err := dataloaders.View.Load(id)
		if result == nil {
			return nil, nil
		}
		return result, err
	case gqlmodel.NodeTypeIntegration:
		result, err := dataloaders.Integration.Load(id)
		if result == nil {
			return nil, nil
		}
		return result, err
	case gqlmodel.NodeTypeRequest:
		result, err := dataloaders.Request.Load(id)
		if result == nil {
			return nil, nil
		}
		return result, err
	case gqlmodel.NodeTypeGroup:
		result, err := dataloaders.Group.Load(id)
		if result == nil {
			return nil, nil
		}
		return result, err
	case gqlmodel.NodeTypeWorkspaceSettings:
		result, err := dataloaders.WorkspaceSettings.Load(id)
		if result == nil {
			return nil, nil
		}
		return result, err
	}
	return nil, nil
}

// Nodes is the resolver for the nodes field.
func (r *queryResolver) Nodes(ctx context.Context, id []gqlmodel.ID, typeArg gqlmodel.NodeType) ([]gqlmodel.Node, error) {
	dataloaders := dataloaders(ctx)
	switch typeArg {
	case gqlmodel.NodeTypeUser:
		data, err := dataloaders.User.LoadAll(id)
		if len(err) > 0 && err[0] != nil {
			return nil, err[0]
		}
		nodes := make([]gqlmodel.Node, len(data))
		for i := range data {
			nodes[i] = data[i]
		}
		return nodes, nil
	case gqlmodel.NodeTypeWorkspace:
		data, err := dataloaders.Workspace.LoadAll(id)
		if len(err) > 0 && err[0] != nil {
			return nil, err[0]
		}
		nodes := make([]gqlmodel.Node, len(data))
		for i := range data {
			nodes[i] = data[i]
		}
		return nodes, nil
	case gqlmodel.NodeTypeProject:
		data, err := dataloaders.Project.LoadAll(id)
		if len(err) > 0 && err[0] != nil {
			return nil, err[0]
		}
		nodes := make([]gqlmodel.Node, len(data))
		for i := range data {
			nodes[i] = data[i]
		}
		return nodes, nil
	case gqlmodel.NodeTypeAsset:
		data, err := dataloaders.Asset.LoadAll(id)
		if len(err) > 0 && err[0] != nil {
			return nil, err[0]
		}
		nodes := make([]gqlmodel.Node, len(data))
		for i := range data {
			nodes[i] = data[i]
		}
		return nodes, nil
	case gqlmodel.NodeTypeModel:
		data, err := dataloaders.Model.LoadAll(id)
		if len(err) > 0 && err[0] != nil {
			return nil, err[0]
		}
		nodes := make([]gqlmodel.Node, len(data))
		for i := range data {
			nodes[i] = data[i]
		}
		return nodes, nil
	case gqlmodel.NodeTypeSchema:
		data, err := dataloaders.Schema.LoadAll(id)
		if len(err) > 0 && err[0] != nil {
			return nil, err[0]
		}
		nodes := make([]gqlmodel.Node, len(data))
		for i := range data {
			nodes[i] = data[i]
		}
		return nodes, nil
	case gqlmodel.NodeTypeItem:
		data, err := dataloaders.Item.LoadAll(id)
		if len(err) > 0 && err[0] != nil {
			return nil, err[0]
		}
		nodes := make([]gqlmodel.Node, len(data))
		for i := range data {
			nodes[i] = data[i]
		}
		return nodes, nil
	case gqlmodel.NodeTypeView:
		data, err := dataloaders.View.LoadAll(id)
		if len(err) > 0 && err[0] != nil {
			return nil, err[0]
		}
		nodes := make([]gqlmodel.Node, len(data))
		for i := range data {
			nodes[i] = data[i]
		}
		return nodes, nil
	case gqlmodel.NodeTypeRequest:
		data, err := dataloaders.Request.LoadAll(id)
		if len(err) > 0 && err[0] != nil {
			return nil, err[0]
		}
		nodes := make([]gqlmodel.Node, len(data))
		for i := range data {
			nodes[i] = data[i]
		}
		return nodes, nil
	case gqlmodel.NodeTypeIntegration:
		data, err := dataloaders.Integration.LoadAll(id)
		if len(err) > 0 && err[0] != nil {
			return nil, err[0]
		}
		nodes := make([]gqlmodel.Node, len(data))
		for i := range data {
			nodes[i] = data[i]
		}
		return nodes, nil
	case gqlmodel.NodeTypeGroup:
		data, err := dataloaders.Group.LoadAll(id)
		if len(err) > 0 && err[0] != nil {
			return nil, err[0]
		}
		nodes := make([]gqlmodel.Node, len(data))
		for i := range data {
			nodes[i] = data[i]
		}
		return nodes, nil
	case gqlmodel.NodeTypeWorkspaceSettings:
		data, err := dataloaders.WorkspaceSettings.LoadAll(id)
		if len(err) > 0 && err[0] != nil {
			return nil, err[0]
		}
		nodes := make([]gqlmodel.Node, len(data))
		for i := range data {
			nodes[i] = data[i]
		}
		return nodes, nil
	}
	return nil, nil
}

// Mutation returns MutationResolver implementation.
func (r *Resolver) Mutation() MutationResolver { return &mutationResolver{r} }

// Query returns QueryResolver implementation.
func (r *Resolver) Query() QueryResolver { return &queryResolver{r} }

type mutationResolver struct{ *Resolver }
type queryResolver struct{ *Resolver }
