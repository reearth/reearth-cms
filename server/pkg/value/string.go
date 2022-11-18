package value

import (
	"fmt"
	"strconv"
	"time"
)

var TypeString Type = "string"

type propertyString struct{}

type String = string

func (p *propertyString) ToValue(i any) (any, bool) {
	if v, ok := i.(string); ok {
		return v, true
	} else if v, ok := i.(float64); ok {
		return strconv.FormatFloat(v, 'f', -1, 64), true
	} else if v, ok := i.(bool); ok && v {
		return "true", true
	} else if v, ok := i.(time.Time); ok {
		return v.Format(time.RFC3339), true
	} else if v, ok := i.(*string); ok && v != nil {
		return p.ToValue(*v)
	} else if v, ok := i.(*float64); ok && v != nil {
		return p.ToValue(*v)
	} else if v, ok := i.(*bool); ok && v != nil {
		return p.ToValue(*v)
	} else if v, ok := i.(*time.Time); ok && v != nil {
		return p.ToValue(*v)
	} else if v, ok := i.(fmt.Stringer); ok && v != nil {
		return v.String(), true
	}
	return nil, false
}

func (*propertyString) ToInterface(v any) (any, bool) {
	return v, true
}

func (*propertyString) Validate(i any) bool {
	_, ok := i.(String)
	return ok
}

func (v *Value) ValueString() (vv String, ok bool) {
	if v == nil {
		return
	}
	vv, ok = v.v.(String)
	return
}
