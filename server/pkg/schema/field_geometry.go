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
		Geometry: func(g value.Geometry) {
			err = validateGeometry(g)
		},
		Default: func() {
			err = ErrInvalidValue
		},
	})
	return
}

func (f *FieldGeometry) ValidateMultiple(_ *value.Multiple) error {
	return nil
}
