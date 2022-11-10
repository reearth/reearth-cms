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
		return time.Parse(time.RFC3339, w)
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
		return *w, nil
	}
	return nil, ErrInvalidValue
}

func (v *Value) ValueDate() (r *DateValue) {
	v.Match(Match{
		Date: func(v DateValue) {
			r = &v
		},
	})
	return
}
