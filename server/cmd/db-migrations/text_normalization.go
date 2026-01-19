package main

import (
	"context"
	"fmt"

	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type AssetDocumentForNormalization struct {
	ID       string `bson:"_id,omitempty"`
	FileName string `bson:"filename"`
}

func (d AssetDocumentForNormalization) GetID() primitive.ObjectID {
	id, err := primitive.ObjectIDFromHex(d.ID)
	if err != nil {
		fmt.Printf("failed to parse asset id: %v\n", d.ID)
		return primitive.NilObjectID
	}
	return id
}

type ItemDocumentForTextNormalization struct {
	ID     string `bson:"_id,omitempty"`
	ItemID string `bson:"id"`
	Fields []struct {
		F string `bson:"f"`
		V struct {
			T string `bson:"t"`
			V []any  `bson:"v"`
		} `bson:"v"`
	} `bson:"fields"`
}

func (d ItemDocumentForTextNormalization) GetID() primitive.ObjectID {
	id, err := primitive.ObjectIDFromHex(d.ID)
	if err != nil {
		fmt.Printf("failed to parse item id: %v\n", d.ID)
		return primitive.NilObjectID
	}
	return id
}

func TextNormalizationMigration(ctx context.Context, dbURL, dbName string, wetRun bool) error {
	client, err := mongo.Connect(ctx, options.Client().ApplyURI(dbURL))
	if err != nil {
		return fmt.Errorf("db: failed to init client err: %w", err)
	}
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

	_, err := BatchUpdate(ctx, col, filter, 1000, updateAssetFilename)
	if err != nil {
		return fmt.Errorf("failed to apply batches: %w", err)
	}

	return nil
}

func updateAssetFilename(doc AssetDocumentForNormalization) (AssetDocumentForNormalization, error) {
	normalizedFileName := asset.NormalizeText(doc.FileName)

	if doc.FileName != normalizedFileName {
		fmt.Printf("Normalizing asset filename: '%s' -> '%s'\n", doc.FileName, normalizedFileName)
		doc.FileName = normalizedFileName
	}

	return doc, nil
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

	_, err := BatchUpdate(ctx, col, filter, 1000, updateItemTextFields)
	if err != nil {
		return fmt.Errorf("failed to apply batches: %w", err)
	}

	return nil
}

func updateItemTextFields(doc ItemDocumentForTextNormalization) (ItemDocumentForTextNormalization, error) {
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

	hasChanges := false

	for i, field := range doc.Fields {
		if !textFieldTypes[field.V.T] {
			continue
		}

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

		doc.Fields[i].V.V = normalizedValues
	}

	if hasChanges {
		fmt.Printf("Normalized text fields in item %s\n", doc.ItemID)
	}

	return doc, nil
}
