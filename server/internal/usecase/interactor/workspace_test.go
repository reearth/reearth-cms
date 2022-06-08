package interactor

import (
	"context"
	"testing"

	"github.com/reearth/reearth-cms/server/internal/infrastructure/memory"
	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/user"
	"github.com/stretchr/testify/assert"
)

func TestWorkspace_Create(t *testing.T) {
	ctx := context.Background()

	db := memory.New()

	u := user.New().NewID().Email("aaa@bbb.com").Workspace(id.NewWorkspaceID()).MustBuild()
	workspaceUC := NewWorkspace(db)
	op := &usecase.Operator{User: u.ID()}
	workspace, err := workspaceUC.Create(ctx, "workspace name", u.ID(), op)

	assert.Nil(t, err)
	assert.NotNil(t, workspace)

	resultWorkspaces, _ := workspaceUC.Fetch(ctx, []id.WorkspaceID{workspace.ID()}, &usecase.Operator{
		ReadableWorkspaces: []id.WorkspaceID{workspace.ID()},
	})

	assert.NotNil(t, resultWorkspaces)
	assert.NotEmpty(t, resultWorkspaces)
	assert.Equal(t, resultWorkspaces[0].ID(), workspace.ID())
	assert.Equal(t, resultWorkspaces[0].Name(), "workspace name")
	assert.Equal(t, user.WorkspaceIDList{resultWorkspaces[0].ID()}, op.OwningWorkspaces)
}

func TestWorkspace_Fetch(t *testing.T) {
	id1 := id.NewWorkspaceID()
	w1 := user.NewWorkspace().ID(id1).MustBuild()
	id2 := id.NewWorkspaceID()
	w2 := user.NewWorkspace().ID(id2).MustBuild()

	u := user.New().NewID().Email("aaa@bbb.com").Workspace(id1).MustBuild()
	op := &usecase.Operator{
		User:               u.ID(),
		ReadableWorkspaces: []id.WorkspaceID{id1, id2},
	}

	tests := []struct {
		name  string
		seeds []*user.Workspace
		args  struct {
			ids      []id.WorkspaceID
			operator *usecase.Operator
		}
		want    []*user.Workspace
		wantErr assert.ErrorAssertionFunc
	}{
		{
			name:  "Fetch 1 of 2",
			seeds: []*user.Workspace{w1, w2},
			args: struct {
				ids      []id.WorkspaceID
				operator *usecase.Operator
			}{
				ids:      []id.WorkspaceID{id1},
				operator: op,
			},
			want:    []*user.Workspace{w1},
			wantErr: assert.NoError,
		},
		{
			name:  "Fetch 2 of 2",
			seeds: []*user.Workspace{w1, w2},
			args: struct {
				ids      []id.WorkspaceID
				operator *usecase.Operator
			}{
				ids:      []id.WorkspaceID{id1, id2},
				operator: op,
			},
			want:    []*user.Workspace{w1, w2},
			wantErr: assert.NoError,
		},
		{
			name:  "Fetch 1 of 0",
			seeds: []*user.Workspace{},
			args: struct {
				ids      []id.WorkspaceID
				operator *usecase.Operator
			}{
				ids:      []id.WorkspaceID{id1},
				operator: op,
			},
			want:    nil,
			wantErr: assert.NoError,
		},
		{
			name:  "Fetch 2 of 0",
			seeds: []*user.Workspace{},
			args: struct {
				ids      []id.WorkspaceID
				operator *usecase.Operator
			}{
				ids:      []id.WorkspaceID{id1, id2},
				operator: op,
			},
			want:    nil,
			wantErr: assert.NoError,
		},
	}
	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			ctx := context.Background()
			db := memory.New()
			for _, p := range tc.seeds {
				err := db.Workspace.Save(ctx, p)
				assert.Nil(t, err)
			}
			workspaceUC := NewWorkspace(db)

			got, err := workspaceUC.Fetch(ctx, tc.args.ids, tc.args.operator)
			if !tc.wantErr(t, err) {
				return
			}
			assert.Equal(t, tc.want, got)
		})
	}
}

func TestWorkspace_FindByUser(t *testing.T) {
	userID := id.NewUserID()
	id1 := id.NewWorkspaceID()
	w1 := user.NewWorkspace().ID(id1).Members(map[user.ID]user.Role{userID: user.RoleReader}).MustBuild()
	id2 := id.NewWorkspaceID()
	w2 := user.NewWorkspace().ID(id2).MustBuild()

	u := user.New().NewID().Email("aaa@bbb.com").Workspace(id1).MustBuild()
	op := &usecase.Operator{
		User:               u.ID(),
		ReadableWorkspaces: []id.WorkspaceID{id1, id2},
	}

	tests := []struct {
		name  string
		seeds []*user.Workspace
		args  struct {
			userID   id.UserID
			operator *usecase.Operator
		}
		want    []*user.Workspace
		wantErr assert.ErrorAssertionFunc
	}{
		{
			name:  "Fetch 1 of 2",
			seeds: []*user.Workspace{w1, w2},
			args: struct {
				userID   id.UserID
				operator *usecase.Operator
			}{
				userID:   userID,
				operator: op,
			},
			want:    []*user.Workspace{w1},
			wantErr: assert.NoError,
		},
		{
			name:  "Fetch 1 of 0",
			seeds: []*user.Workspace{},
			args: struct {
				userID   id.UserID
				operator *usecase.Operator
			}{
				userID:   userID,
				operator: op,
			},
			want:    nil,
			wantErr: assert.Error,
		},
		{
			name:  "Fetch 0 of 1",
			seeds: []*user.Workspace{w2},
			args: struct {
				userID   id.UserID
				operator *usecase.Operator
			}{
				userID:   userID,
				operator: op,
			},
			want:    nil,
			wantErr: assert.Error,
		},
	}
	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			ctx := context.Background()
			db := memory.New()
			for _, p := range tc.seeds {
				err := db.Workspace.Save(ctx, p)
				assert.Nil(t, err)
			}
			workspaceUC := NewWorkspace(db)

			got, err := workspaceUC.FindByUser(ctx, tc.args.userID, tc.args.operator)
			if !tc.wantErr(t, err) {
				return
			}
			assert.Equal(t, tc.want, got)
		})
	}
}

func TestWorkspace_Update(t *testing.T) {
	userID := id.NewUserID()
	id1 := id.NewWorkspaceID()
	w1 := user.NewWorkspace().ID(id1).Name("W1").Members(map[user.ID]user.Role{userID: user.RoleOwner}).Personal(false).MustBuild()
	w1Updated := user.NewWorkspace().ID(id1).Name("WW1").Members(map[user.ID]user.Role{userID: user.RoleOwner}).MustBuild()
	id2 := id.NewWorkspaceID()
	w2 := user.NewWorkspace().ID(id2).Name("W2").MustBuild()
	id3 := id.NewWorkspaceID()
	w3 := user.NewWorkspace().ID(id3).Name("W3").Members(map[user.ID]user.Role{userID: user.RoleReader}).MustBuild()

	op := &usecase.Operator{
		User:               userID,
		ReadableWorkspaces: []id.WorkspaceID{id1, id2, id3},
		OwningWorkspaces:   []id.WorkspaceID{id1},
	}

	tests := []struct {
		name  string
		seeds []*user.Workspace
		args  struct {
			wId      id.WorkspaceID
			newName  string
			operator *usecase.Operator
		}
		want    *user.Workspace
		wantErr assert.ErrorAssertionFunc
	}{
		{
			name:  "Update 1",
			seeds: []*user.Workspace{w1, w2},
			args: struct {
				wId      id.WorkspaceID
				newName  string
				operator *usecase.Operator
			}{
				wId:      id1,
				newName:  "WW1",
				operator: op,
			},
			want:    w1Updated,
			wantErr: assert.NoError,
		},
		{
			name:  "Update 2",
			seeds: []*user.Workspace{},
			args: struct {
				wId      id.WorkspaceID
				newName  string
				operator *usecase.Operator
			}{
				wId:      id2,
				newName:  "WW2",
				operator: op,
			},
			want:    nil,
			wantErr: assert.Error,
		},
		{
			name:  "Update 3",
			seeds: []*user.Workspace{w3},
			args: struct {
				wId      id.WorkspaceID
				newName  string
				operator *usecase.Operator
			}{
				wId:      id3,
				newName:  "WW3",
				operator: op,
			},
			want:    nil,
			wantErr: assert.Error,
		},
	}
	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			ctx := context.Background()
			db := memory.New()
			for _, p := range tc.seeds {
				err := db.Workspace.Save(ctx, p)
				assert.Nil(t, err)
			}
			workspaceUC := NewWorkspace(db)

			got, err := workspaceUC.Update(ctx, tc.args.wId, tc.args.newName, tc.args.operator)
			if !tc.wantErr(t, err) || err != nil {
				return
			}
			assert.Equal(t, tc.want, got)
			got2, err := db.Workspace.FindByID(ctx, tc.args.wId)
			assert.NoError(t, err)
			assert.Equal(t, tc.want, got2)
		})
	}
}

func TestWorkspace_Remove(t *testing.T) {
	userID := id.NewUserID()
	id1 := id.NewWorkspaceID()
	w1 := user.NewWorkspace().ID(id1).Name("W1").Members(map[user.ID]user.Role{userID: user.RoleOwner}).Personal(false).MustBuild()
	id2 := id.NewWorkspaceID()
	w2 := user.NewWorkspace().ID(id2).Name("W2").MustBuild()
	id3 := id.NewWorkspaceID()
	w3 := user.NewWorkspace().ID(id3).Name("W3").Members(map[user.ID]user.Role{userID: user.RoleReader}).MustBuild()
	id4 := id.NewWorkspaceID()
	w4 := user.NewWorkspace().ID(id4).Name("W4").Members(map[user.ID]user.Role{userID: user.RoleOwner}).Personal(true).MustBuild()

	op := &usecase.Operator{
		User:               userID,
		ReadableWorkspaces: []id.WorkspaceID{id1, id2, id3},
		OwningWorkspaces:   []id.WorkspaceID{id1},
	}

	tests := []struct {
		name  string
		seeds []*user.Workspace
		args  struct {
			wId      id.WorkspaceID
			operator *usecase.Operator
		}
		wantErr assert.ErrorAssertionFunc
		want    *user.Workspace
	}{
		{
			name:  "Remove 1",
			seeds: []*user.Workspace{w1, w2},
			args: struct {
				wId      id.WorkspaceID
				operator *usecase.Operator
			}{
				wId:      id1,
				operator: op,
			},
			wantErr: assert.NoError,
			want:    nil,
		},
		{
			name:  "Update 2",
			seeds: []*user.Workspace{w1, w2},
			args: struct {
				wId      id.WorkspaceID
				operator *usecase.Operator
			}{
				wId:      id2,
				operator: op,
			},
			wantErr: assert.Error,
			want:    w2,
		},
		{
			name:  "Update 3",
			seeds: []*user.Workspace{w3},
			args: struct {
				wId      id.WorkspaceID
				operator *usecase.Operator
			}{
				wId:      id3,
				operator: op,
			},
			wantErr: assert.Error,
			want:    w3,
		},
		{
			name:  "Remove 4",
			seeds: []*user.Workspace{w4},
			args: struct {
				wId      id.WorkspaceID
				operator *usecase.Operator
			}{
				wId:      id4,
				operator: op,
			},
			wantErr: assert.Error,
			want:    w4,
		},
	}
	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			ctx := context.Background()
			db := memory.New()
			for _, p := range tc.seeds {
				err := db.Workspace.Save(ctx, p)
				assert.Nil(t, err)
			}
			workspaceUC := NewWorkspace(db)

			err := workspaceUC.Remove(ctx, tc.args.wId, tc.args.operator)
			if !tc.wantErr(t, err) {
				return
			}

			got, err := db.Workspace.FindByID(ctx, tc.args.wId)
			if tc.want == nil {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
			}
			assert.Equal(t, tc.want, got)
		})
	}
}
