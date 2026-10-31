package schema

import (
	"strings"
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/stretchr/testify/assert"
)

func TestNewGeometry(t *testing.T) {
	t.Parallel()

	f := NewGeometry()
	assert.Equal(t, &FieldGeometry{}, f)
	assert.Equal(t, value.TypeGeometry, f.Type())
	assert.Equal(t, &TypeProperty{t: value.TypeGeometry, geometry: f}, f.TypeProperty())
	assert.Equal(t, f, f.Clone())
	assert.Nil(t, (*FieldGeometry)(nil).Clone())
	assert.NoError(t, f.ValidateMultiple(nil))
}

func TestFieldGeometry_Validate(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name  string
		input string
		want  error
	}{
		// valid geometries
		{name: "point", input: `{"type":"Point","coordinates":[139.7,35.6]}`},
		{name: "point with altitude", input: `{"type":"Point","coordinates":[139.7,35.6,50]}`},
		{name: "point on the boundaries", input: `{"type":"Point","coordinates":[-180,90]}`},
		{name: "multi point", input: `{"type":"MultiPoint","coordinates":[[1,1],[2,2]]}`},
		{name: "line string", input: `{"type":"LineString","coordinates":[[1,1],[2,2]]}`},
		{name: "multi line string", input: `{"type":"MultiLineString","coordinates":[[[1,1],[2,2]],[[3,3],[4,4]]]}`},
		{name: "polygon", input: `{"type":"Polygon","coordinates":[[[0,0],[1,0],[1,1],[0,0]]]}`},
		{name: "polygon with a hole", input: `{"type":"Polygon","coordinates":[[[0,0],[10,0],[10,10],[0,0]],[[1,1],[2,1],[2,2],[1,1]]]}`},
		{name: "multi polygon", input: `{"type":"MultiPolygon","coordinates":[[[[0,0],[1,0],[1,1],[0,0]]]]}`},
		{name: "geometry collection", input: `{"type":"GeometryCollection","geometries":[{"type":"Point","coordinates":[1,1]},{"type":"LineString","coordinates":[[1,1],[2,2]]}]}`},

		// types and properties
		{name: "missing type", input: `{"coordinates":[1,1]}`, want: ErrGeometryInvalidType},
		{name: "unknown type", input: `{"type":"Circle","coordinates":[1,1]}`, want: ErrGeometryInvalidType},
		{name: "feature is not a geometry", input: `{"type":"Feature","geometry":{"type":"Point","coordinates":[1,1]}}`, want: ErrGeometryInvalidType},
		{name: "unknown property", input: `{"type":"Point","coordinates":[1,1],"name":"a"}`, want: ErrGeometryUnknownProperty},
		{name: "unknown property in a member", input: `{"type":"GeometryCollection","geometries":[{"type":"Point","coordinates":[1,1],"properties":{}}]}`, want: ErrGeometryUnknownProperty},
		{name: "geometries in a point", input: `{"type":"Point","coordinates":[1,1],"geometries":[]}`, want: ErrGeometryUnknownProperty},
		{name: "coordinates in a geometry collection", input: `{"type":"GeometryCollection","geometries":[],"coordinates":[]}`, want: ErrGeometryUnknownProperty},
		{name: "missing coordinates", input: `{"type":"Point"}`, want: ErrGeometryInvalidCoordinates},
		{name: "missing geometries", input: `{"type":"GeometryCollection"}`, want: ErrGeometryInvalidCoordinates},
		{name: "nested geometry collection", input: `{"type":"GeometryCollection","geometries":[{"type":"GeometryCollection","geometries":[]}]}`, want: ErrGeometryNestedCollection},
		{name: "member is not an object", input: `{"type":"GeometryCollection","geometries":[[1,1]]}`, want: ErrGeometryInvalidType},

		// positions
		{name: "position with 1 number", input: `{"type":"Point","coordinates":[1]}`, want: ErrGeometryInvalidPosition},
		{name: "position with 4 numbers", input: `{"type":"Point","coordinates":[1,1,1,1]}`, want: ErrGeometryInvalidPosition},
		{name: "position with a string", input: `{"type":"Point","coordinates":["1",1]}`, want: ErrGeometryInvalidPosition},
		{name: "position with null altitude", input: `{"type":"Point","coordinates":[1,1,null]}`, want: ErrGeometryInvalidPosition},
		{name: "position is not a list", input: `{"type":"MultiPoint","coordinates":[1,1]}`, want: ErrGeometryInvalidCoordinates},
		{name: "longitude out of range", input: `{"type":"Point","coordinates":[180.1,35.6]}`, want: ErrGeometryLongitudeOutOfRange},
		{name: "latitude out of range", input: `{"type":"Point","coordinates":[139.7,90.1]}`, want: ErrGeometryLatitudeOutOfRange},
		{name: "latitude far out of range", input: `{"type":"Point","coordinates":[10,200]}`, want: ErrGeometryLatitudeOutOfRange},
		{name: "reversed coordinates", input: `{"type":"Point","coordinates":[35.6,139.7]}`, want: ErrGeometryReversedCoordinates},
		{name: "reversed coordinates in a line string", input: `{"type":"LineString","coordinates":[[139.7,35.6],[35.6,139.7]]}`, want: ErrGeometryReversedCoordinates},

		// line strings and rings
		{name: "line string with 1 position", input: `{"type":"LineString","coordinates":[[1,1]]}`, want: ErrGeometryLineStringTooShort},
		{name: "multi line string with a short line", input: `{"type":"MultiLineString","coordinates":[[[1,1],[2,2]],[[1,1]]]}`, want: ErrGeometryLineStringTooShort},
		{name: "ring with 3 positions", input: `{"type":"Polygon","coordinates":[[[0,0],[1,0],[0,0]]]}`, want: ErrGeometryRingTooShort},
		{name: "ring not closed", input: `{"type":"Polygon","coordinates":[[[0,0],[1,0],[1,1],[0,1]]]}`, want: ErrGeometryRingNotClosed},
		{name: "ring closed with a different altitude", input: `{"type":"Polygon","coordinates":[[[0,0,1],[1,0],[1,1],[0,0]]]}`, want: ErrGeometryRingNotClosed},
		{name: "hole not closed", input: `{"type":"Polygon","coordinates":[[[0,0],[10,0],[10,10],[0,0]],[[1,1],[2,1],[2,2],[1,2]]]}`, want: ErrGeometryRingNotClosed},
		{name: "multi polygon with an invalid ring", input: `{"type":"MultiPolygon","coordinates":[[[[0,0],[1,0],[0,0]]]]}`, want: ErrGeometryRingTooShort},
		{name: "invalid member of a geometry collection", input: `{"type":"GeometryCollection","geometries":[{"type":"LineString","coordinates":[[1,1]]}]}`, want: ErrGeometryLineStringTooShort},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			v := value.TypeGeometry.Value(tt.input)
			assert.NotNil(t, v)
			err := NewGeometry().Validate(v)
			if tt.want == nil {
				assert.NoError(t, err)
			} else {
				assert.ErrorIs(t, err, tt.want)
			}
		})
	}
}

func TestFieldGeometry_Validate_Size(t *testing.T) {
	t.Parallel()

	coords := strings.Repeat("[139.7,35.6],", maxGeoFieldBytes/12)
	v := value.TypeGeometry.Value(`{"type":"MultiPoint","coordinates":[` + coords + `[139.7,35.6]]}`)
	assert.ErrorIs(t, NewGeometry().Validate(v), ErrGeoFieldMaxSizeExceeded)
}

func TestFieldGeometry_Validate_WrongType(t *testing.T) {
	t.Parallel()

	assert.ErrorIs(t, NewGeometry().Validate(value.TypeText.Value("a")), ErrInvalidValue)
	assert.ErrorIs(t, NewGeometry().Validate(value.TypeGeometryEditor.Value(`{"type":"Point","coordinates":[1,1]}`)), ErrInvalidValue)
}

func TestField_ValidateValue_Geometry(t *testing.T) {
	t.Parallel()

	f := NewField(NewGeometry().TypeProperty()).NewID().Key(id.RandomKey()).MustBuild()
	errs := f.Validate(value.NewMultiple(value.TypeGeometry, []any{`{"type":"Point","coordinates":[1,1],"foo":1}`}))
	if assert.Len(t, errs, 1) {
		assert.Equal(t, f.ID().Ref(), errs[0].Field)
		assert.Equal(t, f.Key().Ref(), errs[0].Key)
		assert.Equal(t, FieldValidationCodeInvalidGeoStructure, errs[0].Code)
		assert.ErrorIs(t, errs[0], ErrGeometryUnknownProperty)
	}
}
