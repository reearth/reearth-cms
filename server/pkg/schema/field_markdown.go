package schema

var TypeMarkdown Type = "markdown"

type FieldMarkdown struct {
}

func NewFieldMarkdown() *FieldMarkdown {
	panic("not implemented")
}

func (f *FieldMarkdown) TypeProperty() *TypeProperty {
	return &TypeProperty{
		markdown: f,
	}
}
