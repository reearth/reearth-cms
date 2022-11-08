package schema

import (
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/model"
	"github.com/reearth/reearth-cms/server/pkg/value"
)

type FieldReference struct {
	modelID model.ID
}

func NewFieldReference(id model.ID) *FieldReference {
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

func (f *FieldReference) Validate(v *value.Value) (err error) {
	v.Match(value.Match{
		Reference: func(_ id.ItemID) {
			// nothing to do
		},
		Default: func() {
			err = ErrInvalidDefaultValue
		},
	})
	return
}
