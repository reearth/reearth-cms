package schema

import (
	"github.com/reearth/reearth-cms/server/pkg/value"
)

type FieldURL struct{}

func NewFieldURL() *FieldURL {
	return &FieldURL{}
}

func (f *FieldURL) TypeProperty() *TypeProperty {
	return &TypeProperty{
		url: f,
	}
}

func (f *FieldURL) Validate(v *value.Value) (err error) {
	v.Match(value.Match{
		URL: func(u string) {
			// nothing to do
		},
		Default: func() {
			err = ErrInvalidDefaultValue
		},
	})
	return
}
