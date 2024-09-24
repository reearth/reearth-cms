package version

import (
	"github.com/chrispappas/golang-generics-set/set"
	"github.com/google/uuid"
)

type Version uuid.UUID

var Zero Version = Version(uuid.UUID{})

func New() Version {
	return Version(uuid.New())
}

func (v Version) IsZero() bool {
	return v == Zero
}

func (v Version) Ref() *Version {
	return &v
}

func (v Version) String() string {
	return uuid.UUID(v).String()
}

func (v Version) OrRef() VersionOrRef {
	return VersionOrRef{version: v}
}

func ToVersionOrLatestRef(ver *string) VersionOrRef {
	v, ok := parseVersion(ver)
	if !ok {
		return Latest.OrVersion()
	}
	return v.OrRef()
}

func parseVersion(ver *string) (*Version, bool) {
	if ver == nil {
		return nil, false
	}
	u, err := uuid.Parse(*ver)
	if err != nil {
		return nil, false
	}
	return Version(u).Ref(), true
}

type Versions = set.Set[Version]

func NewVersions(v ...Version) Versions {
	s := Versions{}
	s.Add(v...)
	return s
}
