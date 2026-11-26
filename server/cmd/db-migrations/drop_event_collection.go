package main

import (
	"context"
	"fmt"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

const eventCollection = "event"

// DropEventCollection drops the event collection. The server no longer writes events to the
// database: webhooks are built from the in-memory event, so the stored copies were never read and
// only kept full item snapshots, including field values, after the items were deleted.
func DropEventCollection(ctx context.Context, dbURL, dbName string, wetRun bool) error {
	client, err := mongo.Connect(ctx, options.Client().ApplyURI(dbURL))
	if err != nil {
		return fmt.Errorf("db: failed to init client err: %w", err)
	}
	defer func() {
		if err := client.Disconnect(ctx); err != nil {
			fmt.Printf("Warning: failed to disconnect client: %v\n", err)
		}
	}()

	col := client.Database(dbName).Collection(eventCollection)
	count, err := col.CountDocuments(ctx, bson.M{})
	if err != nil {
		return fmt.Errorf("failed to count %s documents: %w", eventCollection, err)
	}
	fmt.Printf("%s: %d documents\n", eventCollection, count)

	if !wetRun {
		fmt.Printf("dry run: %s collection was not dropped\n", eventCollection)
		return nil
	}

	if err := col.Drop(ctx); err != nil {
		return fmt.Errorf("failed to drop %s collection: %w", eventCollection, err)
	}
	fmt.Printf("%s collection dropped\n", eventCollection)
	return nil
}
