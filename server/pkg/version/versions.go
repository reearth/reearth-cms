package version

import (
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
)

type Versions[T, M any] struct {
	values []Value[T]
	meta   *M
}

func NewVersions[T, M any](values ...Value[T]) *Versions[T, M] {
	return &Versions[T, M]{values: values}
}

func (vs *Versions[T, M]) Get(q IDOrRef) *Version[T, M] {
	for _, v := range vs.values {
		if q.version == v.version || v.refs.Has(q.ref) {
			return &Version[T, M]{value: v, meta: vs.meta}
		}
	}
	return nil
}

func (vs *Versions[T, M]) getValue(q IDOrRef) *Value[T] {
	for i, v := range vs.values {
		if q.version == v.version || v.refs.Has(q.ref) {
			return &vs.values[i]
		}
	}
	return nil
}

func (vs *Versions[T, M]) Values() []Value[T] {
	return vs.values
}

func (vs *Versions[T, M]) Latest() *Version[T, M] {
	return vs.Get(Latest.OrVersion())
}

func (vs *Versions[T, M]) Public() *Version[T, M] {
	return vs.Get(Public.OrVersion())
}

func (vs *Versions[T, M]) Len() int {
	return len(vs.values)
}

func (vs *Versions[T, M]) Meta() *M {
	return vs.meta
}

func (vs *Versions[T, M]) SetMeta(meta *M) {
	vs.meta = meta
}

func (vs *Versions[T, M]) All() []*Version[T, M] {
	if vs == nil || vs.values == nil {
		return nil
	}
	return lo.Map(vs.values, func(v Value[T], _ int) *Version[T, M] {
		return &Version[T, M]{value: v, meta: vs.meta}
	})
}

func (vs *Versions[T, M]) Clone() *Versions[T, M] {
	return &Versions[T, M]{
		values: lo.Map(vs.values, func(v Value[T], _ int) Value[T] {
			return v.Clone()
		}),
		meta: vs.meta,
	}
}

func (vs *Versions[T, M]) UpdateRef(ref Ref, vr *IDOrRef) {
	if ref.IsSpecial() {
		return
	}

	// delete ref
	if v := vs.getValue(ref.OrVersion()); v != nil {
		v.DeleteRefs(ref)
	}
	if vr == nil {
		return
	}

	// set ref to specified version
	if v := vs.getValue(*vr); v != nil {
		v.AddRefs(ref)
	}
}

func (vs *Versions[T, M]) Add(value *T, parent *IDOrRef) {
	if parent != nil && parent.IsSpecialRef() && !parent.IsRef(Latest) {
		return
	}

	t := util.Now()
	p := lo.FromPtrOr(parent, Latest.OrVersion())
	pv := vs.getValue(p)
	var vv *Value[T]
	if pv != nil {
		var refs Refs
		p.Match(nil, func(r Ref) {
			pv.DeleteRefs(r)
			refs = NewRefs(r)
		})
		vv = &Value[T]{NewID(), NewIDs(pv.version), refs, t, value}
	} else if vs.IsEmpty() {
		vv = &Value[T]{NewID(), nil, NewRefs(Latest), t, value}
	}
	if vv != nil {
		vs.values = append(vs.values, *vv)
	}
}

func (vs *Versions[T, M]) IsEmpty() bool {
	return len(vs.values) == 0
}
