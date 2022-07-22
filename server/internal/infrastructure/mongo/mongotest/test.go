package mongotest

import (
	"context"
	"encoding/hex"
	"os"
	"testing"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/x/mongo/driver/uuid"
)

func Connect(t *testing.T) func(*testing.T) *mongo.Database {
	t.Helper()

	// Skip unit testing if "REEARTH_CMS_DB" is not configured
	db := os.Getenv("REEARTH_CMS_DB")
	if db == "" {
		t.SkipNow()
		return nil
	}

	c, _ := mongo.Connect(
		context.Background(),
		options.Client().
			ApplyURI(db).
			SetConnectTimeout(time.Second*10),
	)

	return func(t *testing.T) *mongo.Database {
		t.Helper()

		database, _ := uuid.New()
		databaseName := "reearth-cms-test-" + hex.EncodeToString(database[:])

		t.Cleanup(func() {
			_ = c.Database(databaseName).Drop(context.Background())
		})

		return c.Database(databaseName)
	}
}
