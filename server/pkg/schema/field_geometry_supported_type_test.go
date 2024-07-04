package schema

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestGeometrySupportedTypeFrom(t *testing.T) {
	tests := []struct {
		name string
		arg  string
		want GeometrySupportedType
	}{
		{
			name: "point",
			arg:  "point",
			want: GeometrySupportedTypePoint,
		},
		{
			name: "point",
			arg:  "POINT",
			want: GeometrySupportedTypePoint,
		},
		{
			name: "multiPoint",
			arg:  "MULTIPOINT",
			want: GeometrySupportedTypeMultiPoint,
		},
		{
			name: "lineString",
			arg:  "LINESTRING",
			want: GeometrySupportedTypeLineString,
		},
		{
			name: "multiLineString",
			arg:  "MULTILINESTRING",
			want: GeometrySupportedTypeMultiLineString,
		},
		{
			name: "polygon",
			arg:  "POLYGON",
			want: GeometrySupportedTypePolygon,
		},
		{
			name: "multiPolygon",
			arg:  "MULTIPOLYGON",
			want: GeometrySupportedTypeMultiPolygon,
		},
		{
			name: "geometryCollection",
			arg:  "GEOMETRYCOLLECTION",
			want: GeometrySupportedTypeGeometryCollection,
		},
		{
			name: "any",
			arg:  "ANY",
			want: GeometrySupportedTypeAny,
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
			assert.Equal(tt, tc.want, GeometrySupportedTypeFrom(tc.arg))
		})
	}
}
