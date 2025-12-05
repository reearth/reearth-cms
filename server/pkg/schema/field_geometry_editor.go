package schema

import (
	"strings"

	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/samber/lo"
	"golang.org/x/exp/slices"
)

type GeometryEditorSupportedTypeList []GeometryEditorSupportedType

func (l GeometryEditorSupportedTypeList) Has(st GeometryEditorSupportedType) bool {
	hasAny := slices.Contains(l, GeometryEditorSupportedTypeAny)
	if hasAny && st != "" {
		return true
	}
	return slices.ContainsFunc(l, func(t GeometryEditorSupportedType) bool {
		return t == st
	})
}

type FieldGeometryEditor struct {
	st GeometryEditorSupportedTypeList
}

func NewGeometryEditor(supportedTypes GeometryEditorSupportedTypeList) *FieldGeometryEditor {
	return &FieldGeometryEditor{
		st: lo.Uniq(supportedTypes),
	}
}

func (f *FieldGeometryEditor) TypeProperty() *TypeProperty {
	return &TypeProperty{
		t:              f.Type(),
		geometryEditor: f,
	}
}

func (f *FieldGeometryEditor) SupportedTypes() GeometryEditorSupportedTypeList {
	return slices.Clone(f.st)
}

func (f *FieldGeometryEditor) Type() value.Type {
	return value.TypeGeometryEditor
}

func (f *FieldGeometryEditor) Clone() *FieldGeometryEditor {
	if f == nil {
		return nil
	}
	return &FieldGeometryEditor{
		st: f.SupportedTypes(),
	}
}

func (f *FieldGeometryEditor) Validate(v *value.Value) (err error) {
	v.Match(value.Match{
		GeometryEditor: func(a value.String) {
			if len(strings.TrimSpace(a)) == 0 {
				return
			}
			t, ok := isValidGeoJSON(a)
			if !ok {
				err = ErrInvalidValue
			}
			ok2 := f.SupportedTypes().Has(GeometryEditorSupportedTypeFrom(string(t)))
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

func (f *FieldGeometryEditor) ValidateMultiple(v *value.Multiple) (err error) {
	return nil
}
