package value

import (
	"time"

	"github.com/samber/lo"
)

const TypeDateTime Type = "datetime"

type propertyDateTime struct{}

type DateTime = []time.Time

var timeLayouts = []string{
	time.RFC3339Nano,
	time.RFC3339,
}

func (p *propertyDateTime) ToValue(i any) (any, bool) {
	if i == nil {
		return nil, false
	}

	if dd, ok := i.([]time.Time); ok {
		return dd, true
	}

	dt, ok := i.([]interface{})
	if !ok {
		return nil, false
	}
	var res DateTime
	var flag bool
	for _, d := range dt {
		if _, ok := d.(bool); ok {
			return nil, false
		}
		if _, ok := d.(*bool); ok {
			return nil, false
		}
		if v, ok := defaultTypes.Get(TypeInteger).ToValue(d); ok {
			res = append(res, time.Unix(v.(Integer), 0))
			flag = true
			break
		}
		switch v := d.(type) {
		case time.Time:
			res = append(res, v)
			flag = true
		case string:
			for _, l := range timeLayouts {
				if tt, err := time.Parse(l, v); err == nil {
					res = append(res, tt)
					flag = true
					break
				}
			}

		case *time.Time:
			if v != nil {
				res = append(res, *v)
				flag = true
			}
		case *string:
			if v != nil {
				for _, l := range timeLayouts {
					if tt, err := time.Parse(l, *v); err == nil {
						res = append(res, tt)
						flag = true
						break
					}
				}
			}
		}

	}

	return res, flag
}

func (*propertyDateTime) ToInterface(v any) (any, bool) {
	dt, ok := v.(DateTime)
	if !ok {
		return nil, false
	}
	return lo.Map(dt, func(item time.Time, _ int) any {
		return item.Format(time.RFC3339)
	}), true
}

func (*propertyDateTime) Validate(i any) bool {
	_, ok := i.(DateTime)
	return ok
}

func (*propertyDateTime) Equal(v, w any) bool {
	vv := v.(DateTime)
	ww := w.(DateTime)
	cond := len(vv) == len(ww)
	if !cond {
		return false
	}
	for i := 0; i < len(vv); i++ {
		cond = cond && (vv[i].Equal(ww[i]))
	}

	return cond
}

func (*propertyDateTime) IsEmpty(v any) bool {
	vv := v.(DateTime)
	return len(vv) == 0
}

func (v *Value) ValueDateTime() (vv DateTime, ok bool) {
	if v == nil {
		return
	}
	vv, ok = v.v.(DateTime)
	return
}

func (m *Multiple) ValuesDateTime() (vv []DateTime, ok bool) {
	if m == nil {
		return
	}
	vv = lo.FilterMap(m.v, func(v *Value, _ int) (DateTime, bool) {
		x, ok := v.ValueDateTime()
		return x, ok
	})
	if len(vv) != len(m.v) {
		return nil, false
	}
	return vv, true
}
