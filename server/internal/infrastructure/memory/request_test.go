package memory

import (
	"context"
	"errors"
	"testing"

	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/request"
	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/reearth/reearthx/rerror"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestRequest_Filtered(t *testing.T) {
	r := &Request{}
	pid := id.NewProjectID()

	assert.Equal(t, &Request{
		f: repo.ProjectFilter{
			Readable: id.ProjectIDList{pid},
			Writable: nil,
		},
	}, r.Filtered(repo.ProjectFilter{
		Readable: id.ProjectIDList{pid},
		Writable: nil,
	}))
}

func TestRequest_FindByID(t *testing.T) {
	ctx := context.Background()
	item, _ := request.NewItem(id.NewItemID(), version.New().OrRef())

	req := request.New().
		NewID().
		Workspace(id.NewWorkspaceID()).
		Project(id.NewProjectID()).
		CreatedBy(id.NewUserID()).
		Thread(id.NewThreadID()).
		Items([]*request.Item{item}).
		Title("foo").
		MustBuild()
	r := NewRequest()
	_ = r.Save(ctx, req)

	out, err := r.FindByID(ctx, req.ID())
	assert.NoError(t, err)
	assert.Equal(t, req, out)

	out2, err := r.FindByID(ctx, id.RequestID{})
	assert.Nil(t, out2)
	assert.Same(t, rerror.ErrNotFound, err)
}

func TestRequest_Remove(t *testing.T) {
	ctx := context.Background()
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
		Title("foo").
		MustBuild()

	r := NewRequest()
	_ = r.Save(ctx, req1)
	_ = r.Save(ctx, req2)
	r = r.Filtered(repo.ProjectFilter{
		Readable: []id.ProjectID{pid},
		Writable: []id.ProjectID{pid},
	})

	err := r.Remove(ctx, req1.ID())
	assert.NoError(t, err)
	data, _ := r.FindByIDs(ctx, id.RequestIDList{req1.ID(), req2.ID()})
	assert.Equal(t, []*request.Request{req2}, data)

	wantErr := errors.New("test")
	SetRequestError(r, wantErr)
	assert.Same(t, wantErr, r.Remove(ctx, req1.ID()))
}

func TestRequest_Save(t *testing.T) {
	ctx := context.Background()
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
		Project(id.NewProjectID()).
		CreatedBy(id.NewUserID()).
		Thread(id.NewThreadID()).
		Items([]*request.Item{item}).
		Title("foo").
		MustBuild()
	pf := repo.ProjectFilter{
		Readable: []id.ProjectID{pid},
		Writable: []id.ProjectID{pid},
	}
	r := NewRequest().Filtered(pf)

	_ = r.Save(ctx, req1)
	got, _ := r.FindByID(ctx, req1.ID())
	assert.Equal(t, req1, got)

	err := r.Save(ctx, req2)
	assert.Equal(t, repo.ErrOperationDenied, err)

	wantErr := errors.New("test")
	SetRequestError(r, wantErr)
	assert.Same(t, wantErr, r.Save(ctx, req1))
}

func TestRequest_FindByIDs(t *testing.T) {
	ctx := context.Background()
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
		Title("foo").
		MustBuild()
	pf := repo.ProjectFilter{
		Readable: []id.ProjectID{pid},
		Writable: []id.ProjectID{pid},
	}
	r := NewRequest().Filtered(pf)
	_ = r.Save(ctx, req1)
	_ = r.Save(ctx, req2)

	got, err := r.FindByIDs(ctx, id.RequestIDList{req1.ID(), req2.ID()})
	assert.NoError(t, err)
	assert.Equal(t, 2, len(got))
}

func TestRequest_FindByProject(t *testing.T) {
	ctx := context.Background()
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
		Title("xxx").
		State(request.StateDraft).
		MustBuild()

	req3 := request.New().
		NewID().
		Workspace(id.NewWorkspaceID()).
		Project(id.NewProjectID()).
		CreatedBy(id.NewUserID()).
		Thread(id.NewThreadID()).
		Items([]*request.Item{item}).
		Title("foo").
		MustBuild()
	pf := repo.ProjectFilter{
		Readable: []id.ProjectID{pid},
		Writable: []id.ProjectID{pid},
	}
	r := NewRequest().Filtered(pf)
	_ = r.Save(ctx, req1)
	_ = r.Save(ctx, req2)
	_ = r.Save(ctx, req3)
	type args struct {
		id     id.ProjectID
		filter repo.RequestFilter
	}
	tests := []struct {
		name string
		args args
		want int
	}{
		{
			name: "find by project id only (find 2)",
			args: args{
				id: pid,
			},
			want: 2,
		},
		{
			name: "find by stat (find 1)",
			args: args{
				id: pid,
				filter: repo.RequestFilter{
					State: &request.StateDraft,
				},
			},
			want: 1,
		},
		{
			name: "find by title (find 1)",
			args: args{
				id: pid,
				filter: repo.RequestFilter{
					Keyword: lo.ToPtr("foo"),
				},
			},
			want: 1,
		},
	}
	for _, tc := range tests {
		t.Run(tc.name, func(tt *testing.T) {
			//tt.Parallel()
			got, _, _ := r.FindByProject(ctx, tc.args.id, tc.args.filter)

			assert.Equal(t, tc.want, len(got))
		})
	}

	wantErr := errors.New("test")
	SetRequestError(r, wantErr)
	_, _, err := r.FindByProject(ctx, pid, repo.RequestFilter{})
	assert.Same(t, wantErr, err)
}
