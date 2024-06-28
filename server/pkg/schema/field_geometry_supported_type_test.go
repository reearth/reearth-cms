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
			name: "multiPoint",
			arg:  "multiPoint",
			want: GeometrySupportedTypeMultiPoint,
		},
		{
			name: "lineString",
			arg:  "lineString",
			want: GeometrySupportedTypeLineString,
		},
		{
			name: "multiLineString",
			arg:  "multiLineString",
			want: GeometrySupportedTypeMultiLineString,
		},
		{
			name: "polygon",
			arg:  "polygon",
			want: GeometrySupportedTypePolygon,
		},
		{
			name: "multiPolygon",
			arg:  "multiPolygon",
			want: GeometrySupportedTypeMultiPolygon,
		},
		{
			name: "geometryCollection",
			arg:  "geometryCollection",
			want: GeometrySupportedTypeGeometryCollection,
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
