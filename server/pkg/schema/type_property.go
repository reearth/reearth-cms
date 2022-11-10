package schema

import (
	"errors"

	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearthx/rerror"
)

var ErrInvalidValue = errors.New("invalid default value")

// TypeProperty represents special attributes for some fields.
// Only one of the type properties should be not nil.
type TypeProperty struct {
	text      *FieldText
	textArea  *FieldTextArea
	richText  *FieldRichText
	markdown  *FieldMarkdown
	asset     *FieldAsset
	date      *FieldDate
	bool      *FieldBool
	selectt   *FieldSelect
	tag       *FieldTag
	integer   *FieldInteger
	reference *FieldReference
	url       *FieldURL
}

// NOTE: pkg/item/match.go should be also updated when you add a new type

type TypePropertyMatch struct {
	Text      func(*FieldText)
	TextArea  func(*FieldTextArea)
	RichText  func(*FieldRichText)
	Markdown  func(*FieldMarkdown)
	Asset     func(*FieldAsset)
	Date      func(*FieldDate)
	Bool      func(*FieldBool)
	Select    func(*FieldSelect)
	Tag       func(*FieldTag)
	Integer   func(*FieldInteger)
	Reference func(*FieldReference)
	URL       func(*FieldURL)
	Default   func()
}

type TypePropertyMatch1[T any] struct {
	Text      func(*FieldText) T
	TextArea  func(*FieldTextArea) T
	RichText  func(*FieldRichText) T
	Markdown  func(*FieldMarkdown) T
	Asset     func(*FieldAsset) T
	Date      func(*FieldDate) T
	Bool      func(*FieldBool) T
	Select    func(*FieldSelect) T
	Tag       func(*FieldTag) T
	Integer   func(*FieldInteger) T
	Reference func(*FieldReference) T
	URL       func(*FieldURL) T
	Default   func() T
}

func (t *TypeProperty) Type() value.Type {
	switch {
	case t.text != nil:
		return value.TypeText
	case t.textArea != nil:
		return value.TypeTextArea
	case t.richText != nil:
		return value.TypeRichText
	case t.markdown != nil:
		return value.TypeMarkdown
	case t.asset != nil:
		return value.TypeAsset
	case t.date != nil:
		return value.TypeDate
	case t.bool != nil:
		return value.TypeBool
	case t.selectt != nil:
		return value.TypeSelect
	case t.tag != nil:
		return value.TypeTag
	case t.integer != nil:
		return value.TypeInteger
	case t.reference != nil:
		return value.TypeReference
	case t.url != nil:
		return value.TypeURL
	}
	return ""
}

func (t *TypeProperty) Match(m TypePropertyMatch) {
	if t == nil {
		return
	}
	if t.text != nil {
		if m.Text != nil {
			m.Text(t.text)
		}
	} else if t.textArea != nil {
		if m.TextArea != nil {
			m.TextArea(t.textArea)
		}
	} else if t.richText != nil {
		if m.RichText != nil {
			m.RichText(t.richText)
		}
	} else if t.markdown != nil {
		if m.Markdown != nil {
			m.Markdown(t.markdown)
		}
	} else if t.asset != nil {
		if m.Asset != nil {
			m.Asset(t.asset)
		}
	} else if t.date != nil {
		if m.Date != nil {
			m.Date(t.date)
		}
	} else if t.bool != nil {
		if m.Bool != nil {
			m.Bool(t.bool)
		}
	} else if t.selectt != nil {
		if m.Select != nil {
			m.Select(t.selectt)
		}
	} else if t.tag != nil {
		if m.Tag != nil {
			m.Tag(t.tag)
		}
	} else if t.integer != nil {
		if m.Integer != nil {
			m.Integer(t.integer)
		}
	} else if t.reference != nil {
		if m.Reference != nil {
			m.Reference(t.reference)
		}
	} else if t.url != nil {
		if m.URL != nil {
			m.URL(t.url)
		}
	} else if m.Default != nil {
		m.Default()
	}
}

func (t *TypeProperty) Clone() *TypeProperty {
	if t == nil {
		return nil
	}

	return &TypeProperty{
		text:      t.text,
		textArea:  t.textArea,
		richText:  t.richText,
		markdown:  t.markdown,
		asset:     t.asset,
		date:      t.date,
		bool:      t.bool,
		selectt:   t.selectt,
		tag:       t.tag,
		integer:   t.integer,
		reference: t.reference,
		url:       t.url,
	}
}

func MatchTypeProperty1[T any](t *TypeProperty, m TypePropertyMatch1[T]) (res T) {
	t.Match(TypePropertyMatch{
		Text: func(f *FieldText) {
			if m.Text != nil {
				res = m.Text(f)
			}
		},
		TextArea: func(f *FieldTextArea) {
			if m.TextArea != nil {
				res = m.TextArea(f)
			}
		},
		RichText: func(f *FieldRichText) {
			if m.RichText != nil {
				res = m.RichText(f)
			}
		},
		Markdown: func(f *FieldMarkdown) {
			if m.Markdown != nil {
				res = m.Markdown(f)
			}
		},
		Asset: func(f *FieldAsset) {
			if m.Asset != nil {
				res = m.Asset(f)
			}
		},
		Date: func(f *FieldDate) {
			if m.Date != nil {
				res = m.Date(f)
			}
		},
		Bool: func(f *FieldBool) {
			if m.Bool != nil {
				res = m.Bool(f)
			}
		},
		Select: func(f *FieldSelect) {
			if m.Select != nil {
				res = m.Select(f)
			}
		},
		Tag: func(f *FieldTag) {
			if m.Tag != nil {
				res = m.Tag(f)
			}
		},
		Integer: func(f *FieldInteger) {
			if m.Integer != nil {
				res = m.Integer(f)
			}
		},
		Reference: func(f *FieldReference) {
			if m.Reference != nil {
				res = m.Reference(f)
			}
		},
		URL: func(f *FieldURL) {
			if m.URL != nil {
				res = m.URL(f)
			}
		},
		Default: func() {
			if m.Default != nil {
				res = m.Default()
			}
		},
	})
	return
}

func (ty *TypeProperty) Validate(v *value.Value) error {
	if v.Type() != ty.Type() {
		return ErrInvalidValue
	}

	err := MatchTypeProperty1(ty, TypePropertyMatch1[error]{
		// TODO
		URL: func(ty *FieldURL) error {
			return ty.Validate(v)
		},
	})

	if err != nil {
		if err == ErrInvalidValue {
			return err
		}

		return &rerror.Error{
			Label: ErrInvalidValue,
			Err:   err,
		}
	}

	return nil
}
