package schema

import "github.com/reearth/reearth-cms/server/pkg/value"

type FieldTextArea struct {
	f *FieldText
}

func NewFieldTextArea(maxLength *int) *FieldTextArea {
	return &FieldTextArea{f: NewFieldText(maxLength)}
}

func (*FieldTextArea) Type() value.Type {
	return value.TypeTextArea
}

func (f *FieldTextArea) TypeProperty() *TypeProperty {
	return &TypeProperty{textArea: f}
}

func (f *FieldTextArea) MaxLength() *int {
	return f.f.MaxLength()
}

func (f *FieldTextArea) Validate(v *value.Value) error {
	return f.f.Validate(v)
}
