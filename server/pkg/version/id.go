package version

import (
	"github.com/chrispappas/golang-generics-set/set"
	"github.com/google/uuid"
)

type ID uuid.UUID

var Zero ID = ID(uuid.UUID{})

func NewID() ID {
	return ID(uuid.New())
}

func (v ID) IsZero() bool {
	return v == Zero
}

func (v ID) Ref() *ID {
	return &v
}

func (v ID) String() string {
	return uuid.UUID(v).String()
}

func (v ID) OrRef() IDOrRef {
	return IDOrRef{version: v}
}

type IDs = set.Set[ID]

func NewIDs(v ...ID) IDs {
	s := IDs{}
	s.Add(v...)
	return s
}
