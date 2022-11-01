package value

import "github.com/samber/lo"

type Match struct {
	Text func(*string)
	// TODO
	Default func()
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
		// TODO
	default:
		if m.Default != nil {
			m.Default()
		}
	}
}
