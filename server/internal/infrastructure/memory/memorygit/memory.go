package memorygit

import (
	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/reearth/reearthx/util"
)

// util.SyncMap + version = VersionedSyncMap
type VersionedSyncMap[K comparable, V any] struct {
	m *util.SyncMap[K, *version.Values[V]]
}

func NewVersionedSyncMap[K comparable, V any]() *VersionedSyncMap[K, V] {
	return &VersionedSyncMap[K, V]{}
}

func (m *VersionedSyncMap[K, V]) Load(key K, vr version.VersionOrRef) (res V, _ bool) {
	v, ok := m.m.Load(key)
	if !ok {
		return
	}
	vv := v.Get(vr)
	if vv == nil {
		return
	}
	return vv.Value(), true
}

func (m *VersionedSyncMap[K, V]) LoadAll(keys []K, vr version.VersionOrRef) (res []V) {
	m.Range(func(k K, v *version.Values[V]) bool {
		for _, kk := range keys {
			if k == kk {
				if found := v.Get(vr); found != nil {
					res = append(res, found.Value())
				}
			}
		}
		return true
	})
	return
}

func (m *VersionedSyncMap[K, V]) SaveOne(key K, value V, parent *version.VersionOrRef) {
	found := false
	m.Range(func(k K, v *version.Values[V]) bool {
		if k != key {
			return true
		}
		found = true
		v.Add(value, parent)
		return false
	})

	if !found {
		values := version.NewValues[V]()
		values.Add(value, parent)
		m.m.Store(key, values)
	}
}

func (m *VersionedSyncMap[K, V]) UpdateRef(key K, ref version.Ref, vr *version.VersionOrRef) {
	m.Range(func(k K, v *version.Values[V]) bool {
		if k == key {
			v.UpdateRef(ref, vr)
			return false
		}
		return true
	})
}

func (m *VersionedSyncMap[K, V]) IsArchived(key K) bool {
	v, _ := m.m.Load(key)
	return v.IsArchived()
}

func (m *VersionedSyncMap[K, V]) Archive(key K, archived bool) {
	v, _ := m.m.Load(key)
	_ = v.SetArchived(archived)
}

func (m *VersionedSyncMap[K, V]) Delete(key K) {
	m.m.Delete(key)
}

func (m *VersionedSyncMap[K, V]) DeleteAll(key ...K) {
	m.m.DeleteAll(key...)
}

func (m *VersionedSyncMap[K, V]) LatestVersion(key K) (res *version.Version) {
	m.Range(func(k K, v *version.Values[V]) bool {
		if k == key {
			if lv := v.LatestVersion(); lv != nil {
				res = lv
				return false
			}
		}
		return true
	})
	return
}

func (m *VersionedSyncMap[K, V]) Range(f func(k K, v *version.Values[V]) bool) {
	m.m.Range(f)
}

func (m *VersionedSyncMap[K, V]) Find(f func(k K, v *version.Values[V]) bool) *version.Values[V] {
	return m.m.Find(f)
}

func (m *VersionedSyncMap[K, V]) FindAll(f func(k K, v *version.Values[V]) bool) []*version.Values[V] {
	return m.m.FindAll(f)
}

func (m *VersionedSyncMap[K, V]) CountAll(f func(k K, v *version.Values[V]) bool) int {
	return m.m.CountAll(f)
}
