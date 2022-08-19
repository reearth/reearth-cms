package memorygit

import (
	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/samber/lo"
)

type innerValue[V any] struct {
	value   V
	version version.Version
	ref     *version.Ref
}

func (i innerValue[V]) Value() V {
	return i.value
}

type innerValues[V any] []innerValue[V]

func (i innerValues[V]) GetByVersion(v version.Version) *innerValue[V] {
	_, index, ok := lo.FindIndexOf(i, func(iv innerValue[V]) bool {
		return iv.version == v
	})
	if !ok {
		return nil
	}
	return &i[index]
}

func (i innerValues[V]) GetByRef(r version.Ref) *innerValue[V] {
	_, index, ok := lo.FindIndexOf(i, func(iv innerValue[V]) bool {
		return iv.ref != nil && *iv.ref == r
	})
	if !ok {
		return nil
	}
	return &i[index]
}

func (i innerValues[V]) GetByVersionOrRef(vr version.VersionOrRef) *innerValue[V] {
	_, index, ok := lo.FindIndexOf(i, func(iv innerValue[V]) bool {
		return version.MatchVersionOrRef(vr, func(v version.Version) bool {
			return iv.version == v
		}, func(r version.Ref) bool {
			return iv.ref != nil && *iv.ref == r
		})
	})
	if !ok {
		return nil
	}
	return &i[index]
}

func (i innerValues[V]) UpdateRef(r version.Ref, version *version.Version) {
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
