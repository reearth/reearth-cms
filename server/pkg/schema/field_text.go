package schema

import "github.com/reearth/reearthx/util"

type FieldText struct {
	defaultValue *string
	maxLength    *int
}

func FieldTextFrom(defaultValue *string, maxLength *int) *FieldText {
	return &FieldText{
		defaultValue: defaultValue,
		maxLength:    maxLength,
	}
}

func (f *FieldText) TypeProperty() *TypeProperty {
	return &TypeProperty{
		text: f,
	}
}

func (f *FieldText) DefaultValue() *string {
	return util.CloneRef(f.defaultValue)
}

func (f *FieldText) MaxLength() *int {
	return util.CloneRef(f.maxLength)
}
