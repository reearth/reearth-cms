package schema

import (
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/key"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/samber/lo"
)

type CorrespondingFieldTuple struct {
	Schema1 *Schema
	Field1  *Field
	Schema2 *Schema
	Field2  *Field
}

func GetCorrespondingFields(s1, s2 *Schema, mid id.ModelID, f1 *Field, fr *FieldReference) (*CorrespondingFieldTuple, error) {
	cf1 := fr.CorrespondingField()
	// check if reference direction is two way
	if cf1 != nil {

		if cf1.Key == nil || s2.HasFieldByKey(lo.FromPtr(cf1.Key)) {
			return nil, ErrInvalidKey
		}

		cf2 := &CorrespondingField{
			FieldID:     f1.ID().Ref(),
			Title:       lo.ToPtr(f1.Name()),
			Key:         lo.ToPtr(f1.Key().String()),
			Description: lo.ToPtr(f1.Description()),
			Required:    lo.ToPtr(f1.Required()),
		}
		tp := NewReference(mid, cf2, cf2.FieldID).TypeProperty()

		f2, err := NewField(tp).
			NewID().
			Unique(false).
			Multiple(false).
			Required(lo.FromPtr(cf1.Required)).
			Name(lo.FromPtr(cf1.Title)).
			Description(lo.FromPtr(cf1.Description)).
			Key(key.New(lo.FromPtr(cf1.Key))).
			DefaultValue(nil).
			Build()
		if err != nil {
			return nil, err
		}

		fr.SetCorrespondingField(f2.ID().Ref())

		return &CorrespondingFieldTuple{
			Schema1: s1,
			Field1:  f1,
			Schema2: s2,
			Field2:  f2,
		}, nil
	}
	return nil, nil
}

func FieldReferenceFromTypeProperty(tp *TypeProperty) (*FieldReference, bool) {
	if tp.Type() != value.TypeReference {
		return nil, false
	}
	var fr *FieldReference
	tp.Match(TypePropertyMatch{
		Reference: func(f *FieldReference) {
			fr = f
		},
	})
	if fr == nil {
		return nil, false
	}
	return fr, true
}
