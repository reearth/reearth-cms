package user

import (
	"errors"
	"sort"
)

var (
	ErrUserAlreadyJoined             = errors.New("user already joined")
	ErrCannotModifyPersonalWorkspace = errors.New("personal workspace cannot be modified")
	ErrTargetUserNotInTheWorkspace   = errors.New("target user does not exist in the workspace")
	ErrInvalidName                   = errors.New("invalid workspace name")
)

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
	m := NewMembers()
	for k, v := range users {
		m.users[k] = v
	}
	return m
}

func NewFixedMembersWith(users map[ID]Role) *Members {
	m := &Members{
		users:        map[ID]Role{},
		integrations: map[IntegrationID]Role{},
		fixed:        true,
	}
	for k, v := range users {
		m.users[k] = v
	}
	return m
}

func CopyMembers(members *Members) *Members {
	m := NewMembersWith(members.users)
	for k, v := range members.integrations {
		m.integrations[k] = v
	}
	return m
}

func (m *Members) Users() map[ID]Role {
	users := make(map[ID]Role)
	for k, v := range m.users {
		users[k] = v
	}
	return users
}

func (m *Members) Integrations() map[IntegrationID]Role {
	integrations := make(map[IntegrationID]Role)
	for k, v := range m.integrations {
		integrations[k] = v
	}
	return integrations
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

func (m *Members) GetRole(u ID) Role {
	return m.users[u]
}

func (m *Members) UpdateRole(u ID, role Role) error {
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

func (m *Members) JoinIntegration(iId IntegrationID, role Role) error {
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

func (m *Members) LeaveIntegration(iId IntegrationID) error {
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
