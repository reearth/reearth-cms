package thread

import (
	"testing"

	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/stretchr/testify/assert"
)

func TestList_SortByID(t *testing.T) {
	id1 := NewID()
	id2 := NewID()

	list := List{
		&Thread{id: id2},
		&Thread{id: id1},
	}
	res := list.SortByID()
	assert.Equal(t, List{
		&Thread{id: id1},
		&Thread{id: id2},
	}, res)
	// test whether original list is not modified
	assert.Equal(t, List{
		&Thread{id: id2},
		&Thread{id: id1},
	}, list)
}

func TestList_Clone(t *testing.T) {
	th := New().NewID().Workspace(accountdomain.NewWorkspaceID()).MustBuild()

	list := List{th}
	got := list.Clone()
	assert.Equal(t, list, got)
	assert.NotSame(t, list[0], got[0])
}

func TestList_Workspaces(t *testing.T) {
	wid1 := accountdomain.NewWorkspaceID()
	wid2 := accountdomain.NewWorkspaceID()

	tests := []struct {
		name string
		list List
		want accountdomain.WorkspaceIDList
	}{
		{
			name: "nil list",
			list: nil,
			want: accountdomain.WorkspaceIDList{},
		},
		{
			name: "empty list",
			list: List{},
			want: accountdomain.WorkspaceIDList{},
		},
		{
			name: "single workspace deduplicated",
			list: List{&Thread{workspace: wid1}, &Thread{workspace: wid1}},
			want: accountdomain.WorkspaceIDList{wid1},
		},
		{
			name: "multiple workspaces deduplicated",
			list: List{&Thread{workspace: wid1}, &Thread{workspace: wid1}, &Thread{workspace: wid2}},
			want: accountdomain.WorkspaceIDList{wid1, wid2},
		},
		{
			name: "nil entries are skipped",
			list: List{nil, &Thread{workspace: wid1}, nil, &Thread{workspace: wid2}},
			want: accountdomain.WorkspaceIDList{wid1, wid2},
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tc.want, tc.list.Workspaces())
		})
	}
}
