package integrationapi

import (
	"github.com/reearth/reearth-cms/server/pkg/group"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/model"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearthx/account/accountdomain"
)

// Targets of the string formats mapped in `output-options.type-mapping` of the
// integration API codegen configs (types.cfg.yml and
// internal/adapter/integration/server.cfg.yml). Keep the three in sync.
type (
	WorkspaceID        = accountdomain.WorkspaceID        // format: workspace-id
	WorkspaceIDOrAlias = accountdomain.WorkspaceIDOrAlias // format: workspace-id-or-alias
	ProjectID          = id.ProjectID                     // format: project-id
	ProjectIDOrAlias   = project.IDOrAlias                // format: project-id-or-alias
	ModelID            = id.ModelID                       // format: model-id
	ModelIDOrKey       = model.IDOrKey                    // format: model-id-or-key
	SchemaID           = id.SchemaID                      // format: schema-id
	FieldID            = id.FieldID                       // format: field-id
	FieldIDOrKey       = schema.FieldIDOrKey              // format: field-id-or-key
	GroupID            = id.GroupID                       // format: group-id
	GroupIDOrKey       = group.IDOrKey                    // format: group-id-or-key
	ItemID             = id.ItemID                        // format: item-id
	ItemGroupID        = id.ItemGroupID                   // format: item-group-id
	AssetID            = id.AssetID                       // format: asset-id
	CommentID          = id.CommentID                     // format: comment-id
	TagID              = id.TagID                         // format: tag-id
	APIKeyID           = id.APIKeyID                      // format: api-key-id
)
