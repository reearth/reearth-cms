package value

import "github.com/reearth/reearth-cms/server/pkg/id"

const TypeAsset Type = "asset"

type asset struct{}

func (a *asset) New(v any) (any, error) {
	switch w := v.(type) {
	case string:
		return id.AssetIDFrom(w)
	case id.AssetID:
		return w, nil
	case *string:
		if w == nil {
			return nil, nil
		}
		return a.New(*w)
	case *id.AssetID:
		if w == nil {
			return nil, nil
		}
		return a.New(*w)

	}
	return nil, ErrInvalidValue
}
