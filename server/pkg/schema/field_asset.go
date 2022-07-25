package schema

import (
	"github.com/reearth/reearth-cms/server/pkg/id"
)

var TypeAsset Type = "asset"

type FieldAsset struct {
	defaultValue *id.AssetID
}

// NewFieldAsset
// TODO: check if its ok to remove this
func NewFieldAsset() *FieldAsset {
	return &FieldAsset{
		defaultValue: nil,
	}
}

func FieldAssetFrom(id *id.AssetID) *FieldAsset {
	return &FieldAsset{
		defaultValue: id,
	}
}

func (f *FieldAsset) TypeProperty() *TypeProperty {
	return &TypeProperty{
		asset: f,
	}
}
