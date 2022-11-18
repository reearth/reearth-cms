package value

import (
	"time"
)

var TypeDateTime Type = "date"

type propertyDateTime struct{}

type typeDateTime = time.Time

func (p *propertyDateTime) I2V(i any) (any, bool) {
	switch v := i.(type) {
	case time.Time:
		return v, true
	case *time.Time:
		if v != nil {
			return p.I2V(*v)
		}
	}
	return nil, false
}

func (*propertyDateTime) V2I(v any) (any, bool) {
	return v, true
}

func (*propertyDateTime) Validate(i any) bool {
	_, ok := i.(typeDateTime)
	return ok
}

func (v *Value) ValueDateTime() (vv typeDateTime, ok bool) {
	if v == nil {
		return
	}
	vv, ok = v.v.(typeDateTime)
	return
}
