package schema

import "errors"

var TypeInteger Type = "integer"

var (
	ErrMinMaxInvalid     = errors.New("max must be larger then min")
	ErrMinDefaultInvalid = errors.New("defaultValue must be larger then min")
	ErrMaxDefaultInvalid = errors.New("max must be larger then defaultValue")
)

type FieldInteger struct {
	defaultValue *int
	min          *int
	max          *int
}

func FieldIntegerFrom(defaultValue, min, max *int) (*FieldInteger, error) {
	if min != nil && max != nil && *min > *max {
		return nil, ErrMinMaxInvalid
	}
	if min != nil && defaultValue != nil && *min > *defaultValue {
		return nil, ErrMinDefaultInvalid
	}
	if defaultValue != nil && max != nil && *defaultValue > *max {
		return nil, ErrMaxDefaultInvalid
	}
	return &FieldInteger{
		defaultValue: defaultValue,
		min:          min,
		max:          max,
	}, nil
}

func MustFieldIntegerFrom(defaultValue, min, max *int) *FieldInteger {
	v, err := FieldIntegerFrom(defaultValue, min, max)
	if err != nil {
		panic(err)
	}
	return v
}

func (f *FieldInteger) TypeProperty() *TypeProperty {
	return &TypeProperty{
		integer: f,
	}
}

func (f *FieldInteger) DefaultValue() *int {
	return f.defaultValue
}

func (f *FieldInteger) Min() *int {
	return f.min
}

func (f *FieldInteger) Max() *int {
	return f.max
}
