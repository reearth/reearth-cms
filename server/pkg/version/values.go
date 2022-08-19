package version

import (
	"github.com/chrispappas/golang-generics-set/set"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
)

type Values[T any] struct {
	inner    []*Value[T]
	archived bool
}

func NewValues[V any](values ...*Value[V]) *Values[V] {
	v := &Values[V]{inner: values}
	if !v.validate() {
		return nil
	}
	v.inner = cloneValues(v.inner)
	return v
}

func MustBeValues[V any](values ...*Value[V]) *Values[V] {
	v := NewValues(values...)
	if v == nil {
		panic("invalid values")
	}
	return v
}

func (v *Values[V]) IsArchived() bool {
	return v.archived
}

func (v *Values[V]) SetArchived(archived bool) *Values[V] {
	v.archived = archived
	return v
}

func (v *Values[V]) Get(vr VersionOrRef) *Value[V] {
	return v.get(vr).Clone()
}

func (v *Values[V]) get(vr VersionOrRef) *Value[V] {
	if v == nil {
		return nil
	}
	w, ok := lo.Find(v.inner, func(w *Value[V]) bool {
		return MatchVersionOrRef(vr, func(v Version) bool {
			return w.Version == v
		}, func(r Ref) bool {
			return w.Refs.Has(r)
		})
	})
	if !ok {
		return nil
	}
	return w
}

func (v *Values[V]) Latest() *Value[V] {
	return v.get(Latest.OrVersion())
}

func (v *Values[V]) LatestVersion() *Version {
	latest := v.Latest()
	if latest == nil {
		return nil
	}
	return latest.Version.Ref()
}

func (v *Values[V]) All() []*Value[V] {
	if v == nil {
		return nil
	}
	return cloneValues(v.inner)
}

func (v *Values[V]) Clone() *Values[V] {
	if v == nil {
		return nil
	}
	return &Values[V]{
		inner:    v.All(),
		archived: v.archived,
	}
}

func (v *Values[V]) Add(value V, ref *Ref) {
	if v == nil || v.IsArchived() || ref != nil && ref.IsSpecial() && *ref != Latest {
		return
	}

	r := lo.FromPtrOr(ref, Latest)
	vv := v.get(r.OrVersion())
	if vv != nil {
		vv.DeleteRefs(r)
		vv = &Value[V]{
			Version: New(),
			Prev:    vv.Version.Ref(),
			Refs:    RefsFrom(r),
			Value:   value,
		}
	} else {
		vv = &Value[V]{
			Version: New(),
			Refs:    RefsFrom(Latest),
			Value:   value,
		}
	}
	v.inner = append(v.inner, vv)
}

func (v *Values[V]) UpdateRef(r Ref, vr *VersionOrRef) {
	if v == nil || v.IsArchived() || r.IsSpecial() {
		return
	}

	// delete ref
	if v := v.get(r.OrVersion()); v != nil && v.Refs != nil {
		v.DeleteRefs(r)
	}
	if vr == nil {
		return
	}

	// set ref to specified version
	if v2 := v.get(*vr); v2 != nil {
		v2.AddRefs(r)
	}
}

func cloneValues[V any](values []*Value[V]) []*Value[V] {
	return util.Map(values, func(v *Value[V]) *Value[V] { return v.Clone() })
}

func (v Values[V]) validate() bool {
	versions := set.Set[Version]{}
	refs := set.Set[Ref]{}
	for _, v := range v.inner {
		if (v.Prev != nil && v.Version == *v.Prev) ||
			versions.Has(v.Version) ||
			refs.Intersection(v.Refs).Len() > 0 {
			return false
		}
		versions.Add(v.Version)
		refs = refs.Union(v.Refs)
	}
	for _, v := range v.inner {
		if v.Prev != nil && !versions.Has(*v.Prev) {
			return false
		}
	}
	return true
}
