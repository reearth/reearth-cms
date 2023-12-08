package version

import (
	"time"
)

type Version[T, M any] struct {
	value Value[T]
	meta  *M
}

func New[T, M any](version ID, parents IDs, refs Refs, t time.Time, value *T, meta *M) *Version[T, M] {
	res := &Version[T, M]{
		value: Value[T]{
			version: version,
			parents: parents,
			refs:    refs,
			time:    t,
			value:   value,
		},
		meta: meta,
	}
	if !res.validate() {
		return nil
	}
	if parents != nil && parents.Len() > 0 {
		res.value.parents = parents.Clone()
	}
	if refs != nil && refs.Len() > 0 {
		res.value.refs = refs.Clone()
	}
	return res
}

func From[T, M, K any](v *Version[T, M], vv *K, mm *M) *Version[K, M] {
	return New(v.Version(), v.Parents(), v.Refs(), v.Time(), vv, mm)
}

func Must[T, M any](version ID, parents IDs, refs Refs, t time.Time, value *T, meta *M) *Version[T, M] {
	v := New(version, parents, refs, t, value, meta)
	if v == nil {
		panic("invalid version or parents")
	}
	return v
}

func (v *Version[T, M]) Version() ID {
	return v.value.version
}

func (v *Version[T, M]) Parents() IDs {
	if v.value.parents == nil {
		return IDs{}
	}
	return v.value.parents.Clone()
}

func (v *Version[T, M]) Refs() Refs {
	if v.value.refs == nil {
		return Refs{}
	}
	return v.value.refs.Clone()
}

func (v *Version[T, M]) Time() time.Time {
	return v.value.time
}

func (v *Version[T, M]) Value() *T {
	return v.value.value
}

func (v *Version[T, M]) Meta() *M {
	return v.meta
}

func (v *Version[T, M]) Ref() *Version[T, M] {
	return v
}

func (v *Version[T, M]) Clone() *Version[T, M] {
	if v == nil {
		return nil
	}
	return New(v.value.version, v.value.parents, v.value.refs, v.value.time, v.value.value, v.meta)
}

func (v *Version[T, M]) AddRefs(refs ...Ref) {
	v.value.AddRefs(refs...)
}

func (v *Version[T, M]) DeleteRefs(refs ...Ref) {
	v.value.DeleteRefs(refs...)
}

func (v *Version[T, M]) validate() bool {
	return !v.value.version.IsZero() && !v.Parents().Has(v.value.version)
}
