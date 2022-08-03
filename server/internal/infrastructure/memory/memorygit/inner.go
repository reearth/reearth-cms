package memorygit

import "github.com/samber/lo"

type innerValue[V any] struct {
	value   V
	version Version
	ref     *Ref
}

func (i innerValue[V]) Value() V {
	return i.value
}

type innerValues[V any] []innerValue[V]

func (i innerValues[V]) GetByVersion(v Version) *innerValue[V] {
	_, index, ok := lo.FindIndexOf(i, func(iv innerValue[V]) bool {
		return iv.version == v
	})
	if !ok {
		return nil
	}
	return &i[index]
}

func (i innerValues[V]) GetByRef(r Ref) *innerValue[V] {
	_, index, ok := lo.FindIndexOf(i, func(iv innerValue[V]) bool {
		return iv.ref != nil && *iv.ref == r
	})
	if !ok {
		return nil
	}
	return &i[index]
}

func (i innerValues[V]) GetByVersionOrRef(vr VersionOrRef) *innerValue[V] {
	_, index, ok := lo.FindIndexOf(i, func(iv innerValue[V]) bool {
		if v := vr.Version(); v != nil {
			return iv.version == *v
		}
		if iv.ref != nil {
			r := vr.Ref()
			return r != nil && *iv.ref == *r
		}
		return false
	})
	if !ok {
		return nil
	}
	return &i[index]
}

func (i innerValues[V]) UpdateRef(r Ref, version *Version) {
	// delete ref
	if v := i.GetByRef(r); v != nil {
		v.ref = nil
	}

	if version == nil {
		return
	}

	// set ref to specified version
	if v2 := i.GetByVersion(*version); v2 != nil {
		v2.ref = &r
	}
}
