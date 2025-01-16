package main

import (
	"context"
	"os"
	"os/exec"
	"time"

	"github.com/joho/godotenv"
	"github.com/reearth/reearth-cms/worker/internal/adapter/http"
	rmongo "github.com/reearth/reearth-cms/worker/internal/infrastructure/mongo"
	"github.com/reearth/reearth-cms/worker/internal/usecase/interactor"
	"github.com/reearth/reearth-cms/worker/internal/usecase/repo"
	"github.com/reearth/reearthx/log"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.opentelemetry.io/contrib/instrumentation/go.mongodb.org/mongo-driver/mongo/otelmongo"
)

func main() {
	log.Infof("reearth-cms/worker: copier has started")
	ctx := context.Background()

	if err := godotenv.Load(".env"); err != nil && !os.IsNotExist(err) {
		log.Fatal("config: unable to load .env")
	} else if err == nil {
		log.Info("config: .env loaded")
	}

	dbURI := mustGetEnv("REEARTH_CMS_WORKER_DB")
	collection := mustGetEnv("REEARTH_CMS_COPIER_COLLECTION")
	filter := mustGetEnv("REEARTH_CMS_COPIER_FILTER")
	changes := mustGetEnv("REEARTH_CMS_COPIER_CHANGES")

	if len(os.Args) < 2 {
		log.Fatal("insufficient arguments provided")
	}

	cmd := exec.CommandContext(ctx, os.Args[1], os.Args[2:]...)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	if err := cmd.Run(); err != nil {
		log.Fatalf("command execution failed: %v", err)
	}

	repos, err := initReposWithCollection(ctx, dbURI, collection)
	if err != nil {
		log.Fatalf("failed to initialize repositories with DB URI %s: %v", dbURI, err)
	}

	uc := interactor.NewUsecase(nil, repos)
	ctrl := http.NewCopyController(uc)
	if err := ctrl.Copy(ctx, http.CopyInput{Filter: filter, Changes: changes}); err != nil {
		log.Fatalf("copy operation failed: %v", err)
	}
}

func mustGetEnv(key string) string {
	value := os.Getenv(key)
	if value == "" {
		log.Fatalf("environment variable %s is required", key)
	}
	return value
}

func initReposWithCollection(ctx context.Context, dbURI, collection string) (*repo.Container, error) {
	client, err := mongo.Connect(
		ctx,
		options.Client().
			ApplyURI(dbURI).
			SetConnectTimeout(10*time.Second).
			SetMonitor(otelmongo.NewMonitor()),
	)
	if err != nil {
		return nil, err
	}

	db := client.Database("reearth_cms")
	mongoCopier := rmongo.NewCopier(db)
	mongoCopier.SetCollection(db.Collection(collection))
	return rmongo.New(ctx, nil, mongoCopier)
}
