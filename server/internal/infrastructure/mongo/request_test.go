package mongo

import (
	"context"
	"testing"

	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/request"
	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/mongox/mongotest"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/usecasex"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestRequest_Filtered(t *testing.T) {
	pid := id.NewProjectID()
	item, _ := request.NewItem(id.NewItemID(), version.New().OrRef())

	req1 := request.New().
		NewID().
		Workspace(id.NewWorkspaceID()).
		Project(pid).
		CreatedBy(id.NewUserID()).
		Thread(id.NewThreadID()).
		Items([]*request.Item{item}).
		Title("foo").
		MustBuild()
	req2 := request.New().
		NewID().
		Workspace(id.NewWorkspaceID()).
		Project(pid).
		CreatedBy(id.NewUserID()).
		Thread(id.NewThreadID()).
		Items([]*request.Item{item}).
		Title("hoge").
		MustBuild()
	tests := []struct {
		name    string
		seeds   []*request.Request
		args    repo.ProjectFilter
		wantErr error
	}{
		{
			name:  "operation denied",
			seeds: []*request.Request{req1, req2},
			args: repo.ProjectFilter{
				Readable: []id.ProjectID{},
				Writable: []id.ProjectID{},
			},
			wantErr: repo.ErrOperationDenied,
		},
		{
			name:  "success",
			seeds: []*request.Request{req1, req2},

			args: repo.ProjectFilter{
				Readable: []id.ProjectID{pid},
				Writable: []id.ProjectID{pid},
			},
		},
	}
	initDB := mongotest.Connect(t)
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			client := mongox.NewClientWithDatabase(initDB(t))

			r := NewRequest(client).Filtered(tt.args)
			ctx := context.Background()
			for _, p := range tt.seeds {
				err := r.Save(ctx, p)
				assert.ErrorIs(t, err, tt.wantErr)
			}
		})
	}
}

func TestRequest_FindByID(t *testing.T) {
	pid := id.NewProjectID()
	item, _ := request.NewItem(id.NewItemID(), version.New().OrRef())

	req1 := request.New().
		NewID().
		Workspace(id.NewWorkspaceID()).
		Project(pid).
		CreatedBy(id.NewUserID()).
		Thread(id.NewThreadID()).
		Items([]*request.Item{item}).
		Title("foo").
		MustBuild()
	req2 := request.New().
		NewID().
		Workspace(id.NewWorkspaceID()).
		Project(pid).
		CreatedBy(id.NewUserID()).
		Thread(id.NewThreadID()).
		Items([]*request.Item{item}).
		Title("hoge").
		MustBuild()
	tests := []struct {
		name    string
		seeds   []*request.Request
		args    request.ID
		want    *request.Request
		wantErr error
	}{
		{
			name:  "success",
			seeds: []*request.Request{req1, req2},
			args:  req1.ID(),
			want:  req1,
		},
		{
			name:    "not found",
			seeds:   []*request.Request{req1, req2},
			args:    id.NewRequestID(),
			wantErr: rerror.ErrNotFound,
		},
	}
	initDB := mongotest.Connect(t)
	for _, tc := range tests {
		t.Run(tc.name, func(tt *testing.T) {
			client := mongox.NewClientWithDatabase(initDB(t))

			r := NewRequest(client)
			ctx := context.Background()
			for _, p := range tc.seeds {
				err := r.Save(ctx, p)
				assert.NoError(t, err)
			}
			got, err := r.FindByID(ctx, tc.args)
			if err != nil {
				assert.Equal(t, tc.wantErr, err)
				return
			}
			assert.Equal(t, tc.want.ID(), got.ID())
		})
	}
}

func TestRequest_FindByIDs(t *testing.T) {
	pid := id.NewProjectID()
	item, _ := request.NewItem(id.NewItemID(), version.New().OrRef())

	req1 := request.New().
		NewID().
		Workspace(id.NewWorkspaceID()).
		Project(pid).
		CreatedBy(id.NewUserID()).
		Thread(id.NewThreadID()).
		Items([]*request.Item{item}).
		Title("foo").
		MustBuild()
	req2 := request.New().
		NewID().
		Workspace(id.NewWorkspaceID()).
		Project(pid).
		CreatedBy(id.NewUserID()).
		Thread(id.NewThreadID()).
		Items([]*request.Item{item}).
		Title("hoge").
		MustBuild()

	tests := []struct {
		name  string
		seeds []*request.Request
		args  id.RequestIDList
		want  int
	}{
		{
			name:  "must find 2",
			seeds: []*request.Request{req1, req2},
			args:  id.RequestIDList{req1.ID(), req2.ID()},
			want:  2,
		},
		{
			name:  "must find 1",
			seeds: []*request.Request{req1, req2},
			args:  id.RequestIDList{id.NewRequestID(), req1.ID()},
			want:  1,
		},
	}

	initDB := mongotest.Connect(t)

	for _, tc := range tests {
		t.Run(tc.name, func(tt *testing.T) {
			client := mongox.NewClientWithDatabase(initDB(t))

			r := NewRequest(client)
			ctx := context.Background()
			for _, p := range tc.seeds {
				err := r.Save(ctx, p)
				assert.NoError(t, err)
			}
			got, _ := r.FindByIDs(ctx, tc.args)
			assert.Equal(t, tc.want, len(got))
		})
	}
}

func TestRequest_FindByProject(t *testing.T) {
	pid := id.NewProjectID()
	item, _ := request.NewItem(id.NewItemID(), version.New().OrRef())

	req1 := request.New().
		NewID().
		Workspace(id.NewWorkspaceID()).
		Project(pid).
		CreatedBy(id.NewUserID()).
		Thread(id.NewThreadID()).
		Items([]*request.Item{item}).
		Title("foo").
		MustBuild()
	req2 := request.New().
		NewID().
		Workspace(id.NewWorkspaceID()).
		Project(pid).
		CreatedBy(id.NewUserID()).
		Thread(id.NewThreadID()).
		Items([]*request.Item{item}).
		State(request.StateDraft).
		Title("hoge").
		MustBuild()
	type args struct {
		projectID id.ProjectID
		repo.RequestFilter
	}
	tests := []struct {
		name  string
		seeds []*request.Request
		args  args
		want  int
	}{
		{
			name:  "must find 2",
			seeds: []*request.Request{req1, req2},
			args: args{
				projectID: pid,
			},
			want: 2,
		},
		{
			name:  "must find 0",
			seeds: []*request.Request{req1, req2},
			args: args{
				projectID: id.NewProjectID(),
			},
			want: 0,
		},
		{
			name:  "must find 1",
			seeds: []*request.Request{req1, req2},
			args: args{
				projectID: pid,
				RequestFilter: repo.RequestFilter{
					Keyword: lo.ToPtr("foo"),
				},
			},
			want: 1,
		},
		{
			name:  "must find 1",
			seeds: []*request.Request{req1, req2},
			args: args{
				projectID: pid,
				RequestFilter: repo.RequestFilter{
					State: &request.StateDraft,
				},
			},
			want: 1,
		},
		{
			name:  "must find 0",
			seeds: []*request.Request{req1, req2},
			args: args{
				projectID: pid,
				RequestFilter: repo.RequestFilter{
					Keyword: lo.ToPtr("foo"),
					State:   &request.StateDraft,
				},
			},
			want: 0,
		},
	}

	initDB := Connect(t)

	for _, tc := range tests {
		t.Run(tc.name, func(tt *testing.T) {
			client := mongox.NewClientWithDatabase(initDB(t))

			r := NewRequest(client)
			ctx := context.Background()
			for _, p := range tc.seeds {
				err := r.Save(ctx, p)
				assert.NoError(t, err)
			}
			got, _, _ := r.FindByProject(ctx, tc.args.projectID, tc.args.RequestFilter, usecasex.CursorPagination{First: lo.ToPtr(int64(10))}.Wrap())
			assert.Equal(t, tc.want, len(got))
		})
	}
}

func TestRequest_Remove(t *testing.T) {
	pid := id.NewProjectID()
	item, _ := request.NewItem(id.NewItemID(), version.New().OrRef())

	req1 := request.New().
		NewID().
		Workspace(id.NewWorkspaceID()).
		Project(pid).
		CreatedBy(id.NewUserID()).
		Thread(id.NewThreadID()).
		Items([]*request.Item{item}).
		Title("foo").
		MustBuild()
	req2 := request.New().
		NewID().
		Workspace(id.NewWorkspaceID()).
		Project(pid).
		CreatedBy(id.NewUserID()).
		Thread(id.NewThreadID()).
		Items([]*request.Item{item}).
		Title("hoge").
		MustBuild()

	initDB := mongotest.Connect(t)

	client := mongox.NewClientWithDatabase(initDB(t))

	r := NewRequest(client)
	ctx := context.Background()
	err := r.Save(ctx, req1)
	assert.NoError(t, err)
	err = r.Save(ctx, req2)
	assert.NoError(t, err)
	err = r.Remove(ctx, req2.ID())
	assert.NoError(t, err)
	got, _ := r.FindByIDs(ctx, id.RequestIDList{req1.ID(), req2.ID()})
	assert.Equal(t, 1, len(got))
}
