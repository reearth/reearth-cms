package version

import "github.com/reearth/reearthx/util"

type Value[T any] struct {
	Version Version
	Prev    *Version
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
	return &Value[T]{
		Version: v.Version,
		Prev:    util.CloneRef(v.Prev),
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
