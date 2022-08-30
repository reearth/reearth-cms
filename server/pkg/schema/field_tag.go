package schema

import (
	"github.com/reearth/reearthx/util"
	"golang.org/x/exp/slices"
)

var TypeTag Type = "tag"

type FieldTag struct {
	values       []string
	defaultValue []string
}

func FieldTagFrom(values []string, defaultValue []string) (*FieldTag, error) {
	if len(values) == 0 {
		return nil, ErrFieldValues
	}
	if !util.Subset(values, defaultValue) {
		return nil, ErrFieldDefaultValue
	}
	return &FieldTag{
		values:       slices.Clone(values),
		defaultValue: slices.Clone(defaultValue),
	}, nil
}

func MustFieldTagFrom(values []string, defaultValue []string) *FieldTag {
	v, err := FieldTagFrom(values, defaultValue)
	if err != nil {
		panic(err)
	}
	return v
}

func (f *FieldTag) TypeProperty() *TypeProperty {
	return &TypeProperty{
		tag: f,
	}
}

func (f *FieldTag) Values() []string {
	return f.values
}

func (f *FieldTag) DefaultValue() []string {
	return f.defaultValue
}
