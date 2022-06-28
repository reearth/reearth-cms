package memory

import (
	"context"
	"testing"
	"time"

	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearth-cms/server/pkg/rerror"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestProjectRepo_CountByWorkspace(t *testing.T) {
	tid1 := id.NewWorkspaceID()
	tests := []struct {
		name    string
		seeds   []*project.Project
		arg     id.WorkspaceID
		filter  *repo.WorkspaceFilter
		want    int
		wantErr error
	}{
		{
			name:    "0 count in empty db",
			seeds:   []*project.Project{},
			arg:     id.NewWorkspaceID(),
			filter:  nil,
			want:    0,
			wantErr: nil,
		},
		{
			name: "0 count with project for another workspaces",
			seeds: []*project.Project{
				project.New().NewID().Workspace(id.NewWorkspaceID()).MustBuild(),
			},
			arg:     id.NewWorkspaceID(),
			filter:  nil,
			want:    0,
			wantErr: nil,
		},
		{
			name: "1 count with single project",
			seeds: []*project.Project{
				project.New().NewID().Workspace(tid1).MustBuild(),
			},
			arg:     tid1,
			filter:  nil,
			want:    1,
			wantErr: nil,
		},
		{
			name: "1 count with multi projects",
			seeds: []*project.Project{
				project.New().NewID().Workspace(tid1).MustBuild(),
				project.New().NewID().Workspace(id.NewWorkspaceID()).MustBuild(),
				project.New().NewID().Workspace(id.NewWorkspaceID()).MustBuild(),
			},
			arg:     tid1,
			filter:  nil,
			want:    1,
			wantErr: nil,
		},
		{
			name: "2 count with multi projects",
			seeds: []*project.Project{
				project.New().NewID().Workspace(tid1).MustBuild(),
				project.New().NewID().Workspace(tid1).MustBuild(),
				project.New().NewID().Workspace(id.NewWorkspaceID()).MustBuild(),
				project.New().NewID().Workspace(id.NewWorkspaceID()).MustBuild(),
			},
			arg:     tid1,
			filter:  nil,
			want:    2,
			wantErr: nil,
		},
		{
			name: "2 count with multi projects",
			seeds: []*project.Project{
				project.New().NewID().Workspace(tid1).MustBuild(),
				project.New().NewID().Workspace(tid1).MustBuild(),
				project.New().NewID().Workspace(id.NewWorkspaceID()).MustBuild(),
				project.New().NewID().Workspace(id.NewWorkspaceID()).MustBuild(),
			},
			arg:     tid1,
			filter:  &repo.WorkspaceFilter{Readable: []id.WorkspaceID{id.NewWorkspaceID()}, Writable: []id.WorkspaceID{}},
			want:    0,
			wantErr: nil,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			r := NewProject()
			ctx := context.Background()
			for _, p := range tc.seeds {
				err := r.Save(ctx, p)
				assert.Nil(t, err)
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
	now := time.Now().Truncate(time.Millisecond).UTC()
	tid1 := id.NewWorkspaceID()
	id1 := id.NewProjectID()
	id2 := id.NewProjectID()
	p1 := project.New().ID(id1).Workspace(tid1).UpdatedAt(now).MustBuild()
	p2 := project.New().ID(id2).Workspace(tid1).UpdatedAt(now).MustBuild()

	tests := []struct {
		name    string
		seeds   []*project.Project
		arg     repo.WorkspaceFilter
		wantErr error
	}{
		{
			name: "no r/w workspaces operation denied",
			seeds: []*project.Project{
				p1,
				p2,
			},
			arg: repo.WorkspaceFilter{
				Readable: []id.WorkspaceID{},
				Writable: []id.WorkspaceID{},
			},
			wantErr: repo.ErrOperationDenied,
		},
		{
			name: "r/w workspaces operation success",
			seeds: []*project.Project{
				p1,
				p2,
			},
			arg: repo.WorkspaceFilter{
				Readable: []id.WorkspaceID{tid1},
				Writable: []id.WorkspaceID{tid1},
			},
			wantErr: nil,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			r := NewProject().Filtered(tc.arg)
			ctx := context.Background()
			for _, p := range tc.seeds {
				err := r.Save(ctx, p)
				assert.ErrorIs(t, err, tc.wantErr)
			}
		})
	}
}

func TestProjectRepo_FindByID(t *testing.T) {
	tid1 := id.NewWorkspaceID()
	id1 := id.NewProjectID()
	now := time.Now().Truncate(time.Millisecond).UTC()
	p1 := project.New().ID(id1).Workspace(tid1).UpdatedAt(now).MustBuild()
	tests := []struct {
		name    string
		seeds   []*project.Project
		arg     id.ProjectID
		filter  *repo.WorkspaceFilter
		want    *project.Project
		wantErr error
	}{
		{
			name:    "Not found in empty db",
			seeds:   []*project.Project{},
			arg:     id.NewProjectID(),
			filter:  nil,
			want:    nil,
			wantErr: rerror.ErrNotFound,
		},
		{
			name: "Not found",
			seeds: []*project.Project{
				project.New().NewID().MustBuild(),
			},
			arg:     id.NewProjectID(),
			filter:  nil,
			want:    nil,
			wantErr: rerror.ErrNotFound,
		},
		{
			name: "Found 1",
			seeds: []*project.Project{
				p1,
			},
			arg:     id1,
			filter:  nil,
			want:    p1,
			wantErr: nil,
		},
		{
			name: "Found 2",
			seeds: []*project.Project{
				p1,
				project.New().NewID().Workspace(id.NewWorkspaceID()).MustBuild(),
				project.New().NewID().Workspace(id.NewWorkspaceID()).MustBuild(),
			},
			arg:     id1,
			filter:  nil,
			want:    p1,
			wantErr: nil,
		},
		{
			name: "Filtered Found 0",
			seeds: []*project.Project{
				p1,
				project.New().NewID().Workspace(id.NewWorkspaceID()).MustBuild(),
				project.New().NewID().Workspace(id.NewWorkspaceID()).MustBuild(),
			},
			arg:     id1,
			filter:  &repo.WorkspaceFilter{Readable: []id.WorkspaceID{id.NewWorkspaceID()}, Writable: []id.WorkspaceID{}},
			want:    nil,
			wantErr: nil,
		},
		{
			name: "Filtered Found 2",
			seeds: []*project.Project{
				p1,
				project.New().NewID().Workspace(id.NewWorkspaceID()).MustBuild(),
				project.New().NewID().Workspace(id.NewWorkspaceID()).MustBuild(),
			},
			arg:     id1,
			filter:  &repo.WorkspaceFilter{Readable: []id.WorkspaceID{tid1}, Writable: []id.WorkspaceID{}},
			want:    p1,
			wantErr: nil,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			r := NewProject()
			ctx := context.Background()
			for _, p := range tc.seeds {
				err := r.Save(ctx, p)
				assert.Nil(t, err)
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
	now := time.Now().Truncate(time.Millisecond).UTC()
	tid1 := id.NewWorkspaceID()
	id1 := id.NewProjectID()
	id2 := id.NewProjectID()
	p1 := project.New().ID(id1).Workspace(tid1).UpdatedAt(now).MustBuild()
	p2 := project.New().ID(id2).Workspace(tid1).UpdatedAt(now).MustBuild()

	tests := []struct {
		name    string
		seeds   []*project.Project
		arg     id.ProjectIDList
		filter  *repo.WorkspaceFilter
		want    []*project.Project
		wantErr error
	}{
		{
			name:    "0 count in empty db",
			seeds:   []*project.Project{},
			arg:     []id.ProjectID{},
			filter:  nil,
			want:    nil,
			wantErr: nil,
		},
		{
			name: "0 count with project for another workspaces",
			seeds: []*project.Project{
				project.New().NewID().Workspace(id.NewWorkspaceID()).MustBuild(),
			},
			arg:     []id.ProjectID{},
			filter:  nil,
			want:    nil,
			wantErr: nil,
		},
		{
			name: "1 count with single project",
			seeds: []*project.Project{
				p1,
			},
			arg:     []id.ProjectID{id1},
			filter:  nil,
			want:    []*project.Project{p1},
			wantErr: nil,
		},
		{
			name: "1 count with multi projects",
			seeds: []*project.Project{
				p1,
				project.New().NewID().Workspace(id.NewWorkspaceID()).MustBuild(),
				project.New().NewID().Workspace(id.NewWorkspaceID()).MustBuild(),
			},
			arg:     []id.ProjectID{id1},
			filter:  nil,
			want:    []*project.Project{p1},
			wantErr: nil,
		},
		{
			name: "2 count with multi projects",
			seeds: []*project.Project{
				p1,
				p2,
				project.New().NewID().Workspace(id.NewWorkspaceID()).MustBuild(),
				project.New().NewID().Workspace(id.NewWorkspaceID()).MustBuild(),
			},
			arg:     []id.ProjectID{id1, id2},
			filter:  nil,
			want:    []*project.Project{p1, p2},
			wantErr: nil,
		},
		{
			name: "Filter 2 count with multi projects",
			seeds: []*project.Project{
				p1,
				p2,
				project.New().NewID().Workspace(id.NewWorkspaceID()).MustBuild(),
				project.New().NewID().Workspace(id.NewWorkspaceID()).MustBuild(),
			},
			arg:     []id.ProjectID{id1, id2},
			filter:  &repo.WorkspaceFilter{Readable: []id.WorkspaceID{id.NewWorkspaceID()}, Writable: []id.WorkspaceID{}},
			want:    nil,
			wantErr: nil,
		},
		{
			name: "Filter 2 count with multi projects",
			seeds: []*project.Project{
				p1,
				p2,
				project.New().NewID().Workspace(id.NewWorkspaceID()).MustBuild(),
				project.New().NewID().Workspace(id.NewWorkspaceID()).MustBuild(),
			},
			arg:     []id.ProjectID{id1, id2},
			filter:  &repo.WorkspaceFilter{Readable: []id.WorkspaceID{tid1}, Writable: []id.WorkspaceID{}},
			want:    []*project.Project{p1, p2},
			wantErr: nil,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			r := NewProject()
			ctx := context.Background()
			for _, p := range tc.seeds {
				err := r.Save(ctx, p)
				assert.Nil(t, err)
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

func TestProjectRepo_FindByPublicName(t *testing.T) {
	now := time.Now().Truncate(time.Millisecond).UTC()
	tid1 := id.NewWorkspaceID()
	id1 := id.NewProjectID()
	p1 := project.New().
		ID(id1).
		Workspace(tid1).
		Alias("xyz123").
		UpdatedAt(now).
		MustBuild()

	id2 := id.NewProjectID()
	p2 := project.New().
		ID(id2).
		Workspace(id.NewWorkspaceID()).
		Alias("xyz321").
		UpdatedAt(now).
		MustBuild()

	tests := []struct {
		name    string
		seeds   []*project.Project
		arg     string
		filter  *repo.WorkspaceFilter
		want    *project.Project
		wantErr error
	}{
		{
			name:    "Not found in empty db",
			seeds:   []*project.Project{},
			arg:     "xyz123",
			filter:  nil,
			want:    nil,
			wantErr: rerror.ErrNotFound,
		},
		{
			name: "Not found",
			seeds: []*project.Project{
				project.New().NewID().Alias("abc123").MustBuild(),
			},
			arg:     "xyz123",
			filter:  nil,
			want:    nil,
			wantErr: rerror.ErrNotFound,
		},
		{
			name: "public Found",
			seeds: []*project.Project{
				p1,
			},
			arg:     "xyz123",
			filter:  nil,
			want:    p1,
			wantErr: nil,
		},
		{
			name: "linited Found",
			seeds: []*project.Project{
				p2,
			},
			arg:     "xyz321",
			want:    p2,
			filter:  nil,
			wantErr: nil,
		},
		{
			name: "Found 2",
			seeds: []*project.Project{
				p1,
				project.New().NewID().Workspace(id.NewWorkspaceID()).MustBuild(),
				project.New().NewID().Workspace(id.NewWorkspaceID()).MustBuild(),
			},
			arg:     "xyz123",
			filter:  nil,
			want:    p1,
			wantErr: nil,
		},
		{
			name: "Filtered should not Found",
			seeds: []*project.Project{
				p1,
				project.New().NewID().Workspace(id.NewWorkspaceID()).MustBuild(),
				project.New().NewID().Workspace(id.NewWorkspaceID()).MustBuild(),
			},
			arg:     "xyz123",
			filter:  &repo.WorkspaceFilter{Readable: []id.WorkspaceID{id.NewWorkspaceID()}, Writable: []id.WorkspaceID{}},
			want:    nil,
			wantErr: rerror.ErrNotFound,
		},
		{
			name: "Filtered should Found",
			seeds: []*project.Project{
				p1,
				project.New().NewID().Workspace(id.NewWorkspaceID()).MustBuild(),
				project.New().NewID().Workspace(id.NewWorkspaceID()).MustBuild(),
			},
			arg:     "xyz123",
			filter:  &repo.WorkspaceFilter{Readable: []id.WorkspaceID{tid1}, Writable: []id.WorkspaceID{}},
			want:    p1,
			wantErr: nil,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			r := NewProject()
			ctx := context.Background()
			for _, p := range tc.seeds {
				err := r.Save(ctx, p)
				assert.Nil(t, err)
			}

			if tc.filter != nil {
				r = r.Filtered(*tc.filter)
			}

			got, err := r.FindByPublicName(ctx, tc.arg)
			if tc.wantErr != nil {
				assert.ErrorIs(t, err, tc.wantErr)
				return
			}
			assert.Nil(t, err)
			assert.Equal(t, tc.want, got)
		})
	}
}

func TestProjectRepo_FindByWorkspace(t *testing.T) {
	now := time.Now().Truncate(time.Millisecond).UTC()
	tid1 := id.NewWorkspaceID()
	p1 := project.New().NewID().Workspace(tid1).UpdatedAt(now).MustBuild()
	p2 := project.New().NewID().Workspace(tid1).UpdatedAt(now).MustBuild()

	type args struct {
		tid   id.WorkspaceID
		pInfo *usecase.Pagination
	}
	tests := []struct {
		name    string
		seeds   []*project.Project
		args    args
		filter  *repo.WorkspaceFilter
		want    []*project.Project
		wantErr error
	}{
		{
			name:    "0 count in empty db",
			seeds:   []*project.Project{},
			args:    args{id.NewWorkspaceID(), nil},
			filter:  nil,
			want:    nil,
			wantErr: nil,
		},
		{
			name: "0 count with project for another workspaces",
			seeds: []*project.Project{
				project.New().NewID().Workspace(id.NewWorkspaceID()).MustBuild(),
			},
			args:    args{id.NewWorkspaceID(), nil},
			filter:  nil,
			want:    nil,
			wantErr: nil,
		},
		{
			name: "1 count with single project",
			seeds: []*project.Project{
				p1,
			},
			args:    args{tid1, usecase.NewPagination(lo.ToPtr(1), nil, nil, nil)},
			filter:  nil,
			want:    []*project.Project{p1},
			wantErr: nil,
		},
		{
			name: "1 count with multi projects",
			seeds: []*project.Project{
				p1,
				project.New().NewID().Workspace(id.NewWorkspaceID()).MustBuild(),
				project.New().NewID().Workspace(id.NewWorkspaceID()).MustBuild(),
			},
			args:    args{tid1, usecase.NewPagination(lo.ToPtr(1), nil, nil, nil)},
			filter:  nil,
			want:    []*project.Project{p1},
			wantErr: nil,
		},
		{
			name: "2 count with multi projects",
			seeds: []*project.Project{
				p1,
				p2,
				project.New().NewID().Workspace(id.NewWorkspaceID()).MustBuild(),
				project.New().NewID().Workspace(id.NewWorkspaceID()).MustBuild(),
			},
			args:    args{tid1, usecase.NewPagination(lo.ToPtr(2), nil, nil, nil)},
			filter:  nil,
			want:    []*project.Project{p1, p2},
			wantErr: nil,
		},
		{
			name: "get 1st page of 2",
			seeds: []*project.Project{
				p1,
				p2,
				project.New().NewID().Workspace(id.NewWorkspaceID()).MustBuild(),
				project.New().NewID().Workspace(id.NewWorkspaceID()).MustBuild(),
			},
			args:    args{tid1, usecase.NewPagination(lo.ToPtr(1), nil, nil, nil)},
			filter:  nil,
			want:    []*project.Project{p1, p2},
			wantErr: nil,
		},
		{
			name: "get last page of 2",
			seeds: []*project.Project{
				p1,
				p2,
				project.New().NewID().Workspace(id.NewWorkspaceID()).MustBuild(),
				project.New().NewID().Workspace(id.NewWorkspaceID()).MustBuild(),
			},
			args:    args{tid1, usecase.NewPagination(nil, lo.ToPtr(1), nil, nil)},
			filter:  nil,
			want:    []*project.Project{p1, p2},
			wantErr: nil,
		},
		{
			name: "Filtered sholud not 1 count with multi projects",
			seeds: []*project.Project{
				p1,
				project.New().NewID().Workspace(id.NewWorkspaceID()).MustBuild(),
				project.New().NewID().Workspace(id.NewWorkspaceID()).MustBuild(),
			},
			args:    args{tid1, usecase.NewPagination(lo.ToPtr(1), nil, nil, nil)},
			filter:  &repo.WorkspaceFilter{Readable: []id.WorkspaceID{id.NewWorkspaceID()}, Writable: []id.WorkspaceID{}},
			want:    nil,
			wantErr: nil,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			// t.Parallel()

			r := NewProject()
			ctx := context.Background()
			for _, p := range tc.seeds {
				err := r.Save(ctx, p)
				assert.Nil(t, err)
			}

			if tc.filter != nil {
				r = r.Filtered(*tc.filter)
			}

			got, _, err := r.FindByWorkspace(ctx, tc.args.tid, tc.args.pInfo)
			if tc.wantErr != nil {
				assert.ErrorIs(t, err, tc.wantErr)
				return
			}

			assert.Equal(t, tc.want, got)
		})
	}
}

func TestProjectRepo_Remove(t *testing.T) {
	tid1 := id.NewWorkspaceID()
	id1 := id.NewProjectID()
	p1 := project.New().ID(id1).Workspace(tid1).MustBuild()
	tests := []struct {
		name    string
		seeds   []*project.Project
		arg     id.ProjectID
		filter  *repo.WorkspaceFilter
		wantErr error
	}{
		{
			name:    "Not found in empty db",
			seeds:   []*project.Project{},
			arg:     id.NewProjectID(),
			filter:  nil,
			wantErr: rerror.ErrNotFound,
		},
		{
			name: "Not found",
			seeds: []*project.Project{
				project.New().NewID().MustBuild(),
			},
			arg:     id.NewProjectID(),
			filter:  nil,
			wantErr: rerror.ErrNotFound,
		},
		{
			name: "Found 1",
			seeds: []*project.Project{
				p1,
			},
			arg:     id1,
			filter:  nil,
			wantErr: nil,
		},
		{
			name: "Found 2",
			seeds: []*project.Project{
				p1,
				project.New().NewID().Workspace(id.NewWorkspaceID()).MustBuild(),
				project.New().NewID().Workspace(id.NewWorkspaceID()).MustBuild(),
			},
			arg:     id1,
			filter:  nil,
			wantErr: nil,
		},
		{
			name: "Filtered should fail Found 2",
			seeds: []*project.Project{
				p1,
				project.New().NewID().Workspace(id.NewWorkspaceID()).MustBuild(),
				project.New().NewID().Workspace(id.NewWorkspaceID()).MustBuild(),
			},
			arg:     id1,
			filter:  &repo.WorkspaceFilter{Readable: []id.WorkspaceID{id.NewWorkspaceID()}, Writable: []id.WorkspaceID{id.NewWorkspaceID()}},
			wantErr: rerror.ErrNotFound,
		},
		{
			name: "Filtered should work Found 2",
			seeds: []*project.Project{
				p1,
				project.New().NewID().Workspace(id.NewWorkspaceID()).MustBuild(),
				project.New().NewID().Workspace(id.NewWorkspaceID()).MustBuild(),
			},
			arg:     id1,
			filter:  &repo.WorkspaceFilter{Readable: []id.WorkspaceID{}, Writable: []id.WorkspaceID{tid1}},
			wantErr: nil,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			r := NewProject()
			ctx := context.Background()
			for _, p := range tc.seeds {
				err := r.Save(ctx, p)
				assert.Nil(t, err)
			}

			if tc.filter != nil {
				r = r.Filtered(*tc.filter)
			}

			err := r.Remove(ctx, tc.arg)
			if tc.wantErr != nil {
				assert.ErrorIs(t, err, tc.wantErr)
				return
			}
			assert.Nil(t, err)
			_, err = r.FindByID(ctx, tc.arg)
			assert.ErrorIs(t, err, rerror.ErrNotFound)
		})
	}
}

func TestProjectRepo_Save(t *testing.T) {
	tid1 := id.NewWorkspaceID()
	id1 := id.NewProjectID()
	p1 := project.New().ID(id1).Workspace(tid1).UpdatedAt(time.Now().Truncate(time.Millisecond).UTC()).MustBuild()
	tests := []struct {
		name    string
		seeds   []*project.Project
		arg     *project.Project
		filter  *repo.WorkspaceFilter
		want    *project.Project
		wantErr error
	}{
		{
			name: "Saved",
			seeds: []*project.Project{
				p1,
			},
			arg:     p1,
			filter:  nil,
			want:    p1,
			wantErr: nil,
		},
		{
			name: "Filtered should fail - Saved",
			seeds: []*project.Project{
				p1,
			},
			arg:     p1,
			filter:  &repo.WorkspaceFilter{Readable: []id.WorkspaceID{}, Writable: []id.WorkspaceID{}},
			want:    nil,
			wantErr: repo.ErrOperationDenied,
		},
		{
			name: "Filtered should work - Saved",
			seeds: []*project.Project{
				p1,
			},
			arg:     p1,
			filter:  &repo.WorkspaceFilter{Readable: []id.WorkspaceID{tid1}, Writable: []id.WorkspaceID{tid1}},
			want:    p1,
			wantErr: nil,
		},
		{
			name: "Filtered should work - Saved same data",
			seeds: []*project.Project{
				p1,
			},
			arg:     p1,
			filter:  &repo.WorkspaceFilter{Readable: []id.WorkspaceID{}, Writable: []id.WorkspaceID{tid1}},
			want:    p1,
			wantErr: nil,
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
