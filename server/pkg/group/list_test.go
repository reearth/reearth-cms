package group

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/stretchr/testify/assert"
)

func TestList_SortByID(t *testing.T) {
	id1 := NewID()
	id2 := NewID()

	list := List{
		&Group{id: id2},
		&Group{id: id1},
	}
	res := list.SortByID()
	assert.Equal(t, List{
		&Group{id: id1},
		&Group{id: id2},
	}, res)
	// test whether original list is not modified
	assert.Equal(t, List{
		&Group{id: id2},
		&Group{id: id1},
	}, list)
}

func TestList_Clone(t *testing.T) {
	id := NewID()
	list := List{&Group{id: id}}
	got := list.Clone()
	assert.Equal(t, list, got)
	assert.NotSame(t, list[0], got[0])

	got[0].id = NewID()
	// test whether original list is not modified
	assert.Equal(t, list, List{&Group{id: id}})
}

func TestList_OrderByIDs(t *testing.T) {
	pid := id.NewProjectID()
	sid1 := id.NewSchemaID()
	sid2 := id.NewSchemaID()
	sid3 := id.NewSchemaID()
	group1 := New().NewID().Project(pid).Schema(sid1).Key(id.NewKey("key1")).Order(0).MustBuild()
	group2 := New().NewID().Project(pid).Schema(sid2).Key(id.NewKey("key2")).Order(0).MustBuild()
	group3 := New().NewID().Project(pid).Schema(sid3).Key(id.NewKey("key3")).Order(0).MustBuild()
	groups := List{group1, group2, group3}
	assert.Equal(t, List{group2, group1, group3}, groups.OrderByIDs(id.GroupIDList{group2.ID(), group1.ID(), group3.ID()}))
	assert.Equal(t, id.ProjectIDList{pid, pid, pid}, groups.Projects())
}

func TestList_Ordered(t *testing.T) {
	pid := id.NewProjectID()
	g1 := New().NewID().Project(pid).Schema(id.NewSchemaID()).Key(id.NewKey("key1")).Order(0).MustBuild()
	g2 := New().NewID().Project(pid).Schema(id.NewSchemaID()).Key(id.NewKey("key2")).Order(1).MustBuild()
	g3 := New().NewID().Project(pid).Schema(id.NewSchemaID()).Key(id.NewKey("key3")).Order(2).MustBuild()
	groups := List{g3, g1, g2}
	ordered := groups.Ordered()
	assert.NotEqual(t, groups, ordered)
	assert.Equal(t, List{g1, g2, g3}, ordered)
}
