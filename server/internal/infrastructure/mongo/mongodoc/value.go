package mongodoc

import (
	"maps"
	"slices"

	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/samber/lo"
	"go.mongodb.org/mongo-driver/bson"
)

type ValueDocument struct {
	T string `bson:"t"`
	V []any  `bson:"v"` // value stored in db as multiple
}

func NewMultipleValue(v *value.Multiple) *ValueDocument {
	if v == nil {
		return nil
	}
	vv := v.Interface()
	if v.Type() == value.TypeGeometry {
		vv = lo.Map(vv, func(e any, _ int) any { return toBSON(e) })
	}
	return &ValueDocument{
		T: string(v.Type()),
		V: vv,
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

// toBSON converts maps into bson documents with sorted keys.
func toBSON(v any) any {
	switch vv := v.(type) {
	case map[string]any:
		d := make(bson.D, 0, len(vv))
		for _, k := range slices.Sorted(maps.Keys(vv)) {
			d = append(d, bson.E{Key: k, Value: toBSON(vv[k])})
		}
		return d
	case []any:
		return lo.Map(vv, func(e any, _ int) any { return toBSON(e) })
	}
	return v
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
	case bson.A:
		return lo.Map(vv, func(e any, _ int) any { return fromBSON(e) })
	}
	return v
}
