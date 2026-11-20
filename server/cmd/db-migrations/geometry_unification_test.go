package main

import (
	"context"
	"os"
	"testing"

	"github.com/reearth/reearth-cms/server/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearthx/mongox/mongotest"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

func TestGeometryUnification(t *testing.T) {
	db := mongotest.Connect(t)(t)
	ctx := context.Background()

	wID, pID, sID, mID := id.NewWorkspaceID().String(), id.NewProjectID().String(), id.NewSchemaID().String(), id.NewModelID().String()
	objID, edtID, geoID, textID := id.NewFieldID().String(), id.NewFieldID().String(), id.NewFieldID().String(), id.NewFieldID().String()
	i1ID, i2ID, i3ID := id.NewItemID().String(), id.NewItemID().String(), id.NewItemID().String()

	point := `{"type":"Point","coordinates":[139.7,35.6]}`
	sortedPoint := bson.D{{Key: "coordinates", Value: bson.A{139.7, 35.6}}, {Key: "type", Value: "Point"}}
	reversedPoint := bson.D{{Key: "coordinates", Value: bson.A{35.6, 139.7}}, {Key: "type", Value: "Point"}}

	_, err := db.Collection("schema").InsertOne(ctx, bson.M{
		"id": sID, "workspace": wID, "project": pID,
		"fields": bson.A{
			bson.M{
				"id": objID, "key": "obj", "unique": true,
				"defaultvalue": bson.M{"t": "geometryObject", "v": bson.A{point}},
				"typeproperty": bson.M{"type": "geometryObject", "geometryobject": bson.M{"supportedtypes": bson.A{"POINT"}}},
			},
			bson.M{
				"id": edtID, "key": "edt",
				"typeproperty": bson.M{"type": "geometryEditor", "geometryeditor": bson.M{"supportedtypes": bson.A{"POINT"}}},
			},
			bson.M{
				"id": geoID, "key": "geo",
				"defaultvalue": bson.D{{Key: "t", Value: "geometry"}, {Key: "v", Value: bson.A{bson.D{{Key: "type", Value: "Point"}, {Key: "coordinates", Value: bson.A{139.7, 35.6}}}}}},
				"typeproperty": bson.M{"type": "geometry"},
			},
			bson.M{
				"id": textID, "key": "name",
				"typeproperty": bson.M{"type": "text", "text": bson.M{}},
			},
		},
	})
	require.NoError(t, err)

	item := func(itemID string, refs bson.A, fields ...bson.M) bson.M {
		return bson.M{"id": itemID, "project": pID, "schema": sID, "modelid": mID, "user": id.NewUserID().String(), "__r": refs, "fields": bson.A(fieldsToAny(fields))}
	}
	_, err = db.Collection("item").InsertMany(ctx, []any{
		// latest version of item 1
		item(i1ID, bson.A{"latest"},
			bson.M{"f": textID, "v": bson.M{"t": "text", "v": bson.A{"a"}}},
			bson.M{"f": objID, "v": bson.M{"t": "geometryObject", "v": bson.A{`{"type":"Point","bbox":[139.7,35.6,139.7,35.6],"coordinates":[139.7,35.6]}`}}},
			bson.M{"f": edtID, "v": bson.M{"t": "geometryEditor", "v": bson.A{`{"coordinates":[35.6,139.7],"type":"Point"}`}}, "itemgroup": "group"},
			bson.M{"f": geoID, "v": bson.M{"t": "geometry", "v": bson.A{bson.D{{Key: "type", Value: "Point"}, {Key: "coordinates", Value: bson.A{139.7, 35.6}}}}}},
		),
		// older version of item 1
		item(i1ID, bson.A{},
			bson.M{"f": objID, "v": bson.M{"t": "geometryObject", "v": bson.A{point}}},
		),
		// item 2 has the same value in the unique field, with another key order and number formatting
		item(i2ID, bson.A{"latest"},
			bson.M{"f": objID, "v": bson.M{"t": "geometryObject", "v": bson.A{`{"coordinates":[139.70,35.6],"type":"Point"}`}}},
		),
		// item 3 has a value that is not a GeoJSON object
		item(i3ID, bson.A{"latest"},
			bson.M{"f": objID, "v": bson.M{"t": "geometryObject", "v": bson.A{`[139.7,35.6]`}}},
		),
	})
	require.NoError(t, err)

	// a dry run writes nothing
	require.NoError(t, GeometryUnification(ctx, os.Getenv("REEARTH_CMS_DB"), db.Name(), false))
	n, err := db.Collection("item").CountDocuments(ctx, bson.M{"fields.v.t": "geometryObject"})
	require.NoError(t, err)
	assert.Equal(t, int64(4), n)

	require.NoError(t, GeometryUnification(ctx, os.Getenv("REEARTH_CMS_DB"), db.Name(), true))

	// schema
	var s struct {
		Fields []struct {
			ID           string `bson:"id"`
			DefaultValue *struct {
				T string   `bson:"t"`
				V []bson.D `bson:"v"`
			} `bson:"defaultvalue"`
			TypeProperty bson.M `bson:"typeproperty"`
		} `bson:"fields"`
	}
	require.NoError(t, db.Collection("schema").FindOne(ctx, bson.M{"id": sID}).Decode(&s))
	assert.Equal(t, bson.M{"type": "geometry"}, s.Fields[0].TypeProperty)
	assert.Equal(t, "geometry", s.Fields[0].DefaultValue.T)
	assert.Equal(t, []bson.D{sortedPoint}, s.Fields[0].DefaultValue.V)
	assert.Equal(t, bson.M{"type": "geometry"}, s.Fields[1].TypeProperty)
	assert.Nil(t, s.Fields[1].DefaultValue)
	assert.Equal(t, []bson.D{sortedPoint}, s.Fields[2].DefaultValue.V)
	assert.Equal(t, bson.M{"type": "text", "text": bson.M{}}, s.Fields[3].TypeProperty)

	var sd mongodoc.SchemaDocument
	require.NoError(t, db.Collection("schema").FindOne(ctx, bson.M{"id": sID}).Decode(&sd))
	sm, err := sd.Model()
	require.NoError(t, err)
	for _, f := range sm.Fields()[:3] {
		assert.Equal(t, value.TypeGeometry, f.Type())
	}

	// items
	type itemDoc struct {
		Fields []struct {
			F string `bson:"f"`
			V struct {
				T string `bson:"t"`
				V bson.A `bson:"v"`
			} `bson:"v"`
			ItemGroup *string `bson:"itemgroup"`
		} `bson:"fields"`
	}
	find := func(itemID string, latest bool) itemDoc {
		t.Helper()
		f := bson.M{"id": itemID, "__r": bson.M{"$size": 0}}
		if latest {
			f = bson.M{"id": itemID, "__r": "latest"}
		}
		var d itemDoc
		require.NoError(t, db.Collection("item").FindOne(ctx, f).Decode(&d))
		return d
	}

	i1 := find(i1ID, true)
	assert.Equal(t, "text", i1.Fields[0].V.T)
	assert.Equal(t, bson.A{"a"}, i1.Fields[0].V.V)
	for _, f := range i1.Fields[1:] {
		assert.Equal(t, "geometry", f.V.T)
	}
	assert.Equal(t, bson.A{sortedPoint}, i1.Fields[1].V.V, "bbox is removed and keys are sorted")
	assert.Equal(t, bson.A{reversedPoint}, i1.Fields[2].V.V, "invalid values are converted")
	assert.Equal(t, "group", *i1.Fields[2].ItemGroup, "other members of the field are kept")
	assert.Equal(t, bson.A{sortedPoint}, i1.Fields[3].V.V, "existing Geometry values are sorted")
	assert.Equal(t, bson.A{sortedPoint}, find(i2ID, true).Fields[0].V.V)
	assert.Equal(t, bson.A{sortedPoint}, find(i1ID, false).Fields[0].V.V, "older versions are converted")
	assert.Empty(t, find(i3ID, true).Fields[0].V.V, "values that are not GeoJSON objects are removed")

	var id1 mongodoc.ItemDocument
	require.NoError(t, db.Collection("item").FindOne(ctx, bson.M{"id": i1ID, "__r": "latest"}).Decode(&id1))
	im, err := id1.Model()
	require.NoError(t, err)
	g, ok := im.Field(id.MustFieldID(objID)).Value().First().ValueJson()
	assert.True(t, ok)
	assert.Equal(t, value.Json{"type": "Point", "coordinates": []any{139.7, 35.6}}, g)

	// running again changes nothing
	before := snapshot(t, ctx, db)
	require.NoError(t, GeometryUnification(ctx, os.Getenv("REEARTH_CMS_DB"), db.Name(), true))
	assert.Equal(t, before, snapshot(t, ctx, db))
}

func TestConvertGeometryValue(t *testing.T) {
	t.Parallel()

	point := `{"type":"Point","coordinates":[139.7,35.6]}`

	tests := []struct {
		name        string
		stored      mongodoc.ValueDocument
		wantChanged bool
		wantKey     string
		wantDropped int
		wantInvalid []error
	}{
		{
			name:        "geometry object string",
			stored:      mongodoc.ValueDocument{T: "geometryObject", V: []any{point}},
			wantChanged: true,
			wantKey:     `[{"coordinates":[139.7,35.6],"type":"Point"}]`,
		},
		{
			name:        "multiple values",
			stored:      mongodoc.ValueDocument{T: "geometryEditor", V: []any{point, `{"type":"LineString","coordinates":[[1,1],[2,2]]}`}},
			wantChanged: true,
			wantKey:     `[{"coordinates":[139.7,35.6],"type":"Point"},{"coordinates":[[1,1],[2,2]],"type":"LineString"}]`,
		},
		{
			name:    "geometry already sorted",
			stored:  mongodoc.ValueDocument{T: "geometry", V: []any{bson.D{{Key: "coordinates", Value: bson.A{139.7, 35.6}}, {Key: "type", Value: "Point"}}}},
			wantKey: `[{"coordinates":[139.7,35.6],"type":"Point"}]`,
		},
		{
			name:        "geometry with unsorted keys",
			stored:      mongodoc.ValueDocument{T: "geometry", V: []any{bson.D{{Key: "type", Value: "Point"}, {Key: "coordinates", Value: bson.A{139.7, 35.6}}}}},
			wantChanged: true,
			wantKey:     `[{"coordinates":[139.7,35.6],"type":"Point"}]`,
		},
		{
			name:        "invalid geometry",
			stored:      mongodoc.ValueDocument{T: "geometryObject", V: []any{`{"type":"Point","coordinates":[35.6,139.7]}`}},
			wantChanged: true,
			wantKey:     `[{"coordinates":[35.6,139.7],"type":"Point"}]`,
			wantInvalid: []error{schema.ErrGeometryReversedCoordinates},
		},
		{
			name:        "not a GeoJSON object",
			stored:      mongodoc.ValueDocument{T: "geometryObject", V: []any{`[139.7,35.6]`}},
			wantChanged: true,
			wantDropped: 1,
		},
		{
			name:        "empty",
			stored:      mongodoc.ValueDocument{T: "geometryObject", V: []any{}},
			wantChanged: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			res := convertGeometryValue(tt.stored)
			assert.Equal(t, "geometry", res.doc.T)
			assert.Equal(t, tt.wantChanged, res.changed)
			assert.Equal(t, tt.wantKey, res.key)
			assert.Equal(t, tt.wantDropped, res.dropped)
			if assert.Len(t, res.invalid, len(tt.wantInvalid)) {
				for i, err := range tt.wantInvalid {
					assert.ErrorIs(t, res.invalid[i], err)
				}
			}
		})
	}
}

func fieldsToAny(fields []bson.M) []any {
	res := make([]any, len(fields))
	for i, f := range fields {
		res[i] = f
	}
	return res
}

func snapshot(t *testing.T, ctx context.Context, db *mongo.Database) []bson.Raw {
	t.Helper()
	var res []bson.Raw
	for _, c := range []string{"schema", "item"} {
		cur, err := db.Collection(c).Find(ctx, bson.M{})
		require.NoError(t, err)
		for cur.Next(ctx) {
			res = append(res, append(bson.Raw{}, cur.Current...))
		}
		require.NoError(t, cur.Err())
	}
	return res
}
