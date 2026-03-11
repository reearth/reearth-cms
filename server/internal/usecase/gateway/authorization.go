package gateway

import (
	"context"

	"github.com/reearth/reearthx/account/accountdomain"
)

// AuthorizationInput contains the information needed to check authorization
type AuthorizationInput struct {
	// UserID is the ID of the user making the request
	UserID accountdomain.UserID

	// WorkspaceID is the ID of the workspace that OWNS the resource being accessed
	WorkspaceID accountdomain.WorkspaceID

	// Resource is the resource being accessed
	Resource ResourceInput

	// Action is the action being performed (e.g., "create", "read", "update", "delete")
	Action string
}

// ResourceInput represents the resource being accessed
type ResourceInput struct {
	Type       string         // e.g., "item", "project", "model" (without "cms:" prefix)
	ID         string         // Resource ID
	Attributes map[string]any // e.g., {"owner": "user_id", "project": "project_id"}
}

// Authorization handles permission checks via Cerbos
type Authorization interface {
	// CheckPermission checks if the principal can perform the action on the resource
	CheckPermission(ctx context.Context, input AuthorizationInput) (bool, error)

	// CheckPermissions performs batch permission checks
	CheckPermissions(ctx context.Context, inputs []AuthorizationInput) ([]bool, error)
}
