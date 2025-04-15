package schema

import (
	"strings"

	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/samber/lo"
	"golang.org/x/exp/slices"
)

type GeometryObjectSupportedTypeList []GeometryObjectSupportedType

func (l GeometryObjectSupportedTypeList) Has(st GeometryObjectSupportedType) bool {
	return slices.ContainsFunc(l, func(t GeometryObjectSupportedType) bool {
		return t == st
	})
}

type FieldGeometryObject struct {
	st GeometryObjectSupportedTypeList
}

func NewGeometryObject(supportedTypes GeometryObjectSupportedTypeList) *FieldGeometryObject {
	return &FieldGeometryObject{
		st: lo.Uniq(supportedTypes),
	}
}

func (f *FieldGeometryObject) TypeProperty() *TypeProperty {
	return &TypeProperty{
		t:              f.Type(),
		geometryObject: f,
	}
}

func (f *FieldGeometryObject) SupportedTypes() GeometryObjectSupportedTypeList {
	return slices.Clone(f.st)
}

func (f *FieldGeometryObject) Type() value.Type {
	return value.TypeGeometryObject
}

func (f *FieldGeometryObject) Clone() *FieldGeometryObject {
	if f == nil {
		return nil
	}
	return &FieldGeometryObject{
		st: f.SupportedTypes(),
	}
}

func (f *FieldGeometryObject) Validate(v *value.Value) (err error) {
	v.Match(value.Match{
		GeometryObject: func(a value.String) {
			if len(strings.TrimSpace(a)) == 0 {
				return
			}
			t, ok := isValidGeoJSON(a)
			if !ok {
				err = ErrInvalidValue
			}
			ok2 := f.SupportedTypes().Has(GeometryObjectSupportedTypeFrom(string(t)))
			if !ok2 {
				err = ErrUnsupportedType
			}
		},
		Default: func() {
			err = ErrInvalidValue
		},
	})
	return
}

func (f *FieldGeometryObject) ValidateMultiple(v *value.Multiple) (err error) {
	return nil
}
