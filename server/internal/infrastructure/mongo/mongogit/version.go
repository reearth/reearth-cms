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

type VersionQuery struct {
	eq VersionOrRef
	gt VersionOrRef
	lt VersionOrRef
}

func Query() (_ VersionQuery) {
	return
}

func (VersionQuery) Equal(v VersionOrRef) VersionQuery {
	return VersionQuery{eq: v}
}

func (VersionQuery) NewerThan(v VersionOrRef) VersionQuery {
	return VersionQuery{gt: v}
}

func (VersionQuery) OlderThan(v VersionOrRef) VersionQuery {
	return VersionQuery{lt: v}
}

func (VersionQuery) Range(oldest, newest VersionOrRef) VersionQuery {
	return VersionQuery{lt: newest, gt: oldest}
}

func (q VersionQuery) Refs() (refs []Ref) {
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

type VersionQueryMatch[T any] struct {
	Eq      func(VersionOrRef) T
	Lt      func(VersionOrRef) T
	Gt      func(VersionOrRef) T
	Range   func(VersionOrRef, VersionOrRef) T
	Default func() T
}

func MatchVersionQuery[T any](q VersionQuery, m VersionQueryMatch[T]) (_ T) {
	if !q.eq.IsZero() {
		if m.Eq == nil {
			return
		}
		return m.Eq(q.eq)
	}
	if !q.gt.IsZero() && !q.lt.IsZero() {
		if m.Range == nil {
			return
		}
		return m.Range(q.gt, q.lt)
	}
	if !q.gt.IsZero() {
		if m.Gt == nil {
			return
		}
		return m.Gt(q.gt)
	}
	if !q.lt.IsZero() {
		if m.Lt == nil {
			return
		}
		return m.Lt(q.lt)
	}
	if m.Default != nil {
		return m.Default()
	}
	return
}
