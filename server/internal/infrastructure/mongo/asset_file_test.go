package mongo

import (
	"context"
	"fmt"
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/mongox/mongotest"
	"github.com/reearth/reearthx/rerror"
	"github.com/stretchr/testify/assert"
	"go.mongodb.org/mongo-driver/bson"
)

func TestAssetFileRepo_FindByID(t *testing.T) {
	aid := asset.NewID()

	tests := []struct {
		name    string
		seeds   map[asset.ID]*asset.File
		arg     id.AssetID
		want    *asset.File
		wantErr error
	}{
		{
			name:    "Not found in empty db",
			seeds:   nil,
			arg:     id.NewAssetID(),
			want:    nil,
			wantErr: rerror.ErrNotFound,
		},
		{
			name: "Not found",
			seeds: map[asset.ID]*asset.File{
				asset.NewID(): asset.NewFile().Name("aaa.txt").Path("/aaa.txt").Size(100).Build(),
			},
			arg:     id.NewAssetID(),
			want:    nil,
			wantErr: rerror.ErrNotFound,
		},
		{
			name:    "Empty",
			seeds:   nil,
			arg:     aid,
			want:    nil,
			wantErr: rerror.ErrNotFound,
		},
		{
			name: "Found 1",
			seeds: map[asset.ID]*asset.File{
				aid:           asset.NewFile().Name("aaa.txt").Path("/aaa.txt").Size(100).Build(),
				asset.NewID(): asset.NewFile().Name("aaa.txt").Path("/aaa.txt").Size(100).Build(),
			},
			arg:     aid,
			want:    asset.NewFile().Name("aaa.txt").Path("/aaa.txt").Size(100).Build(),
			wantErr: nil,
		},
	}

	initDB := mongotest.Connect(t)

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			db := initDB(t)
			ctx := context.Background()
			_, _ = db.Collection("asset").InsertOne(ctx, bson.M{
				"id":   aid.String(),
				"hoge": "bar",
			})
			client := mongox.NewClientWithDatabase(db)

			r := NewAssetFile(client)
			for id, a := range tc.seeds {
				err := r.Save(ctx, id, a)
				assert.NoError(t, err)
			}

			got, err := r.FindByID(ctx, tc.arg)
			if tc.wantErr != nil {
				assert.ErrorIs(t, err, tc.wantErr)
				return
			} else {
				assert.NoError(t, err)
			}
			assert.Equal(t, tc.want, got)

			c, _ := db.Collection("asset").CountDocuments(ctx, bson.M{"id": aid.String(), "hoge": "bar"})
			assert.Equal(t, int64(1), c)
		})
	}
}

func TestAssetFileRepo_SaveFlat(t *testing.T) {
	initDB := mongotest.Connect(t)

	t.Run("saves and round-trips files across multiple pages and bulk-write batches", func(t *testing.T) {
		t.Parallel()

		db := initDB(t)
		ctx := context.Background()
		client := mongox.NewClientWithDatabase(db)
		r := NewAssetFile(client)

		aid := id.NewAssetID()
		_, err := db.Collection("asset").InsertOne(ctx, bson.M{"id": aid.String()})
		assert.NoError(t, err)

		parent := asset.NewFile().Name("root").Path("/").Build()
		assert.NoError(t, r.Save(ctx, aid, parent))

		// assetFilesPageSize is 1000 and assetFilesBulkWriteBatchSize is 100 pages
		// per BulkWrite; use enough files to span multiple pages within one batch.
		const total = 2500
		files := make([]*asset.File, total)
		for i := range total {
			name := fmt.Sprintf("f%d.txt", i)
			files[i] = asset.NewFile().Name(name).Path(name).Size(1).Build()
		}

		assert.NoError(t, r.SaveFlat(ctx, aid, parent, files))

		got, err := r.FindByID(ctx, aid)
		assert.NoError(t, err)
		assert.Len(t, got.Files(), total)

		seen := make(map[string]bool, total)
		for _, f := range got.Files() {
			assert.False(t, seen[f.Path()], "duplicate file: %s", f.Path())
			seen[f.Path()] = true
		}
		assert.Len(t, seen, total)
	})

	t.Run("overwrites previously saved files", func(t *testing.T) {
		t.Parallel()

		db := initDB(t)
		ctx := context.Background()
		client := mongox.NewClientWithDatabase(db)
		r := NewAssetFile(client)

		aid := id.NewAssetID()
		_, err := db.Collection("asset").InsertOne(ctx, bson.M{"id": aid.String()})
		assert.NoError(t, err)

		parent := asset.NewFile().Name("root").Path("/").Build()
		assert.NoError(t, r.Save(ctx, aid, parent))

		first := []*asset.File{asset.NewFile().Name("old.txt").Path("old.txt").Size(1).Build()}
		assert.NoError(t, r.SaveFlat(ctx, aid, parent, first))

		second := []*asset.File{asset.NewFile().Name("new.txt").Path("new.txt").Size(1).Build()}
		assert.NoError(t, r.SaveFlat(ctx, aid, parent, second))

		got, err := r.FindByID(ctx, aid)
		assert.NoError(t, err)
		assert.Len(t, got.Files(), 1)
		assert.Equal(t, "/new.txt", got.Files()[0].Path())
	})
}
