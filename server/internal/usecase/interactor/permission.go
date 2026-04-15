package interactor

import (
	"context"

	"golang.org/x/sync/errgroup"

	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/rbac"
	"github.com/reearth/reearthx/account/accountdomain/workspace"
	"github.com/reearth/reearthx/log"
)

// doCheckPermission is the shared implementation for all interactor checkPermission methods.
// Callers pass their specific rbac.Resource constant; everything else is identical.
func doCheckPermission(
	ctx context.Context,
	gateways *gateway.Container,
	resource rbac.Resource,
	action rbac.Action,
	workspaceID *workspace.ID,
	operator *usecase.Operator,
	caller string,
) error {
	if gateways == nil || gateways.Authorization == nil {
		return nil
	}
	allowed, authErr := gateways.Authorization.CheckPermission(ctx, resource, action, workspaceID)
	if authErr != nil {
		userID := "unknown"
		if operator.User() != nil {
			userID = operator.User().String()
		}
		log.Errorf("%s: permission check failed for user=%s: %v", caller, userID, authErr)
		return authErr
	}
	if !allowed {
		return interfaces.ErrOperationDenied
	}
	return nil
}

// checkWorkspacePermissions runs checkFn for each unique workspace ID in parallel.
func checkWorkspacePermissions(ctx context.Context, workspaceIDs []workspace.ID, checkFn func(context.Context, workspace.ID) error) error {
	eg, egCtx := errgroup.WithContext(ctx)
	for _, ws := range workspaceIDs {
		eg.Go(func() error {
			return checkFn(egCtx, ws)
		})
	}
	return eg.Wait()
}
