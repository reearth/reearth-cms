package schema

import "github.com/reearth/reearth-cms/server/pkg/value"

type FieldRichText struct {
	f *FieldText
}

func NewFieldRichText(maxLength *int) *FieldRichText {
	return &FieldRichText{f: NewFieldText(maxLength)}
}

func (*FieldRichText) Type() value.Type {
	return value.TypeRichText
}

func (f *FieldRichText) TypeProperty() *TypeProperty {
	return &TypeProperty{richText: f}
}

func (f *FieldRichText) MaxLength() *int {
	return f.f.MaxLength()
}

func (f *FieldRichText) Validate(v *value.Value) error {
	return f.f.Validate(v)
}
