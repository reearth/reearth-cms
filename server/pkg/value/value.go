package value

type Value struct {
	t Type
	v any
}

func New(t Type, v any) *Value {
	return t.Value(v)
}

func (v *Value) IsEmpty() bool {
	if v == nil || v.t == TypeUnknown || v.v == nil {
		return true
	}
	tp := v.TypeProperty()
	return tp == nil || tp.IsEmpty(v.v)
}

func (v *Value) Clone() *Value {
	if v == nil || v.v == nil || v.TypeProperty() == nil {
		return nil
	}
	return v.t.Value(v.v)
}

func (v *Value) Some() *Optional {
	return OptionalFrom(v)
}

func (v *Value) AsMultiple() *Multiple {
	if v == nil {
		return nil
	}
	return MultipleFrom(v.t, []*Value{v})
}

func (v *Value) Value() any {
	if v == nil {
		return nil
	}
	return v.v
}

func (v *Value) Type() Type {
	if v == nil {
		return TypeUnknown
	}
	return v.t
}

func (v *Value) TypeProperty() TypeProperty {
	if v == nil {
		return nil
	}
	return defaultTypes.Get(v.t)
}

// Interface converts the value into generic representation
func (v *Value) Interface() any {
	if v.IsEmpty() {
		return nil
	}

	i, _ := defaultTypes.ToInterface(v.t, v.v)
	return i
}

func (v *Value) Validate() bool {
	if v.IsEmpty() {
		return false
	}

	valid, _ := defaultTypes.Validate(v.t, v.v)
	return valid
}

func (v *Value) Equal(w *Value) bool {
	if v == nil || w == nil || v.t != w.t {
		return false
	}
	tp := defaultTypes.Get(v.t)
	if tp == nil {
		return false
	}
	return tp.Equal(v.v, w.v)
}

func (v *Value) Cast(t Type) *Value {
	if v == nil {
		return nil
	}
	if v.t == t {
		return v.Clone()
	}
	return t.Value(v.v)
}
