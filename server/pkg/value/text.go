package value

const TypeText Type = "text"
const TypeTextArea Type = "textArea"
const TypeRichText Type = "richText"
const TypeMarkdown Type = "markdown"

type TextValue = string

type text struct{}

func (*text) New(v any) (any, error) {
	switch w := v.(type) {
	case string:
		return w, nil
	case *string:
		if w == nil {
			return nil, nil
		}
		return *w, nil
	}
	return nil, ErrInvalidValue
}

func (v *Value) ValueText() (r *TextValue) {
	v.Match(Match{
		Text: func(v TextValue) {
			r = &v
		},
	})
	return
}

func (v *Value) ValueTextArea() (r *TextValue) {
	v.Match(Match{
		TextArea: func(v TextValue) {
			r = &v
		},
	})
	return
}

func (v *Value) ValueRichText() (r *TextValue) {
	v.Match(Match{
		RichText: func(v TextValue) {
			r = &v
		},
	})
	return
}

func (v *Value) ValueMarkdownText() (r *TextValue) {
	v.Match(Match{
		Markdown: func(v TextValue) {
			r = &v
		},
	})
	return
}
