package schema

import (
	"errors"

	"github.com/reearth/reearth-cms/server/pkg/value"
)

type FieldRichText struct {
	defaultValue *string
	maxLength    *int
}

func NewFieldRichText(maxLength *int) *FieldRichText {
	return &FieldRichText{
		maxLength: maxLength,
	}
}

func (f *FieldRichText) TypeProperty() *TypeProperty {
	return &TypeProperty{
		richText: f,
	}
}

func (f *FieldRichText) MaxLength() *int {
	return f.maxLength
}

func (f *FieldRichText) Validate(v *value.Value) (err error) {
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
