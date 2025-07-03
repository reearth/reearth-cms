package gateway

import (
	"context"

	"github.com/reearth/reearth-cms/server/pkg/workspaceplan"
	"github.com/reearth/reearthx/account/accountdomain"
)

type Dashboard interface {
	GetWorkspacePlan(ctx context.Context, workspaceID accountdomain.WorkspaceID) (*workspaceplan.Plan, error)
}
