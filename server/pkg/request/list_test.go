package request

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestList_CloseAll(t *testing.T) {
	item, _ := NewItem(id.NewItemID(), lo.ToPtr(version.New().String()))

	req1 := New().
		NewID().
		Workspace(accountdomain.NewWorkspaceID()).
		Project(id.NewProjectID()).
		CreatedBy(accountdomain.NewUserID()).
		Thread(id.NewThreadID().Ref()).
		Items(ItemList{item}).
		Title("foo").
		MustBuild()

	req2 := New().
		NewID().
		Workspace(accountdomain.NewWorkspaceID()).
		Project(id.NewProjectID()).
		CreatedBy(accountdomain.NewUserID()).
		Thread(id.NewThreadID().Ref()).
		Items(ItemList{item}).
		Title("hoge").
		MustBuild()

	list := List{req1, req2}
	list.UpdateStatus(StateClosed)
	for _, request := range list {
		assert.Equal(t, StateClosed, request.State())
	}
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
			list: List{&Request{workspace: wid1}, &Request{workspace: wid1}},
			want: accountdomain.WorkspaceIDList{wid1},
		},
		{
			name: "multiple workspaces deduplicated",
			list: List{&Request{workspace: wid1}, &Request{workspace: wid1}, &Request{workspace: wid2}},
			want: accountdomain.WorkspaceIDList{wid1, wid2},
		},
		{
			name: "nil entries are skipped",
			list: List{nil, &Request{workspace: wid1}, nil, &Request{workspace: wid2}},
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
