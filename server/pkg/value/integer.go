package value

import (
	"encoding/json"
	"strconv"
)

const TypeInteger Type = "integer"

type IntegerValue = int64

type integer struct{}

func (a *integer) New(v any) (any, error) {
	switch w := v.(type) {
	case float64:
		return int64(w), nil
	case float32:
		return int64(w), nil
	case int:
		return int64(w), nil
	case int8:
		return int64(w), nil
	case int16:
		return int64(w), nil
	case int32:
		return int64(w), nil
	case int64:
		return int64(w), nil
	case uint:
		return int64(w), nil
	case uint8:
		return int64(w), nil
	case uint16:
		return int64(w), nil
	case uint32:
		return int64(w), nil
	case uint64:
		return int64(w), nil
	case uintptr:
		return int64(w), nil
	case json.Number:
		if f, err := w.Int64(); err == nil {
			return f, nil
		}
	case string:
		if vfloat64, err := strconv.ParseInt(w, 0, 64); err == nil {
			return vfloat64, nil
		}
	case bool:
		if w {
			return int64(1), nil
		} else {
			return int64(0), nil
		}
	case *float64:
		if w != nil {
			return a.New(*w)
		}
	case *float32:
		if w != nil {
			return a.New(*w)
		}
	case *int:
		if w != nil {
			return a.New(*w)
		}
	case *int8:
		if w != nil {
			return a.New(*w)
		}
	case *int16:
		if w != nil {
			return a.New(*w)
		}
	case *int32:
		if w != nil {
			return a.New(*w)
		}
	case *int64:
		if w != nil {
			return a.New(*w)
		}
	case *uint:
		if w != nil {
			return a.New(*w)
		}
	case *uint8:
		if w != nil {
			return a.New(*w)
		}
	case *uint16:
		if w != nil {
			return a.New(*w)
		}
	case *uint32:
		if w != nil {
			return a.New(*w)
		}
	case *uint64:
		if w != nil {
			return a.New(*w)
		}
	case *uintptr:
		if w != nil {
			return a.New(*w)
		}
	case *json.Number:
		if w != nil {
			return a.New(*w)
		}
	case *string:
		if w != nil {
			return a.New(*w)
		}
	case *bool:
		if w != nil {
			return a.New(*w)
		}
	}
	return nil, ErrInvalidValue
}
