package main

import (
	"context"
	"testing"

	"github.com/reearth/reearthx/mongox/mongotest"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

func TestMetadataItemThreads(t *testing.T) {
	seed := func(t *testing.T, db *mongo.Database) {
		t.Helper()
		ctx := context.Background()
		_, err := db.Collection("item").InsertMany(ctx, []any{
			// metadata item: thread on latest version, another one on an older version
			bson.M{"id": "m1", "project": "p1", "ismetadata": true, "thread": "t1", "__r": bson.A{"latest"}},
			bson.M{"id": "m1", "project": "p1", "ismetadata": true, "thread": "t0", "__r": bson.A{}},
			// metadata item whose thread document is already gone
			bson.M{"id": "m2", "project": "p1", "ismetadata": true, "thread": "t2", "__r": bson.A{"latest"}},
			// metadata item pointing to a thread an asset also uses
			bson.M{"id": "m3", "project": "p2", "ismetadata": true, "thread": "ts", "__r": bson.A{"latest"}},
			// metadata item without a thread, and a normal item with one
			bson.M{"id": "m4", "project": "p1", "ismetadata": true, "thread": nil, "__r": bson.A{"latest"}},
			bson.M{"id": "i1", "project": "p1", "ismetadata": false, "thread": "ti", "__r": bson.A{"latest"}},
		})
		require.NoError(t, err)
		_, err = db.Collection("thread").InsertMany(ctx, []any{
			bson.M{"id": "t0", "workspace": "w1", "comments": bson.A{bson.M{"id": "c0"}}},
			bson.M{"id": "t1", "workspace": "w1", "comments": bson.A{bson.M{"id": "c1"}, bson.M{"id": "c2"}}},
			bson.M{"id": "ts", "workspace": "w2", "comments": bson.A{}},
			bson.M{"id": "ti", "workspace": "w1", "comments": bson.A{bson.M{"id": "c3"}}},
		})
		require.NoError(t, err)
		_, err = db.Collection("asset").InsertOne(ctx, bson.M{"id": "a1", "thread": "ts"})
		require.NoError(t, err)
	}

	threadIDs := func(t *testing.T, db *mongo.Database) []string {
		t.Helper()
		vals, err := db.Collection("thread").Distinct(context.Background(), "id", bson.M{})
		require.NoError(t, err)
		res := make([]string, 0, len(vals))
		for _, v := range vals {
			res = append(res, v.(string))
		}
		return res
	}

	itemThreads := func(t *testing.T, db *mongo.Database) int64 {
		t.Helper()
		n, err := db.Collection("item").CountDocuments(context.Background(), bson.M{"thread": bson.M{"$type": "string"}})
		require.NoError(t, err)
		return n
	}

	tests := []struct {
		name            string
		wetRun          bool
		wantThreads     []string
		wantItemThreads int64
		wantUnset       []string // item ids whose versions must have no thread field
	}{
		{
			name:            "dry run changes nothing",
			wetRun:          false,
			wantThreads:     []string{"t0", "t1", "ti", "ts"},
			wantItemThreads: 5,
		},
		{
			name:            "wet run deletes metadata threads and unsets references",
			wetRun:          true,
			wantThreads:     []string{"ti", "ts"},
			wantItemThreads: 2, // m3 (shared, skipped) and i1
			wantUnset:       []string{"m1", "m2"},
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			db := mongotest.Connect(t)(t)
			seed(t, db)

			require.NoError(t, metadataItemThreads(context.Background(), db, tc.wetRun))

			assert.ElementsMatch(t, tc.wantThreads, threadIDs(t, db))
			assert.Equal(t, tc.wantItemThreads, itemThreads(t, db))
			for _, id := range tc.wantUnset {
				n, err := db.Collection("item").CountDocuments(context.Background(), bson.M{"id": id, "thread": bson.M{"$exists": true}})
				require.NoError(t, err)
				assert.Zero(t, n, id)
			}
		})
	}
}
