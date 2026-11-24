package schema

import "github.com/reearth/reearth-cms/server/pkg/value"

// FieldGeometry is the unified geometry field. It accepts any GeoJSON geometry and has no geometry-specific configuration.
type FieldGeometry struct{}

func NewGeometry() *FieldGeometry {
	return &FieldGeometry{}
}

func (f *FieldGeometry) TypeProperty() *TypeProperty {
	return &TypeProperty{
		t:        f.Type(),
		geometry: f,
	}
}

func (f *FieldGeometry) Type() value.Type {
	return value.TypeGeometry
}

func (f *FieldGeometry) Clone() *FieldGeometry {
	if f == nil {
		return nil
	}
	return &FieldGeometry{}
}

func (f *FieldGeometry) Validate(v *value.Value) (err error) {
	v.Match(value.Match{
		Geometry: func(g value.Json) {
			err = validateGeometry(g)
		},
		Default: func() {
			err = ErrInvalidValue
		},
	})
	return
}

// ValidateMultiple checks the limits of the whole field value: the number of geometries and of positions.
func (f *FieldGeometry) ValidateMultiple(m *value.Multiple) error {
	if m.Len() > maxGeometriesPerValue {
		return ErrGeometryTooManyGeometries
	}
	positions := 0
	for _, v := range m.Values() {
		if g, ok := v.ValueJson(); ok {
			positions += countGeometryPositions(g)
		}
	}
	if positions > maxPositionsPerValue {
		return ErrGeometryTooManyCoordinates
	}
	return nil
}
