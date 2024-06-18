package schema

import "github.com/reearth/reearth-cms/server/pkg/value"

type FieldLineString struct {
	p FieldLineString
}

func NewLineString() *FieldLineString {
	return &FieldLineString{
		p: NewLineString(value.TypeLineString),
	}
}

func (f *FieldLineString) TypeProperty() *TypeProperty {
	return &TypeProperty{
		t:       f.Type(),
		lineString: f,
	}
}

func (f *FieldLineString) Type() value.Type {
	return value.TypeLineString
}

func (f *FieldLineString) Clone() *FieldLineString {
	if f == nil {
		return nil
	}
	return &FieldLineString{
		p: f.p.Clone(),
	}
}

func (f *FieldLineString) Validate(v *value.Value) error {
	return f.p.Validate(v)
}

func (f *FieldLineString) ValidateMultiple(v *value.Multiple) error {
	return nil
}
