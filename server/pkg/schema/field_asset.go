package schema

import (
	"github.com/reearth/reearth-cms/server/pkg/id"
)

type FieldAsset struct {
	defaultValue *id.AssetID
}

func FieldAssetFrom(id *id.AssetID) *FieldAsset {
	return &FieldAsset{
		defaultValue: id.CloneRef(),
	}
}

func (f *FieldAsset) TypeProperty() *TypeProperty {
	return &TypeProperty{
		asset: f,
	}
}

func (f *FieldAsset) DefaultValue() *id.AssetID {
	return f.defaultValue
}
