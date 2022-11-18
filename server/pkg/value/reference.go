package value

import (
	"github.com/reearth/reearth-cms/server/pkg/id"
)

const TypeReference Type = "reference"

type propertyReference struct{}

type Reference = id.ItemID

func (p *propertyReference) ToValue(i any) (any, bool) {
	if v, ok := i.(string); ok {
		if u, err := id.ItemIDFrom(v); err == nil {
			return u, true
		}
	} else if v, ok := i.(id.ItemID); ok {
		return v, true
	} else if v, ok := i.(*string); ok && v != nil {
		return p.ToValue(*v)
	} else if v, ok := i.(*id.ItemID); ok && v != nil {
		return p.ToValue(*v)
	}
	return nil, false
}

func (*propertyReference) ToInterface(v any) (any, bool) {
	return v.(Reference).String(), true
}

func (*propertyReference) Validate(i any) bool {
	_, ok := i.(Reference)
	return ok
}

func (v *Value) ValueReference() (vv Reference, ok bool) {
	if v == nil {
		return
	}
	vv, ok = v.v.(Reference)
	return
}
