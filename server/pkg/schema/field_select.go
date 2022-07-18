package schema

var TypeSelect Type = "select"

type FieldSelect struct {
}

func NewFieldSelect() *FieldSelect {
	panic("not implemented")
}

func (f *FieldSelect) TypeProperty() *TypeProperty {
	return &TypeProperty{
		selectt: f,
	}
}
