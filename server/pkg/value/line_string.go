package value

import (
	"encoding/json"

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

	switch v := i.(type) {
	case [][]float64:
		return v, true
	case [][]float32:
		return convertToFloat64WithCheck(v, mapFloat32ToFloat64)
	case [][]int:
		return convertToFloat64(v, mapIntegersToFloat64)
	case [][]int8:
		return convertToFloat64(v, mapIntegersToFloat64)
	case [][]int16:
		return convertToFloat64(v, mapIntegersToFloat64)
	case [][]int32:
		return convertToFloat64(v, mapIntegersToFloat64)
	case [][]int64:
		return convertToFloat64(v, mapIntegersToFloat64)
	case [][]uint:
		return convertToFloat64(v, mapIntegersToFloat64)
	case [][]uint8:
		return convertToFloat64(v, mapIntegersToFloat64)
	case [][]uint16:
		return convertToFloat64(v, mapIntegersToFloat64)
	case [][]uint32:
		return convertToFloat64(v, mapIntegersToFloat64)
	case [][]uint64:
		return convertToFloat64(v, mapIntegersToFloat64)
	case [][]uintptr:
		return convertToFloat64(v, mapIntegersToFloat64)
	case [][]json.Number:
		return convertToFloat64WithCheck(v, mapJSONNumbersToFloat64)
	case [][]string:
		return convertToFloat64WithCheck(v, mapStringsToFloat64)
	default:
		return nil, false
	}
}

func convertToFloat64[T any](v [][]T, mapper func([]T) []float64) (LineString, bool) {
	return lo.Map(v, func(n []T, _ int) Position {
		return mapper(n)
	}), true
}

func convertToFloat64WithCheck[T any](v [][]T, mapper func([]T) ([]float64, bool)) (LineString, bool) {
	res := make(LineString, len(v))
	for i, vv := range v {
		var ok bool
		res[i], ok = mapper(vv)
		if !ok {
			return nil, false
		}
	}
	return res, true
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
