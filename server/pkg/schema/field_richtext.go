package schema

type FieldRichText struct {
	defaultValue *string
	maxLength    *int
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

func (f *FieldRichText) DefaultValue() *string {
	return f.defaultValue
}

func (f *FieldRichText) MaxLength() *int {
	return f.maxLength
}
