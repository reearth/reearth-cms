package app

import (
	"context"
	"errors"
	"fmt"
	"testing"

	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/exporters"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearthx/rerror"
	"github.com/stretchr/testify/assert"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

func TestToGRPCError(t *testing.T) {
	_, invalidIDErr := project.IDFrom("invalid")

	tests := []struct {
		name     string
		err      error
		wantCode codes.Code
		wantMsg  string
	}{
		{
			name:     "not found",
			err:      rerror.ErrNotFound,
			wantCode: codes.NotFound,
			wantMsg:  "not found",
		},
		{
			name:     "wrapped not found",
			err:      fmt.Errorf("find project: %w", rerror.ErrNotFound),
			wantCode: codes.NotFound,
			wantMsg:  "find project: not found",
		},
		{
			name:     "already exists",
			err:      rerror.ErrAlreadyExists,
			wantCode: codes.AlreadyExists,
			wantMsg:  "already exists",
		},
		{
			name:     "invalid params",
			err:      rerror.ErrInvalidParams,
			wantCode: codes.InvalidArgument,
			wantMsg:  "invalid params",
		},
		{
			name:     "invalid id",
			err:      invalidIDErr,
			wantCode: codes.InvalidArgument,
			wantMsg:  invalidIDErr.Error(),
		},
		{
			name:     "invalid operator",
			err:      interfaces.ErrInvalidOperator,
			wantCode: codes.Unauthenticated,
			wantMsg:  "invalid operator",
		},
		{
			name:     "project creation limit exceeded",
			err:      interfaces.ErrProjectCreationLimitExceeded,
			wantCode: codes.FailedPrecondition,
			wantMsg:  "project creation limit exceeded",
		},
		{
			name:     "project has models",
			err:      interfaces.ErrProjectHasModels,
			wantCode: codes.FailedPrecondition,
			wantMsg:  "can't delete a project as it still has models",
		},
		{
			name:     "project has groups",
			err:      interfaces.ErrProjectHasGroups,
			wantCode: codes.FailedPrecondition,
			wantMsg:  "can't delete a project as it still has groups",
		},
		{
			name:     "context canceled",
			err:      context.Canceled,
			wantCode: codes.Canceled,
			wantMsg:  context.Canceled.Error(),
		},
		{
			name:     "context deadline exceeded",
			err:      fmt.Errorf("query: %w", context.DeadlineExceeded),
			wantCode: codes.DeadlineExceeded,
			wantMsg:  "query: " + context.DeadlineExceeded.Error(),
		},
		{
			name:     "existing grpc status is kept",
			err:      status.Error(codes.PermissionDenied, "no permission"),
			wantCode: codes.PermissionDenied,
			wantMsg:  "no permission",
		},
		{
			name:     "unknown error is kept",
			err:      errors.New("boom"),
			wantCode: codes.Unknown,
			wantMsg:  "boom",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			st := status.Convert(toGRPCError(tt.err))
			assert.Equal(t, tt.wantCode, st.Code())
			assert.Equal(t, tt.wantMsg, st.Message())
		})
	}
}

// The Dashboard matches these errors by codes.Unknown plus their exact message.
func TestToGRPCError_Passthrough(t *testing.T) {
	tests := []struct {
		name string
		err  error
	}{
		{name: "project alias already used", err: interfaces.ErrProjectAliasAlreadyUsed},
		{name: "invalid alias", err: project.ErrInvalidAlias},
		{name: "no geometry field", err: exporters.ErrNoGeometryField},
		{name: "operation denied", err: interfaces.ErrOperationDenied},
		{name: "repo operation denied", err: repo.ErrOperationDenied},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			got := toGRPCError(tt.err)
			assert.Same(t, tt.err, got)
			st := status.Convert(got)
			assert.Equal(t, codes.Unknown, st.Code())
			assert.Equal(t, tt.err.Error(), st.Message())
		})
	}
}

func TestToGRPCError_Nil(t *testing.T) {
	assert.NoError(t, toGRPCError(nil))
}

func TestUnaryErrorInterceptor(t *testing.T) {
	interceptor := unaryErrorInterceptor()
	info := &grpc.UnaryServerInfo{FullMethod: "/test/Method"}

	resp, err := interceptor(t.Context(), nil, info, func(context.Context, any) (any, error) {
		return nil, rerror.ErrNotFound
	})
	assert.Nil(t, resp)
	assert.Equal(t, codes.NotFound, status.Code(err))

	resp, err = interceptor(t.Context(), nil, info, func(context.Context, any) (any, error) {
		return "ok", nil
	})
	assert.Equal(t, "ok", resp)
	assert.NoError(t, err)
}
