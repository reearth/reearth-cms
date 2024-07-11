package schema

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestGeometryObjectSupportedTypeFrom(t *testing.T) {
	tests := []struct {
		name string
		arg  string
		want GeometryObjectSupportedType
	}{
		{
			name: "point",
			arg:  "point",
			want: GeometryObjectSupportedTypePoint,
		},
		{
			name: "point",
			arg:  "POINT",
			want: GeometryObjectSupportedTypePoint,
		},
		{
			name: "multiPoint",
			arg:  "MULTIPOINT",
			want: GeometryObjectSupportedTypeMultiPoint,
		},
		{
			name: "lineString",
			arg:  "LINESTRING",
			want: GeometryObjectSupportedTypeLineString,
		},
		{
			name: "multiLineString",
			arg:  "MULTILINESTRING",
			want: GeometryObjectSupportedTypeMultiLineString,
		},
		{
			name: "polygon",
			arg:  "POLYGON",
			want: GeometryObjectSupportedTypePolygon,
		},
		{
			name: "multiPolygon",
			arg:  "MULTIPOLYGON",
			want: GeometryObjectSupportedTypeMultiPolygon,
		},
		{
			name: "geometryCollection",
			arg:  "GEOMETRYCOLLECTION",
			want: GeometryObjectSupportedTypeGeometryCollection,
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
			assert.Equal(tt, tc.want, GeometryObjectSupportedTypeFrom(tc.arg))
		})
	}
}
