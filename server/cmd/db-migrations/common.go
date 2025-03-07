package main

import (
	"context"
	"fmt"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// Entity is a generic interface for types that can be batch updated
type Entity interface {
	GetID() primitive.ObjectID
}

// BatchUpdate processes documents from a MongoDB collection in batches and applies the given update function to each document
func BatchUpdate[T Entity](ctx context.Context, col *mongo.Collection, filter bson.M, batchSize int, fn func(item T) (T, error)) (int, error) {
	opts := options.Find().
		SetBatchSize(int32(batchSize)).
		SetNoCursorTimeout(true)

	cursor, err := col.Find(ctx, filter, opts)
	if err != nil {
		return 0, fmt.Errorf("failed to query collection: %w", err)
	}
	defer cursor.Close(ctx)

	// Process documents in batches
	batch := make([]mongo.WriteModel, 0, batchSize)
	processed := 0
	startTime := time.Now()

	for cursor.Next(ctx) {
		if ctx.Err() != nil {
			return 0, ctx.Err()
		}

		var item T
		if err := cursor.Decode(&item); err != nil {
			return 0, fmt.Errorf("failed to decode document: %w", err)
		}

		// Apply the process function to the document
		updatedItem, err := fn(item)
		if err != nil {
			return 0, fmt.Errorf("failed to process document: %w", err)
		}

		// Create an update model
		update := mongo.NewUpdateOneModel().
			SetFilter(bson.M{"_id": item.GetID()}).
			SetUpdate(bson.M{"$set": updatedItem})

		batch = append(batch, update)
		processed++

		// If we've reached the batch size, execute the bulk write
		if len(batch) >= batchSize {
			if err := executeBatch(ctx, col, batch); err != nil {
				return 0, err
			}

			// Log progress
			elapsed := time.Since(startTime)
			rate := float64(processed) / elapsed.Seconds()
			fmt.Printf("Processed %d documents (%.2f docs/sec)\n", processed, rate)

			// Clear the batch
			batch = batch[:0]
		}
	}

	// Process any remaining documents in the final batch
	if len(batch) > 0 {
		if err := executeBatch(ctx, col, batch); err != nil {
			return 0, err
		}
	}

	// Check for any cursor errors
	if err := cursor.Err(); err != nil {
		return 0, fmt.Errorf("cursor error: %w", err)
	}

	// Log final stats
	elapsed := time.Since(startTime)
	rate := float64(processed) / elapsed.Seconds()
	fmt.Printf("Completed processing %d documents in %v (%.2f docs/sec)\n", processed, elapsed, rate)

	return processed, nil
}

// executeBatch performs the bulk write operation for a batch of updates
func executeBatch(ctx context.Context, collection *mongo.Collection, batch []mongo.WriteModel) error {
	// Define options for the bulk write operation
	opts := options.BulkWrite().SetOrdered(false)

	// Execute the bulk write
	res, err := collection.BulkWrite(ctx, batch, opts)
	if err != nil {
		return fmt.Errorf("bulk write failed: %w", err)
	}
	fmt.Printf("Bulk write result: size=%d matched=%d, modified=%d, upserted=%d\n", len(batch), res.MatchedCount, res.ModifiedCount, res.UpsertedCount)

	return nil
}
