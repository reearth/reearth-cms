package schema

type TypeProperty struct {
	text     *FieldText
	textArea *FieldTextArea
}

type TypePropertyMatch struct {
	Text     func(*FieldText)
	TextArea func(*FieldTextArea)
	Default  func()
}

type TypePropertyMatch1[T any] struct {
	Text     func(*FieldText) T
	TextArea func(*FieldTextArea) T
	Default  func() T
}

func (t *TypeProperty) Type() Type {
	if t.text != nil {
		return TypeText
	} else if t.textArea != nil {
		return TypeTextArea
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
		Default: func() {
			if m.Default != nil {
				res = m.Default()
			}
		},
	})
	return
}
