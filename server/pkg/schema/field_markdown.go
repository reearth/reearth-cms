package schema

import (
	"errors"

	"github.com/reearth/reearth-cms/server/pkg/value"
)

type FieldMarkdown struct {
	defaultValue *string
	maxLength    *int
}

func NewFieldMarkdown(maxLength *int) *FieldMarkdown {
	return &FieldMarkdown{
		maxLength: maxLength,
	}
}

func (f *FieldMarkdown) TypeProperty() *TypeProperty {
	return &TypeProperty{
		markdown: f,
	}
}

func (f *FieldMarkdown) DefaultValue() *string {
	return f.defaultValue
}

func (f *FieldMarkdown) MaxLength() *int {
	return f.maxLength
}

func (f *FieldMarkdown) Validate(v *value.Value) (err error) {
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
