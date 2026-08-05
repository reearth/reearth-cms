package version

type Query struct {
	all bool
	eq  *VersionOrRef
}

func All() Query {
	return Query{all: true}
}

func Eq(vr VersionOrRef) Query {
	return Query{eq: new(vr)}
}

type QueryMatch struct {
	All func()
	Eq  func(VersionOrRef)
}

func (q Query) Match(m QueryMatch) {
	if q.all && m.All != nil {
		m.All()
		return
	}
	if q.eq != nil && m.Eq != nil {
		m.Eq(*q.eq)
		return
	}
}
