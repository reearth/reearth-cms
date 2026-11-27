package app

import (
	"context"
	"errors"

	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/exporters"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearthx/rerror"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

// grpcPassthroughErrors are returned unchanged, so they keep crossing gRPC as
// codes.Unknown with their message. The Dashboard recognizes these by comparing
// code and message exactly; giving them a proper code here breaks that match.
// Move one into grpcErrorCodes only once the Dashboard handles it by code.
var grpcPassthroughErrors = []error{
	interfaces.ErrProjectAliasAlreadyUsed,
	project.ErrInvalidAlias,
	exporters.ErrNoGeometryField,
	interfaces.ErrOperationDenied,
	repo.ErrOperationDenied,
}

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
	{interfaces.ErrInvalidOperator, codes.Unauthenticated},
	{interfaces.ErrProjectCreationLimitExceeded, codes.FailedPrecondition},
	{interfaces.ErrProjectHasModels, codes.FailedPrecondition},
	{interfaces.ErrProjectHasGroups, codes.FailedPrecondition},
}

// toGRPCError gives a usecase or domain error the gRPC code that matches it.
// Errors that already carry a gRPC status, and errors with no known code, are
// returned unchanged.
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
	for _, e := range grpcPassthroughErrors {
		if errors.Is(err, e) {
			return err
		}
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
