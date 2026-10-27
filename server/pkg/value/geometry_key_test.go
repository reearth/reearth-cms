package value

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func geometryKey(t *testing.T, s string) string {
	t.Helper()
	v := TypeGeometry.Value(s)
	require.NotNil(t, v, s)
	g, ok := v.ValueGeometry()
	require.True(t, ok)
	k, ok := GeometryKey(g)
	require.True(t, ok, s)
	return k
}

func TestGeometryKey(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name string
		a, b string
		same bool
	}{
		// vertices
		{
			name: "same point with different number formatting",
			a:    `{"type":"Point","coordinates":[139.7,35.6]}`,
			b:    `{"type":"Point","coordinates":[139.70,35.60]}`,
			same: true,
		},
		{
			name: "same point with altitude",
			a:    `{"type":"Point","coordinates":[139.7,35.6,50]}`,
			b:    `{"type":"Point","coordinates":[139.7,35.6,50]}`,
			same: true,
		},
		{
			name: "same point with different key order",
			a:    `{"type":"Point","coordinates":[139.7,35.6]}`,
			b:    `{"coordinates":[139.7,35.6],"type":"Point"}`,
			same: true,
		},
		{
			name: "close points are different",
			a:    `{"type":"Point","coordinates":[139.7,35.6]}`,
			b:    `{"type":"Point","coordinates":[139.7000001,35.6]}`,
			same: false,
		},
		{
			name: "altitude 0 is not the same as no altitude",
			a:    `{"type":"Point","coordinates":[139.7,35.6]}`,
			b:    `{"type":"Point","coordinates":[139.7,35.6,0]}`,
			same: false,
		},
		{
			name: "different altitude",
			a:    `{"type":"Point","coordinates":[139.7,35.6,50]}`,
			b:    `{"type":"Point","coordinates":[139.7,35.6,51]}`,
			same: false,
		},
		{
			name: "negative zero is zero",
			a:    `{"type":"Point","coordinates":[0,35.6]}`,
			b:    `{"type":"Point","coordinates":[-0,35.6]}`,
			same: true,
		},
		// line strings
		{
			name: "line string in the same direction",
			a:    `{"type":"LineString","coordinates":[[1,1],[2,2],[3,3]]}`,
			b:    `{"type":"LineString","coordinates":[[1,1],[2,2],[3,3]]}`,
			same: true,
		},
		{
			name: "line string in the reverse direction",
			a:    `{"type":"LineString","coordinates":[[1,1],[2,2],[3,3]]}`,
			b:    `{"type":"LineString","coordinates":[[3,3],[2,2],[1,1]]}`,
			same: true,
		},
		{
			name: "line string with a different vertex order",
			a:    `{"type":"LineString","coordinates":[[1,1],[2,2],[3,3]]}`,
			b:    `{"type":"LineString","coordinates":[[2,2],[1,1],[3,3]]}`,
			same: false,
		},
		// polygons
		{
			name: "polygon ring in the reverse direction",
			a:    `{"type":"Polygon","coordinates":[[[0,0],[1,0],[1,1],[0,0]]]}`,
			b:    `{"type":"Polygon","coordinates":[[[0,0],[1,1],[1,0],[0,0]]]}`,
			same: true,
		},
		{
			name: "polygon ring from another starting vertex",
			a:    `{"type":"Polygon","coordinates":[[[0,0],[1,0],[1,1],[0,0]]]}`,
			b:    `{"type":"Polygon","coordinates":[[[1,0],[1,1],[0,0],[1,0]]]}`,
			same: true,
		},
		{
			name: "polygon ring reversed and from another starting vertex",
			a:    `{"type":"Polygon","coordinates":[[[0,0],[1,0],[1,1],[0,1],[0,0]]]}`,
			b:    `{"type":"Polygon","coordinates":[[[1,1],[1,0],[0,0],[0,1],[1,1]]]}`,
			same: true,
		},
		{
			name: "square and bow-tie from the same corners are different",
			a:    `{"type":"Polygon","coordinates":[[[0,0],[1,0],[1,1],[0,1],[0,0]]]}`,
			b:    `{"type":"Polygon","coordinates":[[[0,0],[1,1],[1,0],[0,1],[0,0]]]}`,
			same: false,
		},
		{
			name: "polygon holes in any order",
			a: `{"type":"Polygon","coordinates":[
				[[0,0],[10,0],[10,10],[0,10],[0,0]],
				[[1,1],[2,1],[2,2],[1,1]],
				[[5,5],[6,5],[6,6],[5,5]]]}`,
			b: `{"type":"Polygon","coordinates":[
				[[10,10],[0,10],[0,0],[10,0],[10,10]],
				[[6,6],[6,5],[5,5],[6,6]],
				[[2,1],[2,2],[1,1],[2,1]]]}`,
			same: true,
		},
		{
			name: "polygon outer ring and hole are not interchangeable",
			a: `{"type":"Polygon","coordinates":[
				[[0,0],[10,0],[10,10],[0,0]],
				[[1,1],[2,1],[2,2],[1,1]]]}`,
			b: `{"type":"Polygon","coordinates":[
				[[1,1],[2,1],[2,2],[1,1]],
				[[0,0],[10,0],[10,10],[0,0]]]}`,
			same: false,
		},
		{
			name: "polygon with a different hole",
			a: `{"type":"Polygon","coordinates":[
				[[0,0],[10,0],[10,10],[0,0]],
				[[1,1],[2,1],[2,2],[1,1]]]}`,
			b: `{"type":"Polygon","coordinates":[
				[[0,0],[10,0],[10,10],[0,0]],
				[[1,1],[3,1],[3,3],[1,1]]]}`,
			same: false,
		},
		// multi parts
		{
			name: "multi point in any order",
			a:    `{"type":"MultiPoint","coordinates":[[1,1],[2,2]]}`,
			b:    `{"type":"MultiPoint","coordinates":[[2,2],[1,1]]}`,
			same: true,
		},
		{
			name: "multi point duplicates count",
			a:    `{"type":"MultiPoint","coordinates":[[1,1],[1,1]]}`,
			b:    `{"type":"MultiPoint","coordinates":[[1,1]]}`,
			same: false,
		},
		{
			name: "multi point duplicate counts differ",
			a:    `{"type":"MultiPoint","coordinates":[[1,1],[1,1],[2,2]]}`,
			b:    `{"type":"MultiPoint","coordinates":[[1,1],[2,2],[2,2]]}`,
			same: false,
		},
		{
			name: "multi line string in any order and direction",
			a:    `{"type":"MultiLineString","coordinates":[[[1,1],[2,2]],[[3,3],[4,4],[5,5]]]}`,
			b:    `{"type":"MultiLineString","coordinates":[[[5,5],[4,4],[3,3]],[[1,1],[2,2]]]}`,
			same: true,
		},
		{
			name: "multi polygon in any order with rotated rings",
			a: `{"type":"MultiPolygon","coordinates":[
				[[[0,0],[1,0],[1,1],[0,0]]],
				[[[5,5],[6,5],[6,6],[5,5]]]]}`,
			b: `{"type":"MultiPolygon","coordinates":[
				[[[6,6],[5,5],[6,5],[6,6]]],
				[[[1,1],[0,0],[1,0],[1,1]]]]}`,
			same: true,
		},
		// geometry collections
		{
			name: "geometry collection members in any order",
			a:    `{"type":"GeometryCollection","geometries":[{"type":"Point","coordinates":[1,1]},{"type":"LineString","coordinates":[[1,1],[2,2]]}]}`,
			b:    `{"type":"GeometryCollection","geometries":[{"type":"LineString","coordinates":[[2,2],[1,1]]},{"type":"Point","coordinates":[1,1]}]}`,
			same: true,
		},
		{
			name: "geometry collection duplicates count",
			a:    `{"type":"GeometryCollection","geometries":[{"type":"Point","coordinates":[1,1]},{"type":"Point","coordinates":[1,1]}]}`,
			b:    `{"type":"GeometryCollection","geometries":[{"type":"Point","coordinates":[1,1]}]}`,
			same: false,
		},
		{
			name: "geometry collection members keep their type",
			a:    `{"type":"GeometryCollection","geometries":[{"type":"Point","coordinates":[1,1]}]}`,
			b:    `{"type":"GeometryCollection","geometries":[{"type":"MultiPoint","coordinates":[[1,1]]}]}`,
			same: false,
		},
		// types
		{
			name: "point and single part multi point are different",
			a:    `{"type":"Point","coordinates":[1,1]}`,
			b:    `{"type":"MultiPoint","coordinates":[[1,1]]}`,
			same: false,
		},
		{
			name: "line string and multi line string are different",
			a:    `{"type":"LineString","coordinates":[[1,1],[2,2]]}`,
			b:    `{"type":"MultiLineString","coordinates":[[[1,1],[2,2]]]}`,
			same: false,
		},
		{
			name: "polygon and geometry collection of it are different",
			a:    `{"type":"Polygon","coordinates":[[[0,0],[1,0],[1,1],[0,0]]]}`,
			b:    `{"type":"GeometryCollection","geometries":[{"type":"Polygon","coordinates":[[[0,0],[1,0],[1,1],[0,0]]]}]}`,
			same: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			a, b := geometryKey(t, tt.a), geometryKey(t, tt.b)
			if tt.same {
				assert.Equal(t, a, b)
			} else {
				assert.NotEqual(t, a, b)
			}
		})
	}
}

func TestGeometryKey_Invalid(t *testing.T) {
	t.Parallel()

	tests := []Geometry{
		{},
		{"type": "Unknown", "coordinates": []any{1.0, 1.0}},
		{"type": "Point"},
		{"type": "Point", "coordinates": []any{1.0}},
		{"type": "Point", "coordinates": []any{"1", "1"}},
		{"type": "LineString", "coordinates": []any{1.0, 1.0}},
		{"type": "GeometryCollection", "geometries": []any{1.0}},
	}
	for _, g := range tests {
		_, ok := GeometryKey(g)
		assert.False(t, ok, g)
	}
}

func TestMultiple_EquivalenceKeys(t *testing.T) {
	t.Parallel()

	p := `{"type":"Point","coordinates":[1,1]}`
	l := `{"type":"LineString","coordinates":[[1,1],[2,2]]}`

	m := NewMultiple(TypeGeometry, []any{p, l})
	assert.Equal(t, []string{geometryKey(t, p), geometryKey(t, l)}, m.EquivalenceKeys())
	assert.Equal(t, []string{}, NewMultiple(TypeGeometry, nil).EquivalenceKeys())
	assert.Nil(t, NewMultiple(TypeText, []any{"a"}).EquivalenceKeys())
	assert.Nil(t, NewMultiple(TypeGeometryEditor, []any{p}).EquivalenceKeys())
	assert.Nil(t, (*Multiple)(nil).EquivalenceKeys())
}

func TestValue_Equivalent(t *testing.T) {
	t.Parallel()

	line := TypeGeometry.Value(`{"type":"LineString","coordinates":[[1,1],[2,2]]}`)
	reversed := TypeGeometry.Value(`{"type":"LineString","coordinates":[[2,2],[1,1]]}`)
	other := TypeGeometry.Value(`{"type":"LineString","coordinates":[[1,1],[3,3]]}`)

	assert.True(t, line.Equivalent(reversed))
	assert.False(t, line.Equal(reversed))
	assert.False(t, line.Equivalent(other))
	assert.True(t, TypeText.Value("a").Equivalent(TypeText.Value("a")))
	assert.False(t, TypeText.Value("a").Equivalent(TypeText.Value("b")))
	assert.False(t, (*Value)(nil).Equivalent(line))
}

func TestMultiple_Equivalent(t *testing.T) {
	t.Parallel()

	p1 := `{"type":"Point","coordinates":[1,1]}`
	l := `{"type":"LineString","coordinates":[[1,1],[2,2]]}`
	lr := `{"type":"LineString","coordinates":[[2,2],[1,1]]}`

	assert.True(t, NewMultiple(TypeGeometry, []any{p1, l}).Equivalent(NewMultiple(TypeGeometry, []any{p1, lr})))
	// values of a multiple field keep their order, like the other field types
	assert.False(t, NewMultiple(TypeGeometry, []any{p1, l}).Equivalent(NewMultiple(TypeGeometry, []any{l, p1})))
	assert.False(t, NewMultiple(TypeGeometry, []any{p1}).Equivalent(NewMultiple(TypeGeometry, []any{p1, p1})))
	assert.True(t, (*Multiple)(nil).Equivalent(nil))
}
