package app

import (
	"context"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/labstack/echo/v5"
	rhttp "github.com/reearth/reearth-cms/worker/internal/adapter/http"
	rmongo "github.com/reearth/reearth-cms/worker/internal/infrastructure/mongo"
	"github.com/reearth/reearth-cms/worker/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/worker/internal/usecase/interactor"
	"github.com/reearth/reearth-cms/worker/internal/usecase/repo"
	"github.com/reearth/reearthx/log"
	"github.com/samber/lo"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.opentelemetry.io/contrib/instrumentation/go.mongodb.org/mongo-driver/mongo/otelmongo"
	"golang.org/x/net/http2"
	"golang.org/x/net/http2/h2c"
)

func Start(debug bool, version string) {
	log.Infof("reearth-cms/worker %s", version)

	ctx := context.Background()

	// Load config
	conf, cerr := ReadConfig(debug)
	if cerr != nil {
		log.Fatal(cerr)
	}

	// mongo
	client, err := mongo.Connect(
		ctx,
		options.Client().
			ApplyURI(conf.DB).
			SetConnectTimeout(time.Second*10).
			SetMonitor(otelmongo.NewMonitor()),
	)
	if err != nil {
		log.Fatalf("repo initialization error: %+v\n", err)
	}
	mongoWebhook := rmongo.NewWebhook(client.Database("reearth_cms"))
	lo.Must0(mongoWebhook.InitIndex(ctx))
	repos, err := rmongo.New(ctx, mongoWebhook, nil)
	if err != nil {
		log.Fatalf("repo initialization error: %+v\n", err)
	}

	// gateways
	gateways := initReposAndGateways(ctx, conf, debug)

	// usecase
	uc := interactor.NewUsecase(gateways, repos)
	ctrl := rhttp.NewController(uc)
	handler := NewHandler(ctrl)

	// start web server
	NewServer(ctx, &ServerConfig{
		Config:   conf,
		Debug:    debug,
		Gateways: gateways,
		Repos:    repos,
		Version:  version,
	}, handler).Run(ctx)
}

type WebServer struct {
	debug     bool
	address   string
	appServer *echo.Echo
}

type ServerConfig struct {
	Config   *Config
	Debug    bool
	Gateways *gateway.Container
	Repos    *repo.Container
	Version  string
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

	return &WebServer{
		address:   address,
		appServer: initEcho(ctx, cfg, handler),
	}
}

func (w *WebServer) Run(ctx context.Context) {
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	sc := echo.StartConfig{
		Address:         w.address,
		GracefulTimeout: 10 * time.Second,
		HideBanner:      true,
		HidePort:        true,
	}

	log.Infof("server started at http://%s\n", w.address)
	defer log.Infoc(ctx, "shutting down server...")

	if err := sc.Start(ctx, h2c.NewHandler(w.appServer, &http2.Server{})); err != nil {
		log.Errorc(ctx, err.Error())
	}
}
