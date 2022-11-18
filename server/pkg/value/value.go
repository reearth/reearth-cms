package value

type Value struct {
	t Type
	v any
	p TypeRegistry
}

func New(t Type, v any) *Value {
	return NewWithTypeRegistry(t, v, nil)
}

func NewWithTypeRegistry(t Type, v any, p TypeRegistry) *Value {
	return t.ValueFrom(v, p)
}

func (v *Value) IsEmpty() bool {
	return v == nil || v.t == TypeUnknown || v.v == nil
}

func (v *Value) Clone() *Value {
	if v.IsEmpty() {
		return nil
	}
	return v.t.ValueFrom(v.v, v.p)
}

func (v *Value) Some() *Optional {
	return OptionalFrom(v)
}

func (v *Value) Value() interface{} {
	if v.IsEmpty() {
		return nil
	}
	return v.v
}

func (v *Value) Type() Type {
	if v.IsEmpty() {
		return TypeUnknown
	}
	return v.t
}

func (v *Value) TypeProperty() (tp TypeProperty) {
	if v.IsEmpty() {
		return
	}
	if tp := v.p.Find(v.t); tp != nil {
		return tp
	}
	return
}

// Interface converts the value into generic representation
func (v *Value) Interface() any {
	if v.IsEmpty() {
		return nil
	}

	if i, ok := v.p.ToInterface(v.t, v.v); ok {
		return i
	}
	return nil
}

func (v *Value) Validate() bool {
	if v.IsEmpty() {
		return false
	}

	valid, _ := v.p.Validate(v.t, v.v)
	return valid
}

func (v *Value) Cast(t Type, p TypeRegistry) *Value {
	if v.IsEmpty() {
		return nil
	}
	if v.t == t {
		return v.Clone()
	}
	return t.ValueFrom(v.v, p)
}
