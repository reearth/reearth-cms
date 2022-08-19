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

type Refs = set.Set[Ref]

func RefsFrom(refs ...Ref) Refs {
	s := Refs{}
	s.Add(refs...)
	return s
}
