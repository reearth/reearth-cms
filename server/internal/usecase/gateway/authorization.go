package gateway

import (
	"context"
)

// Authorization handles permission checks via Cerbos
type Authorization interface {
	// CheckPermission checks if the principal can perform the action on the resource.
	// workspaceAlias is optional; if provided, the first value is used.
	CheckPermission(ctx context.Context, resource string, action string, workspaceAlias ...string) (bool, error)
}
