package asset

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/stretchr/testify/assert"
)

func TestList_SortByID(t *testing.T) {
	id1 := NewID()
	id2 := NewID()

	list := List{
		&Asset{id: id2},
		&Asset{id: id1},
	}
	res := list.SortByID()

	assert.Equal(t, List{
		&Asset{id: id1},
		&Asset{id: id2},
	}, res)

	assert.Equal(t, List{
		&Asset{id: id2},
		&Asset{id: id1},
	}, list)
}

func TestList_Clone(t *testing.T) {
	pid := NewProjectID()
	uid := accountdomain.NewUserID()

	a := New().NewID().Project(pid).CreatedByUser(uid).Size(1000).Thread(NewThreadID().Ref()).NewUUID().MustBuild()

	list := List{a}
	got := list.Clone()
	assert.Equal(t, list, got)
	assert.NotSame(t, list[0], got[0])
}

func TestList_Map(t *testing.T) {
	pid := NewProjectID()
	uid := accountdomain.NewUserID()

	a := New().NewID().Project(pid).CreatedByUser(uid).Size(1000).Thread(NewThreadID().Ref()).NewUUID().MustBuild()

	assert.Equal(t, Map{
		a.ID(): a,
	}, List{a, nil}.Map())
	assert.Equal(t, Map{}, List(nil).Map())
}

func TestList_IDs(t *testing.T) {
	pid := NewProjectID()
	uid := accountdomain.NewUserID()
	a1 := New().NewID().Project(pid).CreatedByUser(uid).Size(1000).Thread(NewThreadID().Ref()).NewUUID().MustBuild()
	a2 := New().NewID().Project(pid).CreatedByUser(uid).Size(1000).Thread(NewThreadID().Ref()).NewUUID().MustBuild()
	al := List{a1, a2}
	assert.Equal(t, al.IDs(), id.AssetIDList{a1.ID(), a2.ID()})
}

func TestList_Projects(t *testing.T) {
	uid := accountdomain.NewUserID()
	pid1 := NewProjectID()
	pid2 := NewProjectID()
	newAsset := func(pid ProjectID) *Asset {
		return New().NewID().Project(pid).CreatedByUser(uid).Size(1000).Thread(NewThreadID().Ref()).NewUUID().MustBuild()
	}
	a1 := newAsset(pid1)
	a2 := newAsset(pid1)
	a3 := newAsset(pid2)

	tests := []struct {
		name string
		list List
		want id.ProjectIDList
	}{
		{
			name: "nil list",
			list: nil,
			want: id.ProjectIDList{},
		},
		{
			name: "empty list",
			list: List{},
			want: id.ProjectIDList{},
		},
		{
			name: "single project deduplicated",
			list: List{a1, a2},
			want: id.ProjectIDList{pid1},
		},
		{
			name: "multiple projects deduplicated",
			list: List{a1, a2, a3},
			want: id.ProjectIDList{pid1, pid2},
		},
		{
			name: "nil entries are skipped",
			list: List{nil, a1, nil, a3},
			want: id.ProjectIDList{pid1, pid2},
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tc.want, tc.list.Projects())
		})
	}
}
