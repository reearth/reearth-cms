package mongodoc

import "github.com/reearth/reearth-cms/server/pkg/value"

type ValueDocument struct {
	Type string `bson:"type"`
	V    any    `bson:"value"`
}

func NewValue(v *value.Value) *ValueDocument {
	if v == nil {
		return nil
	}
	return &ValueDocument{
		Type: string(v.Type()),
		V:    v.Interface(),
	}
}

func NewOptionalValue(v *value.Optional) *ValueDocument {
	if v == nil {
		return nil
	}
	return &ValueDocument{
		Type: string(v.Type()),
		V:    v.Value().Interface(),
	}
}

func (d *ValueDocument) Value() *value.Value {
	if d == nil {
		return nil
	}

	// compat
	if d.Type == "date" {
		d.Type = string(value.TypeDateTime)
	}

	return value.New(value.Type(d.Type), d.Value)
}

func (d *ValueDocument) OptionalValue() *value.Optional {
	if d == nil {
		return nil
	}
	return value.OptionalFrom(d.Value())
}
