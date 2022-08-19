package version

import "github.com/google/uuid"

type Version string

const Zero Version = ""

func New() Version {
	return Version(uuid.NewString())
}

func (v Version) IsZero() bool {
	return v == Zero
}

func (v Version) Ref() *Version {
	return &v
}

func (v Version) String() string {
	return string(v)
}

func (v Version) OrRef() VersionOrRef {
	return VersionOrRef{version: v}
}
