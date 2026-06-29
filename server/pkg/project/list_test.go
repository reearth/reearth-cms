package project

import (
	"testing"

	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/stretchr/testify/assert"
)

func TestList_IDs(t *testing.T) {
	id1 := NewID()
	id2 := NewID()

	assert.Equal(t, IDList{id1, id2}, List{
		&Project{id: id1},
		&Project{id: id2},
	}.IDs())
	assert.Equal(t, IDList{}, List{}.IDs())
	assert.Equal(t, IDList(nil), List(nil).IDs())
}

func TestList_Workspaces(t *testing.T) {
	w1 := accountdomain.NewWorkspaceID()
	w2 := accountdomain.NewWorkspaceID()

	assert.Equal(t, accountdomain.WorkspaceIDList{w1, w2}, List{
		&Project{workspaceID: w1},
		&Project{workspaceID: w2},
	}.Workspaces())
	assert.Equal(t, accountdomain.WorkspaceIDList{}, List{}.Workspaces())
	assert.Equal(t, accountdomain.WorkspaceIDList(nil), List(nil).Workspaces())
}

func TestList_SortByID(t *testing.T) {
	id1 := NewID()
	id2 := NewID()

	list := List{
		&Project{id: id2},
		&Project{id: id1},
	}
	res := list.SortByID()
	assert.Equal(t, List{
		&Project{id: id1},
		&Project{id: id2},
	}, res)
	// test whether original list is not modified
	assert.Equal(t, List{
		&Project{id: id2},
		&Project{id: id1},
	}, list)
}

func TestList_Clone(t *testing.T) {
	p := New().NewID().Name("a").MustBuild()

	list := List{p}
	got := list.Clone()
	assert.Equal(t, list, got)
	assert.NotSame(t, list[0], got[0])
}
