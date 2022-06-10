package app

import (
	"context"
	"time"

	"github.com/reearth/reearth-cms/server/internal/infrastructure/auth0"

	"github.com/reearth/reearth-cms/server/internal/infrastructure/mailer"
	"github.com/reearth/reearth-cms/server/pkg/log"

	mongorepo "github.com/reearth/reearth-cms/server/internal/infrastructure/mongo"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.opentelemetry.io/contrib/instrumentation/go.mongodb.org/mongo-driver/mongo/otelmongo"
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
	// mailer
	gateways.Mailer = initMailer(conf)

	return repos, gateways
}

func initMailer(conf *Config) gateway.Mailer {
	if conf.Mailer == "sendgrid" {
		log.Infoln("mailer: sendgrid is used")
		return mailer.NewSendGrid(conf.SendGrid.Name, conf.SendGrid.Email, conf.SendGrid.API)
	}
	if conf.Mailer == "smtp" {
		log.Infoln("mailer: smtp is used")
		return mailer.NewSMTP(conf.SMTP.Host, conf.SMTP.Port, conf.SMTP.SMTPUsername, conf.SMTP.Email, conf.SMTP.Password)
	}
	log.Infoln("mailer: logger is used")
	return mailer.NewLogger()
}
