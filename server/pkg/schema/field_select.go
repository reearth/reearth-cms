package schema

import (
	"errors"
	"strings"

	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/samber/lo"
	"golang.org/x/exp/slices"
)

var (
	ErrFieldValues       = errors.New("invalid values")
	ErrFieldDefaultValue = errors.New("invalid default values")
)

type FieldSelect struct {
	values []string
}

func NewSelect(values []string) *FieldSelect {
	return &FieldSelect{
		values: lo.Uniq(lo.FilterMap(values, func(v string, _ int) (string, bool) {
			s := strings.TrimSpace(v)
			return s, len(s) > 0
		})),
	}
}

func (f *FieldSelect) TypeProperty() *TypeProperty {
	return &TypeProperty{
		t:       f.Type(),
		selectt: f,
	}
}

func (f *FieldSelect) Values() []string {
	return slices.Clone(f.values)
}

func (*FieldSelect) Type() value.Type {
	return value.TypeSelect
}

func (f *FieldSelect) Clone() *FieldSelect {
	if f == nil {
		return nil
	}
	return &FieldSelect{
		values: slices.Clone(f.values),
	}
}

func (f *FieldSelect) Validate(v *value.Value) (err error) {
	v.Match(value.Match{
		Select: func(a value.String) {
			if !slices.Contains(f.values, a) {
				err = ErrInvalidValue
			}
		},
		Default: func() {
			err = ErrInvalidValue
		},
	})
	return
}
