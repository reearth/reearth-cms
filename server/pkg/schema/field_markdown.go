package schema

import "github.com/reearth/reearth-cms/server/pkg/value"

type FieldMarkdown struct {
	f *FieldText
}

func NewFieldMarkdown(maxLength *int) *FieldMarkdown {
	return &FieldMarkdown{f: NewFieldText(maxLength)}
}

func (f *FieldMarkdown) TypeProperty() *TypeProperty {
	return &TypeProperty{markdown: f}
}

func (f *FieldMarkdown) MaxLength() *int {
	return f.f.MaxLength()
}

func (f *FieldMarkdown) Validate(v *value.Value) error {
	return f.f.Validate(v)
}
