package version

import "github.com/google/uuid"

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
