package user

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestWorkspaceIDList_Clone(t *testing.T) {
	t1 := NewWorkspaceID()
	t2 := NewWorkspaceID()
	t3 := NewWorkspaceID()
	ids := WorkspaceIDList{t1, t2, t3}
	assert.Equal(t, ids, ids.Clone())
	assert.NotSame(t, ids, ids.Clone())
	assert.Nil(t, WorkspaceIDList(nil).Clone())
}

func TestWorkspaceIDList_Filter(t *testing.T) {
	t1 := NewWorkspaceID()
	t2 := NewWorkspaceID()
	t3 := NewWorkspaceID()
	t4 := NewWorkspaceID()
	assert.Equal(t, WorkspaceIDList{t1}, WorkspaceIDList{t1, t2, t3}.Filter(t1))
	assert.Equal(t, WorkspaceIDList{t1, t3}, WorkspaceIDList{t1, t2, t3}.Filter(t1, t3))
	assert.Equal(t, WorkspaceIDList{}, WorkspaceIDList{t1, t2, t3}.Filter(t4))
	assert.Equal(t, WorkspaceIDList(nil), WorkspaceIDList(nil).Filter(t4))
}

func TestWorkspaceIDList_Includes(t *testing.T) {
	t1 := NewWorkspaceID()
	t2 := NewWorkspaceID()
	t3 := NewWorkspaceID()
	assert.True(t, WorkspaceIDList{t1, t2, t3}.Includes(t1))
	assert.False(t, WorkspaceIDList{t1, t2}.Includes(t3))
	assert.False(t, WorkspaceIDList(nil).Includes(t1))
}

func TestWorkspaceIDList_Len(t *testing.T) {
	t1 := NewWorkspaceID()
	t2 := NewWorkspaceID()
	t3 := NewWorkspaceID()
	assert.Equal(t, 2, WorkspaceIDList{t1, t2}.Len())
	assert.Equal(t, 3, WorkspaceIDList{t1, t2, t3}.Len())
	assert.Equal(t, 0, WorkspaceIDList{}.Len())
	assert.Equal(t, 0, WorkspaceIDList(nil).Len())
}
