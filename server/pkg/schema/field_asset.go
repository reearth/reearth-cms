package schema

import (
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/value"
)

type FieldAsset struct{}

func NewFieldAsset() *FieldAsset {
	return &FieldAsset{}
}

func (f *FieldAsset) TypeProperty() *TypeProperty {
	return &TypeProperty{
		asset: f,
	}
}

func (f *FieldAsset) Validate(v *value.Value) (err error) {
	v.Match(value.Match{
		Asset: func(_ id.AssetID) {
			// noting to do
		},
		Default: func() {
			err = ErrInvalidValue
		},
	})
	return
}
