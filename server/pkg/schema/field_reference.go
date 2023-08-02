package schema

import (
	"fmt"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/model"
	"github.com/reearth/reearth-cms/server/pkg/value"
)

type FieldReference struct {
	modelId              id.ModelID
	correspondingFieldId *id.FieldID
}

func NewReference(id id.ModelID, cfId *id.FieldID) *FieldReference {
	return &FieldReference{
		modelId:              id,
		correspondingFieldId: cfId,
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
	return f.modelId
}

func (f *FieldReference) CorrespondingField() *id.FieldID {
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
		modelId:              f.modelId,
		correspondingFieldId: f.correspondingFieldId,
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
