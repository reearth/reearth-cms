package schema

var TypeTextArea Type = "textarea"

type FieldTextArea struct {
	defaultValue *string
	maxLength    *int
}

func newFieldTextArea() *FieldTextArea {
	return &FieldTextArea{
		defaultValue: nil,
		maxLength:    nil,
	}
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
