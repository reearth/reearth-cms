package mongo

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"go.mongodb.org/mongo-driver/mongo"
)

func InitRepos(ctx context.Context, c *repo.Container, mc *mongo.Client, databaseName string) error {
	if databaseName == "" {
		databaseName = "reearth_cms"
	}
	lock, err := NewLock(mc.Database(databaseName).Collection("locks"))
	if err != nil {
		return err
	}
	c.Lock = lock
	return nil
}
