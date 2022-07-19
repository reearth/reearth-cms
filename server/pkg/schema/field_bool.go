package schema

var TypeBool Type = "bool"

type FieldBool struct {
	defaultValue *bool
}

func NewFieldBool() *FieldBool {
	return &FieldBool{
		defaultValue: nil,
	}
}

func FieldBoolFrom(b *bool) *FieldBool {
	return &FieldBool{
		defaultValue: b,
	}
}

func (f *FieldBool) TypeProperty() *TypeProperty {
	return &TypeProperty{
		bool: f,
	}
}
