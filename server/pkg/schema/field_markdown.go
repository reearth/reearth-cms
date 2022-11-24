package schema

type FieldMarkdown struct {
	defaultValue *string
	maxLength    *int
}

func FieldMarkdownFrom(defaultValue *string, maxLength *int) (*FieldMarkdown, error) {
	if defaultValue != nil && maxLength != nil && len(*defaultValue) > *maxLength {
		return nil, ErrInvalidTextDefault
	}
	return &FieldMarkdown{
		defaultValue: defaultValue,
		maxLength:    maxLength,
	}, nil
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
