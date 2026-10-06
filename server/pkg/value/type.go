package value

type Type string

var TypeUnknown = Type("")

func (t Type) Default() bool {
	return defaultTypes.Get(t) != nil
}

func (t Type) None() *Optional {
	if t == TypeUnknown {
		return nil
	}
	return &Optional{t: t}
}

func (t Type) Value(i any) *Value {
	if v, ok := defaultTypes.ToValue(t, i); ok {
		return &Value{v: v, t: t}
	}
	return nil
}
