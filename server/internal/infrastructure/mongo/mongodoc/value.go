package mongodoc

import "github.com/reearth/reearth-cms/server/pkg/value"

type ValueDocument struct {
	T string `bson:"t"`
	V any    `bson:"v"`
}

func NewValue(v *value.Value) *ValueDocument {
	if v == nil {
		return nil
	}
	return &ValueDocument{
		T: string(v.Type()),
		V: v.Interface(),
	}
}

func NewOptionalValue(v *value.Optional) *ValueDocument {
	if v == nil {
		return nil
	}
	return &ValueDocument{
		T: string(v.Type()),
		V: v.Value().Interface(),
	}
}

func (d *ValueDocument) Value() *value.Value {
	if d == nil {
		return nil
	}

	// compat
	if d.T == "date" {
		d.T = string(value.TypeDateTime)
	}

	return value.New(value.Type(d.T), d.V)
}

func (d *ValueDocument) OptionalValue() *value.Optional {
	if d == nil {
		return nil
	}
	return value.OptionalFrom(d.Value())
}
