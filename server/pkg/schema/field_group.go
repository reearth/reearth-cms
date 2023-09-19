package schema

import (
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/value"
)

type FieldGroup struct {
	group GroupID
}

func NewGroup(gid GroupID) *FieldGroup {
	return &FieldGroup{
		group: gid,
	}
}

func (f *FieldGroup) Group() GroupID {
	return f.group
}

func (f *FieldGroup) TypeProperty() *TypeProperty {
	return &TypeProperty{
		t:     f.Type(),
		group: f,
	}
}

func (f *FieldGroup) Type() value.Type {
	return value.TypeGroup
}

func (f *FieldGroup) Clone() *FieldGroup {
	if f == nil {
		return nil
	}
	return &FieldGroup{
		group: f.Group(),
	}
}

func (f *FieldGroup) Validate(v *value.Value) (err error) {
	v.Match(value.Match{
		Group: func(a value.String) {
			_, err2 := id.SchemaIDFrom(a)
			if err2 != nil {
				err = ErrInvalidValue
			}
		},
		Default: func() {
			err = ErrInvalidValue
		},
	})
	return
}

func (f *FieldGroup) ValidateMultiple(v *value.Multiple) error {
	vs, ok := v.ValuesString()
	if !ok {
		return ErrInvalidValue
	}
	tmap := make(map[string]struct{})
	for _, i := range vs {
		if _, ok := tmap[i]; ok {
			return ErrInvalidValue
		}
		tmap[i] = struct{}{}
	}
	return nil
}
