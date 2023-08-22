package schema

import (
	"strings"

	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/samber/lo"
	"golang.org/x/exp/slices"
)

type FieldTag struct {
	values        []string
	allowMultiple bool
}

func NewTag(values []string, allowMultiple bool) *FieldTag {
	return &FieldTag{
		values: lo.Uniq(lo.FilterMap(values, func(v string, _ int) (string, bool) {
			s := strings.TrimSpace(v)
			return s, len(s) > 0
		})),
		allowMultiple: allowMultiple,
	}
}

func (f *FieldTag) TypeProperty() *TypeProperty {
	return &TypeProperty{
		t:   f.Type(),
		tag: f,
	}
}

func (f *FieldTag) Values() []string {
	return slices.Clone(f.values)
}

func (f *FieldTag) AllowMultiple() bool {
	return f.allowMultiple
}

func (*FieldTag) Type() value.Type {
	return value.TypeTag
}

func (f *FieldTag) Clone() *FieldTag {
	if f == nil {
		return nil
	}
	return &FieldTag{
		values:        slices.Clone(f.values),
		allowMultiple: f.allowMultiple,
	}
}

func (f *FieldTag) Validate(v *value.Value) (err error) {
	v.Match(value.Match{
		Tag: func(a value.String) {
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
