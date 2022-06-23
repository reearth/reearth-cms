package mongogit

type Version string

const VersionZero Version = ""

func (v Version) OrRef() VersionOrRef {
	return VersionOrRef{version: v}
}

type Ref string

func (r Ref) OrVersion() VersionOrRef {
	return VersionOrRef{ref: r}
}

type Refs map[Ref]Version

func (refs Refs) Get(r Ref) Version {
	if refs != nil {
		if v, ok := refs[r]; ok {
			return v
		}
	}
	return VersionZero
}

type VersionOrRef struct {
	version Version
	ref     Ref
}

func (vr VersionOrRef) IsZero() bool {
	return vr == VersionOrRef{}
}

func (vr VersionOrRef) Match(v func(v Version), r func(r Ref)) {
	_ = MatchVersionOrRef(vr, func(version Version) any {
		if v != nil {
			v(version)
		}
		return nil
	}, func(ref Ref) any {
		if r != nil {
			r(ref)
		}
		return nil
	})
}

func MatchVersionOrRef[T any](vr VersionOrRef, v func(v Version) T, r func(r Ref) T) (_ T) {
	if vr.version != VersionZero {
		if v != nil {
			return v(vr.version)
		}
	} else if vr.ref != "" {
		if r != nil {
			return r(vr.ref)
		}
	}
	return
}

type VersionRefQuery struct {
	eq VersionOrRef
	gt VersionOrRef
	lt VersionOrRef
}

func Query() (_ VersionRefQuery) {
	return
}

func (VersionRefQuery) Equal(v VersionOrRef) VersionRefQuery {
	return VersionRefQuery{eq: v}
}

func (VersionRefQuery) NewerThan(v VersionOrRef) VersionRefQuery {
	return VersionRefQuery{gt: v}
}

func (VersionRefQuery) OlderThan(v VersionOrRef) VersionRefQuery {
	return VersionRefQuery{lt: v}
}

func (VersionRefQuery) Range(oldest, newest VersionOrRef) VersionRefQuery {
	return VersionRefQuery{lt: newest, gt: oldest}
}

func (q VersionRefQuery) Refs() (refs []Ref) {
	q.eq.Match(nil, func(r Ref) {
		refs = append(refs, r)
	})
	q.gt.Match(nil, func(r Ref) {
		refs = append(refs, r)
	})
	q.lt.Match(nil, func(r Ref) {
		refs = append(refs, r)
	})
	return refs
}

func (q VersionRefQuery) Solve(refs Refs) (vq VersionQuery) {
	vq.eq = refs.Get(q.eq.ref)
	vq.gt = refs.Get(q.gt.ref)
	vq.lt = refs.Get(q.lt.ref)
	return
}

type VersionQuery struct {
	eq Version
	gt Version
	lt Version
}

type VersionQueryMatch[T any] struct {
	Eq      func(Version) T
	Lt      func(Version) T
	Gt      func(Version) T
	Range   func(Version, Version) T
	Default func() T
}

func MatchVersionQuery[T any](vq VersionQuery, m VersionQueryMatch[T]) (_ T) {
	if vq.eq != VersionZero {
		if m.Eq == nil {
			return
		}
		return m.Eq(vq.eq)
	}
	if vq.gt != VersionZero && vq.lt != VersionZero {
		if m.Range == nil {
			return
		}
		return m.Range(vq.gt, vq.lt)
	}
	if vq.gt != VersionZero {
		if m.Gt == nil {
			return
		}
		return m.Gt(vq.gt)
	}
	if vq.lt != VersionZero {
		if m.Lt == nil {
			return
		}
		return m.Lt(vq.lt)
	}
	if m.Default != nil {
		return m.Default()
	}
	return
}
