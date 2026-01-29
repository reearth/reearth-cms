package e2e

import (
	"context"
	"errors"
	"net"
	"net/http"
	"testing"

	"github.com/gavv/httpexpect/v2"
	"github.com/reearth/reearth-cms/server/internal/app"
	"github.com/reearth/reearth-cms/server/internal/infrastructure/fs"
	"github.com/reearth/reearth-cms/server/internal/infrastructure/memory"
	"github.com/reearth/reearth-cms/server/internal/infrastructure/mongo"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearthx/account/accountinfrastructure/accountmemory"
	"github.com/reearth/reearthx/account/accountinfrastructure/accountmongo"
	"github.com/reearth/reearthx/account/accountusecase/accountgateway"
	"github.com/reearth/reearthx/account/accountusecase/accountrepo"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/mailer"
	"github.com/reearth/reearthx/mongox/mongotest"
	"github.com/samber/lo"
	"github.com/spf13/afero"
	"google.golang.org/grpc"
)

type Seeder func(context.Context, *repo.Container, *gateway.Container) error

func init() {
	mongotest.Env = "REEARTH_CMS_DB"
}

func startServer(t *testing.T, cfg *app.Config, repos *repo.Container, accountrepos *accountrepo.Container, gateway *gateway.Container, accountgateway *accountgateway.Container) *httpexpect.Expect {
	t.Helper()

	if testing.Short() {
		t.Skip("skipping test in short mode.")
	}

	ctx := context.Background()

	cfg.Server.Active = true
	srv := app.NewServer(ctx, &app.ApplicationContext{
		Config:     cfg,
		Repos:      repos,
		AcRepos:    accountrepos,
		Gateways:   gateway,
		AcGateways: accountgateway,
		Debug:      true,
	})

	l1, err := net.Listen("tcp", ":0")
	if err != nil {
		t.Fatalf("http server failed to listen: %v", err)
	}

	ch1 := make(chan error)
	go func() {
		if err := srv.HttpServe(l1); !errors.Is(err, http.ErrServerClosed) {
			ch1 <- err
		}
		close(ch1)
	}()

	t.Cleanup(func() {
		if err := srv.HttpShutdown(context.Background()); err != nil {
			t.Fatalf("server shutdown: %v", err)
		}

		if err := <-ch1; err != nil {
			t.Fatalf("http server serve: %v", err)
		}
	})

	if cfg.InternalApi.Active {
		l2, err := net.Listen("tcp", ":"+cfg.InternalApi.Port)
		if err != nil {
			t.Fatalf("grpc server failed to listen: %v", err)
		}

		ch2 := make(chan error)
		go func() {
			if err := srv.GrpcServe(l2); !errors.Is(err, grpc.ErrServerStopped) {
				ch2 <- err
			}
			close(ch2)
		}()

		t.Cleanup(func() {
			if err := srv.GrpcShutdown(context.Background()); err != nil {
				t.Fatalf("server shutdown: %v", err)
			}

			if err := <-ch2; err != nil {
				t.Fatalf("grpc server serve: %v", err)
			}
		})
	}

	return httpexpect.Default(t, "http://"+l1.Addr().String())
}

func StartServerWithRepos(t *testing.T, cfg *app.Config, useMongo bool, seeder Seeder) (*httpexpect.Expect, *repo.Container, *accountrepo.Container) {
	t.Helper()

	ctx := context.Background()

	var repos *repo.Container
	var accountRepos *accountrepo.Container
	if useMongo {
		db := mongotest.Connect(t)(t)
		log.Infof("test: new db created with name: %v", db.Name())
		accountRepos = lo.Must(accountmongo.New(ctx, db.Client(), db.Name(), false, false, nil))
		repos = lo.Must(mongo.NewWithDB(ctx, db, false, accountRepos))
	} else {
		repos = memory.New()
		accountRepos = accountmemory.New()
	}

	if cfg.AssetBaseURL == "" {
		cfg.AssetBaseURL = "https://example.com"
	}
	if cfg.Host == "" {
		cfg.Host = "https://example.com"
	}

	f := lo.Must(fs.NewFile(afero.NewMemMapFs(), cfg.AssetBaseURL, cfg.AssetUploadURLReplacement))
	if !cfg.Asset_Public {
		f = lo.Must(fs.NewFileWithACL(afero.NewMemMapFs(), cfg.AssetBaseURL, cfg.Host, cfg.AssetUploadURLReplacement))
	}
	gateway := &gateway.Container{
		File:      f,
		JobPubSub: memory.NewJobPubSub(),
	}
	accountGateways := &accountgateway.Container{
		Mailer: mailer.New(ctx, &mailer.Config{}),
	}

	if seeder != nil {
		if err := seeder(ctx, repos, gateway); err != nil {
			t.Fatalf("failed to seed the db: %s", err)
		}
	}

	return startServer(t, cfg, repos, accountRepos, gateway, accountGateways), repos, accountRepos
}

func StartServer(t *testing.T, cfg *app.Config, useMongo bool, seeder Seeder) *httpexpect.Expect {
	e, _, _ := StartServerWithRepos(t, cfg, useMongo, seeder)
	return e
}

// StartServerAndGetURL starts the server and returns both httpexpect and the server URL
func StartServerAndGetURL(t *testing.T, cfg *app.Config, useMongo bool, seeder Seeder) (*httpexpect.Expect, string) {
	t.Helper()

	ctx := context.Background()

	var repos *repo.Container
	var accountRepos *accountrepo.Container
	if useMongo {
		db := mongotest.Connect(t)(t)
		log.Infof("test: new db created with name: %v", db.Name())
		accountRepos = lo.Must(accountmongo.New(ctx, db.Client(), db.Name(), false, false, nil))
		repos = lo.Must(mongo.NewWithDB(ctx, db, false, accountRepos))
	} else {
		repos = memory.New()
		accountRepos = accountmemory.New()
	}

	if cfg.AssetBaseURL == "" {
		cfg.AssetBaseURL = "https://example.com"
	}
	if cfg.Host == "" {
		cfg.Host = "https://example.com"
	}

	f := lo.Must(fs.NewFile(afero.NewMemMapFs(), cfg.AssetBaseURL, cfg.AssetUploadURLReplacement))
	if !cfg.Asset_Public {
		f = lo.Must(fs.NewFileWithACL(afero.NewMemMapFs(), cfg.AssetBaseURL, cfg.Host, cfg.AssetUploadURLReplacement))
	}
	gw := &gateway.Container{
		File:      f,
		JobPubSub: memory.NewJobPubSub(),
	}
	accountGateways := &accountgateway.Container{
		Mailer: mailer.New(ctx, &mailer.Config{}),
	}

	if seeder != nil {
		if err := seeder(ctx, repos, gw); err != nil {
			t.Fatalf("failed to seed the db: %s", err)
		}
	}

	return startServerWithURL(t, cfg, repos, accountRepos, gw, accountGateways)
}

func startServerWithURL(t *testing.T, cfg *app.Config, repos *repo.Container, accountrepos *accountrepo.Container, gw *gateway.Container, accountgateway *accountgateway.Container) (*httpexpect.Expect, string) {
	t.Helper()

	if testing.Short() {
		t.Skip("skipping test in short mode.")
	}

	ctx := context.Background()

	cfg.Server.Active = true
	srv := app.NewServer(ctx, &app.ApplicationContext{
		Config:     cfg,
		Repos:      repos,
		AcRepos:    accountrepos,
		Gateways:   gw,
		AcGateways: accountgateway,
		Debug:      true,
	})

	l1, err := net.Listen("tcp", ":0")
	if err != nil {
		t.Fatalf("http server failed to listen: %v", err)
	}

	ch1 := make(chan error)
	go func() {
		if err := srv.HttpServe(l1); !errors.Is(err, http.ErrServerClosed) {
			ch1 <- err
		}
		close(ch1)
	}()

	t.Cleanup(func() {
		if err := srv.HttpShutdown(context.Background()); err != nil {
			t.Fatalf("server shutdown: %v", err)
		}

		if err := <-ch1; err != nil {
			t.Fatalf("http server serve: %v", err)
		}
	})

	serverURL := "http://" + l1.Addr().String()
	return httpexpect.Default(t, serverURL), serverURL
}

type GraphQLRequest struct {
	Query     string         `json:"query"`
	Variables map[string]any `json:"variables"`
}
