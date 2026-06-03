package rbac

import (
	"github.com/reearth/reearthx/cerbos/generator"
	"github.com/samber/lo"
)

// Resource represents a Cerbos resource type.
type Resource = string

// Action represents a Cerbos action.
type Action = string

const (
	ServiceName   = "cms"
	PolicyFileDir = "policies"
)

// Resources
const (
	ResourceUser      Resource = "user"
	ResourceWorkspace Resource = "workspace"
	ResourceProject   Resource = "project"

	// CMS Schema Resources
	ResourceModel  Resource = "model"
	ResourceSchema Resource = "schema"

	// CMS Content Resources
	ResourceItem  Resource = "item"
	ResourceAsset Resource = "asset"

	// CMS Integration Resources
	ResourceIntegration Resource = "integration"
	ResourceRequest     Resource = "request"
	ResourceThread      Resource = "thread"

	// CMS View Resources
	ResourceView              Resource = "view"
	ResourceWorkspaceSettings Resource = "workspace_settings"
)

// Standard CRUD Actions
const (
	ActionCreate Action = "create"
	ActionRead   Action = "read"
	ActionUpdate Action = "update"
	ActionDelete Action = "delete"
	ActionList   Action = "list"
)

// Actions with Different Permission Requirements
const (
	// Content actions
	ActionPublish   Action = "publish"
	ActionUnpublish Action = "unpublish"
	ActionExport    Action = "export"
	ActionImport    Action = "import"

	// Review/approval actions
	ActionApprove Action = "approve"
	ActionComment Action = "comment"

	// Management actions
	ActionManageMembers      Action = "manage_members"      // Covers add/edit/delete members
	ActionManageAPIKeys      Action = "manage_api_keys"     // Covers CRUD on API keys
	ActionManageIntegrations Action = "manage_integrations" // Covers webhooks, tokens
	ActionManageSubscription Action = "manage_subscription" // Owner-only billing
	ActionTransferOwnership  Action = "transfer_ownership"  // Owner-only
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

// jwtRequired is a shared condition that requires a JWT token to be present in the request.
var jwtRequired = &generator.Condition{
	Match: generator.Match{
		Expr: lo.ToPtr("has(request.auxData.jwt)"),
	},
}

// ResourceRules defines all RBAC rules for CMS resources
var ResourceRules = []generator.ResourceRule{
	// ========== User ==========
	{
		Resource: ResourceUser,
		Actions: map[Action]generator.ActionRule{
			ActionRead:   {Roles: selfOnly, Condition: jwtRequired},
			ActionUpdate: {Roles: selfOnly, Condition: jwtRequired},
			ActionDelete: {Roles: selfOnly, Condition: jwtRequired},
			ActionList:   {Roles: allRoles},
		},
	},

	// ========== Workspace ==========
	{
		Resource: ResourceWorkspace,
		Actions: map[Action]generator.ActionRule{
			ActionCreate:             {Roles: selfOnly, Condition: jwtRequired},
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
		Actions: map[Action]generator.ActionRule{
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
		Actions: map[Action]generator.ActionRule{
			ActionRead:   {Roles: allRoles},
			ActionList:   {Roles: allRoles},
			ActionCreate: {Roles: writerAndAbove},
			ActionUpdate: {Roles: writerAndAbove},
			ActionDelete: {Roles: writerAndAbove},
		},
	},

	// ========== Schema ==========
	{
		Resource: ResourceSchema,
		Actions: map[Action]generator.ActionRule{
			ActionRead:   {Roles: allRoles},
			ActionList:   {Roles: allRoles},
			ActionUpdate: {Roles: writerAndAbove},
		},
	},

	// ========== Integration ==========
	{
		Resource: ResourceIntegration,
		Actions: map[Action]generator.ActionRule{
			ActionRead:   {Roles: selfOnly, Condition: jwtRequired},
			ActionList:   {Roles: selfOnly, Condition: jwtRequired},
			ActionCreate: {Roles: selfOnly, Condition: jwtRequired},
			ActionUpdate: {Roles: selfOnly, Condition: jwtRequired},
			ActionDelete: {Roles: selfOnly, Condition: jwtRequired},
		},
	},

	// ========== Item ==========
	{
		Resource: ResourceItem,
		Actions: map[Action]generator.ActionRule{
			ActionRead:      {Roles: allRoles},
			ActionList:      {Roles: allRoles},
			ActionCreate:    {Roles: writerAndAbove},
			ActionUpdate:    {Roles: writerAndAbove},
			ActionDelete:    {Roles: writerAndAbove},
			ActionPublish:   {Roles: writerAndAbove},
			ActionUnpublish: {Roles: writerAndAbove},
			ActionExport:    {Roles: allRoles},
			ActionImport:    {Roles: writerAndAbove},
		},
	},

	// ========== Asset ==========
	{
		Resource: ResourceAsset,
		Actions: map[Action]generator.ActionRule{
			ActionRead:   {Roles: allRoles},
			ActionList:   {Roles: allRoles},
			ActionCreate: {Roles: writerAndAbove},
			ActionUpdate: {Roles: writerAndAbove},
			ActionDelete: {Roles: writerAndAbove},
			ActionExport: {Roles: allRoles},
		},
	},

	// ========== Request ==========
	{
		Resource: ResourceRequest,
		Actions: map[Action]generator.ActionRule{
			ActionRead:    {Roles: allRoles},
			ActionList:    {Roles: allRoles},
			ActionCreate:  {Roles: writerAndAbove},
			ActionUpdate:  {Roles: writerAndAbove},
			ActionApprove: {Roles: maintainerAndAbove},
		},
	},

	// ========== Thread ==========
	{
		Resource: ResourceThread,
		Actions: map[Action]generator.ActionRule{
			ActionRead:    {Roles: allRoles},
			ActionCreate:  {Roles: writerAndAbove},
			ActionComment: {Roles: writerAndAbove},
		},
	},

	// ========== View ==========
	{
		Resource: ResourceView,
		Actions: map[Action]generator.ActionRule{
			ActionRead:   {Roles: allRoles},
			ActionList:   {Roles: allRoles},
			ActionCreate: {Roles: writerAndAbove},
			ActionUpdate: {Roles: writerAndAbove},
			ActionDelete: {Roles: writerAndAbove},
		},
	},

	// ========== WorkspaceSettings ==========
	{
		Resource: ResourceWorkspaceSettings,
		Actions: map[Action]generator.ActionRule{
			ActionRead:   {Roles: allRoles},
			ActionUpdate: {Roles: maintainerAndAbove},
			ActionDelete: {Roles: ownerOnly},
		},
	},
}
