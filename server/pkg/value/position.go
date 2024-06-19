package value

import (
	"encoding/json"
	"slices"
	"strconv"

	"github.com/samber/lo"
)

const TypePoint Type = "point"

type propertyPosition struct{}

type Position = []float64

func (p *propertyPosition) ToValue(i any) (any, bool) {
	if i == nil {
		return nil, true
	}
	return toPositionValue(i)
}

func toPositionValue(i any) (Position, bool) {
	if i == nil {
		return nil, true
	}

	switch v := i.(type) {
	case []float64:
		return v, true
	case []float32:
		return mapFloat32ToFloat64(v)
	case []int:
		return mapIntegersToFloat64(v), true
	case []int8:
		return mapIntegersToFloat64(v), true
	case []int16:
		return mapIntegersToFloat64(v), true
	case []int32:
		return mapIntegersToFloat64(v), true
	case []int64:
		return mapIntegersToFloat64(v), true
	case []uint:
		return mapIntegersToFloat64(v), true
	case []uint8:
		return mapIntegersToFloat64(v), true
	case []uint16:
		return mapIntegersToFloat64(v), true
	case []uint32:
		return mapIntegersToFloat64(v), true
	case []uint64:
		return mapIntegersToFloat64(v), true
	case []uintptr:
		return mapIntegersToFloat64(v), true
	case []json.Number:
		return mapJSONNumbersToFloat64(v)
	case []string:
		return mapStringsToFloat64(v)
	default:
		return nil, false
	}
}

func mapIntegersToFloat64[T any](v []T) []float64 {
	return lo.Map(v, func(n T, _ int) float64 {
		return intToFloat64(n)
	})
}

func intToFloat64(v any) float64 {
	switch val := v.(type) {
	case int:
		return float64(val)
	case int8:
		return float64(val)
	case int16:
		return float64(val)
	case int32:
		return float64(val)
	case int64:
		return float64(val)
	case uint:
		return float64(val)
	case uint8:
		return float64(val)
	case uint16:
		return float64(val)
	case uint32:
		return float64(val)
	case uint64:
		return float64(val)
	case uintptr:
		return float64(val)
	default:
		return 0
	}
}

func mapStringsToFloat64(v []string) ([]float64, bool) {
	var err error
	s := lo.Map(v, func(s string, _ int) float64 {
		vv, err2 := strconv.ParseFloat(s, 64)
		if err2 != nil {
			err = err2
			return 0
		}
		return vv
	})
	if err != nil {
		return nil, false
	}
	return s, true
}

func mapJSONNumbersToFloat64(v []json.Number) ([]float64, bool) {
	var err error
	s := lo.Map(v, func(n json.Number, _ int) float64 {
		vv, err2 := n.Float64()
		if err2 != nil {
			err = err2
			return 0
		}
		return vv
	})
	if err != nil {
		return nil, false
	}
	return s, true
}

func mapFloat32ToFloat64(v []float32) ([]float64, bool) {
	var err error
	s := lo.Map(v, func(n float32, _ int) float64 {
		ss := strconv.FormatFloat(float64(n), 'f', -1, 32)
		vv, err2 := strconv.ParseFloat(ss, 64)
		if err2 != nil {
			err = err2
			return 0
		}
		return vv
	})
	if err != nil {
		return nil, false
	}
	return s, true
}

func (*propertyPosition) ToInterface(v any) (any, bool) {
	return v, true
}

func (*propertyPosition) Validate(i any) bool {
	v, ok := i.(Position)
	if !ok {
		return false
	}
	return len(v) >= 2
}

func (*propertyPosition) Equal(v, w any) bool {
	return positionEqual(v, w)
}

func positionEqual(v, w any) bool {
	vv := v.(Position)
	ww := w.(Position)
	if len(vv) != len(ww) {
		return false
	}
	return slices.Equal(vv, ww)
}

func (*propertyPosition) IsEmpty(i any) bool {
	if i == nil {
		return true
	}
	v, ok := i.(Position)
	if !ok {
		return true
	}
	return len(v) == 0
}

func (v *Value) ValuePosition() (vv Position, ok bool) {
	if v == nil {
		return
	}
	vv, ok = v.v.(Position)
	if !ok {
		return nil, false
	}
	if len(vv) > 3 {
		return vv[:3], true // TODO: need to think about his case
	}
	return
}

func (m *Multiple) ValuesPosition() (vv []Position, ok bool) {
	if m == nil {
		return
	}
	vv = lo.FilterMap(m.v, func(v *Value, _ int) (Position, bool) {
		return v.ValuePosition()
	})
	if len(vv) != len(m.v) {
		return nil, false
	}
	return vv, true
}
