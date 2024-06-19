package schema

import "github.com/reearth/reearth-cms/server/pkg/value"

type FieldPoint struct {
	p *FieldPosition
}

func NewPoint() *FieldPoint {
	return &FieldPoint{
		p: NewPosition(value.TypePoint),
	}
}

func (f *FieldPoint) TypeProperty() *TypeProperty {
	return &TypeProperty{
		t:     f.Type(),
		point: f,
	}
}

func (f *FieldPoint) Type() value.Type {
	return value.TypePoint
}

func (f *FieldPoint) Clone() *FieldPoint {
	if f == nil {
		return nil
	}
	return &FieldPoint{
		p: f.p.Clone(),
	}
}

func (f *FieldPoint) Validate(v *value.Value) error {
	return f.p.Validate(v)
}

func (f *FieldPoint) ValidateMultiple(v *value.Multiple) error {
	return nil
}
