package schema

import (
	"errors"
	"fmt"

	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/samber/lo"
)

var (
	ErrMinMaxInvalid = errors.New("max must be larger than min")
)

type FieldInteger struct {
	min *int64
	max *int64
}

func NewFieldInteger(min, max *int64) (*FieldInteger, error) {
	if min != nil && max != nil && *min > *max {
		return nil, ErrMinMaxInvalid
	}

	return &FieldInteger{
		min: min,
		max: max,
	}, nil
}

func MustFieldIntegerFrom(min, max *int64) *FieldInteger {
	return lo.Must(NewFieldInteger(min, max))
}

func (f *FieldInteger) TypeProperty() *TypeProperty {
	return &TypeProperty{
		integer: f,
	}
}

func (f *FieldInteger) Min() *int64 {
	return f.min
}

func (f *FieldInteger) Max() *int64 {
	return f.max
}

func (f *FieldInteger) Validate(v *value.Value) (err error) {
	v.Match(value.Match{
		Integer: func(u int64) {
			if f.min != nil && *f.min > u {
				err = fmt.Errorf("value must be larger than %d", *f.min)
			}
			if f.max != nil && u > *f.max {
				err = fmt.Errorf("value must be less than %d", *f.max)
			}
		},
		Default: func() {
			err = ErrInvalidValue
		},
	})
	return
}
