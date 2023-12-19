package main

import (
	"context"
	"fmt"
	"time"

	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/samber/lo"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func MigrateItemMeta(ctx context.Context, dbURL string, dryRun bool) error {
	testID := ""

	client, err := mongo.Connect(ctx, options.Client().ApplyURI(dbURL))
	if err != nil {
		return fmt.Errorf("failed to init client: %w", err)
	}
	itemCol := client.Database("reearth_cms").Collection("item")
	metaCol := client.Database("reearth_cms").Collection("item_meta")

	type OldItem struct {
		ObjectID primitive.ObjectID `bson:"_id"`
		ID       string             `bson:"id"`
		Version  version.ID         `bson:"__v"`
		Parents  []version.ID       `bson:"__w"`
		Refs     []version.Ref      `bson:"__r"`
	}

	type NewItem struct {
		ObjectID primitive.ObjectID `bson:"_id"`
		ID       string             `bson:"__id"`
		Version  version.ID         `bson:"__v"`
		Parents  []version.ID       `bson:"__w"`
		Refs     []version.Ref      `bson:"__r"`
	}

	type MetaItem struct {
		ID        string     `bson:"__id"`
		Archived  bool       `bson:"__a"`
		CreatedAt time.Time  `bson:"__c"`
		UpdatedAt *time.Time `bson:"__u"`
		Status    string     `bson:"status"`
	}

	cur, err := itemCol.Find(
		ctx,
		bson.M{"__w": nil, "ismetadata": false},
		options.Find().SetProjection(bson.M{"_id": 1, "__id": 1, "__v": 1, "__w": 1, "__r ": 1}),
	)
	if err != nil {
		return fmt.Errorf("failed to find docs: %w", err)
	}

	var items []OldItem
	err = cur.All(ctx, &items)
	if err != nil {
		return fmt.Errorf("failed to decode docs: %w", err)
	}

	items = lo.Filter(items, func(o OldItem, _ int) bool {
		return o.ID != ""
	})

	if len(items) == 0 {
		return fmt.Errorf("no docs found")
	}

	fmt.Printf("%d docs found, first id: %s\n", len(items), items[0].ID)

	if testID != "" {
		items = lo.Filter(items, func(o OldItem, _ int) bool {
			return o.ID == testID
		})
		fmt.Printf("test mode: %s, now %d docs\n", testID, len(items))
	}

	// update all documents in metaCol
	writes := lo.Map(items, func(o OldItem, _ int) mongo.WriteModel {
		status := "public"
		fmt.Printf("item (%s): %s\n", o.ID, status)

		return mongo.NewInsertOneModel().
			SetDocument(bson.M{
				"$set": bson.M{
					"__id":   o.ID,
					"__a":    false,
					"__c":    o.ObjectID.Timestamp(),
					"__u":    nil,
					"status": status,
				},
			})
	})

	if dryRun {
		fmt.Printf("dry run\n")
		fmt.Printf("%d docs will be updated\n", len(writes))
		return nil
	}

	fmt.Printf("writing docs...")
	res, err := metaCol.BulkWrite(ctx, writes)
	if err != nil {
		return fmt.Errorf("failed to bulk write: %w", err)
	}

	fmt.Printf("%d docs updated\n", res.ModifiedCount)
	return nil
}
