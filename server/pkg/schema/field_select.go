package schema

import (
	"errors"
	"strings"

	"github.com/samber/lo"
	"golang.org/x/exp/slices"
)

var (
	ErrFieldValues       = errors.New("invalid values")
	ErrFieldDefaultValue = errors.New("invalid default values")
)

type FieldSelect struct {
	values       []string
	defaultValue *string
}

func FieldSelectFrom(values []string, defaultValue *string) (*FieldSelect, error) {
	empty := len(values) == 0
	emptyValue := lo.SomeBy(values, func(v string) bool { return len(strings.TrimSpace(v)) == 0 })
	dups := lo.FindDuplicates(values)
	if empty || emptyValue || len(dups) > 0 {
		return nil, ErrFieldValues
	}

	if defaultValue != nil && !lo.Contains(values, *defaultValue) {
		return nil, ErrFieldDefaultValue
	}
	var v *string = nil
	if defaultValue != nil {
		v = new(string)
		*v = strings.Clone(*defaultValue)
	}
	return &FieldSelect{
		values:       slices.Clone(values),
		defaultValue: v,
	}, nil
}

func MustFieldSelectFrom(values []string, defaultValue *string) *FieldSelect {
	v, err := FieldSelectFrom(values, defaultValue)
	if err != nil {
		panic(err)
	}
	return v
}

func (f *FieldSelect) TypeProperty() *TypeProperty {
	return &TypeProperty{
		selectt: f,
	}
}

func (f *FieldSelect) Values() []string {
	return f.values
}

func (f *FieldSelect) DefaultValue() *string {
	return f.defaultValue
}
