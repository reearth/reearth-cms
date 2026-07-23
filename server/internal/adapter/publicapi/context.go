package publicapi

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/adapter"
	"github.com/reearth/reearth-cms/server/internal/usecase"
)

func getOperator(ctx context.Context) *usecase.Operator {
	return adapter.Operator(ctx)
}
