package schema

import "github.com/samber/lo"

var TypeInteger Type = "integer"

type FieldInteger struct {
	defaultValue *int
	min          *int
	max          *int
}

func NewFieldInteger() *FieldInteger {
	return &FieldInteger{
		defaultValue: lo.ToPtr(0),
		min:          lo.ToPtr(0),
		max:          nil,
	}
}

func FieldIntegerFrom(defaultValue, min, max *int) *FieldInteger {
	return &FieldInteger{
		defaultValue: defaultValue,
		min:          min,
		max:          max,
	}
}

func (f *FieldInteger) TypeProperty() *TypeProperty {
	return &TypeProperty{
		integer: f,
	}
}
