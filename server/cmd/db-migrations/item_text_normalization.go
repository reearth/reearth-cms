package main

import (
	"context"
	"fmt"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"golang.org/x/text/unicode/norm"
)

type ItemDocumentForTextNormalization struct {
	ID     interface{}          `bson:"_id"`
	ItemID string               `bson:"id"`
	Fields []ItemFieldForNorm   `bson:"fields"`
}

type ItemFieldForNorm struct {
	F string          `bson:"f"` // Field ID
	V ValueForNorm    `bson:"v"` // Field value
}

type ValueForNorm struct {
	T string `bson:"t"` // Type
	V []any  `bson:"v"` // Values array
}

// Text field types that need normalization
var textFieldTypes = map[string]bool{
	"text":           true,
	"textArea":       true,
	"richText":       true,
	"markdown":       true,
	"select":         true,
	"tag":            true,
	"geometryObject": true,
	"geometryEditor": true,
}

func normalizeText(s string) string {
	return norm.NFKC.String(s)
}

func ItemTextNormalizationMigration(ctx context.Context, dbURL, dbName string, wetRun bool) error {
	client, err := mongo.Connect(ctx, options.Client().ApplyURI(dbURL))
	if err != nil {
		return fmt.Errorf("db: failed to init client err: %w", err)
	}
	defer func() {
		if err := client.Disconnect(ctx); err != nil {
			fmt.Printf("Warning: failed to disconnect client: %v\n", err)
		}
	}()

	col := client.Database(dbName).Collection("item")

	filter := bson.M{}

	if !wetRun {
		fmt.Printf("dry run\n")

		// Show sample of items that would be changed
		cursor, err := col.Find(ctx, filter, options.Find().SetLimit(100))
		if err != nil {
			return fmt.Errorf("failed to query collection: %w", err)
		}
		defer func() {
			if err := cursor.Close(ctx); err != nil {
				fmt.Printf("Warning: failed to close cursor: %v\n", err)
			}
		}()

		needsUpdate := 0
		samplesShown := 0
		maxSamplesToShow := 10

		for cursor.Next(ctx) {
			var itemDoc ItemDocumentForTextNormalization
			if err := cursor.Decode(&itemDoc); err != nil {
				return fmt.Errorf("failed to decode document: %w", err)
			}

			changedFields := []string{}
			for _, field := range itemDoc.Fields {
				// Check if this is a text field type
				if !textFieldTypes[field.V.T] {
					continue
				}

				// Check if any value needs normalization
				for _, val := range field.V.V {
					if str, ok := val.(string); ok {
						normalized := normalizeText(str)
						if str != normalized {
							changedFields = append(changedFields, field.F)
							break
						}
					}
				}
			}

			if len(changedFields) > 0 {
				needsUpdate++
				if samplesShown < maxSamplesToShow {
					fmt.Printf("  Item %s would normalize %d field(s): %v\n", itemDoc.ItemID, len(changedFields), changedFields)
					samplesShown++
				}
			}
		}

		if err := cursor.Err(); err != nil {
			return fmt.Errorf("cursor error: %w", err)
		}

		total, err := col.CountDocuments(ctx, filter)
		if err != nil {
			return fmt.Errorf("failed to count docs: %w", err)
		}

		if samplesShown > 0 && needsUpdate > samplesShown {
			fmt.Printf("  ... and %d more (showing first %d)\n", needsUpdate-samplesShown, samplesShown)
		}

		fmt.Printf("\nSummary: %d/%d items need text field normalization\n", needsUpdate, total)
		return nil
	}

	fmt.Printf("Starting item text field normalization migration...\n")

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

		var itemDoc ItemDocumentForTextNormalization
		if err := cursor.Decode(&itemDoc); err != nil {
			return fmt.Errorf("failed to decode document: %w", err)
		}

		// Process all fields and check if any need normalization
		normalizedFields := []ItemFieldForNorm{}
		hasChanges := false

		for _, field := range itemDoc.Fields {
			// Check if this is a text field type
			if !textFieldTypes[field.V.T] {
				normalizedFields = append(normalizedFields, field)
				continue
			}

			// Normalize all string values in this field
			normalizedValues := []any{}
			fieldChanged := false

			for _, val := range field.V.V {
				if str, ok := val.(string); ok {
					normalized := normalizeText(str)
					if str != normalized {
						fieldChanged = true
						hasChanges = true
					}
					normalizedValues = append(normalizedValues, normalized)
				} else {
					normalizedValues = append(normalizedValues, val)
				}
			}

			normalizedFields = append(normalizedFields, ItemFieldForNorm{
				F: field.F,
				V: ValueForNorm{
					T: field.V.T,
					V: normalizedValues,
				},
			})

			if fieldChanged {
				fmt.Printf("Normalized text field '%s' in item %s\n", field.F, itemDoc.ItemID)
			}
		}

		if hasChanges {
			// Create update for this item
			update := mongo.NewUpdateOneModel().
				SetFilter(bson.M{"_id": itemDoc.ID}).
				SetUpdate(bson.M{"$set": bson.M{"fields": normalizedFields}})

			batch = append(batch, update)
			modified++
		}

		processed++

		// Execute batch if we've reached the batch size
		if len(batch) >= batchSize {
			if err := executeBatch(ctx, col, batch); err != nil {
				return err
			}

			elapsed := time.Since(startTime)
			rate := float64(processed) / elapsed.Seconds()
			fmt.Printf("Processed %d items, modified %d (%.2f items/sec)\n", processed, modified, rate)

			batch = batch[:0]
		}
	}

	// Process any remaining items in the final batch
	if len(batch) > 0 {
		if err := executeBatch(ctx, col, batch); err != nil {
			return err
		}
	}

	if err := cursor.Err(); err != nil {
		return fmt.Errorf("cursor error: %w", err)
	}

	elapsed := time.Since(startTime)
	rate := float64(processed) / elapsed.Seconds()
	fmt.Printf("Migration completed. Processed %d items, modified %d in %v (%.2f items/sec)\n",
		processed, modified, elapsed, rate)

	return nil
}
