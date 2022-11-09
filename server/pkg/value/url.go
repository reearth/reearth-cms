package value

import (
	"net/url"
)

const TypeURL Type = "url"

type URLValue = string

type urlType struct{}

func (a *urlType) New(v any) (any, error) {
	switch w := v.(type) {
	case string:
		u, err := url.Parse(w)
		if err != nil {
			return nil, ErrInvalidValue
		}
		return u.String(), nil
	case url.URL:
		return w.String(), nil
	case *string:
		if w == nil {
			return nil, nil
		}
		return a.New(*w)
	case *url.URL:
		if w == nil {
			return nil, nil
		}
		return a.New(*w)

	}
	return nil, ErrInvalidValue
}

func (v *Value) ValueURL() (r *URLValue) {
	v.Match(Match{
		URL: func(v URLValue) {
			r = &v
		},
	})
	return
}
