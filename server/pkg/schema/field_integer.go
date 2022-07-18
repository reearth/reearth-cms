package schema

var TypeInteger Type = "integer"

type FieldInteger struct {
}

func NewFieldInteger() *FieldInteger {
	panic("not implemented")
}

func (f *FieldInteger) TypeProperty() *TypeProperty {
	return &TypeProperty{
		integer: f,
	}
}
