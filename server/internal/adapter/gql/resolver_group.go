package gql

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.
// Code generated by github.com/99designs/gqlgen version v0.17.55

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/group"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/samber/lo"
)

// Schema is the resolver for the schema field.
func (r *groupResolver) Schema(ctx context.Context, obj *gqlmodel.Group) (*gqlmodel.Schema, error) {
	return dataloaders(ctx).Schema.Load(obj.SchemaID)
}

// Project is the resolver for the project field.
func (r *groupResolver) Project(ctx context.Context, obj *gqlmodel.Group) (*gqlmodel.Project, error) {
	return dataloaders(ctx).Project.Load(obj.ProjectID)
}

// CreateGroup is the resolver for the createGroup field.
func (r *mutationResolver) CreateGroup(ctx context.Context, input gqlmodel.CreateGroupInput) (*gqlmodel.GroupPayload, error) {
	pId, err := gqlmodel.ToID[id.Project](input.ProjectID)
	if err != nil {
		return nil, err
	}
	res, err := usecases(ctx).Group.Create(ctx, interfaces.CreateGroupParam{
		ProjectId:   pId,
		Name:        input.Name,
		Description: input.Description,
		Key:         input.Key,
	}, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.GroupPayload{
		Group: gqlmodel.ToGroup(res),
	}, nil
}

// UpdateGroup is the resolver for the updateGroup field.
func (r *mutationResolver) UpdateGroup(ctx context.Context, input gqlmodel.UpdateGroupInput) (*gqlmodel.GroupPayload, error) {
	gid, err := gqlmodel.ToID[id.Group](input.GroupID)
	if err != nil {
		return nil, err
	}

	res, err := usecases(ctx).Group.Update(ctx, interfaces.UpdateGroupParam{
		GroupID:     gid,
		Name:        input.Name,
		Description: input.Description,
		Key:         input.Key,
	}, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.GroupPayload{
		Group: gqlmodel.ToGroup(res),
	}, nil
}

// UpdateGroupsOrder is the resolver for the updateGroupsOrder field.
func (r *mutationResolver) UpdateGroupsOrder(ctx context.Context, input gqlmodel.UpdateGroupsOrderInput) (*gqlmodel.GroupsPayload, error) {
	gIds, err := gqlmodel.ToIDs[id.Group](input.GroupIds)
	if err != nil {
		return nil, err
	}
	groups, err := usecases(ctx).Group.UpdateOrder(ctx, gIds, getOperator(ctx))
	if err != nil {
		return nil, err
	}
	return &gqlmodel.GroupsPayload{
		Groups: lo.Map(groups, func(mod *group.Group, _ int) *gqlmodel.Group {
			return gqlmodel.ToGroup(mod)
		}),
	}, nil
}

// DeleteGroup is the resolver for the deleteGroup field.
func (r *mutationResolver) DeleteGroup(ctx context.Context, input gqlmodel.DeleteGroupInput) (*gqlmodel.DeleteGroupPayload, error) {
	gid, err := gqlmodel.ToID[id.Group](input.GroupID)
	if err != nil {
		return nil, err
	}

	err = usecases(ctx).Group.Delete(ctx, gid, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.DeleteGroupPayload{
		GroupID: input.GroupID,
	}, nil
}

// Groups is the resolver for the groups field.
func (r *queryResolver) Groups(ctx context.Context, projectID *gqlmodel.ID, modelID *gqlmodel.ID) ([]*gqlmodel.Group, error) {
	if projectID != nil {
		return loaders(ctx).Group.FindByProject(ctx, *projectID)
	}
	if modelID != nil {
		return loaders(ctx).Group.FindByModel(ctx, *modelID)
	}
	return nil, nil
}

// ModelsByGroup is the resolver for the modelsByGroup field.
func (r *queryResolver) ModelsByGroup(ctx context.Context, groupID gqlmodel.ID) ([]*gqlmodel.Model, error) {
	return loaders(ctx).Group.FindModelsByGroup(ctx, groupID)
}

// CheckGroupKeyAvailability is the resolver for the checkGroupKeyAvailability field.
func (r *queryResolver) CheckGroupKeyAvailability(ctx context.Context, projectID gqlmodel.ID, key string) (*gqlmodel.KeyAvailability, error) {
	return loaders(ctx).Group.CheckKey(ctx, projectID, key)
}

// Group returns GroupResolver implementation.
func (r *Resolver) Group() GroupResolver { return &groupResolver{r} }

type groupResolver struct{ *Resolver }
