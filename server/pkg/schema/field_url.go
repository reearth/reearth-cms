package schema

var TypeURL Type = "url"

type FieldURL struct {
	defaultValue *string
}

func newFieldURL() *FieldURL {
	return &FieldURL{
		defaultValue: nil,
	}
}

func FieldURLFrom(url *string) *FieldURL {
	return &FieldURL{
		defaultValue: url,
	}
}

func (f *FieldURL) TypeProperty() *TypeProperty {
	return &TypeProperty{
		url: f,
	}
}

func (f *FieldURL) DefaultValue() *string {
	return f.defaultValue
}
