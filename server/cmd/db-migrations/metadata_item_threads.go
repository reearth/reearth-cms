package main

import (
	"context"
	"fmt"
	"slices"

	"github.com/samber/lo"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// MetadataItemThreads deletes comment threads attached to metadata items and
// unsets the thread reference on every version of those metadata items.
// Metadata items are not meant to have threads, and item deletion does not
// remove them, so their comments would outlive the item.
//
// Dry run logs what would be removed. Comment contents are never logged.
func MetadataItemThreads(ctx context.Context, dbURL, dbName string, wetRun bool) error {
	client, err := mongo.Connect(ctx, options.Client().ApplyURI(dbURL))
	if err != nil {
		return fmt.Errorf("db: failed to init client err: %w", err)
	}
	defer func() {
		if err := client.Disconnect(ctx); err != nil {
			fmt.Printf("Warning: failed to disconnect client: %v\n", err)
		}
	}()

	return metadataItemThreads(ctx, client.Database(dbName), wetRun)
}

type metadataItemWithThreads struct {
	Item    string   `bson:"_id"`
	Project string   `bson:"project"`
	Threads []string `bson:"threads"`
}

type metadataThreadSummary struct {
	ID        string `bson:"id"`
	Workspace string `bson:"workspace"`
	Comments  int    `bson:"comments"`
}

func metadataItemThreads(ctx context.Context, db *mongo.Database, wetRun bool) error {
	fmt.Println("=== Metadata Item Threads ===")

	itemCol := db.Collection("item")
	threadCol := db.Collection("thread")

	items, err := findMetadataItemsWithThreads(ctx, itemCol)
	if err != nil {
		return err
	}
	if len(items) == 0 {
		fmt.Println("no metadata items with a thread found")
		return nil
	}

	threadIDs := lo.Uniq(lo.FlatMap(items, func(i metadataItemWithThreads, _ int) []string { return i.Threads }))

	summaries, err := findThreadSummaries(ctx, threadCol, threadIDs)
	if err != nil {
		return err
	}

	// Never delete a thread that a non-metadata resource also points to.
	shared, err := findSharedThreads(ctx, db, threadIDs)
	if err != nil {
		return err
	}

	removable := lo.Filter(threadIDs, func(t string, _ int) bool { return !shared[t] })

	comments := 0
	for _, it := range items {
		fmt.Printf("metadata item %s (project %s)\n", it.Item, it.Project)
		for _, t := range it.Threads {
			switch s, ok := summaries[t]; {
			case shared[t]:
				fmt.Printf("  thread %s: also used by another resource, skipped\n", t)
			case !ok:
				fmt.Printf("  thread %s: thread document missing, reference will be unset\n", t)
			default:
				fmt.Printf("  thread %s: workspace=%s comments=%d\n", t, s.Workspace, s.Comments)
				comments += s.Comments
			}
		}
	}

	existing := lo.Filter(removable, func(t string, _ int) bool { _, ok := summaries[t]; return ok })
	fmt.Printf("metadata items: %d, threads to delete: %d (comments: %d), dangling references: %d, shared (skipped): %d\n",
		len(items), len(existing), comments, len(removable)-len(existing), len(shared))

	if !wetRun {
		fmt.Println("dry run: no changes made")
		return nil
	}
	if len(removable) == 0 {
		return nil
	}

	// Delete threads first: if the run stops halfway, the item references
	// still point at them and a re-run finds and unsets them.
	delRes, err := threadCol.DeleteMany(ctx, bson.M{"id": bson.M{"$in": existing}})
	if err != nil {
		return fmt.Errorf("failed to delete threads: %w", err)
	}
	fmt.Printf("deleted %d threads\n", delRes.DeletedCount)

	updRes, err := itemCol.UpdateMany(ctx,
		bson.M{"ismetadata": true, "thread": bson.M{"$in": removable}},
		bson.M{"$unset": bson.M{"thread": ""}},
	)
	if err != nil {
		return fmt.Errorf("failed to unset item threads: %w", err)
	}
	fmt.Printf("unset thread on %d metadata item versions\n", updRes.ModifiedCount)

	return nil
}

func findMetadataItemsWithThreads(ctx context.Context, col *mongo.Collection) ([]metadataItemWithThreads, error) {
	cur, err := col.Aggregate(ctx, mongo.Pipeline{
		{{Key: "$match", Value: bson.M{"ismetadata": true, "thread": bson.M{"$type": "string"}}}},
		{{Key: "$group", Value: bson.M{
			"_id":     "$id",
			"project": bson.M{"$first": "$project"},
			"threads": bson.M{"$addToSet": "$thread"},
		}}},
		{{Key: "$sort", Value: bson.D{{Key: "project", Value: 1}, {Key: "_id", Value: 1}}}},
	})
	if err != nil {
		return nil, fmt.Errorf("failed to find metadata items: %w", err)
	}

	var res []metadataItemWithThreads
	if err := cur.All(ctx, &res); err != nil {
		return nil, fmt.Errorf("failed to decode metadata items: %w", err)
	}
	for i := range res {
		slices.Sort(res[i].Threads)
	}
	return res, nil
}

func findThreadSummaries(ctx context.Context, col *mongo.Collection, ids []string) (map[string]metadataThreadSummary, error) {
	cur, err := col.Find(ctx,
		bson.M{"id": bson.M{"$in": ids}},
		options.Find().SetProjection(bson.M{
			"_id":       0,
			"id":        1,
			"workspace": 1,
			"comments":  bson.M{"$size": bson.M{"$ifNull": bson.A{"$comments", bson.A{}}}},
		}),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to find threads: %w", err)
	}

	var res []metadataThreadSummary
	if err := cur.All(ctx, &res); err != nil {
		return nil, fmt.Errorf("failed to decode threads: %w", err)
	}
	return lo.KeyBy(res, func(s metadataThreadSummary) string { return s.ID }), nil
}

func findSharedThreads(ctx context.Context, db *mongo.Database, ids []string) (map[string]bool, error) {
	in := bson.M{"$in": ids}
	queries := []struct {
		col    string
		filter bson.M
	}{
		{"item", bson.M{"thread": in, "ismetadata": bson.M{"$ne": true}}},
		{"asset", bson.M{"thread": in}},
		{"request", bson.M{"thread": in}},
	}

	shared := map[string]bool{}
	for _, q := range queries {
		vals, err := db.Collection(q.col).Distinct(ctx, "thread", q.filter)
		if err != nil {
			return nil, fmt.Errorf("failed to check %s threads: %w", q.col, err)
		}
		for _, v := range vals {
			if s, ok := v.(string); ok {
				shared[s] = true
			}
		}
	}
	return shared, nil
}
