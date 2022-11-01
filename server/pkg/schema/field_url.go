package schema

import "net/url"

var TypeURL Type = "url"

type FieldURL struct {
	defaultValue *string
}

func FieldURLFrom(defaultValue *string) (*FieldURL, error) {
	if defaultValue != nil && *defaultValue != "" {
		if !isUrl(*defaultValue) {
			return nil, ErrFieldDefaultValue
		}
	}
	return &FieldURL{
		defaultValue: defaultValue,
	}, nil
}

func MustFieldURLFrom(defaultValue *string) *FieldURL {
	v, err := FieldURLFrom(defaultValue)
	if err != nil {
		panic(err)
	}
	return v
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
