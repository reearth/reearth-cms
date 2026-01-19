package main

import (
	"context"
	"fmt"
	"time"

	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type AssetDocumentForNormalization struct {
	ID       interface{} `bson:"_id"`
	FileName string      `bson:"filename"`
}

type ItemDocumentForTextNormalization struct {
	ID     interface{} `bson:"_id"`
	ItemID string      `bson:"id"`
	Fields []struct {
		F string `bson:"f"`
		V struct {
			T string `bson:"t"`
			V []any  `bson:"v"`
		} `bson:"v"`
	} `bson:"fields"`
}

func TextNormalizationMigration(ctx context.Context, dbURL, dbName string, wetRun bool) error {
	client, err := mongo.Connect(ctx, options.Client().ApplyURI(dbURL))
	if err != nil {
		return fmt.Errorf("db: failed to init client err: %w", err)
	}
	defer func() {
		if err := client.Disconnect(ctx); err != nil {
			fmt.Printf("Warning: failed to disconnect client: %v\n", err)
		}
	}()

	db := client.Database(dbName)

	// Run asset filename normalization
	if err := normalizeAssetFilenames(ctx, db, wetRun); err != nil {
		return fmt.Errorf("asset filename normalization failed: %w", err)
	}

	fmt.Println() // Blank line between migrations

	// Run item text field normalization
	if err := normalizeItemTextFields(ctx, db, wetRun); err != nil {
		return fmt.Errorf("item text field normalization failed: %w", err)
	}

	return nil
}

// normalizeAssetFilenames normalizes asset filename fields
func normalizeAssetFilenames(ctx context.Context, db *mongo.Database, wetRun bool) error {
	fmt.Println("=== Asset Filename Normalization ===")
	testID := ""

	col := db.Collection("asset")
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

	fmt.Printf("Starting asset filename normalization...\n")

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

		normalizedFileName := asset.NormalizeText(assetDoc.FileName)

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

		if len(batch) >= batchSize {
			if err := executeBatch(ctx, col, batch); err != nil {
				return err
			}

			elapsed := time.Since(startTime)
			rate := float64(processed) / elapsed.Seconds()
			fmt.Printf("Processed %d documents, modified %d (%.2f docs/sec)\n", processed, modified, rate)

			batch = batch[:0]
		}
	}

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
	fmt.Printf("Migration completed. Processed %d documents, modified %d in %v (%.2f docs/sec)\n",
		processed, modified, elapsed, rate)

	return nil
}

// normalizeItemTextFields normalizes text field values in items
func normalizeItemTextFields(ctx context.Context, db *mongo.Database, wetRun bool) error {
	fmt.Println("=== Item Text Field Normalization ===")
	testID := ""

	col := db.Collection("item")
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
		fmt.Printf("test mode: filter on item id '%s' is applied, %d items selected.\n", testID, count)
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

	fmt.Println("Starting item text field normalization...")

	// Text field types that need normalization
	textFieldTypes := map[string]bool{
		"text":           true,
		"textArea":       true,
		"richText":       true,
		"markdown":       true,
		"select":         true,
		"tag":            true,
		"geometryObject": true,
		"geometryEditor": true,
	}

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

		hasChanges := false
		normalizedFields := make([]bson.M, len(itemDoc.Fields))

		for i, field := range itemDoc.Fields {
			if !textFieldTypes[field.V.T] {
				// Not a text field, keep as-is
				normalizedFields[i] = bson.M{
					"f": field.F,
					"v": bson.M{
						"t": field.V.T,
						"v": field.V.V,
					},
				}
				continue
			}

			// Normalize text field values
			normalizedValues := make([]any, len(field.V.V))
			for j, val := range field.V.V {
				if str, ok := val.(string); ok {
					normalized := item.NormalizeText(str)
					if str != normalized {
						hasChanges = true
					}
					normalizedValues[j] = normalized
				} else {
					normalizedValues[j] = val
				}
			}

			normalizedFields[i] = bson.M{
				"f": field.F,
				"v": bson.M{
					"t": field.V.T,
					"v": normalizedValues,
				},
			}
		}

		if hasChanges {
			fmt.Printf("Normalized text fields in item %s\n", itemDoc.ItemID)

			// Create an update model that only updates the fields array
			update := mongo.NewUpdateOneModel().
				SetFilter(bson.M{"_id": itemDoc.ID}).
				SetUpdate(bson.M{"$set": bson.M{"fields": normalizedFields}})

			batch = append(batch, update)
			modified++
		}

		processed++

		if len(batch) >= batchSize {
			if err := executeBatch(ctx, col, batch); err != nil {
				return err
			}

			elapsed := time.Since(startTime)
			rate := float64(processed) / elapsed.Seconds()
			fmt.Printf("Processed %d documents, modified %d (%.2f docs/sec)\n", processed, modified, rate)

			batch = batch[:0]
		}
	}

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
	fmt.Printf("Migration completed. Processed %d documents, modified %d in %v (%.2f docs/sec)\n",
		processed, modified, elapsed, rate)

	return nil
}
