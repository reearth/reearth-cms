package schema

import (
	"errors"

	"github.com/samber/lo"
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

// NewFieldTag
// TODO: check if its ok to remove this
func NewFieldSelect() *FieldSelect {
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
	return &FieldSelect{
		values:       values,
		defaultValue: defaultValue,
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
