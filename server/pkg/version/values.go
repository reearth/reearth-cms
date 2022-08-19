package version

import (
	"github.com/chrispappas/golang-generics-set/set"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
)

type Values[T any] struct {
	inner []*Value[T]
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

func (i *Values[V]) Get(vr VersionOrRef) *Value[V] {
	return i.get(vr).Clone()
}

func (i *Values[V]) get(vr VersionOrRef) *Value[V] {
	if i == nil {
		return nil
	}
	v, ok := lo.Find(i.inner, func(iv *Value[V]) bool {
		return MatchVersionOrRef(vr, func(v Version) bool {
			return iv.Version == v
		}, func(r Ref) bool {
			return iv.Refs.Has(r)
		})
	})
	if !ok {
		return nil
	}
	return v
}

func (i *Values[V]) Latest() *Value[V] {
	return i.get(Latest.OrVersion())
}

func (i *Values[V]) LatestVersion() *Version {
	v := i.Latest()
	if v == nil {
		return nil
	}
	return v.Version.Ref()
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
	return &Values[V]{inner: v.All()}
}

func (v *Values[V]) Add(value V, ref *Ref) {
	if v == nil {
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

func (v *Values[V]) UpdateRef(r Ref, version *Version) {
	if v == nil {
		return
	}

	// delete ref
	if v := v.get(r.OrVersion()); v != nil && v.Refs != nil && (version == nil || v.Version != *version) {
		v.DeleteRefs(r)
	}

	if version == nil {
		return
	}

	// set ref to specified version
	if v2 := v.get(version.OrRef()); v2 != nil {
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
