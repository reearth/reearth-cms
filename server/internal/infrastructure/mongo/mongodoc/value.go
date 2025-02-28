package mongodoc

import (
	"github.com/reearth/reearth-cms/server/pkg/value"
)

type ValueDocument struct {
	T string `bson:"t"`
	V []any  `bson:"v"` // value stored in db as multiple
}

func NewMultipleValue(v *value.Multiple) *ValueDocument {
	if v == nil {
		return nil
	}
	return &ValueDocument{
		T: string(v.Type()),
		V: v.Interface(),
	}
}

func (d *ValueDocument) MultipleValue() *value.Multiple {
	if d == nil {
		return nil
	}

	t := value.Type(d.T)
	return value.NewMultiple(t, d.V)
}
