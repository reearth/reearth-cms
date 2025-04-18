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

	l, err := net.Listen("tcp", ":0")
	if err != nil {
		t.Fatalf("server failed to listen: %v", err)
	}

	srv := app.NewServer(ctx, &app.ServerConfig{
		Config:     cfg,
		Repos:      repos,
		AcRepos:    accountrepos,
		Gateways:   gateway,
		AcGateways: accountgateway,
		Debug:      true,
	})

	ch := make(chan error)
	go func() {
		if err := srv.Serve(l); !errors.Is(err, http.ErrServerClosed) {
			ch <- err
		}
		close(ch)
	}()

	t.Cleanup(func() {
		if err := srv.Shutdown(context.Background()); err != nil {
			t.Fatalf("server shutdown: %v", err)
		}

		if err := <-ch; err != nil {
			t.Fatalf("server serve: %v", err)
		}
	})

	return httpexpect.Default(t, "http://"+l.Addr().String())
}

func StartServerWithRepos(t *testing.T, cfg *app.Config, useMongo bool, seeder Seeder) (*httpexpect.Expect, *repo.Container, *accountrepo.Container) {
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

	assetBase := cfg.AssetBaseURL
	if assetBase == "" {
		assetBase = "https://example.com"
	}

	gateway := &gateway.Container{
		File: lo.Must(fs.NewFile(afero.NewMemMapFs(), assetBase)),
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

type GraphQLRequest struct {
	Query     string         `json:"query"`
	Variables map[string]any `json:"variables"`
}
