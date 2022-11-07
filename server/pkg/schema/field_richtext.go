package schema

var TypeRichText Type = "richText"

type FieldRichText struct {
	defaultValue *string
	maxLength    *int
}

func FieldRichTextFrom(defaultValue *string, maxLength *int) (*FieldRichText, error) {
	if defaultValue != nil && maxLength != nil && len(*defaultValue) > *maxLength {
		return nil, ErrInvalidTextDefault
	}
	return &FieldRichText{
		defaultValue: defaultValue,
		maxLength:    maxLength,
	}, nil
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
