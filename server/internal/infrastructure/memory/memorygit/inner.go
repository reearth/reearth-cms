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
	res, ok := lo.Find(i, func(iv innerValue[V]) bool {
		if iv.version == v {
			return true
		}
		return false
	})
	if !ok {
		return nil
	}
	return &res
}

func (i innerValues[V]) GetByRef(r Ref) *innerValue[V] {
	res, ok := lo.Find(i, func(iv innerValue[V]) bool {
		if *iv.ref == r {
			return true
		}
		return false
	})
	if !ok {
		return nil
	}
	return &res
}

func (i innerValues[V]) GetByVersionOrRef(vr VersionOrRef) *innerValue[V] {
	res, ok := lo.Find(i, func(iv innerValue[V]) bool {
		if v := vr.Version(); v != nil {
			if iv.version == *v {
				return true
			}
		}
		if iv.ref != nil {
			if r := vr.Ref(); r != nil {
				if *iv.ref == *r {
					return true
				}
			}
		}
		return false
	})
	if !ok {
		return nil
	}
	return &res
}

func (i innerValues[V]) UpdateRef(r Ref, version *Version) *innerValue[V] {
	if version == nil {
		return nil
	}

	for _, v := range i {
		if v.version == *version {
			v.ref = &r
			return &v
		}
	}
	return nil
}
