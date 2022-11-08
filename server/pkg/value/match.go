package value

import "time"

type Match struct {
	Text      func(string)
	TextArea  func(string)
	RichText  func(string)
	Markdown  func(string)
	Date      func(time.Time)
	Asset     func(string)
	Bool      func(bool)
	Select    func(string)
	Tag       func(string)
	Integer   func(int)
	Reference func(string)
	URL       func(string)
	Unknown   func(Type)
	Nil       func(Type)
	Default   func()
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
	// TODO: think return val
	case TypeDate:
		if m.Date != nil {
			m.Date(v.v.(time.Time))
		}
	case TypeAsset:
		if m.Asset != nil {
			m.Asset(v.v.(string))
		}
	case TypeBool:
		if m.Bool != nil {
			m.Bool(v.v.(bool))
		}
	case TypeSelect:
		if m.Select != nil {
			m.Select(v.v.(string))
		}
	case TypeTag:
		if m.Tag != nil {
			m.Tag(v.v.(string))
		}
	case TypeInteger:
		if m.Integer != nil {
			m.Integer(v.v.(int))
		}
	case TypeReference:
		if m.Reference != nil {
			m.Reference(v.v.(string))
		}
	case TypeURL:
		if m.URL != nil {
			m.URL(v.v.(string))
		}
	case TypeUnknown:
		if m.Unknown != nil {
			m.Unknown(v.Type())
		}
	// TODO: add unit test for Match method
	default:
		if m.Default != nil {
			m.Default()
		}
	}
}
