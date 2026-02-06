package main

import (
	"context"
	"os"
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/mongox/mongotest"
	"github.com/stretchr/testify/assert"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func TestTextNormalizationMigration(t *testing.T) {
	db := mongotest.Connect(t)(t)
	log.Infof("test: new db created with name: %v", db.Name())

	ctx := context.Background()
	assetCol := db.Collection("asset")
	itemCol := db.Collection("item")

	// Insert test assets with fullwidth characters
	asset1 := map[string]any{
		"id":       id.NewAssetID().String(),
		"filename": "Tokyo２０２４.jpg",
		"project":  id.NewProjectID().String(),
	}
	asset2 := map[string]any{
		"id":       id.NewAssetID().String(),
		"filename": "test.png",
		"project":  id.NewProjectID().String(),
	}

	_, err := assetCol.InsertMany(ctx, []any{asset1, asset2})
	assert.NoError(t, err)

	// Insert test items with fullwidth text in fields
	item1 := map[string]any{
		"id":      id.NewItemID().String(),
		"project": id.NewProjectID().String(),
		"model":   id.NewModelID().String(),
		"schema":  id.NewSchemaID().String(),
		"fields": []map[string]any{
			{
				"f": id.NewFieldID().String(),
				"v": map[string]any{
					"t": "text",
					"v": []any{"Ｔｏｋｙｏ２０２４"},
				},
			},
			{
				"f": id.NewFieldID().String(),
				"v": map[string]any{
					"t": "textArea",
					"v": []any{"test　file"},
				},
			},
		},
	}
	item2 := map[string]any{
		"id":      id.NewItemID().String(),
		"project": id.NewProjectID().String(),
		"model":   id.NewModelID().String(),
		"schema":  id.NewSchemaID().String(),
		"fields": []map[string]any{
			{
				"f": id.NewFieldID().String(),
				"v": map[string]any{
					"t": "number",
					"v": []any{123},
				},
			},
		},
	}

	_, err = itemCol.InsertMany(ctx, []any{item1, item2})
	assert.NoError(t, err)

	// Run the migration
	err = TextNormalizationMigration(ctx, os.Getenv("REEARTH_CMS_DB"), db.Name(), true)
	assert.NoError(t, err)

	// Verify asset normalization
	var asset1Updated map[string]any
	err = assetCol.FindOne(ctx, bson.M{"id": asset1["id"]}).Decode(&asset1Updated)
	assert.NoError(t, err)
	assert.Equal(t, "Tokyo2024.jpg", asset1Updated["filename"])

	var asset2Updated map[string]any
	err = assetCol.FindOne(ctx, bson.M{"id": asset2["id"]}).Decode(&asset2Updated)
	assert.NoError(t, err)
	assert.Equal(t, "test.png", asset2Updated["filename"])

	// Verify item text field normalization
	var item1Updated map[string]any
	err = itemCol.FindOne(ctx, bson.M{"id": item1["id"]}).Decode(&item1Updated)
	assert.NoError(t, err)

	fields := item1Updated["fields"].(primitive.A)
	assert.Len(t, fields, 2)

	field1 := fields[0].(map[string]any)
	field1Value := field1["v"].(map[string]any)
	field1Values := field1Value["v"].(primitive.A)
	assert.Equal(t, "Tokyo2024", field1Values[0])

	field2 := fields[1].(map[string]any)
	field2Value := field2["v"].(map[string]any)
	field2Values := field2Value["v"].(primitive.A)
	assert.Equal(t, "test file", field2Values[0])

	// Verify item without text fields is unchanged
	var item2Updated map[string]any
	err = itemCol.FindOne(ctx, bson.M{"id": item2["id"]}).Decode(&item2Updated)
	assert.NoError(t, err)

	fields2 := item2Updated["fields"].(primitive.A)
	assert.Len(t, fields2, 1)

	field := fields2[0].(map[string]any)
	fieldValue := field["v"].(map[string]any)
	assert.Equal(t, "number", fieldValue["t"])
}

func TestNormalizeAssetFilename(t *testing.T) {
	tests := []struct {
		name     string
		asset    AssetDocumentForNormalization
		want     bson.M
		shouldUp bool
	}{
		{
			name: "fullwidth to halfwidth",
			asset: AssetDocumentForNormalization{
				ID:       primitive.NewObjectID(),
				FileName: "Tokyo２０２４.jpg",
			},
			want:     bson.M{"filename": "Tokyo2024.jpg"},
			shouldUp: true,
		},
		{
			name: "already normalized",
			asset: AssetDocumentForNormalization{
				ID:       primitive.NewObjectID(),
				FileName: "test.png",
			},
			want:     nil,
			shouldUp: false,
		},
		{
			name: "fullwidth symbols",
			asset: AssetDocumentForNormalization{
				ID:       primitive.NewObjectID(),
				FileName: "ｆｉｌｅ．ｔｘｔ",
			},
			want:     bson.M{"filename": "file.txt"},
			shouldUp: true,
		},
		{
			name: "composed form (NFC) - ポール - already normalized",
			asset: AssetDocumentForNormalization{
				ID:       primitive.NewObjectID(),
				FileName: "\u30dd\u30fc\u30eb.jpg", // ポール composed form (already normalized)
			},
			want:     nil,
			shouldUp: false, // Already in correct form, no update needed
		},
		{
			name: "decomposed form (NFD) - ポール",
			asset: AssetDocumentForNormalization{
				ID:       primitive.NewObjectID(),
				FileName: "\u30db\u309a\u30fc\u30eb.jpg", // ポール decomposed form (visually identical)
			},
			want:     bson.M{"filename": "\u30dd\u30fc\u30eb.jpg"}, // Normalized to composed form
			shouldUp: true,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			got, shouldUpdate, err := updateAssetFilename(tt.asset)
			assert.NoError(t, err)
			assert.Equal(t, tt.shouldUp, shouldUpdate)
			assert.Equal(t, tt.want, got)
		})
	}
}

func TestNormalizeItemTextFields(t *testing.T) {
	tests := []struct {
		name     string
		item     ItemDocumentForTextNormalization
		want     bson.M
		shouldUp bool
	}{
		{
			name: "normalize text field",
			item: ItemDocumentForTextNormalization{
				ID:     primitive.NewObjectID(),
				ItemID: "item1",
				Fields: []struct {
					F string `bson:"f"`
					V struct {
						T string `bson:"t"`
						V []any  `bson:"v"`
					} `bson:"v"`
				}{
					{
						F: "field1",
						V: struct {
							T string `bson:"t"`
							V []any  `bson:"v"`
						}{
							T: "text",
							V: []any{"Tokyo２０２４"},
						},
					},
				},
			},
			want: bson.M{
				"fields": []bson.M{
					{
						"f": "field1",
						"v": bson.M{
							"t": "text",
							"v": []any{"Tokyo2024"},
						},
					},
				},
			},
			shouldUp: true,
		},
		{
			name: "composed form (NFC) - ポール - already normalized",
			item: ItemDocumentForTextNormalization{
				ID:     primitive.NewObjectID(),
				ItemID: "item_composed",
				Fields: []struct {
					F string `bson:"f"`
					V struct {
						T string `bson:"t"`
						V []any  `bson:"v"`
					} `bson:"v"`
				}{
					{
						F: "field1",
						V: struct {
							T string `bson:"t"`
							V []any  `bson:"v"`
						}{
							T: "text",
							V: []any{"\u30dd\u30fc\u30eb"}, // ポール composed form (already normalized)
						},
					},
				},
			},
			want:     nil,
			shouldUp: false, // Already in correct form, no update needed
		},
		{
			name: "decomposed form (NFD) - ポール",
			item: ItemDocumentForTextNormalization{
				ID:     primitive.NewObjectID(),
				ItemID: "item_decomposed",
				Fields: []struct {
					F string `bson:"f"`
					V struct {
						T string `bson:"t"`
						V []any  `bson:"v"`
					} `bson:"v"`
				}{
					{
						F: "field1",
						V: struct {
							T string `bson:"t"`
							V []any  `bson:"v"`
						}{
							T: "text",
							V: []any{"\u30db\u309a\u30fc\u30eb"}, // ポール decomposed form (visually identical)
						},
					},
				},
			},
			want: bson.M{
				"fields": []bson.M{
					{
						"f": "field1",
						"v": bson.M{
							"t": "text",
							"v": []any{"\u30dd\u30fc\u30eb"}, // Normalized to composed form
						},
					},
				},
			},
			shouldUp: true,
		},
		{
			name: "non-text field unchanged",
			item: ItemDocumentForTextNormalization{
				ID:     primitive.NewObjectID(),
				ItemID: "item2",
				Fields: []struct {
					F string `bson:"f"`
					V struct {
						T string `bson:"t"`
						V []any  `bson:"v"`
					} `bson:"v"`
				}{
					{
						F: "field1",
						V: struct {
							T string `bson:"t"`
							V []any  `bson:"v"`
						}{
							T: "number",
							V: []any{123},
						},
					},
				},
			},
			want:     nil,
			shouldUp: false,
		},
		{
			name: "mixed text and non-text fields",
			item: ItemDocumentForTextNormalization{
				ID:     primitive.NewObjectID(),
				ItemID: "item3",
				Fields: []struct {
					F string `bson:"f"`
					V struct {
						T string `bson:"t"`
						V []any  `bson:"v"`
					} `bson:"v"`
				}{
					{
						F: "field1",
						V: struct {
							T string `bson:"t"`
							V []any  `bson:"v"`
						}{
							T: "text",
							V: []any{"test　file"},
						},
					},
					{
						F: "field2",
						V: struct {
							T string `bson:"t"`
							V []any  `bson:"v"`
						}{
							T: "number",
							V: []any{456},
						},
					},
				},
			},
			want: bson.M{
				"fields": []bson.M{
					{
						"f": "field1",
						"v": bson.M{
							"t": "text",
							"v": []any{"test file"},
						},
					},
					{
						"f": "field2",
						"v": bson.M{
							"t": "number",
							"v": []any{456},
						},
					},
				},
			},
			shouldUp: true,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			got, shouldUpdate, err := updateItemTextFields(tt.item)
			assert.NoError(t, err)
			assert.Equal(t, tt.shouldUp, shouldUpdate)
			assert.Equal(t, tt.want, got)
		})
	}
}
