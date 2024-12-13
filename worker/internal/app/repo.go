package app

import (
	"context"
	"time"

	"github.com/reearth/reearth-cms/worker/internal/infrastructure/aws"
	"github.com/reearth/reearth-cms/worker/internal/infrastructure/gcp"
	rmongo "github.com/reearth/reearth-cms/worker/internal/infrastructure/mongo"
	"github.com/reearth/reearth-cms/worker/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/worker/internal/usecase/repo"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.opentelemetry.io/contrib/instrumentation/go.mongodb.org/mongo-driver/mongo/otelmongo"

	"github.com/reearth/reearthx/log"
)

func initReposAndGateways(ctx context.Context, conf *Config, debug bool) (*gateway.Container, *repo.Container) {
	// gateways
	gateways := &gateway.Container{}
	if conf.GCS.BucketName != "" {
		log.Infof("file: GCS storage is used: %s\n", conf.GCS.BucketName)
		gateways.CMS = gcp.NewPubSub(conf.PubSub.Topic, conf.GCP.Project)
		fileRepo, err := gcp.NewFile(conf.GCS.BucketName, conf.GCS.PublicationCacheControl)
		if err != nil {
			if debug {
				log.Warnf("file: failed to init GCS storage: %s\n", err.Error())
				err = nil
			}
		}
		gateways.File = fileRepo
	} else if conf.S3.BucketName != "" {
		log.Infof("file: S3 storage is used: %s\n", conf.S3.BucketName)
		var err error
		gateways.CMS, err = aws.NewSNS(ctx, conf.SNS.TopicARN)
		if err != nil {
			if debug {
				log.Warnf("file: failed to init S3 storage: %s\n", err.Error())
				err = nil
			}
		}
		fileRepo, err := aws.NewFile(ctx, conf.S3.BucketName, conf.S3.PublicationCacheControl)
		if err != nil {
			if debug {
				log.Warnf("file: failed to init S3 storage: %s\n", err.Error())
				err = nil
			}
		}
		gateways.File = fileRepo
	}

	// repos
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
	db := client.Database("reearth_cms")
	repos, err := rmongo.New(ctx, db)
	if err != nil {
		log.Fatalf("repo initialization error: %+v\n", err)
	}

	return gateways, repos
}
