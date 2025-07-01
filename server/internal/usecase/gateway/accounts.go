package gateway

import (
	"context"

	"github.com/reearth/reearth-cms/server/pkg/workspaceplan"
)

type Dashboard interface {
	GetWorkspacePlan(ctx context.Context, workspaceID string) (*workspaceplan.Plan, error)
}
