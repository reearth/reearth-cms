package interactor

import (
	"context"
	"fmt"

	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/rbac"
	"github.com/reearth/reearthx/account/accountdomain"
)

// Authorizer is a centralized authorization service that checks permissions for ANY resource type.
type Authorizer struct {
	gateway gateway.Authorization
	repos   *repo.Container
}

// NewAuthorizer creates a new authorization service
func NewAuthorizer(gateway gateway.Authorization, repos *repo.Container) *Authorizer {
	return &Authorizer{
		gateway: gateway,
		repos:   repos,
	}
}

// Can checks if operator can perform action on a resource.
// Example:
//
//	authorizer := NewAuthorizer(i.gateways.Authorization, i.repos)
//	allowed, err := authorizer.Can(ctx, operator, rbac.ResourceItem, itemID.String(), rbac.ActionUpdate)
//	if !allowed {
//	    return ErrOperationDenied
//	}
func (a *Authorizer) Can(
	ctx context.Context,
	operator *usecase.Operator,
	resourceType string,
	resourceID string,
	action string,
) (bool, error) {
	// Skip for machine operators
	if operator.Machine {
		return true, nil
	}

	// User must be authenticated
	if operator.AcOperator == nil || operator.AcOperator.User == nil {
		return false, nil
	}

	// Fetch workspace and attributes based on resource type
	workspaceID, attributes, err := a.fetchResourceContext(ctx, resourceType, resourceID, operator)
	if err != nil {
		return false, err
	}

	// Layer 1: Local operator check (fast path)
	if !a.checkOperatorPermission(operator, resourceType, workspaceID, action, attributes) {
		return false, nil
	}

	// Layer 2: Policy check via Cerbos (if configured)
	if a.gateway != nil {
		input := gateway.AuthorizationInput{
			UserID:      *operator.AcOperator.User,
			WorkspaceID: workspaceID,
			Resource: gateway.ResourceInput{
				Type:       resourceType,
				ID:         resourceID,
				Attributes: attributes,
			},
			Action: action,
		}

		allowed, err := a.gateway.CheckPermission(ctx, input)
		if err != nil {
			return false, err
		}
		if !allowed {
			return false, nil
		}
	}

	return true, nil
}

// CanInWorkspace checks if operator can perform action on a resource type within a workspace.
//
// Example:
//
//	authorizer := NewAuthorizer(i.gateways.Authorization, i.repos)
//	allowed, err := authorizer.CanInWorkspace(ctx, operator, workspaceID, rbac.ResourceItem, rbac.ActionCreate)
func (a *Authorizer) CanInWorkspace(
	ctx context.Context,
	operator *usecase.Operator,
	workspaceID accountdomain.WorkspaceID,
	resourceType string,
	action string,
) (bool, error) {
	// Skip for machine operators
	if operator.Machine {
		return true, nil
	}

	// User must be authenticated
	if operator.AcOperator == nil || operator.AcOperator.User == nil {
		return false, nil
	}

	// Layer 1: Local operator check
	if action == rbac.ActionCreate || action == rbac.ActionUpdate || action == rbac.ActionDelete {
		if !operator.IsWritableWorkspace(workspaceID) {
			return false, nil
		}
	} else if action == rbac.ActionRead || action == rbac.ActionList {
		if !operator.IsReadableWorkspace(workspaceID) {
			return false, nil
		}
	}

	// Layer 2: Policy check via Cerbos (if configured)
	if a.gateway != nil {
		input := gateway.AuthorizationInput{
			UserID:      *operator.AcOperator.User,
			WorkspaceID: workspaceID,
			Resource: gateway.ResourceInput{
				Type: resourceType,
				ID:   workspaceID.String(), // Use workspace as resource context
			},
			Action: action,
		}

		allowed, err := a.gateway.CheckPermission(ctx, input)
		if err != nil {
			return false, err
		}
		if !allowed {
			return false, nil
		}
	}

	return true, nil
}

// fetchResourceContext fetches workspace and attributes for a resource
func (a *Authorizer) fetchResourceContext(
	ctx context.Context,
	resourceType string,
	resourceID string,
	operator *usecase.Operator,
) (accountdomain.WorkspaceID, map[string]any, error) {
	switch resourceType {
	case rbac.ResourceItem:
		itemID, err := id.ItemIDFrom(resourceID)
		if err != nil {
			return accountdomain.WorkspaceID{}, nil, err
		}
		return a.fetchItemContext(ctx, itemID)

	case rbac.ResourceModel:
		modelID, err := id.ModelIDFrom(resourceID)
		if err != nil {
			return accountdomain.WorkspaceID{}, nil, err
		}
		return a.fetchModelContext(ctx, modelID)

	case rbac.ResourceProject:
		projectID, err := id.ProjectIDFrom(resourceID)
		if err != nil {
			return accountdomain.WorkspaceID{}, nil, err
		}
		return a.fetchProjectContext(ctx, projectID)

	case rbac.ResourceWorkspace:
		// Workspace ID is the resource ID itself
		workspaceID, err := accountdomain.WorkspaceIDFrom(resourceID)
		if err != nil {
			return accountdomain.WorkspaceID{}, nil, err
		}
		return workspaceID, nil, nil

	case rbac.ResourceUser:
		// User operations don't require workspace context
		return accountdomain.WorkspaceID{}, map[string]any{
			"user_id": operator.AcOperator.User.String(),
		}, nil

	default:
		return accountdomain.WorkspaceID{}, nil, fmt.Errorf("unsupported resource type: %s", resourceType)
	}
}

// fetchItemContext fetches workspace and ownership attributes for an item
func (a *Authorizer) fetchItemContext(ctx context.Context, itemID id.ItemID) (accountdomain.WorkspaceID, map[string]any, error) {
	itm, err := a.repos.Item.FindByID(ctx, itemID, nil)
	if err != nil {
		return accountdomain.WorkspaceID{}, nil, err
	}
	itv := itm.Value()

	s, err := a.repos.Schema.FindByID(ctx, itv.Schema())
	if err != nil {
		return accountdomain.WorkspaceID{}, nil, err
	}

	attributes := make(map[string]any)
	if itv.User() != nil {
		attributes["owner"] = itv.User().String()
	}
	if itv.Integration() != nil {
		attributes["integration"] = itv.Integration().String()
	}

	return s.Workspace(), attributes, nil
}

// fetchModelContext fetches workspace for a model
func (a *Authorizer) fetchModelContext(ctx context.Context, modelID id.ModelID) (accountdomain.WorkspaceID, map[string]any, error) {
	m, err := a.repos.Model.FindByID(ctx, modelID)
	if err != nil {
		return accountdomain.WorkspaceID{}, nil, err
	}

	proj, err := a.repos.Project.FindByID(ctx, m.Project())
	if err != nil {
		return accountdomain.WorkspaceID{}, nil, err
	}

	return proj.Workspace(), nil, nil
}

// fetchProjectContext fetches workspace for a project
func (a *Authorizer) fetchProjectContext(ctx context.Context, projectID id.ProjectID) (accountdomain.WorkspaceID, map[string]any, error) {
	proj, err := a.repos.Project.FindByID(ctx, projectID)
	if err != nil {
		return accountdomain.WorkspaceID{}, nil, err
	}

	return proj.Workspace(), nil, nil
}

// checkOperatorPermission performs local operator checks (Layer 1)
func (a *Authorizer) checkOperatorPermission(
	operator *usecase.Operator,
	resourceType string,
	workspaceID accountdomain.WorkspaceID,
	action string,
	attributes map[string]any,
) bool {
	// Workspace-level checks
	switch action {
	case rbac.ActionCreate, rbac.ActionUpdate, rbac.ActionDelete, rbac.ActionPublish, rbac.ActionUnpublish, rbac.ActionImport:
		// Write actions
		if resourceType == rbac.ResourceItem && attributes != nil {
			// Items have special ownership logic
			ownerID, hasOwner := attributes["owner"].(string)
			if hasOwner && operator.AcOperator.User != nil && ownerID == operator.AcOperator.User.String() {
				// User owns the item - check if they're at least a writer
				return operator.IsWritableWorkspace(workspaceID)
			}
			// User doesn't own the item - need maintainer or above
			return operator.IsMaintainingWorkspace(workspaceID)
		}
		return operator.IsWritableWorkspace(workspaceID)

	case rbac.ActionRead, rbac.ActionList, rbac.ActionExport:
		// Read actions
		return operator.IsReadableWorkspace(workspaceID)

	case rbac.ActionManageMembers, rbac.ActionManageAPIKeys, rbac.ActionManageIntegrations:
		// Management actions - require maintainer
		return operator.IsMaintainingWorkspace(workspaceID)

	case rbac.ActionManageSubscription, rbac.ActionTransferOwnership:
		// Owner-only actions
		return operator.IsOwningWorkspace(workspaceID)

	default:
		// Default: require write permission
		return operator.IsWritableWorkspace(workspaceID)
	}
}
