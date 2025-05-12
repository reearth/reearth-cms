package app

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/reearth/reearth-cms/server/internal/adapter"
	"github.com/reearth/reearth-cms/server/internal/adapter/internalapi"
	pb "github.com/reearth/reearth-cms/server/internal/adapter/internalapi/schemas/internalapi/v1"
	"github.com/reearth/reearth-cms/server/internal/usecase/interactor"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/account/accountusecase/accountrepo"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/rerror"
	"golang.org/x/text/language"
	"google.golang.org/grpc"
	"google.golang.org/grpc/metadata"
)

func initGrpc(appCtx *ApplicationContext) *grpc.Server {
	if appCtx == nil || appCtx.Config == nil {
		log.Fatalf("AppContext.Config is nil")
	}

	ui := grpc.ChainUnaryInterceptor(
		unaryLogInterceptor(appCtx),
		unaryAuthInterceptor(appCtx),
		unaryAttachOperatorInterceptor(appCtx),
		unaryAttachUsecaseInterceptor(appCtx),
	)
	s := grpc.NewServer(ui)
	pb.RegisterReEarthCMSServer(s, internalapi.NewServer())

	return s
}

func unaryLogInterceptor(appCtx *ApplicationContext) grpc.UnaryServerInterceptor {
	return func(ctx context.Context, req any, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (any, error) {
		logger := log.GetLoggerFromContextOrDefault(ctx).WithCaller(false)

		method := info.FullMethod
		if idx := strings.LastIndex(info.FullMethod, "/"); idx != -1 {
			method = info.FullMethod[idx+1:]
		}

		logger.Infow(fmt.Sprintf("<-- RPC %s", method))
		startTime := time.Now()

		m, err := handler(ctx, req)

		duration := time.Since(startTime)
		if err != nil {
			logger.Errorw(fmt.Sprintf("--> RPC %s (%s), Error: %v", method, duration, err))
		} else {
			logger.Infow(fmt.Sprintf("--> RPC %s (%s)", method, duration))
		}

		return m, err
	}
}

func unaryAuthInterceptor(appCtx *ApplicationContext) grpc.UnaryServerInterceptor {
	return func(ctx context.Context, req any, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (any, error) {
		md, ok := metadata.FromIncomingContext(ctx)
		if !ok {
			log.Errorf("unaryAuthInterceptor: no metadata found")
			return nil, errors.New("unauthorized")
		}

		token := tokenFromGrpcMetadata(md)
		if token == "" {
			log.Errorf("unaryAuthInterceptor: no token found")
			return nil, errors.New("unauthorized")
		}

		if token != appCtx.Config.InternalApi.Token {
			log.Errorf("unaryAuthInterceptor: invalid token")
			return nil, errors.New("unauthorized")
		}

		return handler(ctx, req)
	}
}

func unaryAttachOperatorInterceptor(appCtx *ApplicationContext) grpc.UnaryServerInterceptor {
	return func(ctx context.Context, req any, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (any, error) {
		md, ok := metadata.FromIncomingContext(ctx)
		if !ok {
			log.Errorf("unaryAttachOperatorInterceptor: no metadata found")
			return nil, errors.New("unauthorized")
		}
		if len(md["user-id"]) < 1 {
			log.Errorf("unaryAttachOperatorInterceptor: no user id found")
			return nil, errors.New("unauthorized")
		}

		userID, err := accountdomain.UserIDFrom(md["user-id"][0])
		if err != nil {
			log.Errorf("unaryAttachOperatorInterceptor: invalid user id")
			return nil, errors.New("unauthorized")
		}
		u, err := appCtx.AcRepos.User.FindByID(ctx, userID)
		if err != nil {
			log.Errorf("unaryAttachOperatorInterceptor: %v", err)
			return nil, rerror.ErrInternalBy(err)
		}

		if u != nil {
			op, err := generateUserOperator(ctx, appCtx, u, language.English.String())
			if err != nil {
				return nil, err
			}
			ctx = adapter.AttachUser(ctx, u)
			ctx = adapter.AttachOperator(ctx, op)
		}

		return handler(ctx, req)
	}
}

func unaryAttachUsecaseInterceptor(appCtx *ApplicationContext) grpc.UnaryServerInterceptor {
	return func(ctx context.Context, req any, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (any, error) {
		if appCtx == nil || appCtx.Repos == nil || appCtx.AcRepos == nil || appCtx.Gateways == nil || appCtx.AcGateways == nil {
			return nil, errors.New("internal error")
		}
		var r2 *repo.Container
		var ar2 *accountrepo.Container
		if op := adapter.Operator(ctx); op != nil {
			// apply filters to repos
			r2 = appCtx.Repos.Filtered(repo.WorkspaceFilterFromOperator(op), repo.ProjectFilterFromOperator(op))
			ar2 = appCtx.AcRepos.Filtered(accountrepo.WorkspaceFilterFromOperator(op.AcOperator))

		} else {
			r2 = appCtx.Repos
			ar2 = appCtx.AcRepos
		}

		uc := interactor.New(r2, appCtx.Gateways, ar2, appCtx.AcGateways, interactor.ContainerConfig{})
		ctx = adapter.AttachUsecases(ctx, &uc)
		ctx = adapter.AttachGateways(ctx, appCtx.Gateways)

		return handler(ctx, req)
	}
}

func tokenFromGrpcMetadata(md metadata.MD) string {
	// The keys within metadata.MD are normalized to lowercase.
	// See: https://godoc.org/google.golang.org/grpc/metadata#New
	if len(md["authorization"]) < 1 {
		return ""
	}
	token := md["authorization"][0]
	if !strings.HasPrefix(token, "Bearer ") {
		return ""
	}
	token = strings.TrimPrefix(md["authorization"][0], "Bearer ")
	if token == "" {
		return ""
	}
	return token
}
