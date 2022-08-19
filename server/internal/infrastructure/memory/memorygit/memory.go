package memorygit

import (
	"github.com/reearth/reearthx/util"
)

// util.SyncMap + version = VersionedSyncMap
type VersionedSyncMap[K comparable, V any] struct {
	m *util.SyncMap[K, innerValues[V]]
}

type Version string

func (v Version) OrRef() VersionOrRef {
	return VersionOrRef{
		version: v,
	}
}

type Ref string

func (r Ref) OrVersion() VersionOrRef {
	return VersionOrRef{
		ref: r,
	}
}

type VersionOrRef struct {
	version Version
	ref     Ref
}

func (v VersionOrRef) Version() *Version {
	if v.version == "" {
		return nil
	}
	v2 := v.version
	return &v2
}

func (v VersionOrRef) Ref() *Ref {
	if v.ref == "" {
		return nil
	}
	v2 := v.ref
	return &v2
}

func NewVersionedSyncMap[K comparable, V any]() *VersionedSyncMap[K, V] {
	return &VersionedSyncMap[K, V]{}
}

func (m *VersionedSyncMap[K, V]) Load(key K, vr VersionOrRef) (res V, ok bool) {
	if v := m.load(key, vr); v != nil {
		return v.Value(), true
	}
	return
}

func (m *VersionedSyncMap[K, V]) LoadAll(keys []K, vr VersionOrRef) (res []V) {
	m.m.Range(func(k K, v innerValues[V]) bool {
		for _, kk := range keys {
			if found := v.GetByVersionOrRef(vr); found != nil && k == kk {
				res = append(res, found.Value())
			}
		}
		return true
	})
	return
}

func (m *VersionedSyncMap[K, V]) Store(key K, value V, version Version) {
	found := false

	m.m.Range(func(k K, v innerValues[V]) bool {
		if k != key {
			return true
		}
		if vv := v.GetByVersion(version); vv != nil {
			vv.value = value
			found = true
		}
		return false
	})

	if !found {
		iv := innerValues[V]{
			innerValue[V]{
				value:   value,
				version: version,
				ref:     nil,
			},
		}
		m.m.Store(key, iv)
	}
}

func (m *VersionedSyncMap[K, V]) UpdateRef(key K, ref Ref, target Version) {
	m.m.Range(func(k K, v innerValues[V]) bool {
		if k == key {
			v.UpdateRef(ref, &target)
			return false
		}
		return true
	})
}

func (m *VersionedSyncMap[K, V]) DeleteRef(key K, ref Ref) {
	m.m.Range(func(k K, v innerValues[V]) bool {
		if k == key {
			v.UpdateRef(ref, nil)
			return false
		}
		return true
	})
}

func (m *VersionedSyncMap[K, V]) Delete(key K) {
	m.m.Delete(key)
}

func (m *VersionedSyncMap[K, V]) DeleteAll(key ...K) {
	m.m.DeleteAll(key...)
}

func (m *VersionedSyncMap[K, V]) Archive(key K) {
	m.Delete(key)
}

func (m *VersionedSyncMap[K, V]) ArchiveAll(key ...K) {
	m.DeleteAll(key...)
}

func (m *VersionedSyncMap[K, V]) load(key K, vr VersionOrRef) (res *innerValue[V]) {
	m.m.Range(func(k K, v innerValues[V]) bool {
		if k == key {
			if found := v.GetByVersionOrRef(vr); found != nil {
				res = found
				return false
			}
		}
		return true
	})
	return
}
