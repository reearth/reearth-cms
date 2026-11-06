package mongodoc

import (
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/samber/lo"
	"go.mongodb.org/mongo-driver/bson"
)

type ValueDocument struct {
	T string   `bson:"t"`
	V []any    `bson:"v"`           // value stored in db as multiple
	K []string `bson:"k,omitempty"` // equivalence keys of the values, used to find duplicated values
}

func NewMultipleValue(v *value.Multiple) *ValueDocument {
	if v == nil {
		return nil
	}
	return &ValueDocument{
		T: string(v.Type()),
		V: v.Interface(),
		K: v.EquivalenceKeys(),
	}
}

func (d *ValueDocument) MultipleValue() *value.Multiple {
	if d == nil {
		return nil
	}

	t := value.Type(d.T)
	v := d.V
	if t == value.TypeGeometry {
		// geometries are stored as embedded documents, which are decoded as bson.D and bson.A
		v = lo.Map(v, func(e any, _ int) any { return fromBSON(e) })
	}
	return value.NewMultiple(t, v)
}

// fromBSON converts decoded bson documents and arrays into plain maps and slices.
func fromBSON(v any) any {
	switch vv := v.(type) {
	case bson.D:
		m := make(map[string]any, len(vv))
		for _, e := range vv {
			m[e.Key] = fromBSON(e.Value)
		}
		return m
	case bson.M:
		m := make(map[string]any, len(vv))
		for k, e := range vv {
			m[k] = fromBSON(e)
		}
		return m
	case bson.A:
		return lo.Map(vv, func(e any, _ int) any { return fromBSON(e) })
	case map[string]any:
		m := make(map[string]any, len(vv))
		for k, e := range vv {
			m[k] = fromBSON(e)
		}
		return m
	case []any:
		return lo.Map(vv, func(e any, _ int) any { return fromBSON(e) })
	}
	return v
}
