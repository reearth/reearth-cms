package main

import (
	"context"
	"fmt"

	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/samber/lo"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type OldItem struct {
	ObjectID primitive.ObjectID `bson:"_id"`
	ID       string             `bson:"id"`
	Refs     []string           `bson:"__r"`
}

type RequestItem struct {
	ID      string `bson:"item"`
	version string `bson:"version"`
	ref     string `bson:"ref"`
}

type Request struct {
	ID    string        `bson:"id"`
	Items []RequestItem `bson:"items"`
}

func MigrateItemMeta(ctx context.Context, dbURL string, dryRun bool) error {
	testID := ""

	client, err := mongo.Connect(ctx, options.Client().ApplyURI(dbURL))
	if err != nil {
		return fmt.Errorf("failed to init client: %w", err)
	}
	requestCol := client.Database("reearth_cms").Collection("request")
	itemCol := client.Database("reearth_cms").Collection("item")
	metaCol := client.Database("reearth_cms").Collection("item_meta")

	items, err := loadItems(ctx, itemCol)
	if err != nil {
		return err
	}

	requests, err := loadPendingRequests(ctx, requestCol)
	if err != nil {
		return err
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
	writes := lo.FilterMap(items, func(o OldItem, _ int) (mongo.WriteModel, bool) {
		if !lo.Contains(o.Refs, version.Latest.String()) {
			return nil, false
		}

		status := itemStatus(o.ID, items, requests)
		fmt.Printf("item (%s): %s\n", o.ID, status)

		return mongo.NewInsertOneModel().
			SetDocument(bson.M{
				"$set": bson.M{
					"__id":   o.ID,
					"__a":    false,
					"status": status,
				},
			}), true
	})

	if dryRun {
		fmt.Printf("dry run\n")
		fmt.Printf("%d docs will be updated\n", len(writes))
		return nil
	}

	err = setIDs(ctx, itemCol)
	if err != nil {
		return err
	}

	fmt.Printf("writing docs...")
	res, err := metaCol.BulkWrite(ctx, writes)
	if err != nil {
		return fmt.Errorf("failed to bulk write: %w", err)
	}

	fmt.Printf("%d docs updated\n", res.ModifiedCount)
	return nil
}

func setIDs(ctx context.Context, itemCol *mongo.Collection) error {
	res, err := itemCol.UpdateMany(
		ctx,
		bson.M{"ismetadata": false},
		bson.A{bson.M{"$set": bson.M{"__id": "$id"}}},
	)
	if err != nil {
		return fmt.Errorf("failed to update docs: %w", err)
	}
	fmt.Printf("%d docs updated\n", res.ModifiedCount)
	return nil
}

func loadItems(ctx context.Context, itemCol *mongo.Collection) ([]OldItem, error) {
	cur, err := itemCol.Find(
		ctx,
		bson.M{"__r": bson.M{"$in": bson.A{"public", "latest"}}, "ismetadata": false},
		options.Find().SetProjection(bson.M{"id": 1, "__r ": 1}),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to find docs: %w", err)
	}

	var items []OldItem
	err = cur.All(ctx, &items)
	if err != nil {
		return nil, fmt.Errorf("failed to decode docs: %w", err)
	}
	return items, nil
}

func loadPendingRequests(ctx context.Context, requestCol *mongo.Collection) ([]Request, error) {
	cur, err := requestCol.Find(
		ctx,
		bson.M{"status": "waiting"},
		options.Find().SetProjection(bson.M{"id": 1, "items ": 1}),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to find docs: %w", err)
	}

	var requests []Request
	err = cur.All(ctx, &requests)
	if err != nil {
		return nil, fmt.Errorf("failed to decode docs: %w", err)
	}
	return requests, nil
}

// latest | public | same | request | status
//   1    |   0    |  X   |    1    |  review
//   1    |   0    |  X   |    0    |  draft
//   1    |   1    |  0   |    1    |  public_review
//   1    |   1    |  O   |    0    |  public_draft
//   1    |   1    |  1   |    x    |  public

func itemStatus(id string, items []OldItem, requests []Request) string {
	hasPendingRequest := lo.ContainsBy(requests, func(r Request) bool {
		return lo.ContainsBy(r.Items, func(i RequestItem) bool {
			return i.ID == id
		})
	})

	pVer, hasPublicVersion := lo.Find(items, func(i OldItem) bool {
		return i.ID == id && lo.Contains(i.Refs, version.Public.String())
	})

	lVer, hasLatestVersion := lo.Find(items, func(i OldItem) bool {
		return i.ID == id && lo.Contains(i.Refs, version.Latest.String())
	})
	if !hasLatestVersion {
		panic(fmt.Sprintf("latest version not found (%s)", id))
	}

	isSame := pVer.ObjectID == lVer.ObjectID

	if !hasPublicVersion && !hasPendingRequest {
		return "draft"
	}
	if !hasPublicVersion && hasPendingRequest {
		return "review"
	}
	if hasPublicVersion && isSame {
		return "public"
	}
	if hasPublicVersion && !isSame && hasPendingRequest {
		return "public_review"
	}
	if hasPublicVersion && !isSame && !hasPendingRequest {
		return "public_draft"
	}

	panic(fmt.Sprintf("could not figure out item status (%s)", id))
}
