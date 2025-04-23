package version

import (
	"github.com/chrispappas/golang-generics-set/set"
	"github.com/google/uuid"
)

type Version uuid.UUID

var Zero = Version(uuid.UUID{})

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
	v := ParseVersion(ver)
	if v == nil {
		return Latest.OrVersion()
	}
	return v.OrRef()
}

func ParseVersion(ver *string) *Version {
	if ver == nil {
		return nil
	}
	u, err := uuid.Parse(*ver)
	if err != nil {
		return nil
	}
	return Version(u).Ref()
}

type Versions = set.Set[Version]

func NewVersions(v ...Version) Versions {
	s := Versions{}
	s.Add(v...)
	return s
}
