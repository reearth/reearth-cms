package value

import "strconv"

var TypeBool Type = "bool"

type propertyBool struct{}

type Bool = bool

func (p *propertyBool) ToValue(i any) (any, bool) {
	switch v := i.(type) {
	case bool:
		return v, true
	case string:
		if b, err := strconv.ParseBool(v); err == nil {
			return b, true
		}
	case *bool:
		if v != nil {
			return p.ToValue(*v)
		}
	case *string:
		if v != nil {
			return p.ToValue(*v)
		}
	}

	if v, ok := defaultTypes.Get(TypeInteger).ToValue(i); ok {
		return v.(Integer) > 0, true
	}

	return nil, false
}

func (*propertyBool) ToInterface(v any) (any, bool) {
	return v, true
}

func (*propertyBool) Validate(i any) bool {
	_, ok := i.(Bool)
	return ok
}

func (v *Value) ValueBool() (vv bool, ok bool) {
	if v == nil {
		return
	}
	vv, ok = v.v.(Bool)
	return
}
