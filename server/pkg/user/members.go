package user

import (
	"errors"
	"sort"
)

var (
	ErrInvalidName                   = errors.New("invalid workspace name")
	ErrUserAlreadyJoined             = errors.New("user already joined")
	ErrCannotModifyPersonalWorkspace = errors.New("personal workspace cannot be modified")
	ErrWorkspaceWithProjects         = errors.New("target workspace still has some project")
	ErrTargetUserNotInTheWorkspace   = errors.New("target user does not exist in the workspace")
)

type Members struct {
	members map[ID]Role
	fixed   bool
}

func NewMembers() *Members {
	m := &Members{members: map[ID]Role{}}
	return m
}

func NewFixedMembers(u ID) *Members {
	m := &Members{members: map[ID]Role{u: RoleOwner}, fixed: true}
	return m
}

func NewMembersWith(members map[ID]Role) *Members {
	m := &Members{members: map[ID]Role{}}
	for k, v := range members {
		m.members[k] = v
	}
	return m
}

func CopyMembers(members *Members) *Members {
	return NewMembersWith(members.members)
}

func (m *Members) Members() map[ID]Role {
	members := make(map[ID]Role)
	for k, v := range m.members {
		members[k] = v
	}
	return members
}

func (m *Members) ContainsUser(u ID) bool {
	for k := range m.members {
		if k == u {
			return true
		}
	}
	return false
}

func (m *Members) Count() int {
	return len(m.members)
}

func (m *Members) GetRole(u ID) Role {
	return m.members[u]
}

func (m *Members) UpdateRole(u ID, role Role) error {
	if m.fixed {
		return ErrCannotModifyPersonalWorkspace
	}
	if role == Role("") {
		return nil
	}
	if _, ok := m.members[u]; ok {
		m.members[u] = role
	} else {
		return ErrTargetUserNotInTheWorkspace
	}
	return nil
}

func (m *Members) Join(u ID, role Role) error {
	if m.fixed {
		return ErrCannotModifyPersonalWorkspace
	}
	if _, ok := m.members[u]; ok {
		return ErrUserAlreadyJoined
	}
	if role == Role("") {
		role = RoleReader
	}
	m.members[u] = role
	return nil
}

func (m *Members) Leave(u ID) error {
	if m.fixed {
		return ErrCannotModifyPersonalWorkspace
	}
	if _, ok := m.members[u]; ok {
		delete(m.members, u)
	} else {
		return ErrTargetUserNotInTheWorkspace
	}
	return nil
}

func (m *Members) UsersByRole(role Role) []ID {
	users := make([]ID, 0, len(m.members))
	for u, r := range m.members {
		if r == role {
			users = append(users, u)
		}
	}

	sort.SliceStable(users, func(a, b int) bool {
		return users[a].Compare(users[b]) > 0
	})

	return users
}

func (m *Members) IsOnlyOwner(u ID) bool {
	return len(m.UsersByRole(RoleOwner)) == 1 && m.members[u] == RoleOwner
}

func (m *Members) Fixed() bool {
	if m == nil {
		return false
	}
	return m.fixed
}
