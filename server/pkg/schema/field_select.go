package schema

import "errors"

var TypeSelect Type = "select"

var (
	ErrFieldValues       = errors.New("invalid values")
	ErrFieldDefaultValue = errors.New("invalid default values")
)

type FieldSelect struct {
	values       []string
	defaultValue *int
}

// NewFieldTag
// TODO: check if its ok to remove this
func NewFieldSelect() *FieldSelect {
	return &FieldSelect{
		values:       nil,
		defaultValue: nil,
	}
}

func FieldSelectFrom(values []string, defaultValue *int) (*FieldSelect, error) {
	if values == nil {
		return nil, ErrFieldValues
	}
	if defaultValue != nil && (len(values) <= *defaultValue || *defaultValue < 0) {
		return nil, ErrFieldDefaultValue
	}
	return &FieldSelect{
		values:       values,
		defaultValue: defaultValue,
	}, nil
}

func MustFieldSelectFrom(values []string, defaultValue *int) *FieldSelect {
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
