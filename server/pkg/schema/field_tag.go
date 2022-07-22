package schema

import "github.com/samber/lo"

var TypeTag Type = "tag"

type FieldTag struct {
	values       *[]string
	defaultValue *int
}

func NewFieldTag() *FieldTag {
	return &FieldTag{
		values:       lo.ToPtr([]string{}),
		defaultValue: lo.ToPtr(-1),
	}
}

func FieldTagFrom(values *[]string, defaultValue *int) *FieldTag {
	return &FieldTag{
		values:       values,
		defaultValue: defaultValue,
	}
}

func (f *FieldTag) TypeProperty() *TypeProperty {
	return &TypeProperty{
		tag: f,
	}
}
