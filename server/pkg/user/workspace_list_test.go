package user

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestWorkspaceList_FilterByID(t *testing.T) {
	tid1 := NewWorkspaceID()
	tid2 := NewWorkspaceID()
	t1 := &Workspace{id: tid1}
	t2 := &Workspace{id: tid2}

	assert.Equal(t, WorkspaceList{t1}, WorkspaceList{t1, t2}.FilterByID(tid1))
	assert.Equal(t, WorkspaceList{t2}, WorkspaceList{t1, t2}.FilterByID(tid2))
	assert.Equal(t, WorkspaceList{t1, t2}, WorkspaceList{t1, t2}.FilterByID(tid1, tid2))
	assert.Equal(t, WorkspaceList{}, WorkspaceList{t1, t2}.FilterByID(NewWorkspaceID()))
	assert.Equal(t, WorkspaceList(nil), WorkspaceList(nil).FilterByID(tid1))
}

func TestWorkspaceList_FilterByUserRole(t *testing.T) {
	uid := NewID()
	tid1 := NewWorkspaceID()
	tid2 := NewWorkspaceID()
	t1 := &Workspace{
		id: tid1,
		members: &Members{
			users: map[ID]Role{
				uid: RoleReader,
			},
		},
	}
	t2 := &Workspace{
		id: tid2,
		members: &Members{
			users: map[ID]Role{
				uid: RoleOwner,
			},
		},
	}

	assert.Equal(t, WorkspaceList{t1}, WorkspaceList{t1, t2}.FilterByUserRole(uid, RoleReader))
	assert.Equal(t, WorkspaceList{}, WorkspaceList{t1, t2}.FilterByUserRole(uid, RoleWriter))
	assert.Equal(t, WorkspaceList{t2}, WorkspaceList{t1, t2}.FilterByUserRole(uid, RoleOwner))
	assert.Equal(t, WorkspaceList(nil), WorkspaceList(nil).FilterByUserRole(uid, RoleOwner))
}

func TestWorkspaceList_FilterByUserRoleIncluding(t *testing.T) {
	uid := NewID()
	tid1 := NewWorkspaceID()
	tid2 := NewWorkspaceID()
	t1 := &Workspace{
		id: tid1,
		members: &Members{
			users: map[ID]Role{
				uid: RoleReader,
			},
		},
	}
	t2 := &Workspace{
		id: tid2,
		members: &Members{
			users: map[ID]Role{
				uid: RoleOwner,
			},
		},
	}

	assert.Equal(t, WorkspaceList{t1, t2}, WorkspaceList{t1, t2}.FilterByUserRoleIncluding(uid, RoleReader))
	assert.Equal(t, WorkspaceList{t2}, WorkspaceList{t1, t2}.FilterByUserRoleIncluding(uid, RoleWriter))
	assert.Equal(t, WorkspaceList{t2}, WorkspaceList{t1, t2}.FilterByUserRoleIncluding(uid, RoleOwner))
	assert.Equal(t, WorkspaceList(nil), WorkspaceList(nil).FilterByUserRoleIncluding(uid, RoleOwner))
}

func TestWorkspaceList_IDs(t *testing.T) {
	tid1 := NewWorkspaceID()
	tid2 := NewWorkspaceID()
	t1 := &Workspace{id: tid1}
	t2 := &Workspace{id: tid2}

	assert.Equal(t, []WorkspaceID{tid1, tid2}, WorkspaceList{t1, t2}.IDs())
	assert.Equal(t, []WorkspaceID{}, WorkspaceList{}.IDs())
	assert.Equal(t, []WorkspaceID(nil), WorkspaceList(nil).IDs())
}
