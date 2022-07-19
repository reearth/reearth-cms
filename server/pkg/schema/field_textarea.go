package schema

import "github.com/samber/lo"

var TypeTextArea Type = "textarea"

type FieldTextArea struct {
	defaultValue *string
	maxLength    *int
}

func NewFieldTextArea() *FieldTextArea {
	return &FieldTextArea{
		defaultValue: lo.ToPtr(""),
		maxLength:    lo.ToPtr(500),
	}
}

func FieldTextAreaFrom(defaultValue *string, maxLength *int) *FieldTextArea {
	return &FieldTextArea{
		defaultValue: defaultValue,
		maxLength:    maxLength,
	}
}

func (f *FieldTextArea) TypeProperty() *TypeProperty {
	return &TypeProperty{
		textArea: f,
	}
}
