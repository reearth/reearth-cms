package memorygit

import "github.com/reearth/reearth-cms/server/pkg/util"

// util.SyncMap + version = VersionedSyncMap
type VersionedSyncMap[K, V any] struct {
	m util.SyncMap[K, V]
}

type Version string

type Ref string

func NewVersionedSyncMap[K, V any]() *VersionedSyncMap[K, V] {
	return &VersionedSyncMap[K, V]{}
}

func (m *VersionedSyncMap[K, V]) Load(key K, version Version) (v []V, _ bool) {
	// return m.m.Load(key)
	panic("unimpl")
}

func (m *VersionedSyncMap[K, V]) LoadAll(keys []K, ref Ref) (v []V) {
	return m.m.LoadAll(keys...)
}

func (m *VersionedSyncMap[K, V]) Store(key K, value V, version Version) {
	m.m.Store(key, value)
}

func (m *VersionedSyncMap[K, V]) LoadOrStore(key K, value V) (vv V, _ bool) {
	return m.LoadOrStore(key, value)
}

func (m *VersionedSyncMap[K, V]) Delete(key K) {
	m.Delete(key)
}

func (m *VersionedSyncMap[K, V]) DeleteAll(key ...K) {
	m.DeleteAll()
}

func (m *VersionedSyncMap[K, V]) Archive(key K) {
	m.Delete(key)
}

func (m *VersionedSyncMap[K, V]) ArchiveAll(key ...K) {
	m.DeleteAll()
}

func (m *VersionedSyncMap[K, V]) Range(f func(key K, value V) bool) {
	m.Range(f)
}

// func (m *VersionedSyncMap[K, V]) Find(f func(key K, value V) bool) (v V) {
// 	return m.Find(f)
// }

// func (m *VersionedSyncMap[K, V]) FindAll(f func(key K, value V) bool) (v []V) {
// 	return m.FindAll(f)
// }

// func (m *VersionedSyncMap[K, V]) Clone() *VersionedSyncMap[K, V] {
// 	if m == nil {
// 		return nil
// 	}
// 	return &VersionedSyncMap[K, V]{
// 		m: *m.m.Clone(),
// 	}
// }

// func (m *VersionedSyncMap[K, V]) Map(f func(K, V) V) *VersionedSyncMap[K, V] {
// 	// n := m.Clone()
// 	// n.Range(func(key K, value V) bool {
// 	// 	n.Store(key, f(key, value))
// 	// 	return true
// 	// })
// 	// return n
// 	panic("unimpl")
// }

// func (m *VersionedSyncMap[K, V]) Merge(n *VersionedSyncMap[K, V]) {
// 	// n.Range(func(key K, value V) bool {
// 	// 	m.Store(key, value)
// 	// 	return true
// 	// })
// 	panic("unimpl")
// }

// func (m *VersionedSyncMap[K, V]) Keys() (l []K) {
// 	// m.Range(func(key K, _ V) bool {
// 	// 	l = append(l, key)
// 	// 	return true
// 	// })
// 	// return l
// 	panic("unimpl")
// }

// func (m *VersionedSyncMap[K, V]) Values() (l []V) {
// 	// m.Range(func(_ K, value V) bool {
// 	// 	l = append(l, value)
// 	// 	return true
// 	// })
// 	// return l
// 	panic("unimpl")
// }

// func (m *VersionedSyncMap[K, V]) Len() (i int) {
// 	// m.m.Range(func(_ any, _ any) bool {
// 	// 	i++
// 	// 	return true
// 	// })
// 	// return
// 	panic("unimpl")
// }
