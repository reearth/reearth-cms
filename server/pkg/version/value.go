package version

import "time"

type Value[T any] struct {
	version ID
	parents IDs
	refs    Refs
	time    time.Time
	value   *T
}

func NewValue[T any](version ID, parents IDs, refs Refs, t time.Time, value *T) Value[T] {
	return Value[T]{
		version: version,
		parents: parents,
		refs:    refs,
		time:    t,
		value:   value,
	}
}

func (v *Value[T]) Clone() Value[T] {
	return Value[T]{
		version: v.version,
		parents: v.parents,
		refs:    v.refs,
		time:    v.time,
		value:   v.value,
	}
}

func (v *Value[T]) AddRefs(refs ...Ref) {
	if v == nil {
		return
	}
	if v.refs == nil {
		v.refs = Refs{}
	}
	v.refs.Add(refs...)
}

func (v *Value[T]) DeleteRefs(refs ...Ref) {
	if v == nil || v.refs == nil {
		return
	}
	v.refs.Delete(refs...)
	if v.refs.Len() == 0 {
		v.refs = nil
	}
}
