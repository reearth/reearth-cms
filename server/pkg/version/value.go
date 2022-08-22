package version

type Value[T any] struct {
	Version Version
	Parent  Versions
	Refs    Refs
	Value   T
}

func (v Value[T]) Ref() *Value[T] {
	return &v
}

func (v *Value[T]) Clone() *Value[T] {
	if v == nil {
		return nil
	}
	var refs Refs
	if v.Refs != nil {
		refs = v.Refs.Clone()
	}
	var parent Versions
	if v.Parent != nil {
		parent = v.Parent
	}
	return &Value[T]{
		Version: v.Version,
		Parent:  parent,
		Refs:    refs,
		Value:   v.Value,
	}
}

func (v *Value[T]) AddRefs(refs ...Ref) {
	if v.Refs == nil {
		v.Refs = Refs{}
	}
	v.Refs.Add(refs...)
}

func (v *Value[T]) DeleteRefs(refs ...Ref) {
	v.Refs.Delete(refs...)
	if v.Refs.Len() == 0 {
		v.Refs = nil
	}
}
