package schema

import (
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/model"
	"github.com/reearth/reearth-cms/server/pkg/value"
)

type CorrespondingField struct {
	title        string
	description  string
	key          string
	multiple     bool
	unique       bool
	required     bool
	typeProperty TypeProperty
}

type FieldReference struct {
	modelID            id.ModelID
	correspondingField *CorrespondingField
}

func NewReference(id id.ModelID, correspondingField *CorrespondingField) *FieldReference {
	return &FieldReference{
		modelID:            id,
		correspondingField: correspondingField,
	}
}

func (f *FieldReference) TypeProperty() *TypeProperty {
	return &TypeProperty{
		t:         f.Type(),
		reference: f,
	}
}

func (f *FieldReference) Model() model.ID {
	return f.modelID
}

func (f *FieldReference) CorrespondingField() *CorrespondingField {
	return f.correspondingField
}

func (f *FieldReference) Type() value.Type {
	return value.TypeReference
}

func (f *FieldReference) Clone() *FieldReference {
	if f == nil {
		return nil
	}
	return &FieldReference{
		modelID:            f.modelID,
		correspondingField: f.correspondingField,
	}
}

func (f *FieldReference) Validate(v *value.Value) (err error) {
	v.Match(value.Match{
		Reference: func(a value.Reference) {
			// ok
		},
		Default: func() {
			err = ErrInvalidValue
		},
	})
	return
}
