package schema

import (
	"strings"

	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
)

type FieldSelect struct {
	values []string
}

func NewFieldSelect(values []string) *FieldSelect {
	return &FieldSelect{
		values: lo.Uniq(util.Map(values, strings.TrimSpace)),
	}
}

func (f *FieldSelect) TypeProperty() *TypeProperty {
	return &TypeProperty{
		selectt: f,
	}
}

func (f *FieldSelect) Values() []string {
	return f.values
}

func (f *FieldSelect) Validate(v *value.Value) (err error) {
	v.Match(value.Match{
		Select: func(s string) {
			if !lo.Contains(f.values, s) {
				err = ErrInvalidValue
			}
		},
		Default: func() {
			err = ErrInvalidValue
		},
	})
	return
}
