package value

import (
	"github.com/samber/lo"
)

const TypeLineString Type = "lineString"

type propertyLineString struct{}

type LineString = []Position

func (p *propertyLineString) ToValue(i any) (any, bool) {
	if i == nil {
		return nil, true
	}

	return nil, false
}

func (*propertyLineString) ToInterface(v any) (any, bool) {
	return v, true
}

func (*propertyLineString) Validate(i any) bool {
	v, ok := i.(LineString)
	if !ok {
		return false
	}
	return len(v) >= 2
}

func (*propertyLineString) Equal(v, w any) bool {
	// vv := v.(LineString)
	// ww := w.(LineString)
	// if len(vv) != len(ww) {
	// 	return false
	// }
	// return slices.Equal(vv, ww)
	return false
}

func (*propertyLineString) IsEmpty(i any) bool {
	if i == nil {
		return true
	}
	v, ok := i.(LineString)
	if !ok {
		return true
	}
	return len(v) == 0
}

func (v *Value) ValueLineString() (vv LineString, ok bool) {
	if v == nil {
		return
	}
	vv, ok = v.v.(LineString)
	if !ok {
		return nil, false
	}
	if len(vv) > 3 {
		return vv[:3], true // TODO: need to think about his case
	}
	return
}

func (m *Multiple) ValuesLineString() (vv []LineString, ok bool) {
	if m == nil {
		return
	}
	vv = lo.FilterMap(m.v, func(v *Value, _ int) (LineString, bool) {
		return v.ValueLineString()
	})
	if len(vv) != len(m.v) {
		return nil, false
	}
	return vv, true
}
