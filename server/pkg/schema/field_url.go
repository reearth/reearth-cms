package schema

var TypeURL Type = "url"

type FieldURL struct {
	defaultValue *string
}

func NewFieldURL() *FieldURL {
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
