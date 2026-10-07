package schema

import (
	"unicode/utf8"

	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearthx/i18n"
	"github.com/reearth/reearthx/rerror"
)

const maxURLFieldLength = 2048

var ErrURLFieldMaxLengthExceeded = rerror.NewE(i18n.T("URL field max length exceeded"))

type FieldURL struct {
}

func NewURL() *FieldURL {
	return &FieldURL{}
}

func (f *FieldURL) TypeProperty() *TypeProperty {
	return &TypeProperty{
		t:   f.Type(),
		url: f,
	}
}

func (*FieldURL) Type() value.Type {
	return value.TypeURL
}

func (f *FieldURL) Clone() *FieldURL {
	if f == nil {
		return nil
	}
	return &FieldURL{}
}

func (f *FieldURL) Validate(v *value.Value) (err error) {
	v.Match(value.Match{
		URL: func(a value.URL) {
			if a != nil && utf8.RuneCountInString(a.String()) > maxURLFieldLength {
				err = ErrURLFieldMaxLengthExceeded
			}
		},
		Default: func() {
			err = ErrInvalidValue
		},
	})
	return
}

func (f *FieldURL) ValidateMultiple(_ *value.Multiple) (err error) {
	return nil
}
