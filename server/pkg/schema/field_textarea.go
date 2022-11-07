package schema

var TypeTextArea Type = "textarea"

type FieldTextArea struct {
	defaultValue *string
	maxLength    *int
}

func FieldTextAreaFrom(defaultValue *string, maxLength *int) (*FieldTextArea, error) {
	if defaultValue != nil && maxLength != nil && len(*defaultValue) > *maxLength {
		return nil, ErrInvalidTextDefault
	}
	return &FieldTextArea{
		defaultValue: defaultValue,
		maxLength:    maxLength,
	}, nil
}

func (f *FieldTextArea) TypeProperty() *TypeProperty {
	return &TypeProperty{
		textArea: f,
	}
}

func (f *FieldTextArea) DefaultValue() *string {
	return f.defaultValue
}

func (f *FieldTextArea) MaxLength() *int {
	return f.maxLength
}
