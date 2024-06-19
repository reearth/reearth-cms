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
	return toLineStringValue(i)
}

func toLineStringValue(i any) (LineString, bool) {
	if i == nil {
		return nil, true
	}

	v, ok := i.([]any)
	if ok {
		res := make(LineString, len(v))
		for i, vv := range v {
			var ok bool
			res[i], ok = toPositionValue(vv)
			if !ok {
				return nil, false
			}
		}
		return res, true
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
	return lineStringEqual(v, w)
}

func lineStringEqual(v, w any) bool {
	vv := v.(LineString)
	ww := w.(LineString)
	if len(vv) != len(ww) {
		return false
	}
	for i := range vv {
		if !positionEqual(vv[i], ww[i]) {
			return false
		}
	}
	return true
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
