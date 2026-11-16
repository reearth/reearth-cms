package mongodoc

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"go.mongodb.org/mongo-driver/bson"
)

func TestNewMultipleValue(t *testing.T) {
	assert.Nil(t, NewMultipleValue(nil))
	assert.Equal(t, &ValueDocument{
		T: "bool",
		V: []any{},
	}, NewMultipleValue(value.MultipleFrom(value.TypeBool, nil)))
	assert.Equal(t, &ValueDocument{
		T: "bool",
		V: []any{true},
	}, NewMultipleValue(value.MultipleFrom(value.TypeBool, []*value.Value{value.TypeBool.Value(true)})))
}

func TestValueDocument_Geometry(t *testing.T) {
	t.Parallel()

	line := `{"type":"LineString","coordinates":[[139.7,35.6,10],[139.8,35.7,10]]}`
	collection := `{"type":"GeometryCollection","geometries":[{"type":"Point","coordinates":[1,2]}]}`
	m := value.NewMultiple(value.TypeGeometry, []any{line, collection})

	doc := NewMultipleValue(m)
	assert.Equal(t, "geometry", doc.T)

	// stored as embedded documents, decoded back as bson.D and bson.A
	b, err := bson.Marshal(doc)
	require.NoError(t, err)
	var raw bson.M
	require.NoError(t, bson.Unmarshal(b, &raw))
	_, isString := raw["v"].(bson.A)[0].(string)
	assert.False(t, isString)

	var decoded ValueDocument
	require.NoError(t, bson.Unmarshal(b, &decoded))
	assert.IsType(t, bson.D{}, decoded.V[0])
	assert.Equal(t, m, decoded.MultipleValue())
}

func TestNewMultipleValue_GeometryKeyOrder(t *testing.T) {
	t.Parallel()

	a := value.NewMultiple(value.TypeGeometry, []any{`{"type":"GeometryCollection","geometries":[{"type":"Point","coordinates":[1,2]}]}`})
	b := value.NewMultiple(value.TypeGeometry, []any{`{"geometries":[{"coordinates":[1,2],"type":"Point"}],"type":"GeometryCollection"}`})

	// the same geometry is stored identically regardless of its key order
	ba, err := bson.Marshal(NewMultipleValue(a))
	require.NoError(t, err)
	bb, err := bson.Marshal(NewMultipleValue(b))
	require.NoError(t, err)
	assert.Equal(t, ba, bb)

	// keys are stored in sorted order
	assert.Equal(t, bson.D{
		{Key: "geometries", Value: []any{bson.D{{Key: "coordinates", Value: []any{1.0, 2.0}}, {Key: "type", Value: "Point"}}}},
		{Key: "type", Value: "GeometryCollection"},
	}, NewMultipleValue(a).V[0])
}
