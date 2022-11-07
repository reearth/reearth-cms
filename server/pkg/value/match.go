package value

type Match struct {
	Text     func(string)
	TextArea func(string)
	RichText func(string)
	Markdown func(string)
	Nil      func(Type)
	Default  func()
}

func (v *Value) Match(m Match) {
	if v == nil {
		if m.Default != nil {
			m.Default()
		}
		return
	}

	if v.v == nil {
		if m.Nil != nil {
			m.Nil(v.Type())
		}
		return
	}

	switch v.t {
	case TypeText:
		if m.Text != nil {
			m.Text(v.v.(string))
		}
	case TypeTextArea:
		if m.TextArea != nil {
			m.TextArea(v.v.(string))
		}
	case TypeRichText:
		if m.RichText != nil {
			m.RichText(v.v.(string))
		}
	case TypeMarkdown:
		if m.Markdown != nil {
			m.Markdown(v.v.(string))
		}
	// TODO: add types, add unit test for Match method
	default:
		if m.Default != nil {
			m.Default()
		}
	}
}
