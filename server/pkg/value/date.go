package value

import (
	"time"
)

const TypeDate Type = "date"

type DateValue = time.Time

type date struct{}

func (d *date) New(v any) (any, error) {
	switch w := v.(type) {
	case int64:
		return time.UnixMilli(w), nil
	case string:
		return time.Parse(w, time.RFC3339)
	case time.Time:
		return w, nil
	case *int64:
		if w == nil {
			return nil, nil
		}
		return d.New(*w)
	case *string:
		if w == nil {
			return nil, nil
		}
		return d.New(*w)
	case *time.Time:
		if w == nil {
			return nil, nil
		}
		return *w, nil
	}
	return nil, ErrInvalidValue
}
