package schema

var TypeTag Type = "tag"

type FieldTag struct {
	values       []string
	defaultValue *int
}

// NewFieldTag
// TODO: check if its ok to remove this
func NewFieldTag() *FieldTag {
	return &FieldTag{
		values:       nil,
		defaultValue: nil,
	}
}

func FieldTagFrom(values []string, defaultValue *int) (*FieldTag, error) {
	if values == nil {
		return nil, ErrFieldValues
	}
	if defaultValue != nil && (len(values) <= *defaultValue || *defaultValue < 0) {
		return nil, ErrFieldDefaultValue
	}
	return &FieldTag{
		values:       values,
		defaultValue: defaultValue,
	}, nil
}

func MustFieldTagFrom(values []string, defaultValue *int) *FieldTag {
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
