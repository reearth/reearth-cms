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

func initGrpc(cfg *ServerConfig) *grpc.Server {
	if cfg.Config == nil {
		log.Fatalf("ServerConfig.Config is nil")
	}

	ui := grpc.ChainUnaryInterceptor(
		unaryLogInterceptor(cfg),
		unaryAuthInterceptor(cfg),
		unaryAttachOperatorInterceptor(cfg),
		unaryAttachUsecaseInterceptor(cfg),
	)
	s := grpc.NewServer(ui)
	pb.RegisterReEarthCMSServer(s, internalapi.NewServer())

	return s
}

func unaryLogInterceptor(cfg *ServerConfig) grpc.UnaryServerInterceptor {
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

func unaryAuthInterceptor(cfg *ServerConfig) grpc.UnaryServerInterceptor {
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

		if token != cfg.Config.InternalApi.Token {
			log.Errorf("unaryAuthInterceptor: invalid token")
			return nil, errors.New("unauthorized")
		}

		return handler(ctx, req)
	}
}

func unaryAttachOperatorInterceptor(cfg *ServerConfig) grpc.UnaryServerInterceptor {
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
		u, err := cfg.AcRepos.User.FindByID(ctx, userID)
		if err != nil {
			log.Errorf("unaryAttachOperatorInterceptor: %v", err)
			return nil, rerror.ErrInternalBy(err)
		}

		if u != nil {
			op, err := generateUserOperator(ctx, cfg, u, language.English.String())
			if err != nil {
				return nil, err
			}
			ctx = adapter.AttachUser(ctx, u)
			ctx = adapter.AttachOperator(ctx, op)
		}

		return handler(ctx, req)
	}
}

func unaryAttachUsecaseInterceptor(cfg *ServerConfig) grpc.UnaryServerInterceptor {
	return func(ctx context.Context, req any, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (any, error) {
		if cfg == nil || cfg.Repos == nil || cfg.AcRepos == nil || cfg.Gateways == nil || cfg.AcGateways == nil {
			return nil, errors.New("internal error")
		}
		var r2 *repo.Container
		var ar2 *accountrepo.Container
		if op := adapter.Operator(ctx); op != nil {
			// apply filters to repos
			r2 = cfg.Repos.Filtered(repo.WorkspaceFilterFromOperator(op), repo.ProjectFilterFromOperator(op))
			ar2 = cfg.AcRepos.Filtered(accountrepo.WorkspaceFilterFromOperator(op.AcOperator))

		} else {
			r2 = cfg.Repos
			ar2 = cfg.AcRepos
		}

		uc := interactor.New(r2, cfg.Gateways, ar2, cfg.AcGateways, interactor.ContainerConfig{})
		ctx = adapter.AttachUsecases(ctx, &uc)
		ctx = adapter.AttachGateways(ctx, cfg.Gateways)

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
