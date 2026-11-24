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
		{name: "polygon with a hole", input: `{"type":"Polygon","coordinates":[[[0,0],[10,0],[10,10],[0,0]],[[1,1],[2,1],[2,2],[1,1]]]}`},
		{name: "multi polygon", input: `{"type":"MultiPolygon","coordinates":[[[[0,0],[1,0],[1,1],[0,0]]]]}`},
		{name: "geometry collection", input: `{"type":"GeometryCollection","geometries":[{"type":"Point","coordinates":[1,1]},{"type":"LineString","coordinates":[[1,1],[2,2]]}]}`},

		// empty geometries are accepted, like the web editor
		{name: "empty multi point", input: `{"type":"MultiPoint","coordinates":[]}`},
		{name: "empty multi line string", input: `{"type":"MultiLineString","coordinates":[]}`},
		{name: "polygon without rings", input: `{"type":"Polygon","coordinates":[]}`},
		{name: "empty multi polygon", input: `{"type":"MultiPolygon","coordinates":[]}`},
		{name: "multi polygon with a polygon without rings", input: `{"type":"MultiPolygon","coordinates":[[[[0,0],[1,0],[1,1],[0,0]]],[]]}`},
		{name: "empty geometry collection", input: `{"type":"GeometryCollection","geometries":[]}`},
		{name: "empty member of a geometry collection", input: `{"type":"GeometryCollection","geometries":[{"type":"MultiPoint","coordinates":[]}]}`},
		// valid bbox
		{name: "bbox of a point", input: `{"type":"Point","bbox":[139.7,35.6,139.7,35.6],"coordinates":[139.7,35.6]}`},
		{name: "bbox of a polygon", input: `{"type":"Polygon","bbox":[0,0,1,1],"coordinates":[[[0,0],[1,0],[1,1],[0,0]]]}`},
		{name: "bbox larger than needed", input: `{"type":"LineString","bbox":[-10,-10,10,10],"coordinates":[[1,1],[2,2]]}`},
		{name: "bbox with altitude", input: `{"type":"LineString","bbox":[1,1,10,2,2,250],"coordinates":[[1,1,10],[2,2,250]]}`},
		{name: "bbox of mixed dimensions with 4 numbers", input: `{"type":"LineString","bbox":[1,1,2,2],"coordinates":[[1,1],[2,2,5]]}`},
		{name: "bbox of mixed dimensions with 6 numbers", input: `{"type":"LineString","bbox":[1,1,5,2,2,5],"coordinates":[[1,1],[2,2,5]]}`},
		{name: "bbox crossing the antimeridian", input: `{"type":"LineString","bbox":[177,-20,-178,-16],"coordinates":[[177,-20],[-178,-16]]}`},
		{name: "bbox containing a pole", input: `{"type":"Polygon","bbox":[-180,80,180,90],"coordinates":[[[-180,80],[0,80],[180,80],[-180,80]]]}`},
		{name: "bbox of a geometry collection and its members", input: `{"type":"GeometryCollection","bbox":[100,0,102,1],"geometries":[{"type":"Point","bbox":[100,0,100,0],"coordinates":[100,0]},{"type":"LineString","coordinates":[[101,0],[102,1]]}]}`},
		// like the web editor, a bbox is not checked against the coordinates
		{name: "bbox not containing its geometry", input: `{"type":"LineString","bbox":[1,1,2,2],"coordinates":[[1,1],[3,3]]}`},
		{name: "bbox with altitude around positions without one", input: `{"type":"Point","bbox":[1,1,0,1,1,0],"coordinates":[1,1]}`},
		{name: "bbox of a multi polygon", input: `{"type":"MultiPolygon","bbox":[0,0,11,11],"coordinates":[[[[0,0],[1,0],[1,1],[0,0]]],[[[10,10],[11,10],[11,11],[10,10]]]]}`},

		// invalid bbox
		{name: "bbox is not a list", input: `{"type":"Point","bbox":"1,1,1,1","coordinates":[1,1]}`, want: ErrGeometryInvalidBBox},
		{name: "bbox with a string", input: `{"type":"Point","bbox":[1,1,1,"1"],"coordinates":[1,1]}`, want: ErrGeometryInvalidBBox},
		{name: "bbox with too few numbers", input: `{"type":"Point","bbox":[1,1],"coordinates":[1,1]}`, want: ErrGeometryInvalidBBox},
		{name: "bbox with 5 numbers", input: `{"type":"Point","bbox":[1,1,1,1,1],"coordinates":[1,1]}`, want: ErrGeometryInvalidBBox},
		{name: "bbox is null", input: `{"type":"Point","bbox":null,"coordinates":[1,1]}`, want: ErrGeometryInvalidBBox},
		{name: "invalid bbox of a geometry collection member", input: `{"type":"GeometryCollection","geometries":[{"type":"Point","bbox":[0,0,200,1],"coordinates":[1,1]}]}`, want: ErrGeometryBBoxOutOfRange},
		{name: "bbox longitude out of range", input: `{"type":"Point","bbox":[-181,1,1,1],"coordinates":[1,1]}`, want: ErrGeometryBBoxOutOfRange},
		{name: "bbox latitude out of range", input: `{"type":"Point","bbox":[1,1,1,91],"coordinates":[1,1]}`, want: ErrGeometryBBoxOutOfRange},
		{name: "bbox south greater than north", input: `{"type":"Point","bbox":[0,2,2,0],"coordinates":[1,1]}`, want: ErrGeometryBBoxOutOfRange},
		{name: "bbox minimum altitude greater than maximum", input: `{"type":"Point","bbox":[1,1,10,1,1,0],"coordinates":[1,1,5]}`, want: ErrGeometryBBoxOutOfRange},
		{name: "coordinates are reported before the bbox", input: `{"type":"Point","bbox":[0,0,0,0],"coordinates":[200,0]}`, want: ErrGeometryLongitudeOutOfRange},

		// types and properties
		{name: "missing type", input: `{"coordinates":[1,1]}`, want: ErrGeometryInvalidType},
		{name: "unknown type", input: `{"type":"Circle","coordinates":[1,1]}`, want: ErrGeometryInvalidType},
		{name: "feature is not a geometry", input: `{"type":"Feature","geometry":{"type":"Point","coordinates":[1,1]}}`, want: ErrGeometryInvalidType},
		{name: "unknown property", input: `{"type":"Point","coordinates":[1,1],"name":"a"}`, want: ErrGeometryUnknownProperty},
		{name: "unknown property in a member", input: `{"type":"GeometryCollection","geometries":[{"type":"Point","coordinates":[1,1],"properties":{}}]}`, want: ErrGeometryUnknownProperty},
		{name: "geometries in a point", input: `{"type":"Point","coordinates":[1,1],"geometries":[]}`, want: ErrGeometryUnknownProperty},
		{name: "coordinates in a geometry collection", input: `{"type":"GeometryCollection","geometries":[],"coordinates":[]}`, want: ErrGeometryUnknownProperty},
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
	errs := f.Validate(value.NewMultiple(value.TypeGeometry, []any{`{"type":"Point","coordinates":[1,1],"foo":1}`}))
	if assert.Len(t, errs, 1) {
		assert.Equal(t, f.ID().Ref(), errs[0].Field)
		assert.Equal(t, f.Key().Ref(), errs[0].Key)
		assert.Equal(t, FieldValidationCodeInvalidGeoStructure, errs[0].Code)
		assert.ErrorIs(t, errs[0], ErrGeometryUnknownProperty)
	}
}

func TestGeometryErrors_InvalidGeoStructure(t *testing.T) {
	t.Parallel()

	f := NewField(NewGeometry().TypeProperty()).NewID().Key(id.RandomKey()).MustBuild()
	for _, err := range []error{
		ErrGeometryInvalidType, ErrGeometryUnknownProperty, ErrGeometryInvalidCoordinates, ErrGeometryInvalidGeometries,
		ErrGeometryInvalidPosition, ErrGeometryLongitudeOutOfRange, ErrGeometryLatitudeOutOfRange, ErrGeometryReversedCoordinates,
		ErrGeometryLineStringTooShort, ErrGeometryRingTooShort, ErrGeometryRingNotClosed, ErrGeometryNestedCollection,
		ErrGeometryInvalidBBox, ErrGeometryBBoxOutOfRange,
	} {
		assert.Equal(t, FieldValidationCodeInvalidGeoStructure, f.ValidationError(err, FieldValidationCodeConstraint).Code, err.Error())
	}
}

func TestField_Geometry_BBoxIsStored(t *testing.T) {
	t.Parallel()

	withBBox := value.NewMultiple(value.TypeGeometry, []any{`{"type":"GeometryCollection","bbox":[1,1,2,2],"geometries":[{"type":"Point","bbox":[1,1,1,1],"coordinates":[1,1]},{"type":"Point","coordinates":[2,2]}]}`})

	t.Run("parsed values", func(t *testing.T) {
		t.Parallel()
		f := NewField(NewGeometry().TypeProperty()).NewID().Key(id.RandomKey()).Multiple(true).MustBuild()
		m, errs := f.ParseValue(withBBox.Interface())
		assert.Empty(t, errs)
		assert.Equal(t, withBBox, m)
	})

	t.Run("parsed values with an invalid bbox are rejected", func(t *testing.T) {
		t.Parallel()
		f := NewField(NewGeometry().TypeProperty()).NewID().Key(id.RandomKey()).MustBuild()
		_, errs := f.ParseValue(`{"type":"Point","bbox":[0,0,200,1],"coordinates":[1,1]}`)
		if assert.Len(t, errs, 1) {
			assert.ErrorIs(t, errs[0], ErrGeometryBBoxOutOfRange)
		}
	})

	t.Run("default values", func(t *testing.T) {
		t.Parallel()
		f := NewField(NewGeometry().TypeProperty()).NewID().Key(id.RandomKey()).MustBuild()
		assert.NoError(t, f.SetDefaultValue(withBBox))
		assert.Equal(t, withBBox, f.DefaultValue())
	})

	t.Run("default values with an invalid bbox are rejected", func(t *testing.T) {
		t.Parallel()
		f := NewField(NewGeometry().TypeProperty()).NewID().Key(id.RandomKey()).MustBuild()
		err := f.SetDefaultValue(value.NewMultiple(value.TypeGeometry, []any{`{"type":"Point","bbox":[0,0,200,1],"coordinates":[1,1]}`}))
		assert.ErrorIs(t, err, ErrGeometryBBoxOutOfRange)
		assert.Nil(t, f.DefaultValue())
	})
}

func TestFieldGeometry_ValidateMultiple(t *testing.T) {
	t.Parallel()

	repeat := func(n int, v string) []any {
		res := make([]any, n)
		for i := range res {
			res[i] = v
		}
		return res
	}
	multiPoint := func(positions int) string {
		return `{"type":"MultiPoint","coordinates":[` + strings.TrimSuffix(strings.Repeat("[1,1],", positions), ",") + `]}`
	}

	tests := []struct {
		name   string
		values []any
		want   error
	}{
		{name: "1,000 geometries", values: repeat(1_000, `{"type":"Point","coordinates":[1,1]}`)},
		{name: "1,001 geometries", values: repeat(1_001, `{"type":"Point","coordinates":[1,1]}`), want: ErrGeometryTooManyGeometries},
		{name: "100,000 coordinates", values: repeat(100, multiPoint(1_000))},
		{name: "100,001 coordinates", values: append(repeat(100, multiPoint(1_000)), `{"type":"Point","coordinates":[1,1]}`), want: ErrGeometryTooManyCoordinates},
		{
			name:   "coordinates of every type are counted",
			values: append(repeat(99, multiPoint(1_000)), `{"type":"GeometryCollection","geometries":[{"type":"MultiPolygon","coordinates":[[[[0,0],[1,0],[1,1],[0,0]]]]},{"type":"Point","coordinates":[1,1]}]}`, multiPoint(996)),
			want:   ErrGeometryTooManyCoordinates,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			err := NewGeometry().ValidateMultiple(value.NewMultiple(value.TypeGeometry, tt.values))
			if tt.want == nil {
				assert.NoError(t, err)
			} else {
				assert.ErrorIs(t, err, tt.want)
			}
		})
	}
}

func TestGeometryErrors_MaxSizeExceeded(t *testing.T) {
	t.Parallel()

	f := NewField(NewGeometry().TypeProperty()).NewID().Key(id.RandomKey()).Multiple(true).MustBuild()
	for _, err := range []error{ErrGeometryTooManyGeometries, ErrGeometryTooManyCoordinates} {
		assert.Equal(t, FieldValidationCodeMaxSizeExceeded, f.ValidationError(err, FieldValidationCodeConstraint).Code, err.Error())
	}

	errs := f.Validate(value.NewMultiple(value.TypeGeometry, func() []any {
		res := make([]any, 1_001)
		for i := range res {
			res[i] = `{"type":"Point","coordinates":[1,1]}`
		}
		return res
	}()))
	if assert.Len(t, errs, 1) {
		assert.Equal(t, FieldValidationCodeMaxSizeExceeded, errs[0].Code)
		assert.ErrorIs(t, errs[0], ErrGeometryTooManyGeometries)
	}
}
