package schema

import "github.com/reearth/reearth-cms/server/pkg/value"

type FieldLineString struct {
	t value.Type
}

func NewLineString(t value.Type) *FieldLineString {
	return &FieldLineString{
		t: t,
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
		t: f.t,
	}
}

func (f *FieldLineString) Validate(v *value.Value) error {
	return nil
}

func (f *FieldLineString) ValidateMultiple(v *value.Multiple) error {
	return nil
}
