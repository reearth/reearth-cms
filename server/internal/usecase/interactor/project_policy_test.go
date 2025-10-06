package interactor

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
)

// trackingPolicyChecker is a mock that tracks which check type was used
type trackingPolicyChecker struct {
	allowed        bool
	message        string
	trackCheckType *gateway.PolicyCheckType
}

func (t *trackingPolicyChecker) CheckPolicy(ctx context.Context, req gateway.PolicyCheckRequest) (*gateway.PolicyCheckResponse, error) {
	if t.trackCheckType != nil {
		*t.trackCheckType = req.CheckType
	}
	return &gateway.PolicyCheckResponse{
		Allowed:      t.allowed,
		CheckType:    req.CheckType,
		CurrentLimit: "test limit",
		Message:      t.message,
		Value:        req.Value,
	}, nil
}
