package value

const TypeSelect Type = "select"

type SelectValue = string

type selectType struct{}

func (*selectType) New(v any) (any, error) {
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

func (v *Value) ValueSelect() (r *SelectValue) {
	v.Match(Match{
		Select: func(v SelectValue) {
			r = &v
		},
	})
	return
}
