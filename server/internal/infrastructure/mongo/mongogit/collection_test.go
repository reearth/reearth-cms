package mongogit

import (
	"context"
	"testing"

	"github.com/google/uuid"
	"github.com/reearth/reearth-cms/server/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearth-cms/server/internal/infrastructure/mongo/mongotest"
	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/reearth/reearthx/rerror"
	"github.com/stretchr/testify/assert"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

func TestCollection_FindOne(t *testing.T) {
	ctx := context.Background()
	col := initCollection(t)
	c := col.Client().Collection()
	vx := version.New()

	type d struct {
		A string
	}

	_, _ = c.InsertOne(ctx, &Document[bson.M]{
		Data: bson.M{
			"a": "b",
		},
		Meta: Meta{
			Version: vx,
			Refs:    []version.Ref{"latest", "aaa"},
		},
	})

	// nil query (latest ref)
	consumer := &mongodoc.SliceConsumer[d]{}
	assert.NoError(t, col.FindOne(ctx, bson.M{"a": "b"}, nil, consumer))
	assert.Equal(t, d{
		A: "b",
	}, consumer.Result[0])

	// version
	consumer2 := &mongodoc.SliceConsumer[d]{}
	assert.NoError(t, col.FindOne(ctx, bson.M{"a": "b"}, vx.OrRef().Ref(), consumer2))
	assert.Equal(t, d{A: "b"}, consumer2.Result[0])

	// ref
	consumer3 := &mongodoc.SliceConsumer[d]{}
	assert.NoError(t, col.FindOne(ctx, bson.M{"a": "b"}, version.Ref("aaa").OrVersion().Ref(), consumer3))
	assert.Equal(t, d{A: "b"}, consumer3.Result[0])

	// not found
	consumer4 := &mongodoc.SliceConsumer[d]{}
	assert.Equal(t, rerror.ErrNotFound, col.FindOne(ctx, bson.M{"a": "b"}, version.Ref("x").OrVersion().Ref(), consumer4))
	assert.Empty(t, consumer4.Result)
}

// func TestCollection_Find(t *testing.T) {
// 	ctx := context.Background()
// 	col := initCollection(t)
// 	c := col.Client().Collection()

// }

// func TestCollection_Paginate(t *testing.T) {
// 	ctx := context.Background()
// 	col := initCollection(t)
// 	c := col.Client().Collection()

// }

func TestCollection_SaveOne(t *testing.T) {
	ctx := context.Background()
	col := initCollection(t)
	c := col.Client().Collection()

	type Data struct {
		ID string
		A  string
	}
	var data Data

	// first
	assert.NoError(t, col.SaveOne(ctx, "x", Data{ID: "x", A: "aaa"}, nil))

	cur := c.FindOne(ctx, bson.M{"id": "x"})
	meta1 := Meta{}
	assert.NoError(t, cur.Decode(&meta1))
	assert.Equal(t, Meta{
		Version: meta1.Version,
		Refs:    []version.Ref{version.Latest},
	}, meta1)
	assert.NoError(t, cur.Decode(&data))
	assert.Equal(t, Data{ID: "x", A: "aaa"}, data)

	// next version
	assert.NoError(t, col.SaveOne(ctx, "x", Data{ID: "x", A: "bbb"}, version.Latest.OrVersion().Ref()))

	cur = c.FindOne(ctx, bson.M{"id": "x", refsKey: bson.M{"$in": []string{"latest"}}})
	meta2 := Meta{}
	assert.NoError(t, cur.Decode(&meta2))
	assert.Equal(t, Meta{
		Version: meta2.Version,
		Parents: []version.Version{meta1.Version},
		Refs:    []version.Ref{version.Latest},
	}, meta2)
	data2 := Data{}
	assert.NoError(t, cur.Decode(&data2))
	assert.Equal(t, Data{ID: "x", A: "bbb"}, data2)

	cur = c.FindOne(ctx, bson.M{"id": "x", versionKey: meta1.Version})
	meta3 := Meta{}
	assert.NoError(t, cur.Decode(&meta3))
	assert.Equal(t, Meta{
		Version: meta1.Version,
		Refs:    []version.Ref{}, // latest ref should be deleted
	}, meta3)
	data3 := Data{}
	assert.NoError(t, cur.Decode(&data3))
	assert.Equal(t, Data{ID: "x", A: "aaa"}, data3)

	// set test ref to the first item
	_, _ = c.UpdateOne(ctx, bson.M{"id": "x", versionKey: meta1.Version}, bson.M{"$set": bson.M{refsKey: []version.Ref{"test"}}})
	assert.NoError(t, col.SaveOne(ctx, "x", Data{ID: "x", A: "ccc"}, version.Ref("test").OrVersion().Ref()))

	cur = c.FindOne(ctx, bson.M{"id": "x", refsKey: bson.M{"$in": []string{"test"}}})
	meta4 := Meta{}
	assert.NoError(t, cur.Decode(&meta4))
	assert.Equal(t, Meta{
		Version: meta4.Version,
		Parents: []version.Version{meta1.Version},
		Refs:    []version.Ref{"test"},
	}, meta4)
	data4 := Data{}
	assert.NoError(t, cur.Decode(&data4))
	assert.Equal(t, Data{ID: "x", A: "ccc"}, data4)

	cur = c.FindOne(ctx, bson.M{"id": "x", versionKey: meta1.Version})
	meta5 := Meta{}
	assert.NoError(t, cur.Decode(&meta5))
	assert.Equal(t, Meta{
		Version: meta1.Version,
		Refs:    []version.Ref{}, // test ref should be deleted
	}, meta5)
	data5 := Data{}
	assert.NoError(t, cur.Decode(&data5))
	assert.Equal(t, Data{ID: "x", A: "aaa"}, data5)

	// nonexistent version
	assert.Same(t, rerror.ErrNotFound, col.SaveOne(ctx, "x", Data{}, version.New().OrRef().Ref()))
}

func TestCollection_UpdateRef(t *testing.T) {
	ctx := context.Background()
	col := initCollection(t)
	c := col.Client().Collection()

	v1, v2, v3 := version.New(), version.New(), version.New()
	_, _ = c.InsertMany(ctx, []any{
		bson.M{"id": "x", versionKey: v1},
		bson.M{"id": "x", versionKey: v2},
		bson.M{"id": "y", versionKey: v3, refsKey: []string{"foo"}},
	})

	var meta Meta

	// delete foo ref
	assert.NoError(t, col.UpdateRef(ctx, "y", "foo", nil))
	got := c.FindOne(ctx, bson.M{"id": "y", versionKey: v3})
	assert.NoError(t, got.Decode(&meta))
	assert.Equal(t, Meta{Version: v3, Refs: []version.Ref{}}, meta)

	// attach foo ref
	assert.NoError(t, col.UpdateRef(ctx, "x", "foo", v1.OrRef().Ref()))
	got = c.FindOne(ctx, bson.M{"id": "x", versionKey: v1})
	assert.NoError(t, got.Decode(&meta))
	assert.Equal(t, Meta{Version: v1, Refs: []version.Ref{"foo"}}, meta)

	// move foo ref
	assert.NoError(t, col.UpdateRef(ctx, "x", "foo", v2.OrRef().Ref()))
	got = c.FindOne(ctx, bson.M{"id": "x", versionKey: v1})
	assert.NoError(t, got.Decode(&meta))
	assert.Equal(t, Meta{Version: v1, Refs: []version.Ref{}}, meta)
	got = c.FindOne(ctx, bson.M{"id": "x", versionKey: v2})
	assert.NoError(t, got.Decode(&meta))
	assert.Equal(t, Meta{Version: v2, Refs: []version.Ref{"foo"}}, meta)
	got = c.FindOne(ctx, bson.M{"id": "y", versionKey: v3})
	assert.NoError(t, got.Decode(&meta))
	assert.Equal(t, Meta{Version: v3, Refs: []version.Ref{}}, meta)
}

func TestCollection_IsArchived(t *testing.T) {
	ctx := context.Background()
	col := initCollection(t)
	c := col.Client().Collection()

	_, _ = c.InsertOne(ctx, bson.M{
		"id":       "xxx",
		metaKey:    true,
		"archived": true,
	})

	got, err := col.IsArchived(ctx, "xxx")
	assert.NoError(t, err)
	assert.True(t, got)

	got, err = col.IsArchived(ctx, "yyy")
	assert.NoError(t, err)
	assert.False(t, got)

	_, _ = c.UpdateOne(ctx, bson.M{
		"id":    "xxx",
		metaKey: true,
	}, bson.M{
		"$unset": bson.M{
			"archived": "",
		},
	})

	got, err = col.IsArchived(ctx, "xxx")
	assert.NoError(t, err)
	assert.False(t, got)
}

func TestCollection_ArchiveOne(t *testing.T) {
	ctx := context.Background()
	col := initCollection(t)
	c := col.Client().Collection()
	var metadata MetadataDocument

	assert.NoError(t, col.ArchiveOne(ctx, "xxx", false))
	got := c.FindOne(ctx, bson.M{"id": "xxx", metaKey: true})
	assert.Equal(t, mongo.ErrNoDocuments, got.Err())

	assert.NoError(t, col.ArchiveOne(ctx, "xxx", true))
	got = c.FindOne(ctx, bson.M{"id": "xxx", metaKey: true})
	assert.NoError(t, got.Decode(&metadata))
	assert.Equal(t, MetadataDocument{
		ID:       "xxx",
		Meta:     true,
		Archived: true,
	}, metadata)

	assert.NoError(t, col.ArchiveOne(ctx, "yyy", true))
	got = c.FindOne(ctx, bson.M{"id": "yyy", metaKey: true})
	assert.NoError(t, got.Decode(&metadata))
	assert.Equal(t, MetadataDocument{
		ID:       "yyy",
		Meta:     true,
		Archived: true,
	}, metadata)

	assert.NoError(t, col.ArchiveOne(ctx, "xxx", false))
	got = c.FindOne(ctx, bson.M{"id": "xxx", metaKey: true})
	assert.Equal(t, mongo.ErrNoDocuments, got.Err())
}

func TestCollection_RemoveOne(t *testing.T) {
	ctx := context.Background()
	col := initCollection(t)
	c := col.Client().Collection()

	_, _ = c.InsertMany(ctx, []any{
		bson.M{"id": "xxx", metaKey: true},
		bson.M{"id": "xxx", "foo": "bar"},
		bson.M{"id": "yyy", "foo": "hoge"},
	})

	assert.NoError(t, col.RemoveOne(ctx, "xxx"))
	got := c.FindOne(ctx, bson.M{"id": "xxx", metaKey: true})
	assert.Equal(t, mongo.ErrNoDocuments, got.Err())
	got = c.FindOne(ctx, bson.M{"id": "xxx"})
	assert.Equal(t, mongo.ErrNoDocuments, got.Err())
	got = c.FindOne(ctx, bson.M{"id": "yyy"})
	var data bson.M
	assert.NoError(t, got.Decode(&data))
	assert.Equal(t, "hoge", data["foo"])
}

func TestCollection_Empty(t *testing.T) {
	ctx := context.Background()
	col := initCollection(t)
	c := col.Client().Collection()

	_, _ = c.InsertMany(ctx, []any{
		bson.M{"id": "xxx", metaKey: true},
		bson.M{"id": "xxx", "foo": "bar"},
		bson.M{"id": "yyy", "foo": "hoge"},
	})

	got, err := c.CountDocuments(ctx, bson.M{})
	assert.NoError(t, err)
	assert.Equal(t, int64(3), got)

	assert.NoError(t, col.Empty(ctx))

	got, err = c.CountDocuments(ctx, bson.M{})
	assert.NoError(t, err)
	assert.Equal(t, int64(0), got)
}

func TestCollection_Meta(t *testing.T) {
	ctx := context.Background()
	col := initCollection(t)
	c := col.Client().Collection()

	v1, v2, v3 := version.New(), version.New(), version.New()
	_, _ = c.InsertMany(ctx, []any{
		bson.M{"id": "x", versionKey: v1},
		bson.M{"id": "x", versionKey: v2, parentsKey: []version.Version{v1}, refsKey: []string{"latest"}},
	})

	got, err := col.meta(ctx, "x", v1.OrRef().Ref())
	assert.NoError(t, err)
	assert.Equal(t, &Meta{Version: v1}, got)

	got, err = col.meta(ctx, "x", version.Latest.OrVersion().Ref())
	assert.NoError(t, err)
	assert.Equal(t, &Meta{
		Version: v2,
		Parents: []version.Version{v1},
		Refs:    []version.Ref{"latest"},
	}, got)

	got, err = col.meta(ctx, "x", v3.OrRef().Ref())
	assert.Same(t, rerror.ErrNotFound, err)
	assert.Nil(t, got)

	got, err = col.meta(ctx, "x", version.Ref("a").OrVersion().Ref())
	assert.Same(t, rerror.ErrNotFound, err)
	assert.Nil(t, got)

	got, err = col.meta(ctx, "y", version.Latest.OrVersion().Ref())
	assert.Nil(t, err)
	assert.Nil(t, got)
}

func initCollection(t *testing.T) *Collection {
	t.Helper()
	c := mongotest.Connect(t)(t)
	return NewCollection(mongodoc.NewClientWithDatabase(c).WithCollection("test_" + uuid.NewString()))
}
