package value

import (
	"encoding/json"

	"github.com/samber/lo"
)

const TypeJson Type = "json"

type propertyJson struct{}

type Json = string

func (p *propertyJson) ToValue(i any) (any, bool) {
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

func (*propertyJson) ToInterface(v any) (any, bool) {
	return v.(Json), true
}

func (*propertyJson) Validate(i any) bool {
	_, ok := i.(Json)
	return ok
}

func (*propertyJson) Equal(v, w any) bool {
	var vv, ww Json
	if v != nil && w != nil {
		vv = v.(Json)
		ww = w.(Json)
		return vv == ww
	}
	return v == w
}

func (*propertyJson) IsEmpty(v any) bool {
	return v.(Json) == ""
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
