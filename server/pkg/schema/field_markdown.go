package schema

import "github.com/samber/lo"

var TypeMarkdown Type = "markdown"

type FieldMarkdown struct {
	defaultValue *string
	maxLength    *int
}

func NewFieldMarkdown() *FieldMarkdown {
	return &FieldMarkdown{
		defaultValue: lo.ToPtr(""),
		maxLength:    lo.ToPtr(65),
	}
}

func FieldMarkdownFrom(defaultValue *string, maxLength *int) *FieldMarkdown {
	return &FieldMarkdown{
		defaultValue: defaultValue,
		maxLength:    maxLength,
	}
}

func (f *FieldMarkdown) TypeProperty() *TypeProperty {
	return &TypeProperty{
		markdown: f,
	}
}
