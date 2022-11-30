package value

type Multiple struct {
	t  Type
	tr TypeRegistry
	v  []*Value
}

func NewMultiple(t Type, v []*Value) *Multiple {
	return NewMultipleWithTypeRegistry(t, v, nil)
}

func NewMultipleWithTypeRegistry(t Type, v []*Value, tr TypeRegistry) *Multiple {
	vs := Multiple{
		t:  t,
		tr: tr,
		v:  []*Value{},
	}
	for _, value := range v {
		v = append(v, t.ValueFrom(value, tr))
	}
	return &vs
}

func (m *Multiple) IsEmpty() bool {
	if m == nil || m.t == TypeUnknown || m.v == nil || len(m.v) == 0 {
		return true
	}
	tp := m.TypeProperty()
	return tp == nil || tp.IsEmpty(m.v)
}

func (m *Multiple) Clone() *Value {
	if m == nil {
		return nil
	}
	return m.t.ValueFrom(m.v, m.tr)
}

// func (m *Multiple) Some() *Optional {
// 	return OptionalFrom(m)
// }

func (m *Multiple) Value() interface{} {
	if m == nil {
		return nil
	}
	return m.v
}

func (m *Multiple) Type() Type {
	if m == nil {
		return TypeUnknown
	}
	return m.t
}

func (m *Multiple) TypeProperty() (tp TypeProperty) {
	if m == nil {
		return
	}
	if tp := m.tr.Find(m.t); tp != nil {
		return tp
	}
	return
}

// Interface converts the value into generic representation
func (m *Multiple) Interface() any {
	if m.IsEmpty() {
		return nil
	}

	if i, ok := m.tr.ToInterface(m.t, m.v); ok {
		return i
	}
	return nil
}

func (m *Multiple) Validate() bool {
	if m.IsEmpty() {
		return false
	}

	for _, v := range m.v {
		if valid, _ := m.tr.Validate(m.t, v); !valid {
			return false
		}
	}
	return true
}

func (m *Multiple) Equal(w *Multiple) bool {
	if m == nil || w == nil || m.t != w.t {
		return false
	}
	return m.tr.Find(m.t).Equal(m.v, w.v)
}

func (m *Multiple) Cast(t Type) *Value {
	if m == nil {
		return nil
	}
	if m.t == t {
		return m.Clone()
	}
	return t.ValueFrom(m.v, m.tr)
}
