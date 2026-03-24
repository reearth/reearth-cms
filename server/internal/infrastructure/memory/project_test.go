package memory

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"

	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/usecasex"
)

func TestProjectRepo_CountByWorkspace(t *testing.T) {
	tid1 := accountdomain.NewWorkspaceID()
	tests := []struct {
		name    string
		seeds   project.List
		arg     accountdomain.WorkspaceID
		filter  *repo.WorkspaceFilter
		want    int
		wantErr error
		mockErr bool
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
			want:    0,
			wantErr: nil,
		},
		{
			name:    "must mock error",
			wantErr: errors.New("test"),
			mockErr: true,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			r := NewProject()
			if tc.mockErr {
				SetProjectError(r, tc.wantErr)
			}
			ctx := context.Background()
			for _, p := range tc.seeds {
				err := r.Save(ctx, p.Clone())
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

func TestProjectRepo_Filtered(t *testing.T) {
	tid1 := accountdomain.NewWorkspaceID()
	id1 := id.NewProjectID()
	id2 := id.NewProjectID()
	p1 := project.New().ID(id1).Workspace(tid1).UpdatedAt(time.Now()).MustBuild()
	p2 := project.New().ID(id2).Workspace(tid1).MustBuild()

	tests := []struct {
		name    string
		seeds   project.List
		arg     repo.WorkspaceFilter
		wantErr error
		mockErr bool
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
		{
			name:    "must mock error",
			wantErr: errors.New("test"),
			mockErr: true,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			r := NewProject().Filtered(tc.arg)
			if tc.mockErr {
				SetProjectError(r, tc.wantErr)
			}

			ctx := context.Background()
			for _, p := range tc.seeds {
				err := r.Save(ctx, p.Clone())
				assert.ErrorIs(t, err, tc.wantErr)
			}
		})
	}
}

func TestProjectRepo_FindByID(t *testing.T) {
	tid1 := accountdomain.NewWorkspaceID()
	id1 := id.NewProjectID()
	p1 := project.New().ID(id1).Workspace(tid1).MustBuild()

	tests := []struct {
		name    string
		seeds   project.List
		arg     id.ProjectID
		filter  *repo.WorkspaceFilter
		want    *project.Project
		wantErr error
		mockErr bool
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
		{
			name:    "must mock error",
			wantErr: errors.New("test"),
			mockErr: true,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			r := NewProject()
			if tc.mockErr {
				SetProjectError(r, tc.wantErr)
			}
			ctx := context.Background()
			for _, p := range tc.seeds {
				err := r.Save(ctx, p.Clone())
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

func TestProjectRepo_FindByIDs(t *testing.T) {
	tid1 := accountdomain.NewWorkspaceID()
	id1 := id.NewProjectID()
	id2 := id.NewProjectID()
	p1 := project.New().ID(id1).Workspace(tid1).UpdatedAt(time.Now().Add(-time.Hour)).MustBuild()
	p2 := project.New().ID(id2).Workspace(tid1).MustBuild()

	tests := []struct {
		name    string
		seeds   project.List
		arg     id.ProjectIDList
		filter  *repo.WorkspaceFilter
		want    project.List
		wantErr error
		mockErr bool
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
			want:    nil,
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
		{
			name:    "must mock error",
			wantErr: errors.New("test"),
			mockErr: true,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			r := NewProject()
			if tc.mockErr {
				SetProjectError(r, tc.wantErr)
			}
			ctx := context.Background()
			for _, p := range tc.seeds {
				err := r.Save(ctx, p.Clone())
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

func TestProjectRepo_IsAliasAvailable(t *testing.T) {
	wId1 := accountdomain.NewWorkspaceID()
	pId1 := id.NewProjectID()
	p1 := project.New().
		ID(pId1).
		Workspace(wId1).
		Alias("xyz123").
		UpdatedAt(time.Now().Add(-time.Hour)).
		MustBuild()

	wId2 := accountdomain.NewWorkspaceID()
	pId2 := id.NewProjectID()
	p2 := project.New().
		ID(pId2).
		Workspace(wId2).
		Alias("xyz321").
		MustBuild()

	tests := []struct {
		name    string
		seeds   project.List
		wId     accountdomain.WorkspaceID
		arg     string
		filter  *repo.WorkspaceFilter
		want    bool
		wantErr error
		mockErr bool
	}{
		{
			name:    "available in empty db",
			seeds:   project.List{},
			arg:     "xyz123",
			filter:  nil,
			want:    true,
			wantErr: nil,
		},
		{
			name: "available with different workspace & alias",
			seeds: project.List{
				project.New().NewID().Workspace(accountdomain.NewWorkspaceID()).Alias("abc123").MustBuild(),
			},
			wId:     accountdomain.NewWorkspaceID(),
			arg:     "xyz123",
			filter:  nil,
			want:    true,
			wantErr: nil,
		},
		{
			name: "available with same alias but different workspace",
			seeds: project.List{
				p1,
			},
			wId:     accountdomain.NewWorkspaceID(),
			arg:     "xyz123",
			filter:  nil,
			want:    true,
			wantErr: nil,
		},
		{
			name: "not available with same workspace & alias",
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
			name: "not available with same workspace & alias 2",
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
			name: "not available with multi projects containing same workspace & alias",
			seeds: project.List{
				p1,
				project.New().NewID().Workspace(accountdomain.NewWorkspaceID()).MustBuild(),
				project.New().NewID().Workspace(accountdomain.NewWorkspaceID()).MustBuild(),
			},
			wId:     wId1,
			arg:     "xyz123",
			filter:  nil,
			want:    false,
			wantErr: nil,
		},
		{
			name: "not available with multi projects containing same workspace & alias 3 (even if repo filter is applied)",
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
			name: "not available with multi projects containing same workspace & alias 4 (with correct repo filter)",
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
		{
			name:    "must mock error",
			wantErr: errors.New("test"),
			mockErr: true,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			r := NewProject()
			if tc.mockErr {
				SetProjectError(r, tc.wantErr)
			}
			ctx := context.Background()
			for _, p := range tc.seeds {
				err := r.Save(ctx, p.Clone())
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

func TestProjectRepo_FindByWorkspaces(t *testing.T) {
	tid1 := accountdomain.NewWorkspaceID()
	p1 := project.New().NewID().Workspace(tid1).UpdatedAt(time.Now().Add(-time.Hour)).MustBuild()
	p2 := project.New().NewID().Workspace(tid1).MustBuild()

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
		mockErr bool
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
			want:    project.List{p1, p2},
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
			want:    project.List{p1, p2},
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
			filter:  &repo.WorkspaceFilter{Readable: []accountdomain.WorkspaceID{accountdomain.NewWorkspaceID()}, Writable: []accountdomain.WorkspaceID{}},
			want:    nil,
			wantErr: nil,
		},
		{
			name:    "must mock error",
			wantErr: errors.New("test"),
			mockErr: true,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			r := NewProject()
			if tc.mockErr {
				SetProjectError(r, tc.wantErr)
			}
			ctx := context.Background()
			for _, p := range tc.seeds {
				err := r.Save(ctx, p.Clone())
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

func TestProjectRepo_Remove(t *testing.T) {
	tid1 := accountdomain.NewWorkspaceID()
	id1 := id.NewProjectID()
	p1 := project.New().ID(id1).Workspace(tid1).MustBuild()
	tests := []struct {
		name    string
		seeds   project.List
		arg     id.ProjectID
		filter  *repo.WorkspaceFilter
		wantErr error
		mockErr bool
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
		{
			name:    "must mock error",
			wantErr: errors.New("test"),
			mockErr: true,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			r := NewProject()
			if tc.mockErr {
				SetProjectError(r, tc.wantErr)
			}
			ctx := context.Background()
			for _, p := range tc.seeds {
				err := r.Save(ctx, p.Clone())
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

func TestProjectRepo_Save(t *testing.T) {
	tid1 := accountdomain.NewWorkspaceID()
	id1 := id.NewProjectID()
	p1 := project.New().ID(id1).Workspace(tid1).UpdatedAt(time.Now().Add(-time.Hour)).MustBuild()

	tests := []struct {
		name    string
		seeds   project.List
		arg     *project.Project
		filter  *repo.WorkspaceFilter
		want    *project.Project
		wantErr error
		mockErr bool
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
		{
			name:    "must mock error",
			wantErr: errors.New("test"),
			mockErr: true,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			r := NewProject()
			if tc.filter != nil {
				r = r.Filtered(*tc.filter)
			}
			if tc.mockErr {
				SetProjectError(r, tc.wantErr)
			}
			ctx := context.Background()
			for _, p := range tc.seeds {
				err := r.Save(ctx, p.Clone())
				if tc.wantErr != nil {
					assert.ErrorIs(t, err, tc.wantErr)
					return
				}
			}

			err := r.Save(ctx, tc.arg.Clone())
			if tc.wantErr != nil {
				assert.ErrorIs(t, err, tc.wantErr)
				return
			}

			got, err := r.CountByWorkspace(ctx, tc.arg.Workspace())
			if tc.wantErr != nil {
				assert.Zero(t, got)
				assert.Equal(t, tc.wantErr, err)
				return
			}
			assert.NoError(t, err)
			assert.Equal(t, 1, got)
		})
	}
}

func TestProject_FindByAPIKey(t *testing.T) {
	tid1 := accountdomain.NewWorkspaceID()
	id1 := id.NewProjectID()
	apikey := project.NewAPIKeyBuilder().NewID().GenerateKey().Name("key1").Build()
	pub := project.NewPrivateAccessibility(*project.NewPublicationSettings(nil, false), project.APIKeys{apikey})
	p1 := project.New().
		ID(id1).
		Workspace(tid1).
		Accessibility(pub).
		MustBuild()

	tests := []struct {
		name    string
		seeds   project.List
		arg     string
		want    *project.Project
		wantErr error
		mockErr bool
	}{
		{
			name:    "Not found in empty db",
			seeds:   project.List{},
			arg:     "xyz123",
			want:    nil,
			wantErr: rerror.ErrNotFound,
		},
		{
			name: "Not found",
			seeds: project.List{
				p1,
			},
			arg:     "",
			want:    nil,
			wantErr: rerror.ErrNotFound,
		},
		{
			name: "Found 1",
			seeds: project.List{
				p1,
			},
			arg:     apikey.Key(),
			want:    p1,
			wantErr: nil,
		},
		{
			name:    "must mock error",
			wantErr: errors.New("test"),
			mockErr: true,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			r := NewProject()
			if tc.mockErr {
				SetProjectError(r, tc.wantErr)
			}
			ctx := context.Background()
			for _, p := range tc.seeds {
				err := r.Save(ctx, p.Clone())
				assert.NoError(t, err)
			}

			got, err := r.FindByPublicAPIKey(ctx, tc.arg)
			if tc.wantErr != nil {
				assert.ErrorIs(t, err, tc.wantErr)
				return
			}
			assert.NoError(t, err)
			assert.Equal(t, tc.want, got)
		})
	}
}
