package schema

import (
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/samber/lo"
	"golang.org/x/exp/slices"
)

type FieldTag struct {
	values []string
}

func NewFieldTag(values []string) *FieldTag {
	return &FieldTag{
		values: slices.Clone(values),
	}
}

func (f *FieldTag) TypeProperty() *TypeProperty {
	return &TypeProperty{
		tag: f,
	}
}

func (f *FieldTag) Values() []string {
	return f.values
}

func (f *FieldTag) Validate(v *value.Value) (err error) {
	v.Match(value.Match{
		Tag: func(tags []string) {
			if !lo.Every(f.values, tags) {
				err = ErrInvalidDefaultValue
			}
		},
		Default: func() {
			err = ErrInvalidDefaultValue
		},
	})
	return
}
