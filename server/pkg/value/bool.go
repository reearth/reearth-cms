package value

const TypeBool Type = "bool"

type boolType struct{}

func (*boolType) New(v any) (any, error) {
	switch w := v.(type) {
	case bool:
		return w, nil
	case *bool:
		if w == nil {
			return nil, nil
		}
		return *w, nil
	}
	return nil, ErrInvalidValue
}
