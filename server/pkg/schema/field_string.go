package schema

import (
	"unicode/utf8"

	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearthx/i18n"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/util"
)

var ErrStringFieldMaxLengthExceeded = func(max int) error { return rerror.FmtE(i18n.T("value should be shorter than %d characters"), max) }

type FieldString struct {
	t         value.Type
	maxLength *int
}

func NewString(t value.Type, maxLength *int) *FieldString {
	return &FieldString{
		t:         t,
		maxLength: maxLength,
	}
}

func (f *FieldString) MaxLength() *int {
	return util.CloneRef(f.maxLength)
}

func (f *FieldString) Type() value.Type {
	return f.t
}

func (f *FieldString) Clone() *FieldString {
	if f == nil {
		return nil
	}
	return &FieldString{
		t:         f.t,
		maxLength: util.CloneRef(f.maxLength),
	}
}

func (f *FieldString) ValidateMultiple(_ *value.Multiple) error {
	return nil
}

func (f *FieldString) Validate(v *value.Value) error {
	if v.Type() != f.t {
		return ErrInvalidValue
	}

	s, ok := v.ValueString()
	if !ok {
		return ErrInvalidValue
	}

	if f.maxLength != nil {
		if utf8.RuneCountInString(s) > *f.maxLength {
			return ErrStringFieldMaxLengthExceeded(*f.maxLength)
		}
	}

	return nil
}
