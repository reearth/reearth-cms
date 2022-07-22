package schema

import "github.com/reearth/reearth-cms/server/pkg/model"

var TypeReference Type = "reference"

type FieldReference struct {
	modelID model.ID
}

func NewFieldReference() *FieldReference {
	panic("not implemented")
}

func FieldReferenceFrom(id model.ID) *FieldReference {
	return &FieldReference{
		modelID: id,
	}
}

func (f *FieldReference) TypeProperty() *TypeProperty {
	return &TypeProperty{
		reference: f,
	}
}
