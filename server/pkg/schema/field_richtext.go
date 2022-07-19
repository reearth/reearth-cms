package schema

import "github.com/samber/lo"

var TypeRichText Type = "richText"

type FieldRichText struct {
	defaultValue *string
	maxLength    *int
}

func NewFieldRichText() *FieldRichText {
	return &FieldRichText{
		defaultValue: lo.ToPtr(""),
		maxLength:    lo.ToPtr(65),
	}
}

func FieldRichTextFrom(defaultValue *string, maxLength *int) *FieldRichText {
	return &FieldRichText{
		defaultValue: defaultValue,
		maxLength:    maxLength,
	}
}

func (f *FieldRichText) TypeProperty() *TypeProperty {
	return &TypeProperty{
		richText: f,
	}
}
