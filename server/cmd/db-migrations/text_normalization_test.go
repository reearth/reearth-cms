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

	// Run the migration
	err = TextNormalizationMigration(ctx, os.Getenv("REEARTH_CMS_DB"), db.Name(), true)
	assert.NoError(t, err)

	// Verify asset normalization: filename stays original, filenamenormalized is populated
	var asset1Updated map[string]any
	err = assetCol.FindOne(ctx, bson.M{"id": asset1["id"]}).Decode(&asset1Updated)
	assert.NoError(t, err)
	assert.Equal(t, "Tokyo２０２４.jpg", asset1Updated["filename"])
	assert.Equal(t, "Tokyo2024.jpg", asset1Updated["filenamenormalized"])

	var asset2Updated map[string]any
	err = assetCol.FindOne(ctx, bson.M{"id": asset2["id"]}).Decode(&asset2Updated)
	assert.NoError(t, err)
	assert.Equal(t, "test.png", asset2Updated["filename"])
	assert.Equal(t, "test.png", asset2Updated["filenamenormalized"])
}

func TestNormalizeAssetFilename(t *testing.T) {
	tests := []struct {
		name     string
		asset    AssetDocumentForNormalization
		want     *AssetDocumentForNormalization
		shouldUp bool
	}{
		{
			name: "fullwidth to halfwidth",
			asset: AssetDocumentForNormalization{
				ID:       primitive.NewObjectID(),
				FileName: "Tokyo２０２４.jpg",
			},
			want:     &AssetDocumentForNormalization{FileNameNormalized: "Tokyo2024.jpg"},
			shouldUp: true,
		},
		{
			name: "already normalized",
			asset: AssetDocumentForNormalization{
				ID:       primitive.NewObjectID(),
				FileName: "test.png",
			},
			want:     &AssetDocumentForNormalization{FileNameNormalized: "test.png"},
			shouldUp: true,
		},
		{
			name: "fullwidth symbols",
			asset: AssetDocumentForNormalization{
				ID:       primitive.NewObjectID(),
				FileName: "ｆｉｌｅ．ｔｘｔ",
			},
			want:     &AssetDocumentForNormalization{FileNameNormalized: "file.txt"},
			shouldUp: true,
		},
		{
			name: "composed form (NFC) - ポール - already normalized",
			asset: AssetDocumentForNormalization{
				ID:       primitive.NewObjectID(),
				FileName: "\u30dd\u30fc\u30eb.jpg", // ポール composed form (already normalized)
			},
			want:     &AssetDocumentForNormalization{FileNameNormalized: "\u30dd\u30fc\u30eb.jpg"},
			shouldUp: true,
		},
		{
			name: "decomposed form (NFD) - ポール",
			asset: AssetDocumentForNormalization{
				ID:       primitive.NewObjectID(),
				FileName: "\u30db\u309a\u30fc\u30eb.jpg", // ポール decomposed form (visually identical)
			},
			want:     &AssetDocumentForNormalization{FileNameNormalized: "\u30dd\u30fc\u30eb.jpg"},
			shouldUp: true,
		},
		{
			name: "idempotent: filenamenormalized already correct",
			asset: AssetDocumentForNormalization{
				ID:                 primitive.NewObjectID(),
				FileName:           "Tokyo２０２４.jpg",
				FileNameNormalized: "Tokyo2024.jpg",
			},
			want:     nil,
			shouldUp: false,
		},
		{
			name: "idempotent: filenamenormalized already correct for NFD",
			asset: AssetDocumentForNormalization{
				ID:                 primitive.NewObjectID(),
				FileName:           "\u30db\u309a\u30fc\u30eb.jpg",
				FileNameNormalized: "\u30dd\u30fc\u30eb.jpg",
			},
			want:     nil,
			shouldUp: false,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			got, err := updateAssetFilename(tt.asset)
			assert.NoError(t, err)
			assert.Equal(t, tt.shouldUp, got != nil)
			assert.Equal(t, tt.want, got)
		})
	}
}
