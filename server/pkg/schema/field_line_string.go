package schema

import "github.com/reearth/reearth-cms/server/pkg/value"

type FieldLineString struct {}

func NewLineString() *FieldLineString {
	return &FieldLineString{}
}

func (f *FieldLineString) TypeProperty() *TypeProperty {
	return &TypeProperty{
		t:          f.Type(),
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
	return &FieldLineString{}
}

func (f *FieldLineString) Validate(v *value.Value) (err error) {
	v.Match(value.Match{
		LineString: func(a value.LineString) {
			// ok
		},
		Default: func() {
			err = ErrInvalidValue
		},
	})
	return
}

func (f *FieldLineString) ValidateMultiple(v *value.Multiple) error {
	return nil
}
