package schema

import (
	"github.com/reearth/reearth-cms/server/pkg/model"
)

type FieldReference struct {
	modelID model.ID
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

func (f *FieldReference) ModelID() model.ID {
	return f.modelID
}
