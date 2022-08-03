package memorygit

import (
	"github.com/reearth/reearth-cms/server/pkg/util"
)

// util.SyncMap + version = VersionedSyncMap
type VersionedSyncMap[K comparable, V any] struct {
	m *util.SyncMap[K, innerValues[V]]
}

type Version string

type Ref string

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
	m.m.Range(func(k K, v innerValues[V]) bool {
		if found := v.GetByVersionOrRef(vr); found != nil && k == key {
			res = found.Value()
			ok = true
			return true
		}
		return false
	})
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

func (m *VersionedSyncMap[K, V]) Store(key K, value V, version Version, ref *Ref) {
	iv := innerValue[V]{
		value:   value,
		version: version,
		ref:     ref,
	}
	if _, ok := m.Load(key, VersionOrRef{version: version, ref: *ref}); ok {
		//	??
	} else {
		v := innerValues[V]{iv}
		m.m.Store(key, v)
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
