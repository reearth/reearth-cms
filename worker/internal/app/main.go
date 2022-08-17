package app

import (
	"context"
	"os"
	"os/signal"

	"github.com/labstack/echo/v4"

	rhttp "github.com/reearth/reearth-cms/worker/internal/adapter/http"
	"github.com/reearth/reearth-cms/worker/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/worker/internal/usecase/interactor"
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
	gateways := initReposAndGateways(ctx, conf, debug)
	uc := interactor.NewUsecase(gateways)
	ctrl := rhttp.NewController(uc)
	handler := NewHandler(ctrl)

	// Start web server
	NewServer(ctx, &ServerConfig{
		Config:   conf,
		Debug:    debug,
		Gateways: gateways,
	}, handler).Run()
}

type WebServer struct {
	address   string
	appServer *echo.Echo
}

type ServerConfig struct {
	Config   *Config
	Debug    bool
	Gateways *gateway.Container
}

func NewServer(ctx context.Context, cfg *ServerConfig, handler *Handler) *WebServer {
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
		address: address,
	}

	w.appServer = initEcho(ctx, cfg, handler)
	return w
}

func (w *WebServer) Run() {
	defer log.Infoln("Server shutdown")

	debugLog := ""
	if w.appServer.Debug {
		debugLog += " with debug mode"
	}
	log.Infof("server started%s at http://%s\n", debugLog, w.address)

	go func() {
		err := w.appServer.Start(w.address)
		log.Fatalln(err.Error())
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt)
	<-quit
}
