package main

import (
	"context"
	"log"
	"os"
	"os/exec"
	"time"

	"github.com/reearth/reearth-cms/worker/internal/adapter/http"
	rmongo "github.com/reearth/reearth-cms/worker/internal/infrastructure/mongo"
	"github.com/reearth/reearth-cms/worker/internal/usecase/interactor"
	"github.com/reearth/reearth-cms/worker/internal/usecase/repo"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.opentelemetry.io/contrib/instrumentation/go.mongodb.org/mongo-driver/mongo/otelmongo"
)

func main() {
	ctx := context.Background()

	dbURI := getEnv("REEARTH_CMS_DB", true)
	modelID := getEnv("REEARTH_CMS_COPIER_MODEL_ID", true)
	name := getEnv("REEARTH_CMS_COPIER_NAME", false)

	cmd := exec.CommandContext(ctx, os.Args[1], os.Args[2:]...)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	if err := cmd.Run(); err != nil {
		log.Fatalf("command execution failed: %v", err)
	}

	repos, err := initRepos(ctx, dbURI)
	if err != nil {
		log.Fatalf("failed to initialize repositories with DB URI %s: %v", dbURI, err)
	}

	uc := interactor.NewUsecase(nil, repos)
	ctrl := http.NewCopyController(uc)

	if err := ctrl.Copy(ctx, http.CopyInput{ModelID: modelID, Name: name}); err != nil {
		log.Fatalf("failed to copy model: %v", err)
	}
}

func getEnv(key string, required bool) string {
	value := os.Getenv(key)
	if required && value == "" {
		log.Fatalf("environment variable %s is required", key)
	}
	return value
}

func initRepos(ctx context.Context, dbURI string) (*repo.Container, error) {
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
	repos, err := rmongo.New(ctx, db)
	if err != nil {
		return nil, err
	}

	return repos, nil
}
