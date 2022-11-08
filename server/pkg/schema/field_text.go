package schema

import (
	"errors"

	"github.com/reearth/reearthx/util"
)

// ペアプロ以来の修正箇所, conflict解消
var TypeText Type = "text"
var ErrInvalidTextDefault = errors.New("invalid default value")

type FieldText struct {
	defaultValue *string
	maxLength    *int
}

func FieldTextFrom(defaultValue *string, maxLength *int) (*FieldText, error) {
	if defaultValue != nil && maxLength != nil && len(*defaultValue) > *maxLength {
		return nil, ErrInvalidTextDefault
	}
	return &FieldText{
		defaultValue: defaultValue,
		maxLength:    maxLength,
	}, nil
}

func (f *FieldText) TypeProperty() *TypeProperty {
	return &TypeProperty{
		text: f,
	}
}

func (f *FieldText) DefaultValue() *string {
	return util.CloneRef(f.defaultValue)
}

func (f *FieldText) MaxLength() *int {
	return util.CloneRef(f.maxLength)
}
