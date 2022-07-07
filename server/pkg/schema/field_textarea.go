package schema

var TypeTextArea Type = "textarea"

type FieldTextArea struct {
}

func NewFieldTextArea() *FieldTextArea {
	panic("not implemented")
}

func (f *FieldTextArea) TypeProperty() *TypeProperty {
	return &TypeProperty{
		textArea: f,
	}
}
