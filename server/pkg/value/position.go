package value

import (
	"encoding/json"
	"strconv"

	"github.com/samber/lo"
)

const TypePoint Type = "point"
const TypeLineString Type = "lineString"
const TypePolygon Type = "polygon"

type propertyPosition struct{}

type Position = []float64

func (p *propertyPosition) ToValue(i any) (any, bool) {
	if i == nil {
		return nil, true
	}
	if v, ok := i.([]float64); ok {
		return v, true
	} else if v, ok := i.([]float32); ok {
		s := lo.Map(v, func(n float32, _ int) float64 {
			return float64(n)
		})
		return s, true
	} else if v, ok := i.([]string); ok {
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
	} else if v, ok := i.([]int); ok {
		s := lo.Map(v, func(n int, _ int) float64 {
			return float64(n)
		})
		return s, true
	} else if v, ok := i.([]int8); ok {
		s := lo.Map(v, func(n int8, _ int) float64 {
			return float64(n)
		})
		return s, true
	} else if v, ok := i.([]int16); ok {
		s := lo.Map(v, func(n int16, _ int) float64 {
			return float64(n)
		})
		return s, true
	} else if v, ok := i.([]int32); ok {
		s := lo.Map(v, func(n int32, _ int) float64 {
			return float64(n)
		})
		return s, true
	} else if v, ok := i.([]int64); ok {
		s := lo.Map(v, func(n int64, _ int) float64 {
			return float64(n)
		})
		return s, true
	} else if v, ok := i.([]uint); ok {
		s := lo.Map(v, func(n uint, _ int) float64 {
			return float64(n)
		})
		return s, true
	}else if v, ok := i.([]uint8); ok {
		s := lo.Map(v, func(n uint8, _ int) float64 {
			return float64(n)
		})
		return s, true
	}else if v, ok := i.([]uint16); ok {
		s := lo.Map(v, func(n uint16, _ int) float64 {
			return float64(n)
		})
		return s, true
	}else if v, ok := i.([]uint32); ok {
		s := lo.Map(v, func(n uint32, _ int) float64 {
			return float64(n)
		})
		return s, true
	} else if v, ok := i.([]uint64); ok {
		s := lo.Map(v, func(n uint64, _ int) float64 {
			return float64(n)
		})
		return s, true
	} else if v, ok := i.([]uintptr); ok {
		s := lo.Map(v, func(n uintptr, _ int) float64 {
			return float64(n)
		})
		return s, true
	} else if v, ok := i.([]json.Number); ok {
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
	return nil, false
}

func (*propertyPosition) ToInterface(v any) (any, bool) {
	return v, true
}

func (*propertyPosition) Validate(i any) bool {
	v, ok := i.(Position)
	return ok && len(v) >= 2
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
