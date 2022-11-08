package schema

import (
	"errors"

	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearthx/util"
)

var ErrInvalidTextDefault = errors.New("invalid default value")

type FieldText struct {
	maxLength *int
}

func NewFieldText(maxLength *int) *FieldText {
	return &FieldText{
		maxLength: maxLength,
	}
}

func (f *FieldText) TypeProperty() *TypeProperty {
	return &TypeProperty{
		text: f,
	}
}

func (f *FieldText) MaxLength() *int {
	return util.CloneRef(f.maxLength)
}

func (f *FieldText) Validate(v *value.Value) (err error) {
	v.Match(value.Match{
		Text: func(u string) {
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
