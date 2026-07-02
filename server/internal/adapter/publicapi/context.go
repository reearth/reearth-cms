package publicapi

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/adapter"
	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearthx/account/accountusecase"
)

// getOperator retrieves the operator set by middleware. It returns an empty
// anonymous Operator if the middleware has not run (e.g. in tests), so callers
// never receive a nil pointer.
func getOperator(ctx context.Context) *usecase.Operator {
	if op := adapter.Operator(ctx); op != nil {
		return op
	}
	return &usecase.Operator{Anonymous: true, AcOperator: &accountusecase.Operator{}}
}
