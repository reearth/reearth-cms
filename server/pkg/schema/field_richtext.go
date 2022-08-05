package schema

var TypeRichText Type = "richText"

type FieldRichText struct {
	defaultValue *string
	maxLength    *int
}

func newFieldRichText() *FieldRichText {
	return &FieldRichText{
		defaultValue: nil,
		maxLength:    nil,
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

func (f *FieldRichText) DefaultValue() *string {
	return f.defaultValue
}

func (f *FieldRichText) MaxLength() *int {
	return f.maxLength
}
