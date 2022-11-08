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
