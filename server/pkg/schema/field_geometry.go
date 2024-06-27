package schema

import "github.com/reearth/reearth-cms/server/pkg/value"

type FieldGeometry struct {
	p *FieldString
}

func NewGeometry() *FieldGeometry {
	return &FieldGeometry{
		p: NewString(value.TypeGeometry, nil),
	}
}

func (f *FieldGeometry) TypeProperty() *TypeProperty {
	return &TypeProperty{
		t:     f.Type(),
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
	return &FieldGeometry{
		p: f.p.Clone(),
	}
}

func (f *FieldGeometry) Validate(v *value.Value) error {
	return f.p.Validate(v)
}

func (f *FieldGeometry) ValidateMultiple(v *value.Multiple) error {
	return nil
}
