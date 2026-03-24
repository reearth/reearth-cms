package mongo

import (
	"context"
	"testing"
	"time"

	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/mongox/mongotest"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/usecasex"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func Test_projectRepo_CountByWorkspace(t *testing.T) {
	tid1 := accountdomain.NewWorkspaceID()
	tests := []struct {
		name    string
		seeds   project.List
		arg     accountdomain.WorkspaceID
		filter  *repo.WorkspaceFilter
		want    int
		wantErr error
	}{
		{
			name:    "0 count in empty db",
			seeds:   project.List{},
			arg:     accountdomain.NewWorkspaceID(),
			filter:  nil,
			want:    0,
			wantErr: nil,
		},
		{
			name: "0 count with project for another workspaces",
			seeds: project.List{
				project.New().NewID().Workspace(accountdomain.NewWorkspaceID()).MustBuild(),
			},
			arg:     accountdomain.NewWorkspaceID(),
			filter:  nil,
			want:    0,
			wantErr: nil,
		},
		{
			name: "1 count with single project",
			seeds: project.List{
				project.New().NewID().Workspace(tid1).MustBuild(),
			},
			arg:     tid1,
			filter:  nil,
			want:    1,
			wantErr: nil,
		},
		{
			name: "1 count with multi projects",
			seeds: project.List{
				project.New().NewID().Workspace(tid1).MustBuild(),
				project.New().NewID().Workspace(accountdomain.NewWorkspaceID()).MustBuild(),
				project.New().NewID().Workspace(accountdomain.NewWorkspaceID()).MustBuild(),
			},
			arg:     tid1,
			filter:  nil,
			want:    1,
			wantErr: nil,
		},
		{
			name: "2 count with multi projects",
			seeds: project.List{
				project.New().NewID().Workspace(tid1).MustBuild(),
				project.New().NewID().Workspace(tid1).MustBuild(),
				project.New().NewID().Workspace(accountdomain.NewWorkspaceID()).MustBuild(),
				project.New().NewID().Workspace(accountdomain.NewWorkspaceID()).MustBuild(),
			},
			arg:     tid1,
			filter:  nil,
			want:    2,
			wantErr: nil,
		},
		{
			name: "2 count with multi projects",
			seeds: project.List{
				project.New().NewID().Workspace(tid1).MustBuild(),
				project.New().NewID().Workspace(tid1).MustBuild(),
				project.New().NewID().Workspace(accountdomain.NewWorkspaceID()).MustBuild(),
				project.New().NewID().Workspace(accountdomain.NewWorkspaceID()).MustBuild(),
			},
			arg:     tid1,
			filter:  &repo.WorkspaceFilter{Readable: []accountdomain.WorkspaceID{accountdomain.NewWorkspaceID()}, Writable: []accountdomain.WorkspaceID{}},
			want:    2,
			wantErr: nil,
		},
	}

	initDB := mongotest.Connect(t)

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			client := mongox.NewClientWithDatabase(initDB(t))

			r := NewProject(client)
			ctx := context.Background()
			for _, p := range tc.seeds {
				err := r.Save(ctx, p)
				assert.NoError(t, err)
			}

			if tc.filter != nil {
				r = r.Filtered(*tc.filter)
			}

			got, err := r.CountByWorkspace(ctx, tc.arg)
			if tc.wantErr != nil {
				assert.ErrorIs(t, err, tc.wantErr)
				return
			}
			assert.Equal(t, tc.want, got)
		})
	}
}

func Test_projectRepo_Filtered(t *testing.T) {
	now := time.Now().Truncate(time.Millisecond).UTC()
	tid1 := accountdomain.NewWorkspaceID()
	id1 := id.NewProjectID()
	id2 := id.NewProjectID()
	p1 := project.New().ID(id1).Workspace(tid1).UpdatedAt(now).MustBuild()
	p2 := project.New().ID(id2).Workspace(tid1).UpdatedAt(now).MustBuild()

	tests := []struct {
		name    string
		seeds   project.List
		arg     repo.WorkspaceFilter
		wantErr error
	}{
		{
			name: "no r/w workspaces operation denied",
			seeds: project.List{
				p1,
				p2,
			},
			arg: repo.WorkspaceFilter{
				Readable: []accountdomain.WorkspaceID{},
				Writable: []accountdomain.WorkspaceID{},
			},
			wantErr: repo.ErrOperationDenied,
		},
		{
			name: "r/w workspaces operation success",
			seeds: project.List{
				p1,
				p2,
			},
			arg: repo.WorkspaceFilter{
				Readable: []accountdomain.WorkspaceID{tid1},
				Writable: []accountdomain.WorkspaceID{tid1},
			},
			wantErr: nil,
		},
	}

	initDB := mongotest.Connect(t)

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			client := mongox.NewClientWithDatabase(initDB(t))

			r := NewProject(client).Filtered(tc.arg)
			ctx := context.Background()
			for _, p := range tc.seeds {
				err := r.Save(ctx, p)
				assert.ErrorIs(t, err, tc.wantErr)
			}
		})
	}
}

func Test_projectRepo_FindByID(t *testing.T) {
	tid1 := accountdomain.NewWorkspaceID()
	id1 := id.NewProjectID()
	now := time.Now().Truncate(time.Millisecond).UTC()
	p1 := project.New().ID(id1).Workspace(tid1).UpdatedAt(now).Topics([]string{}).MustBuild()
	tests := []struct {
		name    string
		seeds   project.List
		arg     id.ProjectID
		filter  *repo.WorkspaceFilter
		want    *project.Project
		wantErr error
	}{
		{
			name:    "Not found in empty db",
			seeds:   project.List{},
			arg:     id.NewProjectID(),
			filter:  nil,
			want:    nil,
			wantErr: rerror.ErrNotFound,
		},
		{
			name: "Not found",
			seeds: project.List{
				project.New().NewID().MustBuild(),
			},
			arg:     id.NewProjectID(),
			filter:  nil,
			want:    nil,
			wantErr: rerror.ErrNotFound,
		},
		{
			name: "Found 1",
			seeds: project.List{
				p1,
			},
			arg:     id1,
			filter:  nil,
			want:    p1,
			wantErr: nil,
		},
		{
			name: "Found 2",
			seeds: project.List{
				p1,
				project.New().NewID().Workspace(accountdomain.NewWorkspaceID()).MustBuild(),
				project.New().NewID().Workspace(accountdomain.NewWorkspaceID()).MustBuild(),
			},
			arg:     id1,
			filter:  nil,
			want:    p1,
			wantErr: nil,
		},
		{
			name: "Filtered Found 0",
			seeds: project.List{
				p1,
				project.New().NewID().Workspace(accountdomain.NewWorkspaceID()).MustBuild(),
				project.New().NewID().Workspace(accountdomain.NewWorkspaceID()).MustBuild(),
			},
			arg:     id1,
			filter:  &repo.WorkspaceFilter{Readable: []accountdomain.WorkspaceID{accountdomain.NewWorkspaceID()}, Writable: []accountdomain.WorkspaceID{}},
			want:    nil,
			wantErr: nil,
		},
		{
			name: "Filtered Found 2",
			seeds: project.List{
				p1,
				project.New().NewID().Workspace(accountdomain.NewWorkspaceID()).MustBuild(),
				project.New().NewID().Workspace(accountdomain.NewWorkspaceID()).MustBuild(),
			},
			arg:     id1,
			filter:  &repo.WorkspaceFilter{Readable: []accountdomain.WorkspaceID{tid1}, Writable: []accountdomain.WorkspaceID{}},
			want:    p1,
			wantErr: nil,
		},
	}

	initDB := mongotest.Connect(t)

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			client := mongox.NewClientWithDatabase(initDB(t))

			r := NewProject(client)
			ctx := context.Background()
			for _, p := range tc.seeds {
				err := r.Save(ctx, p)
				assert.NoError(t, err)
			}

			if tc.filter != nil {
				r = r.Filtered(*tc.filter)
			}

			got, err := r.FindByID(ctx, tc.arg)
			if tc.wantErr != nil {
				assert.ErrorIs(t, err, tc.wantErr)
				return
			}
			assert.Equal(t, tc.want, got)
		})
	}
}

func Test_projectRepo_FindByIDOrAlias(t *testing.T) {
	wId1 := accountdomain.NewWorkspaceID()
	pId1 := id.NewProjectID()
	now := time.Now().Truncate(time.Millisecond).UTC()
	p1 := project.New().ID(pId1).Alias("xyz-123").Workspace(wId1).UpdatedAt(now).Topics([]string{}).MustBuild()
	tests := []struct {
		name    string
		seeds   project.List
		wId     accountdomain.WorkspaceID
		arg     project.IDOrAlias
		filter  *repo.WorkspaceFilter
		want    *project.Project
		wantErr error
	}{
		{
			name:    "Not found in empty db",
			seeds:   project.List{},
			wId:     wId1,
			arg:     project.IDOrAlias(id.NewProjectID().String()),
			filter:  nil,
			want:    nil,
			wantErr: rerror.ErrNotFound,
		},
		{
			name: "Not found",
			seeds: project.List{
				project.New().NewID().MustBuild(),
			},
			wId:     wId1,
			arg:     project.IDOrAlias(id.NewProjectID().String()),
			filter:  nil,
			want:    nil,
			wantErr: rerror.ErrNotFound,
		},
		{
			name: "Found 1",
			seeds: project.List{
				p1,
			},
			wId:     wId1,
			arg:     project.IDOrAlias(pId1.String()),
			filter:  nil,
			want:    p1,
			wantErr: nil,
		},
		{
			name: "Found 2",
			seeds: project.List{
				p1,
				project.New().NewID().Workspace(accountdomain.NewWorkspaceID()).MustBuild(),
				project.New().NewID().Workspace(accountdomain.NewWorkspaceID()).MustBuild(),
			},
			wId:     wId1,
			arg:     project.IDOrAlias(pId1.String()),
			filter:  nil,
			want:    p1,
			wantErr: nil,
		},
		{
			name: "Found 3 (by alias)",
			seeds: project.List{
				p1,
				project.New().NewID().Workspace(accountdomain.NewWorkspaceID()).MustBuild(),
				project.New().NewID().Workspace(accountdomain.NewWorkspaceID()).MustBuild(),
			},
			wId:     wId1,
			arg:     project.IDOrAlias("xyz-123"),
			filter:  nil,
			want:    p1,
			wantErr: nil,
		},
		{
			name: "Found 4 (by alias case insensitive)",
			seeds: project.List{
				p1,
				project.New().NewID().Workspace(accountdomain.NewWorkspaceID()).MustBuild(),
				project.New().NewID().Workspace(accountdomain.NewWorkspaceID()).MustBuild(),
			},
			wId:     wId1,
			arg:     project.IDOrAlias("Xyz-123"),
			filter:  nil,
			want:    p1,
			wantErr: nil,
		},
		{
			name: "Filtered Found 0",
			seeds: project.List{
				p1,
				project.New().NewID().Workspace(accountdomain.NewWorkspaceID()).MustBuild(),
				project.New().NewID().Workspace(accountdomain.NewWorkspaceID()).MustBuild(),
			},
			wId:     wId1,
			arg:     project.IDOrAlias(pId1.String()),
			filter:  &repo.WorkspaceFilter{Readable: []accountdomain.WorkspaceID{accountdomain.NewWorkspaceID()}, Writable: []accountdomain.WorkspaceID{}},
			want:    nil,
			wantErr: nil,
		},
		{
			name: "Filtered Found 2",
			seeds: project.List{
				p1,
				project.New().NewID().Workspace(accountdomain.NewWorkspaceID()).MustBuild(),
				project.New().NewID().Workspace(accountdomain.NewWorkspaceID()).MustBuild(),
			},
			wId:     wId1,
			arg:     project.IDOrAlias(pId1.String()),
			filter:  &repo.WorkspaceFilter{Readable: []accountdomain.WorkspaceID{wId1}, Writable: []accountdomain.WorkspaceID{}},
			want:    p1,
			wantErr: nil,
		},
	}

	initDB := mongotest.Connect(t)

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			client := mongox.NewClientWithDatabase(initDB(t))

			r := NewProject(client)
			ctx := context.Background()
			for _, p := range tc.seeds {
				err := r.Save(ctx, p)
				assert.NoError(t, err)
			}

			if tc.filter != nil {
				r = r.Filtered(*tc.filter)
			}

			got, err := r.FindByIDOrAlias(ctx, tc.wId, tc.arg)
			if tc.wantErr != nil {
				assert.ErrorIs(t, err, tc.wantErr)
				return
			}
			assert.Equal(t, tc.want, got)
		})
	}
}

func Test_projectRepo_FindByIDs(t *testing.T) {
	now := time.Now().Truncate(time.Millisecond).UTC()
	tid1 := accountdomain.NewWorkspaceID()
	id1 := id.NewProjectID()
	id2 := id.NewProjectID()
	p1 := project.New().ID(id1).Workspace(tid1).UpdatedAt(now).Topics([]string{}).MustBuild()
	p2 := project.New().ID(id2).Workspace(tid1).UpdatedAt(now).Topics([]string{}).MustBuild()

	tests := []struct {
		name    string
		seeds   project.List
		arg     id.ProjectIDList
		filter  *repo.WorkspaceFilter
		want    project.List
		wantErr error
	}{
		{
			name:    "0 count in empty db",
			seeds:   project.List{},
			arg:     []id.ProjectID{},
			filter:  nil,
			want:    nil,
			wantErr: nil,
		},
		{
			name: "0 count with project for another workspaces",
			seeds: project.List{
				project.New().NewID().Workspace(accountdomain.NewWorkspaceID()).MustBuild(),
			},
			arg:     []id.ProjectID{},
			filter:  nil,
			want:    nil,
			wantErr: nil,
		},
		{
			name: "1 count with single project",
			seeds: project.List{
				p1,
			},
			arg:     []id.ProjectID{id1},
			filter:  nil,
			want:    project.List{p1},
			wantErr: nil,
		},
		{
			name: "1 count with multi projects",
			seeds: project.List{
				p1,
				project.New().NewID().Workspace(accountdomain.NewWorkspaceID()).MustBuild(),
				project.New().NewID().Workspace(accountdomain.NewWorkspaceID()).MustBuild(),
			},
			arg:     []id.ProjectID{id1},
			filter:  nil,
			want:    project.List{p1},
			wantErr: nil,
		},
		{
			name: "2 count with multi projects",
			seeds: project.List{
				p1,
				p2,
				project.New().NewID().Workspace(accountdomain.NewWorkspaceID()).MustBuild(),
				project.New().NewID().Workspace(accountdomain.NewWorkspaceID()).MustBuild(),
			},
			arg:     []id.ProjectID{id1, id2},
			filter:  nil,
			want:    project.List{p1, p2},
			wantErr: nil,
		},
		{
			name: "Filter 2 count with multi projects",
			seeds: project.List{
				p1,
				p2,
				project.New().NewID().Workspace(accountdomain.NewWorkspaceID()).MustBuild(),
				project.New().NewID().Workspace(accountdomain.NewWorkspaceID()).MustBuild(),
			},
			arg:     []id.ProjectID{id1, id2},
			filter:  &repo.WorkspaceFilter{Readable: []accountdomain.WorkspaceID{accountdomain.NewWorkspaceID()}, Writable: []accountdomain.WorkspaceID{}},
			want:    project.List{ /*nil, nil*/ },
			wantErr: nil,
		},
		{
			name: "Filter 2 count with multi projects",
			seeds: project.List{
				p1,
				p2,
				project.New().NewID().Workspace(accountdomain.NewWorkspaceID()).MustBuild(),
				project.New().NewID().Workspace(accountdomain.NewWorkspaceID()).MustBuild(),
			},
			arg:     []id.ProjectID{id1, id2},
			filter:  &repo.WorkspaceFilter{Readable: []accountdomain.WorkspaceID{tid1}, Writable: []accountdomain.WorkspaceID{}},
			want:    project.List{p1, p2},
			wantErr: nil,
		},
	}

	initDB := mongotest.Connect(t)

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			client := mongox.NewClientWithDatabase(initDB(t))

			r := NewProject(client)
			ctx := context.Background()
			for _, p := range tc.seeds {
				err := r.Save(ctx, p)
				assert.NoError(t, err)
			}

			if tc.filter != nil {
				r = r.Filtered(*tc.filter)
			}

			got, err := r.FindByIDs(ctx, tc.arg)
			if tc.wantErr != nil {
				assert.ErrorIs(t, err, tc.wantErr)
				return
			}

			assert.Equal(t, tc.want, got)
		})
	}
}

func Test_projectRepo_IsAliasAvailable(t *testing.T) {
	now := time.Now().Truncate(time.Millisecond).UTC()
	wId1 := accountdomain.NewWorkspaceID()
	id1 := id.NewProjectID()
	p1 := project.New().
		ID(id1).
		Workspace(wId1).
		Alias("xyz123").
		UpdatedAt(now).
		MustBuild()

	wId2 := accountdomain.NewWorkspaceID()
	id2 := id.NewProjectID()
	p2 := project.New().
		ID(id2).
		Workspace(wId2).
		Alias("xyz321").
		UpdatedAt(now).
		MustBuild()

	tests := []struct {
		name    string
		seeds   project.List
		wId     accountdomain.WorkspaceID
		arg     string
		filter  *repo.WorkspaceFilter
		want    bool
		wantErr error
	}{
		{
			name:    "available in empty db",
			seeds:   project.List{},
			wId:     wId1,
			arg:     "xyz123",
			filter:  nil,
			want:    true,
			wantErr: nil,
		},
		{
			name: "available with another alias",
			seeds: project.List{
				project.New().NewID().Workspace(wId1).Alias("abc123").MustBuild(),
			},
			wId:     wId1,
			arg:     "xyz123",
			filter:  nil,
			want:    true,
			wantErr: nil,
		},
		{
			name: "not available with same alias in same workspace",
			seeds: project.List{
				p1,
			},
			wId:     wId1,
			arg:     "xyz123",
			filter:  nil,
			want:    false,
			wantErr: nil,
		},
		{
			name: "not available with same alias case insensitive in same workspace",
			seeds: project.List{
				p1,
			},
			wId:     wId1,
			arg:     "XYZ123",
			filter:  nil,
			want:    false,
			wantErr: nil,
		},
		{
			name: "not available with same alias in same workspace 2",
			seeds: project.List{
				p2,
			},
			wId:     wId2,
			arg:     "xyz321",
			want:    false,
			filter:  nil,
			wantErr: nil,
		},
		{
			name: "available with same alias in different workspace",
			seeds: project.List{
				p1,
				project.New().NewID().Workspace(accountdomain.NewWorkspaceID()).MustBuild(),
				project.New().NewID().Workspace(accountdomain.NewWorkspaceID()).MustBuild(),
			},
			wId:     accountdomain.NewWorkspaceID(),
			arg:     "xyz123",
			filter:  nil,
			want:    true,
			wantErr: nil,
		},
		{
			name: "not available with same alias in different workspace but filtered repo",
			seeds: project.List{
				p1,
				project.New().NewID().Workspace(accountdomain.NewWorkspaceID()).MustBuild(),
				project.New().NewID().Workspace(accountdomain.NewWorkspaceID()).MustBuild(),
			},
			wId:     wId1,
			arg:     "xyz123",
			filter:  &repo.WorkspaceFilter{Readable: []accountdomain.WorkspaceID{accountdomain.NewWorkspaceID()}, Writable: []accountdomain.WorkspaceID{}},
			want:    false,
			wantErr: nil,
		},
		{
			name: "not available with same alias in different workspace and filtered repo",
			seeds: project.List{
				p1,
				project.New().NewID().Workspace(accountdomain.NewWorkspaceID()).MustBuild(),
				project.New().NewID().Workspace(accountdomain.NewWorkspaceID()).MustBuild(),
			},
			wId:     wId1,
			arg:     "xyz123",
			filter:  &repo.WorkspaceFilter{Readable: []accountdomain.WorkspaceID{wId1}, Writable: []accountdomain.WorkspaceID{}},
			want:    false,
			wantErr: nil,
		},
	}

	initDB := mongotest.Connect(t)

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			client := mongox.NewClientWithDatabase(initDB(t))

			r := NewProject(client)
			ctx := context.Background()
			for _, p := range tc.seeds {
				err := r.Save(ctx, p)
				assert.NoError(t, err)
			}

			if tc.filter != nil {
				r = r.Filtered(*tc.filter)
			}

			got, err := r.IsAliasAvailable(ctx, tc.wId, tc.arg)
			if tc.wantErr != nil {
				assert.ErrorIs(t, err, tc.wantErr)
				return
			}
			assert.NoError(t, err)
			assert.Equal(t, tc.want, got)
		})
	}
}

func Test_projectRepo_FindByWorkspace(t *testing.T) {
	now := time.Now().Truncate(time.Millisecond).UTC()
	tid1 := accountdomain.NewWorkspaceID()
	p1 := project.New().NewID().Workspace(tid1).UpdatedAt(now).Topics([]string{}).MustBuild()
	p2 := project.New().NewID().Workspace(tid1).UpdatedAt(now).Topics([]string{}).MustBuild()

	type args struct {
		wids  accountdomain.WorkspaceIDList
		pInfo *usecasex.Pagination
	}
	tests := []struct {
		name    string
		seeds   project.List
		args    args
		filter  *repo.WorkspaceFilter
		want    project.List
		wantErr error
	}{
		{
			name:    "0 count in empty db",
			seeds:   project.List{},
			args:    args{accountdomain.WorkspaceIDList{accountdomain.NewWorkspaceID()}, nil},
			filter:  nil,
			want:    nil,
			wantErr: nil,
		},
		{
			name: "0 count with project for another workspaces",
			seeds: project.List{
				project.New().NewID().Workspace(accountdomain.NewWorkspaceID()).MustBuild(),
			},
			args:    args{accountdomain.WorkspaceIDList{accountdomain.NewWorkspaceID()}, nil},
			filter:  nil,
			want:    nil,
			wantErr: nil,
		},
		{
			name: "1 count with single project",
			seeds: project.List{
				p1,
			},
			args:    args{accountdomain.WorkspaceIDList{tid1}, usecasex.CursorPagination{First: lo.ToPtr(int64(1))}.Wrap()},
			filter:  nil,
			want:    project.List{p1},
			wantErr: nil,
		},
		{
			name: "1 count with multi projects",
			seeds: project.List{
				p1,
				project.New().NewID().Workspace(accountdomain.NewWorkspaceID()).MustBuild(),
				project.New().NewID().Workspace(accountdomain.NewWorkspaceID()).MustBuild(),
			},
			args:    args{accountdomain.WorkspaceIDList{tid1}, usecasex.CursorPagination{First: lo.ToPtr(int64(1))}.Wrap()},
			filter:  nil,
			want:    project.List{p1},
			wantErr: nil,
		},
		{
			name: "2 count with multi projects",
			seeds: project.List{
				p1,
				p2,
				project.New().NewID().Workspace(accountdomain.NewWorkspaceID()).MustBuild(),
				project.New().NewID().Workspace(accountdomain.NewWorkspaceID()).MustBuild(),
			},
			args:    args{accountdomain.WorkspaceIDList{tid1}, usecasex.CursorPagination{First: lo.ToPtr(int64(2))}.Wrap()},
			filter:  nil,
			want:    project.List{p1, p2},
			wantErr: nil,
		},
		{
			name: "get 1st page of 2",
			seeds: project.List{
				p1,
				p2,
				project.New().NewID().Workspace(accountdomain.NewWorkspaceID()).MustBuild(),
				project.New().NewID().Workspace(accountdomain.NewWorkspaceID()).MustBuild(),
			},
			args:    args{accountdomain.WorkspaceIDList{tid1}, usecasex.CursorPagination{First: lo.ToPtr(int64(1))}.Wrap()},
			filter:  nil,
			want:    project.List{p1},
			wantErr: nil,
		},
		{
			name: "get last page of 2",
			seeds: project.List{
				p1,
				p2,
				project.New().NewID().Workspace(accountdomain.NewWorkspaceID()).MustBuild(),
				project.New().NewID().Workspace(accountdomain.NewWorkspaceID()).MustBuild(),
			},
			args:    args{accountdomain.WorkspaceIDList{tid1}, usecasex.CursorPagination{Last: lo.ToPtr(int64(1))}.Wrap()},
			filter:  nil,
			want:    project.List{p2},
			wantErr: nil,
		},
		{
			name: "Filtered sholud not 1 count with multi projects",
			seeds: project.List{
				p1,
				project.New().NewID().Workspace(accountdomain.NewWorkspaceID()).MustBuild(),
				project.New().NewID().Workspace(accountdomain.NewWorkspaceID()).MustBuild(),
			},
			args:    args{accountdomain.WorkspaceIDList{tid1}, usecasex.CursorPagination{First: lo.ToPtr(int64(1))}.Wrap()},
			filter:  &repo.WorkspaceFilter{Readable: accountdomain.WorkspaceIDList{accountdomain.NewWorkspaceID()}, Writable: accountdomain.WorkspaceIDList{}},
			want:    project.List{p1},
			wantErr: nil,
		},
	}

	initDB := mongotest.Connect(t)

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			client := mongox.NewClientWithDatabase(initDB(t))

			r := NewProject(client)
			ctx := context.Background()
			for _, p := range tc.seeds {
				err := r.Save(ctx, p)
				assert.NoError(t, err)
			}

			if tc.filter != nil {
				r = r.Filtered(*tc.filter)
			}

			got, _, err := r.Search(ctx, interfaces.ProjectFilter{
				WorkspaceIds: &tc.args.wids,
				Pagination:   tc.args.pInfo,
			})
			if tc.wantErr != nil {
				assert.ErrorIs(t, err, tc.wantErr)
				return
			}

			assert.Equal(t, tc.want, got)
		})
	}
}

func Test_projectRepo_Remove(t *testing.T) {
	tid1 := accountdomain.NewWorkspaceID()
	id1 := id.NewProjectID()
	p1 := project.New().ID(id1).Workspace(tid1).MustBuild()
	tests := []struct {
		name    string
		seeds   project.List
		arg     id.ProjectID
		filter  *repo.WorkspaceFilter
		wantErr error
	}{
		{
			name:    "Not found in empty db",
			seeds:   project.List{},
			arg:     id.NewProjectID(),
			filter:  nil,
			wantErr: rerror.ErrNotFound,
		},
		{
			name: "Not found",
			seeds: project.List{
				project.New().NewID().MustBuild(),
			},
			arg:     id.NewProjectID(),
			filter:  nil,
			wantErr: rerror.ErrNotFound,
		},
		{
			name: "Found 1",
			seeds: project.List{
				p1,
			},
			arg:     id1,
			filter:  nil,
			wantErr: nil,
		},
		{
			name: "Found 2",
			seeds: project.List{
				p1,
				project.New().NewID().Workspace(accountdomain.NewWorkspaceID()).MustBuild(),
				project.New().NewID().Workspace(accountdomain.NewWorkspaceID()).MustBuild(),
			},
			arg:     id1,
			filter:  nil,
			wantErr: nil,
		},
		{
			name: "Filtered should fail Found 2",
			seeds: project.List{
				p1,
				project.New().NewID().Workspace(accountdomain.NewWorkspaceID()).MustBuild(),
				project.New().NewID().Workspace(accountdomain.NewWorkspaceID()).MustBuild(),
			},
			arg:     id1,
			filter:  &repo.WorkspaceFilter{Readable: []accountdomain.WorkspaceID{accountdomain.NewWorkspaceID()}, Writable: []accountdomain.WorkspaceID{accountdomain.NewWorkspaceID()}},
			wantErr: rerror.ErrNotFound,
		},
		{
			name: "Filtered should work Found 2",
			seeds: project.List{
				p1,
				project.New().NewID().Workspace(accountdomain.NewWorkspaceID()).MustBuild(),
				project.New().NewID().Workspace(accountdomain.NewWorkspaceID()).MustBuild(),
			},
			arg:     id1,
			filter:  &repo.WorkspaceFilter{Readable: []accountdomain.WorkspaceID{}, Writable: []accountdomain.WorkspaceID{tid1}},
			wantErr: nil,
		},
	}

	initDB := mongotest.Connect(t)

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			client := mongox.NewClientWithDatabase(initDB(t))

			r := NewProject(client)
			ctx := context.Background()
			for _, p := range tc.seeds {
				err := r.Save(ctx, p)
				assert.NoError(t, err)
			}

			if tc.filter != nil {
				r = r.Filtered(*tc.filter)
			}

			err := r.Remove(ctx, tc.arg)
			if tc.wantErr != nil {
				assert.ErrorIs(t, err, tc.wantErr)
				return
			}
			assert.NoError(t, err)
			_, err = r.FindByID(ctx, tc.arg)
			assert.ErrorIs(t, err, rerror.ErrNotFound)
		})
	}
}

func Test_projectRepo_Save(t *testing.T) {
	tid1 := accountdomain.NewWorkspaceID()
	id1 := id.NewProjectID()
	p1 := project.New().ID(id1).Workspace(tid1).UpdatedAt(time.Now().Truncate(time.Millisecond).UTC()).MustBuild()
	tests := []struct {
		name    string
		seeds   project.List
		arg     *project.Project
		filter  *repo.WorkspaceFilter
		want    *project.Project
		wantErr error
	}{
		{
			name: "Saved",
			seeds: project.List{
				p1,
			},
			arg:     p1,
			filter:  nil,
			want:    p1,
			wantErr: nil,
		},
		{
			name: "Filtered should fail - Saved",
			seeds: project.List{
				p1,
			},
			arg:     p1,
			filter:  &repo.WorkspaceFilter{Readable: []accountdomain.WorkspaceID{}, Writable: []accountdomain.WorkspaceID{}},
			want:    nil,
			wantErr: repo.ErrOperationDenied,
		},
		{
			name: "Filtered should work - Saved",
			seeds: project.List{
				p1,
			},
			arg:     p1,
			filter:  &repo.WorkspaceFilter{Readable: []accountdomain.WorkspaceID{tid1}, Writable: []accountdomain.WorkspaceID{tid1}},
			want:    p1,
			wantErr: nil,
		},
		{
			name: "Filtered should work - Saved same data",
			seeds: project.List{
				p1,
			},
			arg:     p1,
			filter:  &repo.WorkspaceFilter{Readable: []accountdomain.WorkspaceID{}, Writable: []accountdomain.WorkspaceID{tid1}},
			want:    p1,
			wantErr: nil,
		},
	}

	initDB := mongotest.Connect(t)

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			// t.Parallel()

			client := mongox.NewClientWithDatabase(initDB(t))

			r := NewProject(client)
			if tc.filter != nil {
				r = r.Filtered(*tc.filter)
			}
			ctx := context.Background()
			for _, p := range tc.seeds {
				err := r.Save(ctx, p)
				if tc.wantErr != nil {
					assert.ErrorIs(t, err, tc.wantErr)
					return
				}
			}

			err := r.Save(ctx, tc.arg)
			if tc.wantErr != nil {
				assert.ErrorIs(t, err, tc.wantErr)
				return
			}

			got, err := r.CountByWorkspace(ctx, tc.arg.Workspace())
			assert.NoError(t, err)
			if tc.wantErr != nil {
				assert.Zero(t, got)
				return
			}
			assert.Equal(t, 1, got)
		})
	}
}

func TestProjectRepo_FindByPublicAPIToken(t *testing.T) {
	tid1 := accountdomain.NewWorkspaceID()
	id1 := id.NewProjectID()
	now := time.Now().Truncate(time.Millisecond).UTC()
	apiKey := project.NewAPIKeyBuilder().NewID().GenerateKey().Name("key1").Build()
	pub := project.NewPrivateAccessibility(*project.NewPublicationSettings(nil, false), project.APIKeys{apiKey})
	p1 := project.New().ID(id1).Workspace(tid1).Accessibility(pub).UpdatedAt(now).Topics([]string{}).MustBuild()
	tests := []struct {
		name    string
		seeds   project.List
		arg     string
		want    *project.Project
		wantErr error
	}{
		{
			name:    "Not found in empty db",
			seeds:   project.List{},
			arg:     apiKey.Key(),
			want:    nil,
			wantErr: rerror.ErrNotFound,
		},
		{
			name: "Not found",
			seeds: project.List{
				p1,
			},
			arg:     "xxx",
			want:    nil,
			wantErr: rerror.ErrNotFound,
		},
		{
			name: "Found 1",
			seeds: project.List{
				p1,
			},
			arg:     apiKey.Key(),
			want:    p1,
			wantErr: nil,
		},
		{
			name: "Project exists but not public",
			seeds: project.List{
				project.New().ID(id.NewProjectID()).Workspace(tid1).UpdatedAt(now).MustBuild(),
			},
			arg:     "some_token",
			want:    nil,
			wantErr: rerror.ErrNotFound,
		},
	}

	initDB := mongotest.Connect(t)

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			client := mongox.NewClientWithDatabase(initDB(t))

			r := NewProject(client)
			ctx := context.Background()
			for _, p := range tc.seeds {
				err := r.Save(ctx, p)
				assert.NoError(t, err)
			}

			got, err := r.FindByPublicAPIKey(ctx, tc.arg)
			if tc.wantErr != nil {
				assert.ErrorIs(t, err, tc.wantErr)
				return
			}
			assert.Equal(t, tc.want, got)
		})
	}
}

func Test_projectRepo_Search(t *testing.T) {
	now := time.Now().Truncate(time.Millisecond).UTC()
	tid1 := accountdomain.NewWorkspaceID()
	tid2 := accountdomain.NewWorkspaceID()

	// Projects with different properties for testing
	p1 := project.New().
		NewID().
		Name("Test Project Alpha").
		Description("A test project for searching").
		Alias("alpha-test").
		Topics([]string{"topic1", "abc"}).
		Workspace(tid1).
		UpdatedAt(now).
		Accessibility(project.NewAccessibility(project.VisibilityPublic, nil, nil)).
		MustBuild()

	p2 := project.New().
		NewID().
		Name("Beta Project").
		Description("Another project").
		Alias("beta-proj").
		Topics([]string{"topic2", "xyz"}).
		Workspace(tid1).
		UpdatedAt(now.Add(time.Hour)).
		Accessibility(project.NewAccessibility(project.VisibilityPrivate, nil, nil)).
		MustBuild()

	p3 := project.New().
		NewID().
		Name("Gamma Search Test").
		Description("Third project").
		Alias("gamma-123").
		Topics([]string{"abc"}).
		Workspace(tid2).
		UpdatedAt(now.Add(2 * time.Hour)).
		Accessibility(project.NewAccessibility(project.VisibilityPublic, nil, nil)).
		MustBuild()

	p4 := project.New().
		NewID().
		Name("Delta").
		Description("Contains keyword alpha in description").
		Alias("delta-one").
		Topics([]string{"topic1", "topic2", "xyz"}).
		Workspace(tid1).
		UpdatedAt(now.Add(3 * time.Hour)).
		Accessibility(project.NewAccessibility(project.VisibilityPublic, nil, nil)).
		MustBuild()

	type args struct {
		filter interfaces.ProjectFilter
	}
	tests := []struct {
		name     string
		seeds    project.List
		args     args
		wsFilter *repo.WorkspaceFilter
		want     project.List
		wantErr  error
	}{
		{
			name:  "empty database",
			seeds: project.List{},
			args: args{
				filter: interfaces.ProjectFilter{
					Pagination: usecasex.CursorPagination{First: lo.ToPtr(int64(10))}.Wrap(),
				},
			},
			want:    nil,
			wantErr: nil,
		},
		{
			name:  "find all projects in workspace",
			seeds: project.List{p1, p2, p3, p4},
			args: args{
				filter: interfaces.ProjectFilter{
					WorkspaceIds: &accountdomain.WorkspaceIDList{tid1},
					Pagination:   usecasex.CursorPagination{First: lo.ToPtr(int64(10))}.Wrap(),
				},
			},
			want:    project.List{p1, p2, p4},
			wantErr: nil,
		},
		{
			name:  "find projects in multiple workspaces",
			seeds: project.List{p1, p2, p3, p4},
			args: args{
				filter: interfaces.ProjectFilter{
					WorkspaceIds: &accountdomain.WorkspaceIDList{tid1, tid2},
					Pagination:   usecasex.CursorPagination{First: lo.ToPtr(int64(10))}.Wrap(),
				},
			},
			want:    project.List{p1, p2, p3, p4},
			wantErr: nil,
		},
		{
			name:  "filter by visibility public",
			seeds: project.List{p1, p2, p3, p4},
			args: args{
				filter: interfaces.ProjectFilter{
					Visibility: lo.ToPtr(project.VisibilityPublic),
					Pagination: usecasex.CursorPagination{First: lo.ToPtr(int64(10))}.Wrap(),
				},
			},
			want:    project.List{p1, p3, p4},
			wantErr: nil,
		},
		{
			name:  "filter by visibility private",
			seeds: project.List{p1, p2, p3, p4},
			args: args{
				filter: interfaces.ProjectFilter{
					Visibility: lo.ToPtr(project.VisibilityPrivate),
					Pagination: usecasex.CursorPagination{First: lo.ToPtr(int64(10))}.Wrap(),
				},
			},
			want:    project.List{p2},
			wantErr: nil,
		},
		{
			name:  "search by keyword in name",
			seeds: project.List{p1, p2, p3, p4},
			args: args{
				filter: interfaces.ProjectFilter{
					Keyword:    lo.ToPtr("Alpha"),
					Pagination: usecasex.CursorPagination{First: lo.ToPtr(int64(10))}.Wrap(),
				},
			},
			want:    project.List{p1, p4},
			wantErr: nil,
		},
		{
			name:  "search by keyword in alias",
			seeds: project.List{p1, p2, p3, p4},
			args: args{
				filter: interfaces.ProjectFilter{
					Keyword:    lo.ToPtr("beta"),
					Pagination: usecasex.CursorPagination{First: lo.ToPtr(int64(10))}.Wrap(),
				},
			},
			want:    project.List{p2},
			wantErr: nil,
		},
		{
			name:  "search by keyword in description",
			seeds: project.List{p1, p2, p3, p4},
			args: args{
				filter: interfaces.ProjectFilter{
					Keyword:    lo.ToPtr("searching"),
					Pagination: usecasex.CursorPagination{First: lo.ToPtr(int64(10))}.Wrap(),
				},
			},
			want:    project.List{p1},
			wantErr: nil,
		},
		{
			name:  "search by exact project ID",
			seeds: project.List{p1, p2, p3, p4},
			args: args{
				filter: interfaces.ProjectFilter{
					Keyword:    lo.ToPtr(p1.ID().String()),
					Pagination: usecasex.CursorPagination{First: lo.ToPtr(int64(10))}.Wrap(),
				},
			},
			want:    project.List{p1},
			wantErr: nil,
		},
		{
			name:  "search with case insensitive keyword",
			seeds: project.List{p1, p2, p3, p4},
			args: args{
				filter: interfaces.ProjectFilter{
					Keyword:    lo.ToPtr("GAMMA"),
					Pagination: usecasex.CursorPagination{First: lo.ToPtr(int64(10))}.Wrap(),
				},
			},
			want:    project.List{p3},
			wantErr: nil,
		},
		{
			name:  "search with no results",
			seeds: project.List{p1, p2, p3, p4},
			args: args{
				filter: interfaces.ProjectFilter{
					Keyword:    lo.ToPtr("nonexistent"),
					Pagination: usecasex.CursorPagination{First: lo.ToPtr(int64(10))}.Wrap(),
				},
			},
			want:    nil,
			wantErr: nil,
		},
		{
			name:  "combine workspace and visibility filters",
			seeds: project.List{p1, p2, p3, p4},
			args: args{
				filter: interfaces.ProjectFilter{
					WorkspaceIds: &accountdomain.WorkspaceIDList{tid1},
					Visibility:   lo.ToPtr(project.VisibilityPublic),
					Pagination:   usecasex.CursorPagination{First: lo.ToPtr(int64(10))}.Wrap(),
				},
			},
			want:    project.List{p1, p4},
			wantErr: nil,
		},
		{
			name:  "combine workspace and keyword filters",
			seeds: project.List{p1, p2, p3, p4},
			args: args{
				filter: interfaces.ProjectFilter{
					WorkspaceIds: &accountdomain.WorkspaceIDList{tid1},
					Keyword:      lo.ToPtr("project"),
					Pagination:   usecasex.CursorPagination{First: lo.ToPtr(int64(10))}.Wrap(),
				},
			},
			want:    project.List{p1, p2},
			wantErr: nil,
		},
		{
			name:  "pagination first 2",
			seeds: project.List{p1, p2, p3, p4},
			args: args{
				filter: interfaces.ProjectFilter{
					WorkspaceIds: &accountdomain.WorkspaceIDList{tid1},
					Pagination:   usecasex.CursorPagination{First: lo.ToPtr(int64(2))}.Wrap(),
				},
			},
			want:    project.List{p1, p2},
			wantErr: nil,
		},
		{
			name:  "pagination last 2",
			seeds: project.List{p1, p2, p3, p4},
			args: args{
				filter: interfaces.ProjectFilter{
					WorkspaceIds: &accountdomain.WorkspaceIDList{tid1},
					Pagination:   usecasex.CursorPagination{Last: lo.ToPtr(int64(2))}.Wrap(),
				},
			},
			want:    project.List{p2, p4},
			wantErr: nil,
		},
		{
			name:  "workspace filter readable",
			seeds: project.List{p1, p2, p3, p4},
			args: args{
				filter: interfaces.ProjectFilter{
					Pagination: usecasex.CursorPagination{First: lo.ToPtr(int64(10))}.Wrap(),
				},
			},
			wsFilter: &repo.WorkspaceFilter{
				Readable: accountdomain.WorkspaceIDList{tid1},
				Writable: accountdomain.WorkspaceIDList{},
			},
			want:    project.List{p1, p2, p4},
			wantErr: nil,
		},
		{
			name:  "workspace filter no access",
			seeds: project.List{p1, p2, p3, p4},
			args: args{
				filter: interfaces.ProjectFilter{
					Pagination: usecasex.CursorPagination{First: lo.ToPtr(int64(10))}.Wrap(),
				},
			},
			wsFilter: &repo.WorkspaceFilter{
				Readable: accountdomain.WorkspaceIDList{accountdomain.NewWorkspaceID()},
				Writable: accountdomain.WorkspaceIDList{},
			},
			want:    nil,
			wantErr: nil,
		},
		{
			name:  "empty keyword should return all",
			seeds: project.List{p1, p2, p3, p4},
			args: args{
				filter: interfaces.ProjectFilter{
					Keyword:    lo.ToPtr(""),
					Pagination: usecasex.CursorPagination{First: lo.ToPtr(int64(10))}.Wrap(),
				},
			},
			want:    project.List{p1, p2, p3, p4},
			wantErr: nil,
		},
		{
			name:  "sort by updated_at descending",
			seeds: project.List{p1, p2, p3, p4},
			args: args{
				filter: interfaces.ProjectFilter{
					WorkspaceIds: &accountdomain.WorkspaceIDList{tid1},
					Sort: &usecasex.Sort{
						Key:      "updatedAt",
						Reverted: true,
					},
					Pagination: usecasex.CursorPagination{First: lo.ToPtr(int64(10))}.Wrap(),
				},
			},
			want:    project.List{p4, p2, p1},
			wantErr: nil,
		},
		{
			name:  "search by topics filter single topic",
			seeds: project.List{p1, p2, p3, p4},
			args: args{
				filter: interfaces.ProjectFilter{
					Topics:     []string{"topic1"},
					Pagination: usecasex.CursorPagination{First: lo.ToPtr(int64(10))}.Wrap(),
				},
			},
			want:    project.List{p1, p4},
			wantErr: nil,
		},
		{
			name:  "search by topics filter multiple topics",
			seeds: project.List{p1, p2, p3, p4},
			args: args{
				filter: interfaces.ProjectFilter{
					Topics:     []string{"topic1", "topic2"},
					Pagination: usecasex.CursorPagination{First: lo.ToPtr(int64(10))}.Wrap(),
				},
			},
			want:    project.List{p4},
			wantErr: nil,
		},
		{
			name:  "search by topics with case sensitivity",
			seeds: project.List{p1, p2, p3, p4},
			args: args{
				filter: interfaces.ProjectFilter{
					Topics:     []string{"Topic1"},
					Pagination: usecasex.CursorPagination{First: lo.ToPtr(int64(10))}.Wrap(),
				},
			},
			want:    project.List{p1, p4},
			wantErr: nil,
		},
		{
			name:  "combine topics and workspace filters",
			seeds: project.List{p1, p2, p3, p4},
			args: args{
				filter: interfaces.ProjectFilter{
					WorkspaceIds: &accountdomain.WorkspaceIDList{tid1},
					Topics:       []string{"abc"},
					Pagination:   usecasex.CursorPagination{First: lo.ToPtr(int64(10))}.Wrap(),
				},
			},
			want:    project.List{p1},
			wantErr: nil,
		},
		{
			name:  "combine topics and keyword filters",
			seeds: project.List{p1, p2, p3, p4},
			args: args{
				filter: interfaces.ProjectFilter{
					Topics:     []string{"topic1"},
					Keyword:    lo.ToPtr("test"),
					Pagination: usecasex.CursorPagination{First: lo.ToPtr(int64(10))}.Wrap(),
				},
			},
			want:    project.List{p1},
			wantErr: nil,
		},
		{
			name:  "search by multiple topics requiring ALL to match",
			seeds: project.List{p1, p2, p3, p4},
			args: args{
				filter: interfaces.ProjectFilter{
					Topics:     []string{"topic1", "abc"},
					Pagination: usecasex.CursorPagination{First: lo.ToPtr(int64(10))}.Wrap(),
				},
			},
			want:    project.List{p1},
			wantErr: nil,
		},
		{
			name:  "search by multiple topics with no projects having all topics",
			seeds: project.List{p1, p2, p3, p4},
			args: args{
				filter: interfaces.ProjectFilter{
					Topics:     []string{"topic1", "nonexistent"},
					Pagination: usecasex.CursorPagination{First: lo.ToPtr(int64(10))}.Wrap(),
				},
			},
			want:    nil,
			wantErr: nil,
		},
		{
			name:  "search by three topics requiring ALL to match",
			seeds: project.List{p1, p2, p3, p4},
			args: args{
				filter: interfaces.ProjectFilter{
					Topics:     []string{"topic1", "topic2", "xyz"},
					Pagination: usecasex.CursorPagination{First: lo.ToPtr(int64(10))}.Wrap(),
				},
			},
			want:    project.List{p4},
			wantErr: nil,
		},
	}

	initDB := mongotest.Connect(t)

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			client := mongox.NewClientWithDatabase(initDB(t))

			r := NewProject(client)
			ctx := context.Background()
			for _, p := range tc.seeds {
				err := r.Save(ctx, p)
				assert.NoError(t, err)
			}

			if tc.wsFilter != nil {
				r = r.Filtered(*tc.wsFilter)
			}

			got, _, err := r.Search(ctx, tc.args.filter)
			if tc.wantErr != nil {
				assert.ErrorIs(t, err, tc.wantErr)
				return
			}

			assert.NoError(t, err)
			assert.Equal(t, len(tc.want), len(got))

			// Compare projects by ID since order might vary
			wantIDs := make(map[id.ProjectID]bool)
			for _, p := range tc.want {
				wantIDs[p.ID()] = true
			}
			gotIDs := make(map[id.ProjectID]bool)
			for _, p := range got {
				gotIDs[p.ID()] = true
			}
			assert.Equal(t, wantIDs, gotIDs)
		})
	}
}
