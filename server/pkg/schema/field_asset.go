package schema

var TypeAsset Type = "asset"

type FieldAsset struct {
}

func NewFieldAsset() *FieldAsset {
	panic("not implemented")
}

func (f *FieldAsset) TypeProperty() *TypeProperty {
	return &TypeProperty{
		asset: f,
	}
}
