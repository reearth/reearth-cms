package memorygit

import (
	"github.com/reearth/reearth-cms/server/pkg/util"
)

// util.SyncMap + version = VersionedSyncMap
type VersionedSyncMap[K, V any] struct {
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

func NewVersionedSyncMap[K, V any]() *VersionedSyncMap[K, V] {
	return &VersionedSyncMap[K, V]{}
}

func (m *VersionedSyncMap[K, V]) Load(key K, vr VersionOrRef) (res V, ok bool) {
	_ = m.m.Find(func(k K, v innerValues[V]) bool {
		if found := v.GetByVersionOrRef(vr); found != nil {
			res = found.Value()
			ok = true
			return true
		}
		return false
	})
	return
}

func (m *VersionedSyncMap[K, V]) LoadAll(keys []K, ref VersionOrRef) (v []V) {
	panic("unimpl")
}

func (m *VersionedSyncMap[K, V]) Store(key K, value V, version Version, ref *Ref) {
	panic("unimpl")
}

func (m *VersionedSyncMap[K, V]) UpdateRef(key K, ref Ref, target Version) {
	panic("unimpl")
}

func (m *VersionedSyncMap[K, V]) DeleteRef(key K, ref Ref) {
	panic("unimpl")
}

func (m *VersionedSyncMap[K, V]) Delete(key K) {
	panic("unimpl")
}

func (m *VersionedSyncMap[K, V]) DeleteAll(key ...K) {
	panic("unimpl")
}

func (m *VersionedSyncMap[K, V]) Archive(key K) {
	panic("unimpl")
}

func (m *VersionedSyncMap[K, V]) ArchiveAll(key ...K) {
	panic("unimpl")
}

func (m *VersionedSyncMap[K, V]) Range(f func(key K, value V) bool) {
	panic("unimpl")
}
