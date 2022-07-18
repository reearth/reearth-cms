package schema

var TypeURL Type = "url"

type FieldURL struct {
}

func NewFieldURL() *FieldURL {
	panic("not implemented")
}

func (f *FieldURL) TypeProperty() *TypeProperty {
	return &TypeProperty{
		url: f,
	}
}
