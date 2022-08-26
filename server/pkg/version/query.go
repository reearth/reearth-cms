package version

type Query struct {
	eq VersionOrRef
	gt VersionOrRef
	lt VersionOrRef
}

func (Query) Equal(v VersionOrRef) Query {
	return Query{eq: v}
}

func (Query) NewerThan(v VersionOrRef) Query {
	return Query{gt: v}
}

func (Query) OlderThan(v VersionOrRef) Query {
	return Query{lt: v}
}

func (Query) Range(oldest, newest VersionOrRef) Query {
	return Query{lt: newest, gt: oldest}
}

func (q Query) Refs() (refs []Ref) {
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

type QueryMatch[T any] struct {
	Eq      func(VersionOrRef) T
	Lt      func(VersionOrRef) T
	Gt      func(VersionOrRef) T
	Range   func(VersionOrRef, VersionOrRef) T
	Default func() T
}

func MatchVersionQuery[T any](q Query, m QueryMatch[T]) (_ T) {
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
