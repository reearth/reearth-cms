package schema

import "github.com/samber/lo"

var TypeSelect Type = "select"

type FieldSelect struct {
	values       *[]string
	defaultValue *int
}

func NewFieldSelect() *FieldSelect {
	return &FieldSelect{
		values:       lo.ToPtr([]string{}),
		defaultValue: lo.ToPtr(-1),
	}
}

func FieldSelectFrom(values *[]string, defaultValue *int) *FieldSelect {
	return &FieldSelect{
		values:       values,
		defaultValue: defaultValue,
	}
}

func (f *FieldSelect) TypeProperty() *TypeProperty {
	return &TypeProperty{
		selectt: f,
	}
}
