package schema

import (
	"github.com/reearth/reearth-cms/server/pkg/value"
	"golang.org/x/exp/slices"
)

type GeometrySupportedTypeList []GeometrySupportedType

type FieldGeometry struct {
	st GeometrySupportedTypeList
}

func NewGeometry(supportedTypes GeometrySupportedTypeList) *FieldGeometry {
	return &FieldGeometry{
		st: supportedTypes,
	}
}

func (f *FieldGeometry) TypeProperty() *TypeProperty {
	return &TypeProperty{
		t:        f.Type(),
		geometry: f,
	}
}

func (f *FieldGeometry) SupportedTypes() GeometrySupportedTypeList {
	return slices.Clone(f.st)
}

func (f *FieldGeometry) Type() value.Type {
	return value.TypeGeometry
}

func (f *FieldGeometry) Clone() *FieldGeometry {
	if f == nil {
		return nil
	}
	return &FieldGeometry{
		st: f.SupportedTypes(),
	}
}

func (f *FieldGeometry) Validate(v *value.Value) (err error) {
	v.Match(value.Match{
		Geometry: func(a value.String) {
			if a == "" {
				err = ErrInvalidValue
			}
		},
		Default: func() {
			err = ErrInvalidValue
		},
	})
	return
}

func (f *FieldGeometry) ValidateMultiple(v *value.Multiple) (err error) {
	vs, ok := v.ValuesString()
	if !ok {
		return ErrInvalidValue
	}
	gmap := make(map[string]struct{})
	for _, i := range vs {
		if _, ok := gmap[i]; ok {
			return ErrDuplicatedTag
		}
		gmap[i] = struct{}{}
	}
	return
}
