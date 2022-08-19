package version

type Version string

const VersionZero Version = ""

func (v Version) Ref() *Version {
	return &v
}

func (v Version) String() string {
	return string(v)
}

func (v Version) OrRef() VersionOrRef {
	return VersionOrRef{version: v}
}

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
