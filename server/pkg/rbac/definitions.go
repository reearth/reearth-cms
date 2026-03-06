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

// Common Actions
const (
	ActionCreate    = "create"
	ActionRead      = "read"
	ActionUpdate    = "update"
	ActionDelete    = "delete"
	ActionList      = "list"
	ActionSearch    = "search"
	ActionExport    = "export"
	ActionImport    = "import"
	ActionPublish   = "publish"
	ActionUnpublish = "unpublish"
	ActionCopy      = "copy"
	ActionApprove   = "approve"
	ActionComment   = "comment"
)

// Project Actions
const (
	ActionCheckAlias       = "check_alias"
	ActionCheckLimits      = "check_limits"
	ActionStar             = "star"
	ActionCreateAPIKey     = "create_api_key"
	ActionUpdateAPIKey     = "update_api_key"
	ActionDeleteAPIKey     = "delete_api_key"
	ActionRegenerateAPIKey = "regenerate_api_key"
)

// Model Actions
const (
	ActionCheckKey           = "check_key"
	ActionFindByKey          = "find_by_key"
	ActionFindBySchema       = "find_by_schema"
	ActionFindOrCreateSchema = "find_or_create_schema"
	ActionUpdateOrder        = "update_order"
)

// Schema Actions
const (
	ActionFindByGroup         = "find_by_group"
	ActionCreateField         = "create_field"
	ActionCreateFields        = "create_fields"
	ActionUpdateField         = "update_field"
	ActionUpdateFields        = "update_fields"
	ActionDeleteField         = "delete_field"
	ActionGuessFieldsByAsset  = "guess_fields_by_asset"
	ActionGetSchemasAndGroups = "get_schemas_and_groups"
)

// Item Actions
const (
	ActionReadPublic       = "read_public"
	ActionListPublic       = "list_public"
	ActionBatchDelete      = "batch_delete"
	ActionImportAsync      = "import_async"
	ActionTriggerImportJob = "trigger_import_job"
	ActionItemStatus       = "item_status"
	ActionLastModified     = "last_modified"
	ActionFindByAssets     = "find_by_assets"
	ActionFindVersion      = "find_version"
	ActionFindAllVersions  = "find_all_versions"
	ActionIsReferenced     = "is_referenced"
)

// Asset Actions
const (
	ActionDownload           = "download"
	ActionFindFile           = "find_file"
	ActionCreateUpload       = "create_upload"
	ActionUpdateFiles        = "update_files"
	ActionDecompress         = "decompress"
	ActionRetryDecompression = "retry_decompression"
)

// Integration Actions
const (
	ActionDeleteMany      = "delete_many"
	ActionRegenerateToken = "regenerate_token"
	ActionCreateWebhook   = "create_webhook"
	ActionUpdateWebhook   = "update_webhook"
	ActionDeleteWebhook   = "delete_webhook"
)

// Request Actions
const (
	ActionCloseAll   = "close_all"
	ActionFindByItem = "find_by_item"
)

// Thread Actions
const (
	ActionAddComment    = "add_comment"
	ActionUpdateComment = "update_comment"
	ActionDeleteComment = "delete_comment"
)

// User/Workspace Actions (from dashboard)
const (
	ActionEdit              = "edit"
	ActionValidate          = "validate"
	ActionAddMember         = "add_member"
	ActionEditMember        = "edit_member"
	ActionDeleteMember      = "delete_member"
	ActionReadMember        = "read_member"
	ActionEditAlias         = "edit_alias"
	ActionTransferOwnership = "transfer_ownership"
	ActionCheckConstraint   = "check_constraint"
	ActionSubscribePlan     = "subscribe_plan"
	ActionReadSubscription  = "read_subscription"
	ActionEditSubscription  = "edit_subscription"
	ActionProjectList       = "project_list"
)

// Roles
const (
	roleReader     = "reader"
	roleWriter     = "writer"
	roleMaintainer = "maintainer"
	roleOwner      = "owner"
	roleSelf       = "self"
)

// ResourceRules defines all RBAC rules for CMS resources
var ResourceRules = []generator.ResourceRule{
	// ========== User ==========
	{
		Resource: ResourceUser,
		Actions: map[string]generator.ActionRule{
			ActionDelete: {
				Roles: []string{roleSelf},
				Condition: &generator.Condition{
					Match: generator.Match{
						Expr: lo.ToPtr("has(request.auxData.jwt)"),
					},
				},
			},
			ActionEdit: {
				Roles: []string{roleSelf},
				Condition: &generator.Condition{
					Match: generator.Match{
						Expr: lo.ToPtr("has(request.auxData.jwt)"),
					},
				},
			},
			ActionRead: {
				Roles: []string{roleSelf},
				Condition: &generator.Condition{
					Match: generator.Match{
						Expr: lo.ToPtr("has(request.auxData.jwt)"),
					},
				},
			},
			ActionSearch:   {Roles: []string{roleReader, roleWriter, roleMaintainer, roleOwner}},
			ActionValidate: {Roles: []string{roleReader, roleWriter, roleMaintainer, roleOwner}},
		},
	},

	// ========== Workspace ==========
	{
		Resource: ResourceWorkspace,
		Actions: map[string]generator.ActionRule{
			ActionCreate: {
				Roles: []string{roleSelf},
				Condition: &generator.Condition{
					Match: generator.Match{
						Expr: lo.ToPtr("has(request.auxData.jwt)"),
					},
				},
			},
			ActionDelete:            {Roles: []string{roleOwner}},
			ActionEdit:              {Roles: []string{roleMaintainer, roleOwner}},
			ActionEditAlias:         {Roles: []string{roleOwner}},
			ActionList:              {Roles: []string{roleSelf, roleReader, roleWriter, roleMaintainer, roleOwner}},
			ActionRead:              {Roles: []string{roleReader, roleWriter, roleMaintainer, roleOwner}},
			ActionTransferOwnership: {Roles: []string{roleOwner}},
			ActionValidate:          {Roles: []string{roleReader, roleWriter, roleMaintainer, roleOwner}},

			// Members
			ActionAddMember:    {Roles: []string{roleMaintainer, roleOwner}},
			ActionEditMember:   {Roles: []string{roleMaintainer, roleOwner}},
			ActionDeleteMember: {Roles: []string{roleMaintainer, roleOwner}},
			ActionReadMember:   {Roles: []string{roleReader, roleWriter, roleMaintainer, roleOwner}},

			// Subscription
			ActionCheckConstraint:  {Roles: []string{roleOwner}},
			ActionSubscribePlan:    {Roles: []string{roleOwner}},
			ActionReadSubscription: {Roles: []string{roleReader, roleWriter, roleMaintainer, roleOwner}},
			ActionEditSubscription: {Roles: []string{roleOwner}},

			// Projects
			ActionProjectList: {Roles: []string{roleReader, roleWriter, roleMaintainer, roleOwner}},
		},
	},

	// ========== Project ==========
	{
		Resource: ResourceProject,
		Actions: map[string]generator.ActionRule{
			ActionRead:             {Roles: []string{roleReader, roleWriter, roleMaintainer, roleOwner}},
			ActionList:             {Roles: []string{roleReader, roleWriter, roleMaintainer, roleOwner}},
			ActionSearch:           {Roles: []string{roleReader, roleWriter, roleMaintainer, roleOwner}},
			ActionCreate:           {Roles: []string{roleOwner}},
			ActionUpdate:           {Roles: []string{roleMaintainer, roleOwner}},
			ActionDelete:           {Roles: []string{roleOwner}},
			ActionCheckAlias:       {Roles: []string{roleReader, roleWriter, roleMaintainer, roleOwner}},
			ActionCheckLimits:      {Roles: []string{roleReader, roleWriter, roleMaintainer, roleOwner}},
			ActionStar:             {Roles: []string{roleReader, roleWriter, roleMaintainer, roleOwner}},
			ActionCreateAPIKey:     {Roles: []string{roleMaintainer, roleOwner}},
			ActionUpdateAPIKey:     {Roles: []string{roleMaintainer, roleOwner}},
			ActionDeleteAPIKey:     {Roles: []string{roleMaintainer, roleOwner}},
			ActionRegenerateAPIKey: {Roles: []string{roleMaintainer, roleOwner}},
		},
	},

	// ========== Model ==========
	{
		Resource: ResourceModel,
		Actions: map[string]generator.ActionRule{
			ActionRead:               {Roles: []string{roleReader, roleWriter, roleMaintainer, roleOwner}},
			ActionList:               {Roles: []string{roleReader, roleWriter, roleMaintainer, roleOwner}},
			ActionSearch:             {Roles: []string{roleReader, roleWriter, roleMaintainer, roleOwner}},
			ActionCreate:             {Roles: []string{roleWriter, roleMaintainer, roleOwner}},
			ActionUpdate:             {Roles: []string{roleWriter, roleMaintainer, roleOwner}},
			ActionDelete:             {Roles: []string{roleWriter, roleMaintainer, roleOwner}},
			ActionCopy:               {Roles: []string{roleWriter, roleMaintainer, roleOwner}},
			ActionCheckKey:           {Roles: []string{roleReader, roleWriter, roleMaintainer, roleOwner}},
			ActionFindByKey:          {Roles: []string{roleReader, roleWriter, roleMaintainer, roleOwner}},
			ActionFindBySchema:       {Roles: []string{roleReader, roleWriter, roleMaintainer, roleOwner}},
			ActionFindOrCreateSchema: {Roles: []string{roleWriter, roleMaintainer, roleOwner}},
			ActionUpdateOrder:        {Roles: []string{roleWriter, roleMaintainer, roleOwner}},
		},
	},
}
