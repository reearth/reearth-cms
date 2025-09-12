package app

import (
	"context"
	"time"

	"github.com/reearth/reearth-cms/server/internal/infrastructure/auth0"
	"github.com/reearth/reearth-cms/server/internal/infrastructure/aws"
	"github.com/reearth/reearth-cms/server/internal/infrastructure/fs"
	"github.com/reearth/reearth-cms/server/internal/infrastructure/gcp"
	mongorepo "github.com/reearth/reearth-cms/server/internal/infrastructure/mongo"
	"github.com/reearth/reearth-cms/server/internal/infrastructure/policy"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearthx/account/accountinfrastructure/accountmongo"
	"github.com/reearth/reearthx/account/accountusecase/accountgateway"
	"github.com/reearth/reearthx/account/accountusecase/accountrepo"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/mongox"
	"github.com/spf13/afero"
	"go.mongodb.org/mongo-driver/event"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.opentelemetry.io/contrib/instrumentation/go.mongodb.org/mongo-driver/mongo/otelmongo"
)

func initAccountDB(client *mongo.Client, txAvailable bool, ctx context.Context, conf *Config) *accountrepo.Container {
	accountDatabase := conf.DB_Account
	log.Infof("account database: %s", accountDatabase)

	accountUsers := make([]accountrepo.User, 0, len(conf.DB_Users))
	for _, u := range conf.DB_Users {
		c, err := mongo.Connect(ctx, options.Client().ApplyURI(u.URI).SetMonitor(otelmongo.NewMonitor()))
		if err != nil {
			log.Fatalf("mongo error: %+v\n", err)
		}
		accountUsers = append(accountUsers, accountmongo.NewUserWithHost(mongox.NewClient(accountDatabase, c), u.Name))
	}

	acRepos, err := accountmongo.New(ctx, client, accountDatabase, txAvailable, false, accountUsers)
	if err != nil {
		log.Fatalf("Failed to init mongo: %+v\n", err)
	}

	return acRepos
}

func initCMSDB(client *mongo.Client, txAvailable bool, acRepos *accountrepo.Container, ctx context.Context, conf *Config) *repo.Container {
	cmsDatabase := conf.DB_CMS
	log.Infof("cms database: %s", cmsDatabase)

	repos, err := mongorepo.New(ctx, client, cmsDatabase, txAvailable, acRepos)
	if err != nil {
		log.Fatalf("Failed to init mongo: %+v\n", err)
	}

	return repos
}

func InitReposAndGateways(ctx context.Context, conf *Config) (*repo.Container, *gateway.Container, *accountrepo.Container, *accountgateway.Container) {
	gateways := &gateway.Container{}
	acGateways := &accountgateway.Container{}

	// Mongo
	co := options.Client().
		ApplyURI(conf.DB).
		SetConnectTimeout(time.Second * 10).
		SetMonitor(otelmongo.NewMonitor())
	if conf.Dev {
		co.SetMonitor(NewLogMonitor())
	}
	client, err := mongo.Connect(ctx, co)
	if err != nil {
		log.Fatalf("repo initialization error: %+v\n", err)
	}

	txAvailable := mongox.IsTransactionAvailable(conf.DB)

	acRepos := initAccountDB(client, txAvailable, ctx, conf)
	cmsRepos := initCMSDB(client, txAvailable, acRepos, ctx, conf)

	// File
	var fileRepo gateway.File
	privateBase := conf.Host
	if conf.GCS.BucketName != "" {
		log.Infof("file: GCS storage is used: %s", conf.GCS.BucketName)
		if conf.Asset_Public {
			fileRepo, err = gcp.NewFile(conf.GCS.BucketName, conf.AssetBaseURL, conf.GCS.PublicationCacheControl, conf.AssetUploadURLReplacement)
		} else {
			fileRepo, err = gcp.NewFileWithACL(conf.GCS.BucketName, conf.AssetBaseURL, privateBase, conf.GCS.PublicationCacheControl, conf.AssetUploadURLReplacement)
		}
		if err != nil {
			log.Fatalf("file: failed to init GCS storage: %s\n", err.Error())
		}
	} else if conf.S3.BucketName != "" {
		log.Infof("file: S3 storage is used: %s", conf.S3.BucketName)
		if conf.Asset_Public {
			fileRepo, err = aws.NewFile(ctx, conf.S3.BucketName, conf.AssetBaseURL, conf.S3.PublicationCacheControl, conf.AssetUploadURLReplacement)
		} else {
			fileRepo, err = aws.NewFileWithACL(ctx, conf.S3.BucketName, conf.AssetBaseURL, privateBase, conf.S3.PublicationCacheControl, conf.AssetUploadURLReplacement)
		}
		if err != nil {
			log.Fatalf("file: failed to init S3 storage: %s\n", err.Error())
		}
	} else {
		log.Infof("file: local storage is used")
		datafs := afero.NewBasePathFs(afero.NewOsFs(), "data")
		if conf.Asset_Public {
			fileRepo, err = fs.NewFile(datafs, conf.Host, conf.AssetUploadURLReplacement)
		} else {
			fileRepo, err = fs.NewFileWithACL(datafs, conf.AssetBaseURL, privateBase, conf.AssetUploadURLReplacement)
		}
	}
	if err != nil {
		log.Fatalf("file: init error: %+v", err)
	}
	gateways.File = fileRepo

	// Auth0
	auth := auth0.New(conf.Auth0.Domain, conf.Auth0.ClientID, conf.Auth0.ClientSecret)
	gateways.Authenticator = auth
	acGateways.Authenticator = auth

	// CloudTasks
	if conf.Task.GCPProject != "" {
		conf.Task.GCSHost = conf.Host
		conf.Task.GCSBucket = conf.GCS.BucketName
		conf.Task.GCSPublic = conf.Asset_Public
		taskRunner, err := gcp.NewTaskRunner(ctx, &conf.Task)
		if err != nil {
			log.Fatalf("task runner: gcp init error: %+v", err)
		}
		gateways.TaskRunner = taskRunner
		log.Infof("task runner: GCP is used")
	} else if conf.AWSTask.TopicARN != "" || conf.AWSTask.WebhookARN != "" {
		taskRunner, err := aws.NewTaskRunner(ctx, &conf.AWSTask)
		if err != nil {
			log.Fatalf("task runner: aws init error: %+v", err)
		}
		gateways.TaskRunner = taskRunner
		log.Infof("task runner: AWS is used")
	} else {
		log.Infof("task runner: not used")
	}

	// Policy Checker - configurable via environment
	var policyChecker gateway.PolicyChecker
	switch conf.Policy_Checker.Type {
	case "http":
		if conf.Policy_Checker.Endpoint == "" {
			log.Fatalf("policy checker HTTP endpoint is required")
		}
		policyChecker = policy.NewHTTPPolicyChecker(
			conf.Policy_Checker.Endpoint,
			conf.Policy_Checker.Token,
			conf.Policy_Checker.Timeout,
		)
		log.Infof("policy checker: using HTTP checker with endpoint: %s", conf.Policy_Checker.Endpoint)
	case "permissive":
		fallthrough
	default:
		policyChecker = policy.NewPermissiveChecker()
		log.Infof("policy checker: using permissive checker (OSS mode)")
	}
	gateways.PolicyChecker = policyChecker

	return cmsRepos, gateways, acRepos, acGateways
}

func NewLogMonitor() *event.CommandMonitor {
	return &event.CommandMonitor{
		Started: func(_ context.Context, evt *event.CommandStartedEvent) {
			log.Debugf(evt.Command.String())
		},
		Succeeded: nil,
		Failed:    nil,
	}
}
