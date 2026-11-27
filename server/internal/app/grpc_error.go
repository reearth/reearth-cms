package app

import (
	"context"
	"errors"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearthx/rerror"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

// grpcErrorCodes maps the general errors shared across the codebase. An error
// specific to one RPC gets its code in that RPC's handler, and then passes
// through toGRPCError unchanged.
var grpcErrorCodes = []struct {
	err  error
	code codes.Code
}{
	{rerror.ErrNotFoundRaw, codes.NotFound},
	{rerror.ErrAlreadyExistsRaw, codes.AlreadyExists},
	{rerror.ErrInvalidParamsRaw, codes.InvalidArgument},
	{id.ErrInvalidID, codes.InvalidArgument},
	{rerror.ErrNotImplementedRaw, codes.Unimplemented},
	{rerror.ErrTooManyRequestsRaw, codes.ResourceExhausted},
}

// toGRPCError gives an error the gRPC code that matches it. Errors that already
// carry a gRPC status, and errors with no known code, are returned unchanged.
func toGRPCError(err error) error {
	if err == nil {
		return nil
	}
	if _, ok := status.FromError(err); ok {
		return err
	}
	if errors.Is(err, context.Canceled) || errors.Is(err, context.DeadlineExceeded) {
		return status.FromContextError(err).Err()
	}
	for _, c := range grpcErrorCodes {
		if errors.Is(err, c.err) {
			return status.Error(c.code, err.Error())
		}
	}
	return err
}

// unaryErrorInterceptor must be the outermost interceptor: it then also maps
// errors returned by the other interceptors, and the log interceptor inside it
// still records the original error rather than the mapped one.
func unaryErrorInterceptor() grpc.UnaryServerInterceptor {
	return func(ctx context.Context, req any, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (any, error) {
		resp, err := handler(ctx, req)
		return resp, toGRPCError(err)
	}
}
