package mongogit

import (
	"context"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/mongox/mongotest"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/usecasex"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

func init() {
	mongotest.Env = "REEARTH_CMS_DB"
}

type Data struct {
	ID string
	A  string
	B  string
}

func TestCollection_FindOne(t *testing.T) {
	ctx := context.Background()
	col := initCollection[Data, struct{}](t)
	c := col.Client().Client()
	vx := version.New()

	_, _ = c.InsertOne(ctx, &Document[bson.M]{
		Version: vx,
		Refs:    []version.Ref{"latest", "aaa"},
		Data: bson.M{
			"a": "b",
		},
	})

	// latest
	consumer := &mongox.SliceConsumer[Data]{}
	assert.NoError(t, col.FindOne(ctx, bson.M{"a": "b"}, version.Eq(version.Latest.OrVersion()), consumer))
	assert.Equal(t, Data{
		A: "b",
	}, consumer.Result[0])

	// version
	consumer2 := &mongox.SliceConsumer[Data]{}
	assert.NoError(t, col.FindOne(ctx, bson.M{"a": "b"}, version.Eq(vx.OrRef()), consumer2))
	assert.Equal(t, Data{A: "b"}, consumer2.Result[0])

	// ref
	consumer3 := &mongox.SliceConsumer[Data]{}
	assert.NoError(t, col.FindOne(ctx, bson.M{"a": "b"}, version.Eq(version.Ref("aaa").OrVersion()), consumer3))
	assert.Equal(t, Data{A: "b"}, consumer3.Result[0])

	// not found
	consumer4 := &mongox.SliceConsumer[Data]{}
	assert.Equal(t, rerror.ErrNotFound, col.FindOne(ctx, bson.M{"a": "b"}, version.Eq(version.Ref("x").OrVersion()), consumer4))
	assert.Empty(t, consumer4.Result)
}

func TestCollection_Find(t *testing.T) {
	ctx := context.Background()
	col := initCollection[Data, struct{}](t)
	c := col.Client().Client()
	vx, vy := version.New(), version.New()

	_, _ = c.InsertMany(ctx, []any{
		&Document[bson.M]{
			Data: bson.M{
				"a": "b",
			},

			Version: vx,
		},
		&Document[bson.M]{
			Data: bson.M{
				"a": "b",
				"b": "c",
			},
			Version: vy,
			Parents: []version.Version{vx},
			Refs:    []version.Ref{"latest", "aaa"},
		},
		&Document[bson.M]{
			Data: bson.M{
				"a": "d",
				"b": "a",
			},
			Version: vy,
			Refs:    []version.Ref{"latest"},
		},
	})

	// all
	consumer0 := &mongox.SliceConsumer[Document[Data]]{}
	assert.NoError(t, col.Find(ctx, bson.M{"a": "b"}, version.All(), consumer0))
	assert.Equal(t, []Document[Data]{
		{
			Data:     Data{A: "b"},
			ObjectID: consumer0.Result[0].ObjectID,
			Version:  vx,
		},
		{
			Data:     Data{A: "b", B: "c"},
			ObjectID: consumer0.Result[1].ObjectID,
			Version:  vy,
			Parents:  []version.Version{vx},
			Refs:     []version.Ref{"latest", "aaa"},
		},
	}, consumer0.Result)

	// latest
	consumer1 := &mongox.SliceConsumer[Data]{}
	assert.NoError(t, col.Find(ctx, bson.M{}, version.Eq(version.Latest.OrVersion()), consumer1))
	assert.Equal(t, []Data{{A: "b", B: "c"}, {A: "d", B: "a"}}, consumer1.Result)

	// version
	consumer2 := &mongox.SliceConsumer[Data]{}
	assert.NoError(t, col.Find(ctx, bson.M{"a": "b"}, version.Eq(vx.OrRef()), consumer2))
	assert.Equal(t, []Data{{A: "b"}}, consumer2.Result)

	// ref
	consumer3 := &mongox.SliceConsumer[Data]{}
	assert.NoError(t, col.Find(ctx, bson.M{"a": "b"}, version.Eq(version.Ref("aaa").OrVersion()), consumer3))
	assert.Equal(t, []Data{{A: "b", B: "c"}}, consumer3.Result)

	// not found
	consumer4 := &mongox.SliceConsumer[Data]{}
	assert.NoError(t, col.Find(ctx, bson.M{"a": "c"}, version.Eq(version.Latest.OrVersion()), consumer4))
	assert.Empty(t, consumer4.Result)
}

func TestCollection_Count(t *testing.T) {
	ctx := context.Background()
	col := initCollection[Data, struct{}](t)
	c := col.Client().Client()
	vx, vy := version.New(), version.New()

	_, _ = c.InsertMany(ctx, []any{
		&Document[bson.M]{
			Data: bson.M{
				"a": "b",
			},

			Version: vx,
		},
		&Document[bson.M]{
			Data: bson.M{
				"a": "b",
				"b": "c",
			},
			Version: vy,
			Parents: []version.Version{vx},
			Refs:    []version.Ref{"latest", "aaa"},
		},
		&Document[bson.M]{
			Data: bson.M{
				"a": "d",
				"b": "a",
			},
			Version: vy,
			Refs:    []version.Ref{"latest"},
		},
	})

	// all
	count, err := col.Count(ctx, bson.M{"a": "b"}, version.All())
	assert.NoError(t, err)
	assert.Equal(t, int64(2), count)

	// version
	count, err = col.Count(ctx, bson.M{"a": "b"}, version.Eq(vx.OrRef()))
	assert.NoError(t, err)
	assert.Equal(t, int64(1), count)

	// ref
	count, err = col.Count(ctx, bson.M{"a": "b"}, version.Eq(version.Latest.OrVersion()))
	assert.NoError(t, err)
	assert.Equal(t, int64(1), count)

	// not found
	count, err = col.Count(ctx, bson.M{"a": "c"}, version.Eq(version.Latest.OrVersion()))
	assert.NoError(t, err)
	assert.Equal(t, int64(0), count)
}

func TestCollection_CountAggregation(t *testing.T) {
	ctx := context.Background()
	col := initCollection[Data, struct{}](t)
	c := col.Client().Client()
	vx, vy := version.New(), version.New()

	_, _ = c.InsertMany(ctx, []any{
		&Document[bson.M]{
			Data: bson.M{
				"a": "b",
			},
			Version: vx,
		},
		&Document[bson.M]{
			Data: bson.M{
				"a": "b",
				"b": "c",
			},
			Version: vy,
			Parents: []version.Version{vx},
			Refs:    []version.Ref{"latest", "aaa"},
		},
		&Document[bson.M]{
			Data: bson.M{
				"a": "d",
				"b": "a",
			},
			Version: vy,
			Refs:    []version.Ref{"latest"},
		},
	})

	// all
	count, err := col.CountAggregation(ctx, []any{bson.M{"$match": bson.M{"a": "b"}}}, version.All())
	assert.NoError(t, err)
	assert.Equal(t, int64(2), count)

	// version
	count, err = col.CountAggregation(ctx, []any{bson.M{"$match": bson.M{"a": "b"}}}, version.Eq(vx.OrRef()))
	assert.NoError(t, err)
	assert.Equal(t, int64(1), count)

	// ref
	count, err = col.CountAggregation(ctx, []any{bson.M{"$match": bson.M{"a": "b"}}}, version.Eq(version.Latest.OrVersion()))
	assert.NoError(t, err)
	assert.Equal(t, int64(1), count)

	// not found
	count, err = col.CountAggregation(ctx, []any{bson.M{"$match": bson.M{"a": "c"}}}, version.Eq(version.Latest.OrVersion()))
	assert.NoError(t, err)
	assert.Equal(t, int64(0), count)
}

func TestCollection_Paginate(t *testing.T) {
	ctx := context.Background()
	col := initCollection[Data, struct{}](t)
	c := col.Client().Client()
	vx, vy := version.New(), version.New()

	_, _ = c.InsertMany(ctx, []any{
		&Document[bson.M]{
			Data: bson.M{
				"id": "a",
				"a":  "a",
			},
			Version: vx,
		},
		&Document[bson.M]{
			Data: bson.M{
				"id": "a",
				"a":  "b",
			},
			Version: vy,
			Parents: []version.Version{vx},
			Refs:    []version.Ref{"latest", "aaa"},
		},
		&Document[bson.M]{
			Data: bson.M{
				"id": "b",
				"a":  "a",
			},
			Version: vy,
			Refs:    []version.Ref{"latest"},
		},
	})

	consumer := &mongox.SliceConsumer[Data]{}
	pi, err := col.Paginate(
		ctx,
		bson.M{},
		version.Eq(version.Latest.OrVersion()),
		nil,
		usecasex.CursorPagination{First: lo.ToPtr(int64(2))}.Wrap(),
		consumer,
	)
	assert.NoError(t, err)
	assert.Equal(t, usecasex.NewPageInfo(2, usecasex.Cursor("a").Ref(), usecasex.Cursor("b").Ref(), false, false), pi)
	assert.Equal(t, []Data{{ID: "a", A: "b"}, {ID: "b", A: "a"}}, consumer.Result)
}

func TestCollection_PaginateAggregation(t *testing.T) {
	ctx := context.Background()
	col := initCollection[Data, struct{}](t)
	c := col.Client().Client()
	vx, vy := version.New(), version.New()

	_, _ = c.InsertMany(ctx, []any{
		&Document[bson.M]{
			Data: bson.M{
				"id": "a",
				"a":  "a",
			},
			Version: vx,
		},
		&Document[bson.M]{
			Data: bson.M{
				"id": "a",
				"a":  "b",
			},
			Version: vy,
			Parents: []version.Version{vx},
			Refs:    []version.Ref{"latest", "aaa"},
		},
		&Document[bson.M]{
			Data: bson.M{
				"id": "b",
				"a":  "a",
			},
			Version: vy,
			Refs:    []version.Ref{"latest"},
		},
	})

	consumer := &mongox.SliceConsumer[Data]{}
	pi, err := col.PaginateAggregation(
		ctx,
		[]any{},
		version.Eq(version.Latest.OrVersion()),
		nil,
		usecasex.CursorPagination{First: lo.ToPtr(int64(2))}.Wrap(),
		consumer,
	)
	assert.NoError(t, err)
	assert.Equal(t, usecasex.NewPageInfo(2, usecasex.Cursor("a").Ref(), usecasex.Cursor("b").Ref(), false, false), pi)
	assert.Equal(t, []Data{{ID: "a", A: "b"}, {ID: "b", A: "a"}}, consumer.Result)
}

func TestCollection_Timestamp(t *testing.T) {
	ctx := context.Background()
	col := initCollection[Data, struct{}](t)
	c := col.Client().Client()
	vx, vy := version.New(), version.New()
	t1 := time.Date(2023, time.April, 1, 0, 0, 0, 0, time.Local).UTC()
	t2 := time.Date(2023, time.April, 2, 0, 0, 0, 0, time.Local).UTC()
	t3 := time.Date(2023, time.April, 3, 0, 0, 0, 0, time.Local).UTC()

	_, _ = c.InsertMany(ctx, []any{
		&Document[bson.M]{
			Data: bson.M{
				"a": "b",
			},
			ObjectID: primitive.NewObjectIDFromTimestamp(t1),
			Version:  vx,
		},
		&Document[bson.M]{
			Data: bson.M{
				"a": "b",
				"b": "c",
			},
			ObjectID: primitive.NewObjectIDFromTimestamp(t2),
			Version:  vy,
			Parents:  []version.Version{vx},
			Refs:     []version.Ref{"latest", "aaa"},
		},
		&Document[bson.M]{
			Data: bson.M{
				"a": "d",
				"b": "a",
			},
			ObjectID: primitive.NewObjectIDFromTimestamp(t3),
			Version:  vy,
			Refs:     []version.Ref{"latest"},
		},
	})

	// all
	res, err := col.Timestamp(ctx, bson.M{"a": "b"}, version.All())
	assert.NoError(t, err)
	assert.Equal(t, t2, res)

	// version
	res, err = col.Timestamp(ctx, bson.M{"a": "b"}, version.Eq(vx.OrRef()))
	assert.NoError(t, err)
	assert.Equal(t, t1, res)

	// ref
	res, err = col.Timestamp(ctx, bson.M{"a": "b"}, version.Eq(version.Latest.OrVersion()))
	assert.NoError(t, err)
	assert.Equal(t, t2, res)

	// not found
	res, err = col.Timestamp(ctx, bson.M{"a": "c"}, version.Eq(version.Latest.OrVersion()))
	assert.Equal(t, rerror.ErrNotFound, err)
	assert.Empty(t, res)
}

func TestCollection_SaveOne(t *testing.T) {
	ctx := context.Background()
	col := initCollection[Data, struct{}](t)
	c := col.Client().Client()

	var data Data

	// first
	assert.NoError(t, col.SaveOne(ctx, "x", Data{ID: "x", A: "aaa"}, nil))

	cur := c.FindOne(ctx, bson.M{"id": "x"})
	meta1 := Document[Data]{}
	assert.NoError(t, cur.Decode(&meta1))
	assert.Equal(t, Document[Data]{
		ObjectID: meta1.ObjectID,
		Version:  meta1.Version,
		Refs:     []version.Ref{version.Latest},
		Data:     Data{ID: "x", A: "aaa"},
	}, meta1)
	assert.NoError(t, cur.Decode(&data))
	assert.Equal(t, Data{ID: "x", A: "aaa"}, data)

	// next version
	assert.NoError(t, col.SaveOne(ctx, "x", Data{ID: "x", A: "bbb"}, version.Latest.OrVersion().Ref()))

	cur = c.FindOne(ctx, bson.M{"id": "x", refsKey: bson.M{"$in": []string{"latest"}}})
	meta2 := Document[Data]{}
	assert.NoError(t, cur.Decode(&meta2))
	assert.Equal(t, Document[Data]{
		ObjectID: meta2.ObjectID,
		Version:  meta2.Version,
		Parents:  []version.Version{meta1.Version},
		Refs:     []version.Ref{version.Latest},
		Data:     Data{ID: "x", A: "bbb"},
	}, meta2)
	data2 := Data{}
	assert.NoError(t, cur.Decode(&data2))
	assert.Equal(t, Data{ID: "x", A: "bbb"}, data2)

	cur = c.FindOne(ctx, bson.M{"id": "x", versionKey: meta1.Version})
	meta3 := Document[Data]{}
	assert.NoError(t, cur.Decode(&meta3))
	assert.Equal(t, Document[Data]{
		ObjectID: meta3.ObjectID,
		Version:  meta1.Version,
		Refs:     []version.Ref{}, // latest ref should be deleted
		Data:     Data{ID: "x", A: "aaa"},
	}, meta3)
	data3 := Data{}
	assert.NoError(t, cur.Decode(&data3))
	assert.Equal(t, Data{ID: "x", A: "aaa"}, data3)

	// set test ref to the first item
	_, _ = c.UpdateOne(ctx, bson.M{"id": "x", versionKey: meta1.Version}, bson.M{"$set": bson.M{refsKey: []version.Ref{"test"}}})
	assert.NoError(t, col.SaveOne(ctx, "x", Data{ID: "x", A: "ccc"}, version.Ref("test").OrVersion().Ref()))

	cur = c.FindOne(ctx, bson.M{"id": "x", refsKey: bson.M{"$in": []string{"test"}}})
	meta4 := Document[Data]{}
	assert.NoError(t, cur.Decode(&meta4))
	assert.Equal(t, Document[Data]{
		ObjectID: meta4.ObjectID,
		Version:  meta4.Version,
		Parents:  []version.Version{meta1.Version},
		Refs:     []version.Ref{"test"},
		Data:     Data{ID: "x", A: "ccc"},
	}, meta4)
	data4 := Data{}
	assert.NoError(t, cur.Decode(&data4))
	assert.Equal(t, Data{ID: "x", A: "ccc"}, data4)

	cur = c.FindOne(ctx, bson.M{"id": "x", versionKey: meta1.Version})
	meta5 := Document[Data]{}
	assert.NoError(t, cur.Decode(&meta5))
	assert.Equal(t, Document[Data]{
		ObjectID: meta5.ObjectID,
		Version:  meta1.Version,
		Refs:     []version.Ref{}, // test ref should be deleted
		Data:     Data{ID: "x", A: "aaa"},
	}, meta5)
	data5 := Data{}
	assert.NoError(t, cur.Decode(&data5))
	assert.Equal(t, Data{ID: "x", A: "aaa"}, data5)

	// nonexistent version
	assert.Same(t, rerror.ErrNotFound, col.SaveOne(ctx, "x", Data{}, version.New().OrRef().Ref()))
}

func TestCollection_UpdateRef(t *testing.T) {
	ctx := context.Background()
	col := initCollection[Data, struct{}](t)
	c := col.Client().Client()

	v1, v2, v3 := version.New(), version.New(), version.New()
	_, _ = c.InsertMany(ctx, []any{
		bson.M{"id": "x", versionKey: v1},
		bson.M{"id": "x", versionKey: v2},
		bson.M{"id": "y", versionKey: v3, refsKey: []string{"foo"}},
	})

	var meta Document[struct{}]

	// delete foo ref
	assert.NoError(t, col.UpdateRef(ctx, "y", "foo", nil))
	got := c.FindOne(ctx, bson.M{"id": "y", versionKey: v3})
	assert.NoError(t, got.Decode(&meta))
	assert.Equal(t, Document[struct{}]{ObjectID: meta.ObjectID, Version: v3, Refs: []version.Ref{}}, meta)
	assert.NoError(t, col.UpdateRef(ctx, "y", "bar", nil)) // non-existent ref

	// attach foo ref
	assert.NoError(t, col.UpdateRef(ctx, "x", "foo", v1.OrRef().Ref()))
	got = c.FindOne(ctx, bson.M{"id": "x", versionKey: v1})
	assert.NoError(t, got.Decode(&meta))
	assert.Equal(t, Document[struct{}]{ObjectID: meta.ObjectID, Version: v1, Refs: []version.Ref{"foo"}}, meta)

	// move foo ref
	assert.NoError(t, col.UpdateRef(ctx, "x", "foo", v2.OrRef().Ref()))
	got = c.FindOne(ctx, bson.M{"id": "x", versionKey: v1})
	assert.NoError(t, got.Decode(&meta))
	assert.Equal(t, Document[struct{}]{ObjectID: meta.ObjectID, Version: v1, Refs: []version.Ref{}}, meta)
	got = c.FindOne(ctx, bson.M{"id": "x", versionKey: v2})
	assert.NoError(t, got.Decode(&meta))
	assert.Equal(t, Document[struct{}]{ObjectID: meta.ObjectID, Version: v2, Refs: []version.Ref{"foo"}}, meta)
	got = c.FindOne(ctx, bson.M{"id": "y", versionKey: v3})
	assert.NoError(t, got.Decode(&meta))
	assert.Equal(t, Document[struct{}]{ObjectID: meta.ObjectID, Version: v3, Refs: []version.Ref{}}, meta)
}

func TestCollection_IsArchived(t *testing.T) {
	ctx := context.Background()
	col := initCollection[Data, struct{}](t)
	mc := col.metaColl.Client()

	_, _ = mc.InsertOne(ctx, bson.M{
		"id":        "xxx",
		archivedKey: true,
	})

	got, err := col.IsArchived(ctx, bson.M{"id": "xxx"})
	assert.NoError(t, err)
	assert.True(t, got)

	got, err = col.IsArchived(ctx, bson.M{"id": "yyy"})
	assert.NoError(t, err)
	assert.False(t, got)

	_, _ = mc.UpdateOne(ctx, bson.M{
		"id": "xxx",
	}, bson.M{
		"$unset": bson.M{
			archivedKey: "",
		},
	})

	got, err = col.IsArchived(ctx, bson.M{"id": "xxx"})
	assert.NoError(t, err)
	assert.False(t, got)
}

func TestCollection_ArchiveOne(t *testing.T) {
	ctx := context.Background()
	col := initCollection[Data, struct{}](t)
	mc := col.metaColl.Client()

	assert.NoError(t, col.ArchiveOne(ctx, bson.M{"id": "xxx"}, true))
	got := mc.FindOne(ctx, bson.M{"id": "xxx"})
	assert.Equal(t, mongo.ErrNoDocuments, got.Err())

	_, _ = mc.InsertOne(ctx, bson.M{
		"id":        "xxx",
		archivedKey: false,
	})

	assert.NoError(t, col.ArchiveOne(ctx, bson.M{"id": "xxx"}, true))
	got = mc.FindOne(ctx, bson.M{"id": "xxx"})
	var metadata bson.M
	assert.NoError(t, got.Decode(&metadata))
	assert.Equal(t, bson.M{
		objectIDKey: metadata["_id"],
		idKey:       "xxx",
		archivedKey: true,
	}, metadata)

	_, _ = mc.InsertOne(ctx, bson.M{
		"id":        "yyy",
		"a":         1,
		archivedKey: false,
	})

	assert.NoError(t, col.ArchiveOne(ctx, bson.M{"id": "yyy", "a": 1}, true))
	got = mc.FindOne(ctx, bson.M{"id": "yyy"})
	var metadata2 bson.M
	assert.NoError(t, got.Decode(&metadata2))
	assert.Equal(t, bson.M{
		objectIDKey: metadata2["_id"],
		idKey:       "yyy",
		archivedKey: true,
		"a":         int32(1),
	}, metadata2)

	assert.NoError(t, col.ArchiveOne(ctx, bson.M{"id": "xxx"}, false))
	got = mc.FindOne(ctx, bson.M{"id": "xxx"})
	assert.NoError(t, got.Decode(&metadata))
	assert.Equal(t, bson.M{
		objectIDKey: metadata["_id"],
		idKey:       "xxx",
		archivedKey: false,
	}, metadata)
}

func TestCollection_RemoveOne(t *testing.T) {
	ctx := context.Background()
	col := initCollection[Data, struct{}](t)
	c := col.dataColl.Client()
	mc := col.metaColl.Client()

	_, _ = c.InsertMany(ctx, []any{
		bson.M{"id": "xxx", "foo": "bar"},
		bson.M{"id": "yyy", "foo": "hoge"},
	})
	_, _ = mc.InsertMany(ctx, []any{
		bson.M{"id": "xxx"},
		bson.M{"id": "yyy"},
	})

	assert.NoError(t, col.RemoveOne(ctx, bson.M{"id": "xxx"}))
	got := c.FindOne(ctx, bson.M{"id": "xxx"})
	assert.Equal(t, mongo.ErrNoDocuments, got.Err())
	got = mc.FindOne(ctx, bson.M{"id": "xxx"})
	assert.Equal(t, mongo.ErrNoDocuments, got.Err())
	got = c.FindOne(ctx, bson.M{"id": "yyy"})
	var data bson.M
	assert.NoError(t, got.Decode(&data))
	assert.Equal(t, "hoge", data["foo"])
}

func TestCollection_Empty(t *testing.T) {
	ctx := context.Background()
	col := initCollection[Data, struct{}](t)
	c := col.Client().Client()

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
	col := initCollection[struct{}, struct{}](t)
	c := col.Client().Client()

	v1, v2, v3 := version.New(), version.New(), version.New()
	_, _ = c.InsertMany(ctx, []any{
		bson.M{"id": "x", versionKey: v1},
		bson.M{"id": "x", versionKey: v2, parentsKey: []version.Version{v1}, refsKey: []string{"latest"}},
	})

	got, err := col.meta(ctx, "x", v1.OrRef().Ref())
	assert.NoError(t, err)
	assert.Equal(t, &Document[struct{}]{
		ObjectID: got.ObjectID,
		Version:  v1,
	}, got)

	got, err = col.meta(ctx, "x", version.Latest.OrVersion().Ref())
	assert.NoError(t, err)
	assert.Equal(t, &Document[struct{}]{
		ObjectID: got.ObjectID,
		Version:  v2,
		Parents:  []version.Version{v1},
		Refs:     []version.Ref{"latest"},
	}, got)
	assert.Equal(t, got.ObjectID.Timestamp(), got.Timestamp())

	got, err = col.meta(ctx, "x", v3.OrRef().Ref())
	assert.Same(t, rerror.ErrNotFound, err)
	assert.Nil(t, got)

	got, err = col.meta(ctx, "x", version.Ref("a").OrVersion().Ref())
	assert.Same(t, rerror.ErrNotFound, err)
	assert.Nil(t, got)

	got, err = col.meta(ctx, "y", version.Latest.OrVersion().Ref())
	assert.NoError(t, err)
	assert.Nil(t, got)
}

func initCollection[T, MT any](t *testing.T) *Collection[T, MT] {
	t.Helper()
	c := mongotest.Connect(t)(t)
	client := mongox.NewClientWithDatabase(c)
	name := "test_" + uuid.NewString()
	return New[T, MT](client.Collection(name), client.Collection(name+"_meta"))
}
