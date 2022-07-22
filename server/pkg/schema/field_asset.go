package schema

import (
	"github.com/reearth/reearth-cms/server/pkg/id/idx"
)

var TypeAsset Type = "asset"

type FieldAsset struct {
	// TODO: change this to asset id when assets getting merged
	defaultValue *idx.ID[idx.Type]
}

func NewFieldAsset() *FieldAsset {
	return &FieldAsset{
		defaultValue: nil,
	}
}

func FieldAssetFrom(id *idx.ID[idx.Type]) *FieldAsset {
	return &FieldAsset{
		defaultValue: id,
	}
}

func (f *FieldAsset) TypeProperty() *TypeProperty {
	return &TypeProperty{
		asset: f,
	}
}
