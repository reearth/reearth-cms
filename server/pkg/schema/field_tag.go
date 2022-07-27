package schema

var TypeTag Type = "tag"

type FieldTag struct {
	values       []string
	defaultValue *string
}

// NewFieldTag
// TODO: check if its ok to remove this
func NewFieldTag() *FieldTag {
	return &FieldTag{
		values:       nil,
		defaultValue: nil,
	}
}

func FieldTagFrom(values []string, defaultValue *string) (*FieldTag, error) {
	if values == nil {
		return nil, ErrFieldValues
	}
	return &FieldTag{
		values:       values,
		defaultValue: defaultValue,
	}, nil
}

func MustFieldTagFrom(values []string, defaultValue *string) *FieldTag {
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
