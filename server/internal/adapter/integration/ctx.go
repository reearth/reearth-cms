package integration

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/usecase"
)

type ContextKey string

const (
	contextOperator ContextKey = "operator"
)

func AttachOperator(ctx context.Context, o *usecase.Operator) context.Context {
	return context.WithValue(ctx, contextOperator, o)
}

func GetOperator(ctx context.Context) *usecase.Operator {
	if v := ctx.Value(contextOperator); v != nil {
		if v2, ok := v.(*usecase.Operator); ok {
			return v2
		}
	}
	return nil
}
