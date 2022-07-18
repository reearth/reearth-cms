package schema

// TypeProperty Represent special attributes for some field
// only one of the type properties should be not nil
type TypeProperty struct {
	text     *FieldText
	textArea *FieldTextArea
	asset    *FieldAsset
	integer  *FieldInteger
	markdown *FieldMarkdown
	selectt  *FieldSelect
	url      *FieldURL
}

type TypePropertyMatch struct {
	Text     func(*FieldText)
	TextArea func(*FieldTextArea)
	Asset    func(*FieldAsset)
	Integer  func(*FieldInteger)
	Markdown func(*FieldMarkdown)
	Select   func(*FieldSelect)
	URL      func(*FieldURL)
	Default  func()
}

type TypePropertyMatch1[T any] struct {
	Text     func(*FieldText) T
	TextArea func(*FieldTextArea) T
	Asset    func(*FieldAsset) T
	Integer  func(*FieldInteger) T
	Markdown func(*FieldMarkdown) T
	Select   func(*FieldSelect) T
	URL      func(*FieldURL) T
	Default  func() T
}

func (t *TypeProperty) Type() Type {
	if t.text != nil {
		return TypeText
	} else if t.textArea != nil {
		return TypeTextArea
	} else if t.asset != nil {
		return TypeAsset
	} else if t.integer != nil {
		return TypeInteger
	} else if t.markdown != nil {
		return TypeMarkdown
	} else if t.selectt != nil {
		return TypeSelect
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
	} else if t.asset != nil {
		if m.Asset != nil {
			m.Asset(t.asset)
		}
	} else if t.integer != nil {
		if m.Integer != nil {
			m.Integer(t.integer)
		}
	} else if t.markdown != nil {
		if m.Markdown != nil {
			m.Markdown(t.markdown)
		}
	} else if t.selectt != nil {
		if m.Select != nil {
			m.Select(t.selectt)
		}
	} else if t.url != nil {
		if m.URL != nil {
			m.URL(t.url)
		}
	} else if m.Default != nil {
		m.Default()
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
		Asset: func(f *FieldAsset) {
			if m.Asset != nil {
				res = m.Asset(f)
			}
		},
		Integer: func(f *FieldInteger) {
			if m.Integer != nil {
				res = m.Integer(f)
			}
		},
		Markdown: func(f *FieldMarkdown) {
			if m.Markdown != nil {
				res = m.Markdown(f)
			}
		},
		Select: func(f *FieldSelect) {
			if m.Select != nil {
				res = m.Select(f)
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
