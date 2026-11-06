package value

import (
	"encoding/json"
	"reflect"
	"strings"

	"github.com/samber/lo"
)

const TypeGeometry Type = "geometry"

type propertyGeometry struct{}

// Geometry is a GeoJSON geometry object stored as structured data.
// Numbers are always float64 and nested objects and arrays are map[string]any and []any,
// so two geometries holding the same data compare equal regardless of their original formatting.
type Geometry = map[string]any

func (p *propertyGeometry) ToValue(i any) (any, bool) {
	switch v := i.(type) {
	case nil:
		return nil, false
	case string:
		if strings.TrimSpace(v) == "" {
			return nil, false
		}
		return unmarshalGeometry([]byte(v))
	case *string:
		if v == nil {
			return nil, false
		}
		return p.ToValue(*v)
	case []byte:
		return unmarshalGeometry(v)
	case json.RawMessage:
		return unmarshalGeometry(v)
	}

	// normalize any other representation (maps, structs, ...) through JSON
	b, err := json.Marshal(i)
	if err != nil {
		return nil, false
	}
	return unmarshalGeometry(b)
}

func unmarshalGeometry(b []byte) (any, bool) {
	var g Geometry
	if err := json.Unmarshal(b, &g); err != nil || g == nil {
		return nil, false
	}
	return g, true
}

func (*propertyGeometry) ToInterface(v any) (any, bool) {
	return v, true
}

func (*propertyGeometry) Validate(i any) bool {
	_, ok := i.(Geometry)
	return ok
}

func (*propertyGeometry) Equal(v, w any) bool {
	if v == nil || w == nil {
		return v == w
	}
	return reflect.DeepEqual(v.(Geometry), w.(Geometry))
}

func (*propertyGeometry) IsEmpty(v any) bool {
	return len(v.(Geometry)) == 0
}

func (v *Value) ValueGeometry() (vv Geometry, ok bool) {
	if v == nil {
		return
	}
	vv, ok = v.v.(Geometry)
	return
}

func (m *Multiple) ValuesGeometry() (vv []Geometry, ok bool) {
	if m == nil {
		return
	}
	vv = lo.FilterMap(m.v, func(v *Value, _ int) (Geometry, bool) {
		return v.ValueGeometry()
	})
	if len(vv) != len(m.v) {
		return nil, false
	}
	return vv, true
}
