package schema

var TypeText Type = "text"

type FieldText struct {
	defaultValue *string
	maxLength    *int
}

func newFieldText() *FieldText {
	return &FieldText{
		defaultValue: nil,
		maxLength:    nil,
	}
}

func FieldTextFrom(defaultValue *string, maxLength *int) *FieldText {
	return &FieldText{
		defaultValue: defaultValue,
		maxLength:    maxLength,
	}
}

func (f *FieldText) TypeProperty() *TypeProperty {
	return &TypeProperty{
		text: f,
	}
}
