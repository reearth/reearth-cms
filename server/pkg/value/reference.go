package value

import "github.com/reearth/reearth-cms/server/pkg/id"

const TypeReference Type = "reference"

type ReferenceValue = id.ItemID

type reference struct{}

func (a *reference) New(v any) (any, error) {
	switch w := v.(type) {
	case string:
		return id.ItemIDFrom(w)
	case id.ItemID:
		return w, nil
	case *string:
		if w == nil {
			return nil, nil
		}
		return a.New(*w)
	case *id.ItemID:
		if w == nil {
			return nil, nil
		}
		return a.New(*w)

	}
	return nil, ErrInvalidValue
}
