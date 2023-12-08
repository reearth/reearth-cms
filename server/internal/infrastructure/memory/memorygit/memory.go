package memorygit

import (
	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/reearth/reearthx/util"
)

// VersionedSyncMap = util.SyncMap + version
type VersionedSyncMap[K comparable, T, M any] struct {
	m *util.SyncMap[K, *version.Versions[T, M]]
	a *util.SyncMap[K, *version.Versions[T, M]]
}

func NewVersionedSyncMap[K comparable, T, M any]() *VersionedSyncMap[K, T, M] {
	return &VersionedSyncMap[K, T, M]{
		m: util.SyncMapFrom(map[K]*version.Versions[T, M]{}),
		a: util.SyncMapFrom(map[K]*version.Versions[T, M]{}),
	}
}

func (m *VersionedSyncMap[K, T, M]) Load(key K, vr version.IDOrRef) (res *version.Version[T, M], _ bool) {
	v, ok := m.m.Load(key)
	if !ok {
		return
	}
	vv := v.Get(vr)
	if vv == nil {
		return
	}
	return vv, true
}

func (m *VersionedSyncMap[K, T, M]) LoadAll(keys []K, vr *version.IDOrRef) (res []*version.Version[T, M]) {
	m.Range(func(k K, v *version.Versions[T, M]) bool {
		for _, kk := range keys {
			if k != kk {
				continue
			}
			if vr == nil {
				res = append(res, v.All()...)
			} else {
				if found := v.Get(*vr); found != nil {
					res = append(res, found)
				}
			}
		}
		return true
	})
	return
}

func (m *VersionedSyncMap[K, T, M]) LoadAllVersions(key K) (res *version.Versions[T, M]) {
	m.m.Range(func(k K, v *version.Versions[T, M]) bool {
		if k == key {
			res = v.Clone()
			return false
		}
		return true
	})
	return
}

func (m *VersionedSyncMap[K, T, M]) SaveOne(key K, value *T, parent *version.IDOrRef) {
	found := false
	m.m.Range(func(k K, v *version.Versions[T, M]) bool {
		if k != key {
			return true
		}
		found = true
		v.Add(value, parent)
		return false
	})

	if !found {
		v := version.NewValue(version.NewID(), nil, version.NewRefs(version.Latest), util.Now(), value)
		vv := version.NewVersions[T, M](v)
		m.m.Store(key, vv)
	}
}

func (m *VersionedSyncMap[K, T, M]) SaveOneMeta(key K, value M) {
	m.m.Range(func(k K, v *version.Versions[T, M]) bool {
		if k != key {
			return true
		}

		v.SetMeta(&value)
		return false
	})
}

func (m *VersionedSyncMap[K, T, M]) UpdateRef(key K, ref version.Ref, vr *version.IDOrRef) {
	m.Range(func(k K, v *version.Versions[T, M]) bool {
		if k != key {
			return true
		}
		v.UpdateRef(ref, vr)
		return false
	})
}

func (m *VersionedSyncMap[K, T, M]) IsArchived(key K) bool {
	_, found := m.a.Load(key)
	return !found
}

func (m *VersionedSyncMap[K, T, M]) Archive(key K, archived bool) {
	if archived {
		v, ok := m.m.Load(key)
		if ok {
			m.a.Store(key, v)
		}
		m.m.Delete(key)
	} else {
		v, ok := m.a.Load(key)
		if ok {
			m.m.Store(key, v)
		}
		m.a.Delete(key)
	}
}

func (m *VersionedSyncMap[K, T, M]) Delete(key K) {
	m.m.Delete(key)
}

func (m *VersionedSyncMap[K, T, M]) DeleteAll(key ...K) {
	m.m.DeleteAll(key...)
}

func (m *VersionedSyncMap[K, T, M]) LatestVersion(key K) (res *version.ID) {
	m.Range(func(k K, v *version.Versions[T, M]) bool {
		if k == key {
			if lv := v.Latest(); lv != nil {
				res = lv.Version().Ref()
				return false
			}
		}
		return true
	})
	return
}

func (m *VersionedSyncMap[K, T, M]) Range(f func(k K, v *version.Versions[T, M]) bool) {
	m.m.Range(f)
}

func (m *VersionedSyncMap[K, T, M]) Find(f func(k K, v *version.Versions[T, M]) bool) *version.Versions[T, M] {
	return m.m.Find(f)
}

func (m *VersionedSyncMap[K, T, M]) FindAll(f func(k K, v *version.Versions[T, M]) bool) []*version.Versions[T, M] {
	return m.m.FindAll(f)
}

func (m *VersionedSyncMap[K, T, M]) CountAll(f func(k K, v *version.Versions[T, M]) bool) int {
	return m.m.CountAll(f)
}

func (m *VersionedSyncMap[K, T, M]) Len() int {
	return m.m.Len()
}
