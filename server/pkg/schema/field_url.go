package schema

import "net/url"

var TypeURL Type = "url"

type FieldURL struct {
	defaultValue *string
}

func newFieldURL() *FieldURL {
	return &FieldURL{
		defaultValue: nil,
	}
}

func FieldURLFrom(defaultValue *string) (*FieldURL, error) {
	if defaultValue != nil {
		if !isUrl(*defaultValue) {
			return nil, ErrFieldDefaultValue
		}
	}
	return &FieldURL{
		defaultValue: defaultValue,
	}, nil
}

func isUrl(str string) bool {
	u, err := url.Parse(str)
	return err == nil && u.Scheme != "" && u.Host != ""
}

func (f *FieldURL) TypeProperty() *TypeProperty {
	return &TypeProperty{
		url: f,
	}
}

func (f *FieldURL) DefaultValue() *string {
	return f.defaultValue
}
