package interactor

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/rbac"
	"github.com/reearth/reearthx/account/accountdomain/workspace"
)

func doCheckPermission(ctx context.Context, gateways *gateway.Container, resource rbac.Resource, action rbac.Action, workspaceIDs ...workspace.ID) error {
	if gateways == nil || gateways.Authorization == nil {
		return nil
	}
	allowed, err := gateways.Authorization.CheckPermission(ctx, resource, action, workspaceIDs...)
	if err != nil {
		return err
	}
	if !allowed {
		return interfaces.ErrOperationDenied
	}
	return nil
}

// workspaceIDForProject returns the workspace ID of the given project.
// TODO: Cache it
func workspaceIDForProject(ctx context.Context, r *repo.Container, projectID id.ProjectID) (workspace.ID, error) {
	p, err := r.Project.FindByID(ctx, projectID)
	if err != nil {
		return workspace.ID{}, err
	}
	return p.Workspace(), nil
}
