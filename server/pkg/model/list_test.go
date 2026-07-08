package model

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/stretchr/testify/assert"
)

func TestList_SortByID(t *testing.T) {
	id1 := NewID()
	id2 := NewID()

	list := List{
		&Model{id: id2},
		&Model{id: id1},
	}
	res := list.SortByID()
	assert.Equal(t, List{
		&Model{id: id1},
		&Model{id: id2},
	}, res)
	// test whether original list is not modified
	assert.Equal(t, List{
		&Model{id: id2},
		&Model{id: id1},
	}, list)
}

func TestList_Clone(t *testing.T) {
	id := NewID()
	list := List{&Model{id: id}}
	got := list.Clone()
	assert.Equal(t, list, got)
	assert.NotSame(t, list[0], got[0])

	got[0].id = NewID()
	// test whether original list is not modified
	assert.Equal(t, list, List{&Model{id: id}})
}

func TestList_OrderByIDs(t *testing.T) {
	pid := id.NewProjectID()
	sid1 := id.NewSchemaID()
	sid2 := id.NewSchemaID()
	sid3 := id.NewSchemaID()
	mod1 := New().NewID().Project(pid).Schema(sid1).Key(id.NewKey("key1")).Order(0).MustBuild()
	mod2 := New().NewID().Project(pid).Schema(sid2).Key(id.NewKey("key2")).Order(0).MustBuild()
	mod3 := New().NewID().Project(pid).Schema(sid3).Key(id.NewKey("key3")).Order(0).MustBuild()
	mods := List{mod1, mod2, mod3}
	assert.Equal(t, List{mod2, mod1, mod3}, mods.OrderByIDs(id.ModelIDList{mod2.ID(), mod1.ID(), mod3.ID()}))
	assert.Equal(t, id.ProjectIDList{pid}, mods.Projects())
}

func TestList_Remove(t *testing.T) {
	pid := id.NewProjectID()
	sid1 := id.NewSchemaID()
	sid2 := id.NewSchemaID()
	sid3 := id.NewSchemaID()
	mod1 := New().NewID().Project(pid).Schema(sid1).Key(id.NewKey("key1")).Order(0).MustBuild()
	mod2 := New().NewID().Project(pid).Schema(sid2).Key(id.NewKey("key2")).Order(1).MustBuild()
	mod3 := New().NewID().Project(pid).Schema(sid3).Key(id.NewKey("key3")).Order(2).MustBuild()
	mods := List{mod1, mod2, mod3}
	assert.Equal(t, List{mod1, mod3}, mods.Remove(mod2.ID()))
	assert.Equal(t, List{mod1, mod2}, mods.Remove(mod3.ID()))
	assert.Equal(t, List{mod2, mod3}, mods.Remove(mod1.ID()))
}

func TestList_Ordered(t *testing.T) {
	pid := id.NewProjectID()
	m1 := New().NewID().Project(pid).Schema(id.NewSchemaID()).Key(id.NewKey("key1")).Order(0).MustBuild()
	m2 := New().NewID().Project(pid).Schema(id.NewSchemaID()).Key(id.NewKey("key2")).Order(1).MustBuild()
	m3 := New().NewID().Project(pid).Schema(id.NewSchemaID()).Key(id.NewKey("key3")).Order(2).MustBuild()
	models := List{m3, m1, m2}
	ordered := models.Ordered()
	assert.NotEqual(t, models, ordered)
	assert.Equal(t, List{m1, m2, m3}, ordered)
}

func TestList_Model(t *testing.T) {
	pid := id.NewProjectID()
	m1 := New().NewID().Project(pid).Schema(id.NewSchemaID()).Key(id.NewKey("key1")).Order(0).MustBuild()
	m2 := New().NewID().Project(pid).Schema(id.NewSchemaID()).Key(id.NewKey("key2")).Order(1).MustBuild()
	m3 := New().NewID().Project(pid).Schema(id.NewSchemaID()).Key(id.NewKey("key3")).Order(2).MustBuild()
	models := List{m3, m1, m2}
	assert.Equal(t, m1, models.Model(m1.ID()))
	assert.Nil(t, models.Model(id.NewModelID()))
}

func TestList_SameProject(t *testing.T) {
	t.Parallel()

	pid1 := id.NewProjectID()
	pid2 := id.NewProjectID()
	m1 := New().NewID().Project(pid1).Schema(id.NewSchemaID()).Key(id.NewKey("key1")).Order(0).MustBuild()
	m2 := New().NewID().Project(pid1).Schema(id.NewSchemaID()).Key(id.NewKey("key2")).Order(1).MustBuild()
	m3 := New().NewID().Project(pid2).Schema(id.NewSchemaID()).Key(id.NewKey("key3")).Order(2).MustBuild()

	tests := []struct {
		name string
		list List
		want bool
	}{
		{
			name: "empty list returns true",
			list: List{},
			want: true,
		},
		{
			name: "nil list returns true",
			list: nil,
			want: true,
		},
		{
			name: "single model returns true",
			list: List{m1},
			want: true,
		},
		{
			name: "all models in same project returns true",
			list: List{m1, m2},
			want: true,
		},
		{
			name: "models in different projects returns false",
			list: List{m1, m2, m3},
			want: false,
		},
		{
			name: "differing project on first element returns false",
			list: List{m3, m1, m2},
			want: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.want, tt.list.SameProject())
		})
	}
}

func TestList_SchemaIDs(t *testing.T) {
	t.Parallel()

	pid := id.NewProjectID()
	sid1 := id.NewSchemaID()
	sid2 := id.NewSchemaID()
	m1 := New().NewID().Project(pid).Schema(sid1).Key(id.NewKey("key1")).Order(0).MustBuild()
	m2 := New().NewID().Project(pid).Schema(sid2).Key(id.NewKey("key2")).Order(1).MustBuild()

	t.Run("returns schema IDs for all models", func(t *testing.T) {
		t.Parallel()
		got := List{m1, m2}.SchemaIDs()
		assert.Equal(t, id.SchemaIDList{sid1, sid2}, got)
	})

	t.Run("skips nil entries", func(t *testing.T) {
		t.Parallel()
		got := List{m1, nil, m2}.SchemaIDs()
		assert.Equal(t, id.SchemaIDList{sid1, sid2}, got)
	})

	t.Run("empty list returns nil", func(t *testing.T) {
		t.Parallel()
		assert.Nil(t, List{}.SchemaIDs())
	})
}
