package schema

var TypeMarkdown Type = "markdown"

type FieldMarkdown struct {
	defaultValue *string
	maxLength    *int
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

func (f *FieldMarkdown) DefaultValue() *string {
	return f.defaultValue
}

func (f *FieldMarkdown) MaxLength() *int {
	return f.maxLength
}
