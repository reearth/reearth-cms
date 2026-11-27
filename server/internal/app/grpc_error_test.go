package app

import (
	"context"
	"errors"
	"fmt"
	"testing"

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
