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

	sf := NewField(f.TypeProperty()).NewID().Key(id.RandomKey()).MustBuild()
	assert.True(t, sf.IsGeometryField())
	assert.True(t, sf.SupportsPointField())
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
		{name: "bbox is removed before validation", input: `{"type":"Polygon","bbox":[0,0,1,1],"coordinates":[[[0,0],[1,0],[1,1],[0,0]]]}`},
		{name: "polygon with a hole", input: `{"type":"Polygon","coordinates":[[[0,0],[10,0],[10,10],[0,0]],[[1,1],[2,1],[2,2],[1,1]]]}`},
		{name: "multi polygon", input: `{"type":"MultiPolygon","coordinates":[[[[0,0],[1,0],[1,1],[0,0]]]]}`},
		{name: "geometry collection", input: `{"type":"GeometryCollection","geometries":[{"type":"Point","coordinates":[1,1]},{"type":"LineString","coordinates":[[1,1],[2,2]]}]}`},

		// types and properties
		{name: "missing type", input: `{"coordinates":[1,1]}`, want: ErrGeometryInvalidType},
		{name: "unknown type", input: `{"type":"Circle","coordinates":[1,1]}`, want: ErrGeometryInvalidType},
		{name: "feature is not a geometry", input: `{"type":"Feature","geometry":{"type":"Point","coordinates":[1,1]}}`, want: ErrGeometryInvalidType},
		{name: "foreign members are removed before validation", input: `{"type":"Point","coordinates":[1,1],"name":"a"}`},
		{name: "foreign members of a member are removed before validation", input: `{"type":"GeometryCollection","geometries":[{"type":"Point","coordinates":[1,1],"properties":{}}]}`},
		{name: "geometries in a point are removed before validation", input: `{"type":"Point","coordinates":[1,1],"geometries":[]}`},
		{name: "missing coordinates", input: `{"type":"Point"}`, want: ErrGeometryInvalidCoordinates},
		{name: "missing geometries", input: `{"type":"GeometryCollection"}`, want: ErrGeometryInvalidGeometries},
		{name: "geometries is not a list", input: `{"type":"GeometryCollection","geometries":{}}`, want: ErrGeometryInvalidGeometries},
		{name: "nested geometry collection", input: `{"type":"GeometryCollection","geometries":[{"type":"GeometryCollection","geometries":[]}]}`, want: ErrGeometryNestedCollection},
		{name: "member is not an object", input: `{"type":"GeometryCollection","geometries":[[1,1]]}`, want: ErrGeometryInvalidType},

		// positions
		{name: "position with 1 number", input: `{"type":"Point","coordinates":[1]}`, want: ErrGeometryInvalidPosition},
		{name: "position with 4 numbers", input: `{"type":"Point","coordinates":[1,1,1,1]}`, want: ErrGeometryInvalidPosition},
		{name: "position with a string", input: `{"type":"Point","coordinates":["1",1]}`, want: ErrGeometryInvalidCoordinates},
		{name: "position with null altitude", input: `{"type":"Point","coordinates":[1,1,null]}`, want: ErrGeometryInvalidCoordinates},
		{name: "position is not a list", input: `{"type":"MultiPoint","coordinates":[1,1]}`, want: ErrGeometryInvalidCoordinates},
		{name: "null coordinates", input: `{"type":"Point","coordinates":null}`, want: ErrGeometryInvalidCoordinates},
		{name: "ring position with a string", input: `{"type":"Polygon","coordinates":[[[0,0],[1,0],[1,1],[0,"0"]]]}`, want: ErrGeometryInvalidCoordinates},
		{name: "polygon nested too shallowly", input: `{"type":"Polygon","coordinates":[[0,0],[1,0],[1,1],[0,0]]}`, want: ErrGeometryInvalidCoordinates},
		{name: "invalid coordinates are reported before out of range ones", input: `{"type":"LineString","coordinates":[[200,0],["a",0]]}`, want: ErrGeometryInvalidCoordinates},
		{name: "invalid coordinates in a geometry collection member", input: `{"type":"GeometryCollection","geometries":[{"type":"Point","coordinates":["a",1]}]}`, want: ErrGeometryInvalidCoordinates},
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
		{name: "empty multi point", input: `{"type":"MultiPoint","coordinates":[]}`, want: ErrGeometryEmpty},
		{name: "empty multi line string", input: `{"type":"MultiLineString","coordinates":[]}`, want: ErrGeometryEmpty},
		{name: "polygon without rings", input: `{"type":"Polygon","coordinates":[]}`, want: ErrGeometryEmpty},
		{name: "empty multi polygon", input: `{"type":"MultiPolygon","coordinates":[]}`, want: ErrGeometryEmpty},
		{name: "multi polygon with a polygon without rings", input: `{"type":"MultiPolygon","coordinates":[[[[0,0],[1,0],[1,1],[0,0]]],[]]}`, want: ErrGeometryEmpty},
		{name: "empty geometry collection", input: `{"type":"GeometryCollection","geometries":[]}`, want: ErrGeometryEmpty},
		{name: "geometry collection with only coordinates", input: `{"type":"GeometryCollection","geometries":[],"coordinates":[]}`, want: ErrGeometryEmpty},
		{name: "empty member of a geometry collection", input: `{"type":"GeometryCollection","geometries":[{"type":"MultiPoint","coordinates":[]}]}`, want: ErrGeometryEmpty},
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

	tests := []struct {
		name string
		v    *value.Value
	}{
		{name: "text", v: value.TypeText.Value("a")},
		{name: "geometry editor", v: value.TypeGeometryEditor.Value(`{"type":"Point","coordinates":[1,1]}`)},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.ErrorIs(t, NewGeometry().Validate(tt.v), ErrInvalidValue)
		})
	}
}

func TestField_ValidateValue_Geometry(t *testing.T) {
	t.Parallel()

	f := NewField(NewGeometry().TypeProperty()).NewID().Key(id.RandomKey()).MustBuild()
	errs := f.Validate(value.NewMultiple(value.TypeGeometry, []any{`{"type":"MultiPoint","coordinates":[]}`}))
	if assert.Len(t, errs, 1) {
		assert.Equal(t, f.ID().Ref(), errs[0].Field)
		assert.Equal(t, f.Key().Ref(), errs[0].Key)
		assert.Equal(t, FieldValidationCodeInvalidGeoStructure, errs[0].Code)
		assert.ErrorIs(t, errs[0], ErrGeometryEmpty)
	}
}

func TestGeometryErrors_InvalidGeoStructure(t *testing.T) {
	t.Parallel()

	f := NewField(NewGeometry().TypeProperty()).NewID().Key(id.RandomKey()).MustBuild()
	for _, err := range []error{
		ErrGeometryInvalidType, ErrGeometryEmpty, ErrGeometryInvalidCoordinates, ErrGeometryInvalidGeometries,
		ErrGeometryInvalidPosition, ErrGeometryLongitudeOutOfRange, ErrGeometryLatitudeOutOfRange, ErrGeometryReversedCoordinates,
		ErrGeometryLineStringTooShort, ErrGeometryRingTooShort, ErrGeometryRingNotClosed, ErrGeometryNestedCollection,
	} {
		assert.Equal(t, FieldValidationCodeInvalidGeoStructure, f.ValidationError(err, FieldValidationCodeConstraint).Code, err.Error())
	}
}
