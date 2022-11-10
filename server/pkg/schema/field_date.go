package schema

import (
	"time"

	"github.com/reearth/reearth-cms/server/pkg/value"
)

type FieldDate struct{}

func NewFieldDate() *FieldDate {
	return &FieldDate{}
}

func (f *FieldDate) TypeProperty() *TypeProperty {
	return &TypeProperty{
		date: f,
	}
}

func (f *FieldDate) Validate(v *value.Value) (err error) {
	v.Match(value.Match{
		Date: func(u time.Time) {
			// noting to do
		},
		Default: func() {
			err = ErrInvalidValue
		},
	})
	return
}
