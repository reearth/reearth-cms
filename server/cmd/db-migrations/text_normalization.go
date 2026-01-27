package main

import (
	"context"
	"fmt"

	"github.com/reearth/reearth-cms/server/pkg/utils"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type AssetDocumentForNormalization struct {
	ID       primitive.ObjectID `bson:"_id"`
	FileName string             `bson:"filename"`
}

func (a AssetDocumentForNormalization) GetID() primitive.ObjectID {
	return a.ID
}

type ItemDocumentForTextNormalization struct {
	ID     primitive.ObjectID `bson:"_id"`
	ItemID string             `bson:"id"`
	Fields []struct {
		F string `bson:"f"`
		V struct {
			T string `bson:"t"`
			V []any  `bson:"v"`
		} `bson:"v"`
	} `bson:"fields"`
}

func (i ItemDocumentForTextNormalization) GetID() primitive.ObjectID {
	return i.ID
}

func updateAssetFilename(asset AssetDocumentForNormalization) (bson.M, bool, error) {
	normalizedFileName := utils.NormalizeText(asset.FileName)

	if asset.FileName != normalizedFileName {
		fmt.Printf("Normalizing asset filename: '%s' -> '%s'\n", asset.FileName, normalizedFileName)
		return bson.M{"filename": normalizedFileName}, true, nil
	}

	return nil, false, nil
}

func updateItemTextFields(item ItemDocumentForTextNormalization) (bson.M, bool, error) {
	hasChanges := false
	normalizedFields := make([]bson.M, len(item.Fields))

	for i, field := range item.Fields {
		originalValues := field.V.V
		normalizedValues := utils.NormalizeTextValues(field.V.T, field.V.V)
		if !hasChanges {
			for j := range originalValues {
				if originalValues[j] != normalizedValues[j] {
					hasChanges = true
					break
				}
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
		fmt.Printf("Normalized text fields in item %s\n", item.ItemID)
		return bson.M{"fields": normalizedFields}, true, nil
	}

	return nil, false, nil
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

	processed, err := BatchUpdateWithFields(ctx, col, filter, 1000, updateAssetFilename)
	if err != nil {
		return err
	}

	fmt.Printf("Migration completed. Processed %d documents\n", processed)
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

	processed, err := BatchUpdateWithFields(ctx, col, filter, 1000, updateItemTextFields)
	if err != nil {
		return err
	}

	fmt.Printf("Migration completed. Processed %d documents\n", processed)
	return nil
}
