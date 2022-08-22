package version

import "github.com/chrispappas/golang-generics-set/set"

const Latest = Ref("latest")

type Ref string

func (r Ref) Ref() *Ref {
	return &r
}

func (r Ref) String() string {
	return string(r)
}

func (r Ref) OrVersion() VersionOrRef {
	return VersionOrRef{ref: r}
}

func (r Ref) IsSpecial() bool {
	return r == Ref("") || r == Latest
}

type Refs = set.Set[Ref]

func NewRefs(refs ...Ref) Refs {
	s := Refs{}
	s.Add(refs...)
	return s
}
