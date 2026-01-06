package app

import (
	"context"
	"net"
	"os"
	"os/signal"

	"github.com/labstack/echo/v4"
	"golang.org/x/net/http2"
	"google.golang.org/grpc"

	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearthx/account/accountusecase/accountgateway"
	"github.com/reearth/reearthx/account/accountusecase/accountrepo"
	"github.com/reearth/reearthx/log"
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

	// Init repositories
	repos, gateways, acRepos, acGateways := InitReposAndGateways(ctx, conf)

	// Create health checker instance
	healthChecker := NewHealthChecker(conf, version, gateways.File)

	// Run initial health check if enabled
	if conf.HealthCheck.RunOnInit {
		if err := healthChecker.Check(ctx); err != nil {
			log.Fatalf("health check: initial health check failed: %v", err)
		}
	} else {
		log.Infof("health check: initial health check disabled")
	}

	// Create application context
	appCtx := &ApplicationContext{
		Config:        conf,
		Debug:         debug,
		Version:       version,
		Repos:         repos,
		Gateways:      gateways,
		AcRepos:       acRepos,
		AcGateways:    acGateways,
		HealthChecker: healthChecker,
	}

	// Start web server
	NewServer(ctx, appCtx).Run(ctx)
}

type WebServer struct {
	debug          bool
	appAddress     string
	appServer      *echo.Echo
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

func NewServer(ctx context.Context, appCtx *ApplicationContext) *WebServer {
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
		w.appServer = initEcho(appCtx)
	}

	if appCtx.Config.InternalApi.Active {
		w.internalPort = ":" + appCtx.Config.InternalApi.Port
		w.internalServer = initGrpc(appCtx)
	}
	return w
}

func (w *WebServer) Run(ctx context.Context) {
	defer log.Infof("server: shutdown")

	debugLog := ""
	if w.debug {
		debugLog += " with debug mode"
	}

	if w.appServer != nil {
		go func() {
			err := w.appServer.StartH2CServer(w.appAddress, &http2.Server{})
			log.Fatalc(ctx, err.Error())
		}()
		log.Infof("server: started%s at http://%s", debugLog, w.appAddress)
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
	} else {
		log.Info("server: grpc server is not configured")
	}

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt)
	<-quit
}

func (w *WebServer) HttpServe(l net.Listener) error {
	return w.appServer.Server.Serve(l)
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

func (w *WebServer) GrpcShutdown(ctx context.Context) error {
	if w.internalServer != nil {
		w.internalServer.GracefulStop()
	}
	return nil
}
