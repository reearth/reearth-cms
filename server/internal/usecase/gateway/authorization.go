package gateway

import (
	"context"

	"github.com/reearth/reearth-cms/server/pkg/rbac"
	"github.com/reearth/reearthx/account/accountdomain/workspace"
)

// Authorization handles permission checks via Cerbos
type Authorization interface {
	// CheckPermission checks if the principal can perform the action on the resource.
	// workspaceID is optional; if nil, no workspace filter is applied.
	CheckPermission(ctx context.Context, resource rbac.Resource, action rbac.Action, workspaceID *workspace.ID) (bool, error)
}
