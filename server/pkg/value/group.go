package value

import (
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/samber/lo"
	"golang.org/x/exp/slices"
)

const TypeGroup Type = "group"

type propertyGroup struct{}

type Group = id.FieldIDList

func (p *propertyGroup) ToValue(i any) (any, bool) {
	if v, ok := i.([]string); ok {
		if u, err := id.FieldIDListFrom(v); err == nil {
			return u, true
		}
	} else if v, ok := i.(id.FieldIDList); ok {
		return v, true
	} else if v, ok := i.([]*string); ok && v != nil {
		fl := lo.Map(v, func(s *string, _ int) string {
			return *s
		})
		return p.ToValue(fl)
	}
	return nil, false
}

func (*propertyGroup) ToInterface(v any) (any, bool) {
	return v.(Group).Strings(), true
}

func (*propertyGroup) Validate(i any) bool {
	_, ok := i.(Group)
	return ok
}

func (*propertyGroup) Equal(v, w any) bool {
	vv := v.(Group)
	ww := v.(Group)
	return slices.Equal(vv, ww)
}

func (*propertyGroup) IsEmpty(v any) bool {
	return v.(Group).Len() == 0
}

func (v *Value) ValueGroup() (vv Group, ok bool) {
	if v == nil {
		return
	}
	vv, ok = v.v.(Group)
	return
}

func (m *Multiple) ValuesGroup() (vv []Group, ok bool) {
	if m == nil {
		return
	}
	vv = lo.FilterMap(m.v, func(v *Value, _ int) (Group, bool) {
		return v.ValueGroup()
	})
	if len(vv) != len(m.v) {
		return nil, false
	}
	ok = true
	return
}
