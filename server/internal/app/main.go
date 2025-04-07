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

	// Start web server
	NewServer(ctx, &ServerConfig{
		Config:     conf,
		Debug:      debug,
		Repos:      repos,
		Gateways:   gateways,
		AcRepos:    acRepos,
		AcGateways: acGateways,
	}).Run(ctx)
}

type WebServer struct {
	appAddress     string
	appServer      *echo.Echo
	internalPort   string
	internalServer *grpc.Server
}

type ServerConfig struct {
	Config     *Config
	Debug      bool
	Repos      *repo.Container
	Gateways   *gateway.Container
	AcRepos    *accountrepo.Container
	AcGateways *accountgateway.Container
}

func NewServer(ctx context.Context, cfg *ServerConfig) *WebServer {
	port := cfg.Config.Port
	if port == "" {
		port = "8080"
	}

	host := cfg.Config.ServerHost
	if host == "" {
		if cfg.Debug {
			host = "localhost"
		} else {
			host = "0.0.0.0"
		}
	}
	address := host + ":" + port

	w := &WebServer{
		appAddress: address,
	}
	w.appServer = initEcho(cfg)

	if cfg.Config.InternalApi.Active {
		w.internalPort = ":" + cfg.Config.InternalApi.Port
		w.internalServer = initGrpc(cfg)
	}
	return w
}

func (w *WebServer) Run(ctx context.Context) {
	defer log.Infof("server: shutdown")

	debugLog := ""
	if w.appServer.Debug {
		debugLog += " with debug mode"
	}

	go func() {
		err := w.appServer.StartH2CServer(w.appAddress, &http2.Server{})
		log.Fatalc(ctx, err.Error())
	}()
	log.Infof("server: started%s at http://%s", debugLog, w.appAddress)

	if w.internalServer != nil {
		go func() {
			l, err := net.Listen("tcp", w.internalPort)
			if err != nil {
				log.Fatalc(ctx, err.Error())
			}
			err = w.internalServer.Serve(l)
			log.Fatalc(ctx, err.Error())
		}()
		log.Infof("server: started internal grpc server at %s", w.internalPort)
	}

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt)
	<-quit
}

func (w *WebServer) Serve(l net.Listener) error {
	return w.appServer.Server.Serve(l)
}

func (w *WebServer) Shutdown(ctx context.Context) error {
	return w.appServer.Shutdown(ctx)
}
