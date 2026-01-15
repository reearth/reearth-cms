package main

import (
	"context"
	"fmt"
	"time"

	"github.com/reearth/reearth-cms/server/pkg/asset"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type AssetDocumentForNormalization struct {
	ID       interface{} `bson:"_id"`
	FileName string      `bson:"filename"`
}

func AssetFileNameNormalizationMigration(ctx context.Context, dbURL, dbName string, wetRun bool) error {
	testID := ""

	client, err := mongo.Connect(ctx, options.Client().ApplyURI(dbURL))
	if err != nil {
		return fmt.Errorf("db: failed to init client err: %w", err)
	}
	defer func() {
		if err := client.Disconnect(ctx); err != nil {
			fmt.Printf("Warning: failed to disconnect client: %v\n", err)
		}
	}()

	col := client.Database(dbName).Collection("asset")

	filter := bson.M{}

	if testID != "" {
		filter = bson.M{
			"$and": []bson.M{
				{"id": testID},
				filter,
			},
		}
		count, err := col.CountDocuments(ctx, filter)
		if err != nil {
			return fmt.Errorf("failed to count docs: %w", err)
		}
		fmt.Printf("test mode: filter on asset id '%s' is applied, %d assets selected.\n", testID, count)
	}

	if !wetRun {
		fmt.Printf("dry run\n")
		count, err := col.CountDocuments(ctx, filter)
		if err != nil {
			return fmt.Errorf("failed to count docs: %w", err)
		}
		fmt.Printf("%d docs will be checked for normalization\n", count)
		return nil
	}

	fmt.Printf("Starting asset filename normalization migration...\n")

	// Process documents in batches
	batchSize := 1000
	opts := options.Find().SetBatchSize(int32(batchSize))

	cursor, err := col.Find(ctx, filter, opts)
	if err != nil {
		return fmt.Errorf("failed to query collection: %w", err)
	}
	defer func() {
		if err := cursor.Close(ctx); err != nil {
			fmt.Printf("Warning: failed to close cursor: %v\n", err)
		}
	}()

	batch := make([]mongo.WriteModel, 0, batchSize)
	processed := 0
	modified := 0
	startTime := time.Now()

	for cursor.Next(ctx) {
		if ctx.Err() != nil {
			return ctx.Err()
		}

		var assetDoc AssetDocumentForNormalization
		if err := cursor.Decode(&assetDoc); err != nil {
			return fmt.Errorf("failed to decode document: %w", err)
		}

		// Normalize the filename
		normalizedFileName := asset.NormalizeFileName(assetDoc.FileName)

		// Only update if the normalized version is different
		if assetDoc.FileName != normalizedFileName {
			fmt.Printf("Normalizing asset filename: '%s' -> '%s'\n", assetDoc.FileName, normalizedFileName)

			// Create an update model that only updates the filename field
			update := mongo.NewUpdateOneModel().
				SetFilter(bson.M{"_id": assetDoc.ID}).
				SetUpdate(bson.M{"$set": bson.M{"filename": normalizedFileName}})

			batch = append(batch, update)
			modified++
		}

		processed++

		// If we've reached the batch size, execute the bulk write
		if len(batch) >= batchSize {
			if err := executeBatch(ctx, col, batch); err != nil {
				return err
			}

			// Log progress
			elapsed := time.Since(startTime)
			rate := float64(processed) / elapsed.Seconds()
			fmt.Printf("Processed %d documents, modified %d (%.2f docs/sec)\n", processed, modified, rate)

			// Clear the batch
			batch = batch[:0]
		}
	}

	// Process any remaining documents in the final batch
	if len(batch) > 0 {
		if err := executeBatch(ctx, col, batch); err != nil {
			return err
		}
	}

	// Check for any cursor errors
	if err := cursor.Err(); err != nil {
		return fmt.Errorf("cursor error: %w", err)
	}

	// Log final stats
	elapsed := time.Since(startTime)
	rate := float64(processed) / elapsed.Seconds()
	fmt.Printf("Migration completed. Processed %d documents, modified %d in %v (%.2f docs/sec)\n",
		processed, modified, elapsed, rate)

	return nil
}
