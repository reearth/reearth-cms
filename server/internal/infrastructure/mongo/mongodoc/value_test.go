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
	line := `{"type":"LineString","coordinates":[[139.7,35.6,10],[139.8,35.7,10]]}`
	collection := `{"type":"GeometryCollection","geometries":[{"type":"Point","coordinates":[1,2]}]}`
	m := value.NewMultiple(value.TypeGeometry, []any{line, collection})

	doc := NewMultipleValue(m)
	assert.Equal(t, "geometry", doc.T)
	assert.Equal(t, m.EquivalenceKeys(), doc.K)
	assert.Len(t, doc.K, 2)

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
	assert.Equal(t, doc.K, decoded.K)
	assert.Equal(t, m, decoded.MultipleValue())
}

func TestNewMultipleValue_NoKeys(t *testing.T) {
	doc := NewMultipleValue(value.NewMultiple(value.TypeGeometryEditor, []any{`{"type":"Point","coordinates":[1,2]}`}))
	assert.Nil(t, doc.K)

	b, err := bson.Marshal(doc)
	require.NoError(t, err)
	var raw bson.M
	require.NoError(t, bson.Unmarshal(b, &raw))
	_, ok := raw["k"]
	assert.False(t, ok)
}
