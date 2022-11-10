package schema

import (
	"fmt"

	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearthx/util"
)

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
				err = fmt.Errorf("value must be shorter than %d characters", *f.maxLength)
			}
		},
		Default: func() {
			err = ErrInvalidValue
		},
	})
	return
}
