package value

import (
	"encoding/json"
	"reflect"
	"strings"

	"github.com/samber/lo"
)

const TypeJson Type = "json"
const TypeGeometry Type = "geometry"

type propertyJson struct{}

// Json is a JSON object stored as structured data.
// Numbers are always float64 and nested objects and arrays are map[string]any and []any,
// so two objects holding the same data compare equal regardless of their original formatting.
type Json = map[string]any

func (p *propertyJson) ToValue(i any) (any, bool) {
	switch v := i.(type) {
	case nil:
		return nil, false
	case string:
		if strings.TrimSpace(v) == "" {
			return nil, false
		}
		return unmarshalJson([]byte(v))
	case *string:
		if v == nil {
			return nil, false
		}
		return p.ToValue(*v)
	}

	// normalize any other representation (maps, structs, ...) through JSON
	b, err := json.Marshal(i)
	if err != nil {
		return nil, false
	}
	return unmarshalJson(b)
}

func unmarshalJson(b []byte) (any, bool) {
	var j Json
	if err := json.Unmarshal(b, &j); err != nil || j == nil {
		return nil, false
	}
	return j, true
}

func (*propertyJson) ToInterface(v any) (any, bool) {
	return v, true
}

func (*propertyJson) Validate(i any) bool {
	_, ok := i.(Json)
	return ok
}

func (*propertyJson) Equal(v, w any) bool {
	if v == nil || w == nil {
		return v == w
	}
	return reflect.DeepEqual(v.(Json), w.(Json))
}

func (*propertyJson) IsEmpty(v any) bool {
	return len(v.(Json)) == 0
}

func (v *Value) ValueJson() (vv Json, ok bool) {
	if v == nil {
		return
	}
	vv, ok = v.v.(Json)
	return
}

func (m *Multiple) ValuesJson() (vv []Json, ok bool) {
	if m == nil {
		return
	}
	vv = lo.FilterMap(m.v, func(v *Value, _ int) (Json, bool) {
		return v.ValueJson()
	})
	if len(vv) != len(m.v) {
		return nil, false
	}
	return vv, true
}
