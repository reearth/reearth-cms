package schema

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestGeometryEditorSupportedTypeFrom(t *testing.T) {
	tests := []struct {
		name string
		arg  string
		want GeometryEditorSupportedType
	}{
		{
			name: "point",
			arg:  "point",
			want: GeometryEditorSupportedTypePoint,
		},
		{
			name: "point",
			arg:  "POINT",
			want: GeometryEditorSupportedTypePoint,
		},
		{
			name: "lineString",
			arg:  "LINESTRING",
			want: GeometryEditorSupportedTypeLineString,
		},
		{
			name: "polygon",
			arg:  "POLYGON",
			want: GeometryEditorSupportedTypePolygon,
		},
		{
			name: "any",
			arg:  "ANY",
			want: GeometryEditorSupportedTypeAny,
		},
		{
			name: "default",
			arg:  "foo",
			want: "",
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(tt *testing.T) {
			tt.Parallel()
			assert.Equal(tt, tc.want, GeometryEditorSupportedTypeFrom(tc.arg))
		})
	}
}
