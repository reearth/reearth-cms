package e2e

import (
	"context"
	"net"
	"net/http"
	"testing"

	"github.com/gavv/httpexpect/v2"
	"github.com/reearth/reearth-cms/server/internal/app"
	"github.com/reearth/reearth-cms/server/internal/infrastructure/memory"
	"github.com/reearth/reearth-cms/server/internal/infrastructure/mongo"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearthx/mongox/mongotest"
	"github.com/samber/lo"
)

type Seeder func(ctx context.Context, r *repo.Container) error

func init() {
	mongotest.Env = "REEARTH_CMS_DB"
}

func StartServer(t *testing.T, cfg *app.Config, useMongo bool, seeder Seeder) *httpexpect.Expect {
	t.Helper()

	if testing.Short() {
		t.SkipNow()
	}

	ctx := context.Background()

	l, err := net.Listen("tcp", ":0")
	if err != nil {
		t.Fatalf("server failed to listen: %v", err)
	}

	var repos *repo.Container
	if useMongo {
		db := mongotest.Connect(t)(t)
		repos = lo.Must(mongo.New(ctx, db.Client(), db.Name()))
	} else {
		repos = memory.New()
	}

	if seeder != nil {
		if err := seeder(ctx, repos); err != nil {
			t.Fatalf("seed: faild to seed the db")
		}
	}

	srv := app.NewServer(ctx, &app.ServerConfig{
		Config:   cfg,
		Repos:    repos,
		Gateways: &gateway.Container{},
	})

	ch := make(chan error)
	go func() {
		if err := srv.Serve(l); err != http.ErrServerClosed {
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

	return httpexpect.New(t, "http://"+l.Addr().String())
}
