package schema

type FieldTextArea struct {
	defaultValue *string
	maxLength    *int
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

func (f *FieldTextArea) DefaultValue() *string {
	return f.defaultValue
}

func (f *FieldTextArea) MaxLength() *int {
	return f.maxLength
}
