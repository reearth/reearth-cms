package schema

var TypeText Type = "text"

type FieldText struct {
}

func NewFieldText() *FieldTextArea {
	panic("not implemented")
}

func (f *FieldText) TypeProperty() *TypeProperty {
	return &TypeProperty{
		text: f,
	}
}
