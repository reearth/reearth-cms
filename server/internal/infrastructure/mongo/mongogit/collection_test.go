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

func (d Data) IDString() string {
	return d.ID
}

type MetaData struct {
	ID string
	C  string
	D  string
}

func (m MetaData) IDString() string {
	return m.ID
}

func TestCollection_FindOne(t *testing.T) {
	ctx := context.Background()
	col := initCollection[Data, MetaData](t)
	vx1, _, _, _ := seed(t, col, ctx)

	// latest
	consumer, metaConsumer := &mongox.SliceConsumer[Data]{}, &mongox.SliceConsumer[MetaData]{}
	assert.NoError(t, col.FindOne(ctx, bson.M{"a": "xa"}, nil, version.Eq(version.Latest.OrVersion()), consumer, metaConsumer))
	assert.Equal(t, Data{ID: "xxx", A: "xa", B: "xb"}, consumer.Result[0])
	assert.Equal(t, MetaData{ID: "xxx", C: "mx"}, metaConsumer.Result[0])

	// version
	consumer, metaConsumer = &mongox.SliceConsumer[Data]{}, &mongox.SliceConsumer[MetaData]{}
	assert.NoError(t, col.FindOne(ctx, bson.M{"a": "xa"}, nil, version.Eq(vx1.OrRef()), consumer, metaConsumer))
	assert.Equal(t, Data{ID: "xxx", A: "xa"}, consumer.Result[0])

	// ref
	consumer, metaConsumer = &mongox.SliceConsumer[Data]{}, &mongox.SliceConsumer[MetaData]{}
	assert.NoError(t, col.FindOne(ctx, bson.M{"a": "xa"}, nil, version.Eq(version.Ref("aaa").OrVersion()), consumer, metaConsumer))
	assert.Equal(t, Data{ID: "xxx", A: "xa", B: "xb"}, consumer.Result[0])

	// meta filter
	consumer, metaConsumer = &mongox.SliceConsumer[Data]{}, &mongox.SliceConsumer[MetaData]{}
	assert.NoError(t, col.FindOne(ctx, nil, bson.M{"c": "mx"}, version.Eq(version.Latest.OrVersion()), consumer, metaConsumer))
	assert.Equal(t, Data{ID: "xxx", A: "xa", B: "xb"}, consumer.Result[0])

	// not found
	consumer, metaConsumer = &mongox.SliceConsumer[Data]{}, &mongox.SliceConsumer[MetaData]{}
	assert.Equal(t, rerror.ErrNotFound, col.FindOne(ctx, bson.M{"a": "c"}, nil, version.Eq(version.Ref("x").OrVersion()), consumer, metaConsumer))
	assert.Empty(t, consumer.Result)

	// archived
	consumer, metaConsumer = &mongox.SliceConsumer[Data]{}, &mongox.SliceConsumer[MetaData]{}
	assert.Equal(t, rerror.ErrNotFound, col.FindOne(ctx, bson.M{idKey: "zzz"}, nil, version.Eq(version.Latest.OrVersion()), consumer, metaConsumer))
	assert.Empty(t, consumer.Result)
}

func TestCollection_Find(t *testing.T) {
	ctx := context.Background()
	col := initCollection[Data, MetaData](t)
	vx1, vx2, vy, _ := seed(t, col, ctx)

	// all
	consumer0 := &mongox.SliceConsumer[Document[Data]]{}
	assert.NoError(t, col.Find(ctx, nil, nil, version.All(), consumer0, nil))
	assert.Equal(t, []Document[Data]{
		{
			ID:       "xxx",
			Data:     Data{ID: "xxx", A: "xa"},
			ObjectID: consumer0.Result[0].ObjectID,
			Version:  vx1,
		},
		{
			ID:       "xxx",
			Data:     Data{ID: "xxx", A: "xa", B: "xb"},
			ObjectID: consumer0.Result[1].ObjectID,
			Version:  vx2,
			Parents:  []version.ID{vx1},
			Refs:     []version.Ref{"latest", "aaa"},
		},
		{
			ID:       "yyy",
			Data:     Data{ID: "yyy", A: "ya", B: "yb"},
			ObjectID: consumer0.Result[2].ObjectID,
			Version:  vy,
			Refs:     []version.Ref{"latest", "aaa"},
		},
	}, consumer0.Result)

	// filter
	consumer0 = &mongox.SliceConsumer[Document[Data]]{}
	assert.NoError(t, col.Find(ctx, bson.M{"a": "xa"}, nil, version.All(), consumer0, nil))
	assert.Equal(t, []Document[Data]{
		{
			ID:       "xxx",
			Data:     Data{ID: "xxx", A: "xa"},
			ObjectID: consumer0.Result[0].ObjectID,
			Version:  vx1,
		},
		{
			ID:       "xxx",
			Data:     Data{ID: "xxx", A: "xa", B: "xb"},
			ObjectID: consumer0.Result[1].ObjectID,
			Version:  vx2,
			Parents:  []version.ID{vx1},
			Refs:     []version.Ref{"latest", "aaa"},
		},
	}, consumer0.Result)

	// meta filter
	consumer0 = &mongox.SliceConsumer[Document[Data]]{}
	assert.NoError(t, col.Find(ctx, nil, bson.M{"c": "mx"}, version.All(), consumer0, nil))
	assert.Equal(t, []Document[Data]{
		{
			ID:       "xxx",
			Data:     Data{ID: "xxx", A: "xa"},
			ObjectID: consumer0.Result[0].ObjectID,
			Version:  vx1,
		},
		{
			ID:       "xxx",
			Data:     Data{ID: "xxx", A: "xa", B: "xb"},
			ObjectID: consumer0.Result[1].ObjectID,
			Version:  vx2,
			Parents:  []version.ID{vx1},
			Refs:     []version.Ref{"latest", "aaa"},
		},
	}, consumer0.Result)

	// latest
	consumer0 = &mongox.SliceConsumer[Document[Data]]{}
	assert.NoError(t, col.Find(ctx, nil, nil, version.Eq(version.Latest.OrVersion()), consumer0, nil))
	assert.Equal(t, []Document[Data]{
		{
			ID:       "xxx",
			Data:     Data{ID: "xxx", A: "xa", B: "xb"},
			ObjectID: consumer0.Result[0].ObjectID,
			Version:  vx2,
			Parents:  []version.ID{vx1},
			Refs:     []version.Ref{"latest", "aaa"},
		},
		{
			ID:       "yyy",
			Data:     Data{ID: "yyy", A: "ya", B: "yb"},
			ObjectID: consumer0.Result[1].ObjectID,
			Version:  vy,
			Refs:     []version.Ref{"latest", "aaa"},
		},
	}, consumer0.Result)

	// version
	consumer0 = &mongox.SliceConsumer[Document[Data]]{}
	assert.NoError(t, col.Find(ctx, bson.M{"a": "xa"}, nil, version.Eq(vx1.OrRef()), consumer0, nil))
	assert.Equal(t, []Document[Data]{
		{
			ID:       "xxx",
			Data:     Data{ID: "xxx", A: "xa"},
			ObjectID: consumer0.Result[0].ObjectID,
			Version:  vx1,
		},
	}, consumer0.Result)

	// ref
	consumer0 = &mongox.SliceConsumer[Document[Data]]{}
	assert.NoError(t, col.Find(ctx, bson.M{"a": "xa"}, nil, version.Eq(version.Ref("aaa").OrVersion()), consumer0, nil))
	assert.Equal(t, []Document[Data]{
		{
			ID:       "xxx",
			Data:     Data{ID: "xxx", A: "xa", B: "xb"},
			ObjectID: consumer0.Result[0].ObjectID,
			Version:  vx2,
			Parents:  []version.ID{vx1},
			Refs:     []version.Ref{"latest", "aaa"},
		},
	}, consumer0.Result)

	// archived
	consumer0 = &mongox.SliceConsumer[Document[Data]]{}
	assert.NoError(t, col.Find(ctx, bson.M{"a": "za"}, nil, version.Eq(version.Latest.OrVersion()), consumer0, nil))
	assert.Empty(t, consumer0.Result)

	// not found
	consumer0 = &mongox.SliceConsumer[Document[Data]]{}
	assert.NoError(t, col.Find(ctx, bson.M{"a": "c"}, nil, version.Eq(version.Latest.OrVersion()), consumer0, nil))
	assert.Empty(t, consumer0.Result)
}

func TestCollection_Count(t *testing.T) {
	ctx := context.Background()
	col := initCollection[Data, MetaData](t)
	vx1, _, _, _ := seed(t, col, ctx)

	// all
	count, err := col.Count(ctx, nil, nil, version.All())
	assert.NoError(t, err)
	assert.Equal(t, int64(3), count)

	// version
	count, err = col.Count(ctx, bson.M{"a": "xa"}, nil, version.Eq(vx1.OrRef()))
	assert.NoError(t, err)
	assert.Equal(t, int64(1), count)

	// meta filter
	count, err = col.Count(ctx, nil, bson.M{"c": "mx"}, version.Eq(version.Latest.OrVersion()))
	assert.NoError(t, err)
	assert.Equal(t, int64(1), count)

	// ref
	count, err = col.Count(ctx, bson.M{"a": "xa"}, nil, version.Eq(version.Latest.OrVersion()))
	assert.NoError(t, err)
	assert.Equal(t, int64(1), count)

	// not found
	count, err = col.Count(ctx, bson.M{"a": "c"}, nil, version.Eq(version.Latest.OrVersion()))
	assert.NoError(t, err)
	assert.Equal(t, int64(0), count)

	// archived
	count, err = col.Count(ctx, bson.M{idKey: "zzz"}, nil, version.Eq(version.Latest.OrVersion()))
	assert.NoError(t, err)
	assert.Equal(t, int64(0), count)
}

func TestCollection_CountAggregation(t *testing.T) {
	ctx := context.Background()
	col := initCollection[Data, MetaData](t)
	vx1, _, _, _ := seed(t, col, ctx)

	// all
	count, err := col.CountAggregation(ctx, []any{}, nil, version.All())
	assert.NoError(t, err)
	assert.Equal(t, int64(3), count)

	// filter
	count, err = col.CountAggregation(ctx, []any{bson.M{"$match": bson.M{"a": "xa"}}}, nil, version.All())
	assert.NoError(t, err)
	assert.Equal(t, int64(2), count)

	// meta filter
	count, err = col.CountAggregation(ctx, nil, []any{bson.M{"$match": bson.M{"c": "mx"}}}, version.All())
	assert.NoError(t, err)
	assert.Equal(t, int64(2), count)

	// version
	count, err = col.CountAggregation(ctx, []any{bson.M{"$match": bson.M{"a": "xa"}}}, nil, version.Eq(vx1.OrRef()))
	assert.NoError(t, err)
	assert.Equal(t, int64(1), count)

	// ref
	count, err = col.CountAggregation(ctx, []any{bson.M{"$match": bson.M{"a": "xa"}}}, nil, version.Eq(version.Latest.OrVersion()))
	assert.NoError(t, err)
	assert.Equal(t, int64(1), count)

	// not found
	count, err = col.CountAggregation(ctx, []any{bson.M{"$match": bson.M{"a": "c"}}}, nil, version.Eq(version.Latest.OrVersion()))
	assert.NoError(t, err)
	assert.Equal(t, int64(0), count)

	// archived
	count, err = col.CountAggregation(ctx, []any{bson.M{"$match": bson.M{idKey: "zzz"}}}, nil, version.Eq(version.Latest.OrVersion()))
	assert.NoError(t, err)
	assert.Equal(t, int64(0), count)
}

func TestCollection_Paginate(t *testing.T) {
	ctx := context.Background()
	col := initCollection[Data, MetaData](t)
	_, _, _, _ = seed(t, col, ctx)

	consumer := &mongox.SliceConsumer[Data]{}
	pi, err := col.Paginate(
		ctx,
		bson.M{},
		nil,
		version.Eq(version.Latest.OrVersion()),
		nil,
		nil,
		usecasex.CursorPagination{First: lo.ToPtr(int64(2))}.Wrap(),
		consumer,
		nil,
	)
	assert.NoError(t, err)
	assert.Equal(t, usecasex.NewPageInfo(2, usecasex.Cursor("xxx").Ref(), usecasex.Cursor("yyy").Ref(), false, false), pi)
	assert.Equal(t, []Data{{ID: "xxx", A: "xa", B: "xb"}, {ID: "yyy", A: "ya", B: "yb"}}, consumer.Result)
}

func TestCollection_PaginateAggregation(t *testing.T) {
	ctx := context.Background()
	col := initCollection[Data, MetaData](t)
	_, _, _, _ = seed(t, col, ctx)

	consumer := &mongox.SliceConsumer[Data]{}
	pi, err := col.PaginateAggregation(
		ctx,
		[]any{},
		nil,
		version.Eq(version.Latest.OrVersion()),
		nil,
		nil,
		usecasex.CursorPagination{First: lo.ToPtr(int64(2))}.Wrap(),
		consumer,
		nil,
	)
	assert.NoError(t, err)
	assert.Equal(t, usecasex.NewPageInfo(2, usecasex.Cursor("xxx").Ref(), usecasex.Cursor("yyy").Ref(), false, false), pi)
	assert.Equal(t, []Data{{ID: "xxx", A: "xa", B: "xb"}, {ID: "yyy", A: "ya", B: "yb"}}, consumer.Result)
}

func TestCollection_Timestamp(t *testing.T) {
	ctx := context.Background()
	col := initCollection[Data, MetaData](t)
	c := col.DataClient().Client()
	vx, vy := version.NewID(), version.NewID()
	t1 := time.Date(2023, time.April, 1, 0, 0, 0, 0, time.Local).UTC()
	t2 := time.Date(2023, time.April, 2, 0, 0, 0, 0, time.Local).UTC()
	t3 := time.Date(2023, time.April, 3, 0, 0, 0, 0, time.Local).UTC()

	_, _ = c.InsertMany(ctx, []any{
		&Document[Data]{
			Data: Data{
				A: "b",
			},
			ObjectID: primitive.NewObjectIDFromTimestamp(t1),
			Version:  vx,
		},
		&Document[Data]{
			Data: Data{
				A: "b",
				B: "c",
			},
			ObjectID: primitive.NewObjectIDFromTimestamp(t2),
			Version:  vy,
			Parents:  []version.ID{vx},
			Refs:     []version.Ref{"latest", "aaa"},
		},
		&Document[Data]{
			Data: Data{
				A: "d",
				B: "a",
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
	col := initCollection[Data, MetaData](t)
	c := col.DataClient().Client()

	// first
	assert.NoError(t, col.SaveOne(ctx, "x", Data{ID: "x", A: "aaa"}, nil))

	cur := c.FindOne(ctx, bson.M{idKey: "x"})
	doc1 := Document[Data]{}
	assert.NoError(t, cur.Decode(&doc1))
	assert.Equal(t, Document[Data]{
		ID:       "x",
		ObjectID: doc1.ObjectID,
		Version:  doc1.Version,
		Refs:     []version.Ref{version.Latest},
		Data:     Data{ID: "x", A: "aaa"},
	}, doc1)
	var data Data
	assert.NoError(t, cur.Decode(&data))
	assert.Equal(t, Data{ID: "x", A: "aaa"}, data)

	// next version
	assert.NoError(t, col.SaveOne(ctx, "x", Data{ID: "x", A: "bbb"}, version.Latest.OrVersion().Ref()))

	cur = c.FindOne(ctx, bson.M{idKey: "x", refsKey: bson.M{"$in": []string{"latest"}}})
	doc2 := Document[Data]{}
	assert.NoError(t, cur.Decode(&doc2))
	assert.Equal(t, Document[Data]{
		ID:       "x",
		ObjectID: doc2.ObjectID,
		Version:  doc2.Version,
		Parents:  []version.ID{doc1.Version},
		Refs:     []version.Ref{version.Latest},
		Data:     Data{ID: "x", A: "bbb"},
	}, doc2)
	data2 := Data{}
	assert.NoError(t, cur.Decode(&data2))
	assert.Equal(t, Data{ID: "x", A: "bbb"}, data2)

	cur = c.FindOne(ctx, bson.M{idKey: "x", versionKey: doc1.Version})
	doc3 := Document[Data]{}
	assert.NoError(t, cur.Decode(&doc3))
	assert.Equal(t, Document[Data]{
		ID:       "x",
		ObjectID: doc3.ObjectID,
		Version:  doc1.Version,
		Refs:     []version.Ref{}, // latest ref should be deleted
		Data:     Data{ID: "x", A: "aaa"},
	}, doc3)
	data3 := Data{}
	assert.NoError(t, cur.Decode(&data3))
	assert.Equal(t, Data{ID: "x", A: "aaa"}, data3)

	// set test ref to the first item
	_, _ = c.UpdateOne(ctx, bson.M{idKey: "x", versionKey: doc1.Version}, bson.M{"$set": bson.M{refsKey: []version.Ref{"test"}}})
	assert.NoError(t, col.SaveOne(ctx, "x", Data{ID: "x", A: "ccc"}, version.Ref("test").OrVersion().Ref()))

	cur = c.FindOne(ctx, bson.M{idKey: "x", refsKey: bson.M{"$in": []string{"test"}}})
	doc4 := Document[Data]{}
	assert.NoError(t, cur.Decode(&doc4))
	assert.Equal(t, Document[Data]{
		ID:       "x",
		ObjectID: doc4.ObjectID,
		Version:  doc4.Version,
		Parents:  []version.ID{doc1.Version},
		Refs:     []version.Ref{"test"},
		Data:     Data{ID: "x", A: "ccc"},
	}, doc4)
	data4 := Data{}
	assert.NoError(t, cur.Decode(&data4))
	assert.Equal(t, Data{ID: "x", A: "ccc"}, data4)

	cur = c.FindOne(ctx, bson.M{idKey: "x", versionKey: doc1.Version})
	doc5 := Document[Data]{}
	assert.NoError(t, cur.Decode(&doc5))
	assert.Equal(t, Document[Data]{
		ID:       "x",
		ObjectID: doc5.ObjectID,
		Version:  doc1.Version,
		Refs:     []version.Ref{}, // test ref should be deleted
		Data:     Data{ID: "x", A: "aaa"},
	}, doc5)
	data5 := Data{}
	assert.NoError(t, cur.Decode(&data5))
	assert.Equal(t, Data{ID: "x", A: "aaa"}, data5)

	// nonexistent version
	assert.Same(t, rerror.ErrNotFound, col.SaveOne(ctx, "x", Data{}, version.NewID().OrRef().Ref()))
}

func TestCollection_UpdateRef(t *testing.T) {
	ctx := context.Background()
	col := initCollection[Data, MetaData](t)
	c := col.DataClient().Client()

	v1, v2, v3 := version.NewID(), version.NewID(), version.NewID()
	_, _ = c.InsertMany(ctx, []any{
		Document[Data]{ID: "x", Version: v1},
		Document[Data]{ID: "x", Version: v2},
		Document[Data]{ID: "y", Version: v3, Refs: []version.Ref{"foo"}},
	})

	var doc Document[Data]

	// delete foo ref
	assert.NoError(t, col.UpdateRef(ctx, "y", "foo", nil))
	got := c.FindOne(ctx, bson.M{idKey: "y", versionKey: v3})
	assert.NoError(t, got.Decode(&doc))
	assert.Equal(t, Document[Data]{ID: "y", ObjectID: doc.ObjectID, Version: v3, Refs: []version.Ref{}}, doc)
	assert.NoError(t, col.UpdateRef(ctx, "y", "bar", nil)) // non-existent ref

	// attach foo ref
	assert.NoError(t, col.UpdateRef(ctx, "x", "foo", v1.OrRef().Ref()))
	got = c.FindOne(ctx, bson.M{idKey: "x", versionKey: v1})
	assert.NoError(t, got.Decode(&doc))
	assert.Equal(t, Document[Data]{ID: "x", ObjectID: doc.ObjectID, Version: v1, Refs: []version.Ref{"foo"}}, doc)

	// move foo ref
	assert.NoError(t, col.UpdateRef(ctx, "x", "foo", v2.OrRef().Ref()))
	got = c.FindOne(ctx, bson.M{idKey: "x", versionKey: v1})
	assert.NoError(t, got.Decode(&doc))
	assert.Equal(t, Document[Data]{ID: "x", ObjectID: doc.ObjectID, Version: v1, Refs: []version.Ref{}}, doc)
	got = c.FindOne(ctx, bson.M{idKey: "x", versionKey: v2})
	assert.NoError(t, got.Decode(&doc))
	assert.Equal(t, Document[Data]{ID: "x", ObjectID: doc.ObjectID, Version: v2, Refs: []version.Ref{"foo"}}, doc)
	got = c.FindOne(ctx, bson.M{idKey: "y", versionKey: v3})
	assert.NoError(t, got.Decode(&doc))
	assert.Equal(t, Document[Data]{ID: "y", ObjectID: doc.ObjectID, Version: v3, Refs: []version.Ref{}}, doc)
}

func TestCollection_IsArchived(t *testing.T) {
	ctx := context.Background()
	col := initCollection[Data, MetaData](t)
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
	col := initCollection[Data, MetaData](t)
	mc := col.metaColl.Client()

	assert.NoError(t, col.ArchiveOne(ctx, bson.M{idKey: "xxx"}, true))
	got := mc.FindOne(ctx, bson.M{idKey: "xxx"})
	assert.Equal(t, mongo.ErrNoDocuments, got.Err())

	_, _ = mc.InsertOne(ctx, bson.M{
		idKey:       "xxx",
		archivedKey: false,
	})

	assert.NoError(t, col.ArchiveOne(ctx, bson.M{idKey: "xxx"}, true))
	got = mc.FindOne(ctx, bson.M{idKey: "xxx"})
	var metadata MetadataDocument[MetaData]
	assert.NoError(t, got.Decode(&metadata))
	assert.Equal(t, MetadataDocument[MetaData]{
		ID:       "xxx",
		Archived: true,
	}, metadata)

	_, _ = mc.InsertOne(ctx, MetadataDocument[MetaData]{
		ID:       "yyy",
		Archived: false,
		Metadata: MetaData{C: "1"},
	})

	assert.NoError(t, col.ArchiveOne(ctx, bson.M{idKey: "yyy", "c": "1"}, true))
	got = mc.FindOne(ctx, bson.M{idKey: "yyy"})
	var metadata2 MetadataDocument[MetaData]
	assert.NoError(t, got.Decode(&metadata2))
	assert.Equal(t, MetadataDocument[MetaData]{
		ID:       "yyy",
		Archived: true,
		Metadata: MetaData{C: "1"},
	}, metadata2)

	assert.NoError(t, col.ArchiveOne(ctx, bson.M{idKey: "xxx"}, false))
	got = mc.FindOne(ctx, bson.M{idKey: "xxx"})
	assert.NoError(t, got.Decode(&metadata))
	assert.Equal(t, MetadataDocument[MetaData]{
		ID:       "xxx",
		Archived: false,
	}, metadata)
}

func TestCollection_RemoveOne(t *testing.T) {
	ctx := context.Background()
	col := initCollection[Data, MetaData](t)
	c := col.dataColl.Client()
	mc := col.metaColl.Client()

	_, _ = c.InsertMany(ctx, []any{
		Document[Data]{ID: "xxx", Data: Data{ID: "xxx", A: "foo"}},
		Document[Data]{ID: "yyy", Data: Data{ID: "xxx", A: "hoge"}},
	})
	_, _ = mc.InsertMany(ctx, []any{
		MetadataDocument[MetaData]{ID: "xxx"},
		MetadataDocument[MetaData]{ID: "yyy"},
	})

	assert.NoError(t, col.RemoveOne(ctx, bson.M{idKey: "xxx"}))
	got := c.FindOne(ctx, bson.M{idKey: "xxx"})
	assert.Equal(t, mongo.ErrNoDocuments, got.Err())
	got = mc.FindOne(ctx, bson.M{idKey: "xxx"})
	assert.Equal(t, mongo.ErrNoDocuments, got.Err())
	got = c.FindOne(ctx, bson.M{idKey: "yyy"})
	var data Document[Data]
	assert.NoError(t, got.Decode(&data))
	assert.Equal(t, "hoge", data.Data.A)
}

func TestCollection_Empty(t *testing.T) {
	ctx := context.Background()
	col := initCollection[Data, MetaData](t)
	c := col.DataClient().Client()

	_, _ = c.InsertMany(ctx, []any{
		Data{ID: "xxx", A: "bar"},
		Data{ID: "yyy", A: "bar"},
		Data{ID: "zzz", A: "hoge"},
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
	col := initCollection[Data, MetaData](t)
	c := col.DataClient().Client()

	v1, v2, v3 := version.NewID(), version.NewID(), version.NewID()
	_, _ = c.InsertMany(ctx, []any{
		Document[Data]{ID: "x", Version: v1},
		Document[Data]{ID: "x", Version: v2, Parents: []version.ID{v1}, Refs: []version.Ref{version.Latest}},
	})

	got, err := col.data(ctx, "x", v1.OrRef().Ref())
	assert.NoError(t, err)
	assert.Equal(t, &Document[Data]{
		ID:       "x",
		ObjectID: got.ObjectID,
		Version:  v1,
	}, got)

	got, err = col.data(ctx, "x", version.Latest.OrVersion().Ref())
	assert.NoError(t, err)
	assert.Equal(t, &Document[Data]{
		ID:       "x",
		ObjectID: got.ObjectID,
		Version:  v2,
		Parents:  []version.ID{v1},
		Refs:     []version.Ref{version.Latest},
	}, got)
	assert.Equal(t, got.ObjectID.Timestamp(), got.Timestamp())

	got, err = col.data(ctx, "x", v3.OrRef().Ref())
	assert.Same(t, rerror.ErrNotFound, err)
	assert.Nil(t, got)

	got, err = col.data(ctx, "x", version.Ref("a").OrVersion().Ref())
	assert.Same(t, rerror.ErrNotFound, err)
	assert.Nil(t, got)

	got, err = col.data(ctx, "y", version.Latest.OrVersion().Ref())
	assert.NoError(t, err)
	assert.Nil(t, got)
}

func initCollection[T, MT Identifiable](t *testing.T) *Collection[T, MT] {
	t.Helper()
	c := mongotest.Connect(t)(t)
	client := mongox.NewClientWithDatabase(c)
	name := "test_" + uuid.NewString()
	return New[T, MT](client.Collection(name), client.Collection(name+"_meta"))
}

func seed(t *testing.T, col *Collection[Data, MetaData], ctx context.Context) (version.ID, version.ID, version.ID, version.ID) {
	c := col.DataClient().Client()
	mc := col.MetaDataClient().Client()
	vx1, vx2, vy, vz := version.NewID(), version.NewID(), version.NewID(), version.NewID()

	_, err := c.InsertMany(ctx, []any{
		&Document[Data]{ID: "xxx", Data: Data{ID: "xxx", A: "xa"}, Version: vx1},
		&Document[Data]{ID: "xxx", Data: Data{ID: "xxx", A: "xa", B: "xb"}, Version: vx2, Refs: []version.Ref{"latest", "aaa"}, Parents: []version.ID{vx1}},
		&Document[Data]{ID: "yyy", Data: Data{ID: "yyy", A: "ya", B: "yb"}, Version: vy, Refs: []version.Ref{"latest", "aaa"}},
		&Document[Data]{ID: "zzz", Data: Data{ID: "zzz", A: "za", B: "zb"}, Version: vz, Refs: []version.Ref{"latest"}},
	})
	assert.NoError(t, err)

	_, err = mc.InsertMany(ctx, []any{
		&MetadataDocument[MetaData]{ID: "xxx", Archived: false, Metadata: MetaData{ID: "xxx", C: "mx"}},
		&MetadataDocument[MetaData]{ID: "yyy", Archived: false, Metadata: MetaData{ID: "yyy", C: "my"}},
		&MetadataDocument[MetaData]{ID: "zzz", Archived: true, Metadata: MetaData{ID: "zzz", C: "mz"}},
	})
	assert.NoError(t, err)
	return vx1, vx2, vy, vz
}
