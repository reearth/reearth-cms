package schema

import "github.com/reearth/reearth-cms/server/pkg/value"

type FieldBool struct{}

func NewFieldBool() *FieldBool {
	return &FieldBool{}
}

func (f *FieldBool) TypeProperty() *TypeProperty {
	return &TypeProperty{
		bool: f,
	}
}

func (f *FieldBool) Validate(v *value.Value) (err error) {
	v.Match(value.Match{
		Bool: func(_ bool) {
			// noting to do
		},
		Default: func() {
			err = ErrInvalidDefaultValue
		},
	})
	return
}
