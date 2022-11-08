package schema

import (
	"errors"

	"github.com/reearth/reearth-cms/server/pkg/value"
)

type FieldTextArea struct {
	maxLength *int
}

func NewFieldTextArea(maxLength *int) *FieldTextArea {
	return &FieldTextArea{
		maxLength: maxLength,
	}
}

func (f *FieldTextArea) TypeProperty() *TypeProperty {
	return &TypeProperty{
		textArea: f,
	}
}

func (f *FieldTextArea) MaxLength() *int {
	return f.maxLength
}

func (f *FieldTextArea) Validate(v *value.Value) (err error) {
	v.Match(value.Match{
		TextArea: func(u string) {
			if f.maxLength != nil && len(u) > *f.maxLength {
				err = errors.New("text is too long")
			}
		},
		Default: func() {
			err = ErrInvalidDefaultValue
		},
	})
	return
}
