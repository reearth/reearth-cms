package value

import (
	"github.com/reearth/reearth-cms/server/pkg/id"
)

const TypeAsset Type = "asset"

type propertyAsset struct{}

type Asset = id.AssetID

func (p *propertyAsset) ToValue(i any) (any, bool) {
	if v, ok := i.(string); ok {
		if u, err := id.AssetIDFrom(v); err == nil {
			return u, true
		}
	} else if v, ok := i.(id.AssetID); ok {
		return v, true
	} else if v, ok := i.(*string); ok && v != nil {
		return p.ToValue(*v)
	} else if v, ok := i.(*id.AssetID); ok && v != nil {
		return p.ToValue(*v)
	}
	return nil, false
}

func (*propertyAsset) ToInterface(v any) (any, bool) {
	return v.(Asset).String(), true
}

func (*propertyAsset) Validate(i any) bool {
	_, ok := i.(Asset)
	return ok
}

func (*propertyAsset) Equal(v, w any) bool {
	vv := v.(Asset)
	ww := v.(Asset)
	return vv == ww
}

func (v *Value) ValueAsset() (vv Asset, ok bool) {
	if v == nil {
		return
	}
	vv, ok = v.v.(Asset)
	return
}
