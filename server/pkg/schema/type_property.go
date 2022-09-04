package schema

import (
	"time"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/model"
)

// TypeProperty Represent special attributes for some field
// only one of the type properties should be not nil
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

func NewFieldTypePropertyText(defaultValue *string, maxLength *int) *TypeProperty {
	return &TypeProperty{
		text: FieldTextFrom(defaultValue, maxLength),
	}
}

func NewFieldTypePropertyTextArea(defaultValue *string, maxLength *int) *TypeProperty {
	return &TypeProperty{
		textArea: FieldTextAreaFrom(defaultValue, maxLength),
	}
}

func NewFieldTypePropertyRichText(defaultValue *string, maxLength *int) *TypeProperty {
	return &TypeProperty{
		richText: FieldRichTextFrom(defaultValue, maxLength),
	}
}

func NewFieldTypePropertyMarkdown(defaultValue *string, maxLength *int) *TypeProperty {
	return &TypeProperty{
		markdown: FieldMarkdownFrom(defaultValue, maxLength),
	}
}

func NewFieldTypePropertyAsset(defaultValue *id.AssetID) *TypeProperty {
	return &TypeProperty{
		asset: FieldAssetFrom(defaultValue),
	}
}

func NewFieldTypePropertyDate(defaultValue *time.Time) *TypeProperty {
	return &TypeProperty{
		date: FieldDateFrom(defaultValue),
	}
}

func NewFieldTypePropertyBool(defaultValue *bool) *TypeProperty {
	return &TypeProperty{
		bool: FieldBoolFrom(defaultValue),
	}
}

func NewFieldTypePropertySelect(values []string, defaultValue *string) (*TypeProperty, error) {
	fs, err := FieldSelectFrom(values, defaultValue)
	if err != nil {
		return nil, err
	}
	return &TypeProperty{
		selectt: fs,
	}, nil
}

func NewFieldTypePropertyTag(values []string, defaultValue []string) (*TypeProperty, error) {
	ft, err := FieldTagFrom(values, defaultValue)
	if err != nil {
		return nil, err
	}
	return &TypeProperty{
		tag: ft,
	}, nil
}

func NewFieldTypePropertyInteger(defaultValue, min, max *int) (*TypeProperty, error) {
	ft, err := FieldIntegerFrom(defaultValue, min, max)
	if err != nil {
		return nil, err
	}
	return &TypeProperty{
		integer: ft,
	}, err
}

func NewFieldTypePropertyReference(defaultValue model.ID) *TypeProperty {
	return &TypeProperty{
		reference: FieldReferenceFrom(defaultValue),
	}
}

func NewFieldTypePropertyURL(defaultValue *string) (*TypeProperty, error) {
	tp, err := FieldURLFrom(defaultValue)
	if err != nil {
		return nil, err
	}
	return &TypeProperty{
		url: tp,
	}, nil
}

type TypePropertyMatch struct {
	Text      func(*FieldText)
	TextArea  func(*FieldTextArea)
	RichText  func(text *FieldRichText)
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
	RichText  func(text *FieldRichText) T
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

func (t *TypeProperty) Type() Type {
	if t.text != nil {
		return TypeText
	} else if t.textArea != nil {
		return TypeTextArea
	} else if t.richText != nil {
		return TypeRichText
	} else if t.markdown != nil {
		return TypeMarkdown
	} else if t.asset != nil {
		return TypeAsset
	} else if t.date != nil {
		return TypeDate
	} else if t.bool != nil {
		return TypeBool
	} else if t.selectt != nil {
		return TypeSelect
	} else if t.tag != nil {
		return TypeTag
	} else if t.integer != nil {
		return TypeInteger
	} else if t.reference != nil {
		return TypeReference
	} else if t.url != nil {
		return TypeURL
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

func (t *TypeProperty) UpdateFrom(t2 *TypeProperty) {
	if t == nil {
		return
	}
	if t.text != nil && t2.text != nil {
		t.text = FieldTextFrom(t2.text.defaultValue, t2.text.maxLength)
	} else if t.textArea != nil && t2.textArea != nil {
		t.textArea = FieldTextAreaFrom(t2.textArea.defaultValue, t2.textArea.maxLength)
	} else if t.richText != nil && t2.richText != nil {
		t.richText = FieldRichTextFrom(t2.richText.defaultValue, t2.richText.maxLength)
	} else if t.markdown != nil && t2.markdown != nil {
		t.markdown = FieldMarkdownFrom(t2.markdown.defaultValue, t2.markdown.maxLength)
	} else if t.asset != nil && t2.asset != nil {
		t.asset = FieldAssetFrom(t2.asset.defaultValue)
	} else if t.date != nil && t2.date != nil {
		t.date = FieldDateFrom(t2.date.defaultValue)
	} else if t.bool != nil && t2.bool != nil {
		t.bool = FieldBoolFrom(t2.bool.defaultValue)
	} else if t.selectt != nil && t2.selectt != nil {
		t.selectt, _ = FieldSelectFrom(t2.selectt.values, t2.selectt.defaultValue)
	} else if t.tag != nil && t2.tag != nil {
		t.tag, _ = FieldTagFrom(t2.tag.values, t2.tag.defaultValue)
	} else if t.integer != nil && t2.integer != nil {
		t.integer, _ = FieldIntegerFrom(t2.integer.defaultValue, t2.integer.min, t2.integer.max)
	} else if t.reference != nil && t2.reference != nil {
		t.reference = FieldReferenceFrom(t2.reference.modelID)
	} else if t.url != nil && t2.url != nil {
		t.url, _ = FieldURLFrom(t2.url.defaultValue)
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
