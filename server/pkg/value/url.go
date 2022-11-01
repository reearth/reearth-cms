package value

import (
	"net/url"

	"github.com/reearth/reearth-cms/server/pkg/id"
)

const TypeURL Type = "url"

type urlType struct{}

func (a *urlType) New(v any) (any, error) {
	switch w := v.(type) {
	case string:
		return id.AssetIDFrom(w)
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
