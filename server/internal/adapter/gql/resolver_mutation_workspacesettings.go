package gql

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearthx/account/accountdomain"
)

func (r *mutationResolver) UpdateWorkspaceSettings(ctx context.Context, input gqlmodel.UpdateWorkspaceSettingsInput) (*gqlmodel.UpdateWorkspaceSettingsPayload, error) {
	wid, err := gqlmodel.ToID[accountdomain.Workspace](input.WorkspaceID)
	if err != nil {
		return nil, err
	}

	res, err := usecases(ctx).WorkspaceSettings.Update(ctx, interfaces.UpdateWorkspaceSettingsParam{
		WorkspaceID: wid,
		Avatar:      input.Avatar,
		Tiles:       gqlmodel.FromWorkspaceResourceList(input.Tiles),
		Terrains:    gqlmodel.FromWorkspaceResourceList(input.Terrains),
	}, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.UpdateWorkspaceSettingsPayload{WorkspaceSettings: gqlmodel.ToWorkspaceSettings(res)}, nil
}