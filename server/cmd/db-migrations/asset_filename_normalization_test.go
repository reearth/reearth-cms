package main

import (
	"context"
	"os"
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/mongox/mongotest"
	"github.com/stretchr/testify/assert"
	"go.mongodb.org/mongo-driver/bson"
)

func TestAssetFileNameNormalizationMigration(t *testing.T) {
	tests := []struct {
		name                 string
		originalFileName     string
		expectedFileName     string
		shouldBeModified     bool
	}{
		{
			name:             "Fullwidth to halfwidth",
			originalFileName: "ｆｉｌｅ．ｔｘｔ",
			expectedFileName: "file.txt",
			shouldBeModified: true,
		},
		{
			name:             "Fullwidth digits",
			originalFileName: "document２０２４.pdf",
			expectedFileName: "document2024.pdf",
			shouldBeModified: true,
		},
		{
			name:             "Japanese with fullwidth space",
			originalFileName: "ファイル　名.txt",
			expectedFileName: "ファイル 名.txt",
			shouldBeModified: true,
		},
		{
			name:             "Already normalized ASCII",
			originalFileName: "normal-file.txt",
			expectedFileName: "normal-file.txt",
			shouldBeModified: false,
		},
		{
			name:             "Fullwidth parentheses",
			originalFileName: "file（１）.zip",
			expectedFileName: "file(1).zip",
			shouldBeModified: true,
		},
	}

	db := mongotest.Connect(t)(t)
	log.Infof("test: new db created with name: %v", db.Name())

	ctx := context.Background()
	col := db.Collection("asset")

	// Insert test assets
	var testAssets []interface{}
	for _, tt := range tests {
		testAssets = append(testAssets, bson.M{
			"id":       tt.name,
			"filename": tt.originalFileName,
			"project":  "test-project",
		})
	}

	_, err := col.InsertMany(ctx, testAssets)
	assert.NoError(t, err)

	// Verify count before migration
	countBefore, err := col.CountDocuments(ctx, bson.M{})
	assert.NoError(t, err)
	assert.Equal(t, len(tests), int(countBefore))

	// Run the migration
	err = AssetFileNameNormalizationMigration(ctx, os.Getenv("REEARTH_CMS_DB"), db.Name(), true)
	assert.NoError(t, err)

	// Verify each asset was updated correctly
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			var result bson.M
			err := col.FindOne(ctx, bson.M{"id": tt.name}).Decode(&result)
			assert.NoError(t, err)

			actualFileName := result["filename"].(string)
			assert.Equal(t, tt.expectedFileName, actualFileName,
				"Expected filename '%s' to be normalized to '%s', got '%s'",
				tt.originalFileName, tt.expectedFileName, actualFileName)
			assert.Equal(t, asset.NormalizeFileName(tt.originalFileName), actualFileName)
		})
	}

	// Verify no documents were added or removed
	countAfter, err := col.CountDocuments(ctx, bson.M{})
	assert.NoError(t, err)
	assert.Equal(t, countBefore, countAfter)
}
