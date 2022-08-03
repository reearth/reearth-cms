package schema

import (
	"errors"
	"strings"

	"github.com/samber/lo"
	"golang.org/x/exp/slices"
)

var TypeSelect Type = "select"

var (
	ErrFieldValues       = errors.New("invalid values")
	ErrFieldDefaultValue = errors.New("invalid default values")
)

type FieldSelect struct {
	values       []string
	defaultValue *string
}

// NewFieldSelect
// TODO: check if its ok to remove this
func newFieldSelect() *FieldSelect {
	return &FieldSelect{
		values:       nil,
		defaultValue: nil,
	}
}

func FieldSelectFrom(values []string, defaultValue *string) (*FieldSelect, error) {
	if len(values) == 0 {
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
