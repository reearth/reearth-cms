package app

import (
	"context"
	"errors"
	"net"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/labstack/echo/v5"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearthx/account/accountusecase/accountgateway"
	"github.com/reearth/reearthx/account/accountusecase/accountrepo"
	"github.com/reearth/reearthx/log"
	"google.golang.org/grpc"
)

func Start(debug bool, version string) {
	log.Infof("reearth-cms %s", version)

	ctx := context.Background()

	// Load config
	conf, cerr := ReadConfig(debug)
	if cerr != nil {
		log.Fatal(cerr)
	}
	log.Infof("config: %s", conf.Print())

	// Init telemetry
	defer initTelemetry(ctx, conf.Otel1())()

	// Init repositories
	repos, gateways, acRepos, acGateways := InitReposAndGateways(ctx, conf)

	// Create health checker instance
	healthChecker := NewHealthChecker(conf, version, gateways.File)

	// Run initial health check
	if conf.HealthCheck.RunOnInit {
		if err := healthChecker.Check(ctx); err != nil {
			log.Fatalf("initial health check failed: %v", err)
		}
	} else {
		log.Infof("health check: initial health check disabled")
	}

	// Start web server
	NewServer(ctx, &ApplicationContext{
		Config:        conf,
		Debug:         debug,
		Version:       version,
		Repos:         repos,
		Gateways:      gateways,
		AcRepos:       acRepos,
		AcGateways:    acGateways,
		HealthChecker: healthChecker,
	}).Run(ctx)
}

type WebServer struct {
	debug          bool
	appAddress     string
	appServer      *http.Server
	internalPort   string
	internalServer *grpc.Server
}

type ApplicationContext struct {
	Config        *Config
	Debug         bool
	Version       string
	Repos         *repo.Container
	Gateways      *gateway.Container
	AcRepos       *accountrepo.Container
	AcGateways    *accountgateway.Container
	HealthChecker *HealthChecker
}

func NewServer(_ context.Context, appCtx *ApplicationContext) *WebServer {
	w := &WebServer{
		debug: appCtx.Debug,
	}
	if appCtx.Config.Server.Active {
		port := appCtx.Config.Port
		if port == "" {
			port = "8080"
		}

		host := appCtx.Config.ServerHost
		if host == "" {
			if appCtx.Debug {
				host = "localhost"
			} else {
				host = "0.0.0.0"
			}
		}
		address := host + ":" + port

		w.appAddress = address
		w.appServer = &http.Server{
			Handler: initEcho(appCtx),
		}
	}

	if appCtx.Config.InternalApi.Active {
		w.internalPort = ":" + appCtx.Config.InternalApi.Port
		w.internalServer = initGrpc(appCtx)
	}
	return w
}

func (w *WebServer) Run(ctx context.Context) {
	debugLog := ""
	if w.debug {
		debugLog += " with debug mode"
	}

	if w.appServer != nil {
		go func() {
			ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
			defer stop()

			sc := echo.StartConfig{
				Address:         w.appAddress,
				GracefulTimeout: 10 * time.Second,
				HideBanner:      true,
				HidePort:        true,
				BeforeServeFunc: func(s *http.Server) error {
					protocols := new(http.Protocols)
					protocols.SetHTTP1(true)
					protocols.SetUnencryptedHTTP2(true)
					s.Protocols = protocols
					return nil
				},
			}
			if err := sc.Start(ctx, w.appServer.Handler); err != nil &&
				!errors.Is(err, context.Canceled) &&
				!errors.Is(err, http.ErrServerClosed) {
				log.Fatalc(ctx, err.Error())
			}
		}()
		log.Infof("server: started%s at http://%s", debugLog, w.appAddress)
		defer log.Infof("server: http server shutdown")
	} else {
		log.Info("server: http server is not configured")
	}

	if w.internalServer != nil {
		go func() {
			l, err := net.Listen("tcp", w.internalPort)
			if err != nil {
				log.Fatalc(ctx, err.Error())
			}
			err = w.internalServer.Serve(l)
			log.Fatalc(ctx, err.Error())
		}()
		log.Infof("server: started%s internal grpc server at %s", debugLog, w.internalPort)
		defer log.Infof("server: grpc server shutdown")
	} else {
		log.Info("server: grpc server is not configured")
	}

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt, syscall.SIGTERM)
	<-quit
}

func (w *WebServer) HttpServe(l net.Listener) error {
	return w.appServer.Serve(l)
}

func (w *WebServer) GrpcServe(l net.Listener) error {
	return w.internalServer.Serve(l)
}

func (w *WebServer) HttpShutdown(ctx context.Context) error {
	if w.appServer != nil {
		return w.appServer.Shutdown(ctx)
	}
	return nil
}

func (w *WebServer) GrpcShutdown(_ context.Context) error {
	if w.internalServer != nil {
		w.internalServer.GracefulStop()
	}
	return nil
}
