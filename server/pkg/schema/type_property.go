package schema

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
