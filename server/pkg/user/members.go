package user

import (
	"errors"
	"sort"

	"golang.org/x/exp/maps"
)

var (
	ErrUserAlreadyJoined             = errors.New("user already joined")
	ErrCannotModifyPersonalWorkspace = errors.New("personal workspace cannot be modified")
	ErrTargetUserNotInTheWorkspace   = errors.New("target user does not exist in the workspace")
	ErrInvalidName                   = errors.New("invalid workspace name")
)

type MemberOptions struct {
	Role      Role
	Active    bool
	InvitedBy ID
}
type Members struct {
	users        map[ID]Role
	integrations map[IntegrationID]Role
	fixed        bool
}

func NewMembers() *Members {
	m := &Members{
		users:        map[ID]Role{},
		integrations: map[IntegrationID]Role{},
	}
	return m
}

func NewFixedMembers(u ID) *Members {
	m := &Members{
		users:        map[ID]Role{u: RoleOwner},
		integrations: map[IntegrationID]Role{},
		fixed:        true,
	}
	return m
}

func NewMembersWith(users map[ID]Role) *Members {
	m := &Members{
		users:        maps.Clone(users),
		integrations: map[IntegrationID]Role{},
	}
	return m
}

func NewFixedMembersWith(users map[ID]Role) *Members {
	m := &Members{
		users:        maps.Clone(users),
		integrations: map[IntegrationID]Role{},
		fixed:        true,
	}
	return m
}

func (m *Members) Clone() *Members {
	c := &Members{
		users:        maps.Clone(m.users),
		integrations: maps.Clone(m.integrations),
		fixed:        m.fixed,
	}
	return c
}

func (m *Members) Users() map[ID]Role {
	return maps.Clone(m.users)
}

func (m *Members) Integrations() map[IntegrationID]Role {
	return maps.Clone(m.integrations)
}

func (m *Members) ContainsUser(u ID) bool {
	for k := range m.users {
		if k == u {
			return true
		}
	}
	return false
}

func (m *Members) Count() int {
	return len(m.users)
}

func (m *Members) UserRole(u ID) Role {
	return m.users[u]
}

func (m *Members) IntegrationRole(iId IntegrationID) Role {
	return m.integrations[iId]
}

func (m *Members) UpdateUserRole(u ID, role Role) error {
	if m.fixed {
		return ErrCannotModifyPersonalWorkspace
	}
	if role == Role("") {
		return nil
	}
	if _, ok := m.users[u]; ok {
		m.users[u] = role
	} else {
		return ErrTargetUserNotInTheWorkspace
	}
	return nil
}

func (m *Members) UpdateIntegrationRole(iId IntegrationID, role Role) error {
	if !role.Valid() {
		return nil
	}
	if _, ok := m.integrations[iId]; ok {
		m.integrations[iId] = role
	} else {
		return ErrTargetUserNotInTheWorkspace
	}
	return nil
}

func (m *Members) JoinUser(u ID, role Role) error {
	if m.fixed {
		return ErrCannotModifyPersonalWorkspace
	}
	if _, ok := m.users[u]; ok {
		return ErrUserAlreadyJoined
	}
	if role == Role("") {
		role = RoleReader
	}
	m.users[u] = role
	return nil
}

func (m *Members) AddIntegration(iId IntegrationID, role Role) error {
	if _, ok := m.integrations[iId]; ok {
		return ErrUserAlreadyJoined
	}
	if role == Role("") {
		role = RoleReader
	}
	m.integrations[iId] = role
	return nil
}

func (m *Members) Leave(u ID) error {
	if m.fixed {
		return ErrCannotModifyPersonalWorkspace
	}
	if _, ok := m.users[u]; ok {
		delete(m.users, u)
	} else {
		return ErrTargetUserNotInTheWorkspace
	}
	return nil
}

func (m *Members) DeleteIntegration(iId IntegrationID) error {
	if _, ok := m.integrations[iId]; ok {
		delete(m.integrations, iId)
	} else {
		return ErrTargetUserNotInTheWorkspace
	}
	return nil
}

func (m *Members) UsersByRole(role Role) []ID {
	users := make([]ID, 0, len(m.users))
	for u, r := range m.users {
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
	return len(m.UsersByRole(RoleOwner)) == 1 && m.users[u] == RoleOwner
}

func (m *Members) Fixed() bool {
	if m == nil {
		return false
	}
	return m.fixed
}
