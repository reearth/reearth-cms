package value

import (
	"net/url"
)

const TypeURL Type = "url"

type propertyURL struct{}

type URL = *url.URL

func (p *propertyURL) ToValue(i any) (any, bool) {
	if v, ok := i.(string); ok {
		if u, err := url.Parse(v); err == nil {
			return u, true
		}
		return nil, false
	} else if v, ok := i.(url.URL); ok {
		return &v, true
	} else if v, ok := i.(*string); ok && v != nil {
		return p.ToValue(*v)
	} else if v, ok := i.(*url.URL); ok && v != nil {
		return p.ToValue(*v)
	}
	return nil, false
}

func (*propertyURL) ToInterface(v any) (any, bool) {
	return v.(URL).String(), true
}

func (*propertyURL) Validate(i any) bool {
	_, ok := i.(URL)
	return ok
}

func (*propertyURL) Equal(v, w any) bool {
	vv := v.(URL)
	ww := v.(URL)
	return vv.String() == ww.String()
}

func (*propertyURL) IsEmpty(v any) bool {
	return v.(URL).String() == ""
}

func (v *Value) ValueURL() (vv URL, ok bool) {
	if v == nil {
		return
	}
	vv, ok = v.v.(URL)
	return
}
