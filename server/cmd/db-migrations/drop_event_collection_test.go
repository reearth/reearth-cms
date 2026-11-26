package main

import (
	"context"
	"os"
	"testing"

	"github.com/reearth/reearthx/mongox/mongotest"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"go.mongodb.org/mongo-driver/bson"
)

func TestDropEventCollection(t *testing.T) {
	tests := []struct {
		name          string
		wetRun        bool
		wantCollNames []string
	}{
		{name: "dry run keeps the collection", wetRun: false, wantCollNames: []string{eventCollection, "item"}},
		{name: "wet run drops the collection", wetRun: true, wantCollNames: []string{"item"}},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Arrange
			db := mongotest.Connect(t)(t)
			ctx := context.Background()
			_, err := db.Collection(eventCollection).InsertOne(ctx, bson.M{"id": "ev1", "type": "item.create"})
			require.NoError(t, err)
			_, err = db.Collection("item").InsertOne(ctx, bson.M{"id": "item1"})
			require.NoError(t, err)

			// Act
			err = DropEventCollection(ctx, os.Getenv("REEARTH_CMS_DB"), db.Name(), tt.wetRun)

			// Assert
			require.NoError(t, err)
			names, err := db.ListCollectionNames(ctx, bson.M{})
			require.NoError(t, err)
			assert.ElementsMatch(t, tt.wantCollNames, names)
		})
	}
}

func TestDropEventCollection_NoCollection(t *testing.T) {
	db := mongotest.Connect(t)(t)

	err := DropEventCollection(context.Background(), os.Getenv("REEARTH_CMS_DB"), db.Name(), true)

	assert.NoError(t, err)
}
