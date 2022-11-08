package value

type Match struct {
	Text      func(TextValue)
	TextArea  func(TextValue)
	RichText  func(TextValue)
	Markdown  func(TextValue)
	Date      func(DateValue)
	Asset     func(AssetValue)
	Bool      func(BoolValue)
	Select    func(SelectValue)
	Tag       func(TagValue)
	Integer   func(IntegerValue)
	Reference func(ReferenceValue)
	URL       func(URLValue)
	Nil       func(Type)
	Default   func()
}

// TODO: add test
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
			return
		}

		if m.Default != nil {
			m.Default()
		}

		return
	}

	switch v.t {
	case TypeText:
		if m.Text != nil {
			m.Text(v.v.(TextValue))
			return
		}
	case TypeTextArea:
		if m.TextArea != nil {
			m.TextArea(v.v.(TextValue))
			return
		}
	case TypeRichText:
		if m.RichText != nil {
			m.RichText(v.v.(TextValue))
			return
		}
	case TypeMarkdown:
		if m.Markdown != nil {
			m.Markdown(v.v.(TextValue))
			return
		}
	case TypeDate:
		if m.Date != nil {
			m.Date(v.v.(DateValue))
			return
		}
	case TypeAsset:
		if m.Asset != nil {
			m.Asset(v.v.(AssetValue))
			return
		}
	case TypeBool:
		if m.Bool != nil {
			m.Bool(v.v.(BoolValue))
			return
		}
	case TypeSelect:
		if m.Select != nil {
			m.Select(v.v.(SelectValue))
			return
		}
	case TypeTag:
		if m.Tag != nil {
			m.Tag(v.v.(TagValue))
			return
		}
	case TypeInteger:
		if m.Integer != nil {
			m.Integer(v.v.(IntegerValue))
			return
		}
	case TypeReference:
		if m.Reference != nil {
			m.Reference(v.v.(ReferenceValue))
			return
		}
	case TypeURL:
		if m.URL != nil {
			m.URL(v.v.(URLValue))
			return
		}
	}

	if m.Default != nil {
		m.Default()
	}
}
