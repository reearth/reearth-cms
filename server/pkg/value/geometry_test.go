package value

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func Test_propertyGeometry_ToValue(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name string
		args any
		want any
		ok   bool
	}{
		{
			name: "without bbox",
			args: `{"type":"Point","coordinates":[1,2]}`,
			want: Json{"type": "Point", "coordinates": []any{1.0, 2.0}},
			ok:   true,
		},
		{
			name: "bbox is removed",
			args: `{"type":"LineString","bbox":[1,2,3,4],"coordinates":[[1,2],[3,4]]}`,
			want: Json{"type": "LineString", "coordinates": []any{[]any{1.0, 2.0}, []any{3.0, 4.0}}},
			ok:   true,
		},
		{
			name: "bbox is removed from collection members",
			args: map[string]any{"type": "GeometryCollection", "bbox": []any{1, 2, 1, 2}, "geometries": []any{
				map[string]any{"type": "Point", "bbox": []any{1, 2, 1, 2}, "coordinates": []any{1, 2}},
			}},
			want: Json{"type": "GeometryCollection", "geometries": []any{Json{"type": "Point", "coordinates": []any{1.0, 2.0}}}},
			ok:   true,
		},
		{
			name: "foreign members are removed",
			args: `{"type":"Point","coordinates":[1,2],"name":"a","properties":{"b":1}}`,
			want: Json{"type": "Point", "coordinates": []any{1.0, 2.0}},
			ok:   true,
		},
		{
			name: "members of another geometry type are removed",
			args: `{"type":"Point","coordinates":[1,2],"geometries":[]}`,
			want: Json{"type": "Point", "coordinates": []any{1.0, 2.0}},
			ok:   true,
		},
		{
			name: "coordinates are removed from a geometry collection",
			args: `{"type":"GeometryCollection","geometries":[],"coordinates":[]}`,
			want: Json{"type": "GeometryCollection", "geometries": []any{}},
			ok:   true,
		},
		{
			name: "foreign members are removed from collection members",
			args: `{"type":"GeometryCollection","geometries":[{"type":"Point","coordinates":[1,2],"id":1}]}`,
			want: Json{"type": "GeometryCollection", "geometries": []any{Json{"type": "Point", "coordinates": []any{1.0, 2.0}}}},
			ok:   true,
		},
		{
			name: "a geometry with an unknown type is kept",
			args: `{"type":"Feature","geometry":{"type":"Point","coordinates":[1,2]},"properties":{}}`,
			want: Json{"type": "Feature", "geometry": Json{"type": "Point", "coordinates": []any{1.0, 2.0}}, "properties": Json{}},
			ok:   true,
		},
		{name: "invalid json", args: "{", want: nil, ok: false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			got, ok := (&propertyGeometry{}).ToValue(tt.args)
			assert.Equal(t, tt.ok, ok)
			assert.Equal(t, tt.want, got)
		})
	}
}

func Test_propertyGeometry_ToValue_DoesNotModifyInput(t *testing.T) {
	t.Parallel()

	in := map[string]any{"type": "Point", "bbox": []any{1, 2, 1, 2}, "coordinates": []any{1, 2}, "name": "a"}
	_, ok := (&propertyGeometry{}).ToValue(in)
	assert.True(t, ok)
	assert.Contains(t, in, "bbox")
	assert.Contains(t, in, "name")
}
