package rbac

import (
	"github.com/reearth/reearthx/cerbos/generator"
	"github.com/samber/lo"
)

const (
	ServiceName   = "cms"
	PolicyFileDir = "policies"
)

// Resources
const (
	ResourceUser      = "user"
	ResourceWorkspace = "workspace"
	ResourceProject   = "project"

	// CMS Schema Resources
	ResourceModel  = "model"
	ResourceSchema = "schema"

	// CMS Content Resources
	ResourceItem  = "item"
	ResourceAsset = "asset"

	// CMS Integration Resources
	ResourceIntegration = "integration"
	ResourceRequest     = "request"
	ResourceThread      = "thread"

	// CMS View Resources
	ResourceView              = "view"
	ResourceWorkspaceSettings = "workspace_settings"
)

// Standard CRUD Actions
const (
	ActionCreate = "create"
	ActionRead   = "read"
	ActionUpdate = "update"
	ActionDelete = "delete"
	ActionList   = "list"
)

// Actions with Different Permission Requirements
const (
	// Content actions
	ActionPublish   = "publish"
	ActionUnpublish = "unpublish"
	ActionExport    = "export"
	ActionImport    = "import"

	// Review/approval actions
	ActionApprove = "approve"
	ActionComment = "comment"

	// Management actions
	ActionManageMembers      = "manage_members"      // Covers add/edit/delete members
	ActionManageAPIKeys      = "manage_api_keys"     // Covers CRUD on API keys
	ActionManageIntegrations = "manage_integrations" // Covers webhooks, tokens
	ActionManageSubscription = "manage_subscription" // Owner-only billing
	ActionTransferOwnership  = "transfer_ownership"  // Owner-only
)

// Roles
const (
	roleReader     = "reader"
	roleWriter     = "writer"
	roleMaintainer = "maintainer"
	roleOwner      = "owner"
	roleSelf       = "self"
)

// Common role combinations to reduce repetition
var (
	allRoles           = []string{roleReader, roleWriter, roleMaintainer, roleOwner}
	writerAndAbove     = []string{roleWriter, roleMaintainer, roleOwner}
	maintainerAndAbove = []string{roleMaintainer, roleOwner}
	ownerOnly          = []string{roleOwner}
	selfOnly           = []string{roleSelf}
	// selfAndMaintainers is currently unused
	// selfAndMaintainers  = []string{roleSelf, roleMaintainer, roleOwner}
)

// ResourceRules defines all RBAC rules for CMS resources
var ResourceRules = []generator.ResourceRule{
	// ========== User ==========
	{
		Resource: ResourceUser,
		Actions: map[string]generator.ActionRule{
			ActionRead: {
				Roles: selfOnly,
				Condition: &generator.Condition{
					Match: generator.Match{
						Expr: lo.ToPtr("has(request.auxData.jwt)"),
					},
				},
			},
			ActionUpdate: {
				Roles: selfOnly,
				Condition: &generator.Condition{
					Match: generator.Match{
						Expr: lo.ToPtr("has(request.auxData.jwt)"),
					},
				},
			},
			ActionDelete: {
				Roles: selfOnly,
				Condition: &generator.Condition{
					Match: generator.Match{
						Expr: lo.ToPtr("has(request.auxData.jwt)"),
					},
				},
			},
			ActionList: {Roles: allRoles},
		},
	},

	// ========== Workspace ==========
	{
		Resource: ResourceWorkspace,
		Actions: map[string]generator.ActionRule{
			ActionCreate: {
				Roles: selfOnly,
				Condition: &generator.Condition{
					Match: generator.Match{
						Expr: lo.ToPtr("has(request.auxData.jwt)"),
					},
				},
			},
			ActionRead:               {Roles: allRoles},
			ActionUpdate:             {Roles: maintainerAndAbove},
			ActionDelete:             {Roles: ownerOnly},
			ActionList:               {Roles: []string{roleSelf, roleReader, roleWriter, roleMaintainer, roleOwner}},
			ActionManageMembers:      {Roles: maintainerAndAbove},
			ActionManageSubscription: {Roles: ownerOnly},
			ActionTransferOwnership:  {Roles: ownerOnly},
		},
	},

	// ========== Project ==========
	{
		Resource: ResourceProject,
		Actions: map[string]generator.ActionRule{
			ActionRead:          {Roles: allRoles},
			ActionList:          {Roles: allRoles},
			ActionCreate:        {Roles: ownerOnly},
			ActionUpdate:        {Roles: maintainerAndAbove},
			ActionDelete:        {Roles: ownerOnly},
			ActionManageAPIKeys: {Roles: maintainerAndAbove},
		},
	},

	// ========== Model ==========
	{
		Resource: ResourceModel,
		Actions: map[string]generator.ActionRule{
			ActionRead:   {Roles: allRoles},
			ActionList:   {Roles: allRoles},
			ActionCreate: {Roles: writerAndAbove},
			ActionUpdate: {Roles: writerAndAbove},
			ActionDelete: {Roles: writerAndAbove},
		},
	},

	// TODO: Add more resources on the next tasks
	// Schema, Item, Asset, Integration, Request, Thread, View, WorkspaceSettings
}
