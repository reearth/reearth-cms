package value

import (
	"encoding/json"

	"github.com/samber/lo"
)

const TypeGeometryObject Type = "geometryObject"
const TypeGeometryEditor Type = "geometryEditor"

// TODO: remove propertyJsonString once Geometry Object and Geometry Editor values are migrated to propertyJson
type propertyJsonString struct{}

type JsonString = string

func (p *propertyJsonString) ToValue(i any) (any, bool) {
	// Handle nil input
	if i == nil {
		return nil, false
	}

	// Handle string input - validate it's valid JSON
	if v, ok := i.(string); ok {
		if json.Valid([]byte(v)) {
			return v, true
		}
		return nil, false
	}

	// Handle pointer to string
	if v, ok := i.(*string); ok {
		if v == nil {
			return nil, false
		}
		return p.ToValue(*v)
	}

	// Handle parsed JSON objects (map, slice, struct, etc.)
	// Marshal them to JSON string
	if jsonBytes, err := json.Marshal(i); err == nil {
		return string(jsonBytes), true
	}

	return nil, false
}

func (*propertyJsonString) ToInterface(v any) (any, bool) {
	return v.(JsonString), true
}

func (*propertyJsonString) Validate(i any) bool {
	_, ok := i.(JsonString)
	return ok
}

func (*propertyJsonString) Equal(v, w any) bool {
	var vv, ww JsonString
	if v != nil && w != nil {
		vv = v.(JsonString)
		ww = w.(JsonString)
		return vv == ww
	}
	return v == w
}

func (*propertyJsonString) IsEmpty(v any) bool {
	return v.(JsonString) == ""
}

func (v *Value) ValueJsonString() (vv JsonString, ok bool) {
	if v == nil {
		return
	}
	vv, ok = v.v.(JsonString)
	return
}

func (m *Multiple) ValuesJsonString() (vv []JsonString, ok bool) {
	if m == nil {
		return
	}
	vv = lo.FilterMap(m.v, func(v *Value, _ int) (JsonString, bool) {
		return v.ValueJsonString()
	})
	if len(vv) != len(m.v) {
		return nil, false
	}
	return vv, true
}
