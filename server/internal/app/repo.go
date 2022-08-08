package app

import (
	"context"
	"time"

	mongorepo "github.com/reearth/reearth-cms/server/internal/infrastructure/mongo"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.opentelemetry.io/contrib/instrumentation/go.mongodb.org/mongo-driver/mongo/otelmongo"

	"github.com/reearth/reearth-cms/server/internal/infrastructure/auth0"
	"github.com/reearth/reearthx/log"
)

func initReposAndGateways(ctx context.Context, conf *Config) (*repo.Container, *gateway.Container) {
	repos := &repo.Container{}
	gateways := &gateway.Container{}

	// Mongo
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
	if err := mongorepo.InitRepos(ctx, repos, client, ""); err != nil {
		log.Fatalf("Failed to init mongo: %+v\n", err)
	}
	// Auth0
	gateways.Authenticator = auth0.New(conf.Auth0.Domain, conf.Auth0.ClientID, conf.Auth0.ClientSecret)

	return repos, gateways
}
