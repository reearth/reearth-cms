package value

import (
	"encoding/json"
	"strconv"
)

var TypeNumber Type = "number"

type propertyNumber struct{}

type typeNumber = float64

func (p *propertyNumber) I2V(i any) (any, bool) {
	switch v := i.(type) {
	case float64:
		return v, true
	case float32:
		return float64(v), true
	case int:
		return float64(v), true
	case int8:
		return float64(v), true
	case int16:
		return float64(v), true
	case int32:
		return float64(v), true
	case int64:
		return float64(v), true
	case uint:
		return float64(v), true
	case uint8:
		return float64(v), true
	case uint16:
		return float64(v), true
	case uint32:
		return float64(v), true
	case uint64:
		return float64(v), true
	case uintptr:
		return float64(v), true
	case json.Number:
		if f, err := v.Float64(); err == nil {
			return f, true
		}
	case string:
		if vfloat64, err := strconv.ParseFloat(v, 64); err == nil {
			return vfloat64, true
		}
	case bool:
		if v {
			return float64(1), true
		} else {
			return float64(0), true
		}
	case *float64:
		if v != nil {
			return p.I2V(*v)
		}
	case *float32:
		if v != nil {
			return p.I2V(*v)
		}
	case *int:
		if v != nil {
			return p.I2V(*v)
		}
	case *int8:
		if v != nil {
			return p.I2V(*v)
		}
	case *int16:
		if v != nil {
			return p.I2V(*v)
		}
	case *int32:
		if v != nil {
			return p.I2V(*v)
		}
	case *int64:
		if v != nil {
			return p.I2V(*v)
		}
	case *uint:
		if v != nil {
			return p.I2V(*v)
		}
	case *uint8:
		if v != nil {
			return p.I2V(*v)
		}
	case *uint16:
		if v != nil {
			return p.I2V(*v)
		}
	case *uint32:
		if v != nil {
			return p.I2V(*v)
		}
	case *uint64:
		if v != nil {
			return p.I2V(*v)
		}
	case *uintptr:
		if v != nil {
			return p.I2V(*v)
		}
	case *json.Number:
		if v != nil {
			return p.I2V(*v)
		}
	case *string:
		if v != nil {
			return p.I2V(*v)
		}
	case *bool:
		if v != nil {
			return p.I2V(*v)
		}
	}
	return nil, false
}

func (*propertyNumber) V2I(v any) (any, bool) {
	return v, true
}

func (*propertyNumber) Validate(i any) bool {
	_, ok := i.(typeNumber)
	return ok
}

func (v *Value) ValueNumber() (vv typeNumber, ok bool) {
	if v == nil {
		return
	}
	vv, ok = v.v.(typeNumber)
	return
}
