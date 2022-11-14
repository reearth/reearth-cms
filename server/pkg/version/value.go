package version

type Value[T any] struct {
	version Version
	parents Versions
	refs    Refs
	value   T
}

func NewValue[T any](version Version, parents Versions, refs Refs, value T) *Value[T] {
	res := &Value[T]{
		version: version,
		parents: parents,
		refs:    refs,
		value:   value,
	}
	if !res.validate() {
		return nil
	}
	if parents != nil && parents.Len() > 0 {
		res.parents = parents.Clone()
	}
	if refs != nil && refs.Len() > 0 {
		res.refs = refs.Clone()
	}
	return res
}

func MustBeValue[T any](version Version, parents Versions, refs Refs, value T) *Value[T] {
	v := NewValue(version, parents, refs, value)
	if v == nil {
		panic("invalid version or parents")
	}
	return v
}

func (v Value[T]) Version() Version {
	return v.version
}

func (v Value[T]) Parents() Versions {
	if v.parents == nil {
		return Versions{}
	}
	return v.parents.Clone()
}

func (v Value[T]) Refs() Refs {
	if v.refs == nil {
		return Refs{}
	}
	return v.refs.Clone()
}

func (v Value[T]) Value() T {
	return v.value
}

func (v Value[T]) Ref() *Value[T] {
	return &v
}

func (v *Value[T]) Clone() *Value[T] {
	if v == nil {
		return nil
	}
	return NewValue(v.version, v.parents, v.refs, v.value)
}

func (v *Value[T]) AddRefs(refs ...Ref) {
	if v.refs == nil {
		v.refs = Refs{}
	}
	v.refs.Add(refs...)
}

func (v *Value[T]) DeleteRefs(refs ...Ref) {
	if v.refs == nil {
		return
	}
	v.refs.Delete(refs...)
	if v.refs.Len() == 0 {
		v.refs = nil
	}
}

func (v *Value[T]) validate() bool {
	return !v.version.IsZero() && !v.Parents().Has(v.version)
}

func ValueFrom[T, K any](v *Value[T], vv K) *Value[K] {
	return NewValue(v.Version(), v.Parents(), v.Refs(), vv)
}
