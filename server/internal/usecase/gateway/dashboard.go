package gateway

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/infrastructure/dashboard"
)

type Dashboard interface {
	CheckPlanConstraints(ctx context.Context, workspaceID string, req dashboard.CheckPlanConstraintsRequest) (*dashboard.CheckPlanConstraintsResponse, error)
}