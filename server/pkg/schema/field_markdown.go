package schema

var TypeMarkdown Type = "markdown"

type FieldMarkdown struct {
	defaultValue *string
	maxLength    *int
}

func NewFieldMarkdown() *FieldMarkdown {
	return &FieldMarkdown{
		defaultValue: nil,
		maxLength:    nil,
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
