package value

import "github.com/samber/lo"

type Match struct {
	Text         func(*string)
	TypeTextArea func(*string)
	TypeRichText func(*string)
	TypeMarkdown func(*string)
	Default      func()
}

func (v *Value) Match(m Match) {
	if v == nil {
		if m.Default != nil {
			m.Default()
		}
		return
	}

	switch v.t {
	case TypeText:
		if m.Text != nil {
			var w *string
			if v.v != nil {
				w = lo.ToPtr(v.v.(string))
			}
			m.Text(w)
		}
	case TypeTextArea:
		if m.TypeTextArea != nil {
			var w *string
			if v.v != nil {
				w = lo.ToPtr(v.v.(string))
			}
			m.TypeTextArea(w)
		}
	case TypeRichText:
		if m.TypeRichText != nil {
			var w *string
			if v.v != nil {
				w = lo.ToPtr(v.v.(string))
			}
			m.TypeRichText(w)
		}
	case TypeMarkdown:
		if m.TypeMarkdown != nil {
			var w *string
			if v.v != nil {
				w = lo.ToPtr(v.v.(string))
			}
			m.TypeMarkdown(w)
		}
	default:
		if m.Default != nil {
			m.Default()
		}
	}
}
