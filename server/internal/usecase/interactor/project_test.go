package interactor

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/reearth/reearth-cms/server/internal/infrastructure/memory"
	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearth-cms/server/pkg/rerror"
	"github.com/reearth/reearth-cms/server/pkg/user"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestProject_Fetch(t *testing.T) {
	mocktime := time.Now()
	wid1 := id.NewWorkspaceID()
	wid2 := id.NewWorkspaceID()

	pid1 := id.NewProjectID()
	p1 := project.New().ID(pid1).Workspace(wid1).UpdatedAt(mocktime).MustBuild()

	pid2 := id.NewProjectID()
	p2 := project.New().ID(pid2).Workspace(wid2).UpdatedAt(mocktime).MustBuild()

	u := user.New().NewID().Email("aaa@bbb.com").Workspace(wid1).MustBuild()
	op := &usecase.Operator{
		User:               u.ID(),
		ReadableWorkspaces: []id.WorkspaceID{wid1, wid2},
	}

	type args struct {
		ids      []id.ProjectID
		operator *usecase.Operator
	}
	tests := []struct {
		name           string
		seeds          project.List
		args           args
		want           project.List
		mockProjectErr bool
		wantErr        error
	}{
		{
			name:  "Fetch 1 of 2",
			seeds: project.List{p1, p2},
			args: args{
				ids:      []id.ProjectID{pid1},
				operator: op,
			},
			want:    project.List{p1},
			wantErr: nil,
		},
		{
			name:  "Fetch 2 of 2",
			seeds: project.List{p1, p2},
			args: args{
				ids:      []id.ProjectID{pid1, pid2},
				operator: op,
			},
			want:    project.List{p1, p2},
			wantErr: nil,
		},
		{
			name:  "Fetch 1 of 0",
			seeds: project.List{},
			args: args{
				ids:      []id.ProjectID{pid1},
				operator: op,
			},
			want:    nil,
			wantErr: nil,
		},
		{
			name:  "Fetch 2 of 0",
			seeds: project.List{},
			args: args{
				ids:      []id.ProjectID{pid1, pid2},
				operator: op,
			},
			want:    nil,
			wantErr: nil,
		},
		{
			name:  "Fetch 1 with out operator",
			seeds: project.List{p1, p2},
			args: args{
				ids:      []id.ProjectID{pid1},
				operator: &usecase.Operator{User: u.ID()},
			},
			want:    nil,
			wantErr: interfaces.ErrOperationDenied,
		},
		{
			name:           "mock error",
			wantErr:        errors.New("test"),
			mockProjectErr: true,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			ctx := context.Background()
			db := memory.New()
			if tc.mockProjectErr {
				memory.SetProjectError(db.Project, tc.wantErr)
			}
			defer memory.MockNow(db, mocktime)()
			for _, p := range tc.seeds {
				err := db.Project.Save(ctx, p.Clone())
				assert.Nil(t, err)
			}
			projectUC := NewProject(db)

			got, err := projectUC.Fetch(ctx, tc.args.ids, tc.args.operator)
			if tc.wantErr != nil {
				assert.Equal(t, tc.wantErr, err)
				return
			}
			assert.NoError(t, err)
			assert.Equal(t, tc.want, got)
		})
	}
}

func TestProject_FindByWorkspace(t *testing.T) {
	mocktime := time.Now()
	wid1 := id.NewWorkspaceID()
	wid2 := id.NewWorkspaceID()

	pid1 := id.NewProjectID()
	p1 := project.New().ID(pid1).Workspace(wid1).UpdatedAt(mocktime).MustBuild()

	pid2 := id.NewProjectID()
	p2 := project.New().ID(pid2).Workspace(wid2).UpdatedAt(mocktime).MustBuild()

	u := user.New().NewID().Email("aaa@bbb.com").Workspace(wid1).MustBuild()
	op := &usecase.Operator{
		User:               u.ID(),
		ReadableWorkspaces: []id.WorkspaceID{wid1, wid2},
	}

	type args struct {
		ids      []id.ProjectID
		operator *usecase.Operator
	}
	tests := []struct {
		name           string
		seeds          project.List
		args           args
		want           project.List
		mockProjectErr bool
		wantErr        error
	}{
		{
			name:  "Fetch 1 of 2",
			seeds: project.List{p1, p2},
			args: args{
				ids:      []id.ProjectID{pid1},
				operator: op,
			},
			want:    project.List{p1},
			wantErr: nil,
		},
		{
			name:  "Fetch 2 of 2",
			seeds: project.List{p1, p2},
			args: args{
				ids:      []id.ProjectID{pid1, pid2},
				operator: op,
			},
			want:    project.List{p1, p2},
			wantErr: nil,
		},
		{
			name:  "Fetch 1 of 0",
			seeds: project.List{},
			args: args{
				ids:      []id.ProjectID{pid1},
				operator: op,
			},
			want:    nil,
			wantErr: nil,
		},
		{
			name:  "Fetch 2 of 0",
			seeds: project.List{},
			args: args{
				ids:      []id.ProjectID{pid1, pid2},
				operator: op,
			},
			want:    nil,
			wantErr: nil,
		},
		{
			name:  "Fetch 1 with out operator",
			seeds: project.List{p1, p2},
			args: args{
				ids:      []id.ProjectID{pid1},
				operator: &usecase.Operator{User: u.ID()},
			},
			want:    nil,
			wantErr: interfaces.ErrOperationDenied,
		},
		{
			name:           "mock error",
			wantErr:        errors.New("test"),
			mockProjectErr: true,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			ctx := context.Background()
			db := memory.New()
			if tc.mockProjectErr {
				memory.SetProjectError(db.Project, tc.wantErr)
			}
			defer memory.MockNow(db, mocktime)()
			for _, p := range tc.seeds {
				err := db.Project.Save(ctx, p.Clone())
				assert.Nil(t, err)
			}
			projectUC := NewProject(db)

			got, err := projectUC.Fetch(ctx, tc.args.ids, tc.args.operator)
			if tc.wantErr != nil {
				assert.Equal(t, tc.wantErr, err)
				return
			}
			assert.NoError(t, err)
			assert.Equal(t, tc.want, got)
		})
	}
}

func TestProject_Create(t *testing.T) {
	mocktime := time.Now()
	wid := id.NewWorkspaceID()
	u := user.New().NewID().Email("aaa@bbb.com").Workspace(wid).MustBuild()
	op := &usecase.Operator{
		User:               u.ID(),
		ReadableWorkspaces: nil,
		WritableWorkspaces: nil,
		OwningWorkspaces:   []id.WorkspaceID{wid},
	}

	type args struct {
		cpp      interfaces.CreateProjectParam
		operator *usecase.Operator
	}
	tests := []struct {
		name    string
		seeds   project.List
		args    args
		want    *project.Project
		wantErr error
	}{
		{
			name:  "Create",
			seeds: nil,
			args: args{
				cpp: interfaces.CreateProjectParam{
					WorkspaceID: wid,
					Name:        lo.ToPtr("P001"),
					Description: lo.ToPtr("D001"),
					Alias:       lo.ToPtr("Test001"),
				},
				operator: op,
			},
			want: project.New().
				NewID().
				Name("P001").
				Alias("Test001").
				Description("D001").
				Workspace(wid).
				MustBuild(),
			wantErr: nil,
		},
		{
			name:  "Create Operation Denied",
			seeds: nil,
			args: args{
				cpp: interfaces.CreateProjectParam{
					WorkspaceID: wid,
					Name:        lo.ToPtr("P002"),
					Description: lo.ToPtr("D002"),
					Alias:       lo.ToPtr("Test002"),
				},
				operator: &usecase.Operator{User: u.ID()},
			},
			want:    nil,
			wantErr: interfaces.ErrOperationDenied,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			ctx := context.Background()
			db := memory.New()
			defer memory.MockNow(db, mocktime)()
			for _, p := range tc.seeds {
				err := db.Project.Save(ctx, p.Clone())
				assert.Nil(t, err)
			}
			projectUC := NewProject(db)

			got, err := projectUC.Create(ctx, tc.args.cpp, tc.args.operator)
			if tc.wantErr != nil {
				assert.Equal(t, tc.wantErr, err)
				return
			}
			assert.NoError(t, err)
			assert.Equal(t, tc.want.Name(), got.Name())
			assert.Equal(t, tc.want.Alias(), got.Alias())
			assert.Equal(t, tc.want.Description(), got.Description())
			assert.Equal(t, tc.want.Workspace(), got.Workspace())

			dbGot, err := db.Project.FindByID(ctx, got.ID())
			assert.Nil(t, err)
			assert.Equal(t, tc.want.Name(), dbGot.Name())
			assert.Equal(t, tc.want.Alias(), dbGot.Alias())
			assert.Equal(t, tc.want.Description(), dbGot.Description())
			assert.Equal(t, tc.want.Workspace(), dbGot.Workspace())

		})
	}
}

func TestProject_Update(t *testing.T) {
	mocktime := time.Now()
	wid1 := id.NewWorkspaceID()
	wid2 := id.NewWorkspaceID()

	pid1 := id.NewProjectID()
	p1 := project.New().ID(pid1).Workspace(wid1).UpdatedAt(mocktime.Add(-time.Second)).MustBuild()
	p1Updated := project.New().ID(pid1).Workspace(wid1).Name("test123").Description("desc321").
		UpdatedAt(mocktime).MustBuild()

	pid2 := id.NewProjectID()
	p2 := project.New().ID(pid2).Workspace(wid2).UpdatedAt(mocktime).MustBuild()

	u := user.New().NewID().Email("aaa@bbb.com").Workspace(wid1).MustBuild()
	op := &usecase.Operator{
		User:               u.ID(),
		ReadableWorkspaces: []id.WorkspaceID{wid1, wid2},
		WritableWorkspaces: []id.WorkspaceID{wid1},
	}

	type args struct {
		upp      interfaces.UpdateProjectParam
		operator *usecase.Operator
	}
	tests := []struct {
		name           string
		seeds          project.List
		args           args
		want           *project.Project
		mockProjectErr bool
		wantErr        error
	}{
		{
			name:  "update",
			seeds: project.List{p1, p2},
			args: args{
				upp: interfaces.UpdateProjectParam{
					ID:          p1.ID(),
					Name:        lo.ToPtr("test123"),
					Description: lo.ToPtr("desc321"),
				},
				operator: op,
			},
			want:    p1Updated,
			wantErr: nil,
		},
		{
			name:  "update od",
			seeds: project.List{p1, p2},
			args: args{
				upp: interfaces.UpdateProjectParam{
					ID:          p2.ID(),
					Name:        lo.ToPtr("test123"),
					Description: lo.ToPtr("desc321"),
				},
				operator: op,
			},
			want:    nil,
			wantErr: interfaces.ErrOperationDenied,
		},
		{
			name:           "mock error",
			wantErr:        errors.New("test"),
			mockProjectErr: true,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			ctx := context.Background()
			db := memory.New()
			if tc.mockProjectErr {
				memory.SetProjectError(db.Project, tc.wantErr)
			}
			defer memory.MockNow(db, mocktime)()
			for _, p := range tc.seeds {
				err := db.Project.Save(ctx, p.Clone())
				assert.Nil(t, err)
			}
			projectUC := NewProject(db)

			got, err := projectUC.Update(ctx, tc.args.upp, tc.args.operator)
			if tc.wantErr != nil {
				assert.Equal(t, tc.wantErr, err)
				return
			}
			assert.NoError(t, err)
			assert.Equal(t, tc.want, got)
		})
	}
}

func TestProject_CheckAlias(t *testing.T) {
	mocktime := time.Now()
	wid1 := id.NewWorkspaceID()
	wid2 := id.NewWorkspaceID()

	pid1 := id.NewProjectID()
	p1 := project.New().ID(pid1).Workspace(wid1).Alias("test123").UpdatedAt(mocktime).MustBuild()

	pid2 := id.NewProjectID()
	p2 := project.New().ID(pid2).Workspace(wid2).MustBuild()

	u := user.New().NewID().Email("aaa@bbb.com").Workspace(wid1).MustBuild()
	op := &usecase.Operator{
		User:               u.ID(),
		ReadableWorkspaces: []id.WorkspaceID{wid1, wid2},
	}

	type args struct {
		alias    string
		operator *usecase.Operator
	}
	tests := []struct {
		name    string
		seeds   project.List
		args    args
		want    bool
		wantErr error
	}{
		{
			name:  "Check found",
			seeds: project.List{p1, p2},
			args: args{
				alias:    "test123",
				operator: op,
			},
			want:    false,
			wantErr: nil,
		},
		{
			name:  "Check not found",
			seeds: project.List{p1, p2},
			args: args{
				alias:    "321test",
				operator: op,
			},
			want:    true,
			wantErr: nil,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			ctx := context.Background()
			db := memory.New()
			defer memory.MockNow(db, mocktime)()
			for _, p := range tc.seeds {
				err := db.Project.Save(ctx, p.Clone())
				assert.Nil(t, err)
			}
			projectUC := NewProject(db)

			got, err := projectUC.CheckAlias(ctx, tc.args.alias)
			if tc.wantErr != nil {
				assert.Equal(t, tc.wantErr, err)
				return
			}
			assert.NoError(t, err)
			assert.Equal(t, tc.want, got)
		})
	}
}

func TestProject_Delete(t *testing.T) {
	mocktime := time.Now()
	wid1 := id.NewWorkspaceID()
	wid2 := id.NewWorkspaceID()

	pid1 := id.NewProjectID()
	p1 := project.New().ID(pid1).Workspace(wid1).UpdatedAt(mocktime).MustBuild()

	pid2 := id.NewProjectID()
	p2 := project.New().ID(pid2).Workspace(wid2).UpdatedAt(mocktime).MustBuild()

	u := user.New().NewID().Email("aaa@bbb.com").Workspace(wid1).MustBuild()
	op := &usecase.Operator{
		User:               u.ID(),
		ReadableWorkspaces: []id.WorkspaceID{wid1, wid2},
		WritableWorkspaces: []id.WorkspaceID{wid1},
	}

	type args struct {
		id       id.ProjectID
		operator *usecase.Operator
	}
	tests := []struct {
		name           string
		seeds          project.List
		args           args
		want           project.List
		mockProjectErr bool
		wantErr        error
	}{
		{
			name:  "delete",
			seeds: project.List{p1, p2},
			args: args{
				id:       pid1,
				operator: op,
			},
			want:    nil,
			wantErr: nil,
		},
		{
			name:  "delete not found",
			seeds: project.List{p1, p2},
			args: args{
				id:       id.NewProjectID(),
				operator: op,
			},
			want:    nil,
			wantErr: rerror.ErrNotFound,
		},
		{
			name:  "delete od",
			seeds: project.List{},
			args: args{
				id:       pid2,
				operator: op,
			},
			want:    nil,
			wantErr: rerror.ErrNotFound,
		},
		{
			name:           "mock error",
			wantErr:        errors.New("test"),
			mockProjectErr: true,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			ctx := context.Background()
			db := memory.New()
			if tc.mockProjectErr {
				memory.SetProjectError(db.Project, tc.wantErr)
			}
			defer memory.MockNow(db, mocktime)()
			for _, p := range tc.seeds {
				err := db.Project.Save(ctx, p.Clone())
				assert.Nil(t, err)
			}
			projectUC := NewProject(db)

			err := projectUC.Delete(ctx, tc.args.id, tc.args.operator)
			if tc.wantErr != nil {
				assert.Equal(t, tc.wantErr, err)
				return
			}
			assert.NoError(t, err)

			_, err = db.Project.FindByID(ctx, tc.args.id)
			assert.Equal(t, rerror.ErrNotFound, err)
		})
	}
}
