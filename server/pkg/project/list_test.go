package project

import (
	"testing"

	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/stretchr/testify/assert"
)

func TestList_IDs(t *testing.T) {
	t.Parallel()

	id1 := NewID()
	id2 := NewID()
	id3 := NewID()

	p1 := &Project{id: id1}
	p2 := &Project{id: id2}
	p3 := &Project{id: id3}

	tests := []struct {
		name     string
		list     List
		expected IDList
	}{
		{
			name:     "returns ids in list order",
			list:     List{p1, p2, p3},
			expected: IDList{id1, id2, id3},
		},
		{
			name:     "single element",
			list:     List{p2},
			expected: IDList{id2},
		},
		{
			name:     "empty list returns empty id list",
			list:     List{},
			expected: IDList{},
		},
		{
			name:     "nil list returns empty id list",
			list:     nil,
			expected: IDList{},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			got := tt.list.IDs()

			assert.Equal(t, tt.expected, got)
		})
	}
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

func TestList_OrderByIds(t *testing.T) {
	t.Parallel()

	id1 := NewID()
	id2 := NewID()
	id3 := NewID()

	p1 := &Project{id: id1}
	p2 := &Project{id: id2}
	p3 := &Project{id: id3}

	tests := []struct {
		name     string
		list     List
		ids      IDList
		expected List
	}{
		{
			name:     "reorders result to match ids order",
			list:     List{p1, p2, p3},
			ids:      IDList{id3, id1, id2},
			expected: List{p3, p1, p2},
		},
		{
			name:     "excludes projects not present in ids",
			list:     List{p1, p2, p3},
			ids:      IDList{id1, id3},
			expected: List{p1, p3},
		},
		{
			name:     "skips ids not found in list",
			list:     List{p1, p2},
			ids:      IDList{id1, id3, id2},
			expected: List{p1, p2},
		},
		{
			name:     "duplicate ids produce duplicate entries",
			list:     List{p1, p2},
			ids:      IDList{id1, id1, id2},
			expected: List{p1, p1, p2},
		},
		{
			name:     "empty ids returns empty list",
			list:     List{p1, p2},
			ids:      IDList{},
			expected: List{},
		},
		{
			name:     "empty list returns empty list",
			list:     List{},
			ids:      IDList{id1, id2},
			expected: List{},
		},
		{
			name:     "nil list returns empty list",
			list:     nil,
			ids:      IDList{id1},
			expected: List{},
		},
		{
			name:     "nil ids returns empty list",
			list:     List{p1, p2},
			ids:      nil,
			expected: List{},
		},
		{
			name:     "does not modify original list",
			list:     List{p1, p2, p3},
			ids:      IDList{id3, id2, id1},
			expected: List{p3, p2, p1},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			var originalList List
			if tt.list != nil {
				originalList = make(List, len(tt.list))
				copy(originalList, tt.list)
			}

			got := tt.list.OrderByIds(tt.ids)

			assert.Equal(t, tt.expected, got)
			assert.Equal(t, originalList, tt.list)
		})
	}
}

func TestList_Clone(t *testing.T) {
	p := New().NewID().Name("a").MustBuild()

	list := List{p}
	got := list.Clone()
	assert.Equal(t, list, got)
	assert.NotSame(t, list[0], got[0])
}
