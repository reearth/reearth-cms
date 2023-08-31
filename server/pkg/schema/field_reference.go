package schema

import (
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/model"
	"github.com/reearth/reearth-cms/server/pkg/value"
)

type CorrespondingField struct {
	FieldID     *id.FieldID
	Title       *string
	Key         *string
	Description *string
	Required    *bool
}

type FieldReference struct {
	modelID              id.ModelID
	correspondingFieldId *id.FieldID
	correspondingField   *CorrespondingField
}

func NewReference(id id.ModelID, cf *CorrespondingField, cfId *id.FieldID) *FieldReference {
	return &FieldReference{
		modelID:              id,
		correspondingFieldId: cfId,
		correspondingField:   cf,
	}
}

func (f *FieldReference) TypeProperty() *TypeProperty {
	return &TypeProperty{
		t:         f.Type(),
		reference: f,
	}
}

func (f *FieldReference) SetCorrespondingField(cf *id.FieldID) {
	f.correspondingFieldId = cf
}

func (f *FieldReference) Model() model.ID {
	return f.modelID
}

func (f *FieldReference) CorrespondingField() *CorrespondingField {
	return f.correspondingField
}

func (f *FieldReference) CorrespondingFieldID() *id.FieldID {
	return f.correspondingFieldId
}

func (f *FieldReference) Type() value.Type {
	return value.TypeReference
}

func (f *FieldReference) Clone() *FieldReference {
	if f == nil {
		return nil
	}
	return &FieldReference{
		modelID:              f.modelID,
		correspondingFieldId: f.correspondingFieldId,
		correspondingField:   f.correspondingField,
	}
}

func (f *FieldReference) Validate(v *value.Value) (err error) {
	v.Match(value.Match{
		Reference: func(a value.Reference) {
			_, ok := v.ValueReference()
			if !ok {
				err = ErrInvalidValue
			}
		},
		Default: func() {
			err = ErrInvalidValue
		},
	})
	return
}

func (f *FieldReference) ValidateMultiple(v *value.Multiple) error {
	return nil
}
