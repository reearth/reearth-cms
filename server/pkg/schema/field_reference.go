package schema

import (
	"fmt"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/model"
	"github.com/reearth/reearth-cms/server/pkg/value"
)

type CorrespondingField struct {
	ID           id.FieldID
	Name         string
	Description  *string
	Key          string
	Multiple     bool
	Unique       bool
	Required     bool
	TypeProperty *TypeProperty
}

type FieldReference struct {
	modelID              id.ModelID
	correspondingFieldId *id.FieldID
	correspondingField   *CorrespondingField
}

func NewReference(id id.ModelID, fId *id.FieldID, cf *CorrespondingField) *FieldReference {
	return &FieldReference{
		modelID:              id,
		correspondingFieldId: fId,
		correspondingField:   cf,
	}
}

func NewTypeProperty(r *FieldReference) *TypeProperty {
	return &TypeProperty{
		t:         value.TypeReference,
		reference: r,
	}
}

func NewFieldReference(mid id.ModelID, cfid *id.FieldID, cf *CorrespondingField) *FieldReference {
	return &FieldReference{
		modelID:              mid,
		correspondingFieldId: cfid,
		correspondingField:   cf,
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

func (f *FieldReference) CorrespondingFieldId() *id.FieldID {
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
		modelID:            f.modelID,
		correspondingField: f.correspondingField,
	}
}

func (f *FieldReference) Validate(v *value.Value) (err error) {
	v.Match(value.Match{
		Reference: func(a value.Reference) {
			v, ok := v.ValueReference()
			if !ok {
				err = fmt.Errorf("invalid value %v", v)
			}
		},
		Default: func() {
			err = ErrInvalidValue
		},
	})
	return
}
